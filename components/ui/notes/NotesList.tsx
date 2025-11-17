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
import { toast } from "sonner"
import NoteCard from "./NoteCard"
import { Toggle } from "@/components/shared/ui/toggle"
import { formatDateToYYYYMMDD } from "@/utils/dateformat"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/shared/ui/dialog"

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

// Confirmation Dialog Component
export const ConfirmationDialog = ({ show, onConfirm, onClose }: { show: boolean; onConfirm: () => void; onClose: () => void }) => {
  if (!show) return null

  return (
    <div
      className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm notes-modal flex items-center justify-center p-4 animate-modalFadeIn z-50"
      onClick={onClose}
    >
      <div
        className="bg-card rounded-xl shadow-2xl max-w-md w-full overflow-hidden animate-modalScaleIn modal-content border border-border"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-destructive p-4 text-destructive-foreground">
          <h2 className="text-xl font-semibold">Delete Note</h2>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <div className="flex items-center justify-center w-16 h-16 mx-auto bg-destructive/10 dark:bg-destructive/20 rounded-full mb-4">
              <Trash2 className="h-8 w-8 text-destructive" />
            </div>
            <p className="text-center text-foreground">
              Are you sure you want to delete this note? This action cannot be undone.
            </p>
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="destructive"
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

  // Require field state
  const [titleTouched, setTitleTouched] = useState(false)
  const [contentTouched, setContentTouched] = useState(false)
  const [formSubmitted, setFormSubmitted] = useState(false)

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
    setFormSubmitted(false)
    setTitleTouched(false)
    setContentTouched(false)
  }

  const handleCloseNote = () => {
    setAddNote(false)
    setEditNote(false)
    setCloseNote(false)
    setIsCalendarEvent(false)
    setEditedContent("")
    setEditedTitle("")
    setSelectedColor(0)
    setFormSubmitted(false)
    setTitleTouched(false)
    setContentTouched(false)

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
    setFormSubmitted(false)
    setTitleTouched(false)
    setContentTouched(false)
  }

  const validateFields = () => {
    // Both fields are required; must not be blank/empty string.
    const titleValid = editedTitle.trim().length > 0
    const contentValid = editedContent.trim().length > 0
    return { titleValid, contentValid }
  }

  const handleSaveNote = () => {
    setFormSubmitted(true)
    setTitleTouched(true)
    setContentTouched(true)
    const { titleValid, contentValid } = validateFields()
    if (!titleValid || !contentValid) {
      // Early return. Toast could be shown as extra, but message is shown on form.
      return
    }
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
    <div className="bg-background max-h-screen overflow-auto">
      <div className="mx-auto p-4">
        <LandingSpinner />
      </div>
    </div>
  )

  return (
    <div className="bg-background custom-scrollbar overflow-auto">
      <div className=" mx-auto p-4">
        <div className="mb-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-400 to-teal-400 opacity-10 dark:opacity-20 rounded-xl"></div>
          <div className="bg-gradient-to-r from-blue-50/50 dark:from-blue-950/30 via-purple-50/50 dark:via-purple-950/30 to-teal-50/50 dark:to-teal-950/30 rounded-xl p-6 relative shadow-lg border border-border" style={{ zIndex: 1 }}>
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 rounded-full opacity-5 dark:opacity-10 translate-x-1/3 -translate-y-1/3"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-400 rounded-full opacity-5 dark:opacity-10 -translate-x-1/3 translate-y-1/3"></div>

            <div className="relative z-10">
              <h1 className="z-10 text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600 dark:from-blue-400 dark:via-purple-400 dark:to-teal-400 bg-clip-text text-transparent mb-2">
                Notes
              </h1>
              <div className="text-muted-foreground text-sm mb-4 z-10">Dashboard • Notes ({notes?.length})</div>
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="z-10 bg-card/70 dark:bg-card/50 backdrop-blur-sm rounded-lg px-4 py-3 shadow-sm border border-border flex items-center">
                  <div className="w-8 h-8 rounded-full bg-blue-500/10 dark:bg-blue-500/20 flex items-center justify-center mr-3">
                    <span className="text-blue-600 dark:text-blue-400 font-semibold">{notes?.length}</span>
                  </div>
                  <span className="text-foreground">Total Notes</span>
                </div>
                <div className="z-10 bg-card/70 dark:bg-card/50 backdrop-blur-sm rounded-lg px-4 py-3 shadow-sm border border-border flex items-center">
                  <div className="w-20   flex items-center justify-center mr-3">
                    <span className="text-purple-600 dark:text-purple-400 font-semibold">
                      {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })},
                    </span>
                  </div>
                  <span className="text-foreground">Today</span>
                </div>
              </div>
            </div>
            <div className="absolute right-6 top-1/2 transform -translate-y-1/2 ">
              <Image src={todo} alt="Notes illustration" width={150} height={150} unoptimized />
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl shadow-lg border border-border overflow-hidden">
          <div className="flex justify-between items-center p-6 border-b border-border bg-gradient-to-r from-muted/30 to-card">
            <h2 className="text-xl font-semibold text-foreground flex items-center">
              <span className="bg-gradient-to-r from-blue-500 to-purple-400 dark:from-blue-400 dark:to-purple-400 w-5 h-5 rounded-md mr-2"></span>
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
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
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
            {/* Notes Grid */}
            <div className="w-full">
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
                <div className="text-center py-12 bg-muted/50 rounded-xl border border-dashed border-border">
                  <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center mb-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-8 w-8 text-muted-foreground"
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
                  <h3 className="text-lg font-medium text-foreground mb-2">No notes found</h3>
                  <p className="text-muted-foreground mb-4">
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
          </div>
        </div>
      </div>

      {/* Note Editor Dialog */}
      <Dialog open={addNote || editNote} onOpenChange={(open) => {
        if (!open) {
          handleCloseNote()
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{addNote ? "Create New Note" : "Edit Note"}</DialogTitle>
            <DialogDescription>
              {addNote ? "Add a new note to your collection" : "Update your note details"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <label htmlFor="note-title" className="block text-sm font-medium text-foreground mb-1">
                Title <span className="text-destructive">*</span>
              </label>
              <Input
                id="note-title"
                value={editedTitle}
                onChange={(e) => {
                  setEditedTitle(e.target.value)
                  setTitleTouched(true)
                }}
                placeholder="Note title"
                className={`w-full ${formSubmitted && editedTitle.trim() === "" ? "border-destructive focus:ring-destructive" : ""}`}
                required
                onBlur={() => setTitleTouched(true)}
              />
              {(formSubmitted || titleTouched) && editedTitle.trim() === "" && (
                <p className="text-xs text-destructive mt-1">Title is required.</p>
              )}
            </div>

            <div>
              <label htmlFor="note-content" className="block text-sm font-medium text-foreground mb-1">
                Content <span className="text-destructive">*</span>
              </label>
              <textarea
                ref={textareaRef}
                id="note-content"
                value={editedContent}
                onChange={(e) => {
                  setEditedContent(e.target.value)
                  setContentTouched(true)
                }}
                placeholder="Write your note here..."
                className={`w-full h-40 p-3 border bg-background text-foreground ${formSubmitted && editedContent.trim() === "" ? "border-destructive focus:ring-destructive" : "border-input"} rounded-lg focus:outline-none focus:ring-2 focus:ring-primary custom-scrollbar`}
                required
                onBlur={() => setContentTouched(true)}
              />
              {(formSubmitted || contentTouched) && editedContent.trim() === "" && (
                <p className="text-xs text-destructive mt-1">Content is required.</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Note Color</label>
              <div className="flex flex-wrap gap-3">
                {noteColors.map((color, idx) => (
                  <button
                    key={color.color}
                    type="button"
                    className={`relative h-8 w-8 rounded-full flex items-center justify-center cursor-pointer transition-transform duration-200 hover:scale-110 ${selectedColor === idx ? "ring-2 ring-offset-2 " + color.ring : ""}`}
                    onClick={() => setSelectedColor(idx)}
                    style={{
                      background: `linear-gradient(135deg, var(--${color.color.split("-")[1]}-400), var(--${color.color.split("-")[1]}-300))`,
                    }}
                  >
                    {selectedColor === idx && <Check className="h-4 w-4 text-white" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Add to Calendar */}
            <div className="flex flex-col gap-2 bg-gradient-to-br from-blue-500/10 dark:from-blue-500/20 via-purple-500/10 dark:via-purple-500/20 to-blue-500/10 dark:to-blue-500/20 rounded-xl p-4 shadow-inner border border-primary/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-primary flex items-center">
                    <Info className="h-4 w-4 mr-1 text-primary" />
                    Add to Calendar
                  </span>
                  <span className="ml-2 px-2 py-0.5 rounded-full bg-primary/20 text-xs text-primary font-medium animate-pulse">
                    New!
                  </span>
                </div>
                <label className="inline-flex items-center cursor-pointer">
                  <span className="sr-only">Add to Calendar</span>
                  <input
                    type="checkbox"
                    checked={isCalendarEvent}
                    onChange={(e) => setIsCalendarEvent(e.target.checked)}
                    className="hidden"
                  />
                  <span
                    className={`w-11 h-6 flex items-center bg-primary rounded-full p-1 duration-300 ease-in-out ${isCalendarEvent ? "bg-primary" : "bg-input"
                      }`}
                  >
                    <span
                      className={`bg-white w-4 h-4 rounded-full shadow-md transform duration-300 ease-in-out ${isCalendarEvent ? "translate-x-5" : ""
                        }`}
                    />
                  </span>
                </label>
              </div>
              <div className="mt-2 text-xs text-muted-foreground flex items-center gap-2">
                <span>
                  {isCalendarEvent
                    ? "This note will be added to your calendar and you'll get reminders."
                    : "Enable to sync this note with your calendar and receive smart notifications."}
                </span>
                {isCalendarEvent && (
                  <span className="inline-flex items-center gap-1 text-green-600 dark:text-green-400 font-medium">
                    <svg className="h-4 w-4 animate-bounce" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" /></svg>
                    Synced!
                  </span>
                )}
              </div>
              {isCalendarEvent && (
                <div className="mt-3 flex items-center gap-2 bg-primary/10 dark:bg-primary/20 border border-primary/30 rounded-lg p-2">
                  <svg className="h-5 w-5 text-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M8 7V3M16 7V3M4 11h16M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  <span className="text-xs text-foreground">
                    Calendar event will include note title, content, and color.
                  </span>
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleCloseNote}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveNote}>
              <Save className="mr-2 h-4 w-4" />
              {addNote ? "Create Note" : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
