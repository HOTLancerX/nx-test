//schema/nx_posts_meta.ts
import type { ObjectId } from "mongodb"
import type { NxPost } from "./nx_posts" // Assuming NxPost is defined in nx_posts.ts

export interface NxPostMeta {
  _id?: ObjectId
  nx_posts: ObjectId // Reference to the post ID
  title: string // The meta key, e.g., "rsslink"
  content: string // The meta value
  createdAt?: Date
  updatedAt?: Date
}

// This type extends NxPost to include an index signature,
// allowing for dynamic properties (like 'rsslink') to be added.
export type NxPostWithMeta = NxPost & {
  [key: string]: any // Allows dynamic properties like 'rsslink', 'another_meta_key', etc.
}
