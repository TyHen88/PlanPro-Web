import type React from "react"

import { Button } from "@/components/shared/ui/Button"
import { Input } from "@/components/shared/ui/Input"
import { Calendar, Globe, Info, MapPin, Plane, Plus, Trash2, Users, Wallet } from "lucide-react"
import Image from "next/image"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useRef, useState } from "react"
import { profileService } from "@/service/profile.service"
import toast from "sonner"
import { useMutation } from "@tanstack/react-query"
import { tripsService } from "@/service/trips.service"
import { Switch } from "@/components/shared/ui/swtich"
import { formatDateToYYYYMMDD } from "@/utils/dateformat"

const tripCategories = [
    { id: 1, name: "Business", color: "bg-blue-400", icon: Wallet },
    { id: 2, name: "Vacation", color: "bg-green-400", icon: Plane },
    { id: 3, name: "Weekend", color: "bg-orange-400", icon: Calendar },
    { id: 4, name: "Family", color: "bg-purple-400", icon: Users },
    { id: 5, name: "Adventure", color: "bg-red-400", icon: Globe },
    { id: 6, name: "Road Trip", color: "bg-yellow-400", icon: MapPin },
]

const tripStatuses = [
    { id: 1, name: "Planning", color: "bg-blue-400" },
    { id: 2, name: "Booked", color: "bg-purple-400" },
    { id: 3, name: "Upcoming", color: "bg-yellow-400" },
    { id: 4, name: "In Progress", color: "bg-orange-400" },
    { id: 5, name: "Completed", color: "bg-green-400" },
    { id: 6, name: "Cancelled", color: "bg-gray-400" },
]

// Form validation schema matching API structure
const tripFormSchema = z
    .object({
        title: z.string().min(1, "Trip title is required").max(100, "Title must be less than 100 characters"),
        description: z.string().min(1, "Description is required").max(500, "Description must be less than 500 characters"),
        category: z.string().min(1, "Please select a category"),
        status: z.string().min(1, "Please select a status"),
        startDate: z.string().min(1, "Start date is required"),
        endDate: z.string().min(1, "End date is required"),
        location: z.string().min(1, "Location is required"),
        budget: z.number().min(0, "Budget must be a positive number"),
        currency: z.string().min(1, "Please select a currency"),
        accommodation: z.string().min(1, "Accommodation is required"),
        transportation: z.string().min(1, "Transportation is required"),
        remarks: z.string().optional(),
        travelers: z.string().min(1, "Travelers information is required"),
        imageUrl: z.string().optional(),
        destinations: z
            .array(
                z.object({
                    destination_id: z.optional(z.union([z.string(), z.number()])),
                    id: z.string(),
                    destinationName: z.string().min(1, "Destination name is required"),
                    days: z.number().min(1, "Days must be at least 1"),
                    activities: z.string().min(1, "Activity description is required")
                }),
            ),
        isCalendarEvent: z.boolean().optional(),
    })
    .refine(
        (data) => {
            const startDate = new Date(data.startDate)
            const endDate = new Date(data.endDate)
            return endDate >= startDate
        },
        {
            message: "End date must be after or equal to start date",
            path: ["endDate"],
        },
    )

type TripFormData = z.infer<typeof tripFormSchema>

interface TripModalProps {
    trip?: Record<string, any>; // TODO: Replace with a specific Trip type
    onClose: () => void;
    onSave: (trip: any) => void; // TODO: Replace 'any' with a specific Trip type
    isNew?: boolean;
}

