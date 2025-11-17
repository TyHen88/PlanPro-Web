import React from "react"
import { format, isBefore, parseISO } from "date-fns"
import {
  AlertCircle,
  Check,
  Clock,
  Edit,
  RefreshCw,
  Trash2,
  BellRing,
  Tag,
  ArrowUpRight,
  ArrowDownRight,
  Star,
  StarOff,
} from "lucide-react"
import { Button } from "@/components/shared/ui/Button"
import { Badge } from "@/components/shared/ui/badge"
import { Card, CardContent } from "@/components/shared/ui/card"
import { cn } from "@/utils/utils"
import type { Reminder, ReminderCategory, ReminderPriority, ReminderStatus } from "./types"
import ReminderService from "@/service/reminder.service"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

interface ReminderCardProps {
  reminder: Reminder
  onEdit: (id: string) => void
  onDelete: (id: string) => void
  onStatusChange: (id: string, status: ReminderStatus) => void
  onStarToggle: (id: string) => void
}

export const ReminderCard: React.FC<ReminderCardProps> = ({
  reminder,
  onEdit,
  onDelete,
  onStatusChange,
  onStarToggle,
}) => {
  const queryClient = useQueryClient()
  const dueDate = parseISO(`${reminder.dueDate}T${reminder.dueTime}:00`)
  const isPastDue = isBefore(dueDate, new Date()) && reminder.reminderStatus === "Active"
  const isToday = format(dueDate, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd")

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

  const getTimeDisplay = () => {
    if (isPastDue) {
      return <span className="text-red-600 dark:text-red-400 font-medium">Overdue</span>
    }

    if (isToday) {
      return <span className="text-green-600 dark:text-green-400 font-medium">Today at {format(dueDate, "h:mm a")}</span>
    }

    return (
      <span className="text-muted-foreground">
        {format(dueDate, "MMM d, yyyy")} at {format(dueDate, "h:mm a")}
      </span>
    )
  }

  const getRecurrenceText = () => {
    if (!reminder.recurring) return null

    return (
      <div className="flex items-center text-xs text-muted-foreground mt-1">
        <RefreshCw className="h-3 w-3 mr-1" />
        <span>{reminder.recurrenceType}</span>
      </div>
    )
  }

  // Fix: Convert string id to number for API calls
  const reminderIdNum = Number(reminder.id)

  // mutate mark as reminder starred
  const { mutate: markAsReminderStarred } = useMutation({
    mutationFn: async ({ id, isStarred }: { id: number; isStarred: boolean }) => {
      await ReminderService.markAsReminderStarred(id, isStarred)
      return { isStarred }
    },
    onSuccess: ({ isStarred }: { isStarred: boolean }) => {
      toast.success(`${isStarred ? "Starred" : "Unstarred"}`)
      queryClient.invalidateQueries({ queryKey: ["reminders"] })
    },
  })
  // mutate mark as reminder done
  const { mutate: markAsReminderDone } = useMutation({
    mutationFn: async ({ id, isDone }: { id: number; isDone: boolean }) => {
      await ReminderService.markAsReminderDone(id, isDone)
      return { isDone }
    },
    onSuccess: ({ isDone }: { isDone: boolean }) => {
      toast.success(`${isDone ? "Completed" : "Active"}`)
      queryClient.invalidateQueries({ queryKey: ["reminders"] })
    },
  })

  return (
    <Card
      className={cn(
        "transition-all duration-200 hover:shadow-md",
        isPastDue ? "border-red-500/30 dark:border-red-500/20 bg-red-500/5 dark:bg-red-500/10" : "",
        reminder.reminderStatus === "Completed" ? "opacity-75" : "",
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <button
              onClick={() => {
                // Toggle done status and call mutation with number id
                const newDone = reminder.reminderStatus !== "Completed"
                markAsReminderDone({ id: reminderIdNum, isDone: newDone })
                onStatusChange(reminder.id, newDone ? "Completed" : "Active")
              }}
              className={cn(
                "mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border",
                reminder.reminderStatus === "Completed"
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-input bg-background",
              )}
            >
              {reminder.reminderStatus === "Completed" && <Check className="h-3 w-3" />}
            </button>

            <div className="space-y-1">
              <div className="flex items-center">
                <h3
                  className={cn(
                    "font-medium",
                    reminder.reminderStatus === "Completed"
                      ? "line-through text-muted-foreground"
                      : "text-foreground",
                  )}
                >
                  {reminder.title}
                </h3>
                {reminder.isStarred && (
                  <Star className="h-4 w-4 ml-2 text-yellow-500 dark:text-yellow-400 fill-yellow-500 dark:fill-yellow-400" />
                )}
              </div>

              <p className="text-sm text-muted-foreground line-clamp-2">{reminder.description}</p>

              <div className="flex flex-wrap items-center gap-2 mt-2">
                <div className="flex items-center text-xs">
                  <Clock className="h-3 w-3 mr-1 text-muted-foreground" />
                  {getTimeDisplay()}
                </div>

                {getRecurrenceText()}

                <Badge variant="outline" className={getPriorityColor(reminder.priority)}>
                  {reminder.priority}
                </Badge>

                <Badge variant="outline" className={getStatusColor(reminder.reminderStatus)}>
                  {reminder.reminderStatus}
                </Badge>

                <Badge
                  variant="outline"
                  className="bg-muted text-foreground flex items-center gap-1"
                >
                  {getCategoryIcon(reminder.category)}
                  {reminder.category}
                </Badge>
              </div>

              {reminder.tags && reminder.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {reminder.tags.split(",").map((tag: any) => (
                    <Badge
                      key={tag}
                      variant="outline"
                      className="text-xs bg-primary/10 dark:bg-primary/20 text-primary border-primary/20"
                    >
                      #{tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-yellow-500 dark:hover:text-yellow-400"
              onClick={() => {
                // Toggle star status and call mutation with number id
                markAsReminderStarred({
                  id: reminderIdNum,
                  isStarred: !reminder.isStarred,
                })
                onStarToggle(reminder.id)
              }}
            >
              {reminder.isStarred ? (
                <Star className="h-4 w-4 fill-yellow-500 dark:fill-yellow-400 text-yellow-500 dark:text-yellow-400" />
              ) : (
                <StarOff className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-primary"
              onClick={() => onEdit(reminder.id)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
              onClick={() => onDelete(reminder.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
