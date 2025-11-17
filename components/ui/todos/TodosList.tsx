import { Button } from '@/components/shared/ui/Button'
import { Clock, MoreHorizontal, Plus } from 'lucide-react'
import React, { useState } from 'react'
import Image from 'next/image'
import todos from "@/public/asset/todo.jpg"
import progress from "@/public/asset/progress.jpg"
import done from "@/public/asset/done.jpg"
const kanbanColumns = [
    {
        title: "To Do",
        color: "bg-blue-500",
        cards: [
            {
                title: "Research competitors",
                tags: ["Marketing", "Research"],
                dueDate: "Jun 15",
                image: todos,
            },
            {
                title: "Update documentation",
                tags: ["Development"],
                dueDate: "Jun 18",
            },
        ],
    },
    {
        title: "In Progress",
        color: "bg-yellow-400",
        cards: [
            {
                title: "Design new landing page",
                tags: ["Design", "Website"],
                dueDate: "Jun 14",
                image: progress,
            },
        ],
    },
    {
        title: "Done",
        color: "bg-green-400",
        cards: [
            {
                title: "Fix navigation bug",
                tags: ["Development", "Bug"],
                dueDate: "Jun 10",
                image: done,
            },
        ],
    },
    {
        title: "Done",
        color: "bg-green-400",
        cards: [
            {
                title: "Fix navigation bug",
                tags: ["Development", "Bug"],
                dueDate: "Jun 10",
                image: done,
            },
        ],
    },
    {
        title: "Done",
        color: "bg-green-400",
        cards: [
            {
                title: "Fix navigation bug",
                tags: ["Development", "Bug"],
                dueDate: "Jun 10",
                image: done,
            },
        ],
    },
]
const TodosList = () => {
    const [isShowDetail, setIsShowDetail] = useState(false);


    return (
        <div className="h-screen">
            <div className="mb-6 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-400 to-teal-400 opacity-10 rounded-xl"></div>
                <div className="bg-gradient-to-r from-blue-50 via-purple-50 to-teal-50 rounded-xl p-6 relative shadow-lg border border-white z-1" style={{ zIndex: 1 }}>
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
                                    <span className="text-blue-500 font-semibold">10</span>
                                </div>
                                <span className="text-gray-700">Total Tasks</span>
                            </div>
                            <div className="bg-white bg-opacity-70 backdrop-blur-sm rounded-lg px-4 py-3 shadow-sm border border-white flex items-center">
                                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-3">
                                    <span className="text-green-500 font-semibold">10</span>
                                </div>
                                <span className="text-gray-700">Completed</span>
                            </div>
                            <div className="bg-white bg-opacity-70 backdrop-blur-sm rounded-lg px-4 py-3 shadow-sm border border-white flex items-center">
                                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center mr-3">
                                    <span className="text-purple-500 font-semibold">100%</span>
                                </div>
                                <span className="text-gray-700">Completion Rate</span>
                            </div>
                        </div>
                    </div>
                    <div className="absolute right-6 top-1/2 transform -translate-y-1/2">
                        <Image src="/asset/task.png" alt="Tasks illustration" width={120} height={120} unoptimized />
                    </div>
                </div>
            </div>
            <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-gray-200 p-4">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">Project Tasks</h3>
                    <Button variant="outline" size="sm">
                        <Plus className="h-4 w-4 mr-1" /> Add Column
                    </Button>
                </div>
                <div className="grid grid-cols-4 gap-4">
                    {kanbanColumns.map((column, colIndex) => (
                        <div key={colIndex} className="bg-gray-50 rounded-lg p-3">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <div className={`w-3 h-3 rounded-full ${column.color}`}></div>
                                    <h4 className="font-medium">{column.title}</h4>
                                </div>
                                <MoreHorizontal className="h-4 w-4 text-gray-400" />
                            </div>
                            <div className="space-y-3">
                                {column.cards.map((card, cardIndex) => (
                                    <div
                                        key={cardIndex}
                                        className="bg-white p-3 rounded-md shadow-sm border border-gray-200 cursor-pointer hover:shadow-md transition-shadow"
                                    >
                                        {card.image && (
                                            <div className="mb-2 rounded-md overflow-hidden">
                                                <Image
                                                    src={card.image}
                                                    alt="Task attachment"
                                                    width={220}
                                                    height={80}
                                                    className="w-full h-30 object-cover"
                                                    unoptimized
                                                />
                                            </div>
                                        )}
                                        <h5 className="font-medium mb-2">{card.title}</h5>
                                        <div className="flex flex-wrap gap-1 mb-2">
                                            {card.tags.map((tag, tagIndex) => (
                                                <span key={tagIndex} className="text-xs px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                        <div className="flex items-center justify-between text-xs text-gray-500">
                                            <div className="flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                {card.dueDate}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <Button variant="ghost" size="sm" className="w-full text-gray-500 justify-start">
                                    <Plus className="h-4 w-4 mr-1" /> Add Card
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default TodosList