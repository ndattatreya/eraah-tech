// Seed Database with Sample Data for Mini ATS
import { MongoClient } from "mongodb"
import { hash } from "bcryptjs"

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017"
const DB_NAME = "mini-ats"

const sampleCandidates = [
  {
    name: "Sarah Johnson",
    email: "sarah.johnson@email.com",
    phone: "+1-555-0123",
    role: "Frontend Developer",
    experience: 3,
    status: "applied",
    appliedDate: new Date("2024-01-15"),
    lastUpdated: new Date("2024-01-15"),
    notes: "Strong React and TypeScript skills",
  },
  {
    name: "Michael Chen",
    email: "michael.chen@email.com",
    phone: "+1-555-0124",
    role: "Backend Developer",
    experience: 5,
    status: "interview",
    appliedDate: new Date("2024-01-10"),
    lastUpdated: new Date("2024-01-20"),
    notes: "Excellent Node.js and database experience",
  },
  {
    name: "Emily Rodriguez",
    email: "emily.rodriguez@email.com",
    phone: "+1-555-0125",
    role: "UX Designer",
    experience: 4,
    status: "offer",
    appliedDate: new Date("2024-01-05"),
    lastUpdated: new Date("2024-01-25"),
    notes: "Outstanding portfolio and design thinking",
  },
  {
    name: "David Kim",
    email: "david.kim@email.com",
    phone: "+1-555-0126",
    role: "Full Stack Developer",
    experience: 2,
    status: "rejected",
    appliedDate: new Date("2024-01-12"),
    lastUpdated: new Date("2024-01-18"),
    notes: "Good skills but looking for more experience",
  },
  {
    name: "Lisa Wang",
    email: "lisa.wang@email.com",
    phone: "+1-555-0127",
    role: "Product Manager",
    experience: 6,
    status: "interview",
    appliedDate: new Date("2024-01-08"),
    lastUpdated: new Date("2024-01-22"),
    notes: "Strong leadership and product strategy background",
  },
]

const sampleJobs = [
  {
    title: "Senior Frontend Developer",
    department: "Engineering",
    location: "San Francisco, CA",
    type: "full-time",
    description: "We are looking for a senior frontend developer to join our team.",
    requirements: ["React", "TypeScript", "Next.js", "5+ years experience"],
    isActive: true,
    createdDate: new Date("2024-01-01"),
    applications: 12,
  },
  {
    title: "UX Designer",
    department: "Design",
    location: "Remote",
    type: "full-time",
    description: "Join our design team to create amazing user experiences.",
    requirements: ["Figma", "User Research", "Prototyping", "3+ years experience"],
    isActive: true,
    createdDate: new Date("2024-01-03"),
    applications: 8,
  },
  {
    title: "Product Manager",
    department: "Product",
    location: "New York, NY",
    type: "full-time",
    description: "Lead product strategy and development for our core platform.",
    requirements: ["Product Strategy", "Agile", "Analytics", "4+ years experience"],
    isActive: true,
    createdDate: new Date("2024-01-05"),
    applications: 15,
  },
]

async function seedDatabase() {
  const client = new MongoClient(MONGODB_URI)

  try {
    await client.connect()
    console.log("Connected to MongoDB for seeding")

    const db = client.db(DB_NAME)

    // Clear existing data
    await db.collection("candidates").deleteMany({})
    await db.collection("jobs").deleteMany({})
    await db.collection("users").deleteMany({})

    // Insert sample data
    await db.collection("candidates").insertMany(sampleCandidates)
    console.log(`Inserted ${sampleCandidates.length} candidates`)

    await db.collection("jobs").insertMany(sampleJobs)
    console.log(`Inserted ${sampleJobs.length} jobs`)

    const usersWithHashedPasswords = [
      {
        email: "admin@company.com",
        name: "Admin User",
        role: "admin",
        password: await hash("admin123", 12),
        createdDate: new Date("2024-01-01"),
      },
      {
        email: "recruiter@company.com",
        name: "Jane Recruiter",
        role: "recruiter",
        password: await hash("recruiter123", 12),
        createdDate: new Date("2024-01-01"),
      },
    ]

    await db.collection("users").insertMany(usersWithHashedPasswords)
    console.log(`Inserted ${usersWithHashedPasswords.length} users`)

    console.log("Database seeded successfully!")
    console.log("Demo credentials:")
    console.log("Admin: admin@company.com / admin123")
    console.log("Recruiter: recruiter@company.com / recruiter123")
  } catch (error) {
    console.error("Error seeding database:", error)
  } finally {
    await client.close()
  }
}

seedDatabase()
