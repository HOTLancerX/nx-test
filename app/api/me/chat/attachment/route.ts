// app/api/me/chat/attachment/route.ts
import { NextRequest, NextResponse } from "next/server";
import { uploadToR2 } from "@/lib/r2";
import { verifyToken } from "@/lib/auth";

export const config = { api: { bodyParser: false } };

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("auth-token")?.value;
    if (!token) return NextResponse.json({ message: "Unauth" }, { status: 401 });

    const user = verifyToken(token);
    if (!user) return NextResponse.json({ message: "Unauth" }, { status: 401 });

    const form = await req.formData();
    const file = form.get("file") as File;
    if (!file) return NextResponse.json({ message: "No file" }, { status: 400 });

    const url = await uploadToR2(file);
    return NextResponse.json({ url });
  } catch (e) {
    console.error("Upload error:", e);
    return NextResponse.json({ message: "Upload failed" }, { status: 500 });
  }
}