const { MongoClient } = require("mongodb")
const bcrypt = require("bcryptjs")

async function seedDatabase() {
  const client = new MongoClient(process.env.MONGODB_URI)

  try {
    console.log("Connecting to MongoDB...")
    await client.connect()
    console.log("Connected to MongoDB successfully")

    const db = client.db()

    // Clear existing users
    console.log("Clearing existing users...")
    await db.collection("users").deleteMany({})

    // Create demo users with hashed passwords
    console.log("Creating demo users...")
    const users = [
      {
        email: "admin@company.com",
        password: await bcrypt.hash("admin123", 10),
        name: "Admin User",
        role: "admin",
        createdAt: new Date(),
      },
      {
        email: "recruiter@company.com",
        password: await bcrypt.hash("recruiter123", 10),
        name: "Recruiter User",
        role: "recruiter",
        createdAt: new Date(),
      },
    ]

    const result = await db.collection("users").insertMany(users)
    console.log(`Created ${result.insertedCount} users`)

    // Verify users were created
    const userCount = await db.collection("users").countDocuments()
    console.log(`Total users in database: ${userCount}`)

    // List all users (without passwords)
    const allUsers = await db
      .collection("users")
      .find({}, { projection: { password: 0 } })
      .toArray()
    console.log("Users in database:", allUsers)

    console.log("Database seeded successfully!")
    console.log("\nDemo credentials:")
    console.log("Admin: admin@company.com / admin123")
    console.log("Recruiter: recruiter@company.com / recruiter123")
  } catch (error) {
    console.error("Error seeding database:", error)
  } finally {
    await client.close()
  }
}

seedDatabase()
