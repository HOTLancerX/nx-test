//app/api/post/[id]/route.ts
import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"
import { requireAdminAuth } from "@/lib/auth"
import { NxPostInput } from "@/schema/nx_posts"
import { ObjectId } from "mongodb"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    await requireAdminAuth()
    
    const { db } = await connectToDatabase()
    const post = await db.collection("nx_posts").findOne({ 
      _id: new ObjectId(params.id) 
    })

    if (!post) {
      return NextResponse.json(
        { message: "Post not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      ...post,
      _id: post._id.toString(),
      taxonomy: post.taxonomy?.map((tax: { term_id: { toString: () => any } }) => ({
        ...tax,
        term_id: tax.term_id.toString()
      })) || []
    })
  } catch (error) {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
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

    // Generate new slug if title changed
    const existingPost = await db.collection("nx_posts").findOne({ 
      _id: new ObjectId(params.id) 
    })
    
    let slug = existingPost?.slug
    if (existingPost?.title !== postData.title) {
      slug = postData.title
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
      
      // Check if new slug exists for another post
      const slugExists = await db.collection("nx_posts").findOne({ 
        slug, 
        _id: { $ne: new ObjectId(params.id) }
      })
      if (slugExists) {
        return NextResponse.json(
          { message: "A post with this title already exists" },
          { status: 400 }
        )
      }
    }

    const updateData = {
      ...postData,
      slug,
      modified: new Date(),
      taxonomy: postData.taxonomy?.map(tax => ({
        term_id: new ObjectId(tax.term_id),
        taxonomy: tax.taxonomy
      })) || []
    }

    await db.collection("nx_posts").updateOne(
      { _id: new ObjectId(params.id) },
      { $set: updateData }
    )

    return NextResponse.json({
      message: "Post updated successfully",
    })
  } catch (error) {
    console.error("Error updating post:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    await requireAdminAuth()
    
    const { db } = await connectToDatabase()

    await db.collection("nx_posts").deleteOne({ 
      _id: new ObjectId(params.id) 
    })
    await db.collection("nx_posts_meta").deleteMany({ 
      nx_posts: new ObjectId(params.id) 
    })

    return NextResponse.json({
      message: "Post deleted successfully",
    })
  } catch (error) {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}