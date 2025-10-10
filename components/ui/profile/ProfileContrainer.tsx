"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/shared/ui/Button"
import { Input } from "@/components/shared/ui/Input"
import { User, Mail, Phone, Calendar, Camera, Shield, Palette, Edit, Save, X, User2, Loader2, History } from "lucide-react"
import Image from "next/image"
import { Label } from "@/components/shared/ui/label"
import profile from "@/public/asset/profile.jpg"
import { profileService } from "@/service/profile.service"
import toast from "react-hot-toast"
import { useQueryClient } from "@tanstack/react-query"
import SettingTap from "@/components/ui/profile/SettingTap"
import TelegramHistory from "./TelegramHistory"

type Props = {
    profile_data: any
    onClose: () => void
    onUpdate?: (updatedData: any) => Promise<any>
}

const ProfileContrainer = ({ profile_data, onClose, onUpdate }: Props) => {
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState("personal")
    const [isEditing, setIsEditing] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [fileImage, setFileImage] = useState<File | null>(null)
    // Initialize profile data from props or defaults
    const [profileData, setProfileData] = useState({
        username: profile_data?.username || "",
        firstName: profile_data?.first_name || "john",
        lastName: profile_data?.last_name || "doe",
        email: profile_data?.email || "example@gmail.com",
        phone: profile_data?.phone_number || "0000000000",
        birthday: profile_data?.dob || "1990-01-01",
        profile_image_url: profile_data?.profile_image_url || profile,
    })

    const [editData, setEditData] = useState(profileData)

    const tabs = [
        { id: "personal", label: "Personal", icon: User },
        { id: "telegram", label: "Telegram", icon: Mail },
        { id: "history", label: "History", icon: History },
    ]

    const handleEdit = () => {
        setEditData(profileData)
        setIsEditing(true)
    }

    const handleCancel = () => {
        setEditData(profileData)
        setIsEditing(false)
    }

    const updateEditData = (field: string, value: any) => {
        setEditData((prev) => ({ ...prev, [field]: value }))
    }

    const handleSave = async () => {
        try {
            setIsLoading(true)

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

            // Prepare request data
            const requestData = {
                first_name: editData.firstName,
                last_name: editData.lastName,
                email: editData.email,
                phone_number: editData.phone,
                dob: editData.birthday,
                image_url: imageUrl,
                username: editData.username,
            }

            // Use the onUpdate prop if provided, otherwise use the profileService
            let response
            if (onUpdate) {
                response = await onUpdate(requestData)
            } else {
                response = await profileService.updateProfile(requestData)
            }

            // Handle successful response
            if (response && response.status === 200) {
                toast.success("Profile updated successfully")
                setProfileData(editData)
                setIsEditing(false)
                queryClient.invalidateQueries({ queryKey: ['profile-data'] });
            } else {
                toast.error("Failed to update profile. Please try again.")
                setProfileData(editData)
                setIsEditing(false)
            }
            console.log("requestData", requestData)
        } catch (error) {
            console.error("Error updating profile:", error)
            toast.error("Failed to update profile. Please try again.")
        } finally {
            setIsLoading(false)
        }
    }

    // Function to handle profile image upload
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            // Create a URL for the file
            const imageUrl = URL.createObjectURL(file)
            updateEditData("profile_image_url", imageUrl)
            setFileImage(file)
        }
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 animate-fadeIn">
            <div
                className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden animate-scaleIn"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="relative bg-gradient-to-br from-violet-600 via-purple-600 to-blue-600 p-6 text-white overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-pink-500/20 to-yellow-500/20"></div>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>

                    <div className="relative flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <div className="relative group">
                                <div className="w-24 h-24 border-4 border-white/20 shadow-xl rounded-full overflow-hidden">
                                    <Image
                                        src={editData.profile_image_url || "/placeholder.svg"}
                                        width={96}
                                        height={96}
                                        alt="Profile"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                {isEditing && (
                                    <label className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                                        <Camera className="w-6 h-6 text-white" />
                                        <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                                    </label>
                                )}
                            </div>

                            <div className="flex-1">
                                <h2 className="text-3xl font-bold mb-2">
                                    {profileData.firstName} {profileData.lastName}
                                </h2>
                                <p className="text-white/80 mb-3">@{profileData.username ?? "-"}</p>
                            </div>
                        </div>

                        {/* Edit/Save/Cancel buttons */}
                        {activeTab === "personal" && (
                            <div className="flex gap-2">
                                {!isEditing ? (
                                    <Button
                                        onClick={handleEdit}
                                        variant="secondary"
                                        className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                                    >
                                        <Edit className="w-4 h-4 mr-2" />
                                        Edit Profile
                                    </Button>
                                ) : (
                                    <>
                                        <Button
                                            onClick={handleCancel}
                                            variant="secondary"
                                            disabled={isLoading}
                                            className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                                        >
                                            <X className="w-4 h-4 mr-2" />
                                            Cancel
                                        </Button>
                                        <Button
                                            onClick={handleSave}
                                            variant="secondary"
                                            disabled={isLoading}
                                            className="bg-white/90 hover:bg-white text-purple-600 border-0"
                                        >
                                            {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                                            {isLoading ? "Saving..." : "Save Changes"}
                                        </Button>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="border-b border-gray-200">
                    <nav className="flex">
                        {tabs.map((tab) => {
                            const Icon = tab.icon
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    disabled={tab.id !== "personal" && tab.id !== "telegram" && tab.id !== "history"}
                                    className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors relative 
                    ${activeTab === tab.id ? "text-teal-600" : "text-gray-500 hover:text-gray-700"}
                    ${tab.id !== "personal" && tab.id !== "telegram" && tab.id !== "history" ? "opacity-50 cursor-not-allowed" : ""}
                  `}
                                >
                                    <Icon className="w-4 h-4" />
                                    {tab.label}
                                    {activeTab === tab.id && (
                                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-600 to-blue-600"></div>
                                    )}
                                </button>
                            )
                        })}
                    </nav>
                </div>

                <div className="p-6 max-h-[calc(90vh-280px)] overflow-y-auto custom-scrollbar">
                    {activeTab === "personal" && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* First Name */}
                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2">
                                        <User className="w-4 h-4 text-purple-500" />
                                        First Name
                                    </Label>
                                    {isEditing ? (
                                        <Input
                                            placeholder="Enter your first name"
                                            value={editData.firstName}
                                            onChange={(e) => updateEditData("firstName", e.target.value)}
                                            className="border-purple-200 focus:border-purple-500"
                                        />
                                    ) : (
                                        <div className="p-3 bg-gray-50 rounded-md border">{profileData.firstName ?? "-"}</div>
                                    )}
                                </div>

                                {/* Last Name */}
                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2">
                                        <User className="w-4 h-4 text-purple-500" />
                                        Last Name
                                    </Label>
                                    {isEditing ? (
                                        <Input
                                            placeholder="Enter your last name"
                                            value={editData.lastName}
                                            onChange={(e) => updateEditData("lastName", e.target.value)}
                                            className="border-purple-200 focus:border-purple-500"
                                        />
                                    ) : (
                                        <div className="p-3 bg-gray-50 rounded-md border">{profileData.lastName ?? "-"}</div>
                                    )}
                                </div>

                                {/* Email */}
                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2">
                                        <Mail className="w-4 h-4 text-blue-500" />
                                        Email
                                    </Label>
                                    {isEditing ? (
                                        <Input
                                            placeholder="Enter your email"
                                            type="email"
                                            value={editData.email}
                                            onChange={(e) => updateEditData("email", e.target.value)}
                                            className="border-blue-200 focus:border-blue-500"
                                        />
                                    ) : (
                                        <div className="p-3 bg-gray-50 rounded-md border">{profileData.email ?? "-"}</div>
                                    )}
                                </div>

                                {/* Phone */}
                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2">
                                        <Phone className="w-4 h-4 text-green-500" />
                                        Phone Number
                                    </Label>
                                    {isEditing ? (
                                        <Input
                                            placeholder="Enter your phone number"
                                            type="tel"
                                            value={editData.phone}
                                            onChange={(e) => updateEditData("phone", e.target.value)}
                                            className="border-green-200 focus:border-green-500"
                                        />
                                    ) : (
                                        <div className="p-3 bg-gray-50 rounded-md border">{profileData.phone === null ? "-" : profileData.phone}</div>
                                    )}
                                </div>

                                {/* Username */}
                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2">
                                        <User2 className="w-4 h-4 text-red-500" />
                                        Username
                                    </Label>
                                    {isEditing ? (
                                        <Input
                                            placeholder="Enter your username"
                                            value={editData.username}
                                            onChange={(e) => updateEditData("username", e.target.value)}
                                            className="border-red-200 focus:border-red-500"
                                        />
                                    ) : (
                                        <div className="p-3 bg-gray-50 rounded-md border">{profileData.username ?? "-"}</div>
                                    )}
                                </div>

                                {/* Birthday */}
                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-orange-500" />
                                        Birthday
                                    </Label>
                                    {isEditing ? (
                                        <Input
                                            placeholder="Enter your birthday"
                                            type="date"
                                            value={editData.birthday}
                                            onChange={(e) => updateEditData("birthday", e.target.value)}
                                            className="border-orange-200 focus:border-orange-500"
                                        />
                                    ) : (
                                        <div className="p-3 bg-gray-50 rounded-md border">
                                            {new Date(profileData.birthday).toLocaleDateString("en-US", {
                                                year: "numeric",
                                                month: "long",
                                                day: "numeric",
                                            }) === null ? new Date(profileData.birthday).toLocaleDateString("en-US", {
                                                year: "numeric",
                                                month: "long",
                                                day: "numeric",
                                            }) : "-"}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                    {activeTab === "telegram" && (
                        <SettingTap />
                    )}
                    {activeTab === "history" && (
                        <TelegramHistory />
                    )}

                    <div className="mt-8 flex justify-end gap-3">
                        <Button variant="outline" onClick={onClose} disabled={isLoading}>
                            Close
                        </Button>

                    </div>
                </div>
            </div>
        </div>
    )
}

export default ProfileContrainer
