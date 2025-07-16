import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"
import { requireAdminAuth } from "@/lib/auth"

// Get client IP address
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for")
  const realIP = request.headers.get("x-real-ip")

  if (forwarded) {
    return forwarded.split(",")[0].trim()
  }

  if (realIP) {
    return realIP
  }

  return request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown"
}

// Get location from IP (simplified - you can integrate with a real IP geolocation service)
async function getLocationFromIP(ip: string): Promise<string> {
  try {
    // You can replace this with a real IP geolocation service like ipapi.co
    // For now, returning a placeholder
    return `Location for ${ip}`
  } catch (error) {
    return "Unknown location"
  }
}

// POST - Submit contact form
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { formData, userAgent, title, description, email, phone, address, fields } = body

    const { db } = await connectToDatabase()

    if (!db) {
      console.error("Database connection failed: 'db' object is null or undefined.")
      throw new Error("Database connection not established.")
    }
    console.log("Successfully connected to database.")

    // Get client information
    const ipAddress = getClientIP(request)
    const location = await getLocationFromIP(ipAddress)

    // Create contact submission
    const contactSubmission = {
      formTitle: title,
      formDescription: description,
      contactEmail: email,
      contactPhone: phone,
      contactAddress: address,
      formFields: fields,
      submissionData: formData,
      ipAddress,
      userAgent: userAgent || "Unknown",
      location,
      status: "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    // Add a console.log to inspect the object being saved
    console.log("Attempting to save contact submission:", JSON.stringify(contactSubmission, null, 2))

    const result = await db.collection("nx_contact").insertOne(contactSubmission)

    console.log("MongoDB insertOne result:", result)

    if (!result.acknowledged || !result.insertedId) {
      console.error("MongoDB insertOne operation was not acknowledged or no ID was inserted.")
      throw new Error("Failed to insert document into database.")
    }

    return NextResponse.json({
      success: true,
      message: "Contact form submitted successfully",
      submissionId: result.insertedId.toString(),
    })
  } catch (error) {
    console.error("Contact form submission error:", error)
    if (error instanceof Error) {
      console.error("Error name:", error.name)
      console.error("Error message:", error.message)
      console.error("Error stack:", error.stack)
    }
    return NextResponse.json(
      {
        success: false,
        message: "Failed to submit contact form",
      },
      { status: 500 },
    )
  }
}

// GET - List all contact submissions (Admin only)
export async function GET(request: NextRequest) {
  try {
    await requireAdminAuth()

    const { searchParams } = new URL(request.url)
    const page = Number(searchParams.get("page") || 1)
    const limit = Number(searchParams.get("limit") || 10)
    const skip = (page - 1) * limit

    const { db } = await connectToDatabase()

    const [submissions, totalSubmissions] = await Promise.all([
      db.collection("nx_contact").find({}).sort({ createdAt: -1 }).skip(skip).limit(limit).toArray(),
      db.collection("nx_contact").countDocuments(),
    ])

    const totalPages = Math.ceil(totalSubmissions / limit)

    return NextResponse.json({
      submissions: submissions.map((submission) => ({
        ...submission,
        _id: submission._id.toString(),
      })),
      totalPages,
      currentPage: page,
      totalSubmissions,
    })
  } catch (error) {
    console.error("Error fetching contact submissions:", error)
    return NextResponse.json({ message: "Unauthorized or Internal Server Error" }, { status: 401 })
  }
}
