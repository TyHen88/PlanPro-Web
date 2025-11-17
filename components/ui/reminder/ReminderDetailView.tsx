import React from "react"
import { format, isBefore, parseISO, formatDistanceToNow } from "date-fns"
import {
  AlertCircle,
  Check,
  Calendar,
  Edit,
  Trash2,
  BellRing,
  Tag,
  ArrowUpRight,
  ArrowDownRight,
  Star,
  RefreshCw,
} from "lucide-react"
import { Button } from "@/components/shared/ui/Button"
import { Badge } from "@/components/shared/ui/badge"
import { cn } from "@/utils/utils"
import type { Reminder, ReminderCategory, ReminderPriority, ReminderStatus } from "./types"

interface ReminderDetailViewProps {
  reminder: Reminder
  onClose: () => void
  onEdit: (id: string) => void
  onDelete: (id: string) => void
  onStatusChange: (id: string, status: ReminderStatus) => void
}

export const ReminderDetailView: React.FC<ReminderDetailViewProps> = ({
  reminder,
  onClose,
  onEdit,
  onDelete,
  onStatusChange,
}) => {
  const dueDate = parseISO(`${reminder.dueDate}T${reminder.dueTime}:00`)
  const isPastDue = isBefore(dueDate, new Date()) && reminder.reminderStatus === "Active"

  const getStatusColor = (status: ReminderStatus) => {
    switch (status) {
      case "Active":
        return "bg-green-500/10 dark:bg-green-500/20 text-green-700 dark:text-green-400"
      case "Completed":
        return "bg-blue-500/10 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400"
      case "Snoozed":
        return "bg-yellow-500/10 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-400"
      case "Missed":
        return "bg-red-500/10 dark:bg-red-500/20 text-red-700 dark:text-red-400"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const getPriorityColor = (priority: ReminderPriority) => {
    switch (priority) {
      case "Low":
        return "bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400"
      case "Medium":
        return "bg-yellow-500/10 dark:bg-yellow-500/20 text-yellow-600 dark:text-yellow-400"
      case "High":
        return "bg-orange-500/10 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400"
      case "Urgent":
        return "bg-red-500/10 dark:bg-red-500/20 text-red-600 dark:text-red-400"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const getCategoryIcon = (category: ReminderCategory) => {
    switch (category) {
      case "Personal":
        return <Tag className="h-4 w-4 text-purple-600 dark:text-purple-400" />
      case "Work":
        return <ArrowUpRight className="h-4 w-4 text-blue-600 dark:text-blue-400" />
      case "Health":
        return <AlertCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
      case "Finance":
        return <ArrowDownRight className="h-4 w-4 text-orange-600 dark:text-orange-400" />
      case "Social":
        return <BellRing className="h-4 w-4 text-pink-600 dark:text-pink-400" />
      case "Other":
        return <Tag className="h-4 w-4 text-muted-foreground" />
      default:
        return <Tag className="h-4 w-4 text-muted-foreground" />
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => onStatusChange(reminder.id, reminder.reminderStatus === "Completed" ? "Active" : "Completed")}
            className={cn(
              "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border",
              reminder.reminderStatus === "Completed" ? "border-primary bg-primary text-primary-foreground" : "border-input bg-background",
            )}
          >
            {reminder.reminderStatus === "Completed" && <Check className="h-4 w-4" />}
          </button>

          <h2
            className={cn(
              "text-xl font-semibold",
              reminder.reminderStatus === "Completed" ? "line-through text-muted-foreground" : "text-foreground",
            )}
          >
            {reminder.title}
          </h2>

          {reminder.isStarred && <Star className="h-5 w-5 text-yellow-500 dark:text-yellow-400 fill-yellow-500 dark:fill-yellow-400" />}
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" className="text-primary" onClick={() => onEdit(reminder.id)}>
            <Edit className="h-4 w-4 mr-1" />
            Edit
          </Button>
          <Button variant="outline" size="sm" className="text-destructive" onClick={() => onDelete(reminder.id)}>
            <Trash2 className="h-4 w-4 mr-1" />
            Delete
          </Button>
        </div>
      </div>

      <div className="bg-muted/50 p-4 rounded-lg border border-border">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Due Date & Time</h3>
            <div className="flex items-center text-foreground">
              <Calendar className="h-4 w-4 mr-2 text-primary" />
              <span className={isPastDue ? "text-red-600 dark:text-red-400 font-medium" : ""}>
                {format(dueDate, "MMMM d, yyyy")} at {format(dueDate, "h:mm a")}
              </span>
            </div>
            {isPastDue && <div className="text-red-600 dark:text-red-400 text-sm mt-1">Overdue by {formatDistanceToNow(dueDate)}</div>}
          </div>

          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Status</h3>
            <Badge className={getStatusColor(reminder.reminderStatus)}>{reminder.reminderStatus}</Badge>
          </div>

          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Category</h3>
            <div className="flex items-center text-foreground">
              {getCategoryIcon(reminder.category)}
              <span className="ml-2">{reminder.category}</span>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Priority</h3>
            <Badge className={getPriorityColor(reminder.priority)}>{reminder.priority}</Badge>
          </div>

          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Recurrence</h3>
            <div className="flex items-center text-foreground">
              <RefreshCw className="h-4 w-4 mr-2 text-primary" />
              <span>{reminder.recurring ? reminder.recurrenceType : "None"}</span>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Created</h3>
            <div className="text-foreground">{format(parseISO(reminder.createdAt), "MMMM d, yyyy")}</div>
          </div>
        </div>
      </div>

      {reminder.description && (
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Description</h3>
          <div className="bg-card border border-border rounded-lg p-3 text-foreground">{reminder.description}</div>
        </div>
      )}

      {reminder.tags && reminder.tags.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Tags</h3>
          <div className="flex flex-wrap gap-2">
            {reminder.tags && reminder.tags.split(',').map((tag) => (
              <Badge key={tag.trim()} variant="outline" className="bg-primary/10 dark:bg-primary/20 text-primary border-primary/20">
                #{tag.trim()}
              </Badge>
            ))}
          </div>
        </div>
      )}

      <div className="pt-4 flex justify-end">
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
      </div>
    </div>
  )
}
