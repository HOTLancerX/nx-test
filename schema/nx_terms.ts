import type { ObjectId } from "mongodb"

export interface NxTerm {
  _id?: ObjectId
  type: string
  title: string
  slug: string
  images: string
  gallery: string[]
  content: string
  parent_id: ObjectId | null
}

export interface NxTermInput {
  type: string
  title: string
  slug?: string
  images?: string
  gallery?: string[]
  content?: string
  parent_id?: string | null
}