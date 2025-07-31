// app/api/post/[id]/route.ts
import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"
import { requireAdminAuth } from "@/lib/auth"
import type { NxPostInput } from "@/schema/nx_posts"
import { ObjectId } from "mongodb"

function getIdFromUrl(url: string): string | null {
  const match = url.match(/\/post\/([^/?]+)/)
  return match ? match[1] : null
}

/* -------------------------------------------------
   GET /api/post/[id]
------------------------------------------------- */
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

    const metaRows = await db
      .collection("nx_posts_meta")
      .find({ nx_posts: new ObjectId(id) })
      .toArray()

    const meta = metaRows.reduce<Record<string, string>>((acc, r) => {
      acc[r.title] = r.content
      return acc
    }, {})

    const { meta: _, ...cleanPost } = post

    return NextResponse.json({
      ...cleanPost,
      _id: post._id.toString(),
      user_id: post.user_id.toString(),
      taxonomy: post.taxonomy?.map((t: any) => ({
        ...t,
        term_id: t.term_id.toString(),
      })) || [],
      meta,
    })
  } catch (error) {
    console.error("Error fetching post:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

/* -------------------------------------------------
   PUT /api/post/[id]
------------------------------------------------- */

export async function PUT(req: NextRequest) {
  try {
    await requireAdminAuth()

    const id = getIdFromUrl(req.url)
    if (!id) {
      return NextResponse.json({ message: "Missing ID" }, { status: 400 })
    }

    const postData: NxPostInput & { meta?: Record<string, string> } = await req.json()

    if (!postData.title) {
      return NextResponse.json({ message: "Title is required" }, { status: 400 })
    }

    const { db } = await connectToDatabase()
    const objectId = new ObjectId(id)

    const existingPost = await db.collection("nx_posts").findOne({ _id: objectId })
    if (!existingPost) {
      return NextResponse.json({ message: "Post not found" }, { status: 404 })
    }

    // ✅ Slug calculation
    let slug = existingPost.slug
    if (postData.slug) {
      slug = postData.slug
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")
    } else if (postData.title !== existingPost.title) {
      slug = postData.title
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")
    }

    // ✅ Slug uniqueness check
    if (slug !== existingPost.slug) {
      const slugExists = await db.collection("nx_posts").findOne({
        slug,
        _id: { $ne: objectId },
      })
      if (slugExists) {
        return NextResponse.json(
          { message: "A post/page with this slug already exists" },
          { status: 400 }
        )
      }
    }

    // ✅ Destructure to remove meta
    const { meta, ...cleanData } = postData

    // ✅ Final update to nx_posts
    await db.collection("nx_posts").updateOne(
      { _id: objectId },
      {
        $set: {
          ...cleanData,
          slug,
          modified: new Date(),
          taxonomy: cleanData.taxonomy?.map((t) => ({
            term_id: new ObjectId(t.term_id),
            taxonomy: t.taxonomy,
          })) || [],
        },
        $unset: {
          meta: "", // ✅ Make sure meta is removed from nx_posts
        },
      }
    )

    // ✅ Replace meta in nx_posts_meta
    await db.collection("nx_posts_meta").deleteMany({ nx_posts: objectId })

    if (meta && typeof meta === "object" && Object.keys(meta).length > 0) {
      const rows = Object.entries(meta)
        .filter(([, v]) => typeof v === "string" && v.trim() !== "")
        .map(([title, content]) => ({
          nx_posts: objectId,
          title,
          content,
          createdAt: new Date(),
          updatedAt: new Date(),
        }))

      if (rows.length > 0) {
        await db.collection("nx_posts_meta").insertMany(rows)
      }
    }

    return NextResponse.json({ message: "Post updated successfully" })
  } catch (error) {
    console.error("Error updating post:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}


/* -------------------------------------------------
   DELETE /api/post/[id]
------------------------------------------------- */
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
