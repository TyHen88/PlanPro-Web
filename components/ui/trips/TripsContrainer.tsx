"use client"

import { useState, useEffect, useMemo } from "react"
import Image from "next/image"
import { Calendar, Globe, MapPin, Plane, Plus, Search, Users, Wallet } from "lucide-react"
import { Button } from "@/components/shared/ui/Button"
import { Input } from "@/components/shared/ui/Input"
import tripImg from "@/public/asset/trip-img2.png"
import useFetchTrips from "@/lib/hooks/useFetchTrips"
import TripCard from "./TripCard"
import TripDetailsModal from "./TripsDetailModal"
import TripModal from "./TripsModal"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { tripsService } from "@/service/trips.service"
import toast from "sonner"
import LandingSpinner from "@/components/shared/LandingSpinner"

// Types matching API structure
interface Destination {
  id: string
  destinationName: string
  days: number
  activities: string[]
}

interface Trip {
  id?: number
  title: string
  description: string
  category: string
  status: string
  startDate: string
  endDate: string
  location: string
  budget: number
  currency: string
  accommodation: string
  transportation: string
  remarks?: string
  travelers: string
  imageUrl?: string
  destinations: Destination[]
}

interface TripCategory {
  id: string
  name: string
  color: string
  icon: any
}

interface TripStatus {
  id: string
  name: string
  color: string
}

// Constants
const tripCategories: TripCategory[] = [
  { id: "Business", name: "Business", color: "bg-blue-400", icon: Wallet },
  { id: "Vacation", name: "Vacation", color: "bg-green-400", icon: Plane },
  { id: "Weekend", name: "Weekend", color: "bg-orange-400", icon: Calendar },
  { id: "Family", name: "Family", color: "bg-purple-400", icon: Users },
  { id: "Adventure", name: "Adventure", color: "bg-red-400", icon: Globe },
  { id: "Road Trip", name: "Road Trip", color: "bg-yellow-400", icon: MapPin },
]

const tripStatuses: TripStatus[] = [
  { id: "Planning", name: "Planning", color: "bg-blue-400" },
  { id: "Booked", name: "Booked", color: "bg-purple-400" },
  { id: "Upcoming", name: "Upcoming", color: "bg-yellow-400" },
  { id: "In Progress", name: "In Progress", color: "bg-orange-400" },
  { id: "Completed", name: "Completed", color: "bg-green-400" },
  { id: "Cancelled", name: "Cancelled", color: "bg-gray-400" },
]


// Error Component
const ErrorMessage = ({ message, onRetry }: { message: string; onRetry?: () => void }) => (
  <div className="text-center py-12 bg-destructive/10 dark:bg-destructive/20 rounded-xl border border-destructive/20 dark:border-destructive/30">
    <div className="w-16 h-16 mx-auto bg-destructive/20 dark:bg-destructive/30 rounded-full flex items-center justify-center mb-4">
      <Plane className="h-8 w-8 text-destructive" />
    </div>
    <h3 className="text-lg font-medium text-destructive mb-2">Error Loading Trips</h3>
    <p className="text-destructive/80 mb-4">{message}</p>
    {onRetry && (
      <Button onClick={onRetry} variant="outline" className="border-destructive/30 text-destructive hover:bg-destructive/10">
        Try Again
      </Button>
    )}
  </div>
)

// Statistics Card Component
const StatCard = ({
  value,
  label,
  color,
  bgColor,
}: {
  value: number
  label: string
  color: string
  bgColor: string
}) => (
  <div className="bg-card/70 dark:bg-card/50 backdrop-blur-sm rounded-lg px-4 py-3 shadow-sm border border-border flex items-center">
    <div className={`w-8 h-8 rounded-full ${bgColor} flex items-center justify-center mr-3`}>
      <span className={`${color} font-semibold`}>{value}</span>
    </div>
    <span className="text-foreground">{label}</span>
  </div>
)

