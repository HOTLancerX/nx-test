import type { ObjectId } from "mongodb"

export interface NxSettings {
  _id?: ObjectId
  title: string
  content: any // Can be string, array, object, etc.
  createdAt?: Date
  updatedAt?: Date
}

export const createSetting = (title: string, content: any): NxSettings => {
  return {
    title,
    content,
    createdAt: new Date(),
    updatedAt: new Date(),
  }
}
