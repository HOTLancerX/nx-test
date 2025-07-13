import type { ObjectId } from "mongodb"

export interface NxTerm {
  _id?: ObjectId
  type: "post_category" | "product"
  title: string
  layout: string
  slug: string
  images: string
  gallery: string[]
  content: string
  parent_id: ObjectId | null
}

export interface NxTermInput {
  type: "post_category" | "product"
  title: string
  layout: string
  slug?: string
  images?: string
  gallery?: string[]
  content?: string
  parent_id?: string | null
}