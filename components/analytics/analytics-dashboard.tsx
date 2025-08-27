"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { StatusChart } from "./status-chart"
import { RoleChart } from "./role-chart"
import { RecentApplications } from "./recent-applications"
import { StatCard } from "./stat-card"
import { ExportControls } from "./export-controls"
import { BarChart3, Users, TrendingUp, Clock } from "lucide-react"
import type { Analytics } from "@/lib/types"

interface AnalyticsDashboardProps {
  analytics: Analytics
}

export function AnalyticsDashboard({ analytics }: AnalyticsDashboardProps) {
  const conversionRate =
    analytics.totalApplications > 0
      ? Math.round((analytics.applicationsByStatus.offer / analytics.totalApplications) * 100)
      : 0

  const interviewRate =
    analytics.totalApplications > 0
      ? Math.round(
          ((analytics.applicationsByStatus.interview + analytics.applicationsByStatus.offer) /
            analytics.totalApplications) *
            100,
        )
      : 0

  return (
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-0" data-analytics-dashboard>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-semibold mb-1 sm:mb-2">Analytics Dashboard</h2>
          <p className="text-sm text-muted-foreground">Insights and metrics about your hiring pipeline</p>
        </div>
        <div className="w-full sm:w-auto">
          <ExportControls analytics={analytics} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          title="Total Applications"
          value={analytics.totalApplications.toString()}
          description="All time applications"
          icon={<Users className="h-4 w-4" />}
        />
        <StatCard
          title="Average Experience"
          value={`${analytics.averageExperience} years`}
          description="Candidate experience level"
          icon={<TrendingUp className="h-4 w-4" />}
        />
        <StatCard
          title="Interview Rate"
          value={`${interviewRate}%`}
          description="Applications to interview"
          icon={<BarChart3 className="h-4 w-4" />}
        />
        <StatCard
          title="Offer Rate"
          value={`${conversionRate}%`}
          description="Applications to offer"
          icon={<Clock className="h-4 w-4" />}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
        <Card>
          <CardHeader className="pb-3 sm:pb-6">
            <CardTitle className="text-base sm:text-lg">Applications by Status</CardTitle>
            <CardDescription className="text-sm">Current distribution of candidate statuses</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <StatusChart data={analytics.applicationsByStatus} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3 sm:pb-6">
            <CardTitle className="text-base sm:text-lg">Applications by Role</CardTitle>
            <CardDescription className="text-sm">Breakdown of applications by job role</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <RoleChart data={analytics.applicationsByRole} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3 sm:pb-6">
          <CardTitle className="text-base sm:text-lg">Recent Applications</CardTitle>
          <CardDescription className="text-sm">Latest candidates who applied</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <RecentApplications candidates={analytics.recentApplications} />
        </CardContent>
      </Card>
    </div>
  )
}
