import React, { useState } from "react"
import { format } from "date-fns"
import { X } from "lucide-react"
import { Button } from "@/components/shared/ui/Button"
import { Input } from "@/components/shared/ui/Input"
import { Label } from "@/components/shared/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/shared/ui/select"
import { Switch } from "@/components/shared/ui/swtich"
import { Badge } from "@/components/shared/ui/badge"
import { DialogFooter } from "@/components/shared/ui/dialog"
import { Textarea } from "@/components/shared/ui/textarea"
import type { Reminder, ReminderCategory, ReminderPriority, ReminderStatus, RecurrenceType } from "./types"
import { RecurrenceType as RecurrenceTypeEnum, ReminderStatus as ReminderStatusEnum, ReminderPriority as ReminderPriorityEnum } from "./utils"
import { ReminderCategory as ReminderCategoryEnum } from "./utils"

interface ReminderFormProps {
  reminder: Partial<Reminder>
  onSave: (reminder: Partial<Reminder>) => void
  onCancel: () => void
}

export const ReminderForm: React.FC<ReminderFormProps> = ({ reminder, onSave, onCancel }) => {
  const [formData, setFormData] = useState<Partial<Reminder>>(
    reminder || {
      title: "",
      description: "",
      dueDate: format(new Date(), "yyyy-MM-dd"),
      dueTime: "12:00",
      category: "Personal" as ReminderCategory,
      priority: "Medium" as ReminderPriority,
      reminderStatus: "Active" as ReminderStatus,
      recurring: false,
      recurrenceType: "None" as RecurrenceType,
      isStarred: false,
      tags: "",
    },
  )

  // Instead of tagInput, we use a comma-separated string for tags
  const [tagInput, setTagInput] = useState(
    (reminder && Array.isArray(reminder.tags) && reminder.tags.length > 0)
      ? reminder.tags.join(", ")
      : ""
  )

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Update tags in formData whenever tagInput changes
  const handleTagInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setTagInput(value)
    // Split by comma, trim, and filter out empty strings
    const tags = value
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0)
    setFormData((prev) => ({
      ...prev,
      tags: tags.join(","),
    }))
  }

  const handleRemoveTag = (tag: string) => {
    const newTags = (formData.tags || "").split(",").filter((t) => t !== tag)
    setFormData((prev) => ({
      ...prev,
      tags: newTags.join(","),
    }))
    setTagInput(newTags.join(", "))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Ensure tags are up to date before submit
    const tags = tagInput
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0)
    onSave({ ...formData, tags: tags.join(",") })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="Enter reminder title"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Enter reminder details"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="dueDate">Due Date</Label>
          <Input id="dueDate" name="dueDate" type="date" value={formData.dueDate} onChange={handleChange} required />
        </div>

        <div className="space-y-2">
          <Label htmlFor="dueTime">Due Time</Label>
          <Input id="dueTime" name="dueTime" type="time" value={formData.dueTime} onChange={handleChange} required />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select value={formData.category} onValueChange={(value: any) => handleSelectChange("category", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {Object.values(ReminderCategoryEnum).map((category: any) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}

            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="priority">Priority</Label>
          <Select value={formData.priority} onValueChange={(value: any) => handleSelectChange("priority", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select priority" />
            </SelectTrigger>
            <SelectContent>
              {Object.values(ReminderPriorityEnum).map((priority: any) => (
                <SelectItem key={priority} value={priority}>
                  {priority}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <Select value={formData.reminderStatus} onValueChange={(value) => handleSelectChange("reminderStatus", value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            {Object.values(ReminderStatusEnum).map((status: any) => (
              <SelectItem key={status} value={status}>
                {status}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="isRecurring"
          checked={formData.recurring}
          onCheckedChange={(checked: any) => handleSwitchChange("recurring", checked)}
        />
        <Label htmlFor="isRecurring">Recurring Reminder</Label>
      </div>

      {formData.recurring && (
        <div className="space-y-2">
          <Label htmlFor="recurrenceType">Recurrence Pattern</Label>
          <Select
            value={formData.recurrenceType}
            onValueChange={(value: any) => handleSelectChange("recurrenceType", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select recurrence pattern" />
            </SelectTrigger>
            <SelectContent>
              {Object.values(RecurrenceTypeEnum).map((type: any) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}

            </SelectContent>
          </Select>
        </div>
      )}

      <div className="flex items-center space-x-2">
        <Switch
          id="isStarred"
          checked={formData.isStarred}
          onCheckedChange={(checked) => handleSwitchChange("starred", checked)}
        />
        <Label htmlFor="isStarred">Star this reminder</Label>
      </div>

      <div className="space-y-2">
        <Label htmlFor="tags">Tags</Label>
        <div className="flex items-center space-x-2">
          <Input
            id="tagInput"
            value={tagInput}
            onChange={handleTagInputChange}
            placeholder="Add tags, separated by commas"
            className="flex-1"
          />
        </div>

        {formData.tags && formData.tags.split(",").length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {formData.tags.split(",").map((tag: any) => (
              <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="ml-1 rounded-full hover:bg-muted p-0.5 transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Save Reminder</Button>
      </DialogFooter>
    </form>
  )
}
