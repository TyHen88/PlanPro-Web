
import { Button } from "@/components/shared/ui/Button"
import useFetchCalendar from "@/lib/hooks/useFetchCalendar"
import CalendarPic from "@/public/asset/Canlendar1.png"
import { calendarService } from "@/service/calendar.service"
import { formatTime } from "@/utils/dateformat"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
    Calendar,
    CalendarDays,
    ChevronLeft,
    ChevronRight,
    Plus,
} from "lucide-react"
import Image from "next/image"
import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import EventDetailModal from "./EventDetailModel"
import EventModal from "./EventModal"

// Event categories mapping (API calendarType is string, so use string keys)
const eventCategories = [
    { id: "1", name: "Meeting", color: "bg-blue-400" },
    { id: "4", name: "Personal", color: "bg-green-400" },
    { id: "5", name: "Deadline", color: "bg-red-400" },
    { id: "6", name: "Travel", color: "bg-yellow-400" },
    { id: "2", name: "Vacation", color: "bg-purple-400" },
    { id: "3", name: "Workshop", color: "bg-pink-400" }, // Example for calendarType: "6"
]

// Helper: Parse "YYYY-MM-DD" or "YYYYMMDD" to Date
function parseDateTime(dateStr: string, timeStr?: string) {
    if (!dateStr) return new Date();
    let year, month, day;
    // Support both "YYYY-MM-DD" and "YYYYMMDD"
    if (dateStr.includes("-")) {
        // "YYYY-MM-DD"
        const [y, m, d] = dateStr.split("-");
        year = parseInt(y, 10);
        month = parseInt(m, 10) - 1;
        day = parseInt(d, 10);
    } else {
        // "YYYYMMDD"
        year = parseInt(dateStr.slice(0, 4), 10);
        month = parseInt(dateStr.slice(4, 6), 10) - 1;
        day = parseInt(dateStr.slice(6, 8), 10);
    }
    let hour = 0, min = 0, sec = 0;
    if (timeStr && timeStr.length === 6) {
        hour = parseInt(timeStr.slice(0, 2), 10)
        min = parseInt(timeStr.slice(2, 4), 10)
        sec = parseInt(timeStr.slice(4, 6), 10)
    }
    return new Date(year, month, day, hour, min, sec)
}

// Map API event to CalendarEvent
function mapApiEvent(apiEvent: any): CalendarEvent {
    return {
        id: apiEvent.id,
        title: apiEvent.eventTitle || "",
        description: apiEvent.description || "",
        start: parseDateTime(apiEvent.startDate, apiEvent.startTime),
        end: parseDateTime(apiEvent.endDate, apiEvent.endTime),
        categoryId: apiEvent.calendarType ? String(apiEvent.calendarType) : "1",
        location: apiEvent.location || "",
        attendees: typeof apiEvent.attendees === "string"
            ? apiEvent.attendees.split(",").map((a: string) => a.trim()).filter(Boolean)
            : Array.isArray(apiEvent.attendees) ? apiEvent.attendees : [],
        status: apiEvent.status,
        raw: apiEvent,
    }
}

// Define a type for calendar events
export interface CalendarEvent {
    id: number;
    title: string;
    description: string;
    start: Date;
    end: Date;
    categoryId: string; // changed to string to match API
    location: string;
    attendees: string[];
    status?: any;
    raw?: any;
    [key: string]: any;
}

interface DayCellProps {
    day: number;
    month: number;
    year: number;
    events: CalendarEvent[];
    onEventClick: (event: CalendarEvent) => void;
    onAddEvent: (date: Date) => void;
}

// Helper functions
const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate()
}

const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay()
}

