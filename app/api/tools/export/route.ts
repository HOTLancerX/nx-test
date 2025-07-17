import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"
import { requireAdminAuth } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    await requireAdminAuth()

    const { db } = await connectToDatabase()

    // Get all collections data
    const collections = await db.listCollections().toArray()
    const exportData: any = {
      exportDate: new Date().toISOString(),
      collections: {},
    }

    // Export each collection
    for (const collection of collections) {
      const collectionName = collection.name
      const data = await db.collection(collectionName).find({}).toArray()

      // Convert ObjectIds to strings for JSON serialization
      const serializedData = data.map((doc) => ({
        ...doc,
        _id: doc._id.toString(),
      }))

      exportData.collections[collectionName] = serializedData
    }

    return NextResponse.json(exportData)
  } catch (error) {
    console.error("Export error:", error)
    return NextResponse.json({ message: "Export failed" }, { status: 500 })
  }
}
