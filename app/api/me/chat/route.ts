// app/api/me/chat/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { ObjectId } from "mongodb";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("auth-token")?.value;
    if (!token) return NextResponse.json({ message: "Unauth" }, { status: 401 });

    const user = verifyToken(token);
    if (!user) return NextResponse.json({ message: "Unauth" }, { status: 401 });

    const { db } = await connectToDatabase();
    const rooms = await db
      .collection("nx_chat_rooms")
      .find({ participants: new ObjectId(user.id) })
      .sort({ updatedAt: -1 })
      .toArray();

    // populate last message & participant
    const enriched = await Promise.all(
      rooms.map(async (r) => {
        const other = r.participants.find((p: ObjectId) => p.toString() !== user.id);
        const u = await db.collection("nx_users").findOne({ _id: new ObjectId(other) });
        if (!u) return null;
        const last = r.lastMessage
          ? await db.collection("nx_chat_messages").findOne({ _id: r.lastMessage })
          : null;
        return {
          roomId: r._id,
          user: { _id: u._id, username: u.username, images: u.images || "" },
          lastMessage: last,
          updatedAt: r.updatedAt,
        };
      })
    );

    return NextResponse.json(enriched);
  } catch {
    return NextResponse.json({ message: "error" }, { status: 500 });
  }
}