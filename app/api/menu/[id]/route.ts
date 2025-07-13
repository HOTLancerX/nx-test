import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { requireAdminAuth } from "@/lib/auth";
import { ObjectId } from "mongodb";
import { NxMenu } from "@/schema/nx_menu";

function getIdFromUrl(url: string): string | null {
  const match = url.match(/\/menu\/([^\/\?]+)/);
  return match ? match[1] : null;
}

export async function GET(req: NextRequest) {
  try {
    await requireAdminAuth();
    
    const id = getIdFromUrl(req.url);
    if (!id) return NextResponse.json({ message: "Missing ID" }, { status: 400 });

    const { db } = await connectToDatabase();
    const menu = await db.collection<NxMenu>("nx_menus").findOne({ 
      _id: new ObjectId(id) 
    });

    if (!menu) {
      return NextResponse.json({ message: "Menu not found" }, { status: 404 });
    }

    return NextResponse.json({
      ...menu,
      _id: menu._id.toString(),
      items: menu.items.map(item => ({
        ...item,
        referenceId: item.referenceId?.toString()
      }))
    });
  } catch (error) {
    console.error("Menu GET error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    await requireAdminAuth();
    
    const id = getIdFromUrl(req.url);
    if (!id) return NextResponse.json({ message: "Missing ID" }, { status: 400 });

    const { db } = await connectToDatabase();
    const menuData = await req.json();

    const existingMenu = await db.collection<NxMenu>("nx_menus").findOne({ 
      _id: new ObjectId(id) 
    });

    if (!existingMenu) {
      return NextResponse.json({ message: "Menu not found" }, { status: 404 });
    }

    const updateData = {
      title: menuData.title,
      location: menuData.location,
      items: menuData.items.map((item: any) => ({
        ...item,
        referenceId: item.referenceId ? new ObjectId(item.referenceId) : undefined
      })),
      updatedAt: new Date()
    };

    await db.collection<NxMenu>("nx_menus").updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    return NextResponse.json({ message: "Menu updated successfully" });
  } catch (error) {
    console.error("Menu PUT error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await requireAdminAuth();
    
    const id = getIdFromUrl(req.url);
    if (!id) return NextResponse.json({ message: "Missing ID" }, { status: 400 });

    const { db } = await connectToDatabase();
    await db.collection<NxMenu>("nx_menus").deleteOne({ _id: new ObjectId(id) });

    return NextResponse.json({ message: "Menu deleted successfully" });
  } catch (error) {
    console.error("Menu DELETE error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}