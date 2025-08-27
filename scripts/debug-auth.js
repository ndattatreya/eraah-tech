import { MongoClient } from "mongodb"
import bcrypt from "bcryptjs"

const uri = process.env.MONGODB_URI

async function debugAuth() {
  console.log("[v0] Starting authentication debug...")

  if (!uri) {
    console.error("[v0] MONGODB_URI environment variable is not set!")
    return
  }

  try {
    // Test database connection
    console.log("[v0] Connecting to MongoDB...")
    const client = new MongoClient(uri)
    await client.connect()
    console.log("[v0] MongoDB connection successful")

    const db = client.db("mini-ats")

    // Check if users collection exists and has data
    console.log("[v0] Checking users collection...")
    const userCount = await db.collection("users").countDocuments()
    console.log(`[v0] Total users in database: ${userCount}`)

    // List all users
    const users = await db.collection("users").find({}).toArray()
    console.log("[v0] Users in database:")
    users.forEach((user) => {
      console.log(`  - Email: ${user.email}, Role: ${user.role}, Has Password: ${!!user.password}`)
    })

    // Test specific demo credentials
    const testEmails = ["admin@ats.com", "recruiter@ats.com"]

    for (const email of testEmails) {
      console.log(`\n[v0] Testing credentials for: ${email}`)
      const user = await db.collection("users").findOne({ email })

      if (user) {
        console.log(`[v0] User found: ${user.email}`)
        console.log(`[v0] User role: ${user.role}`)
        console.log(`[v0] Has password: ${!!user.password}`)

        if (user.password) {
          // Test password verification
          const testPassword = email === "admin@ats.com" ? "admin123" : "recruiter123"
          const isValid = await bcrypt.compare(testPassword, user.password)
          console.log(`[v0] Password "${testPassword}" is valid: ${isValid}`)
        }
      } else {
        console.log(`[v0] User not found: ${email}`)
      }
    }

    await client.close()
    console.log("[v0] Debug complete")
  } catch (error) {
    console.error("[v0] Debug error:", error)
  }
}

debugAuth()
