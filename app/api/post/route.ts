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

    const posts = await db.collection("nx_posts")
      .find(filter)
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit)
      .toArray()

    // Fetch meta data for each post
    const postsWithMeta = await Promise.all(posts.map(async (post) => {
      const meta = await db.collection<NxPostMeta>("nx_posts_meta").find({ nx_posts: post._id }).toArray();

      const metaData = meta.reduce((acc: Record<string, string>, item: NxPostMeta) => {
        acc[item.title] = item.content;
        return acc;
      }, {});

      return {
        ...post,
        _id: post._id?.toString?.() || "",
        user_id: post.user_id?.toString?.() || "",
        taxonomy: Array.isArray(post.taxonomy)
          ? post.taxonomy.map((tax: any) => ({
              ...tax,
              term_id: tax.term_id?.toString?.() || "",
            }))
          : [],
        meta: metaData
      }
    }));


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
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireAdminAuth()

    const postData: NxPostInput & { meta?: Record<string, string> } = await request.json()

    if (!postData.title) {
      return NextResponse.json({ message: "Title is required" }, { status: 400 })
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
      return NextResponse.json({ message: "A post/page with this slug already exists" }, { status: 400 })
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

    // Remove meta fields before inserting post
    const { meta, ...postWithoutMeta } = newPost

    const result = await db.collection("nx_posts").insertOne(postWithoutMeta)
    const postId = result.insertedId

    // Insert meta data if exists
    if (meta && Object.keys(meta).length > 0) {
      const metaToInsert: NxPostMeta[] = Object.entries(meta)
        .filter(([_, value]) => value !== undefined && value !== null && value !== '')
        .map(([key, value]) => ({
          nx_posts: postId,
          title: key,
          content: value,
          createdAt: new Date(),
          updatedAt: new Date()
        }))

      if (metaToInsert.length > 0) {
        await db.collection("nx_posts_meta").insertMany(metaToInsert)
      }
    }

    return NextResponse.json({
      message: "Post created successfully",
      postId: postId.toString(),
    })
  } catch (error) {
    console.error("Error creating post:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    await requireAdminAuth()
    const { searchParams } = new URL(request.url)
    const postId = searchParams.get("id")
    
    if (!postId) {
      return NextResponse.json({ message: "Post ID is required" }, { status: 400 })
    }

    const postData: NxPostInput & { meta?: Record<string, string> } = await request.json()
    const { db } = await connectToDatabase()

    // Update main post data
    const updateResult = await db.collection("nx_posts").updateOne(
      { _id: new ObjectId(postId) },
      {
        $set: {
          ...postData,
          modified: new Date(),
          taxonomy: postData.taxonomy?.map((tax) => ({
            term_id: new ObjectId(tax.term_id),
            taxonomy: tax.taxonomy,
          })) || [],
        }
      }
    )

    // Handle meta data updates
    if (postData.meta) {
      // First delete all existing meta for this post
      await db.collection("nx_posts_meta").deleteMany({ nx_posts: new ObjectId(postId) })

      // Then insert the new meta data
      const metaToInsert: NxPostMeta[] = Object.entries(postData.meta)
        .filter(([_, value]) => value !== undefined && value !== null && value !== '')
        .map(([key, value]) => ({
          nx_posts: new ObjectId(postId),
          title: key,
          content: value,
          createdAt: new Date(),
          updatedAt: new Date()
        }))

      if (metaToInsert.length > 0) {
        await db.collection("nx_posts_meta").insertMany(metaToInsert)
      }
    }

    if (updateResult.modifiedCount === 0) {
      return NextResponse.json({ message: "No changes made" }, { status: 200 })
    }

    return NextResponse.json({
      message: "Post updated successfully",
    })
  } catch (error) {
    console.error("Error updating post:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}