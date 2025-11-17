
import { useRef } from "react"
import { motion, useInView } from "framer-motion"
import { CalendarDays, Plus, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/shared/ui/Button"

const calendarEvents = [
  { id: 1, title: "Team Meeting", date: "10:00 AM", color: "bg-blue-500" },
  { id: 2, title: "Project Deadline", date: "2:00 PM", color: "bg-orange-400" },
  { id: 3, title: "Client Call", date: "4:30 PM", color: "bg-green-400" },
  { id: 4, title: "Gym Session", date: "6:00 PM", color: "bg-yellow-400" },
]

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
const dates = Array.from({ length: 7 }, (_, i) => i + 10)

export default function CalendarSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.2 })

  return (
    <section id="calendar" className="py-20 bg-gray-50" ref={ref}>
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Plan Your Days with <span className="text-teal-400">Smart Calendar</span>
          </h2>
          <p className="text-xl text-gray-600">
            Organize your schedule with our intuitive calendar that syncs across all your devices and integrates with
            Google Calendar.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-gray-200">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-teal-400" />
                <h3 className="font-semibold">June 2025</h3>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" className="h-8 w-8">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" className="h-8 w-8">
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button size="sm" className="ml-2 bg-teal-400 hover:bg-teal-500">
                  <Plus className="h-4 w-4 mr-1" /> Add Event
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-7 border-b border-gray-200">
              {days.map((day, i) => (
                <div key={i} className="p-2 text-center text-sm font-medium text-gray-500">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7">
              {dates.map((date, i) => (
                <div
                  key={i}
                  className={`p-2 border-r border-b border-gray-200 min-h-[120px] ${i === 2 ? "bg-teal-50 border-teal-200" : ""
                    }`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className={`text-sm ${i === 2 ? "font-bold text-teal-500" : "text-gray-600"}`}>{date}</span>
                    {i === 2 && <div className="w-2 h-2 rounded-full bg-teal-400"></div>}
                  </div>
                  {i === 2 && (
                    <div className="space-y-2">
                      {calendarEvents.map((event) => (
                        <div
                          key={event.id}
                          className="p-1.5 rounded-md text-xs bg-white border border-gray-200 shadow-sm"
                        >
                          <div className="flex items-center gap-1.5">
                            <div className={`w-2 h-2 rounded-full ${event.color}`}></div>
                            <span className="font-medium">{event.title}</span>
                          </div>
                          <div className="text-gray-500 ml-3.5">{event.date}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                Color-Coded Events
              </h3>
              <p className="text-gray-600 text-sm">
                Organize your events with custom color coding to quickly identify different types of activities and
                priorities.
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-400"></div>
                Date Range Selection
              </h3>
              <p className="text-gray-600 text-sm">
                Easily select date ranges for multi-day events, trips, or projects with our intuitive date picker.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
