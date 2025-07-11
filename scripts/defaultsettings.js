const { MongoClient } = require("mongodb")

const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://heraemt24:Z3V0hj8XHt26gn7n@cluster0.jn1hu.mongodb.net"
const DB_NAME = "nx_cms"

async function createDefaultSettings() {
  const client = new MongoClient(MONGODB_URI)

  try {
    await client.connect()
    console.log("Connected to MongoDB")

    const db = client.db(DB_NAME)
    const settingsCollection = db.collection("nx_settings")

    // Check if settings already exist
    const existingSettings = await settingsCollection.findOne({ title: "logo" })

    if (existingSettings) {
      console.log("Default settings already exist")
      return
    }

    // Create default settings
    const defaultSettings = [
      {
        title: "logo",
        content: "NX CMS",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        title: "siteurl",
        content: "#",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        title: "site_title",
        content: "Welcome to NX CMS",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        title: "site_description",
        content: "A powerful content management system built with Next.js 15, TypeScript, and MongoDB.",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        title: "contact_email",
        content: "admin@example.com",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        title: "phone",
        content: "01781077094",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        title: "QnA",
        content: [
          {
            question: "What is NX CMS?",
            answer: "NX CMS is a powerful content management system built with Next.js 15, TypeScript, and MongoDB.",
          },
          {
            question: "How do I get started?",
            answer:
              "Simply sign up for an account and start creating content. Admin users can access the admin panel to manage users and settings.",
          },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]

    await settingsCollection.insertMany(defaultSettings)
    console.log("Default settings created successfully")
  } catch (error) {
    console.error("Error creating default settings:", error)
  } finally {
    await client.close()
    console.log("MongoDB connection closed")
  }
}

// Run the script
createDefaultSettings()
