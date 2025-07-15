//app/api/users/single/[id]/route.ts
import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"
import { ObjectId } from "mongodb"

interface NxUser {
  _id: ObjectId
  username: string
}

interface NxUserMeta {
  _id: ObjectId
  nx_users: ObjectId
  title: string
  content: string
}

// Helper to extract ID from URL
function getIdFromUrl(url: string): string | null {
  const match = url.match(/\/single\/([^/?]+)/)
  return match ? match[1] : null
}

export async function GET(request: Request) {
  try {
    const userId = getIdFromUrl(request.url)
    if (!userId || !ObjectId.isValid(userId)) {
      return NextResponse.json({ message: "Invalid user ID" }, { status: 400 })
    }

    const { db } = await connectToDatabase()

    const user = await db.collection<NxUser>("nx_users").findOne({ _id: new ObjectId(userId) })

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    const userMeta = await db.collection<NxUserMeta>("nx_users_meta").find({ nx_users: user._id }).toArray()

    const userImagesMeta = userMeta.find((meta) => meta.title === "images")

    return NextResponse.json({
      _id: user._id.toString(),
      username: user.username,
      images: userImagesMeta?.content || "/placeholder.svg?height=50&width=50",
    })
  } catch (error) {
    console.error("Error fetching single user:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
