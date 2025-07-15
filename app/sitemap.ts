import type { MetadataRoute } from "next"
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
  type: string // e.g., 'post_category'
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { db } = await connectToDatabase()
  // Use VERCEL_URL for production, fallback to localhost for development
  const baseUrl = process.env.VERCEL_URL || "http://localhost:3000"

  const sitemapEntries: MetadataRoute.Sitemap = []

  // Add static pages
  sitemapEntries.push(
    {
      url: `${baseUrl}/`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/users`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
  )

  // --- Posts Sitemap Index ---
  const totalPosts = await db.collection<NxPost>("nx_posts").countDocuments({ type: "post", status: "publish" })
  const totalPostPages = Math.ceil(totalPosts / SITEMAP_LIMIT)
  for (let i = 0; i < totalPostPages; i++) {
    sitemapEntries.push({
      url: `${baseUrl}/api/sitemap/posts/${i + 1}`,
      lastModified: new Date(), // This should ideally be the last modified date of the latest post in that segment
      changeFrequency: "daily",
      priority: 0.7,
    })
  }

  // --- Pages Sitemap Index ---
  const totalPages = await db.collection<NxPost>("nx_posts").countDocuments({ type: "page", status: "publish" })
  const totalContentPages = Math.ceil(totalPages / SITEMAP_LIMIT)
  for (let i = 0; i < totalContentPages; i++) {
    sitemapEntries.push({
      url: `${baseUrl}/api/sitemap/pages/${i + 1}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.6,
    })
  }

  // --- Categories Sitemap Index ---
  const totalCategories = await db.collection<NxTerm>("nx_terms").countDocuments({ type: "post_category" })
  const totalCategoryPages = Math.ceil(totalCategories / SITEMAP_LIMIT)
  for (let i = 0; i < totalCategoryPages; i++) {
    sitemapEntries.push({
      url: `${baseUrl}/api/sitemap/categories/${i + 1}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.5,
    })
  }

  return sitemapEntries
}
