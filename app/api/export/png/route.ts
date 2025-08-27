import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] PNG export API called")

    const body = await request.json()
    const { analytics } = body

    // Since we can't easily generate PNG server-side without complex setup,
    // we'll return a simple response and handle PNG generation client-side
    const response = {
      success: true,
      message: "Use client-side capture for PNG export",
      analytics,
    }

    return new NextResponse(JSON.stringify(response), {
      headers: {
        "Content-Type": "application/json",
      },
    })
  } catch (error) {
    console.error("[v0] PNG export error:", error)
    return NextResponse.json({ error: "Failed to prepare PNG export" }, { status: 500 })
  }
}
