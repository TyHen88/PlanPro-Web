"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Image from "next/image"
import { CalendarDays, Plus, MoreHorizontal, CheckCircle, Clock, AlertCircle, X } from "lucide-react"
import { formatDateCard } from "@/utils/dateformat"
import { Button } from "@/components/shared/ui/Button"
import { Input } from "@/components/shared/ui/Input"

// Consolidated task data with proper status values
const allTasks = [
    // Todo tasks
    {
        id: 1,
        title: "Todo",
        content:
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam non urna euismod, fermentum nulla a, tincidunt ex.",
        createdAt: "20250510000000",
        updatedAt: "20250511000000",
        color: "bg-yellow-400",
        status: "Todo",
        property: "Design",
        image: "https://matdash-angular-main.netlify.app/assets/images/taskboard/kanban-img-3.jpg",
    },
    // InProgress tasks
    {
        id: 2,
        title: "UI Improvements",
        content: "Improve the navigation bar design and apply new theme colors.",
        createdAt: "20250508000000",
        updatedAt: "20250512000000",
        color: "bg-blue-400",
        status: "InProgress",
        property: "Frontend",
        image: "https://matdash-angular-main.netlify.app/assets/images/taskboard/kanban-img-2.jpg",
    },
    {
        id: 6,
        title: "Wireframe Review",
        content: "Review wireframes with design and product team to confirm alignment.",
        createdAt: "20250510080000",
        updatedAt: "20250515094500",
        color: "bg-indigo-400",
        status: "InProgress",
        property: "Design",
        image: "https://matdash-angular-main.netlify.app/assets/images/taskboard/kanban-img-3.jpg",
    },
    {
        id: 7,
        title: "API Integration",
        content: "Integrate third-party APIs for enhanced data syncing.",
        createdAt: "20250507093000",
        updatedAt: "20250512123000",
        color: "bg-orange-400",
        status: "InProgress",
        property: "Backend",
        image: "https://matdash-angular-main.netlify.app/assets/images/taskboard/kanban-img-2.jpg",
    },
    {
        id: 8,
        title: "Real-time Notifications",
        content: "Implement WebSocket for live notification updates.",
        createdAt: "20250501091500",
        updatedAt: "20250511130000",
        color: "bg-teal-400",
        status: "InProgress",
        property: "Frontend",
        image: "https://matdash-angular-main.netlify.app/assets/images/taskboard/kanban-img-4.jpg",
    },
    {
        id: 9,
        title: "Client Feedback",
        content: "Gather and document feedback from beta testers.",
        createdAt: "20250506000000",
        updatedAt: "20250509000000",
        color: "bg-green-400",
        status: "InProgress",
        property: "Product",
        image: "https://matdash-angular-main.netlify.app/assets/images/taskboard/kanban-img-1.jpg",
    },
    // OnHold tasks
    {
        id: 3,
        title: "Database Optimization",
        content: "Analyze and optimize PostgreSQL indexes for faster queries.",
        createdAt: "20250430000000",
        updatedAt: "20250505000000",
        color: "bg-red-400",
        status: "OnHold",
        property: "Backend",
        image: "https://matdash-angular-main.netlify.app/assets/images/taskboard/kanban-img-4.jpg",
    },
    {
        id: 10,
        title: "Marketing Strategy",
        content: "Paused until product scope is finalized for Q3 campaign.",
        createdAt: "20250502083000",
        updatedAt: "20250508093000",
        color: "bg-gray-400",
        status: "OnHold",
        property: "Marketing",
        image: "https://matdash-angular-main.netlify.app/assets/images/taskboard/kanban-img-2.jpg",
    },
    {
        id: 11,
        title: "Data Migration",
        content: "Postponed due to pending legacy system audit.",
        createdAt: "20250429090000",
        updatedAt: "20250503093000",
        color: "bg-red-300",
        status: "OnHold",
        property: "Infrastructure",
        image: "https://matdash-angular-main.netlify.app/assets/images/taskboard/kanban-img-3.jpg",
    },
    // Completed tasks
    {
        id: 4,
        title: "Testing Phase",
        content: "Conduct unit and integration testing for recent modules.",
        createdAt: "20250501000000",
        updatedAt: "20250513000000",
        color: "bg-purple-400",
        status: "Completed",
        property: "QA",
        image: "https://matdash-angular-main.netlify.app/assets/images/taskboard/kanban-img-3.jpg",
    },
    {
        id: 12,
        title: "Bug Fix Sprint",
        content: "Resolved high-priority bugs reported from the last release.",
        createdAt: "20250425093000",
        updatedAt: "20250505090000",
        color: "bg-green-400",
        status: "Completed",
        property: "QA",
        image: "https://matdash-angular-main.netlify.app/assets/images/taskboard/kanban-img-4.jpg",
    },
    {
        id: 13,
        title: "Security Audit",
        content: "Completed penetration testing and resolved critical vulnerabilities.",
        createdAt: "20250428090000",
        updatedAt: "20250503093000",
        color: "bg-emerald-400",
        status: "Completed",
        property: "DevOps",
        image: "https://matdash-angular-main.netlify.app/assets/images/taskboard/kanban-img-1.jpg",
    },
]

