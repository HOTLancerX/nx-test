import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"
import { ObjectId } from "mongodb"

interface NxPost {
  _id: ObjectId
  title: string
  slug: string
  content: string
  images?: string
  date: Date
  user_id: ObjectId
  status: "publish"
  type: "post"
}

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
  const match = url.match(/\/canva\/([^/?]+)/)
  return match ? match[1] : null
}

export async function GET(req: NextRequest) {
  try {
    const postId = getIdFromUrl(req.url)
    if (!postId || !ObjectId.isValid(postId)) {
      return NextResponse.json({ message: "Invalid post ID" }, { status: 400 })
    }

    const { db } = await connectToDatabase()

    const post = await db
      .collection<NxPost>("nx_posts")
      .findOne({ _id: new ObjectId(postId), type: "post", status: "publish" })

    if (!post) {
      return NextResponse.json({ message: "Post not found" }, { status: 404 })
    }

    // Fetch user details for the post's author
    const user = await db.collection<NxUser>("nx_users").findOne({ _id: post.user_id })
    const userMeta = await db.collection<NxUserMeta>("nx_users_meta").find({ nx_users: post.user_id }).toArray()
    const userImagesMeta = userMeta.find((meta) => meta.title === "images")

    return NextResponse.json({
      _id: post._id.toString(),
      title: post.title,
      slug: post.slug,
      content: post.content,
      images: post.images || "",
      date: new Date(post.date).toISOString().split("T")[0],
      userName: user?.username || "Unknown",
      userImage: userImagesMeta?.content || "/placeholder.svg?height=50&width=50",
    })
  } catch (error) {
    console.error("Error fetching single post for Canva:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
