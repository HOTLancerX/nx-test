import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"
import { ObjectId } from "mongodb"
import { parseString } from "xml2js"
import { promisify } from "util"
import type { NxFeed } from "@/schema/nx_feeds" // Import NxFeed to get user_id

const parseXML = promisify(parseString)

interface RSSItem {
  title: string
  link: string
  description: string
  pubDate: string
  guid: string
  image?: string
  domain: string
  needsImage?: boolean
}

// Utility to fetch OG image
async function fetchOGImageFromPage(link: string): Promise<string | null> {
  try {
    const response = await fetch(link, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      },
      cache: "no-store",
    })

    if (!response.ok) return null

    const html = await response.text()
    const ogMatch = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i)
    return ogMatch?.[1] || null
  } catch {
    return null
  }
}

// Parse RSS XML
async function fetchRSSFeed(url: string): Promise<RSSItem[]> {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      },
    })

    if (!response.ok) {
      console.error(`Failed to fetch ${url}: ${response.status}`)
      return []
    }

    const xmlText = await response.text()
    const result = (await parseXML(xmlText)) as any

    const items = result?.rss?.channel?.[0]?.item || []
    const domain = new URL(url).hostname

    const newsItems: RSSItem[] = items.map((item: any) => {
      const title = item.title?.[0] || ""
      const link = item.link?.[0] || ""
      const pubDate = item.pubDate?.[0] || ""
      const guid = item.guid?.[0]?._ || item.guid?.[0] || ""

      const contentEncoded = item["content:encoded"]?.[0]?.trim()
      const description = contentEncoded || item.description?.[0] || ""

      const image = item["media:content"]?.[0]?.$?.url || ""
      const needsImage = !image && !!link

      return {
        title,
        link,
        description,
        pubDate,
        guid,
        image,
        domain,
        needsImage,
      }
    })

    return newsItems.filter((item: RSSItem) => item.title && item.link)
  } catch (error) {
    console.error(`Error fetching RSS feed ${url}:`, error)
    return []
  }
}

// Try to fetch image for posts without one
async function enrichItemsWithImages(items: RSSItem[]): Promise<RSSItem[]> {
  return Promise.all(
    items.map(async (item) => {
      if (!item.needsImage || !item.link) return item

      const image = await fetchOGImageFromPage(item.link)
      return {
        ...item,
        image: image || "",
        needsImage: false,
      }
    }),
  )
}

// Check for duplicate RSS link
async function isPostAlreadyImported(link: string, db: any): Promise<boolean> {
  const meta = await db.collection("nx_posts_meta").findOne({
    title: "rsslink",
    content: link,
  })
  return !!meta
}

// Check if string is English
function isEnglish(str: string): boolean {
  return /^[\x00-\x7F]*$/.test(str)
}

// Create slug: English → slug; Bangla → fallback to ObjectId
function createSlug(title: string, fallbackId: string): string {
  if (!title) return fallbackId

  if (isEnglish(title)) {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
  }

  return fallbackId
}

// Main import logic per post
async function createPostFromRSSItem(
  item: RSSItem,
  categoryId: ObjectId,
  userId: ObjectId, // Added userId parameter
  db: any,
): Promise<void> {
  if (await isPostAlreadyImported(item.link, db)) return

  const fallbackId = new ObjectId().toHexString()
  const slug = createSlug(item.title, fallbackId)

  let image = item.image
  if (!image && item.link) {
    image = (await fetchOGImageFromPage(item.link)) || ""
  }

  const newPost = {
    title: item.title,
    content: item.description,
    slug,
    images: image || "",
    gallery: [],
    type: "post",
    status: "publish",
    date: new Date(item.pubDate || new Date()),
    modified: new Date(),
    user_id: userId, // Assign the user_id from the feed
    taxonomy: [
      {
        term_id: categoryId,
        taxonomy: "post_category",
      },
    ],
  }

  const result = await db.collection("nx_posts").insertOne(newPost)

  await db.collection("nx_posts_meta").insertOne({
    nx_posts: result.insertedId,
    title: "rsslink",
    content: item.link,
    created_at: new Date(),
  })
}

// The GET route
export async function GET() {
  try {
    const { db } = await connectToDatabase()

    const feeds = await db
      .collection<NxFeed>("nx_feeds") // Use NxFeed type
      .find({ active: true })
      .toArray()

    if (feeds.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No active feeds found",
        imported: 0,
      })
    }

    let totalImported = 0

    for (const feed of feeds) {
      // Ensure feed.user_id exists before proceeding
      if (!feed.user_id) {
        console.warn(`Feed ${feed._id} has no user_id. Skipping.`)
        continue
      }
      const items = await fetchRSSFeed(feed.url)
      const enrichedItems = await enrichItemsWithImages(items)

      for (const item of enrichedItems) {
        await createPostFromRSSItem(item, feed.category_id, feed.user_id, db) // Pass feed.user_id
        totalImported++
      }

      await db.collection("nx_feeds").updateOne({ _id: feed._id }, { $set: { last_fetched: new Date() } })
    }

    return NextResponse.json({
      success: true,
      message: "RSS sync completed",
      imported: totalImported,
    })
  } catch (error) {
    console.error("Error in RSS sync:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to sync RSS feeds",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
