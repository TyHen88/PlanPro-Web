"use client"

import { useState, useEffect } from "react"
import Image from "next/image"

import {
  AlertCircle,
  Calendar,
  CheckCircle,
  Clock,
  Flag,
  MapPin,
  MoreHorizontal,
  Plus,
  Search,
  Star,
  Target,
  Trash2,
  Users,
  X,
} from "lucide-react"
import { Button } from "@/components/shared/ui/Button"
import { Input } from "@/components/shared/ui/Input"
import Planning from "@/public/asset/planning.png"

// Sample planning data
const planCategories = [
  { id: 1, name: "Business", color: "bg-blue-400", icon: Target },
  { id: 2, name: "Personal", color: "bg-green-400", icon: Star },
  { id: 3, name: "Health", color: "bg-red-400", icon: AlertCircle },
  { id: 4, name: "Travel", color: "bg-yellow-400", icon: MapPin },
  { id: 5, name: "Learning", color: "bg-purple-400", icon: CheckCircle },
  { id: 6, name: "Finance", color: "bg-teal-400", icon: Flag },
]

const priorityLevels = [
  { id: 1, name: "Low", color: "bg-gray-400", textColor: "text-gray-700" },
  { id: 2, name: "Medium", color: "bg-yellow-400", textColor: "text-yellow-700" },
  { id: 3, name: "High", color: "bg-orange-400", textColor: "text-orange-700" },
  { id: 4, name: "Critical", color: "bg-red-400", textColor: "text-red-700" },
]

const planStatuses = [
  { id: 1, name: "Planning", color: "bg-blue-400" },
  { id: 2, name: "In Progress", color: "bg-orange-400" },
  { id: 3, name: "On Hold", color: "bg-yellow-400" },
  { id: 4, name: "Completed", color: "bg-green-400" },
  { id: 5, name: "Cancelled", color: "bg-gray-400" },
]

