import { formatDate, getDaysBetween, getDaysUntilTrip } from "@/utils/dateformat"
import { Calendar, Clock, Globe, MapPin, Plane, Users, Wallet } from "lucide-react"
import Image from "next/image"

const tripCategories = [
    { id: "Business", name: "Business", color: "bg-blue-400", icon: Wallet },
    { id: "Vacation", name: "Vacation", color: "bg-green-400", icon: Plane },
    { id: "Weekend", name: "Weekend", color: "bg-orange-400", icon: Calendar },
    { id: "Family", name: "Family", color: "bg-purple-400", icon: Users },
    { id: "Adventure", name: "Adventure", color: "bg-red-400", icon: Globe },
    { id: "Road Trip", name: "Road Trip", color: "bg-yellow-400", icon: MapPin },
]

const tripStatuses = [
    { id: "Planning", name: "Planning", color: "bg-blue-400" },
    { id: "Booked", name: "Booked", color: "bg-purple-400" },
    { id: "Upcoming", name: "Upcoming", color: "bg-yellow-400" },
    { id: "In Progress", name: "In Progress", color: "bg-orange-400" },
    { id: "Completed", name: "Completed", color: "bg-green-400" },
    { id: "Cancelled", name: "Cancelled", color: "bg-gray-400" },
]

// Define the Trip type inline
interface Trip {
    id?: number;
    title: string;
    description: string;
    category: string;
    status: string;
    startDate: string;
    endDate: string;
    location: string;
    budget: number;
    currency: string;
    accommodation: string;
    transportation: string;
    remarks?: string;
    travelers: string;
    imageUrl?: string;
    destinations: { id: string; destinationName: string; days: number; activities: string[] }[];
}

interface TripCardProps {
    trip: Trip;
    onTripClick: (trip: Trip) => void;
}

// Trip Card Component
const TripCard = ({ trip, onTripClick }: TripCardProps) => {
    const category = tripCategories.find((c) => c.id === trip.category)
    const status = tripStatuses.find((s) => s.id === trip.status)
    const tripDuration = getDaysBetween(trip.startDate, trip.endDate)
    const daysUntilTrip = getDaysUntilTrip(trip.startDate)

    return (
        <div
            className="bg-card rounded-xl shadow-sm border border-border hover:shadow-md transition-all duration-300 cursor-pointer group relative overflow-hidden"
            onClick={() => onTripClick(trip)}
        >
            {/* Trip Image */}
            <div className="relative h-40 overflow-hidden">
                <Image
                    src={trip.imageUrl || "/placeholder.svg?height=400&width=600"}
                    alt={trip.title}
                    width={600}
                    height={400}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-4">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            {category && <category.icon className="h-4 w-4 text-white" />}
                            <span className="text-xs font-medium text-white">{category?.name}</span>
                        </div>
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${status?.color} text-white`}>
                            {status?.name}
                        </span>
                    </div>
                    <h3 className="text-lg font-bold text-white mt-1 group-hover:text-blue-100 transition-colors">
                        {trip.title}
                    </h3>
                </div>
            </div>

            {/* Trip Details */}
            <div className="p-4">
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{trip.description}</p>

                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center text-muted-foreground text-xs">
                        <Calendar size={12} className="mr-1" />
                        <span>
                            {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
                        </span>
                    </div>
                    <div className="flex items-center text-muted-foreground text-xs">
                        <Clock size={12} className="mr-1" />
                        <span>{tripDuration} days</span>
                    </div>
                </div>

                <div className="flex justify-between items-center">
                    <div
                        className={`text-xs font-medium ${daysUntilTrip < 0
                            ? "text-muted-foreground"
                            : daysUntilTrip === 0
                                ? "text-green-600 dark:text-green-400"
                                : daysUntilTrip <= 7
                                    ? "text-orange-600 dark:text-orange-400"
                                    : "text-primary"
                            }`}
                    >
                        {daysUntilTrip < 0
                            ? "Trip completed"
                            : daysUntilTrip === 0
                                ? "Departing today!"
                                : `${daysUntilTrip} days until departure`}
                    </div>
                    <div className="text-sm font-semibold text-foreground">{trip.budget} {trip.currency}</div>
                </div>

                {/* Destinations Preview */}
                <div className="mt-4 pt-4 border-t border-border">
                    <div className="flex items-center gap-1 flex-wrap">
                        {trip.location ? (
                            <div className="flex items-center bg-muted rounded-full px-2 py-0.5 text-xs text-foreground">
                                <MapPin className="h-3 w-3 mr-0.5 text-muted-foreground" />
                                {trip.location || 'Unknown Location'}
                            </div>
                        ) : (
                            <div className="flex items-center bg-muted rounded-full px-2 py-0.5 text-xs text-foreground">
                                <MapPin className="h-3 w-3 mr-0.5 text-muted-foreground" />
                                <div className="text-xs text-muted-foreground">No location added</div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
export default TripCard