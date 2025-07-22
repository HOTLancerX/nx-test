// app/api/me/chat/[id]/route.ts
import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db" // Assuming lib/db.ts is available and correct
import { verifyToken } from "@/lib/auth" // Assuming lib/auth.ts is available and correct
import { ObjectId } from "mongodb"

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const token = _req.cookies.get("auth-token")?.value
    if (!token) return NextResponse.json([], { status: 401 }) // empty array

    const me = verifyToken(token)
    if (!me) return NextResponse.json([], { status: 401 }) // empty array

    const { id } = await params // Next 15 safe
    const { db } = await connectToDatabase()

    const lastMessageId = _req.nextUrl.searchParams.get("lastMessageId")
    const query: any = {
      $or: [
        { from: new ObjectId(me.id), to: new ObjectId(id) },
        { from: new ObjectId(id), to: new ObjectId(me.id) },
      ],
    }

    // IMPORTANT: Use _id for fetching messages greater than the last one
    if (lastMessageId) {
      query._id = { $gt: new ObjectId(lastMessageId) }
    }

    const messages = await db
      .collection("nx_chat_messages")
      .find(query)
      .sort({ createdAt: 1 }) // Still sort by createdAt for consistent ordering
      .toArray()

    return NextResponse.json(messages) // always array
  } catch {
    return NextResponse.json([]) // fallback empty array
  }
}

/* ---------- POST  ---------- */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const token = req.cookies.get("auth-token")?.value
    if (!token) return NextResponse.json({ message: "Unauth" }, { status: 401 })

    const me = verifyToken(token)
    if (!me) return NextResponse.json({ message: "Unauth" }, { status: 401 })

    const { id } = await params // ✅ await the Promise
    const body = await req.json()
    const { text, type = "text", postMeta } = body

    const { db } = await connectToDatabase()

    const message = {
      from: new ObjectId(me.id),
      to: new ObjectId(id),
      type,
      body: type === "text" ? text : JSON.stringify(postMeta),
      seen: false,
      createdAt: new Date(),
    }

    const res = await db.collection("nx_chat_messages").insertOne(message)

    // upsert room
    const participants = [new ObjectId(me.id), new ObjectId(id)].sort()
    await db
      .collection("nx_chat_rooms")
      .updateOne({ participants }, { $set: { lastMessage: res.insertedId, updatedAt: new Date() } }, { upsert: true })

    return NextResponse.json({ inserted: res.insertedId })
  } catch {
    return NextResponse.json({ message: "error" }, { status: 500 })
  }
}
