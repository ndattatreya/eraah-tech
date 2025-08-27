"use client"
import { Search, Filter, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"

interface CandidateFiltersProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  roleFilter: string
  onRoleFilterChange: (value: string) => void
  experienceFilter: string
  onExperienceFilterChange: (value: string) => void
  sortBy: string
  onSortChange: (value: string) => void
  onClearFilters: () => void
  roles: string[]
}

export function CandidateFilters({
  searchTerm,
  onSearchChange,
  roleFilter,
  onRoleFilterChange,
  experienceFilter,
  onExperienceFilterChange,
  sortBy,
  onSortChange,
  onClearFilters,
  roles,
}: CandidateFiltersProps) {
  const hasActiveFilters = roleFilter !== "all" || experienceFilter !== "all" || searchTerm !== ""

  return (
    <div className="flex flex-col gap-4 p-3 sm:p-4 bg-card rounded-lg border">
      <div className="flex flex-col gap-3 sm:gap-4">
        {/* Search Input */}
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search candidates..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 text-sm sm:text-base"
          />
        </div>

        {/* Filter Controls */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 bg-transparent w-full sm:w-auto justify-center sm:justify-start"
              >
                <Filter className="h-4 w-4" />
                <span className="text-sm">Filters</span>
                {hasActiveFilters && (
                  <Badge variant="secondary" className="ml-1 px-1 py-0 text-xs">
                    {[roleFilter !== "all", experienceFilter !== "all", searchTerm !== ""].filter(Boolean).length}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 sm:w-96" align="end">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-sm sm:text-base">Filters</h4>
                  {hasActiveFilters && (
                    <Button variant="ghost" size="sm" onClick={onClearFilters} className="h-auto p-1 text-xs">
                      Clear all
                    </Button>
                  )}
                </div>

                {/* Role Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Role</label>
                  <Select value={roleFilter} onValueChange={onRoleFilterChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      {roles.map((role) => (
                        <SelectItem key={role} value={role}>
                          {role}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Experience Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Experience Level</label>
                  <Select value={experienceFilter} onValueChange={onExperienceFilterChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select experience" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Levels</SelectItem>
                      <SelectItem value="0-2">Entry Level (0-2 years)</SelectItem>
                      <SelectItem value="3-5">Mid Level (3-5 years)</SelectItem>
                      <SelectItem value="6-10">Senior Level (6-10 years)</SelectItem>
                      <SelectItem value="10+">Expert Level (10+ years)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Sort Options */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Sort By</label>
                  <Select value={sortBy} onValueChange={onSortChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select sort option" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="name">Name (A-Z)</SelectItem>
                      <SelectItem value="name-desc">Name (Z-A)</SelectItem>
                      <SelectItem value="experience">Experience (Low to High)</SelectItem>
                      <SelectItem value="experience-desc">Experience (High to Low)</SelectItem>
                      <SelectItem value="date">Date Added (Newest)</SelectItem>
                      <SelectItem value="date-desc">Date Added (Oldest)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={onClearFilters} className="gap-1 w-full sm:w-auto">
              <X className="h-4 w-4" />
              <span className="text-sm">Clear</span>
            </Button>
          )}
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {searchTerm && (
            <Badge variant="secondary" className="gap-1 text-xs">
              Search: {searchTerm.length > 15 ? `${searchTerm.substring(0, 15)}...` : searchTerm}
              <X className="h-3 w-3 cursor-pointer" onClick={() => onSearchChange("")} />
            </Badge>
          )}
          {roleFilter !== "all" && (
            <Badge variant="secondary" className="gap-1 text-xs">
              Role: {roleFilter}
              <X className="h-3 w-3 cursor-pointer" onClick={() => onRoleFilterChange("all")} />
            </Badge>
          )}
          {experienceFilter !== "all" && (
            <Badge variant="secondary" className="gap-1 text-xs">
              Experience: {experienceFilter}
              <X className="h-3 w-3 cursor-pointer" onClick={() => onExperienceFilterChange("all")} />
            </Badge>
          )}
        </div>
      )}
    </div>
  )
}
