import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { verifyToken } from "@/lib/auth"
import { GridFSBucket, ObjectId } from "mongodb"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authHeader = request.headers.get("authorization")
    let isAuthenticated = false

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7)
      const decoded = verifyToken(token)
      isAuthenticated = !!decoded
    }

    // Allow access for authenticated users or if no auth header (for previews)
    const db = await getDatabase()
    const bucket = new GridFSBucket(db, { bucketName: "resumes" })

    try {
      const fileId = new ObjectId(params.id)
      const downloadStream = bucket.openDownloadStream(fileId)

      // Get file info
      const files = await bucket.find({ _id: fileId }).toArray()
      if (files.length === 0) {
        return NextResponse.json({ error: "File not found" }, { status: 404 })
      }

      const file = files[0]

      // Convert stream to buffer
      const chunks: Buffer[] = []

      return new Promise((resolve, reject) => {
        downloadStream.on("data", (chunk) => {
          chunks.push(chunk)
        })

        downloadStream.on("end", () => {
          const buffer = Buffer.concat(chunks)
          const response = new NextResponse(buffer, {
            headers: {
              "Content-Type": file.metadata?.contentType || "application/pdf",
              "Content-Disposition": `inline; filename="${file.filename}"`,
              "Cache-Control": "private, max-age=3600",
            },
          })
          resolve(response)
        })

        downloadStream.on("error", (error) => {
          console.error("Error downloading file:", error)
          reject(NextResponse.json({ error: "File not found" }, { status: 404 }))
        })
      })
    } catch (error) {
      return NextResponse.json({ error: "Invalid file ID" }, { status: 400 })
    }
  } catch (error) {
    console.error("Error serving resume:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