// Define a Task type for task-related props
interface Task {
    id: number;
    title: string;
    content: string;
    createdAt: string;
    updatedAt: string;
    color: string;
    status: string;
    property: string;
    image?: string;
}

interface Column {
    id: string;
    title: string;
    bgColor: string;
    headerColor: string;
    icon: React.ReactNode;
    iconColor: string;
}

// Column configuration with enhanced styling
const columns = [
    {
        id: "Todo",
        title: "Todo",
        bgColor: "from-blue-50 to-blue-100",
        headerColor: "from-blue-400 to-blue-500",
        icon: <Clock className="h-4 w-4" />,
        iconColor: "text-blue-500",
    },
    {
        id: "InProgress",
        title: "In Progress",
        bgColor: "from-orange-50 to-orange-100",
        headerColor: "from-orange-400 to-orange-500",
        icon: <Clock className="h-4 w-4" />,
        iconColor: "text-orange-500",
    },
    {
        id: "OnHold",
        title: "On Hold",
        bgColor: "from-yellow-50 to-yellow-100",
        headerColor: "from-yellow-400 to-yellow-500",
        icon: <AlertCircle className="h-4 w-4" />,
        iconColor: "text-yellow-500",
    },
    {
        id: "Completed",
        title: "Completed",
        bgColor: "from-green-50 to-green-100",
        headerColor: "from-green-400 to-green-500",
        icon: <CheckCircle className="h-4 w-4" />,
        iconColor: "text-green-500",
    },
]

