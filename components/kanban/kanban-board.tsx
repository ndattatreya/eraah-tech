"use client"

import { useState } from "react"
import {
  DndContext,
  type DragEndEvent,
  DragOverlay,
  type DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { KanbanColumn } from "./kanban-column"
import { CandidateCard } from "./candidate-card"
import type { Candidate } from "@/lib/types"

const COLUMNS = [
  { id: "applied", title: "Applied", color: "bg-blue-100 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800" },
  {
    id: "interview",
    title: "Interview",
    color: "bg-yellow-100 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800",
  },
  { id: "offer", title: "Offer", color: "bg-green-100 border-green-200 dark:bg-green-900/20 dark:border-green-800" },
  { id: "rejected", title: "Rejected", color: "bg-red-100 border-red-200 dark:bg-red-900/20 dark:border-red-800" },
] as const

interface KanbanBoardProps {
  candidates: Candidate[]
  onUpdateCandidate: (candidateId: string, status: Candidate["status"]) => Promise<void>
  onRefresh?: () => void
  searchTerm?: string
  roleFilter?: string
  experienceFilter?: string
  sortBy?: string
}

export function KanbanBoard({
  candidates,
  onUpdateCandidate,
  onRefresh,
  searchTerm = "",
  roleFilter = "all",
  experienceFilter = "all",
  sortBy = "name",
}: KanbanBoardProps) {
  const [activeCandidate, setActiveCandidate] = useState<Candidate | null>(null)
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }))

  const getFilteredAndSortedCandidates = () => {
    let filtered = candidates

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (candidate) =>
          candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          candidate.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          candidate.role.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Apply role filter
    if (roleFilter !== "all") {
      filtered = filtered.filter((candidate) => candidate.role === roleFilter)
    }

    // Apply experience filter
    if (experienceFilter !== "all") {
      filtered = filtered.filter((candidate) => {
        const experience = candidate.experience
        switch (experienceFilter) {
          case "0-2":
            return experience >= 0 && experience <= 2
          case "3-5":
            return experience >= 3 && experience <= 5
          case "6-10":
            return experience >= 6 && experience <= 10
          case "10+":
            return experience > 10
          default:
            return true
        }
      })
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name)
        case "name-desc":
          return b.name.localeCompare(a.name)
        case "experience":
          return a.experience - b.experience
        case "experience-desc":
          return b.experience - a.experience
        case "date":
          return new Date(b.appliedDate).getTime() - new Date(a.appliedDate).getTime()
        case "date-desc":
          return new Date(a.appliedDate).getTime() - new Date(b.appliedDate).getTime()
        default:
          return 0
      }
    })

    return filtered
  }

  const handleDragStart = (event: DragStartEvent) => {
    const candidate = candidates.find((c) => c._id === event.active.id)
    setActiveCandidate(candidate || null)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveCandidate(null)

    if (!over) return

    const candidateId = active.id as string
    const newStatus = over.id as Candidate["status"]

    const candidate = candidates.find((c) => c._id === candidateId)
    if (!candidate || candidate.status === newStatus) return

    try {
      await onUpdateCandidate(candidateId, newStatus)
    } catch (error) {
      console.error("Failed to update candidate status:", error)
    }
  }

  const getCandidatesByStatus = (status: Candidate["status"]) => {
    const filteredCandidates = getFilteredAndSortedCandidates()
    const statusCandidates = filteredCandidates.filter((candidate) => candidate.status === status)

    console.log(
      `[v0] Candidates with status '${status}':`,
      statusCandidates.length,
      statusCandidates.map((c) => ({ id: c._id, name: c.name, status: c.status })),
    )

    return statusCandidates
  }

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="w-full">
        {/* Mobile: Horizontal scroll layout */}
        <div className="block lg:hidden">
          <div className="flex gap-4 overflow-x-auto pb-4 min-h-[600px]" style={{ scrollbarWidth: "thin" }}>
            {COLUMNS.map((column) => {
              const columnCandidates = getCandidatesByStatus(column.id)
              return (
                <div key={column.id} className="flex-shrink-0 w-72">
                  <KanbanColumn
                    id={column.id}
                    title={column.title}
                    color={column.color}
                    count={columnCandidates.length}
                  >
                    <SortableContext items={columnCandidates.map((c) => c._id!)} strategy={verticalListSortingStrategy}>
                      <div className="space-y-3">
                        {columnCandidates.map((candidate) => (
                          <CandidateCard key={candidate._id} candidate={candidate} onCandidateUpdated={onRefresh} />
                        ))}
                      </div>
                    </SortableContext>
                  </KanbanColumn>
                </div>
              )
            })}
          </div>
        </div>

        {/* Desktop: Grid layout */}
        <div className="hidden lg:grid lg:grid-cols-4 gap-6 h-full">
          {COLUMNS.map((column) => {
            const columnCandidates = getCandidatesByStatus(column.id)
            return (
              <KanbanColumn
                key={column.id}
                id={column.id}
                title={column.title}
                color={column.color}
                count={columnCandidates.length}
              >
                <SortableContext items={columnCandidates.map((c) => c._id!)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-3">
                    {columnCandidates.map((candidate) => (
                      <CandidateCard key={candidate._id} candidate={candidate} onCandidateUpdated={onRefresh} />
                    ))}
                  </div>
                </SortableContext>
              </KanbanColumn>
            )
          })}
        </div>
      </div>

      <DragOverlay>{activeCandidate ? <CandidateCard candidate={activeCandidate} isDragging /> : null}</DragOverlay>
    </DndContext>
  )
}