// Day Cell Component
const DayCell = ({ day, month, year, events, onEventClick, onAddEvent }: DayCellProps) => {
    const isToday = day === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear()
    const isCurrentMonth = true // For now, we're only showing current month

    // Filter events for this day
    const dayEvents = events.filter((event: CalendarEvent) => {
        const eventDate = new Date(event.start)
        return eventDate.getDate() === day && eventDate.getMonth() === month && eventDate.getFullYear() === year
    })

    return (
        <div
            className={`min-h-[100px] p-1 border border-border ${isCurrentMonth ? "bg-card" : "bg-muted/50 text-muted-foreground"
                } ${isToday ? "ring-2 ring-primary/20" : ""} relative group`}
        >
            <div className="flex justify-between items-start">
                <span
                    className={`inline-block w-6 h-6 text-center ${isToday ? "bg-primary text-primary-foreground rounded-full" : isCurrentMonth ? "text-foreground" : "text-muted-foreground"
                        }`}
                >
                    {day}
                </span>
                <button
                    onClick={() => onAddEvent(new Date(year, month, day))}
                    className="text-muted-foreground hover:text-foreground p-1 rounded-full hover:bg-accent opacity-0 group-hover:opacity-100 transition-opacity"
                >
                    <Plus className="h-4 w-4" />
                </button>
            </div>
            <div className="mt-1 space-y-1 max-h-[80px] overflow-y-auto custom-scrollbar">
                {dayEvents.map((event: CalendarEvent) => {
                    const category = eventCategories.find((c) => c.id === event.categoryId)
                    return (
                        <div
                            key={event.id}
                            className={`px-2 py-1 text-xs rounded-md cursor-pointer truncate ${category ? category.color : "bg-muted"
                                } text-white hover:opacity-90 transition-opacity`}
                            onClick={() => onEventClick(event)}
                        >
                            {formatTime(event.start)} {event.title}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

// Main Calendar Component
const CalendarPage = () => {
    const { data: calendar, isLoading, error } = useFetchCalendar()
    // For debug: log the raw data
    // console.log("calendar", calendar?.data?.data)

    // Map API data to CalendarEvent[]
    const mappedEvents = useMemo(() => {
        // Accept both array and object, and also support direct array (for local test)
        let arr: any[] = [];
        if (calendar?.data?.data) {
            arr = Array.isArray(calendar.data.data) ? calendar.data.data : [calendar.data.data];
        } else if (Array.isArray(calendar?.data)) {
            arr = calendar.data;
        }
        return arr.map(mapApiEvent);
    }, [calendar])

    const queryClient = useQueryClient()
    const [currentDate, setCurrentDate] = useState(new Date())
    const [events, setEvents] = useState<CalendarEvent[]>([])
    const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
    const [showEventModal, setShowEventModal] = useState(false)
    const [showDetailsModal, setShowDetailsModal] = useState(false)
    const [newEvent, setNewEvent] = useState<CalendarEvent | null>(null)
    const [view, setView] = useState("month") // month, week, day
    const [mounted, setMounted] = useState(false)

    // Sync events state with mappedEvents from API
    useEffect(() => {
        setEvents(mappedEvents)
    }, [mappedEvents])

    useEffect(() => {
        setMounted(true)
        // Add CSS for custom scrollbar and animations if not already added
    }, [])

    const handlePrevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
    }

    const handleNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
    }

    const handleToday = () => {
        setCurrentDate(new Date())
    }

    //mutation create calendar
    const createCalendarMutation = useMutation({
        mutationFn: (data: CalendarEvent) => calendarService.createCalendar(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["calendar"] })
            toast.success("Calendar created successfully")
        },
        onError: (error) => {
            console.log(error)
            toast.error("Failed to create calendar")
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["calendar"] })
        }
    })

    //mutation update calendar
    const updateCalendarMutation = useMutation({
        mutationFn: (data: CalendarEvent) => calendarService.updateCalendar(data.id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["calendar"] })
            toast.success("Calendar updated successfully")
        },
        onError: (error) => {
            console.log(error)
            toast.error("Failed to update calendar")
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["calendar"] })
        }
    })

    //mutation delete calendar
    const deleteCalendarMutation = useMutation({
        mutationFn: (eventId: number) => calendarService.deleteCalendar(eventId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["calendar"] })
            toast.success("Calendar deleted successfully")
        },
        onError: (error) => {
            console.log(error)
            toast.error("Failed to delete calendar")
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["calendar"] })
        }
    })

    //get calendar by id
    const getCalendarById = useQuery({
        queryKey: ["calendar", selectedEvent?.id],
        queryFn: () => calendarService.getCalendarById(selectedEvent?.id || 0),
        enabled: !!selectedEvent?.id,
    })

    const handleAddEvent = (date: Date) => {
        const newEventTemplate: CalendarEvent = {
            id: Date.now(),
            title: '',
            description: '',
            start: date,
            end: new Date(date.getTime() + 60 * 60 * 1000), // 1 hour later
            categoryId: "1",
            location: '',
            attendees: [],
        };
        setNewEvent(newEventTemplate);
        setShowEventModal(true);
    }

    const handleSaveEvent = (event: CalendarEvent) => {
        if (event.id && events.some((e: CalendarEvent) => e.id === event.id)) {
            // Update existing event
            setEvents(events.map((e: CalendarEvent) => (e.id === event.id ? event : e)))
            updateCalendarMutation.mutate(event)
        } else {
            // Add new event
            setEvents([...events, event])
            createCalendarMutation.mutate(event)
        }
    }

    const handleDeleteEvent = (eventId: number) => {
        setEvents(events.filter((e: CalendarEvent) => e.id !== eventId));
        deleteCalendarMutation.mutate(eventId)
    }

    const handleEventClick = (event: CalendarEvent) => {
        setSelectedEvent(event)
        setShowDetailsModal(true)
    }

    const handleEditEvent = (event: CalendarEvent) => {
        setSelectedEvent(event)
        setShowDetailsModal(false)
        setShowEventModal(true)
        getCalendarById.refetch()
    }

    // Calendar grid generation
    const renderCalendarGrid = () => {
        const year = currentDate.getFullYear()
        const month = currentDate.getMonth()
        const daysInMonth = getDaysInMonth(year, month)
        const firstDayOfMonth = getFirstDayOfMonth(year, month)
        const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

        // Create calendar grid
        const calendarDays = []

        // Add weekday headers
        for (let i = 0; i < 7; i++) {
            calendarDays.push(
                <div
                    key={`header-${i}`}
                    className="p-2 text-center font-medium text-muted-foreground bg-muted/50 border border-border"
                >
                    {weekdays[i]}
                </div>,
            )
        }

        // Add empty cells for days before the first day of the month
        for (let i = 0; i < firstDayOfMonth; i++) {
            calendarDays.push(<div key={`empty-${i}`} className="bg-muted/50 border border-border"></div>)
        }

        // Add cells for each day of the month
        for (let i = 1; i <= daysInMonth; i++) {
            calendarDays.push(
                <DayCell
                    key={`day-${i}`}
                    day={i}
                    month={month}
                    year={year}
                    events={events}
                    onEventClick={handleEventClick}
                    onAddEvent={handleAddEvent}
                />,
            )
        }

        return calendarDays
    }

    if (!mounted) return null

    // Helper to safely get month and year from event.start
    const getEventMonth = (event: CalendarEvent) => {
        if (!event || !event.start) return null;
        let dateObj: Date;
        if (event.start instanceof Date) {
            dateObj = event.start;
        } else {
            // Try to parse if it's a string
            try {
                dateObj = new Date(event.start);
                if (isNaN(dateObj.getTime())) return null;
            } catch {
                return null;
            }
        }
        return dateObj.getMonth();
    };

    const getEventYear = (event: CalendarEvent) => {
        if (!event || !event.start) return null;
        let dateObj: Date;
        if (event.start instanceof Date) {
            dateObj = event.start;
        } else {
            try {
                dateObj = new Date(event.start);
                if (isNaN(dateObj.getTime())) return null;
            } catch {
                return null;
            }
        }
        return dateObj.getFullYear();
    };

    return (
        <div className="bg-background overflow-y-auto custom-scrollbar">
            <div className=" mx-auto p-4">
                {/* Header Section */}
                <div className="mb-6 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-400/10 to-teal-400/10 dark:from-blue-500/5 dark:via-purple-400/5 dark:to-teal-400/5 rounded-xl"></div>
                    <div className="bg-card rounded-xl p-6 relative shadow-lg border border-border z-1">
                        {/* Decorative elements */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 dark:bg-blue-500/10 rounded-full translate-x-1/3 -translate-y-1/3"></div>
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-400/5 dark:bg-teal-400/10 rounded-full -translate-x-1/3 translate-y-1/3"></div>

                        <div className="relative z-10">
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600 dark:from-blue-400 dark:via-purple-400 dark:to-teal-400 bg-clip-text text-transparent mb-2">
                                Calendar
                            </h1>
                            <div className="text-muted-foreground text-sm mb-4">Dashboard • Calendar</div>
                            <div className="flex flex-wrap gap-4 text-sm">
                                <div className="bg-card/70 backdrop-blur-sm rounded-lg px-4 py-3 shadow-sm border border-border flex items-center">
                                    <div className="w-8 h-8 rounded-full bg-blue-500/10 dark:bg-blue-500/20 flex items-center justify-center mr-3">
                                        <span className="text-blue-600 dark:text-blue-400 font-semibold">{events.length}</span>
                                    </div>
                                    <span className="text-foreground">Total Events</span>
                                </div>
                                <div className="bg-card/70 backdrop-blur-sm rounded-lg px-4 py-3 shadow-sm border border-border flex items-center">
                                    <div className="w-8 h-8 rounded-full bg-purple-500/10 dark:bg-purple-500/20 flex items-center justify-center mr-3">
                                        <span className="text-purple-600 dark:text-purple-400 font-semibold">
                                            {
                                                events.filter(
                                                    (e: CalendarEvent) => {
                                                        const month = getEventMonth(e);
                                                        const year = getEventYear(e);
                                                        return (
                                                            month !== null &&
                                                            year !== null &&
                                                            month === currentDate.getMonth() &&
                                                            year === currentDate.getFullYear()
                                                        );
                                                    }
                                                ).length
                                            }
                                        </span>
                                    </div>
                                    <span className="text-foreground">This Month</span>
                                </div>
                            </div>
                        </div>
                        <div className="absolute right-6 top-1/2 transform -translate-y-1/2 opacity-20 dark:opacity-10">
                            <Image src={CalendarPic} alt="Calendar illustration" width={120} height={120} unoptimized />
                        </div>
                    </div>
                </div>

                {/* Calendar Controls */}
                <div className="bg-card rounded-xl shadow-lg border border-border overflow-hidden">
                    <div className="flex justify-between items-center p-6 border-b border-border bg-muted/30">
                        <div className="flex items-center gap-2">
                            <h2 className="text-xl font-semibold text-foreground flex items-center">
                                <span className="bg-gradient-to-r from-blue-500 to-purple-400 w-5 h-5 rounded-md mr-2"></span>
                                {currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                            </h2>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex border border-border rounded-lg overflow-hidden">
                                <button
                                    className={`px-3 py-1 text-sm transition-colors ${view === "month" ? "bg-primary text-primary-foreground" : "bg-background text-foreground hover:bg-accent"
                                        }`}
                                    onClick={() => setView("month")}
                                >
                                    Month
                                </button>
                                <button
                                    className={`px-3 py-1 text-sm transition-colors ${view === "week" ? "bg-primary text-primary-foreground" : "bg-background text-foreground hover:bg-accent"
                                        }`}
                                    onClick={() => setView("week")}
                                >
                                    Week
                                </button>
                                <button
                                    className={`px-3 py-1 text-sm transition-colors ${view === "day" ? "bg-primary text-primary-foreground" : "bg-background text-foreground hover:bg-accent"
                                        }`}
                                    onClick={() => setView("day")}
                                >
                                    Day
                                </button>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button variant="outline" size="sm" onClick={handlePrevMonth}>
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <Button variant="outline" size="sm" onClick={handleToday}>
                                    Today
                                </Button>
                                <Button variant="outline" size="sm" onClick={handleNextMonth}>
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                            <Button
                                onClick={() =>
                                    handleAddEvent(new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()))
                                }
                            >
                                    <Plus size={16} className="mr-1" />
                                    Add Event
                            </Button>
                        </div>
                    </div>

                    {/* Calendar Grid */}
                    <div className="p-4">
                        {view === "month" && <div className="grid grid-cols-7 gap-0">{renderCalendarGrid()}</div>}
                        {view === "week" && (
                            <div className="bg-muted/50 rounded-lg p-8 text-center">
                                <div className="flex flex-col items-center justify-center h-64">
                                    <CalendarDays className="h-16 w-16 text-muted-foreground mb-4" />
                                    <h3 className="text-lg font-medium text-foreground mb-2">Week View Coming Soon</h3>
                                    <p className="text-muted-foreground max-w-md">
                                        We're working on an amazing week view for your calendar. Stay tuned for updates!
                                    </p>
                                </div>
                            </div>
                        )}
                        {view === "day" && (
                            <div className="bg-muted/50 rounded-lg p-8 text-center">
                                <div className="flex flex-col items-center justify-center h-64">
                                    <Calendar className="h-16 w-16 text-muted-foreground mb-4" />
                                    <h3 className="text-lg font-medium text-foreground mb-2">Day View Coming Soon</h3>
                                    <p className="text-muted-foreground max-w-md">
                                        We're working on a detailed day view for your calendar. Stay tuned for updates!
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Event Categories Legend */}
                    <div className="p-4 border-t border-border bg-muted/30">
                        <div className="flex flex-wrap items-center gap-4">
                            <span className="text-sm font-medium text-foreground">Event Categories:</span>
                            {eventCategories.map((category) => (
                                <div key={category.id} className="flex items-center">
                                    <div className={`w-3 h-3 rounded-full ${category.color} mr-1`}></div>
                                    <span className="text-xs text-muted-foreground">{category.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Event Modals */}
            {showEventModal && (
                <EventModal
                    event={selectedEvent || newEvent}
                    onClose={() => {
                        setShowEventModal(false)
                        setSelectedEvent(null)
                        setNewEvent(null)
                    }}
                    onSave={handleSaveEvent}
                    onDelete={handleDeleteEvent}
                    isNew={!selectedEvent}
                />
            )}

            {showDetailsModal && selectedEvent && (
                <EventDetailModal
                    event={selectedEvent}
                    onClose={() => {
                        setShowDetailsModal(false)
                        setSelectedEvent(null)
                    }}
                    onEdit={handleEditEvent}
                    onDelete={handleDeleteEvent}
                />
            )}
        </div>
    )
}

export default CalendarPage
