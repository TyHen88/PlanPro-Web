import { Button } from "@/components/shared/ui/Button"
import { formatDate, getDaysBetween, getDaysUntilTrip } from "@/utils/dateformat"
import { formatCurrency } from "@/utils/utils"
import { Calendar, Clock, CreditCard, Globe, Luggage, MapPin, Plane, PlaneLanding, Trash2, UserRound, Users, Wallet, X } from "lucide-react"
import Image from "next/image"
import { ConfirmationType } from "@/utils/enum"
import { useState } from "react"
import dynamic from "next/dynamic"

const OnConfirmationDelete = dynamic(() => import('@/components/shared/OnConfirmationDelete').then(mod => mod.OnConfirmationDelete), {
    ssr: false,
})

const tripCategories = [
    { id: 1, name: "Business", color: "bg-blue-400", icon: Wallet },
    { id: 2, name: "Vacation", color: "bg-green-400", icon: Plane },
    { id: 3, name: "Weekend", color: "bg-orange-400", icon: Calendar },
    { id: 4, name: "Family", color: "bg-purple-400", icon: Users },
    { id: 5, name: "Adventure", color: "bg-red-400", icon: Globe },
    { id: 6, name: "Road Trip", color: "bg-yellow-400", icon: MapPin },
]

const tripStatuses = [
    { name: "Planning", color: "bg-blue-400" },
    { name: "Booked", color: "bg-purple-400" },
    { name: "Upcoming", color: "bg-yellow-400" },
    { name: "In Progress", color: "bg-orange-400" },
    { name: "Completed", color: "bg-green-400" },
    { name: "Cancelled", color: "bg-gray-400" },
    { name: "On Hold", color: "bg-gray-400" }

]
// Trip Details Modal Component
const TripDetailsModal = ({ trip, onClose, onEdit, onDelete }: any) => {
    const [showDelete, setShowDelete] = useState(false)

    if (!trip) return null

    const category = tripCategories.find((c) => c.name === trip.category)
    const status = tripStatuses.find((s) => s.name === trip.status)
    const tripDuration = getDaysBetween(trip.startDate, trip.endDate)
    const daysUntilTrip = getDaysUntilTrip(trip.startDate)

    return (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 z-50 flex items-center justify-center p-4 animate-fadeIn">
            <div
                className="bg-card rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden animate-scaleIn border border-border"
                onClick={(e) => e.stopPropagation()}
            >
                <div
                    className={`p-6 text-white relative ${category ? category.color : "bg-blue-500"
                        } bg-gradient-to-r from-${category?.color.split("-")[1]}-500 to-${category?.color.split("-")[1]}-400`}
                >
                    <button
                        onClick={onClose}
                        className="absolute right-2 top-2 text-white/80 hover:text-white p-1 rounded-full hover:bg-white/20"
                    >
                        <X className="h-5 w-5" />
                    </button>
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                {category && <category.icon className="h-5 w-5 text-white/90" />}
                                <span className="text-sm font-medium text-white/90">{category?.name}</span>
                                <span
                                    className={`px-2 py-0.5 text-xs font-medium rounded-full bg-white/20 ${status?.name === "Cancelled" ? "text-red-100" : "text-white"
                                        }`}
                                >
                                    {status?.name}
                                </span>
                            </div>
                            <h2 className="text-2xl font-bold mb-2">{trip.title}</h2>
                            <div className="flex items-center gap-4 text-white/90">
                                <div className="flex items-center">
                                    <Calendar className="h-4 w-4 mr-1" />
                                    <span className="text-sm">
                                        {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
                                    </span>
                                </div>
                                <div className="flex items-center">
                                    <Clock className="h-4 w-4 mr-1" />
                                    <span className="text-sm">{tripDuration} days</span>
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-xl font-bold">{trip.budget} {trip.currency}</div>
                            <div className="text-sm text-white/80">Budget</div>
                        </div>
                    </div>
                    {trip.image && (
                        <div className="mt-4 rounded-lg overflow-hidden shadow-lg">
                            <Image
                                src={trip.image || "/placeholder.svg"}
                                alt={trip.title}
                                width={800}
                                height={400}
                                className="w-full h-48 object-cover"
                            />
                        </div>
                    )}
                </div>

                <div className="p-6 overflow-y-auto max-h-[calc(90vh-350px)] custom-scrollbar">
                    <div className="space-y-6">
                        {/* Description */}
                        <div>
                            <h3 className="text-lg font-semibold text-foreground mb-2">Description</h3>
                            <p className="text-muted-foreground leading-relaxed">{trip.description}</p>
                        </div>

                        {/* Trip Status */}
                        <div className="bg-muted/50 p-4 rounded-lg">
                            <h4 className="text-sm font-medium text-muted-foreground mb-2">Trip Status</h4>
                            <div className="flex items-center justify-between">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${status?.color} text-white`}>
                                    {status?.name}
                                </span>
                                <span
                                    className={`text-sm font-medium ${daysUntilTrip < 0
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
                                </span>
                            </div>
                        </div>

                        {/* Destinations */}
                        <div>
                            <h3 className="text-lg font-semibold text-foreground mb-4">Itinerary</h3>
                            <div className="space-y-4">
                                {trip.destinations?.map((destinationGroup: any) => (
                                    <div key={destinationGroup.tripId}>
                                        {destinationGroup.destination.map((dest: any, index: number) => (
                                            index % 2 === 0 ? (
                                                // Style 1 - Blue theme
                                                <div
                                                    key={dest.id}
                                                    className="bg-blue-50/50 dark:bg-blue-950/30 p-4 rounded-lg border-l-4 border-blue-400 dark:border-blue-500 mb-4 relative"
                                                >
                                                    <div className="flex justify-between items-center mb-3">
                                                        <h4 className="font-semibold text-blue-800 dark:text-blue-300">
                                                            {dest.destination_name}
                                                        </h4>
                                                        <span className="text-sm bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 px-2 py-1 rounded">
                                                            {dest.days} days
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <h5 className="text-xs font-medium text-muted-foreground uppercase mb-2">
                                                            Activities
                                                        </h5>
                                                        <ul className="space-y-2">
                                                            <li
                                                                key={index}
                                                                className="text-sm text-blue-700 dark:text-blue-300 flex items-center"
                                                            >
                                                                <span className="inline-block w-2 h-2 rounded-full bg-blue-400 dark:bg-blue-500 mr-3"></span>
                                                                {dest.activities}
                                                            </li>
                                                        </ul>
                                                    </div>
                                                </div>
                                            ) : (
                                                // Style 2 - Purple theme
                                                <div
                                                    key={dest.id}
                                                    className="bg-purple-50/50 dark:bg-purple-950/30 p-4 rounded-lg border-l-4 border-purple-400 dark:border-purple-500 mb-4 relative"
                                                >
                                                    <div className="flex justify-between items-center mb-3">
                                                        <h4 className="font-semibold text-purple-800 dark:text-purple-300">
                                                            {dest.destination_name}
                                                        </h4>
                                                        <span className="text-sm bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 px-2 py-1 rounded">
                                                            {dest.days} days
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <h5 className="text-xs font-medium text-muted-foreground uppercase mb-2">
                                                            Activities
                                                        </h5>
                                                        <ul className="space-y-2">
                                                            <li
                                                                key={index}
                                                                className="text-sm text-purple-700 dark:text-purple-300 flex items-center"
                                                            >
                                                                <span className="inline-block w-2 h-2 rounded-full bg-purple-400 dark:bg-purple-500 mr-3"></span>
                                                                {dest.activities}
                                                            </li>
                                                        </ul>
                                                    </div>
                                                </div>
                                            )
                                        ))}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Trip Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-muted/50 p-4 rounded-lg">
                                <h4 className="text-sm font-medium text-muted-foreground mb-2">Travelers</h4>
                                <div className="flex flex-wrap gap-2">
                                    {trip.travelers.split(',').map((traveler: string, index: number) => (
                                        <div
                                            key={index}
                                            className="flex items-center bg-card rounded-full px-3 py-1 border border-border"
                                        >
                                            <Users className="h-3 w-3 mr-1 text-muted-foreground" />
                                            <span className="text-xs font-medium text-foreground">{traveler.trim()}</span>
                                        </div>
                                    ))
                                    }
                                </div>

                            </div>
                            <div className="bg-muted/50 p-4 rounded-lg">
                                <h4 className="text-sm font-medium text-muted-foreground mb-2">Budget</h4>
                                <div className="flex items-center">
                                    <CreditCard className="h-4 w-4 mr-2 text-muted-foreground" />
                                    <span className="text-lg font-semibold text-foreground">
                                        {trip.budget} {trip.currency}
                                    </span>
                                </div>
                            </div>
                            <div className="bg-muted/50 p-4 rounded-lg">
                                <h4 className="text-sm font-medium text-muted-foreground mb-2">Accommodation</h4>
                                <div className="flex items-start">
                                    <Luggage className="h-4 w-4 mr-2 text-muted-foreground mt-0.5" />
                                    <span className="text-sm text-foreground">{trip.accommodation}</span>
                                </div>
                            </div>
                            <div className="bg-muted/50 p-4 rounded-lg">
                                <h4 className="text-sm font-medium text-muted-foreground mb-2">Transportation</h4>
                                <div className="flex items-start">
                                    <PlaneLanding className="h-4 w-4 mr-2 text-muted-foreground mt-0.5" />
                                    <span className="text-sm text-foreground">{trip.transportation}</span>
                                </div>
                            </div>
                        </div>

                        {/* Notes */}
                        {trip.notes && (
                            <div className="bg-yellow-50/50 dark:bg-yellow-950/30 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
                                <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-300 mb-2">Notes</h4>
                                <p className="text-sm text-yellow-700 dark:text-yellow-400">{trip.notes}</p>
                            </div>
                        )}
                    </div>

                    <div className="mt-8 flex justify-between">
                        <Button
                            variant="outline"
                            className="text-destructive border-destructive/20 hover:bg-destructive/10 hover:text-destructive"
                            onClick={() => {
                                setShowDelete(true)
                            }}
                        >
                            <Trash2 className="h-4 w-4 mr-1" /> Delete Trip
                        </Button>
                        <Button onClick={() => onEdit(trip)} className="relative group overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-400 to-blue-500 group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:via-purple-500 group-hover:to-blue-600 transition-all duration-300"></div>
                            <span className="relative z-10 flex items-center justify-center text-white">Edit Trip</span>
                        </Button>
                    </div>
                </div>
            </div>
            {
                showDelete && (
                    <OnConfirmationDelete
                        show={showDelete}
                        onConfirm={() => {
                            onDelete?.(trip?.id);
                            setShowDelete(false);
                            onClose();
                        }}
                        onClose={() => setShowDelete(false)}
                        title={trip?.title || ""}
                        description={`Are you sure you want to delete this trip? This action cannot be undone.`}
                    />
                )
            }

        </div>
    )
}
export default TripDetailsModal