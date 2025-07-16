import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"
import { requireAdminAuth } from "@/lib/auth"
import { ObjectId } from "mongodb"

function getIdFromUrl(url: string): string | null {
  const match = url.match(/\/contact\/([^/?]+)/)
  return match ? match[1] : null
}

// GET - Get single contact submission
export async function GET(req: NextRequest) {
  try {
    await requireAdminAuth()

    const id = getIdFromUrl(req.url)
    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json({ message: "Invalid submission ID" }, { status: 400 })
    }

    const { db } = await connectToDatabase()
    const submission = await db.collection("nx_contact").findOne({
      _id: new ObjectId(id),
    })

    if (!submission) {
      return NextResponse.json({ message: "Submission not found" }, { status: 404 })
    }

    return NextResponse.json({
      ...submission,
      _id: submission._id.toString(),
    })
  } catch (error) {
    console.error("Error fetching contact submission:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

// PUT - Update contact submission status
export async function PUT(req: NextRequest) {
  try {
    await requireAdminAuth()

    const id = getIdFromUrl(req.url)
    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json({ message: "Invalid submission ID" }, { status: 400 })
    }

    const { status } = await req.json()

    if (!["pending", "completed", "try again", "ignore"].includes(status)) {
      return NextResponse.json({ message: "Invalid status" }, { status: 400 })
    }

    const { db } = await connectToDatabase()

    const result = await db.collection("nx_contact").updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          status,
          updatedAt: new Date(),
        },
      },
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ message: "Submission not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "Status updated successfully",
    })
  } catch (error) {
    console.error("Error updating contact submission:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

// DELETE - Delete contact submission
export async function DELETE(req: NextRequest) {
  try {
    await requireAdminAuth()

    const id = getIdFromUrl(req.url)
    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json({ message: "Invalid submission ID" }, { status: 400 })
    }

    const { db } = await connectToDatabase()

    const result = await db.collection("nx_contact").deleteOne({
      _id: new ObjectId(id),
    })

    if (result.deletedCount === 0) {
      return NextResponse.json({ message: "Submission not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "Submission deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting contact submission:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
