import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"
import { requireAdminAuth } from "@/lib/auth"
import { ObjectId } from "mongodb"
import type { NxFeed } from "@/schema/nx_feeds"

export async function GET(request: Request) {
  try {
    await requireAdminAuth()

    const { searchParams } = new URL(request.url)
    const page = Number(searchParams.get("page") || 1)
    const limit = Number(searchParams.get("limit") || 10)
    const skip = (page - 1) * limit

    const { db } = await connectToDatabase()

    const [feeds, totalFeeds] = await Promise.all([
      db.collection("nx_feeds").find({}).sort({ created_at: -1 }).skip(skip).limit(limit).toArray(),
      db.collection("nx_feeds").countDocuments(),
    ])

    const totalPages = Math.ceil(totalFeeds / limit)

    return NextResponse.json({
      feeds: feeds.map((feed) => ({
        ...feed,
        _id: feed._id?.toString?.() || null,
        category_id: feed.category_id?.toString?.() || null,
        user_id: feed.user_id?.toString?.() || null, // Safe check added
      })),
      totalPages,
      currentPage: page,
      totalFeeds,
    })
  } catch (error) {
    console.error("Error in GET /api/feeds:", error) // Log the actual error
    return NextResponse.json(
      { message: "Unauthorized or Internal Server Error" }, // More generic message for security
      { status: 401 }, // Keep 401 if auth fails, otherwise 500
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireAdminAuth() // Get session to potentially use current user's ID

    const { db } = await connectToDatabase()
    const feedData: Omit<NxFeed, "_id" | "created_at" | "updated_at" | "last_fetched"> = await request.json()

    // Validate required fields
    if (!feedData.title || !feedData.url || !feedData.category_id || !feedData.user_id) {
      // user_id is now required
      return NextResponse.json({ message: "Title, URL, category, and user are required" }, { status: 400 })
    }

    // Check if URL already exists
    const existingFeed = await db.collection("nx_feeds").findOne({
      url: feedData.url,
    })

    if (existingFeed) {
      return NextResponse.json({ message: "A feed with this URL already exists" }, { status: 400 })
    }

    const newFeed = {
      ...feedData,
      category_id: new ObjectId(feedData.category_id),
      user_id: new ObjectId(feedData.user_id), // Convert user_id to ObjectId
      active: feedData.active !== false,
      created_at: new Date(),
      updated_at: new Date(),
    }

    const result = await db.collection("nx_feeds").insertOne(newFeed)

    return NextResponse.json({
      success: true,
      message: "Feed created successfully",
      feedId: result.insertedId.toString(),
    })
  } catch (error) {
    console.error("Feed POST error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 },
    )
  }
}
