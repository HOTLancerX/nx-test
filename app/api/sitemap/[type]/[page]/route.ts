import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"
import type { ObjectId } from "mongodb"

const SITEMAP_LIMIT = 500 // Maximum entries per sitemap file

interface NxPost {
  _id: ObjectId
  slug: string
  modified?: Date
  date: Date
  type: "post" | "page"
  status: "publish"
}

interface NxTerm {
  _id: ObjectId
  slug: string
  type: string
}

// Helper function to generate XML for a list of URLs
function generateXmlUrlset(
  urls: { url: string; lastModified: Date; changeFrequency: string; priority: number }[],
): string {
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`
  urls.forEach((entry) => {
    xml += `  <url>\n`
    xml += `    <loc>${entry.url}</loc>\n`
    xml += `    <lastmod>${entry.lastModified.toISOString()}</lastmod>\n`
    xml += `    <changefreq>${entry.changeFrequency}</changefreq>\n`
    xml += `    <priority>${entry.priority}</priority>\n`
    xml += `  </url>\n`
  })
  xml += `</urlset>`
  return xml
}

export async function GET(request: NextRequest, context: { params: Promise<{ type: string; page: string }> }) {
  const { type, page } = await context.params
  const pageNum = Number.parseInt(page, 10)
  if (isNaN(pageNum) || pageNum < 1) {
    return new NextResponse("Invalid page number", { status: 400 })
  }

  const { db } = await connectToDatabase()
  const baseUrl = process.env.VERCEL_URL || "http://localhost:3000"
  const skip = (pageNum - 1) * SITEMAP_LIMIT

  let urls: { url: string; lastModified: Date; changeFrequency: string; priority: number }[] = []

  try {
    if (type === "posts") {
      const posts = await db
        .collection<NxPost>("nx_posts")
        .find({ type: "post", status: "publish" })
        .sort({ modified: -1, date: -1 }) // Sort by modified date, then creation date
        .skip(skip)
        .limit(SITEMAP_LIMIT)
        .toArray()

      urls = posts.map((post) => ({
        url: `${baseUrl}/blog/${post.slug}`,
        lastModified: post.modified || post.date, // Use modified if available, else date
        changeFrequency: "daily",
        priority: 0.7,
      }))
    } else if (type === "pages") {
      const pages = await db
        .collection<NxPost>("nx_posts")
        .find({ type: "page", status: "publish" })
        .sort({ modified: -1, date: -1 })
        .skip(skip)
        .limit(SITEMAP_LIMIT)
        .toArray()

      urls = pages.map((contentPage) => ({
        url: `${baseUrl}/${contentPage.slug}`, // Assuming pages are directly under root
        lastModified: contentPage.modified || contentPage.date,
        changeFrequency: "weekly",
        priority: 0.6,
      }))
    } else if (type === "categories") {
      const categories = await db
        .collection<NxTerm>("nx_terms")
        .find({ type: "post_category" }) // Assuming 'post_category' is the type for categories
        .sort({ title: 1 }) // Sort by title for consistent pagination
        .skip(skip)
        .limit(SITEMAP_LIMIT)
        .toArray()

      urls = categories.map((category) => ({
        url: `${baseUrl}/category/${category.slug}`, // Assuming category pages exist
        lastModified: new Date(), // Categories might not have a modified date, use current date
        changeFrequency: "weekly",
        priority: 0.5,
      }))
    } else {
      return new NextResponse("Invalid sitemap type", { status: 400 })
    }

    const xmlContent = generateXmlUrlset(urls)
    return new NextResponse(xmlContent, {
      headers: {
        "Content-Type": "application/xml",
      },
    })
  } catch (error) {
    console.error(`Error generating sitemap for ${type} page ${page}:`, error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
