import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { NxMenu } from "@/schema/nx_menu";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const locationParam = searchParams.get("location");
    
    // Validate the location against the allowed values
    const allowedLocations = ["main", "footer-1", "footer-2", "top-bar"] as const;
    const location = allowedLocations.includes(locationParam as any) 
      ? locationParam as typeof allowedLocations[number]
      : "main";
    
    const { db } = await connectToDatabase();
    
    const menu = await db.collection<NxMenu>("nx_menus").findOne({ 
      location,
    });

    if (!menu) {
      return NextResponse.json({ items: [] });
    }

    return NextResponse.json({
      items: menu.items.map(item => ({
        ...item,
        referenceId: item.referenceId?.toString()
      }))
    });
  } catch (error) {
    console.error("Error fetching menu:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}