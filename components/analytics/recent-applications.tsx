import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import type { Candidate } from "@/lib/types"

interface RecentApplicationsProps {
  candidates: Candidate[]
}

export function RecentApplications({ candidates }: RecentApplicationsProps) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  const getStatusColor = (status: Candidate["status"]) => {
    switch (status) {
      case "applied":
        return "bg-blue-100 text-blue-800"
      case "interview":
        return "bg-yellow-100 text-yellow-800"
      case "offer":
        return "bg-green-100 text-green-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  if (candidates.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No recent applications found</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {candidates.map((candidate) => (
        <div key={candidate._id} className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                {getInitials(candidate.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{candidate.name}</p>
              <p className="text-sm text-muted-foreground">{candidate.role}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge className={getStatusColor(candidate.status)} variant="secondary">
              {candidate.status}
            </Badge>
            <span className="text-sm text-muted-foreground">{formatDate(candidate.appliedDate)}</span>
          </div>
        </div>
      ))}
    </div>
  )
}
