"use client"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart3, Kanban } from "lucide-react"

interface NavTabsProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

export function NavTabs({ activeTab, onTabChange }: NavTabsProps) {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="kanban" className="flex items-center gap-2">
          <Kanban className="h-4 w-4" />
          Kanban Board
        </TabsTrigger>
        <TabsTrigger value="analytics" className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4" />
          Analytics
        </TabsTrigger>
      </TabsList>
    </Tabs>
  )
}
