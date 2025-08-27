const { MongoClient } = require("mongodb")
const bcrypt = require("bcryptjs")

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/mini-ats"

async function createTestUsers() {
  const client = new MongoClient(MONGODB_URI)

  try {
    console.log("Connecting to MongoDB...")
    await client.connect()
    console.log("Connected successfully")

    const db = client.db()

    // Clear existing users
    console.log("Clearing existing users...")
    await db.collection("users").deleteMany({})

    // Hash passwords
    const adminPassword = await bcrypt.hash("admin123", 12)
    const recruiterPassword = await bcrypt.hash("recruiter123", 12)

    // Create test users
    const users = [
      {
        email: "admin@company.com",
        password: adminPassword,
        name: "Admin User",
        role: "admin",
        createdDate: new Date(),
      },
      {
        email: "recruiter@company.com",
        password: recruiterPassword,
        name: "Recruiter User",
        role: "recruiter",
        createdDate: new Date(),
      },
    ]

    console.log("Creating test users...")
    const result = await db.collection("users").insertMany(users)
    console.log(`Created ${result.insertedCount} users`)

    // Verify users were created
    const createdUsers = await db.collection("users").find({}).toArray()
    console.log("Verification - Users in database:")
    createdUsers.forEach((user) => {
      console.log(`- ${user.email} (${user.role}) - Has password: ${!!user.password}`)
    })
  } catch (error) {
    console.error("Error creating test users:", error)
  } finally {
    await client.close()
    console.log("Database connection closed")
  }
}

createTestUsers()
