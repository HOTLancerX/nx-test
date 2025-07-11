import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"
import { hashPassword, generateToken } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { username, email, password, phone } = await request.json()

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
      type: "user" as const,
      username,
      slug,
      password: hashedPassword,
      email,
      phone: phone || "",
      status: true,
      images: "",
      gallery: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await db.collection("nx_users").insertOne(newUser)

    const user = {
      id: result.insertedId.toString(),
      username,
      email,
      type: "user" as const,
    }

    const token = generateToken(user)

    return NextResponse.json({
      message: "User created successfully",
      user,
      token,
    })
  } catch (error) {
    console.error("Signup error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
