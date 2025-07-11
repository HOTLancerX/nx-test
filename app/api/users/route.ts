import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"
import { requireAdminAuth, hashPassword } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    await requireAdminAuth()

    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const skip = (page - 1) * limit

    const { db } = await connectToDatabase()

    const users = await db.collection("nx_users").find({}).sort({ createdAt: -1 }).skip(skip).limit(limit).toArray()

    const totalUsers = await db.collection("nx_users").countDocuments()
    const totalPages = Math.ceil(totalUsers / limit)

    return NextResponse.json({
      users: users.map((user) => ({
        ...user,
        _id: user._id.toString(),
        password: undefined, // Don't send password
      })),
      totalPages,
      currentPage: page,
      totalUsers,
    })
  } catch (error) {
    console.error("Get users error:", error)
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdminAuth()

    const userData = await request.json()
    const { username, email, password, phone, type, status, images, gallery } = userData

    if (!username || !email || !password) {
      return NextResponse.json({ message: "Username, email, and password are required" }, { status: 400 })
    }

    const { db } = await connectToDatabase()

    // Check if user already exists
    const existingUser = await db.collection("nx_users").findOne({ email })
    if (existingUser) {
      return NextResponse.json({ message: "User with this email already exists" }, { status: 400 })
    }

    // Create slug from username
    const slug = username
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-")

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Create user
    const newUser = {
      type: type || "user",
      username,
      slug,
      password: hashedPassword,
      email,
      phone: phone || "",
      status: status !== undefined ? status : true,
      images: images || "",
      gallery: gallery || [],
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await db.collection("nx_users").insertOne(newUser)

    return NextResponse.json({
      message: "User created successfully",
      userId: result.insertedId.toString(),
    })
  } catch (error) {
    console.error("Create user error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
