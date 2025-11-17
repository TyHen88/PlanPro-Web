import { OnConfirmationDelete } from "@/components/shared/OnConfirmationDelete"
import { Button } from "@/components/shared/ui/Button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/shared/ui/dialog"
import { formatDate, formatTime } from "@/utils/dateformat"
import { Clock, MapPin, Tag, Trash2, Users } from "lucide-react"
import { useState } from "react"
import { CalendarEvent } from "./CalendarPage"
// Event categories should use string IDs to match event.categoryId type
const eventCategories = [
    { id: "1", name: "Meeting", color: "bg-blue-400" },
    { id: "4", name: "Personal", color: "bg-green-400" },
    { id: "5", name: "Deadline", color: "bg-red-400" },
    { id: "6", name: "Travel", color: "bg-yellow-400" },
    { id: "2", name: "Vacation", color: "bg-purple-400" },
    { id: "3", name: "Workshop", color: "bg-pink-400" },
]

type EventDetailModelProps = {
    event: CalendarEvent;
    onClose: () => void;
    onEdit: (event: CalendarEvent) => void;
    onDelete: (eventId: number) => void;
}

// Event Details Modal Component
const EventDetailModel = ({ event, onClose, onEdit, onDelete }: EventDetailModelProps) => {
    const [showConfirmDelete, setShowConfirmDelete] = useState(false)

    // Ensure categoryId is compared as string
    const category = eventCategories.find((c) => c.id === String(event?.categoryId))

    // Extract color name for gradient if available
    const colorName = category?.color?.split("-")[1] || "blue"

    return (
        <Dialog open={!!event} onOpenChange={onClose}>
            <DialogContent className="max-w-md max-h-[90vh] p-0 overflow-hidden flex flex-col">
                <DialogHeader className={`p-4 text-white relative ${category ? category.color : "bg-blue-500"
                    }`}>
                    <div className="mb-1 text-white/80 text-sm">{event?.start ? formatDate(event.start) : ""}</div>
                    <DialogTitle className="text-xl font-semibold text-white">
                        {event?.title || ""}
                    </DialogTitle>
                    <div className="flex items-center mt-2">
                        <Clock className="h-4 w-4 mr-1 text-white/80" />
                        <span className="text-sm text-white/80">
                            {event?.start && event?.end ? `${formatTime(event.start)} - ${formatTime(event.end)}` : ""}
                        </span>
                    </div>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto p-6">
                    {event?.description && (
                        <div className="mb-4">
                            <h3 className="text-sm font-medium text-muted-foreground mb-1">Description</h3>
                            <p className="text-foreground">{event.description}</p>
                        </div>
                    )}

                    <div className="space-y-4">
                        <div className="flex items-start">
                            <Tag className="h-5 w-5 mr-2 text-muted-foreground mt-0.5" />
                            <div>
                                <h3 className="text-sm font-medium text-muted-foreground">Category</h3>
                                <div
                                    className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 ${category ? category.color : "bg-muted"
                                        } text-white`}
                                >
                                    {category ? category.name : "Uncategorized"}
                                </div>
                            </div>
                        </div>

                        {event?.location && (
                            <div className="flex items-start">
                                <MapPin className="h-5 w-5 mr-2 text-muted-foreground mt-0.5" />
                                <div>
                                    <h3 className="text-sm font-medium text-muted-foreground">Location</h3>
                                    <p className="text-foreground">{event.location}</p>
                                </div>
                            </div>
                        )}

                        {event?.attendees && event.attendees.length > 0 && (
                            <div className="flex items-start">
                                <Users className="h-5 w-5 mr-2 text-muted-foreground mt-0.5" />
                                <div>
                                    <h3 className="text-sm font-medium text-muted-foreground">Attendees</h3>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                        {event.attendees.map((attendee: string, index: number) => (
                                            <span
                                                key={index}
                                                className="inline-block px-2 py-1 bg-muted rounded-full text-xs font-medium text-foreground"
                                            >
                                                {attendee}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="mt-6 flex justify-end gap-3">
                        <Button
                            variant="outline"
                            className="text-destructive border-destructive/20 hover:bg-destructive/10 hover:text-destructive"
                            onClick={() => {
                                setShowConfirmDelete(true)
                            }}
                        >
                            <Trash2 className="h-4 w-4 mr-1" /> Delete
                        </Button>
                        {event && (
                            <Button onClick={() => onEdit(event)}>
                                Edit Event
                        </Button>
                        )}
                    </div>
                </div>
            </DialogContent>
            {showConfirmDelete && (
                    <OnConfirmationDelete
                        onClose={() => setShowConfirmDelete(false)}
                        onConfirm={() => {
                            onDelete(event?.id || 0)
                            onClose()
                        }}
                        show={showConfirmDelete}
                        title="Event"
                        description="Are you sure you want to delete this event?"
                    />
            )}
        </Dialog>
    )
}

export default EventDetailModel;
