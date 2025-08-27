import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { verifyToken } from "@/lib/auth"
import { ObjectId } from "mongodb"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
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
    const candidate = await db.collection("candidates").findOne({ _id: new ObjectId(params.id) })

    if (!candidate) {
      return NextResponse.json({ error: "Candidate not found" }, { status: 404 })
    }

    return NextResponse.json(candidate)
  } catch (error) {
    console.error("Error fetching candidate:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
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

    const { status } = await request.json()

    console.log(`[v0] Updating candidate ${params.id} to status: ${status}`)

    const db = await getDatabase()

    const result = await db.collection("candidates").updateOne(
      { _id: new ObjectId(params.id) },
      {
        $set: {
          status,
          lastUpdated: new Date(),
        },
      },
    )

    if (result.matchedCount === 0) {
      console.log(`[v0] Candidate ${params.id} not found`)
      return NextResponse.json({ error: "Candidate not found" }, { status: 404 })
    }

    console.log(`[v0] Successfully updated candidate ${params.id} status to ${status}`)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating candidate:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
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

    const updateData = await request.json()
    const db = await getDatabase()

    // Remove _id from update data if present
    delete updateData._id

    const result = await db.collection("candidates").updateOne(
      { _id: new ObjectId(params.id) },
      {
        $set: {
          ...updateData,
          lastUpdated: new Date(),
        },
      },
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Candidate not found" }, { status: 404 })
    }

    // Return the updated candidate
    const updatedCandidate = await db.collection("candidates").findOne({ _id: new ObjectId(params.id) })

    return NextResponse.json(updatedCandidate)
  } catch (error) {
    console.error("Error updating candidate:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