// Individual Task Card Component with enhanced styling
const TaskCard = ({ task, onTaskClick }: { task: Task; onTaskClick: (task: Task) => void }) => {
    const [imageError, setImageError] = useState(false)
    const [isHovered, setIsHovered] = useState(false)

    // Map status to color scheme
    const getColorScheme = (status: string) => {
        switch (status) {
            case "Todo":
                return {
                    border: "border-blue-200",
                    shadow: "shadow-blue-100",
                    hoverShadow: "hover:shadow-blue-200",
                }
            case "InProgress":
                return {
                    border: "border-orange-200",
                    shadow: "shadow-orange-100",
                    hoverShadow: "hover:shadow-orange-200",
                }
            case "OnHold":
                return {
                    border: "border-yellow-200",
                    shadow: "shadow-yellow-100",
                    hoverShadow: "hover:shadow-yellow-200",
                }
            case "Completed":
                return {
                    border: "border-green-200",
                    shadow: "shadow-green-100",
                    hoverShadow: "hover:shadow-green-200",
                }
            default:
                return {
                    border: "border-gray-200",
                    shadow: "shadow-gray-100",
                    hoverShadow: "hover:shadow-gray-200",
                }
        }
    }

    const colorScheme = getColorScheme(task.status)

    return (
        <div
            className={`bg-white rounded-lg ${colorScheme.border} ${colorScheme.shadow
                } p-4 cursor-pointer transition-all duration-300 ${colorScheme.hoverShadow} hover:scale-[1.02] ${isHovered ? "shadow-md" : "shadow-sm"
                } relative overflow-hidden group`}
            onClick={() => onTaskClick(task)}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                    onTaskClick(task)
                }
            }}
            aria-label={`Task: ${task.title}`}
        >
            {/* Decorative accent */}
            <div className={`absolute top-0 left-0 w-full h-1 ${task.color}`}></div>

            <div className="flex justify-between items-start mb-3">
                <h3 className="font-semibold text-gray-900 text-sm leading-tight">{task.title}</h3>
                <button
                    className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
                    onClick={(e) => {
                        e.stopPropagation()
                        // Handle task options menu
                    }}
                    aria-label="Task options"
                >
                    <MoreHorizontal size={16} />
                </button>
            </div>

            {task.image && !imageError && (
                <div className="mb-3 rounded-md overflow-hidden relative group-hover:shadow-md transition-shadow">
                    <Image
                        src={task.image || "/placeholder.svg"}
                        alt={`${task.title} preview`}
                        width={400}
                        height={96}
                        className="w-full h-24 object-cover transition-transform duration-500 group-hover:scale-105"
                        onError={() => setImageError(true)}
                        loading="lazy"
                    />
                </div>
            )}

            <p className="text-gray-600 text-xs mb-3 line-clamp-2">{task.content}</p>

            <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-gray-500 text-xs">
                    <CalendarDays size={12} />
                    <span>{formatDateCard(task.createdAt)}</span>
                </div>
                <span
                    className={`px-2 py-1 text-xs rounded-full text-white font-medium ${task.color} transition-all duration-300 group-hover:shadow-sm`}
                >
                    {task.property}
                </span>
            </div>
        </div>
    )
}

