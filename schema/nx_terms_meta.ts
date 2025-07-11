import type { ObjectId } from "mongodb"

export interface NxTermMeta {
  _id?: ObjectId
  nx_terms: ObjectId
  title: string
  content: string
  createdAt?: Date
  updatedAt?: Date
}