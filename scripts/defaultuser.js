const { MongoClient } = require("mongodb")
const bcrypt = require("bcryptjs")

const MONGODB_URI = process.env.MONGODB_URI || ""
const DB_NAME = "nx_cms"

async function createDefaultUser() {
  const client = new MongoClient(MONGODB_URI)

  try {
    await client.connect()
    console.log("Connected to MongoDB")

    const db = client.db(DB_NAME)
    const usersCollection = db.collection("nx_users")

    // Check if admin user already exists
    const existingAdmin = await usersCollection.findOne({ email: "admin@gmail.com" })

    if (existingAdmin) {
      console.log("Default admin user already exists")
      return
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash("admin123", 12)

    // Create default admin user
    const defaultUser = {
      type: "admin",
      username: "HeRa Khan",
      slug: "hera-khan",
      password: hashedPassword,
      email: "admin@gmail.com",
      phone: "01781077094",
      status: true,
      images: "https://domain.com/image.jpg",
      gallery: ["https://domain.com/4.jpg", "https://domain.com/4.jpg"],
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await usersCollection.insertOne(defaultUser)
    console.log("Default admin user created with ID:", result.insertedId)

    // Create some meta data for the user
    const userMetaCollection = db.collection("nx_users_meta")

    const metaData = [
      {
        nx_users: result.insertedId,
        title: "fbname",
        content: "Facebook",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        nx_users: result.insertedId,
        title: "fblink",
        content: "#",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        nx_users: result.insertedId,
        title: "fbcolor",
        content: "#000",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]

    await userMetaCollection.insertMany(metaData)
    console.log("User meta data created")
  } catch (error) {
    console.error("Error creating default user:", error)
  } finally {
    await client.close()
    console.log("MongoDB connection closed")
  }
}

// Run the script
createDefaultUser()
