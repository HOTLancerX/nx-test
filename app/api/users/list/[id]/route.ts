import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"
import { ObjectId } from "mongodb"

function getIdOrSlugFromUrl(url: string): string | null {
  const match = url.match(/\/list\/([^/?]+)/)
  return match ? match[1] : null
}

export async function GET(request: Request) {
  try {
    const idOrSlug = getIdOrSlugFromUrl(request.url)
    if (!idOrSlug) {
      return NextResponse.json({ message: "Missing user ID or slug" }, { status: 400 })
    }

    const { searchParams } = new URL(request.url)
    const page = Number(searchParams.get("page") || 1)
    const limit = 10 // 10 posts per page as requested
    const skip = (page - 1) * limit

    const { db } = await connectToDatabase()

    const userQuery: any = {}
    if (ObjectId.isValid(idOrSlug)) {
      userQuery._id = new ObjectId(idOrSlug)
    } else {
      userQuery.slug = idOrSlug
    }

    // Fetch user and their meta data
    const userResult = await db
      .collection("nx_users")
      .aggregate([
        { $match: userQuery },
        {
          $lookup: {
            from: "nx_users_meta",
            localField: "_id",
            foreignField: "nx_users",
            as: "meta",
          },
        },
        {
          $addFields: {
            metaData: {
              $arrayToObject: {
                $map: {
                  input: "$meta",
                  as: "item",
                  in: { k: "$$item.title", v: "$$item.content" },
                },
              },
            },
          },
        },
        {
          $project: {
            password: 0, // Exclude password
            meta: 0, // Exclude raw meta array
          },
        },
      ])
      .toArray()

    const user = userResult[0]

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    // Fetch posts by this user
    const posts = await db
      .collection("nx_posts")
      .find({
        user_id: user._id,
        type: "post", // Assuming only 'post' type posts are shown for users
        status: "publish", // Only published posts
      })
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit)
      .toArray()

    const totalPosts = await db.collection("nx_posts").countDocuments({
      user_id: user._id,
      type: "post",
      status: "publish",
    })
    const totalPages = Math.ceil(totalPosts / limit)

    return NextResponse.json({
      user: {
        ...user,
        _id: user._id.toString(),
        ...user.metaData,
        metaData: undefined, // Remove the intermediate metaData field
      },
      posts: posts.map((post) => ({
        ...post,
        _id: post._id.toString(),
      })),
      totalPages,
      currentPage: page,
      totalPosts,
    })
  } catch (error) {
    console.error("Error fetching user and posts:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
