"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Upload, X } from "lucide-react"
import type { Candidate } from "@/lib/types"

interface AddCandidateDialogProps {
  onAddCandidate: (candidate: Omit<Candidate, "_id" | "appliedDate" | "lastUpdated">) => Promise<void>
}

export function AddCandidateDialog({ onAddCandidate }: AddCandidateDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "",
    experience: 0,
    status: "applied" as Candidate["status"],
    notes: "",
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type === "application/pdf") {
      setResumeFile(file)
    } else {
      alert("Please select a PDF file")
    }
  }

  const removeFile = () => {
    setResumeFile(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      let resumeData = {}
      if (resumeFile) {
        const formDataUpload = new FormData()
        formDataUpload.append("resume", resumeFile)
        formDataUpload.append("candidateName", formData.name)

        const uploadResponse = await fetch("/api/upload/resume", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: formDataUpload,
        })

        if (uploadResponse.ok) {
          const uploadResult = await uploadResponse.json()
          resumeData = {
            resumeUrl: uploadResult.url,
            resumeFileName: resumeFile.name,
          }
        }
      }

      await onAddCandidate({ ...formData, ...resumeData })
      setFormData({
        name: "",
        email: "",
        phone: "",
        role: "",
        experience: 0,
        status: "applied",
        notes: "",
      })
      setResumeFile(null)
      setOpen(false)
    } catch (error) {
      console.error("Failed to add candidate:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="text-sm">
          <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
          <span className="hidden sm:inline">Add Candidate</span>
          <span className="sm:hidden">Add</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[95vw] max-w-[500px] sm:max-w-[600px] max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">Add New Candidate</DialogTitle>
          <DialogDescription className="text-sm">
            Add a new candidate to the applicant tracking system.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">
                Full Name
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-medium">
                Phone
              </Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="experience" className="text-sm font-medium">
                Experience (years)
              </Label>
              <Input
                id="experience"
                type="number"
                min="0"
                value={formData.experience}
                onChange={(e) => setFormData({ ...formData, experience: Number.parseInt(e.target.value) || 0 })}
                required
                className="text-sm"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="role" className="text-sm font-medium">
              Role
            </Label>
            <Input
              id="role"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              placeholder="e.g., Frontend Developer, UX Designer"
              required
              className="text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status" className="text-sm font-medium">
              Initial Status
            </Label>
            <Select
              value={formData.status}
              onValueChange={(value) => setFormData({ ...formData, status: value as Candidate["status"] })}
            >
              <SelectTrigger className="text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="applied">Applied</SelectItem>
                <SelectItem value="interview">Interview</SelectItem>
                <SelectItem value="offer">Offer</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="resume" className="text-sm font-medium">
              Resume (PDF)
            </Label>
            {!resumeFile ? (
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 sm:p-6 text-center">
                <Upload className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-xs sm:text-sm text-muted-foreground mb-2">Upload candidate resume</p>
                <Input id="resume" type="file" accept=".pdf" onChange={handleFileChange} className="hidden" />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById("resume")?.click()}
                  className="text-xs sm:text-sm"
                >
                  Choose PDF File
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/50">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 bg-red-100 rounded flex items-center justify-center">
                    <span className="text-xs font-medium text-red-600">PDF</span>
                  </div>
                  <span className="text-xs sm:text-sm font-medium truncate">{resumeFile.name}</span>
                </div>
                <Button type="button" variant="ghost" size="sm" onClick={removeFile}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes" className="text-sm font-medium">
              Notes
            </Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional notes about the candidate..."
              rows={3}
              className="text-sm resize-none"
            />
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="w-full sm:w-auto text-sm">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="w-full sm:w-auto text-sm">
              {loading ? "Adding..." : "Add Candidate"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
