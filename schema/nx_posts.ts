//schema/nx_posts.ts
import type { ObjectId } from "mongodb"

export interface NxPost {
  _id?: ObjectId
  user_id: ObjectId
  date: Date
  content: string
  title: string
  layout: string
  status: "publish" | "draft" | "trash"
  slug: string
  modified?: Date
  parent_id?: ObjectId
  type: "post" | "page" | "product"
  images: string
  gallery: string[]
  taxonomy: {
    term_id: ObjectId
    taxonomy: string
  }[]
}

export interface NxPostInput {
  title: string
  layout: string
  content: string
  status: "publish" | "draft" | "trash"
  type: "post" | "page" | "product"
  images?: string
  gallery?: string[]
  taxonomy?: {
    term_id: string
    taxonomy: string
  }[]
}