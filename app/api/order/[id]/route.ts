import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"
import { requireAdminAuth, verifyToken } from "@/lib/auth"
import { ObjectId } from "mongodb"

function getIdFromUrl(url: string): string | null {
  const match = url.match(/\/order\/([^/?]+)/)
  return match ? match[1] : null
}

// GET - Get single order
export async function GET(req: NextRequest) {
  try {
    const id = getIdFromUrl(req.url)
    if (!id) {
      return NextResponse.json({ message: "Invalid order ID" }, { status: 400 })
    }

    const { db } = await connectToDatabase()

    // Check if user is admin or the order owner
    const token = req.cookies.get("auth-token")?.value
    let isAdmin = false
    let userId: string | null = null

    if (token) {
      const decoded = verifyToken(token)
      if (decoded) {
        userId = decoded.id
        isAdmin = decoded.type === "admin" || decoded.type === "editor"
      }
    }

    let order
    if (ObjectId.isValid(id)) {
      order = await db.collection("nx_orders").findOne({ _id: new ObjectId(id) })
    } else {
      order = await db.collection("nx_orders").findOne({ orderId: id })
    }

    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 })
    }

    // Check permissions
    if (!isAdmin && (!userId || order.user.userId?.toString() !== userId)) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 })
    }

    // If admin is accessing, lock the order
    if (isAdmin && userId) {
      await db.collection("nx_orders").updateOne(
        { _id: order._id },
        {
          $set: {
            lockedBy: new ObjectId(userId),
            lockedAt: new Date(),
          },
        },
      )
    }

    return NextResponse.json({
      ...order,
      _id: order._id.toString(),
    })
  } catch (error) {
    console.error("Error fetching order:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

// PUT - Update order status (Admin only)
export async function PUT(req: NextRequest) {
  try {
    const session = await requireAdminAuth()
    const id = getIdFromUrl(req.url)

    if (!id) {
      return NextResponse.json({ message: "Invalid order ID" }, { status: 400 })
    }

    const { status, note } = await req.json()

    if (!["processing", "cancelled", "failed", "completed", "try-again"].includes(status)) {
      return NextResponse.json({ message: "Invalid status" }, { status: 400 })
    }

    const { db } = await connectToDatabase()

    let order
    if (ObjectId.isValid(id)) {
      order = await db.collection("nx_orders").findOne({ _id: new ObjectId(id) })
    } else {
      order = await db.collection("nx_orders").findOne({ orderId: id })
    }

    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 })
    }

    // Add status update to history
    const statusUpdate = {
      status,
      note: note || "",
      updatedBy: new ObjectId(session.id),
      updatedAt: new Date(),
    }

    const result = await db.collection("nx_orders").updateOne(
      { _id: order._id },
      {
        $set: {
          status,
          updatedAt: new Date(),
          lockedBy: null,
          lockedAt: null,
        },
        $push: {
          statusHistory: statusUpdate as any,
        },
      },
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "Order status updated successfully",
    })
  } catch (error) {
    console.error("Error updating order:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

// DELETE - Delete order (Admin only)
export async function DELETE(req: NextRequest) {
  try {
    await requireAdminAuth()
    const id = getIdFromUrl(req.url)

    if (!id) {
      return NextResponse.json({ message: "Invalid order ID" }, { status: 400 })
    }

    const { db } = await connectToDatabase()

    let result
    if (ObjectId.isValid(id)) {
      result = await db.collection("nx_orders").deleteOne({ _id: new ObjectId(id) })
    } else {
      result = await db.collection("nx_orders").deleteOne({ orderId: id })
    }

    if (result.deletedCount === 0) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "Order deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting order:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
