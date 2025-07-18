import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"
import { ObjectId } from "mongodb"

export async function POST(request: Request) {
  try {
    const { references } = await request.json()
    const { db } = await connectToDatabase()

    const slugs: Record<string, string> = {}

    // Process each reference type separately
    const posts = references.filter((r: { type: string }) => r.type === 'post')
    const pages = references.filter((r: { type: string }) => r.type === 'page')
    const categories = references.filter((r: { type: string }) => r.type === 'category')

    // Fetch post slugs
    if (posts.length > 0) {
      const postIds = posts.map((p: { id: number }) => new ObjectId(p.id))
      const postsData = await db.collection("nx_posts").find({
        _id: { $in: postIds }
      }).project({ _id: 1, slug: 1 }).toArray()

      postsData.forEach(post => {
        slugs[`post-${post._id.toString()}`] = post.slug
      })
    }

    // Fetch page slugs (assuming pages are also in nx_posts with type=page)
    if (pages.length > 0) {
      const pageIds = pages.map((p: { id: number }) => new ObjectId(p.id))
      const pagesData = await db.collection("nx_posts").find({
        _id: { $in: pageIds },
        type: "page"
      }).project({ _id: 1, slug: 1 }).toArray()

      pagesData.forEach(page => {
        slugs[`page-${page._id.toString()}`] = page.slug
      })
    }

    // Fetch category slugs
    if (categories.length > 0) {
      const categoryIds = categories.map((p: { id: number }) => new ObjectId(p.id))
      const categoriesData = await db.collection("nx_terms").find({
        _id: { $in: categoryIds },
        type: "post_category"
      }).project({ _id: 1, slug: 1 }).toArray()

      categoriesData.forEach(category => {
        slugs[`category-${category._id.toString()}`] = category.slug
      })
    }

    return NextResponse.json({ slugs })
  } catch (error) {
    console.error("Error fetching slugs:", error)
    return NextResponse.json({ slugs: {} }, { status: 500 })
  }
}