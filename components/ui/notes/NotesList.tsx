import LandingSpinner from "@/components/shared/LandingSpinner"
import { Button } from "@/components/shared/ui/Button"
import { Input } from "@/components/shared/ui/Input"
import useFetchNote from "@/lib/hooks/useFetchNote"
import { Note } from "@/lib/types/comon"
import todo from "@/public/asset/TodosImage.png"
import { NoteService } from "@/service/note.service"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Check, Info, Plus, Save, Search, Trash2, X } from "lucide-react"
import Image from "next/image"
import { useEffect, useRef, useState } from "react"
import { toast } from "react-hot-toast"
import NoteCard from "./NoteCard"
import { Switch } from "@/components/shared/ui/swtich"
import { formatDateToYYYYMMDD } from "@/utils/dateformat"


// Note color options with enhanced styling
const noteColors = [
  { color: "bg-blue-400", ring: "ring-blue-500", name: "Blue", gradient: "from-blue-400 to-blue-300" },
  { color: "bg-green-400", ring: "ring-green-500", name: "Green", gradient: "from-green-400 to-green-300" },
  { color: "bg-yellow-400", ring: "ring-yellow-500", name: "Yellow", gradient: "from-yellow-400 to-yellow-300" },
  { color: "bg-orange-400", ring: "ring-orange-500", name: "Orange", gradient: "from-orange-400 to-orange-300" },
  { color: "bg-teal-400", ring: "ring-teal-500", name: "Teal", gradient: "from-teal-400 to-teal-300" },
  { color: "bg-purple-400", ring: "ring-purple-500", name: "Purple", gradient: "from-purple-400 to-purple-300" },
  { color: "bg-pink-400", ring: "ring-pink-500", name: "Pink", gradient: "from-pink-400 to-pink-300" },
]

// Define a Note type matching notes_data


// Confirmation Dialog Component
export const ConfirmationDialog = ({ show, onConfirm, onClose }: { show: boolean; onConfirm: () => void; onClose: () => void }) => {
  if (!show) return null

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm notes-modal flex items-center justify-center p-4 animate-modalFadeIn"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden animate-modalScaleIn modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-red-500 p-4 text-white">
          <h2 className="text-xl font-semibold">Delete Note</h2>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <div className="flex items-center justify-center w-16 h-16 mx-auto bg-red-100 rounded-full mb-4">
              <Trash2 className="h-8 w-8 text-red-500" />
            </div>
            <p className="text-center text-gray-700">
              Are you sure you want to delete this note? This action cannot be undone.
            </p>
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              className="bg-red-500 hover:bg-red-600 text-white"
              onClick={() => {
                onConfirm()
                onClose()
              }}
            >
              Delete
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}


