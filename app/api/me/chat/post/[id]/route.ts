// app/api/me/chat/post/[id]/route.ts
import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"
import { ObjectId } from "mongodb"
import type { NxPost } from "@/schema/nx_posts" // Using the provided schema

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { db } = await connectToDatabase()

    const post = await db.collection<NxPost>("nx_posts").findOne({
      _id: new ObjectId(id),
    })

    if (!post) {
      return NextResponse.json({ message: "Post Not Available" }, { status: 404 })
    }

    // Return only necessary public information for the post preview
    return NextResponse.json({
      title: post.title,
      images: post.images || "/placeholder.svg", // Assuming images is a string or can be defaulted
      slug: post.slug,
    })
  } catch (error) {
    console.error("Error fetching post data for chat:", error)
    return NextResponse.json({ message: "Error fetching post" }, { status: 500 })
  }
}