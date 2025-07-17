import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"
import { verifyToken } from "@/lib/auth"
import { ObjectId } from "mongodb"

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value
    if (!token) {
      return NextResponse.json({ message: "Authentication required" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = Number(searchParams.get("page") || 1)
    const limit = 10
    const skip = (page - 1) * limit

    const { db } = await connectToDatabase()

    const [orders, totalOrders] = await Promise.all([
      db
        .collection("nx_orders")
        .find({ "user.userId": new ObjectId(decoded.id) })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray(),
      db.collection("nx_orders").countDocuments({ "user.userId": new ObjectId(decoded.id) }),
    ])

    const totalPages = Math.ceil(totalOrders / limit)

    return NextResponse.json({
      orders: orders.map((order) => ({
        ...order,
        _id: order._id.toString(),
      })),
      totalPages,
      currentPage: page,
      totalOrders,
    })
  } catch (error) {
    console.error("Error fetching user orders:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
