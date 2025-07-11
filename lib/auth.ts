import { cookies } from "next/headers"
import { connectToDatabase } from "./db"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export interface SessionUser {
  id: string
  username: string
  email: string
  type: "admin" | "editor" | "user"
}

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword)
}

export function generateToken(user: SessionUser): string {
  return jwt.sign(user, JWT_SECRET, { expiresIn: "7d" })
}

export function verifyToken(token: string): SessionUser | null {
  try {
    return jwt.verify(token, JWT_SECRET) as SessionUser
  } catch {
    return null
  }
}

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get("auth-token")?.value

  if (!token) return null

  return verifyToken(token)
}

export async function requireAuth(): Promise<SessionUser> {
  const session = await getSession()
  if (!session) {
    throw new Error("Unauthorized")
  }
  return session
}

export async function requireAdminAuth(): Promise<SessionUser> {
  const session = await requireAuth()
  if (session.type !== "admin" && session.type !== "editor") {
    throw new Error("Forbidden")
  }
  return session
}

export async function authenticateUser(email: string, password: string): Promise<SessionUser | null> {
  const { db } = await connectToDatabase()
  const user = await db.collection("nx_users").findOne({ email })

  if (!user || !user.status) return null

  const isValid = await verifyPassword(password, user.password)
  if (!isValid) return null

  return {
    id: user._id.toString(),
    username: user.username,
    email: user.email,
    type: user.type,
  }
}
