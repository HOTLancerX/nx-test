//schema/nx_posts_meta.ts
import type { ObjectId } from "mongodb"

export interface NxPostMeta {
  _id?: ObjectId
  nx_posts: ObjectId
  title: string
  content: string
  createdAt?: Date
  updatedAt?: Date
}