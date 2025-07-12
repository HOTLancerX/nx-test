// app/api/layout/route.ts
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { ObjectId } from "mongodb";
import { NxLayout } from "@/schema/nx_layouts";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get("page") || 1);
    const limit = 10;
    const skip = (page - 1) * limit;

    const { db } = await connectToDatabase();

    const [layouts, totalLayouts] = await Promise.all([
      db.collection<NxLayout>("nx_layouts")
        .find({})
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray(),
      db.collection<NxLayout>("nx_layouts").countDocuments()
    ]);

    return NextResponse.json({
      layouts: layouts.map(layout => ({
        ...layout,
        _id: layout._id.toString(),
        createdAt: layout.createdAt.toISOString(),
        updatedAt: layout.updatedAt.toISOString()
      })),
      totalPages: Math.ceil(totalLayouts / limit),
      currentPage: page,
      totalLayouts
    });
  } catch (error) {
    console.error("Error fetching layouts:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { db } = await connectToDatabase();
    const layoutData = await request.json();

    if (!layoutData.title || !layoutData.items) {
      return NextResponse.json(
        { message: "Title and items are required" },
        { status: 400 }
      );
    }

    const newLayout = {
      title: layoutData.title,
      status: "publish",
      items: layoutData.items,
      createdAt: new Date(),
      updatedAt: new Date(),
      userId: new ObjectId() // Replace with actual user ID from auth
    };

    const result = await db
      .collection<NxLayout>("nx_layouts")
      .insertOne(newLayout as Omit<NxLayout, '_id'>);


    return NextResponse.json({
      message: "Layout created successfully",
      layoutId: result.insertedId.toString()
    });
  } catch (error) {
    console.error("Error creating layout:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}