const TripModal = ({ trip, onClose, onSave, isNew = false }: TripModalProps) => {
    const [fileImage, setFileImage] = useState<File | null>(null);
    const hiddenFileInput = useRef<HTMLInputElement>(null);

    const destData = trip?.destinations?.[0]?.destination || [];

    const {
        register,
        control,
        handleSubmit,
        watch,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm<TripFormData>({
        resolver: zodResolver(tripFormSchema),
        defaultValues: {
            title: trip?.title || "",
            description: trip?.description || "",
            category: trip?.category ? String(trip.category) : "Vacation",
            status: trip?.status ? String(trip.status) : "Planning",
            startDate: trip?.startDate || Date.now().toString(),
            endDate: trip?.endDate || Date.now().toString(),
            location: trip?.location || "",
            budget: trip?.budget || 1000,
            currency: trip?.currency ? String(trip.currency) : "USD",
            accommodation: trip?.accommodation || "",
            transportation: trip?.transportation || "",
            remarks: trip?.remarks || "",
            travelers: trip?.travelers || "",
            imageUrl: trip?.imageUrl || "",
            // Initialize destinations with empty array if no data
            destinations: destData?.length ? destData.map((dest: Record<string, any>) => ({
                destination_id: typeof dest.destination_id === "string" ? dest.destination_id : undefined,
                id: dest.id,
                destinationName: dest.destination_name,
                days: dest.days,
                activities: dest.activities,
            })) : [{
                id: Date.now().toString(),
                destinationName: "",
                days: 1,
                activities: "",
                // destination_id: 0,
            }],
            isCalendarEvent: false,

        },
    })

    const {
        fields: destinationFields,
        append: appendDestination,
        remove: removeDestination,
    } = useFieldArray({
        control,
        name: "destinations",
    })

    //log error

    const watchedImageUrl = watch("imageUrl")

    const handleAddDestination = () => {
        appendDestination({
            id: Date.now().toString(),
            destinationName: "",
            days: 1,
            activities: "",
        })
    }

    //mutation remove destination
    const { mutate: removeDestinationMutation } = useMutation({
        mutationFn: (destinationId: string) => tripsService.removeDestination(destinationId),
        onSuccess: () => {
            toast.success("Destination has been removed")
        },
        onError: () => {
            toast.error("Failed to remove destination")
        }
    })

    const handleRemoveDestination = (index: number) => {
        if (destinationFields.length > 1) {
            if (destinationFields[index].destination_id) {
                removeDestinationMutation(String(destinationFields[index].destination_id))
            }
            removeDestination(index)
        }
    }

    const onSubmit = async (data: TripFormData) => {
        //check if data is not null but nestination can be null
        if (!data) {
            toast.error("Please fill in all fields")
            return
        }


        let imageUrl = null;
        if (fileImage != null) {
            try {
                const fileResponse = await profileService.uploadImage(fileImage);
                imageUrl = fileResponse.data.data.image_url;
            } catch (error) {
                toast.error("Fail to upload image");
                return;
            }
        }

        const updatedTrip = {
            id: trip?.id,
            ...data,
            startDate: formatDateToYYYYMMDD(data.startDate),
            endDate: formatDateToYYYYMMDD(data.endDate),
            imageUrl,
        }

        console.log("updatedTrip", updatedTrip)
        onSave(updatedTrip)
        onClose()
    }

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const imageUrl = URL.createObjectURL(file)
            setFileImage(file)
            setValue("imageUrl", imageUrl as any)
        }
    }


    //currency
    const currencyList = {
        USD: "US Dollar",
        RIEL: "Cambodian Riel",
    }

    return (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 z-50 flex items-center justify-center p-4 animate-fadeIn">
            <div
                className="bg-card rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden animate-scaleIn border border-border"
                onClick={(e) => e.stopPropagation()}
            >
                <div
                    className={`p-4 text-white ${isNew ? "bg-gradient-to-r from-blue-500 to-purple-500" : "bg-gradient-to-r from-blue-500 to-teal-500"
                        }`}
                >
                    <h2 className="text-xl font-semibold">{isNew ? "Create New Trip" : "Edit Trip"}</h2>
                </div>

                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="p-6 max-h-[calc(90vh-120px)] overflow-y-auto custom-scrollbar"
                >
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <label htmlFor="title" className="block text-sm font-medium text-foreground mb-1">
                                    Trip Title*
                                </label>
                                <Input id="title" {...register("title")} placeholder="Enter trip title" className="w-full" />
                                {errors.title && <p className="mt-1 text-sm text-destructive">{errors.title.message}</p>}
                            </div>

                            <div className="md:col-span-2">
                                <label htmlFor="description" className="block text-sm font-medium text-foreground mb-1">
                                    Description*
                                </label>
                                <textarea
                                    id="description"
                                    {...register("description")}
                                    placeholder="Describe your trip"
                                    rows={3}
                                    className="w-full rounded-md border border-input bg-background text-foreground shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-3"
                                />
                                {errors.description && <p className="mt-1 text-sm text-destructive">{errors.description.message}</p>}
                            </div>

                            <div>
                                <label htmlFor="category" className="block text-sm font-medium text-foreground mb-1">
                                    Category*
                                </label>
                                <select
                                    id="category"
                                    {...register("category")}
                                    className="w-full rounded-md border border-input bg-background text-foreground shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2"
                                >
                                    <option value="">Select category</option>
                                    {tripCategories.map((category) => (
                                        <option key={category.id} value={category.name}>
                                            {category.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.category && <p className="mt-1 text-sm text-destructive">{errors.category.message}</p>}
                            </div>

                            <div>
                                <label htmlFor="status" className="block text-sm font-medium text-foreground mb-1">
                                    Status*
                                </label>
                                <select
                                    id="status"
                                    {...register("status")}
                                    className="w-full rounded-md border border-input bg-background text-foreground shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2"
                                >
                                    <option value="">Select status</option>
                                    {tripStatuses.map((status) => (
                                        <option key={status.id} value={status.name}>
                                            {status.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.status && <p className="mt-1 text-sm text-destructive">{errors.status.message}</p>}
                            </div>

                            <div>
                                <label htmlFor="startDate" className="block text-sm font-medium text-foreground mb-1">
                                    Start Date*
                                </label>
                                <Input id="startDate" type="date" {...register("startDate")} className="w-full" />
                                {errors.startDate && <p className="mt-1 text-sm text-destructive">{errors.startDate.message}</p>}
                            </div>

                            <div>
                                <label htmlFor="endDate" className="block text-sm font-medium text-foreground mb-1">
                                    End Date*
                                </label>
                                <Input id="endDate" type="date" {...register("endDate")} className="w-full" />
                                {errors.endDate && <p className="mt-1 text-sm text-destructive">{errors.endDate.message}</p>}
                            </div>

                            <div>
                                <label htmlFor="budget" className="block text-sm font-medium text-foreground mb-1">
                                    Budget*
                                </label>
                                <Input
                                    id="budget"
                                    type="number"
                                    {...register("budget", { valueAsNumber: true })}
                                    min="0"
                                    step="0.01"
                                    className="w-full"
                                />
                                {errors.budget && <p className="mt-1 text-sm text-destructive">{errors.budget.message}</p>}
                            </div>

                            <div>
                                <label htmlFor="currency" className="block text-sm font-medium text-foreground mb-1">
                                    Currency*
                                </label>
                                <select
                                    id="currency"
                                    {...register("currency")}
                                    className="w-full rounded-md border border-input bg-background text-foreground shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2"
                                >
                                    {Object.entries(currencyList).map(([key, value]) => (
                                        <option key={key} value={key}>
                                            {key} - {value}
                                        </option>
                                    ))}
                                </select>
                                {errors.currency && <p className="mt-1 text-sm text-destructive">{errors.currency.message}</p>}
                            </div>

                            <div className="md:col-span-2">
                                <label htmlFor="location" className="block text-sm font-medium text-foreground mb-1">
                                    Location*
                                </label>
                                <Input
                                    id="location"
                                    {...register("location")}
                                    placeholder="e.g., Paris, France or Google Maps URL"
                                    className="w-full"
                                />
                                {errors.location && <p className="mt-1 text-sm text-destructive">{errors.location.message}</p>}
                            </div>

                            <div>
                                <label htmlFor="accommodation" className="block text-sm font-medium text-foreground mb-1">
                                    Accommodation*
                                </label>
                                <Input
                                    id="accommodation"
                                    {...register("accommodation")}
                                    placeholder="Hotels, Airbnb, etc."
                                    className="w-full"
                                />
                                {errors.accommodation && <p className="mt-1 text-sm text-destructive">{errors.accommodation.message}</p>}
                            </div>

                            <div>
                                <label htmlFor="transportation" className="block text-sm font-medium text-foreground mb-1">
                                    Transportation*
                                </label>
                                <Input
                                    id="transportation"
                                    {...register("transportation")}
                                    placeholder="Flights, rental car, etc."
                                    className="w-full"
                                />
                                {errors.transportation && <p className="mt-1 text-sm text-destructive">{errors.transportation.message}</p>}
                            </div>

                            <div className="md:col-span-2">
                                <label htmlFor="travelers" className="block text-sm font-medium text-foreground mb-1">
                                    Travelers* (comma separated)
                                </label>
                                <Input
                                    id="travelers"
                                    {...register("travelers")}
                                    placeholder="John Doe, Jane Smith"
                                    className="w-full"
                                />
                                {errors.travelers && <p className="mt-1 text-sm text-destructive">{errors.travelers.message}</p>}
                            </div>

                            <div className="md:col-span-2">
                                <label htmlFor="remarks" className="block text-sm font-medium text-foreground mb-1">
                                    Notes
                                </label>
                                <textarea
                                    id="remarks"
                                    {...register("remarks")}
                                    placeholder="Additional notes, reminders, etc."
                                    rows={2}
                                    className="w-full rounded-md border border-input bg-background text-foreground shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-3"
                                />
                            </div>
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-foreground mb-1">Trip Image</label>
                            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-border border-dashed rounded-md">
                                <div className="space-y-1 text-center">
                                    {watchedImageUrl ? (
                                        <div className="relative w-full h-48">
                                            <Image
                                                src={watchedImageUrl || "/placeholder.svg"}
                                                alt="Trip preview"
                                                width={400}
                                                height={192}
                                                className="mx-auto object-cover rounded-lg h-full w-full"
                                            />
                                        </div>
                                    ) : (
                                        <svg
                                            className="mx-auto h-12 w-12 text-muted-foreground"
                                            stroke="currentColor"
                                            fill="none"
                                            viewBox="0 0 48 48"
                                            aria-hidden="true"
                                        >
                                            <path
                                                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                                                strokeWidth={2}
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                        </svg>
                                    )}
                                    <div className="flex text-sm text-muted-foreground">
                                        <label
                                            htmlFor="file-upload"
                                            className="relative cursor-pointer bg-background rounded-md font-medium text-primary hover:text-primary/80"
                                        >
                                            <span>Upload a file</span>
                                            <input
                                                // value={fileImage?.name || "Choose a file"}
                                                id="file-upload"
                                                name="file-upload"
                                                type="file"
                                                accept="image/*"
                                                className="sr-only"
                                                ref={hiddenFileInput}
                                                onChange={handleImageUpload}
                                            />
                                        </label>
                                        <p className="pl-1">or drag and drop</p>
                                    </div>
                                    <p className="text-xs text-muted-foreground">PNG, JPG, GIF up to 10MB</p>
                                </div>
                            </div>
                        </div>

                        {/* Destinations Section */}
                        <div className="border-t border-border pt-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold text-foreground">Destinations & Activities</h3>
                                <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    onClick={handleAddDestination}
                                    className="text-primary border-primary/20 hover:bg-primary/10"
                                >
                                    <Plus className="h-4 w-4 mr-1" /> Add Destination
                                </Button>
                            </div>

                            {errors.destinations && <p className="mb-4 text-sm text-destructive">{errors.destinations.message}</p>}

                            <div className="space-y-6">
                                {destinationFields.map((destination, destinationIndex) => (
                                    <div key={destination.id} className="bg-muted/50 p-4 rounded-lg border border-border relative">
                                        <div className="absolute top-2 right-2">
                                            {destinationFields.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveDestination(destinationIndex)}
                                                    className="text-muted-foreground hover:text-destructive p-1"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                                            <div className="md:col-span-3">
                                                <label className="block text-sm font-medium text-foreground mb-1">Destination Name*</label>
                                                <Input
                                                    {...register(`destinations.${destinationIndex}.destinationName`)}
                                                    placeholder="e.g., Paris, France"
                                                />
                                                {errors.destinations?.[destinationIndex]?.destinationName && (
                                                    <p className="mt-1 text-sm text-destructive">
                                                        {errors.destinations[destinationIndex]?.destinationName?.message}
                                                    </p>
                                                )}
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-foreground mb-1">Days*</label>
                                                <Input
                                                    type="number"
                                                    {...register(`destinations.${destinationIndex}.days`, { valueAsNumber: true })}
                                                    min="1"
                                                />
                                                {errors.destinations?.[destinationIndex]?.days && (
                                                    <p className="mt-1 text-sm text-destructive">
                                                        {errors.destinations[destinationIndex]?.days?.message}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-foreground mb-2">Activities*</label>
                                            <Input
                                                {...register(`destinations.${destinationIndex}.activities`)}
                                                placeholder="e.g., Visit Eiffel Tower, Louvre Museum, Seine River Cruise"
                                                className="w-full"
                                            />
                                            {errors.destinations?.[destinationIndex]?.activities && (
                                                <p className="mt-1 text-sm text-destructive">
                                                    {errors.destinations[destinationIndex]?.activities?.message}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="md:col-span-2 flex flex-col gap-2 bg-gradient-to-br from-blue-50/50 dark:from-blue-950/30 via-purple-50/50 dark:via-purple-950/30 to-blue-100/50 dark:to-blue-950/40 rounded-xl p-4 shadow-inner border border-primary/20">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-semibold text-primary flex items-center">
                                        <Info className="h-4 w-4 mr-1 text-primary/70" />
                                        Add to Calendar
                                    </span>
                                    <span className="ml-2 px-2 py-0.5 rounded-full bg-primary/20 text-xs text-primary font-medium animate-pulse">
                                        New!
                                    </span>
                                </div>
                                <Switch
                                    checked={watch("isCalendarEvent")}
                                    onCheckedChange={() => setValue("isCalendarEvent", !watch("isCalendarEvent"))}
                                    className="scale-110"
                                />
                            </div>
                            <div className="mt-2 text-xs text-muted-foreground flex items-center gap-2">
                                <span>
                                    {watch("isCalendarEvent")
                                        ? "This trip will be added to your calendar and you'll get reminders."
                                        : "Enable to sync this trip with your calendar and receive smart notifications."}
                                </span>
                                {watch("isCalendarEvent") && (
                                    <span className="inline-flex items-center gap-1 text-green-600 dark:text-green-400 font-medium">
                                        <svg className="h-4 w-4 animate-bounce" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" /></svg>
                                        Synced!
                                    </span>
                                )}
                            </div>
                            {watch("isCalendarEvent") && (
                                <div className="mt-3 flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-lg p-2">
                                    <svg className="h-5 w-5 text-primary/70" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M8 7V3M16 7V3M4 11h16M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                    <span className="text-xs text-foreground">
                                        Calendar event will include trip title, dates, and location.
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="mt-8 flex justify-end gap-3">
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting} className="relative group overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-400 to-blue-500 group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:via-purple-500 group-hover:to-blue-600 transition-all duration-300"></div>
                            <span className="relative z-10 flex items-center justify-center text-white">
                                {isSubmitting ? "Saving..." : isNew ? "Create Trip" : "Save Changes"}
                            </span>
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default TripModal