// Main Notes List Component
const NotesList = () => {
  const queryClient = useQueryClient()
  const { data: notesData = [], isLoading, error } = useFetchNote()
  const [notes, setNotes] = useState<Note[]>([])
  const [selectedNote, setSelectedNote] = useState<Note | null>(null)

  const [selectedColor, setSelectedColor] = useState<number>(0)
  const [showDelete, setShowDelete] = useState(false)
  const [addNote, setAddNote] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [noteToDelete, setNoteToDelete] = useState<number | null>(null)
  const [editedContent, setEditedContent] = useState("")
  const [editedTitle, setEditedTitle] = useState("")
  const [mounted, setMounted] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [isCalendarEvent, setIsCalendarEvent] = useState(false)
  const [closeNote, setCloseNote] = useState(false)
  const [editNote, setEditNote] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (notesData?.length > 0) {
      setNotes(notesData)
      if (!selectedNote) setSelectedNote(notesData[0]) // Prevent undefined
      setIsCalendarEvent(notesData[0].isCalendarEvent)
    }
  }, [notesData, selectedNote])

  console.log("isCalendarEvent", isCalendarEvent)

  useEffect(() => {
    if (selectedNote) {
      setEditedContent(selectedNote.content)
      setEditedTitle(selectedNote.title)
      setSelectedColor(noteColors.findIndex((c) => c.color === selectedNote.color) || 0)
      setIsCalendarEvent(selectedNote.calendarEvent)
    }
  }, [selectedNote])

  useEffect(() => {
    if (addNote && textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [addNote])

  //mutation create note
  const { mutate: createNote } = useMutation({
    mutationFn: (data: any) => NoteService.createNote(data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["notes"] })
      toast.success("Note created successfully")
    },
    onError: (error: any) => {
      console.log(error)
      toast.error("Failed to create note")
    }
    ,
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] })
    }
  })

  //mutation update note
  const { mutate: updateNote } = useMutation({
    mutationFn: (data: any) => NoteService.updateNote(data.id, data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["notes"] })
      await queryClient.invalidateQueries({ queryKey: ["calendar"] })
      toast.success("Note updated successfully")
    },
    onError: (error: any) => {
      console.log(error)
      toast.error("Failed to update note")
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] })
    }
  })


  //mutation delete note
  const { mutate: deleteNote } = useMutation({
    mutationFn: (id: any) => NoteService.deleteNote(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["notes"] })
      toast.success("Note deleted successfully")
      //close modal
      setShowDelete(false)
    },
    onError: (error: any) => {
      console.log(error)
      toast.error("Failed to delete note")
    }
  })


  const handleDeleteNote = () => {
    deleteNote(noteToDelete)
    setNoteToDelete(null)
  }

  const handleNoteSelect = (note: Note) => {
    setSelectedNote(note)
    setAddNote(false)
    setNoteToDelete(note.id)
    setIsCalendarEvent(note.calendarEvent)
  }


  const handleAddNote = () => {
    setAddNote(true)
    // setSelectedNote(null)
    setEditedContent("")
    setEditedTitle("")
    setSelectedColor(0)
    setIsCalendarEvent(false)
  }

  const handleCloseNote = () => {
    setAddNote(false)
    setEditNote(false)
    setCloseNote(false)
    setIsCalendarEvent(false)
    setEditedContent("")
    setEditedTitle("")
    setSelectedColor(0)

    if (notes.length > 0) {
      setSelectedNote(notes[0])
    }
  }

  const handleEditNote = (note: Note) => {
    setEditNote(true)
    setSelectedNote(note)
    setAddNote(false)
    setNoteToDelete(note.id)
    setIsCalendarEvent(note.calendarEvent)
    setEditedContent(note.content)
    setEditedTitle(note.title)
    setSelectedColor(noteColors.findIndex((c) => c.color === note.color) || 0)
  }

  const handleSaveNote = () => {
    if (addNote) {
      const newNote = {
        id: Date.now(), // Temporary ID
        title: editedTitle || "Untitled Note",
        content: editedContent,
        createdAt: formatDateToYYYYMMDD(new Date().toISOString()),
        updatedAt: formatDateToYYYYMMDD(new Date().toISOString()),
        color: noteColors[selectedColor].color,
        textColor: `text-${noteColors[selectedColor].color.split("-")[1]}-900`,
        calendarEvent: isCalendarEvent,
      }

      setSelectedNote(newNote)
      setAddNote(false)
      createNote(newNote)
    } else if (selectedNote) {
      const updatedNote = {
        ...selectedNote,
        title: editedTitle,
        content: editedContent,
        createdAt: formatDateToYYYYMMDD(selectedNote.createdAt),
        updatedAt: formatDateToYYYYMMDD(new Date().toISOString()),
        color: noteColors[selectedColor].color,
        textColor: `text-${noteColors[selectedColor].color.split("-")[1]}-900`,
        calendarEvent: isCalendarEvent,
      }

      updateNote(updatedNote)
      setSelectedNote(updatedNote)
    }
  }


  const filteredNotes = notes.filter(
    (note) =>
      note.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content?.toLowerCase().includes(searchQuery.toLowerCase())
  )


  if (!mounted) return null
  if (isLoading) return (
    <div className="bg-gray-50 max-h-screen overflow-auto">
      <div className="mx-auto p-4">
        <LandingSpinner />
      </div>
    </div>
  )

  return (
    <div className="bg-gray-50 custom-scrollbar overflow-auto">
      <div className=" mx-auto p-4">
        {/* Header Section */}
        <div className="mb-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-400 to-teal-400 opacity-10 rounded-xl"></div>
          <div className="bg-gradient-to-r from-blue-50 via-purple-50 to-teal-50 rounded-xl p-6 relative shadow-lg border border-white" style={{ zIndex: 1 }}>
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 rounded-full opacity-5 translate-x-1/3 -translate-y-1/3"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-400 rounded-full opacity-5 -translate-x-1/3 translate-y-1/3"></div>

            <div className="relative z-10">
              <h1 className="z-10 text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600 bg-clip-text text-transparent mb-2">
                Notes
              </h1>
              <div className="text-gray-600 text-sm mb-4 z-10">Dashboard • Notes ({notes?.length})</div>
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="z-10 bg-white bg-opacity-70 backdrop-blur-sm rounded-lg px-4 py-3 shadow-sm border border-white flex items-center">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                    <span className="text-blue-500 font-semibold">{notes?.length}</span>
                  </div>
                  <span className="text-gray-700">Total Notes</span>
                </div>
                <div className="z-10 bg-white bg-opacity-70 backdrop-blur-sm rounded-lg px-4 py-3 shadow-sm border border-white flex items-center">
                  <div className="w-20   flex items-center justify-center mr-3">
                    <span className="text-purple-500 font-semibold">
                      {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })},
                    </span>
                  </div>
                  <span className="text-gray-700">Today</span>
                </div>
              </div>
            </div>
            <div className="absolute right-6 top-1/2 transform -translate-y-1/2 ">
              <Image src={todo} alt="Notes illustration" width={150} height={150} unoptimized />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center">
              <span className="bg-gradient-to-r from-blue-500 to-purple-400 w-5 h-5 rounded-md mr-2"></span>
              My Notes
            </h2>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search notes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64 pl-10"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
              <Button onClick={handleAddNote} className="relative group overflow-hidden" disabled={addNote}>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-400 to-blue-500 group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:via-purple-500 group-hover:to-blue-600 transition-all duration-300"></div>
                <span className="relative z-10 flex items-center justify-center text-white">
                  <Plus size={16} className="mr-1" />
                  New Note
                </span>
              </Button>
            </div>
          </div>

          <div className="p-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Notes Grid */}
              <div className={`${selectedNote || addNote || editNote ? "w-full md:w-1/2 lg:w-2/3" : "w-full"}`}>
                {filteredNotes?.length > 0 ? (
                  <div className="note-grid">
                    {filteredNotes.map((note) => (
                      <NoteCard
                        key={note.id}
                        note={note}
                        isSelected={Boolean(selectedNote && selectedNote.id === note.id)}
                        onSelect={handleNoteSelect}
                        onDelete={handleDeleteNote}
                        onEdit={handleEditNote}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                    <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-8 w-8 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No notes found</h3>
                    <p className="text-gray-500 mb-4">
                      {searchQuery ? "No notes match your search criteria" : "You haven't created any notes yet"}
                    </p>
                    <Button onClick={handleAddNote} className="relative group overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-400 to-blue-500 group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:via-purple-500 group-hover:to-blue-600 transition-all duration-300"></div>
                      <span className="relative z-10 flex items-center justify-center text-white">
                        <Plus size={16} className="mr-1" />
                        Create your first note
                      </span>
                    </Button>
                  </div>
                )}
              </div>

              {/* Note Editor */}
              {(addNote || editNote) && (
                <div className="w-full md:w-1/2 lg:w-1/3 bg-gray-50 rounded-xl p-6 border border-gray-200 animate-fadeIn">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-800">{addNote ? "Create New Note" : "Edit Note"}</h3>
                    <button
                      onClick={handleCloseNote}
                      className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-200"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label htmlFor="note-title" className="block text-sm font-medium text-gray-700 mb-1">
                        Title
                      </label>
                      <Input
                        id="note-title"
                        value={editedTitle}
                        onChange={(e) => setEditedTitle(e.target.value)}
                        placeholder="Note title"
                        className="w-full"
                      />
                    </div>

                    <div>
                      <label htmlFor="note-content" className="block text-sm font-medium text-gray-700 mb-1">
                        Content
                      </label>
                      <textarea
                        ref={textareaRef}
                        id="note-content"
                        value={editedContent}
                        onChange={(e) => setEditedContent(e.target.value)}
                        placeholder="Write your note here..."
                        className="w-full h-40 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 custom-scrollbar"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Note Color</label>
                      <div className="flex flex-wrap gap-3">
                        {noteColors.map((color, idx) => (
                          <button
                            key={color.color}
                            type="button"
                            className={`relative h-8 w-8 rounded-full flex items-center justify-center cursor-pointer transition-transform duration-200 hover:scale-110 ${selectedColor === idx ? "ring-2 ring-offset-2 " + color.ring : ""
                              }`}
                            onClick={() => setSelectedColor(idx)}
                            style={{
                              background: `linear-gradient(135deg, var(--${color.color.split("-")[1]}-400), var(--${color.color.split("-")[1]
                                }-300))`,
                            }}
                          >
                            {selectedColor === idx && <Check className="h-4 w-4 text-white" />}
                          </button>
                        ))}
                      </div>
                    </div>
                    {/* Add to Calendar */}

                    <div className="md:col-span-2 flex flex-col gap-2 bg-gradient-to-br from-blue-50 via-purple-50 to-blue-100 rounded-xl p-4 shadow-inner border border-blue-100">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-blue-700 flex items-center">
                            <Info className="h-4 w-4 mr-1 text-blue-400" />
                            Add to Calendar
                          </span>
                          <span className="ml-2 px-2 py-0.5 rounded-full bg-blue-100 text-xs text-blue-600 font-medium animate-pulse">
                            New!
                          </span>
                        </div>
                        <Switch
                          checked={isCalendarEvent}
                          onCheckedChange={() => {
                            setIsCalendarEvent(!isCalendarEvent)
                          }}
                          className="scale-110"
                        />
                      </div>
                      <div className="mt-2 text-xs text-gray-600 flex items-center gap-2">
                        <span>
                          {isCalendarEvent
                            ? "This note will be added to your calendar and you'll get reminders."
                            : "Enable to sync this note with your calendar and receive smart notifications."}
                        </span>
                        {isCalendarEvent && (
                          <span className="inline-flex items-center gap-1 text-green-600 font-medium">
                            <svg className="h-4 w-4 animate-bounce" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" /></svg>
                            Synced!
                          </span>
                        )}
                      </div>
                      {isCalendarEvent && (
                        <div className="mt-3 flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg p-2">
                          <svg className="h-5 w-5 text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M8 7V3M16 7V3M4 11h16M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                          <span className="text-xs text-blue-700">
                            Calendar event will include note title, content, and color.
                          </span>
                        </div>
                      )}

                    </div>



                    <div className="flex justify-end gap-3 pt-4">
                      <Button
                        variant="outline"
                        onClick={(e) => {
                          handleCloseNote()
                          e.stopPropagation()
                          if (editNote) {
                            setEditedContent(editedContent)
                            setEditedTitle(editedTitle)
                          }
                        }}
                      >
                        Cancel
                      </Button>
                      <Button onClick={handleSaveNote} className="relative group overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-400 to-blue-500 group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:via-purple-500 group-hover:to-blue-600 transition-all duration-300"></div>
                        <span className="relative z-10 flex items-center justify-center text-white">
                          <Save className="mr-1 h-4 w-4" />
                          {addNote ? "Create Note" : "Save Changes"}
                        </span>
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        show={showDelete}
        onConfirm={handleDeleteNote}
        onClose={() => setShowDelete(false)}
      />


    </div>
  )
}

export default NotesList
