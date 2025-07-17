import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"
import { requireAdminAuth } from "@/lib/auth"
import { ObjectId } from "mongodb"

export async function POST(request: NextRequest) {
  try {
    await requireAdminAuth()

    const importData = await request.json()

    if (!importData.collections) {
      return NextResponse.json({ message: "Invalid import data format" }, { status: 400 })
    }

    const { db } = await connectToDatabase()
    let importedCount = 0
    let skippedCount = 0

    // Process each collection
    for (const [collectionName, documents] of Object.entries(importData.collections)) {
      if (!Array.isArray(documents)) continue

      const collection = db.collection(collectionName)

      for (const doc of documents as any[]) {
        try {
          // Convert string _id back to ObjectId if valid
          if (doc._id && typeof doc._id === "string" && ObjectId.isValid(doc._id)) {
            doc._id = new ObjectId(doc._id)
          }

          // Check if document already exists
          const existingDoc = await collection.findOne({ _id: doc._id })

          if (!existingDoc) {
            // Insert new document
            await collection.insertOne(doc)
            importedCount++
          } else {
            // Skip existing document
            skippedCount++
          }
        } catch (docError) {
          console.error(`Error processing document in ${collectionName}:`, docError)
          skippedCount++
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Import completed. ${importedCount} documents imported, ${skippedCount} documents skipped (already exist).`,
      imported: importedCount,
      skipped: skippedCount,
    })
  } catch (error) {
    console.error("Import error:", error)
    return NextResponse.json({ message: "Import failed" }, { status: 500 })
  }
}