const samplePlans = [
  {
    id: 1,
    title: "Launch New Product",
    description: "Complete product development, marketing strategy, and launch campaign for our new mobile app.",
    categoryId: 1,
    priorityId: 4,
    statusId: 2,
    deadline: new Date(2025, 5, 30),
    createdAt: new Date(2025, 4, 1),
    updatedAt: new Date(2025, 4, 15),
    progress: 65,
    milestones: [
      { id: 1, title: "Product Development", completed: true, dueDate: new Date(2025, 4, 15) },
      { id: 2, title: "Marketing Strategy", completed: true, dueDate: new Date(2025, 4, 20) },
      { id: 3, title: "Beta Testing", completed: false, dueDate: new Date(2025, 5, 10) },
      { id: 4, title: "Launch Campaign", completed: false, dueDate: new Date(2025, 5, 25) },
    ],
    tags: ["Product", "Marketing", "Launch"],
    assignees: ["John Doe", "Jane Smith", "Alex Johnson"],
  },
  {
    id: 2,
    title: "Fitness Journey 2025",
    description:
      "Complete fitness transformation including weight loss, muscle building, and healthy lifestyle habits.",
    categoryId: 3,
    priorityId: 3,
    statusId: 2,
    deadline: new Date(2025, 11, 31),
    createdAt: new Date(2025, 0, 1),
    updatedAt: new Date(2025, 4, 10),
    progress: 40,
    milestones: [
      { id: 1, title: "Join Gym", completed: true, dueDate: new Date(2025, 0, 15) },
      { id: 2, title: "Lose 10kg", completed: true, dueDate: new Date(2025, 3, 30) },
      { id: 3, title: "Build Muscle Mass", completed: false, dueDate: new Date(2025, 8, 30) },
      { id: 4, title: "Run Marathon", completed: false, dueDate: new Date(2025, 11, 15) },
    ],
    tags: ["Health", "Fitness", "Lifestyle"],
    assignees: [],
  },
  {
    id: 3,
    title: "Learn Web Development",
    description: "Master modern web development technologies including React, Node.js, and cloud deployment.",
    categoryId: 5,
    priorityId: 2,
    statusId: 2,
    deadline: new Date(2025, 8, 30),
    createdAt: new Date(2025, 2, 1),
    updatedAt: new Date(2025, 4, 12),
    progress: 75,
    milestones: [
      { id: 1, title: "HTML & CSS Basics", completed: true, dueDate: new Date(2025, 2, 15) },
      { id: 2, title: "JavaScript Fundamentals", completed: true, dueDate: new Date(2025, 3, 15) },
      { id: 3, title: "React Development", completed: true, dueDate: new Date(2025, 4, 30) },
      { id: 4, title: "Full-Stack Project", completed: false, dueDate: new Date(2025, 7, 30) },
    ],
    tags: ["Programming", "Career", "Skills"],
    assignees: [],
  },
  {
    id: 4,
    title: "European Vacation",
    description: "Plan and execute a 3-week vacation across Europe visiting major cities and cultural landmarks.",
    categoryId: 4,
    priorityId: 2,
    statusId: 1,
    deadline: new Date(2025, 6, 15),
    createdAt: new Date(2025, 3, 1),
    updatedAt: new Date(2025, 4, 8),
    progress: 25,
    milestones: [
      { id: 1, title: "Research Destinations", completed: true, dueDate: new Date(2025, 3, 15) },
      { id: 2, title: "Book Flights", completed: false, dueDate: new Date(2025, 4, 30) },
      { id: 3, title: "Reserve Hotels", completed: false, dueDate: new Date(2025, 5, 15) },
      { id: 4, title: "Create Itinerary", completed: false, dueDate: new Date(2025, 6, 1) },
    ],
    tags: ["Travel", "Vacation", "Europe"],
    assignees: ["Sarah Williams"],
  },
  {
    id: 5,
    title: "Emergency Fund Goal",
    description: "Build an emergency fund covering 6 months of expenses through systematic saving and investment.",
    categoryId: 6,
    priorityId: 3,
    statusId: 2,
    deadline: new Date(2025, 11, 31),
    createdAt: new Date(2025, 0, 1),
    updatedAt: new Date(2025, 4, 14),
    progress: 55,
    milestones: [
      { id: 1, title: "Set Savings Target", completed: true, dueDate: new Date(2025, 0, 15) },
      { id: 2, title: "Open High-Yield Account", completed: true, dueDate: new Date(2025, 1, 1) },
      { id: 3, title: "Save 50% of Target", completed: true, dueDate: new Date(2025, 5, 30) },
      { id: 4, title: "Reach Full Target", completed: false, dueDate: new Date(2025, 11, 31) },
    ],
    tags: ["Finance", "Savings", "Security"],
    assignees: [],
  },
]

