import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"
import { requireAdminAuth } from "@/lib/auth"

export async function GET() {
  try {
    const { db } = await connectToDatabase()
    const settings = await db.collection("nx_settings").find({}).toArray()

    // Transform array of settings into key-value object
    const settingsObject = settings.reduce((acc, setting) => {
      acc[setting.title] = setting.content
      return acc
    }, {} as Record<string, any>)

    return NextResponse.json(settingsObject)
  } catch (error) {
    console.error("Settings GET error:", error)
    return NextResponse.json(
      { 
        success: false,
        message: "Failed to fetch settings",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Protect write operations
    await requireAdminAuth()

    const { title, content } = await request.json()

    if (!title || typeof title !== "string") {
      return NextResponse.json(
        { success: false, message: "Valid title is required" },
        { status: 400 }
      )
    }

    const { db } = await connectToDatabase()

    const result = await db.collection("nx_settings").updateOne(
      { title },
      {
        $set: {
          content,
          updatedAt: new Date(),
        },
        $setOnInsert: {
          title,
          createdAt: new Date(),
        },
      },
      { upsert: true }
    )

    return NextResponse.json({
      success: true,
      message: "Setting updated successfully",
      data: result
    })
  } catch (error) {
    console.error("Settings POST error:", error)
    return NextResponse.json(
      { 
        success: false,
        message: "Authentication required",
        error: "Unauthorized"
      },
      { status: 401 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Protect write operations
    await requireAdminAuth()

    const settingsData = await request.json()
    const { db } = await connectToDatabase()

    const bulkOps = Object.entries(settingsData).map(([title, content]) => ({
      updateOne: {
        filter: { title },
        update: {
          $set: {
            content,
            updatedAt: new Date(),
          },
          $setOnInsert: {
            title,
            createdAt: new Date(),
          },
        },
        upsert: true,
      },
    }))

    let result = null
    if (bulkOps.length > 0) {
      result = await db.collection("nx_settings").bulkWrite(bulkOps)
    }

    return NextResponse.json({
      success: true,
      message: "Settings updated successfully",
      data: result
    })
  } catch (error) {
    console.error("Settings PUT error:", error)
    return NextResponse.json(
      { 
        success: false,
        message: "Authentication required",
        error: "Unauthorized"
      },
      { status: 401 }
    )
  }
}

export const dynamic = "force-dynamic" // Ensure fresh data