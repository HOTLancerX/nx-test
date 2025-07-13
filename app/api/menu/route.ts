//app/api/menu/route.ts
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { requireAdminAuth } from "@/lib/auth";
import { NxMenu } from "@/schema/nx_menu";

export async function GET(request: Request) {
  try {
    await requireAdminAuth();
    
    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get("page") || 1);
    const limit = 10;
    const skip = (page - 1) * limit;

    const { db } = await connectToDatabase();

    const [menus, totalMenus] = await Promise.all([
      db.collection<NxMenu>("nx_menus")
        .find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray(),
      db.collection<NxMenu>("nx_menus").countDocuments()
    ]);

    return NextResponse.json({
      menus: menus.map(menu => ({
        ...menu,
        _id: menu._id.toString(),
      })),
      totalPages: Math.ceil(totalMenus / limit),
      currentPage: page,
      totalMenus
    });
  } catch (error) {
    return NextResponse.json(
      { message: "Unauthorized" },
      { status: 401 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await requireAdminAuth();
    
    const { db } = await connectToDatabase();
    const menuData = await request.json();

    if (!menuData.title || !menuData.location) {
      return NextResponse.json(
        { message: "Title and location are required" },
        { status: 400 }
      );
    }

    // Create slug from title
    const slug = menuData.title
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-");

    const newMenu: NxMenu = {
      title: menuData.title,
      slug,
      location: menuData.location,
      items: menuData.items || [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await db.collection<NxMenu>("nx_menus").insertOne(newMenu);

    return NextResponse.json({
      message: "Menu created successfully",
      menuId: result.insertedId.toString(),
    });
  } catch (error) {
    console.error("Menu POST error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}