// Helper functions
const formatDate = (date: Date) => {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

const getDaysUntilDeadline = (deadline: Date) => {
  const today = new Date()
  const diffTime = deadline.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
}

const getProgressColor = (progress: number) => {
  if (progress >= 80) return "bg-green-400"
  if (progress >= 60) return "bg-blue-400"
  if (progress >= 40) return "bg-yellow-400"
  if (progress >= 20) return "bg-orange-400"
  return "bg-red-400"
}

// Plan Details Modal Component
const PlanDetailsModal = ({ plan, onClose, onEdit, onDelete }: any) => {
  if (!plan) return null

  const category = planCategories.find((c) => c.id === plan.categoryId)
  const priority = priorityLevels.find((p) => p.id === plan.priorityId)
  const status = planStatuses.find((s) => s.id === plan.statusId)
  const daysLeft = getDaysUntilDeadline(plan.deadline)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div
        className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className={`p-6 text-white relative ${category ? category.color : "bg-blue-500"
            } bg-gradient-to-r from-${category?.color.split("-")[1]}-500 to-${category?.color.split("-")[1]}-400`}
        >
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-white/80 hover:text-white p-1 rounded-full hover:bg-white/20"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold mb-2">{plan.title}</h2>
              <div className="flex items-center gap-4 text-white/90">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span className="text-sm">Due: {formatDate(plan.deadline)}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  <span className="text-sm">
                    {daysLeft > 0
                      ? `${daysLeft} days left`
                      : daysLeft === 0
                        ? "Due today"
                        : `${Math.abs(daysLeft)} days overdue`}
                  </span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">{plan.progress}%</div>
              <div className="text-sm text-white/80">Complete</div>
            </div>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2">
            <div
              className="bg-white rounded-full h-2 transition-all duration-300"
              style={{ width: `${plan.progress}%` }}
            ></div>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)] custom-scrollbar">
          <div className="space-y-6">
            {/* Description */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Description</h3>
              <p className="text-gray-600 leading-relaxed">{plan.description}</p>
            </div>

            {/* Plan Details */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-500 mb-2">Category</h4>
                <div className="flex items-center">
                  {category && <category.icon className="h-4 w-4 mr-2 text-gray-600" />}
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${category?.color} text-white`}>
                    {category?.name}
                  </span>
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-500 mb-2">Priority</h4>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${priority?.color} text-white`}>
                  {priority?.name}
                </span>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-500 mb-2">Status</h4>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${status?.color} text-white`}>
                  {status?.name}
                </span>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-500 mb-2">Created</h4>
                <span className="text-gray-700">{formatDate(plan.createdAt)}</span>
              </div>
            </div>

            {/* Milestones */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Milestones</h3>
              <div className="space-y-3">
                {plan.milestones.map((milestone: any) => (
                  <div
                    key={milestone.id}
                    className={`flex items-center p-3 rounded-lg border ${milestone.completed ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-200"
                      }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full mr-3 flex items-center justify-center ${milestone.completed ? "bg-green-400" : "bg-gray-300"
                        }`}
                    >
                      {milestone.completed && <CheckCircle className="h-3 w-3 text-white" />}
                    </div>
                    <div className="flex-1">
                      <h4
                        className={`font-medium ${milestone.completed ? "text-green-700 line-through" : "text-gray-700"
                          }`}
                      >
                        {milestone.title}
                      </h4>
                      <p className="text-xs text-gray-500">Due: {formatDate(milestone.dueDate)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tags */}
            {plan.tags && plan.tags.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {plan.tags.map((tag: string, index: number) => (
                    <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Assignees */}
            {plan.assignees && plan.assignees.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Team Members</h3>
                <div className="flex flex-wrap gap-2">
                  {plan.assignees.map((assignee: string, index: number) => (
                    <div key={index} className="flex items-center bg-gray-100 rounded-full px-3 py-1">
                      <Users className="h-3 w-3 mr-1 text-gray-500" />
                      <span className="text-xs font-medium text-gray-700">{assignee}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="mt-8 flex justify-between">
            <Button
              variant="outline"
              className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
              onClick={() => {
                if (confirm("Are you sure you want to delete this plan?")) {
                  onDelete(plan.id)
                  onClose()
                }
              }}
            >
              <Trash2 className="h-4 w-4 mr-1" /> Delete Plan
            </Button>
            <Button onClick={() => onEdit(plan)} className="relative group overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-400 to-blue-500 group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:via-purple-500 group-hover:to-blue-600 transition-all duration-300"></div>
              <span className="relative z-10 flex items-center justify-center text-white">Edit Plan</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Plan Card Component
const PlanCard = ({ plan, onPlanClick }: any) => {
  const category = planCategories.find((c) => c.id === plan.categoryId)
  const priority = priorityLevels.find((p) => p.id === plan.priorityId)
  const status = planStatuses.find((s) => s.id === plan.statusId)
  const daysLeft = getDaysUntilDeadline(plan.deadline)
  const progressColor = getProgressColor(plan.progress)

  return (
    <div
      className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300 cursor-pointer group relative overflow-hidden"
      onClick={() => onPlanClick(plan)}
    >
      {/* Decorative accent */}
      <div className={`absolute top-0 left-0 w-full h-1 ${category?.color || "bg-gray-400"}`}></div>

      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 text-lg mb-2 group-hover:text-blue-600 transition-colors">
            {plan.title}
          </h3>
          <p className="text-gray-600 text-sm line-clamp-2 mb-3">{plan.description}</p>
        </div>
        <button
          className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors opacity-0 group-hover:opacity-100"
          onClick={(e) => {
            e.stopPropagation()
            // Handle plan options menu
          }}
        >
          <MoreHorizontal size={16} />
        </button>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">Progress</span>
          <span className="text-sm font-bold text-gray-900">{plan.progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`${progressColor} rounded-full h-2 transition-all duration-500`}
            style={{ width: `${plan.progress}%` }}
          ></div>
        </div>
      </div>

      {/* Plan Details */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center">
            {category && <category.icon className="h-3 w-3 mr-1 text-gray-500" />}
            <span className={`px-2 py-1 rounded-full font-medium ${category?.color} text-white`}>{category?.name}</span>
          </div>
          <span className={`px-2 py-1 rounded-full font-medium ${priority?.color} text-white`}>{priority?.name}</span>
        </div>
        <div className="text-right">
          <div className="flex items-center text-gray-500 mb-1">
            <Calendar size={12} className="mr-1" />
            <span>{formatDate(plan.deadline)}</span>
          </div>
          <div
            className={`text-xs font-medium ${daysLeft < 0 ? "text-red-600" : daysLeft <= 7 ? "text-orange-600" : "text-gray-600"
              }`}
          >
            {daysLeft > 0
              ? `${daysLeft} days left`
              : daysLeft === 0
                ? "Due today"
                : `${Math.abs(daysLeft)} days overdue`}
          </div>
        </div>
      </div>

      {/* Milestones Preview */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">Milestones</span>
          <span className="text-xs font-medium text-gray-700">
            {plan.milestones.filter((m: any) => m.completed).length}/{plan.milestones.length} completed
          </span>
        </div>
        <div className="flex gap-1 mt-2">
          {plan.milestones.slice(0, 4).map((milestone: any, index: number) => (
            <div
              key={milestone.id}
              className={`flex-1 h-1 rounded-full ${milestone.completed ? "bg-green-400" : "bg-gray-200"
                } transition-colors duration-300`}
            ></div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Add/Edit Plan Modal Component
const PlanModal = ({ plan, onClose, onSave, isNew = false }: any) => {
  const [title, setTitle] = useState(plan?.title || "")
  const [description, setDescription] = useState(plan?.description || "")
  const [categoryId, setCategoryId] = useState(plan?.categoryId || 1)
  const [priorityId, setPriorityId] = useState(plan?.priorityId || 2)
  const [statusId, setStatusId] = useState(plan?.statusId || 1)
  const [deadline, setDeadline] = useState(plan?.deadline ? plan.deadline.toISOString().slice(0, 10) : "")
  const [progress, setProgress] = useState(plan?.progress || 0)
  const [tags, setTags] = useState(plan?.tags?.join(", ") || "")
  const [assignees, setAssignees] = useState(plan?.assignees?.join(", ") || "")

  const handleSave = () => {
    if (!title || !description || !deadline) {
      alert("Please fill in all required fields")
      return
    }

    const updatedPlan = {
      id: plan?.id || Date.now(),
      title,
      description,
      categoryId: Number(categoryId),
      priorityId: Number(priorityId),
      statusId: Number(statusId),
      deadline: new Date(deadline),
      progress: Number(progress),
      tags: tags ? tags.split(",").map((t: string) => t.trim()) : [],
      assignees: assignees ? assignees.split(",").map((a: string) => a.trim()) : [],
      createdAt: plan?.createdAt || new Date(),
      updatedAt: new Date(),
      milestones: plan?.milestones || [],
    }

    onSave(updatedPlan)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div
        className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className={`p-4 text-white ${isNew ? "bg-gradient-to-r from-blue-500 to-purple-500" : "bg-gradient-to-r from-blue-500 to-teal-500"
            }`}
        >
          <h2 className="text-xl font-semibold">{isNew ? "Create New Plan" : "Edit Plan"}</h2>
        </div>

        <div className="p-6 max-h-[calc(90vh-120px)] overflow-y-auto custom-scrollbar">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Plan Title*
                </label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter plan title"
                  required
                  className="w-full"
                />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description*
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your plan in detail"
                  rows={4}
                  className="w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-3"
                  required
                />
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  id="category"
                  value={categoryId}
                  onChange={(e) => setCategoryId(Number(e.target.value))}
                  className="w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
                >
                  {planCategories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
                  Priority
                </label>
                <select
                  id="priority"
                  value={priorityId}
                  onChange={(e) => setPriorityId(Number(e.target.value))}
                  className="w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
                >
                  {priorityLevels.map((priority) => (
                    <option key={priority.id} value={priority.id}>
                      {priority.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  id="status"
                  value={statusId}
                  onChange={(e) => setStatusId(Number(e.target.value))}
                  className="w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
                >
                  {planStatuses.map((status) => (
                    <option key={status.id} value={status.id}>
                      {status.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="deadline" className="block text-sm font-medium text-gray-700 mb-1">
                  Deadline*
                </label>
                <Input
                  id="deadline"
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  required
                  className="w-full"
                />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="progress" className="block text-sm font-medium text-gray-700 mb-1">
                  Progress: {progress}%
                </label>
                <input
                  id="progress"
                  type="range"
                  min="0"
                  max="100"
                  value={progress}
                  onChange={(e) => setProgress(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div>
                <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
                  Tags (comma separated)
                </label>
                <Input
                  id="tags"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="tag1, tag2, tag3"
                  className="w-full"
                />
              </div>

              <div>
                <label htmlFor="assignees" className="block text-sm font-medium text-gray-700 mb-1">
                  Team Members (comma separated)
                </label>
                <Input
                  id="assignees"
                  value={assignees}
                  onChange={(e) => setAssignees(e.target.value)}
                  placeholder="John Doe, Jane Smith"
                  className="w-full"
                />
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-end gap-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave} className="relative group overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-400 to-blue-500 group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:via-purple-500 group-hover:to-blue-600 transition-all duration-300"></div>
              <span className="relative z-10 flex items-center justify-center text-white">
                <Plus className="mr-1 h-4 w-4" />
                {isNew ? "Create Plan" : "Save Changes"}
              </span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Main Planning Component
const PlanningPage = () => {
  const [plans, setPlans] = useState(samplePlans)
  const [selectedPlan, setSelectedPlan] = useState<any>(null)
  const [showPlanModal, setShowPlanModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterCategory, setFilterCategory] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handlePlanClick = (plan: any) => {
    setSelectedPlan(plan)
    setShowDetailsModal(true)
  }

  const handleAddPlan = () => {
    setSelectedPlan(null)
    setShowPlanModal(true)
  }

  const handleEditPlan = (plan: any) => {
    setSelectedPlan(plan)
    setShowDetailsModal(false)
    setShowPlanModal(true)
  }

  const handleSavePlan = (plan: any) => {
    if (plan.id && plans.some((p) => p.id === plan.id)) {
      // Update existing plan
      setPlans(plans.map((p) => (p.id === plan.id ? plan : p)))
    } else {
      // Add new plan
      setPlans([plan, ...plans])
    }
  }

  const handleDeletePlan = (planId: number) => {
    setPlans(plans.filter((p) => p.id !== planId))
  }

  // Filter plans
  const filteredPlans = plans.filter((plan) => {
    const matchesSearch =
      plan.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plan.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plan.tags.some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesCategory = filterCategory === "all" || plan.categoryId === Number(filterCategory)
    const matchesStatus = filterStatus === "all" || plan.statusId === Number(filterStatus)

    return matchesSearch && matchesCategory && matchesStatus
  })

  // Statistics
  const totalPlans = plans.length
  const completedPlans = plans.filter((p) => p.statusId === 4).length
  const inProgressPlans = plans.filter((p) => p.statusId === 2).length
  const averageProgress =
    plans.length > 0 ? Math.round(plans.reduce((sum, p) => sum + p.progress, 0) / plans.length) : 0

  if (!mounted) return null

  return (
    <div className="bg-gray-50 max-h-screen">
      <div className=" mx-auto p-4">
        {/* Header Section */}
        <div className="mb-6 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-400 to-teal-400 opacity-10 rounded-xl"></div>
          <div className="bg-gradient-to-r from-blue-50 via-purple-50 to-teal-50 rounded-xl p-6 relative shadow-lg border border-white" style={{ zIndex: 1 }}>
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 rounded-full opacity-5 translate-x-1/3 -translate-y-1/3"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-400 rounded-full opacity-5 -translate-x-1/3 translate-y-1/3"></div>

            <div className="relative z-10">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600 bg-clip-text text-transparent mb-2">
                Planning Dashboard
              </h1>
              <div className="text-gray-600 text-sm mb-4">Dashboard • Planning</div>
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="bg-white bg-opacity-70 backdrop-blur-sm rounded-lg px-4 py-3 shadow-sm border border-white flex items-center">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                    <span className="text-blue-500 font-semibold">{totalPlans}</span>
                  </div>
                  <span className="text-gray-700">Total Plans</span>
                </div>
                <div className="bg-white bg-opacity-70 backdrop-blur-sm rounded-lg px-4 py-3 shadow-sm border border-white flex items-center">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-3">
                    <span className="text-green-500 font-semibold">{completedPlans}</span>
                  </div>
                  <span className="text-gray-700">Completed</span>
                </div>
                <div className="bg-white bg-opacity-70 backdrop-blur-sm rounded-lg px-4 py-3 shadow-sm border border-white flex items-center">
                  <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center mr-3">
                    <span className="text-orange-500 font-semibold">{inProgressPlans}</span>
                  </div>
                  <span className="text-gray-700">In Progress</span>
                </div>
                <div className="bg-white bg-opacity-70 backdrop-blur-sm rounded-lg px-4 py-3 shadow-sm border border-white flex items-center">
                  <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center mr-3">
                    <span className="text-purple-500 font-semibold">{averageProgress}%</span>
                  </div>
                  <span className="text-gray-700">Avg Progress</span>
                </div>
              </div>
            </div>
            <div className="absolute right-6 top-1/2 transform -translate-y-1/2">
              <Image src={Planning} alt="Planning illustration" width={150} height={150} unoptimized />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center">
              <span className="bg-gradient-to-r from-blue-500 to-purple-400 w-5 h-5 rounded-md mr-2"></span>
              My Plans
            </h2>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search plans..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64 pl-10"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
              >
                <option value="all">All Categories</option>
                {planCategories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
              >
                <option value="all">All Statuses</option>
                {planStatuses.map((status) => (
                  <option key={status.id} value={status.id}>
                    {status.name}
                  </option>
                ))}
              </select>
              <Button onClick={handleAddPlan} className="relative group overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-400 to-blue-500 group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:via-purple-500 group-hover:to-blue-600 transition-all duration-300"></div>
                <span className="relative z-10 flex items-center justify-center text-white">
                  <Plus size={16} className="mr-1" />
                  New Plan
                </span>
              </Button>
            </div>
          </div>

          <div className="p-6">
            {filteredPlans.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPlans.map((plan) => (
                  <PlanCard key={plan.id} plan={plan} onPlanClick={handlePlanClick} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Target className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No plans found</h3>
                <p className="text-gray-500 mb-4">
                  {searchQuery || filterCategory !== "all" || filterStatus !== "all"
                    ? "No plans match your current filters"
                    : "You haven't created any plans yet"}
                </p>
                <Button onClick={handleAddPlan} className="relative group overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-400 to-blue-500 group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:via-purple-500 group-hover:to-blue-600 transition-all duration-300"></div>
                  <span className="relative z-10 flex items-center justify-center text-white">
                    <Plus size={16} className="mr-1" />
                    Create your first plan
                  </span>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Plan Details Modal */}
      {showDetailsModal && selectedPlan && (
        <PlanDetailsModal
          plan={selectedPlan}
          onClose={() => {
            setShowDetailsModal(false)
            setSelectedPlan(null)
          }}
          onEdit={handleEditPlan}
          onDelete={handleDeletePlan}
        />
      )}

      {/* Add/Edit Plan Modal */}
      {showPlanModal && (
        <PlanModal
          plan={selectedPlan}
          onClose={() => {
            setShowPlanModal(false)
            setSelectedPlan(null)
          }}
          onSave={handleSavePlan}
          isNew={!selectedPlan}
        />
      )}
    </div>
  )
}

export default PlanningPage
