//app/api/post/[id]/route.ts

import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"
import { requireAdminAuth } from "@/lib/auth"
import type { NxPostInput } from "@/schema/nx_posts"
import { ObjectId } from "mongodb"

// Extract the ID from the request URL
function getIdFromUrl(url: string): string | null {
  const match = url.match(/\/post\/([^/?]+)/)
  return match ? match[1] : null
}

export async function GET(req: NextRequest) {
  try {
    await requireAdminAuth()

    const id = getIdFromUrl(req.url)
    if (!id) return NextResponse.json({ message: "Missing ID" }, { status: 400 })

    const { db } = await connectToDatabase()
    const post = await db.collection("nx_posts").findOne({ _id: new ObjectId(id) })

    if (!post) {
      return NextResponse.json({ message: "Post not found" }, { status: 404 })
    }

    return NextResponse.json({
      ...post,
      _id: post._id.toString(),
      user_id: post.user_id.toString(), // Ensure user_id is string for client
      taxonomy:
        post.taxonomy?.map((tax: { term_id: { toString: () => any } }) => ({
          ...tax,
          term_id: tax.term_id.toString(),
        })) || [],
    })
  } catch (error) {
    console.error("Error fetching post:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    await requireAdminAuth()

    const id = getIdFromUrl(req.url)
    if (!id) return NextResponse.json({ message: "Missing ID" }, { status: 400 })

    const postData: NxPostInput = await req.json()
    if (!postData.title) {
      return NextResponse.json({ message: "Title is required" }, { status: 400 })
    }

    const { db } = await connectToDatabase()

    const existingPost = await db.collection("nx_posts").findOne({ _id: new ObjectId(id) })
    if (!existingPost) {
      return NextResponse.json({ message: "Post not found" }, { status: 404 })
    }

    let slugToUse = existingPost.slug // Default to existing slug

    if (postData.slug) {
      // If a slug is provided in the update data
      slugToUse = postData.slug
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")
    } else if (existingPost.title !== postData.title) {
      // If title changed and no slug provided, regenerate
      slugToUse = postData.title
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")
    }

    // Check for slug uniqueness if the slug has changed
    if (slugToUse !== existingPost.slug) {
      const slugExists = await db.collection("nx_posts").findOne({
        slug: slugToUse,
        _id: { $ne: new ObjectId(id) },
      })
      if (slugExists) {
        return NextResponse.json({ message: "A post/page with this slug already exists" }, { status: 400 })
      }
    }

    const updateData = {
      ...postData,
      slug: slugToUse, // Use the determined slug
      modified: new Date(),
      taxonomy:
        postData.taxonomy?.map((tax) => ({
          term_id: new ObjectId(tax.term_id),
          taxonomy: tax.taxonomy,
        })) || [],
    }

    await db.collection("nx_posts").updateOne({ _id: new ObjectId(id) }, { $set: updateData })

    return NextResponse.json({ message: "Post updated successfully" })
  } catch (error) {
    console.error("Error updating post:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await requireAdminAuth()

    const id = getIdFromUrl(req.url)
    if (!id) return NextResponse.json({ message: "Missing ID" }, { status: 400 })

    const { db } = await connectToDatabase()

    await db.collection("nx_posts").deleteOne({ _id: new ObjectId(id) })
    await db.collection("nx_posts_meta").deleteMany({ nx_posts: new ObjectId(id) })

    return NextResponse.json({ message: "Post deleted successfully" })
  } catch (error) {
    console.error("Error deleting post:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
