import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { verifyToken } from "@/lib/auth"
import type { Analytics } from "@/lib/types"

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
    const candidates = await db.collection("candidates").find({}).toArray()

    // Calculate analytics
    const totalApplications = candidates.length

    const applicationsByStatus = {
      applied: candidates.filter((c) => c.status === "applied").length,
      interview: candidates.filter((c) => c.status === "interview").length,
      offer: candidates.filter((c) => c.status === "offer").length,
      rejected: candidates.filter((c) => c.status === "rejected").length,
    }

    const applicationsByRole = candidates.reduce(
      (acc, candidate) => {
        acc[candidate.role] = (acc[candidate.role] || 0) + 1
        return acc
      },
      {} as { [key: string]: number },
    )

    const averageExperience =
      candidates.length > 0 ? candidates.reduce((sum, c) => sum + c.experience, 0) / candidates.length : 0

    const recentApplications = candidates
      .sort((a, b) => new Date(b.appliedDate).getTime() - new Date(a.appliedDate).getTime())
      .slice(0, 5)

    const analytics: Analytics = {
      totalApplications,
      applicationsByStatus,
      applicationsByRole,
      averageExperience: Math.round(averageExperience * 10) / 10,
      recentApplications,
    }

    return NextResponse.json(analytics)
  } catch (error) {
    console.error("Error fetching analytics:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
