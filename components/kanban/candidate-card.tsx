"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { CalendarDays, Mail, Phone, User, FileText, Edit } from "lucide-react"
import type { Candidate } from "@/lib/types"
import { ResumePreviewDialog } from "../resume/resume-preview-dialog"
import { EditCandidateDialog } from "../candidates/edit-candidate-dialog"
import { useState } from "react"

interface CandidateCardProps {
  candidate: Candidate
  isDragging?: boolean
  onCandidateUpdated?: () => void
}

export function CandidateCard({ candidate, isDragging = false, onCandidateUpdated }: CandidateCardProps) {
  const [showResumePreview, setShowResumePreview] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({
    id: candidate._id!,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging || isSortableDragging ? 0.5 : 1,
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })
  }

  return (
    <>
      <Card
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className={`cursor-grab active:cursor-grabbing transition-shadow hover:shadow-md ${
          isDragging ? "shadow-lg" : ""
        }`}
      >
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                {getInitials(candidate.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-sm truncate">{candidate.name}</h3>
              <p className="text-xs text-muted-foreground truncate">{candidate.role}</p>
            </div>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={(e) => {
                  e.stopPropagation()
                  setShowEditDialog(true)
                }}
              >
                <Edit className="h-4 w-4 text-muted-foreground hover:text-primary" />
              </Button>
              {candidate.resumeUrl && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowResumePreview(true)
                  }}
                >
                  <FileText className="h-4 w-4 text-primary" />
                </Button>
              )}
            </div>
          </div>

          <div className="mt-3 space-y-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Mail className="h-3 w-3" />
              <span className="truncate">{candidate.email}</span>
            </div>
            {candidate.phone && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Phone className="h-3 w-3" />
                <span>{candidate.phone}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <User className="h-3 w-3" />
              <span>{candidate.experience} years exp.</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <CalendarDays className="h-3 w-3" />
              <span>Applied {formatDate(candidate.appliedDate)}</span>
            </div>
          </div>

          {candidate.resumeUrl && (
            <div className="mt-3 flex items-center gap-2 text-xs text-primary">
              <FileText className="h-3 w-3" />
              <span>Resume attached</span>
            </div>
          )}

          {candidate.notes && (
            <div className="mt-3 p-2 bg-muted rounded text-xs">
              <p className="line-clamp-2">{candidate.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {candidate.resumeUrl && (
        <ResumePreviewDialog open={showResumePreview} onOpenChange={setShowResumePreview} candidate={candidate} />
      )}

      <EditCandidateDialog
        candidate={candidate}
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        onCandidateUpdated={() => {
          onCandidateUpdated?.()
        }}
      />
    </>
  )
}
