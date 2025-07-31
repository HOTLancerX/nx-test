// app/api/post/route.ts
import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"
import { requireAdminAuth } from "@/lib/auth"
import type { NxPostInput } from "@/schema/nx_posts"
import type { NxPostMeta } from "@/schema/nx_posts_meta"
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

    const posts = await db
      .collection("nx_posts")
      .find(filter)
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit)
      .toArray()

    const postsWithMeta = await Promise.all(
      posts.map(async (post) => {
        const meta = await db
          .collection<NxPostMeta>("nx_posts_meta")
          .find({ nx_posts: post._id })
          .toArray()

        const metaData = meta.reduce<Record<string, string>>((acc, item) => {
          acc[item.title] = item.content
          return acc
        }, {})

        return {
          ...post,
          _id: post._id.toString(),
          user_id: post.user_id.toString(),
          taxonomy: Array.isArray(post.taxonomy)
            ? post.taxonomy.map((tax: any) => ({
                ...tax,
                term_id: tax.term_id.toString(),
              }))
            : [],
          meta: metaData,
        }
      })
    )

    const totalPosts = await db.collection("nx_posts").countDocuments(filter)
    const totalPages = Math.ceil(totalPosts / limit)

    return NextResponse.json({
      posts: postsWithMeta,
      totalPages,
      currentPage: page,
      totalPosts,
    })
  } catch (error) {
    console.error("Error fetching posts:", error)
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Unauthorized" },
      { status: 401 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireAdminAuth()
    const postData: NxPostInput & { meta?: Record<string, string> } =
      await request.json()

    if (!postData.title) {
      return NextResponse.json(
        { message: "Title is required" },
        { status: 400 }
      )
    }

    const { db } = await connectToDatabase()

    let slug = postData.slug
    if (!slug) {
      slug = postData.title
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")
    }

    const existingPost = await db.collection("nx_posts").findOne({ slug })
    if (existingPost) {
      return NextResponse.json(
        { message: "A post/page with this slug already exists" },
        { status: 400 }
      )
    }

    const newPost = {
      ...postData,
      user_id: new ObjectId(session.id),
      date: new Date(),
      modified: new Date(),
      slug,
      images: postData.images || "",
      gallery: postData.gallery || [],
      taxonomy:
        postData.taxonomy?.map((tax) => ({
          term_id: new ObjectId(tax.term_id),
          taxonomy: tax.taxonomy,
        })) || [],
    }

    const { meta, ...postWithoutMeta } = newPost
    const result = await db.collection("nx_posts").insertOne(postWithoutMeta)
    const postId = result.insertedId

    // 🔧  full meta save
    if (meta && Object.keys(meta).length) {
      const rows = Object.entries(meta)
        .filter(([, v]) => v != null && v !== "")
        .map(([title, content]) => ({
          nx_posts: postId,
          title,
          content,
          createdAt: new Date(),
          updatedAt: new Date(),
        }))
      if (rows.length) await db.collection("nx_posts_meta").insertMany(rows)
    }

    return NextResponse.json({
      message: "Post created successfully",
      postId: postId.toString(),
    })
  } catch (error) {
    console.error("Error creating post:", error)
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    await requireAdminAuth()
    const { searchParams } = new URL(request.url)
    const postId = searchParams.get("id")

    if (!postId) {
      return NextResponse.json(
        { message: "Post ID is required" },
        { status: 400 }
      )
    }

    const postData: NxPostInput & { meta?: Record<string, string> } =
      await request.json()
    const { db } = await connectToDatabase()

    await db.collection("nx_posts").updateOne(
      { _id: new ObjectId(postId) },
      {
        $set: {
          ...postData,
          modified: new Date(),
          taxonomy:
            postData.taxonomy?.map((tax) => ({
              term_id: new ObjectId(tax.term_id),
              taxonomy: tax.taxonomy,
            })) || [],
        },
      }
    )

    // 🔧  replace all meta rows for this post
    await db.collection("nx_posts_meta").deleteMany({
      nx_posts: new ObjectId(postId),
    })

    if (postData.meta && Object.keys(postData.meta).length) {
      const rows = Object.entries(postData.meta)
        .filter(([, v]) => v != null && v !== "")
        .map(([title, content]) => ({
          nx_posts: new ObjectId(postId),
          title,
          content,
          createdAt: new Date(),
          updatedAt: new Date(),
        }))
      if (rows.length) await db.collection("nx_posts_meta").insertMany(rows)
    }

    return NextResponse.json({
      message: "Post updated successfully",
    })
  } catch (error) {
    console.error("Error updating post:", error)
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    )
  }
}