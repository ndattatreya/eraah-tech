"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Download, FileText, ImageIcon, Table } from "lucide-react"
import type { Analytics } from "@/lib/types"

interface ExportControlsProps {
  analytics: Analytics
}

export function ExportControls({ analytics }: ExportControlsProps) {
  const [loading, setLoading] = useState<string | null>(null)

  const handlePngExport = async () => {
    setLoading("png")
    try {
      // Use html2canvas to capture the analytics dashboard
      const html2canvas = (await import("html2canvas")).default
      const dashboardElement = document.querySelector("[data-analytics-dashboard]") as HTMLElement

      if (dashboardElement) {
        const canvas = await html2canvas(dashboardElement, {
          backgroundColor: "#ffffff",
          scale: 2,
          useCORS: true,
        })

        // Convert canvas to blob and download
        canvas.toBlob((blob) => {
          if (blob) {
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement("a")
            a.href = url
            const timestamp = new Date().toISOString().split("T")[0]
            a.download = `analytics-dashboard-${timestamp}.png`
            document.body.appendChild(a)
            a.click()
            window.URL.revokeObjectURL(url)
            document.body.removeChild(a)
          }
        }, "image/png")
      }
    } catch (error) {
      console.error("PNG export error:", error)
    } finally {
      setLoading(null)
    }
  }

  const handleExport = async (type: "pdf" | "csv") => {
    setLoading(type)
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/export/${type}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ analytics }),
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url

        const timestamp = new Date().toISOString().split("T")[0]
        let filename = ""

        switch (type) {
          case "pdf":
            filename = `analytics-report-${timestamp}.pdf`
            break
          case "csv":
            filename = `candidates-data-${timestamp}.csv`
            break
        }

        a.download = filename
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } else {
        console.error("Export failed")
      }
    } catch (error) {
      console.error("Export error:", error)
    } finally {
      setLoading(null)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleExport("pdf")} disabled={loading === "pdf"}>
          <FileText className="h-4 w-4 mr-2" />
          {loading === "pdf" ? "Generating PDF..." : "Export as PDF"}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handlePngExport} disabled={loading === "png"}>
          <ImageIcon className="h-4 w-4 mr-2" />
          {loading === "png" ? "Capturing PNG..." : "Export as PNG"}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport("csv")} disabled={loading === "csv"}>
          <Table className="h-4 w-4 mr-2" />
          {loading === "csv" ? "Generating CSV..." : "Export Candidates CSV"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
