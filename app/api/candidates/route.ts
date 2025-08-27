import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { verifyToken } from "@/lib/auth"
import type { Candidate } from "@/lib/types"

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const db = await getDatabase()
    const candidates = await db.collection("candidates").find({}).sort({ appliedDate: -1 }).toArray()

    return NextResponse.json(candidates)
  } catch (error) {
    console.error("Error fetching candidates:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const candidateData = await request.json()
    const db = await getDatabase()

    const newCandidate: Omit<Candidate, "_id"> = {
      ...candidateData,
      appliedDate: new Date(),
      lastUpdated: new Date(),
    }

    const result = await db.collection("candidates").insertOne(newCandidate)
    const candidate = { ...newCandidate, _id: result.insertedId.toString() }

    return NextResponse.json(candidate, { status: 201 })
  } catch (error) {
    console.error("Error creating candidate:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
