import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { verifyToken } from "@/lib/auth"
import { GridFSBucket } from "mongodb"

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

    const formData = await request.formData()
    const file = formData.get("resume") as File
    const candidateName = formData.get("candidateName") as string

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json({ error: "Only PDF files are allowed" }, { status: 400 })
    }

    const db = await getDatabase()
    const bucket = new GridFSBucket(db, { bucketName: "resumes" })

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Create upload stream
    const uploadStream = bucket.openUploadStream(file.name, {
      metadata: {
        candidateName,
        uploadedBy: decoded.userId,
        uploadedAt: new Date(),
        contentType: file.type,
      },
    })

    // Upload file
    await new Promise((resolve, reject) => {
      uploadStream.end(buffer, (error) => {
        if (error) reject(error)
        else resolve(uploadStream.id)
      })
    })

    const fileUrl = `/api/files/resume/${uploadStream.id}`

    return NextResponse.json({
      url: fileUrl,
      filename: file.name,
      id: uploadStream.id.toString(),
    })
  } catch (error) {
    console.error("Error uploading resume:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
