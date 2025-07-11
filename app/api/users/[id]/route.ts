import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"
import { requireAdminAuth, hashPassword } from "@/lib/auth"
import { ObjectId } from "mongodb"

function extractIdFromUrl(url: string): string | null {
  const match = url.match(/\/users\/([^\/\?]+)/)
  return match ? match[1] : null
}

export async function GET(req: NextRequest) {
  try {
    await requireAdminAuth()

    const id = extractIdFromUrl(req.url)
    if (!id) return NextResponse.json({ message: "Missing user ID" }, { status: 400 })

    const { db } = await connectToDatabase()
    const user = await db.collection("nx_users").findOne({ _id: new ObjectId(id) })

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    return NextResponse.json({
      ...user,
      _id: user._id.toString(),
      password: undefined,
    })
  } catch (error) {
    console.error("Get user error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    await requireAdminAuth()

    const id = extractIdFromUrl(req.url)
    if (!id) return NextResponse.json({ message: "Missing user ID" }, { status: 400 })

    const userData = await req.json()
    const { username, email, password, phone, type, status, images, gallery } = userData

    if (!username || !email) {
      return NextResponse.json({ message: "Username and email are required" }, { status: 400 })
    }

    const { db } = await connectToDatabase()

    const existingUser = await db.collection("nx_users").findOne({ _id: new ObjectId(id) })
    if (!existingUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    const emailTaken = await db.collection("nx_users").findOne({
      email,
      _id: { $ne: new ObjectId(id) },
    })
    if (emailTaken) {
      return NextResponse.json({ message: "Email is already taken by another user" }, { status: 400 })
    }

    const slug = username
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-")

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

    if (password) {
      updateData.password = await hashPassword(password)
    }

    await db.collection("nx_users").updateOne({ _id: new ObjectId(id) }, { $set: updateData })

    return NextResponse.json({ message: "User updated successfully" })
  } catch (error) {
    console.error("Update user error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await requireAdminAuth()

    const id = extractIdFromUrl(req.url)
    if (!id) return NextResponse.json({ message: "Missing user ID" }, { status: 400 })

    const { db } = await connectToDatabase()

    const existingUser = await db.collection("nx_users").findOne({ _id: new ObjectId(id) })
    if (!existingUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    await db.collection("nx_users").deleteOne({ _id: new ObjectId(id) })
    await db.collection("nx_users_meta").deleteMany({ nx_users: new ObjectId(id) })

    return NextResponse.json({ message: "User deleted successfully" })
  } catch (error) {
    console.error("Delete user error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}