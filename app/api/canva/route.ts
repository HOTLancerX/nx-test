import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"
import type { ObjectId } from "mongodb"

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

export async function GET(request: Request) {
  try {
    const { db } = await connectToDatabase()

    // Fetch all published posts for the dropdown, sorted by date
    const allPosts = await db
      .collection<NxPost>("nx_posts")
      .find({ type: "post", status: "publish" })
      .sort({ date: -1 })
      .project({ _id: 1, title: 1, slug: 1 }) // Only fetch necessary fields
      .toArray()

    // Fetch the latest published post with full details
    const latestPost = await db
      .collection<NxPost>("nx_posts")
      .findOne({ type: "post", status: "publish" }, { sort: { date: -1 } })

    let latestPostData = null
    if (latestPost) {
      // Fetch user details for the latest post's author
      const user = await db.collection<NxUser>("nx_users").findOne({ _id: latestPost.user_id })
      const userMeta = await db.collection<NxUserMeta>("nx_users_meta").find({ nx_users: latestPost.user_id }).toArray()
      const userImagesMeta = userMeta.find((meta) => meta.title === "images")

      latestPostData = {
        _id: latestPost._id.toString(),
        title: latestPost.title,
        slug: latestPost.slug,
        content: latestPost.content,
        images: latestPost.images || "",
        date: new Date(latestPost.date).toISOString().split("T")[0], // Format date as YYYY-MM-DD
        userName: user?.username || "Unknown",
        userImage: userImagesMeta?.content || "/placeholder.svg?height=50&width=50",
      }
    }

    return NextResponse.json({
      posts: allPosts.map((post) => ({
        _id: post._id.toString(),
        title: post.title,
        slug: post.slug,
      })),
      latestPost: latestPostData,
    })
  } catch (error) {
    console.error("Error fetching posts for Canva:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
