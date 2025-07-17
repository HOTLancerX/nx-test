import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"
import { requireAdminAuth, verifyToken } from "@/lib/auth"
import { ObjectId } from "mongodb"
import type { NxOrder } from "@/schema/nx_orders"

// Get client IP address
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for")
  const realIP = request.headers.get("x-real-ip")

  if (forwarded) {
    return forwarded.split(",")[0].trim()
  }

  if (realIP) {
    return realIP
  }

  return "unknown"
}

// Generate unique order ID
function generateOrderId(): string {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substr(2, 5)
  return `ORD-${timestamp}-${random}`.toUpperCase()
}

// POST - Create new order
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { user, items, totalAmount } = body

    if (!user || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ success: false, message: "Invalid order data" }, { status: 400 })
    }

    const { db } = await connectToDatabase()

    // Check if user is logged in
    const token = request.cookies.get("auth-token")?.value
    let userId: ObjectId | undefined
    let isGuest = true

    if (token) {
      const decoded = verifyToken(token)
      if (decoded) {
        userId = new ObjectId(decoded.id)
        isGuest = false
      }
    }

    // Get client information
    const ipAddress = getClientIP(request)
    const userAgent = request.headers.get("user-agent") || "Unknown"

    // Create order
    const orderData: NxOrder = {
      orderId: generateOrderId(),
      user: {
        ...user,
        isGuest,
        userId,
      },
      items,
      totalAmount,
      status: "processing",
      statusHistory: [
        {
          status: "processing",
          note: "Order placed successfully",
          updatedBy: userId || new ObjectId(),
          updatedAt: new Date(),
        },
      ],
      ipAddress,
      userAgent,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await db.collection("nx_orders").insertOne(orderData)

    return NextResponse.json({
      success: true,
      message: "Order placed successfully",
      orderId: orderData.orderId,
      _id: result.insertedId.toString(),
    })
  } catch (error) {
    console.error("Order creation error:", error)
    return NextResponse.json({ success: false, message: "Failed to place order" }, { status: 500 })
  }
}

// GET - List orders (Admin only)
export async function GET(request: NextRequest) {
  try {
    await requireAdminAuth()

    const { searchParams } = new URL(request.url)
    const page = Number(searchParams.get("page") || 1)
    const limit = Number(searchParams.get("limit") || 10)
    const type = searchParams.get("type") || "all"
    const skip = (page - 1) * limit

    const { db } = await connectToDatabase()

    // Build filter based on type
    const filter: any = {}
    if (type !== "all") {
      filter.status = type
    }

    const [orders, totalOrders] = await Promise.all([
      db.collection("nx_orders").find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).toArray(),
      db.collection("nx_orders").countDocuments(filter),
    ])

    // Get phone and email counters for each order
    const ordersWithCounters = await Promise.all(
      orders.map(async (order) => {
        const phoneCount = await db.collection("nx_orders").countDocuments({
          "user.phone": order.user.phone,
        })
        const emailCount = await db.collection("nx_orders").countDocuments({
          "user.email": order.user.email,
        })

        return {
          ...order,
          _id: order._id.toString(),
          phoneCount,
          emailCount,
          isLocked:
            order.lockedBy && order.lockedAt && new Date().getTime() - new Date(order.lockedAt).getTime() < 300000, // 5 minutes
        }
      }),
    )

    const totalPages = Math.ceil(totalOrders / limit)

    return NextResponse.json({
      orders: ordersWithCounters,
      totalPages,
      currentPage: page,
      totalOrders,
    })
  } catch (error) {
    console.error("Error fetching orders:", error)
    return NextResponse.json({ message: "Unauthorized or Internal Server Error" }, { status: 401 })
  }
}
