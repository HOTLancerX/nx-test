//app/api/search/route.ts
import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"
import { requireAdminAuth } from "@/lib/auth"
import type { NxPostInput } from "@/schema/nx_posts"
import { ObjectId } from "mongodb"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page         = Number(searchParams.get("page")  ?? 1);
    const limit        = Number(searchParams.get("limit") ?? 10);
    const type         = searchParams.get("type") ?? "post";
    const categoryId   = searchParams.get("category");
    const searchQuery  = searchParams.get("search");
    const dateFilter   = searchParams.get("date");          // 2025-07-15
    const skip = (page - 1) * limit;

    const { db } = await connectToDatabase();

    const filter: any = { type, status: "publish" };
    if (categoryId) {
      filter["taxonomy.term_id"] = new ObjectId(categoryId);
    }
    if (searchQuery) {
      const regex = new RegExp(searchQuery, "i");
      filter.$or  = [{ title: regex }, { content: regex }];
    }
    if (dateFilter) {
      // --- local-midnight range ---
      const [y, m, d] = dateFilter.split("-").map(Number);
      const start = new Date(y, m - 1, d);         // 00:00 local
      const end   = new Date(y, m - 1, d + 1);     // 00:00 next day
      filter.date = { $gte: start, $lt: end };
    }

    const [posts, totalPosts] = await Promise.all([
      db
        .collection("nx_posts")
        .find(filter)
        .sort({ date: -1 })
        .skip(skip)
        .limit(limit)
        .toArray(),
      db.collection("nx_posts").countDocuments(filter),
    ]);

    return NextResponse.json({
      posts: posts.map((p) => ({
        ...p,
        _id:     p._id.toString(),
        user_id: p.user_id?.toString() ?? "",
        taxonomy:
          p.taxonomy?.map((t: any) => ({
            ...t,
            term_id: t.term_id.toString(),
          })) ?? [],
      })),
      totalPages:   Math.ceil(totalPosts / limit),
      currentPage:  page,
      totalPosts,
    });
  } catch (err) {
    console.error("Error in /api/search:", err);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireAdminAuth() // Get session for user_id

    const postData: NxPostInput = await request.json()

    if (!postData.title) {
      return NextResponse.json({ message: "Title is required" }, { status: 400 })
    }

    const { db } = await connectToDatabase()

    let slug = postData.slug // Use provided slug if available
    if (!slug) {
      // If no slug provided, generate from title
      slug = postData.title
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")
    }

    // Check if slug exists (for both provided and generated slugs)
    const existingPost = await db.collection("nx_posts").findOne({ slug })
    if (existingPost) {
      return NextResponse.json({ message: "A post/page with this slug already exists" }, { status: 400 })
    }

    const newPost = {
      ...postData,
      user_id: new ObjectId(session.id), // Use actual user ID from session
      date: new Date(),
      modified: new Date(),
      slug, // Use the determined slug
      images: postData.images || "",
      gallery: postData.gallery || [],
      taxonomy:
        postData.taxonomy?.map((tax) => ({
          term_id: new ObjectId(tax.term_id),
          taxonomy: tax.taxonomy,
        })) || [],
    }

    const result = await db.collection("nx_posts").insertOne(newPost)

    return NextResponse.json({
      message: "Post created successfully",
      postId: result.insertedId.toString(),
    })
  } catch (error) {
    console.error("Error creating post:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
