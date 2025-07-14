import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Number(searchParams.get("page") || 1)
    const limit = 10 // 10 users per page as requested
    const skip = (page - 1) * limit

    const { db } = await connectToDatabase()

    // Aggregate users with their meta data
    const users = await db
      .collection("nx_users")
      .aggregate([
        {
          $lookup: {
            from: "nx_users_meta",
            localField: "_id",
            foreignField: "nx_users",
            as: "meta",
          },
        },
        {
          $addFields: {
            metaData: {
              $arrayToObject: {
                $map: {
                  input: "$meta",
                  as: "item",
                  in: { k: "$$item.title", v: "$$item.content" },
                },
              },
            },
          },
        },
        {
          $project: {
            password: 0, // Exclude password
            meta: 0, // Exclude raw meta array
          },
        },
        {
          $sort: { createdAt: -1 },
        },
        {
          $skip: skip,
        },
        {
          $limit: limit,
        },
      ])
      .toArray()

    const totalUsers = await db.collection("nx_users").countDocuments()
    const totalPages = Math.ceil(totalUsers / limit)

    return NextResponse.json({
      users: users.map((user) => ({
        ...user,
        _id: user._id.toString(),
        // Flatten metaData into the user object
        ...user.metaData,
        metaData: undefined, // Remove the intermediate metaData field
      })),
      totalPages,
      currentPage: page,
      totalUsers,
    })
  } catch (error) {
    console.error("Error fetching user list:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
