import { compare, hash } from "bcryptjs"
import { sign, verify } from "jsonwebtoken"
import { getDatabase } from "./mongodb"
import type { User } from "./types"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export async function hashPassword(password: string): Promise<string> {
  return await hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return await compare(password, hashedPassword)
}

export function generateToken(user: User): string {
  try {
    console.log("[v0] Generating token for user:", user.email)
    console.log("[v0] JWT_SECRET available:", !!JWT_SECRET)

    if (!JWT_SECRET || JWT_SECRET === "your-secret-key") {
      console.log("[v0] Warning: Using default JWT secret")
    }

    const token = sign(
      {
        userId: user._id,
        email: user.email,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: "7d" },
    )

    console.log("[v0] Token generated successfully")
    return token
  } catch (error) {
    console.error("[v0] Error generating JWT token:", error)
    throw new Error("Failed to generate authentication token")
  }
}

export function verifyToken(token: string): any {
  try {
    return verify(token, JWT_SECRET)
  } catch (error) {
    return null
  }
}

export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    console.log("[v0] Attempting to get user by email:", email)
    const db = await getDatabase()
    console.log("[v0] Database connection successful")

    const user = await db.collection("users").findOne({ email })
    console.log("[v0] User query result:", user ? "Found user" : "No user found")

    if (user) {
      console.log("[v0] User details:", {
        email: user.email,
        role: user.role,
        hasPassword: !!user.password,
      })
    }

    return user as User | null
  } catch (error) {
    console.error("[v0] Error in getUserByEmail:", error)
    return null
  }
}

export async function createUser(userData: Omit<User, "_id" | "createdDate"> & { password: string }): Promise<User> {
  const db = await getDatabase()
  const hashedPassword = await hashPassword(userData.password)

  const newUser = {
    ...userData,
    password: hashedPassword,
    createdDate: new Date(),
  }

  const result = await db.collection("users").insertOne(newUser)
  return { ...newUser, _id: result.insertedId.toString() } as User
}
