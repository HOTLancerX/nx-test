import { NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"
import { requireAdminAuth } from "@/lib/auth"
import { ObjectId } from "mongodb"

function getIdFromUrl(url: string): string | null {
  const match = url.match(/\/category\/([^\/\?]+)/)
  return match ? match[1] : null
}

export async function GET(req: NextRequest) {
  try {
    await requireAdminAuth()
    const id = getIdFromUrl(req.url)
    if (!id) return NextResponse.json({ message: "Missing ID" }, { status: 400 })

    const { db } = await connectToDatabase()
    const category = await db.collection("nx_terms").findOne({ _id: new ObjectId(id) })

    if (!category) {
      return NextResponse.json({ message: "Category not found" }, { status: 404 })
    }

    return NextResponse.json({
      ...category,
      _id: category._id.toString(),
      parent_id: category.parent_id?.toString() || null
    })
  } catch (error) {
    console.error("Category GET error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    await requireAdminAuth()
    const id = getIdFromUrl(req.url)
    if (!id) return NextResponse.json({ message: "Missing ID" }, { status: 400 })

    const { db } = await connectToDatabase()
    const categoryData = await req.json()

    const existingCategory = await db.collection("nx_terms").findOne({ _id: new ObjectId(id) })
    if (!existingCategory) {
      return NextResponse.json({ message: "Category not found" }, { status: 404 })
    }

    const slug =
      categoryData.slug ||
      categoryData.title.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-")

    const slugTaken = await db.collection("nx_terms").findOne({
      slug,
      _id: { $ne: new ObjectId(id) }
    })
    if (slugTaken) {
      return NextResponse.json({ message: "A category with this title/slug already exists" }, { status: 400 })
    }

    const updateData = {
      ...categoryData,
      slug,
      images: categoryData.images || "",
      gallery: categoryData.gallery || [],
      content: categoryData.content || "",
      parent_id: categoryData.parent_id ? new ObjectId(categoryData.parent_id) : null,
      updatedAt: new Date()
    }

    await db.collection("nx_terms").updateOne({ _id: new ObjectId(id) }, { $set: updateData })

    return NextResponse.json({
      success: true,
      message: "Category updated successfully"
    })
  } catch (error) {
    console.error("Category PUT error:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await requireAdminAuth()
    const id = getIdFromUrl(req.url)
    if (!id) return NextResponse.json({ message: "Missing ID" }, { status: 400 })

    const { db } = await connectToDatabase()

    const existingCategory = await db.collection("nx_terms").findOne({ _id: new ObjectId(id) })
    if (!existingCategory) {
      return NextResponse.json({ message: "Category not found" }, { status: 404 })
    }

    const hasChildren = await db.collection("nx_terms").countDocuments({
      parent_id: new ObjectId(id)
    })
    if (hasChildren > 0) {
      return NextResponse.json({ message: "Cannot delete category with child categories" }, { status: 400 })
    }

    await db.collection("nx_terms").deleteOne({ _id: new ObjectId(id) })
    await db.collection("nx_terms_meta").deleteMany({ nx_terms: new ObjectId(id) })

    return NextResponse.json({
      success: true,
      message: "Category deleted successfully"
    })
  } catch (error) {
    console.error("Category DELETE error:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}
