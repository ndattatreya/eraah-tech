"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Download, ExternalLink } from "lucide-react"
import type { Candidate } from "@/lib/types"

interface ResumePreviewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  candidate: Candidate
}

export function ResumePreviewDialog({ open, onOpenChange, candidate }: ResumePreviewDialogProps) {
  const [loading, setLoading] = useState(false)

  const handleDownload = async () => {
    if (!candidate.resumeUrl) return

    setLoading(true)
    try {
      const response = await fetch(candidate.resumeUrl, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = candidate.resumeFileName || `${candidate.name}_resume.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      console.error("Failed to download resume:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenInNewTab = () => {
    if (candidate.resumeUrl) {
      window.open(candidate.resumeUrl, "_blank")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] sm:max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Resume - {candidate.name}</DialogTitle>
          <DialogDescription>{candidate.resumeFileName && `File: ${candidate.resumeFileName}`}</DialogDescription>
        </DialogHeader>

        <div className="flex gap-2 mb-4">
          <Button variant="outline" size="sm" onClick={handleDownload} disabled={loading}>
            <Download className="h-4 w-4 mr-2" />
            {loading ? "Downloading..." : "Download"}
          </Button>
          <Button variant="outline" size="sm" onClick={handleOpenInNewTab}>
            <ExternalLink className="h-4 w-4 mr-2" />
            Open in New Tab
          </Button>
        </div>

        <div className="border rounded-lg overflow-hidden bg-muted/50">
          {candidate.resumeUrl ? (
            <iframe
              src={`${candidate.resumeUrl}#toolbar=0`}
              className="w-full h-[600px]"
              title={`Resume - ${candidate.name}`}
            />
          ) : (
            <div className="flex items-center justify-center h-[400px] text-muted-foreground">
              <p>No resume available</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
