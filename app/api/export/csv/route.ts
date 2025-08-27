import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import { getDatabase } from "@/lib/mongodb"

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

    const db = await getDatabase()
    const candidates = await db.collection("candidates").find({}).sort({ appliedDate: -1 }).toArray()

    // Create CSV content
    const headers = [
      "Name",
      "Email",
      "Phone",
      "Role",
      "Experience (Years)",
      "Status",
      "Applied Date",
      "Last Updated",
      "Has Resume",
      "Notes",
    ]

    const csvRows = [headers.join(",")]

    candidates.forEach((candidate) => {
      const row = [
        `"${candidate.name}"`,
        `"${candidate.email}"`,
        `"${candidate.phone || ""}"`,
        `"${candidate.role}"`,
        candidate.experience.toString(),
        `"${candidate.status}"`,
        `"${new Date(candidate.appliedDate).toLocaleDateString()}"`,
        `"${new Date(candidate.lastUpdated).toLocaleDateString()}"`,
        candidate.resumeUrl ? "Yes" : "No",
        `"${(candidate.notes || "").replace(/"/g, '""')}"`,
      ]
      csvRows.push(row.join(","))
    })

    const csvContent = csvRows.join("\n")
    const buffer = Buffer.from(csvContent, "utf-8")

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": "attachment; filename=candidates-data.csv",
      },
    })
  } catch (error) {
    console.error("Error generating CSV:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
