import { type NextRequest, NextResponse } from "next/server"
import { getUserByEmail, generateToken, verifyPassword } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    console.log("[v0] Login attempt for email:", email)

    if (!email || !password) {
      console.log("[v0] Missing email or password")
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    const demoCredentials = {
      "admin@company.com": { password: "admin123", role: "admin", name: "Admin User" },
      "recruiter@company.com": { password: "recruiter123", role: "recruiter", name: "Recruiter User" },
    }

    // Check fallback credentials first
    if (demoCredentials[email as keyof typeof demoCredentials]) {
      const demoUser = demoCredentials[email as keyof typeof demoCredentials]
      if (password === demoUser.password) {
        console.log("[v0] Using fallback demo credentials for:", email)
        const user = {
          _id: email === "admin@company.com" ? "demo-admin-id" : "demo-recruiter-id",
          email,
          name: demoUser.name,
          role: demoUser.role,
        }
        const token = generateToken(user)
        return NextResponse.json({ token, user })
      }
    }

    // Try database authentication as backup
    try {
      console.log("[v0] Attempting to connect to database...")
      await connectToDatabase()
      console.log("[v0] Database connected successfully")

      console.log("[v0] Looking up user in database...")
      const user = await getUserByEmail(email)
      console.log("[v0] User lookup result:", user ? `Found user: ${user.email}` : "No user found")

      if (user && user.password) {
        console.log("[v0] Verifying password...")
        const isValidPassword = await verifyPassword(password, user.password)
        console.log("[v0] Password verification result:", isValidPassword)

        if (isValidPassword) {
          const token = generateToken(user)
          const { password: _, ...userWithoutPassword } = user as any
          console.log("[v0] Database login successful for:", email)
          return NextResponse.json({ token, user: userWithoutPassword })
        }
      }
    } catch (dbError) {
      console.log("[v0] Database authentication failed, using fallback only:", dbError)
    }

    console.log("[v0] All authentication methods failed")
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
  } catch (error) {
    console.error("[v0] Login error details:", error)
    console.error("[v0] Error stack:", error instanceof Error ? error.stack : "No stack trace")
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