// Column Component with enhanced styling
const KanbanColumn = ({ column, tasks, onTaskClick, onAddTask }: any) => {
    const taskCount = tasks.length

    return (
        <div
            className={`rounded-xl shadow-sm border border-gray-200 flex flex-col h-full overflow-hidden bg-gradient-to-b ${column.bgColor} transition-all duration-300 hover:shadow-md`}
        >
            <div className={`p-4 rounded-t-xl border-b border-gray-200 bg-gradient-to-r ${column.headerColor} text-white`}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className={`${column.iconColor} bg-white bg-opacity-20 p-1 rounded-full`}>{column.icon}</div>
                        <h2 className="font-semibold">{column.title}</h2>
                        <span className="bg-white bg-opacity-20 text-white text-xs font-medium px-2 py-1 rounded-full">
                            {taskCount}
                        </span>
                    </div>
                    <button
                        onClick={() => onAddTask(column.id)}
                        className="text-white hover:bg-white hover:bg-opacity-20 p-1 rounded-full transition-colors"
                        aria-label={`Add task to ${column.title}`}
                    >
                        <Plus size={16} />
                    </button>
                </div>
            </div>

            <div className="p-3 flex-1 overflow-y-auto custom-scrollbar">
                <div className="space-y-3">
                    {tasks.map((task: any) => (
                        <TaskCard key={task.id} task={task} onTaskClick={onTaskClick} />
                    ))}
                    {taskCount === 0 && (
                        <div className="text-center py-8 text-gray-500 bg-white bg-opacity-50 rounded-lg border border-dashed border-gray-300 mt-2">
                            <div className="flex flex-col items-center justify-center">
                                <div className={`${column.iconColor} p-2 rounded-full bg-white mb-2`}>{column.icon}</div>
                                <p className="text-sm">No tasks yet</p>
                                <button
                                    onClick={() => onAddTask(column.id)}
                                    className={`${column.iconColor} hover:underline text-sm mt-2 flex items-center gap-1`}
                                >
                                    <Plus size={14} /> Add your first task
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}



// Add Task Modal Component
const AddTaskModal = ({ isOpen, onClose, onSubmit, initialStatus }: any) => {
    const [title, setTitle] = useState("")
    const [content, setContent] = useState("")
    const [status, setStatus] = useState(initialStatus || "Todo")
    const [property, setProperty] = useState("Design")

    if (!isOpen) return null

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        const newTask = {
            id: Date.now(),
            title,
            content,
            status,
            property,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            color: getColorForProperty(property),
        }
        onSubmit(newTask)
        resetForm()
        onClose()
    }

    const resetForm = () => {
        setTitle("")
        setContent("")
        setStatus(initialStatus || "Todo")
        setProperty("Design")
    }

    const getColorForProperty = (prop: string) => {
        const colorMap: Record<string, string> = {
            Design: "bg-yellow-400",
            Frontend: "bg-blue-400",
            Backend: "bg-orange-400",
            QA: "bg-purple-400",
            Product: "bg-green-400",
            Marketing: "bg-gray-400",
            Infrastructure: "bg-red-300",
            DevOps: "bg-emerald-400",
        }
        return colorMap[prop] || "bg-gray-400"
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 animate-fadeIn">
            <div
                className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden animate-scaleIn"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="bg-gradient-to-r from-blue-500 to-teal-400 p-4 text-white">
                    <h2 className="text-xl font-semibold">Add New Task</h2>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                                Task Title
                            </label>
                            <Input
                                id="title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Enter task title"
                                required
                                className="w-full"
                            />
                        </div>

                        <div>
                            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                                Description
                            </label>
                            <textarea
                                id="content"
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="Enter task description"
                                rows={4}
                                className="w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                                    Status
                                </label>
                                <select
                                    id="status"
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value)}
                                    className="w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
                                >
                                    <option value="Todo">Todo</option>
                                    <option value="InProgress">In Progress</option>
                                    <option value="OnHold">On Hold</option>
                                    <option value="Completed">Completed</option>
                                </select>
                            </div>

                            <div>
                                <label htmlFor="property" className="block text-sm font-medium text-gray-700 mb-1">
                                    Category
                                </label>
                                <select
                                    id="property"
                                    value={property}
                                    onChange={(e) => setProperty(e.target.value)}
                                    className="w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
                                >
                                    <option value="Design">Design</option>
                                    <option value="Frontend">Frontend</option>
                                    <option value="Backend">Backend</option>
                                    <option value="QA">QA</option>
                                    <option value="Product">Product</option>
                                    <option value="Marketing">Marketing</option>
                                    <option value="Infrastructure">Infrastructure</option>
                                    <option value="DevOps">DevOps</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                resetForm()
                                onClose()
                            }}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" className="relative group overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-teal-400 to-blue-500 group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:via-teal-500 group-hover:to-blue-600 transition-all duration-300"></div>
                            <span className="relative z-10 flex items-center justify-center text-white">
                                <Plus className="mr-1 h-4 w-4" /> Create Task
                            </span>
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}

