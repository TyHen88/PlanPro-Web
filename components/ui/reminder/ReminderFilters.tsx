import React from "react"
import { Search, Filter } from "lucide-react"
import { Input } from "@/components/shared/ui/Input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/shared/ui/select"
import { Button } from "@/components/shared/ui/Button"
import type { ReminderCategory, ReminderPriority, ReminderStatus } from "./types"

interface ReminderFiltersProps {
  searchQuery: string
  categoryFilter: ReminderCategory | "All"
  statusFilter: ReminderStatus | "All"
  priorityFilter: ReminderPriority | "All"
  onSearchChange: (query: string) => void
  onCategoryChange: (category: ReminderCategory | "All") => void
  onStatusChange: (status: ReminderStatus | "All") => void
  onPriorityChange: (priority: ReminderPriority | "All") => void
  onResetFilters: () => void
}

export const ReminderFilters: React.FC<ReminderFiltersProps> = ({
  searchQuery,
  categoryFilter,
  statusFilter,
  priorityFilter,
  onSearchChange,
  onCategoryChange,
  onStatusChange,
  onPriorityChange,
  onResetFilters,
}) => {
  return (
    <div className="mb-6 flex flex-col md:flex-row gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search reminders..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <Select value={categoryFilter} onValueChange={(value: any) => onCategoryChange(value as any)}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Categories</SelectItem>
            <SelectItem value="Personal">Personal</SelectItem>
            <SelectItem value="Work">Work</SelectItem>
            <SelectItem value="Health">Health</SelectItem>
            <SelectItem value="Finance">Finance</SelectItem>
            <SelectItem value="Social">Social</SelectItem>
            <SelectItem value="Other">Other</SelectItem>
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={(value) => onStatusChange(value as any)}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Statuses</SelectItem>
            <SelectItem value="Active">Active</SelectItem>
            <SelectItem value="Completed">Completed</SelectItem>
            <SelectItem value="Snoozed">Snoozed</SelectItem>
            <SelectItem value="Missed">Missed</SelectItem>
          </SelectContent>
        </Select>

        <Select value={priorityFilter} onValueChange={(value) => onPriorityChange(value as any)}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Priorities</SelectItem>
            <SelectItem value="Low">Low</SelectItem>
            <SelectItem value="Medium">Medium</SelectItem>
            <SelectItem value="High">High</SelectItem>
            <SelectItem value="Urgent">Urgent</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline" size="icon" onClick={onResetFilters} className="h-10 w-10">
          <Filter className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
