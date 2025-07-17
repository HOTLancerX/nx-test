import type { ObjectId } from "mongodb"

export interface OrderItem {
  productId: string
  title: string
  color: string
  image: string
  price: number
  quantity: number
  shipping: {
    type: "free" | "flat" | "inside_outside"
    cost: number
    area?: string
  }
}

export interface OrderUser {
  name: string
  email: string
  phone: string
  address: string
  isGuest: boolean
  userId?: ObjectId
}

export interface OrderStatusUpdate {
  status: "processing" | "cancelled" | "failed" | "completed" | "try-again"
  note: string
  updatedBy: ObjectId
  updatedAt: Date
}

export interface NxOrder {
  _id?: ObjectId
  orderId: string
  user: OrderUser
  items: OrderItem[]
  totalAmount: number
  status: "processing" | "cancelled" | "failed" | "completed" | "try-again"
  statusHistory: OrderStatusUpdate[]
  ipAddress: string
  userAgent: string
  createdAt: Date
  updatedAt: Date
  lockedBy?: ObjectId
  lockedAt?: Date
}
