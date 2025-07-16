import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"
import { requireAdminAuth } from "@/lib/auth"
import { ObjectId } from "mongodb"
import type { NxFeed } from "@/schema/nx_feeds"

function getIdFromUrl(url: string): string | null {
  const match = url.match(/\/feeds\/([^/?]+)/)
  return match ? match[1] : null
}

export async function GET(req: NextRequest) {
  try {
    await requireAdminAuth()
    const id = getIdFromUrl(req.url)
    if (!id) return NextResponse.json({ message: "Missing ID" }, { status: 400 })

    const { db } = await connectToDatabase()
    const feed = await db.collection("nx_feeds").findOne({ _id: new ObjectId(id) })

    if (!feed) {
      return NextResponse.json({ message: "Feed not found" }, { status: 404 })
    }

    return NextResponse.json({
      ...feed,
      _id: feed._id.toString(),
      category_id: feed.category_id.toString(),
      user_id: feed.user_id.toString(), // Ensure user_id is string
    })
  } catch (error) {
    console.error("Feed GET error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    await requireAdminAuth()
    const id = getIdFromUrl(req.url)
    if (!id) return NextResponse.json({ message: "Missing ID" }, { status: 400 })

    const { db } = await connectToDatabase()
    const feedData: Partial<NxFeed> = await req.json()

    const existingFeed = await db.collection("nx_feeds").findOne({ _id: new ObjectId(id) })
    if (!existingFeed) {
      return NextResponse.json({ message: "Feed not found" }, { status: 404 })
    }

    const updateData: Partial<NxFeed> = {
      ...feedData,
      updated_at: new Date(),
    }

    if (feedData.category_id) {
      updateData.category_id = new ObjectId(feedData.category_id)
    }
    if (feedData.user_id) {
      // Handle user_id update
      updateData.user_id = new ObjectId(feedData.user_id)
    }

    await db.collection("nx_feeds").updateOne({ _id: new ObjectId(id) }, { $set: updateData })

    return NextResponse.json({
      success: true,
      message: "Feed updated successfully",
    })
  } catch (error) {
    console.error("Feed PUT error:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await requireAdminAuth()
    const id = getIdFromUrl(req.url)
    if (!id) return NextResponse.json({ message: "Missing ID" }, { status: 400 })

    const { db } = await connectToDatabase()

    await db.collection("nx_feeds").deleteOne({ _id: new ObjectId(id) })
    await db.collection("nx_feeds_meta").deleteMany({ nx_feeds_id: new ObjectId(id) })

    return NextResponse.json({
      success: true,
      message: "Feed deleted successfully",
    })
  } catch (error) {
    console.error("Feed DELETE error:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}
