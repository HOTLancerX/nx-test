import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"
import { requireAdminAuth, hashPassword } from "@/lib/auth"
import { ObjectId } from "mongodb"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdminAuth()

    const { db } = await connectToDatabase()
    const user = await db.collection("nx_users").findOne({ _id: new ObjectId(params.id) })

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    return NextResponse.json({
      ...user,
      _id: user._id.toString(),
      password: undefined, // Don't send password
    })
  } catch (error) {
    console.error("Get user error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdminAuth()

    const userData = await request.json()
    const { username, email, password, phone, type, status, images, gallery } = userData

    if (!username || !email) {
      return NextResponse.json({ message: "Username and email are required" }, { status: 400 })
    }

    const { db } = await connectToDatabase()

    // Check if user exists
    const existingUser = await db.collection("nx_users").findOne({ _id: new ObjectId(params.id) })
    if (!existingUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    // Check if email is taken by another user
    const emailTaken = await db.collection("nx_users").findOne({
      email,
      _id: { $ne: new ObjectId(params.id) },
    })
    if (emailTaken) {
      return NextResponse.json({ message: "Email is already taken by another user" }, { status: 400 })
    }

    // Create slug from username
    const slug = username
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-")

    // Prepare update data
    const updateData: any = {
      username,
      slug,
      email,
      phone: phone || "",
      type: type || "user",
      status: status !== undefined ? status : true,
      images: images || "",
      gallery: gallery || [],
      updatedAt: new Date(),
    }

    // Hash password if provided
    if (password) {
      updateData.password = await hashPassword(password)
    }

    await db.collection("nx_users").updateOne({ _id: new ObjectId(params.id) }, { $set: updateData })

    return NextResponse.json({
      message: "User updated successfully",
    })
  } catch (error) {
    console.error("Update user error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdminAuth()

    const { db } = await connectToDatabase()

    // Check if user exists
    const existingUser = await db.collection("nx_users").findOne({ _id: new ObjectId(params.id) })
    if (!existingUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    // Delete user and related meta data
    await db.collection("nx_users").deleteOne({ _id: new ObjectId(params.id) })
    await db.collection("nx_users_meta").deleteMany({ nx_users: new ObjectId(params.id) })

    return NextResponse.json({
      message: "User deleted successfully",
    })
  } catch (error) {
    console.error("Delete user error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
