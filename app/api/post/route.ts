//app/api/post/route.ts
import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"
import { requireAdminAuth } from "@/lib/auth"
import { NxPostInput } from "@/schema/nx_posts"
import { ObjectId } from "mongodb"

export async function GET(request: Request) {
  try {
    await requireAdminAuth()
    
    const { searchParams } = new URL(request.url)
    const page = Number(searchParams.get("page") || 1)
    const limit = Number(searchParams.get("limit") || 10)
    const type = searchParams.get("type") || "post"
    const categoryId = searchParams.get("category")
    const skip = (page - 1) * limit

    const { db } = await connectToDatabase()

    const filter: any = { type }
    if (categoryId) {
      filter["taxonomy.term_id"] = new ObjectId(categoryId)
    }

    const posts = await db.collection("nx_posts")
      .find(filter)
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit)
      .toArray()

    const totalPosts = await db.collection("nx_posts").countDocuments(filter)
    const totalPages = Math.ceil(totalPosts / limit)

    return NextResponse.json({
      posts: posts.map(post => ({
        ...post,
        _id: post._id.toString(),
      })),
      totalPages,
      currentPage: page,
      totalPosts,
    })
  } catch (error) {
    return NextResponse.json(
      { message: "Unauthorized" },
      { status: 401 }
    )
  }
}


// Add this to complete the POST route
export async function POST(request: Request) {
  try {
    await requireAdminAuth()
    
    const postData: NxPostInput = await request.json()
    
    if (!postData.title) {
      return NextResponse.json(
        { message: "Title is required" },
        { status: 400 }
      )
    }

    const { db } = await connectToDatabase()

    // Create slug from title
    const slug = postData.title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    // Check if slug exists
    const existingPost = await db.collection("nx_posts").findOne({ slug })
    if (existingPost) {
      return NextResponse.json(
        { message: "A post with this title already exists" },
        { status: 400 }
      )
    }

    const newPost = {
      ...postData,
      user_id: new ObjectId(), // Replace with actual user ID from session
      date: new Date(),
      modified: new Date(),
      slug,
      images: postData.images || "",
      gallery: postData.gallery || [],
      taxonomy: postData.taxonomy?.map(tax => ({
        term_id: new ObjectId(tax.term_id),
        taxonomy: tax.taxonomy
      })) || []
    }

    const result = await db.collection("nx_posts").insertOne(newPost)

    return NextResponse.json({
      message: "Post created successfully",
      postId: result.insertedId.toString(),
    })
  } catch (error) {
    console.error("Error creating post:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}