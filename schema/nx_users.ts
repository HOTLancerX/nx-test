import type { ObjectId } from "mongodb"

export interface NxUser {
  _id?: ObjectId
  type: "admin" | "editor" | "user"
  username: string
  slug: string
  password: string
  email: string
  phone: string
  status: boolean
  images: string
  gallery: string[]
  createdAt?: Date
  updatedAt?: Date
}

export interface NxUserMeta {
  _id?: ObjectId
  nx_users: ObjectId
  title: string
  content: string
  createdAt?: Date
  updatedAt?: Date
}