// Main Tasks Component
const Tasks = () => {
    const [selectedTask, setSelectedTask] = useState(null)
    const [showAddTask, setShowAddTask] = useState(false)
    const [initialStatus, setInitialStatus] = useState("Todo")
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
        // Add CSS for custom scrollbar
        const style = document.createElement("style")
        style.textContent = `
      .custom-scrollbar::-webkit-scrollbar {
        width: 6px;
      }
      .custom-scrollbar::-webkit-scrollbar-track {
        background: transparent;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb {
        background-color: rgba(0, 0, 0, 0.1);
        border-radius: 3px;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background-color: rgba(0, 0, 0, 0.2);
      }
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      @keyframes scaleIn {
        from { transform: scale(0.95); opacity: 0; }
        to { transform: scale(1); opacity: 1; }
      }
      .animate-fadeIn {
        animation: fadeIn 0.2s ease-out;
      }
      .animate-scaleIn {
        animation: scaleIn 0.3s ease-out;
      }
    `
        document.head.appendChild(style)
        return () => {
            document.head.removeChild(style)
        }
    }, [])

    // Filter tasks by status
    const getTasksByStatus = (status: any) => {
        return allTasks.filter((task) => task.status === status)
    }

    const handleTaskClick = (task: any) => {
        setSelectedTask(task)
    }

    const handleAddTask = (status: any) => {
        setInitialStatus(status)
        setShowAddTask(true)
    }

    const getTotalTasks = () => allTasks.length
    const getCompletedTasks = () => allTasks.filter((task) => task.status === "Completed").length
    const getCompletionRate = () => {
        const total = getTotalTasks()
        const completed = getCompletedTasks()
        return total > 0 ? Math.round((completed / total) * 100) : 0
    }

    if (!mounted) return null

    return (
        <div className="bg-gray-50 overflow-y-scroll custom-scrollbar">
            <div className="mx-auto p-4">
                {/* Header Section */}
                <div className="mb-6 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-400 to-teal-400 opacity-10 rounded-xl"></div>
                    <div className="bg-gradient-to-r from-blue-50 via-purple-50 to-teal-50 rounded-xl p-6 relative shadow-lg border border-white" style={{ zIndex: 1 }}>
                        {/* Decorative elements */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 rounded-full opacity-5 translate-x-1/3 -translate-y-1/3"></div>
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-400 rounded-full opacity-5 -translate-x-1/3 translate-y-1/3"></div>

                        <div className="relative z-10">
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600 bg-clip-text text-transparent mb-2">
                                Tasks Dashboard
                            </h1>
                            <div className="text-gray-600 text-sm mb-4">Dashboard • Tasks</div>
                            <div className="flex flex-wrap gap-4 text-sm">
                                <div className="bg-white bg-opacity-70 backdrop-blur-sm rounded-lg px-4 py-3 shadow-sm border border-white flex items-center">
                                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                                        <span className="text-blue-500 font-semibold">{getTotalTasks()}</span>
                                    </div>
                                    <span className="text-gray-700">Total Tasks</span>
                                </div>
                                <div className="bg-white bg-opacity-70 backdrop-blur-sm rounded-lg px-4 py-3 shadow-sm border border-white flex items-center">
                                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-3">
                                        <span className="text-green-500 font-semibold">{getCompletedTasks()}</span>
                                    </div>
                                    <span className="text-gray-700">Completed</span>
                                </div>
                                <div className="bg-white bg-opacity-70 backdrop-blur-sm rounded-lg px-4 py-3 shadow-sm border border-white flex items-center">
                                    <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center mr-3">
                                        <span className="text-purple-500 font-semibold">{getCompletionRate()}%</span>
                                    </div>
                                    <span className="text-gray-700">Completion Rate</span>
                                </div>
                            </div>
                        </div>
                        <div className="absolute right-6 top-1/2 transform -translate-y-1/2">
                            <Image src="/asset/task.png" alt="Tasks illustration" width={120} height={120} />
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                    <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                        <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                            <span className="bg-gradient-to-r from-blue-500 to-teal-400 w-5 h-5 rounded-md mr-2"></span>
                            Kanban Board
                        </h2>
                        <Button
                            onClick={() => {
                                setInitialStatus("Todo")
                                setShowAddTask(!showAddTask)
                            }}
                            className="relative group overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-teal-400 to-blue-500 group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:via-teal-500 group-hover:to-blue-600 transition-all duration-300"></div>
                            <span className="relative z-10 flex items-center justify-center text-white">
                                <Plus size={16} className="mr-1" />
                                Add New Task
                            </span>
                        </Button>
                    </div>

                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 h-[calc(100vh-400px)] min-h-96">
                            {columns.map((column) => (
                                <KanbanColumn
                                    key={column.id}
                                    column={column}
                                    tasks={getTasksByStatus(column.id)}
                                    onTaskClick={handleTaskClick}
                                    onAddTask={handleAddTask}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Task Detail Modal */}
            {/* {selectedTask && <TaskDetailModal task={selectedTask} onClose={() => setSelectedTask(null)} />} */}

            {/* Add Task Modal */}
            <AddTaskModal
                isOpen={showAddTask}
                onClose={() => setShowAddTask(false)}
                onSubmit={(newTask: any) => {
                    // Add the new task to your state
                    console.log("New task:", newTask)
                    // In a real app, you would update your state here
                }}
                initialStatus={initialStatus}
            />
        </div>
    )
}

export default Tasks
