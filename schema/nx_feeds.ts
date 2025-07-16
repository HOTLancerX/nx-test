import type { ObjectId } from "mongodb"

export interface NxFeed {
  _id?: ObjectId
  title: string
  url: string
  category_id: ObjectId
  user_id: ObjectId // Added user_id to the schema
  active: boolean
  last_fetched?: Date
  created_at: Date
  updated_at: Date
}

export interface NxFeedMeta {
  _id?: ObjectId
  nx_feeds_id: ObjectId
  key: string
  content: string
  created_at: Date
}