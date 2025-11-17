import React, { useState, useEffect } from "react"
import { format, isAfter, parseISO } from "date-fns"
import {
  AlertCircle,
  Plus,
} from "lucide-react"
import { Button } from "@/components/shared/ui/Button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/shared/ui/dialog"
import {
  ReminderCard,
  EmptyState,
  ReminderForm,
  ReminderDetailView,
  ReminderStats,
  ReminderFilters,
  ReminderTabs,
  type Reminder,
  type ReminderCategory,
  type ReminderPriority,
  type ReminderStatus,
  type RecurrenceType,
  EmptySetup,
} from "./index"
import ReminderService from "@/service/reminder.service"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import useFetchReminder from "@/lib/hooks/useFetchReminder"
import { toast } from "sonner"
import LoadingSpinner from "@/components/shared/LoadingSpinner"
import { useFetchTelegram } from "@/lib/hooks/useFetchTelegram"

// Main component
export default function ReminderPage() {
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [filteredReminders, setFilteredReminders] = useState<Reminder[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<ReminderCategory | "All">("All")
  const [statusFilter, setStatusFilter] = useState<ReminderStatus | "All">("All")
  const [priorityFilter, setPriorityFilter] = useState<ReminderPriority | "All">("All")
  const [currentTab, setCurrentTab] = useState<"all" | "today" | "upcoming" | "completed" | "starred" | "overdue">("all")

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [currentReminder, setCurrentReminder] = useState<Reminder | null>(null)
  const queryClient = useQueryClient()
  const { data, isLoading, error, setPageNumber, setPageSize } = useFetchReminder()
  const { telegramUserInfo: telegramData, historyLoading: telegramLoading, historyError: telegramError } = useFetchTelegram()
  const isConnectedActive = telegramData?.data?.data?.active;
  const isConnectedStatus = telegramData?.data?.data?.connected
  console.log("isConnectedActive", isConnectedActive)
  console.log("isConnectedStatus", isConnectedStatus)
  //mutate create reminder
  const { mutate: createReminder } = useMutation({
    mutationFn: (data: any) => ReminderService.createReminder(data),
    onSuccess: () => {
      toast.success("Reminder created successfully")
      queryClient.invalidateQueries({ queryKey: ["reminders"] })
    },
    onError: (error: any) => {
      toast.error(error.response.data.message)
    },
  })

  //mutate update reminder
  const { mutate: updateReminder } = useMutation({
    mutationFn: (data: any) => ReminderService.updateReminder(data.id, data),
    onSuccess: () => {
      toast.success("Reminder updated successfully");
      queryClient.invalidateQueries({ queryKey: ["reminders"] })
    },
    onError: (error: any) => {
      toast.error(error.response.data.message)
    },
  })

  //mutate delete reminder
  const { mutate: deleteReminder } = useMutation({
    mutationFn: (id: any) => ReminderService.deleteReminder(id),
    onSuccess: () => {
      toast.success("Reminder deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["reminders"] })
    },
    onError: (error: any) => {
      toast.error(error.response.data.message)
    },
  })



  // Load sample data
  const reminderData = data?.data?.data;
  useEffect(() => {
    if (reminderData) {
      setReminders(reminderData)
      setFilteredReminders(reminderData)
    }
  }, [reminders, reminderData])

  // Apply filters
  useEffect(() => {
    let result = [...reminders]

    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (reminder) =>
          reminder.title.toLowerCase().includes(query) ||
          reminder.description.toLowerCase().includes(query) ||
          (reminder.tags && reminder.tags.split(",").some((tag: any) => tag.toLowerCase().includes(query))),
      )
    }

    // Apply category filter
    if (categoryFilter !== "All") {
      result = result.filter((reminder) => reminder.category === categoryFilter)
    }

    // Apply status filter
    if (statusFilter !== "All") {
      result = result.filter((reminder) => reminder.reminderStatus === statusFilter)
    }

    // Apply priority filter
    if (priorityFilter !== "All") {
      result = result.filter((reminder) => reminder.priority === priorityFilter)
    }

    // Apply tab filters
    switch (currentTab) {
      case "today":
        result = result.filter(
          (reminder) => format(parseISO(reminder.dueDate), "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd"),
        )
        break
      case "upcoming":
        result = result.filter((reminder) => {
          const dueDate = new Date(`${reminder.dueDate}T${reminder.dueTime}:00`)
          return dueDate > new Date() && reminder.reminderStatus !== "Completed"
        })
        break
      case "completed":
        result = result.filter((reminder) => reminder.reminderStatus === "Completed")
        break
      case "starred":
        result = result.filter((reminder) => reminder.isStarred)
        break
      case "overdue":
        result = result.filter((reminder) => {
          const dueDate = new Date(`${reminder.dueDate}T${reminder.dueTime}:00`)
          return dueDate < new Date() && reminder.reminderStatus === "Active"
        })
        break
    }

    setFilteredReminders(result)
  }, [reminders, searchQuery, categoryFilter, statusFilter, priorityFilter, currentTab])

  // Handlers
  const handleCreateReminder = () => {
    setCurrentReminder(null)
    setIsCreateModalOpen(true)
  }

  const handleEditReminder = (id: string) => {
    const reminder = reminders.find((r) => r.id === id)
    if (reminder) {
      setCurrentReminder(reminder)
      setIsEditModalOpen(true)
    }
  }

  const handleDeleteReminder = (id: string) => {
    const reminder = reminders.find((r) => r.id === id)
    if (reminder) {
      console.log(reminder)
      // deleteReminder(reminder.id)
      setCurrentReminder(reminder)
      setIsDeleteModalOpen(true)
    }
  }

  const handleStatusChange = (id: string, status: ReminderStatus) => {
    setReminders((prev) =>
      prev.map((reminder) =>
        reminder.id === id
          ? { ...reminder, status, lastModified: format(new Date(), "yyyy-MM-dd'T'HH:mm:ss") }
          : reminder,
      ),
    )
  }

  const handleStarToggle = (id: string) => {
    setReminders((prev) =>
      prev.map((reminder) =>
        reminder.id === id
          ? { ...reminder, isStarred: !reminder.isStarred, lastModified: format(new Date(), "yyyy-MM-dd'T'HH:mm:ss") }
          : reminder,
      ),
    )
  }

  const confirmDelete = () => {
    if (currentReminder) {
      // setReminders((prev) => prev.filter((r) => r.id !== currentReminder.id))
      deleteReminder(currentReminder.id)
      setIsDeleteModalOpen(false)
      setCurrentReminder(null)
    }
  }

  const saveReminder = (reminderData: Partial<Reminder>) => {
    const now = format(new Date(), "yyyy-MM-dd'T'HH:mm:ss")

    if (isEditModalOpen && currentReminder) {
      // Update existing reminder
      updateReminder({ id: currentReminder.id, ...reminderData })
      setIsEditModalOpen(false)
    } else {
      // Create new reminder
      const newReminder: Reminder = {
        id: `rem-${Math.random().toString(36).substr(2, 9)}`,
        title: reminderData.title || "",
        description: reminderData.description || "",
        dueDate: reminderData.dueDate || format(new Date(), "yyyy-MM-dd"),
        dueTime: reminderData.dueTime || "12:00",
        category: (reminderData.category as ReminderCategory) || "Personal",
        priority: (reminderData.priority as ReminderPriority) || "Medium",
        reminderStatus: (reminderData.reminderStatus as ReminderStatus) || "Active",
        recurring: reminderData.recurring || false,
        recurrenceType: (reminderData.recurrenceType as RecurrenceType) || "None",
        isStarred: reminderData.isStarred || false,
        createdAt: now,
        lastModified: now,
        tags: reminderData.tags || "",
      }

      // setReminders((prev) => [...prev, newReminder])
      createReminder(newReminder)
      setIsCreateModalOpen(false)
    }

    setCurrentReminder(null)
  }

  const resetFilters = () => {
    setSearchQuery("")
    setCategoryFilter("All")
    setStatusFilter("All")
    setPriorityFilter("All")
  }

  return (
    <div className="bg-background h-screen">
      {isLoading ? (
        <div className="flex justify-center items-center h-screen">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <>

          {/* Header */}
          <div className="bg-card border-b border-border">
            <div className="relative">
              {/* Gradient background */}
              <div className="absolute inset-0 bg-gradient-to-r from-green-50/50 dark:from-green-950/30 to-blue-50/50 dark:to-blue-950/30 opacity-70"></div>

              <div className="relative container mx-auto px-4 py-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div className="mb-4 md:mb-0">
                    <h1 className="text-2xl font-bold text-foreground flex items-center">
                      <AlertCircle className="h-6 w-6 mr-2 text-green-600 dark:text-green-400" />
                      <span className="bg-gradient-to-r from-green-600 to-blue-600 dark:from-green-400 dark:to-blue-400 bg-clip-text text-transparent">
                        Reminders
                      </span>
                    </h1>
                    <p className="text-muted-foreground mt-1">Never miss important dates and deadlines</p>
                  </div>

                  {isConnectedActive ? (
                    <div className="flex items-center space-x-3">
                      <Button onClick={handleCreateReminder}>
                        <Plus className="h-4 w-4 mr-2" />
                        New Reminder
                      </Button>
                    </div>
                  ) : (
                    ""
                  )}
                </div>
              </div>
            </div>
            {isConnectedActive ? (

              <>

                {/* Stats */}
                <div className="container mx-auto px-4 py-4">
                  <ReminderStats reminders={reminders} />
                </div>

                {/* Tabs */}
                <div className="container mx-auto px-4">
                  <ReminderTabs
                    currentTab={currentTab}
                    onTabChange={setCurrentTab}
                    reminders={reminders}
                  />
                </div>
              </>
            ) : (
              ""
            )}
          </div>
          {
            !isConnectedActive ? (
              <EmptySetup isConnected={isConnectedStatus} isActive={isConnectedActive} />
            ) : (
              <>
                {/* Main content */}
                <div className="container mx-auto px-4 py-6">
                  {/* Search and filters */}
                  <ReminderFilters
                    searchQuery={searchQuery}
                    categoryFilter={categoryFilter}
                    statusFilter={statusFilter}
                    priorityFilter={priorityFilter}
                    onSearchChange={setSearchQuery}
                    onCategoryChange={setCategoryFilter}
                    onStatusChange={setStatusFilter}
                    onPriorityChange={setPriorityFilter}
                    onResetFilters={resetFilters}
                  />

                  {/* Reminders list */}

                  <div className="space-y-4">
                    {filteredReminders.length > 0 ? (
                      filteredReminders.map((reminder) => (
                        <ReminderCard
                          key={reminder.id}
                          reminder={reminder}
                          onEdit={handleEditReminder}
                          onDelete={handleDeleteReminder}
                          onStatusChange={handleStatusChange}
                          onStarToggle={handleStarToggle}
                        />
                      ))
                    ) : (
                      <EmptyState onCreateNew={handleCreateReminder} />
                    )}
                  </div>

                </div>
              </>
            )
          }


          {/* Create/Edit Modal */}
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Create New Reminder</DialogTitle>
              </DialogHeader>
              <ReminderForm reminder={{}} onSave={saveReminder} onCancel={() => setIsCreateModalOpen(false)} />
            </DialogContent>
          </Dialog>

          <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Edit Reminder</DialogTitle>
              </DialogHeader>
              {currentReminder && (
                <ReminderForm reminder={currentReminder} onSave={saveReminder} onCancel={() => setIsEditModalOpen(false)} />
              )}
            </DialogContent>
          </Dialog>

          {/* Delete Confirmation Modal */}
          <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Delete Reminder</DialogTitle>
              </DialogHeader>
              <div className="py-4">
                <p className="text-foreground">
                  Are you sure you want to delete this reminder?
                  <span className="font-medium block mt-2">"{currentReminder?.title}"</span>
                </p>
                <p className="text-muted-foreground text-sm mt-2">This action cannot be undone.</p>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={confirmDelete}>
                  Delete
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Detail View Modal */}
          <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Reminder Details</DialogTitle>
              </DialogHeader>
              {currentReminder && (
                <ReminderDetailView
                  reminder={currentReminder}
                  onClose={() => setIsDetailModalOpen(false)}
                  onEdit={handleEditReminder}
                  onDelete={handleDeleteReminder}
                  onStatusChange={handleStatusChange}
                />
              )}
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  )
}