// Main Trip Component
const TripPage = () => {
  const { data: trips = [], isLoading, error, refetch } = useFetchTrips()
  const queryClient = useQueryClient()
  // State
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null)
  const [showTripModal, setShowTripModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterCategory, setFilterCategory] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Mutations
  const createMutation = useMutation({
    mutationFn: async (trip: Omit<Trip, "id">) => {
      return await tripsService.createTrip(trip)
    },
    onSuccess: () => {
      setShowTripModal(false)
      toast.success("Trip created successfully")
      queryClient.invalidateQueries({ queryKey: ["trips-data"] })
    },
    onError: (error: any) => {
      toast.error("Failed to create trip")
      console.error("Error creating trip:", error)
    },
  })

  const updateMutation = useMutation({
    mutationFn: async (trip: any) => {
      const { id, ...tripData } = trip
      return await tripsService.updateTrip(id!, tripData)
    },
    onSuccess: () => {
      setShowTripModal(false)
      toast.success("Trip updated successfully")
      queryClient.invalidateQueries({ queryKey: ["trips-data"] })
    },
    onError: (error: any) => {
      toast.error("Failed to update trip")
      console.error("Error updating trip:", error)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: any) => {
      return await tripsService.deleteTrip(id)
    },
    onSuccess: () => {
      setShowDetailsModal(false)
      setSelectedTrip(null)
      toast.success("Trip deleted successfully")
      queryClient.invalidateQueries({ queryKey: ["trips-data"] })
    },
    onError: (error: any) => {
      toast.error("Failed to delete trip")
      console.error("Error deleting trip:", error)
    },
  })

  // Event Handlers
  const handleTripClick = (trip: Trip) => {
    setSelectedTrip(trip)
    setShowDetailsModal(true)
  }

  const handleAddTrip = () => {
    setSelectedTrip(null)
    setShowTripModal(true)
  }

  const handleEditTrip = (trip: Trip) => {
    setSelectedTrip(trip)
    setShowDetailsModal(false)
    setShowTripModal(true)
  }

  const handleSaveTrip = (trip: Trip | Omit<Trip, "id">) => {
    if ("id" in trip && trip.id) {
      updateMutation.mutate(trip)
    } else {
      createMutation.mutate(trip as Omit<Trip, "id">)
    }
  }

  const handleDeleteTrip = (tripId: number) => {
    deleteMutation.mutate(tripId)
  }

  const handleCloseModal = () => {
    setShowTripModal(false)
    setShowDetailsModal(false)
    setSelectedTrip(null)
  }

  // Filter trips
  const filteredTrips = useMemo(() => {
    // Ensure trips is an array before filtering
    const tripsArray = Array.isArray(trips) ? trips : [];

    return tripsArray.filter((trip: Trip) => {
      const matchesSearch =
        trip?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        trip?.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        trip?.destinations?.some((d) => d.destinationName.toLowerCase().includes(searchQuery.toLowerCase()))

      const matchesCategory = filterCategory === "all" || trip.category === filterCategory
      const matchesStatus = filterStatus === "all" || trip.status === filterStatus

      return matchesSearch && matchesCategory && matchesStatus
    })
  }, [trips, searchQuery, filterCategory, filterStatus])
  // Statistics
  const statistics = useMemo(() => {
    const now = new Date()
    const totalTrips = trips?.length
    const upcomingTrips = trips.filter((t: Trip) => {
      const startDate = new Date(t.startDate)
      return startDate > now && (t.status === "Booked" || t.status === "Upcoming")
    }).length
    const completedTrips = trips.filter((t: Trip) => t.status === "Completed").length
    const totalDestinations = trips.reduce((sum: number, t: Trip) => sum + (t?.destinations?.length || 0), 0)

    return {
      totalTrips,
      upcomingTrips,
      completedTrips,
      totalDestinations,
    }
  }, [trips])

  // Early returns
  if (!mounted) return null

  if (isLoading) {
    return (
      <div className="bg-background max-h-screen overflow-auto">
        <div className="mx-auto p-4">
          <LandingSpinner />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-background max-h-screen overflow-auto">
        <div className="mx-auto p-4">
          <ErrorMessage message="Unable to load trips. Please try again." onRetry={refetch} />
        </div>
      </div>
    )
  }

  return (
    <div className="bg-background max-h-screen overflow-auto">
      <div className="mx-auto p-4">
        {/* Header Section */}
        <div className="mb-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-400 to-teal-400 opacity-10 dark:opacity-20 rounded-xl"></div>
          <div className="bg-gradient-to-r from-blue-50/80 dark:from-blue-950/30 via-purple-50/80 dark:via-purple-950/30 to-teal-50/80 dark:to-teal-950/30 rounded-xl p-6 relative shadow-lg border border-border" style={{ zIndex: 1 }}>
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 rounded-full opacity-5 dark:opacity-10 translate-x-1/3 -translate-y-1/3"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-400 rounded-full opacity-5 dark:opacity-10 -translate-x-1/3 translate-y-1/3"></div>

            <div className="relative z-10">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600 dark:from-blue-400 dark:via-purple-400 dark:to-teal-400 bg-clip-text text-transparent mb-2">
                Trip Planner
              </h1>
              <div className="text-muted-foreground text-sm mb-4">Dashboard • Trips</div>
              <div className="flex flex-wrap gap-4 text-sm">
                <StatCard
                  value={statistics.totalTrips}
                  label="Total Trips"
                  color="text-blue-500"
                  bgColor="bg-blue-100"
                />
                <StatCard
                  value={statistics.upcomingTrips}
                  label="Upcoming"
                  color="text-yellow-500"
                  bgColor="bg-yellow-100"
                />
                <StatCard
                  value={statistics.completedTrips}
                  label="Completed"
                  color="text-green-500"
                  bgColor="bg-green-100"
                />
                <StatCard
                  value={statistics.totalDestinations}
                  label="Destinations"
                  color="text-purple-500"
                  bgColor="bg-purple-100"
                />
              </div>
            </div>
            <div className="absolute right-6 top-1/2 transform -translate-y-1/2 hidden md:block">
              <Image src={tripImg || "/placeholder.svg"} alt="Travel illustration" width={120} height={120} />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-card rounded-xl shadow-lg border border-border overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center p-6 border-b border-border bg-gradient-to-r from-muted/50 to-card gap-4">
            <h2 className="text-xl font-semibold text-foreground flex items-center">
              <span className="bg-gradient-to-r from-blue-500 to-purple-400 w-5 h-5 rounded-md mr-2"></span>
              My Trips
            </h2>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search trips..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full sm:w-64 pl-10"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="rounded-md border border-input bg-background text-foreground shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2"
              >
                <option value="all">All Categories</option>
                {tripCategories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="rounded-md border border-input bg-background text-foreground shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2"
              >
                <option value="all">All Statuses</option>
                {tripStatuses.map((status) => (
                  <option key={status.id} value={status.id}>
                    {status.name}
                  </option>
                ))}
              </select>
              <Button
                onClick={handleAddTrip}
                className="relative group overflow-hidden"
                disabled={createMutation.isPending}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-400 to-blue-500 group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:via-purple-500 group-hover:to-blue-600 transition-all duration-300"></div>
                <span className="relative z-1 flex items-center justify-center text-white">
                  <Plus size={16} className="mr-1" />
                  {createMutation.isPending ? "Creating..." : "New Trip"}
                </span>
              </Button>
            </div>
          </div>

          <div className="p-6">
            {filteredTrips.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTrips.map((trip: Trip) => (
                  <TripCard key={trip.id} trip={trip} onTripClick={handleTripClick} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-muted/50 rounded-xl border border-dashed border-border">
                <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center mb-4">
                  <Plane className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium text-foreground mb-2">No trips found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery || filterCategory !== "all" || filterStatus !== "all"
                    ? "No trips match your current filters. Try adjusting your search criteria."
                    : "You haven't created any trips yet. Start planning your next adventure!"}
                </p>
                <Button onClick={handleAddTrip} className="relative group overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-400 to-blue-500 group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:via-purple-500 group-hover:to-blue-600 transition-all duration-300"></div>
                  <span className="relative z-1 flex items-center justify-center text-white">
                    <Plus size={16} className="mr-1" />
                    Plan your first trip
                  </span>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Trip Details Modal */}
      {showDetailsModal && selectedTrip && (
        <TripDetailsModal
          trip={selectedTrip}
          onClose={handleCloseModal}
          onEdit={handleEditTrip}
          onDelete={handleDeleteTrip}
        />
      )}

      {/* Add/Edit Trip Modal */}
      {showTripModal && (
        <TripModal trip={selectedTrip as Trip} onClose={handleCloseModal} onSave={handleSaveTrip} isNew={!selectedTrip} />
      )}
    </div>
  )
}

export default TripPage
