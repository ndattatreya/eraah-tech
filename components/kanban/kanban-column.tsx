import type React from "react"
import { useDroppable } from "@dnd-kit/core"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface KanbanColumnProps {
  id: string
  title: string
  color: string
  count: number
  children: React.ReactNode
}

export function KanbanColumn({ id, title, color, count, children }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id })

  return (
    <Card className={`h-full ${isOver ? "ring-2 ring-primary" : ""}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-sm font-medium">
          <span>{title}</span>
          <Badge variant="secondary" className="text-xs">
            {count}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div
          ref={setNodeRef}
          className={`min-h-[500px] p-2 rounded-lg border-2 border-dashed transition-colors ${color} ${
            isOver ? "border-primary bg-primary/5" : ""
          }`}
        >
          {children}
        </div>
      </CardContent>
    </Card>
  )
}
