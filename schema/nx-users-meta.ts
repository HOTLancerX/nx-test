import type { ObjectId } from "mongodb"

export interface NxUsersMeta {
  _id?: ObjectId
  nx_users: ObjectId
  title: string
  content: string
  createdAt?: Date
  updatedAt?: Date
}

export const createUserMeta = (userId: ObjectId, title: string, content: string): NxUsersMeta => {
  return {
    nx_users: userId,
    title,
    content,
    createdAt: new Date(),
    updatedAt: new Date(),
  }
}
