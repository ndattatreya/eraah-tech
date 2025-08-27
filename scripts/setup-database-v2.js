// MongoDB Database Setup Script v2 - Added GridFS for file storage
import { MongoClient } from "mongodb"

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017"
const DB_NAME = "mini-ats"

async function setupDatabase() {
  const client = new MongoClient(MONGODB_URI)

  try {
    await client.connect()
    console.log("Connected to MongoDB")

    const db = client.db(DB_NAME)

    // Create collections
    const collections = ["candidates", "jobs", "users"]

    for (const collectionName of collections) {
      try {
        await db.createCollection(collectionName)
        console.log(`Created collection: ${collectionName}`)
      } catch (error) {
        if (error.code === 48) {
          console.log(`Collection ${collectionName} already exists`)
        } else {
          throw error
        }
      }
    }

    // Create GridFS collections for file storage
    try {
      await db.createCollection("resumes.files")
      await db.createCollection("resumes.chunks")
      console.log("Created GridFS collections for resume storage")
    } catch (error) {
      if (error.code === 48) {
        console.log("GridFS collections already exist")
      } else {
        throw error
      }
    }

    // Create indexes for better performance
    await db.collection("candidates").createIndex({ email: 1 }, { unique: true })
    await db.collection("candidates").createIndex({ status: 1 })
    await db.collection("candidates").createIndex({ role: 1 })
    await db.collection("candidates").createIndex({ appliedDate: -1 })

    await db.collection("jobs").createIndex({ title: 1 })
    await db.collection("jobs").createIndex({ isActive: 1 })

    await db.collection("users").createIndex({ email: 1 }, { unique: true })

    // GridFS indexes
    await db.collection("resumes.files").createIndex({ filename: 1 })
    await db.collection("resumes.files").createIndex({ "metadata.candidateName": 1 })

    console.log("Database indexes created successfully")
  } catch (error) {
    console.error("Error setting up database:", error)
  } finally {
    await client.close()
  }
}

setupDatabase()
