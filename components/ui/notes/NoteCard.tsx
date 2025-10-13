import { Note } from "@/lib/types/comon"
import { formatDate } from "@/utils/dateformat"
import { CalendarDays, Edit, Trash2 } from "lucide-react"
import { useState } from "react"
import NoteDetailModal from "./NoteDetailModal"

type NoteCardProps = {
    note: Note
    isSelected: boolean
    onSelect: (note: Note) => void
    onDelete: (note: Note) => void
    onEdit: (note: Note) => void
}

// Note Card Component
const NoteCard = ({ note, isSelected, onSelect, onDelete, onEdit }: NoteCardProps) => {
    const [isShowDetail, setIsShowDetail] = useState(false)

    const getGradient = (color: string) => {
        const colorMap: Record<string, string> = {
            "bg-blue-400": "from-blue-400 to-blue-300",
            "bg-green-400": "from-green-400 to-green-300",
            "bg-yellow-400": "from-yellow-400 to-yellow-300",
            "bg-orange-400": "from-orange-400 to-orange-300",
            "bg-teal-400": "from-teal-400 to-teal-300",
            "bg-purple-400": "from-purple-400 to-purple-300",
            "bg-pink-400": "from-pink-400 to-pink-300",
        }
        return colorMap[color] || "from-gray-400 to-gray-300"
    }

    return (
        <>
            <div
                className={`relative group rounded-xl overflow-hidden transition-all duration-300 ${isSelected ? "ring-2 ring-offset-2 ring-blue-500 shadow-md" : "shadow-sm hover:shadow-md"
                    }`}
                onClick={(e) => {
                    e.stopPropagation()
                    onSelect(note)
                }}
            >
                <div
                    className={`absolute inset-0 bg-gradient-to-br ${getGradient(
                        note.color,
                    )} opacity-90 transition-opacity duration-300 group-hover:opacity-100`}
                ></div>
                <div className="relative p-4 h-full flex flex-col">
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-sm text-gray-900 truncate max-w-[80%]">{note.title}</h3>
                        <div className="flex gap-1 ml-auto">
                            <button
                                className="text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:text-blue-600 p-1 rounded-full hover:bg-white hover:bg-opacity-30"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    onEdit(note)
                                }}
                            >
                                <Edit size={14} />
                            </button>
                            <button
                                className="text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:text-red-600 p-1 rounded-full hover:bg-white hover:bg-opacity-30"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    onDelete(note)
                                }}
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    </div>
                    <p className="text-xs text-gray-700 line-clamp-3 mb-2 flex-grow">{note.content}</p>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center text-xs text-gray-700 mt-auto">
                            <CalendarDays size={12} className="mr-1" />
                            {formatDate(note.createdAt)}
                        </div>
                        <button
                            className={`${note.textColor} text-xs hover:underline`}
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsShowDetail(true);
                            }}
                        >
                            View Details
                        </button>
                    </div>
                </div>


            </div>
            <NoteDetailModal
                data={note}
                onClose={() => setIsShowDetail(false)}
                onDelete={() => onDelete(note)}
                open={isShowDetail}
            />
        </>
    )
}

export default NoteCard