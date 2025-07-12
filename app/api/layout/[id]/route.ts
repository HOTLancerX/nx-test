// app/api/layout/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { ObjectId } from "mongodb";
import { NxLayout } from "@/schema/nx_layouts";

function getIdFromUrl(url: string): string | null {
  const match = url.match(/\/layout\/([^\/\?]+)/);
  return match ? match[1] : null;
}

export async function GET(req: NextRequest) {
  try {
    const id = getIdFromUrl(req.url);
    if (!id) return NextResponse.json({ message: "Missing ID" }, { status: 400 });

    const { db } = await connectToDatabase();
    const layout = await db.collection<NxLayout>("nx_layouts").findOne({ 
      _id: new ObjectId(id) 
    });

    if (!layout) {
      return NextResponse.json({ message: "Layout not found" }, { status: 404 });
    }

    return NextResponse.json({
      ...layout,
      _id: layout._id.toString(),
      createdAt: layout.createdAt.toISOString(),
      updatedAt: layout.updatedAt.toISOString(),
      userId: layout.userId.toString()
    });
  } catch (error) {
    console.error("Error fetching layout:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const id = getIdFromUrl(req.url);
    if (!id) return NextResponse.json({ message: "Missing ID" }, { status: 400 });

    const { db } = await connectToDatabase();
    const layoutData = await req.json();

    const existingLayout = await db.collection<NxLayout>("nx_layouts").findOne({ 
      _id: new ObjectId(id) 
    });

    if (!existingLayout) {
      return NextResponse.json({ message: "Layout not found" }, { status: 404 });
    }

    await db.collection<NxLayout>("nx_layouts").updateOne(
      { _id: new ObjectId(id) },
      { 
        $set: {
          title: layoutData.title,
          items: layoutData.items,
          updatedAt: new Date()
        } 
      }
    );

    return NextResponse.json({
      message: "Layout updated successfully"
    });
  } catch (error) {
    console.error("Error updating layout:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const id = getIdFromUrl(req.url);
    if (!id) return NextResponse.json({ message: "Missing ID" }, { status: 400 });

    const { db } = await connectToDatabase();

    await db.collection<NxLayout>("nx_layouts").deleteOne({ 
      _id: new ObjectId(id) 
    });

    return NextResponse.json({
      message: "Layout deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting layout:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}