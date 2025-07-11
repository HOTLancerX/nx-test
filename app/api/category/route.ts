import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"
import { requireAdminAuth } from "@/lib/auth"
import { ObjectId } from "mongodb"

export async function GET(request: Request) {
  try {
    await requireAdminAuth()
    
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type") || "post_category"
    const parent_id = searchParams.get("parent_id")

    const { db } = await connectToDatabase()

    const query: any = { type }
    if (parent_id) {
      query.parent_id = parent_id === "null" ? null : new ObjectId(parent_id)
    }

    const categories = await db.collection("nx_terms")
      .find(query)
      .sort({ title: 1 })
      .toArray()

    return NextResponse.json({
      categories: categories.map(cat => ({
        ...cat,
        _id: cat._id.toString(),
        parent_id: cat.parent_id?.toString() || null
      }))
    })
  } catch (error) {
    return NextResponse.json(
      { message: "Unauthorized" },
      { status: 401 }
    )
  }
}

export async function POST(request: Request) {
  try {
    await requireAdminAuth()
    
    const { db } = await connectToDatabase()
    const categoryData = await request.json()

    // Create slug from title if not provided
    const slug = categoryData.slug || categoryData.title
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-")

    // Check if slug exists
    const existingCategory = await db.collection("nx_terms").findOne({ 
      slug, 
      type: categoryData.type 
    })
    if (existingCategory) {
      return NextResponse.json(
        { message: "A category with this title/slug already exists" },
        { status: 400 }
      )
    }

    const newCategory = {
      ...categoryData,
      slug,
      images: categoryData.images || "",
      gallery: categoryData.gallery || [],
      content: categoryData.content || "",
      parent_id: categoryData.parent_id ? new ObjectId(categoryData.parent_id) : null,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    const result = await db.collection("nx_terms").insertOne(newCategory)

    return NextResponse.json({
      success: true,
      message: "Category created successfully",
      categoryId: result.insertedId.toString()
    })
  } catch (error) {
    console.error("Category POST error:", error)
    return NextResponse.json(
      { 
        success: false,
        message: "Internal server error"
      },
      { status: 500 }
    )
  }
}