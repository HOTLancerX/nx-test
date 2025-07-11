import { connectToDatabase } from "./db"

export async function Settings(): Promise<Record<string, any>> {
  try {
    const { db } = await connectToDatabase()
    const settingsData = await db.collection("nx_settings").find({}).toArray()

    const settings: Record<string, any> = {}

    settingsData.forEach((setting) => {
      settings[setting.title] = setting.content
    })

    return settings
  } catch (error) {
    console.error("Error fetching settings:", error)
    return {}
  }
}

export async function getSetting(title: string): Promise<any> {
  try {
    const { db } = await connectToDatabase()
    const setting = await db.collection("nx_settings").findOne({ title })
    return setting ? setting.content : null
  } catch (error) {
    console.error("Error fetching setting:", error)
    return null
  }
}

export async function setSetting(title: string, content: any): Promise<boolean> {
  try {
    const { db } = await connectToDatabase()
    await db.collection("nx_settings").updateOne(
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
      { upsert: true },
    )
    return true
  } catch (error) {
    console.error("Error setting setting:", error)
    return false
  }
}
