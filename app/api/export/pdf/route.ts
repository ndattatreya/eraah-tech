import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import jsPDF from "jspdf"

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

    const { analytics } = await request.json()

    // Create PDF
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.width
    const margin = 20

    // Header
    doc.setFontSize(20)
    doc.setTextColor(234, 88, 12) // Primary color
    doc.text("Mini ATS - Analytics Report", margin, 30)

    doc.setFontSize(12)
    doc.setTextColor(75, 85, 99) // Muted color
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, margin, 45)

    // Key Metrics Section
    doc.setFontSize(16)
    doc.setTextColor(0, 0, 0)
    doc.text("Key Metrics", margin, 70)

    doc.setFontSize(12)
    let yPos = 85
    const metrics = [
      { label: "Total Applications", value: analytics.totalApplications.toString() },
      { label: "Average Experience", value: `${analytics.averageExperience} years` },
      {
        label: "Interview Rate",
        value: `${Math.round(
          ((analytics.applicationsByStatus.interview + analytics.applicationsByStatus.offer) /
            analytics.totalApplications) *
            100,
        )}%`,
      },
      {
        label: "Offer Rate",
        value: `${Math.round((analytics.applicationsByStatus.offer / analytics.totalApplications) * 100)}%`,
      },
    ]

    metrics.forEach((metric) => {
      doc.text(`${metric.label}: ${metric.value}`, margin, yPos)
      yPos += 15
    })

    // Applications by Status Section
    yPos += 20
    doc.setFontSize(16)
    doc.text("Applications by Status", margin, yPos)
    yPos += 15

    doc.setFontSize(12)
    Object.entries(analytics.applicationsByStatus).forEach(([status, count]) => {
      doc.text(`${status.charAt(0).toUpperCase() + status.slice(1)}: ${count}`, margin, yPos)
      yPos += 12
    })

    // Applications by Role Section
    yPos += 20
    doc.setFontSize(16)
    doc.text("Applications by Role", margin, yPos)
    yPos += 15

    doc.setFontSize(12)
    Object.entries(analytics.applicationsByRole).forEach(([role, count]) => {
      if (yPos > 250) {
        doc.addPage()
        yPos = 30
      }
      doc.text(`${role}: ${count}`, margin, yPos)
      yPos += 12
    })

    // Recent Applications Section
    if (analytics.recentApplications.length > 0) {
      yPos += 20
      if (yPos > 200) {
        doc.addPage()
        yPos = 30
      }

      doc.setFontSize(16)
      doc.text("Recent Applications", margin, yPos)
      yPos += 15

      doc.setFontSize(10)
      analytics.recentApplications.slice(0, 10).forEach((candidate) => {
        if (yPos > 270) {
          doc.addPage()
          yPos = 30
        }
        doc.text(
          `${candidate.name} - ${candidate.role} (${candidate.status}) - Applied: ${new Date(
            candidate.appliedDate,
          ).toLocaleDateString()}`,
          margin,
          yPos,
        )
        yPos += 10
      })
    }

    const pdfBuffer = Buffer.from(doc.output("arraybuffer"))

    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "attachment; filename=analytics-report.pdf",
      },
    })
  } catch (error) {
    console.error("Error generating PDF:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
