"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/shared/ui/Button"
import { Input } from "@/components/shared/ui/Input"
import { User, Mail, Phone, Calendar, Camera, Shield, Edit, Save, X, User2, Loader2, History } from "lucide-react"
import Image from "next/image"
import { Label } from "@/components/shared/ui/label"
import profile from "@/public/asset/profile.jpg"
import { profileService } from "@/service/profile.service"
import { toast } from "sonner"
import { useQueryClient } from "@tanstack/react-query"
import SettingTap from "@/components/ui/profile/SettingTap"
import TelegramHistory from "./TelegramHistory"
import SecurityTap from "./SecurityTap"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/shared/ui/dialog"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/shared/ui/tabs"

type Props = {
    showProfile: boolean
    profile_data: any
    onClose: () => void
    onUpdate?: (updatedData: any) => Promise<any>
}

const ProfileContrainer = ({ profile_data, onClose, onUpdate, showProfile }: Props) => {
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
        auth_provider: profile_data?.auth_provider || "LOCAL",
    })

    const [editData, setEditData] = useState(profileData)

    const handleClose = () => {
        onClose()
    }

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
        } catch (error: any) {
            console.error("Error updating profile:", error)
            toast.error("Failed : " + error?.message)
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
        <Dialog open={showProfile} onOpenChange={handleClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden flex flex-col">
                <DialogHeader className="relative bg-gradient-to-br from-violet-600 via-purple-600 to-blue-600 p-6 text-white overflow-hidden">
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
                                <DialogTitle className="text-3xl font-bold mb-2 text-white">
                                    {profileData.firstName} {profileData.lastName}
                                </DialogTitle>
                                <DialogDescription className="text-white/80">
                                    @{profileData.username ?? "-"}
                                </DialogDescription>
                            </div>
                        </div>
                        {profileData.auth_provider !== "GOOGLE" && (
                            <>
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
                            </>
                        )}
                    </div>
                </DialogHeader>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
                    <div className="border-b border-border px-6">
                        <TabsList className="bg-transparent h-auto p-0">
                            <TabsTrigger value="personal" className="flex items-center gap-2 px-6 py-4">
                                <User className="w-4 h-4" />
                                Personal
                            </TabsTrigger>
                            <TabsTrigger value="telegram" className="flex items-center gap-2 px-6 py-4">
                                <Mail className="w-4 h-4" />
                                Telegram
                            </TabsTrigger>
                            <TabsTrigger value="history" className="flex items-center gap-2 px-6 py-4">
                                <History className="w-4 h-4" />
                                History
                            </TabsTrigger>
                            <TabsTrigger value="security" className="flex items-center gap-2 px-6 py-4">
                                <Shield className="w-4 h-4" />
                                Security
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6">
                        <TabsContent value="personal" className="mt-0 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* First Name */}
                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2 text-foreground">
                                        <User className="w-4 h-4 text-primary" />
                                        First Name
                                    </Label>
                                    {isEditing ? (
                                        <Input
                                            placeholder="Enter your first name"
                                            value={editData.firstName}
                                            onChange={(e) => updateEditData("firstName", e.target.value)}
                                            className="border-input focus:border-primary"
                                        />
                                    ) : (
                                        <div className="p-3 bg-muted rounded-md border border-border text-foreground">{profileData.firstName ?? "-"}</div>
                                    )}
                                </div>

                                {/* Last Name */}
                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2 text-foreground">
                                        <User className="w-4 h-4 text-primary" />
                                        Last Name
                                    </Label>
                                    {isEditing ? (
                                        <Input
                                            placeholder="Enter your last name"
                                            value={editData.lastName}
                                            onChange={(e) => updateEditData("lastName", e.target.value)}
                                            className="border-input focus:border-primary"
                                        />
                                    ) : (
                                        <div className="p-3 bg-muted rounded-md border border-border text-foreground">{profileData.lastName ?? "-"}</div>
                                    )}
                                </div>

                                {/* Email */}
                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2 text-foreground">
                                        <Mail className="w-4 h-4 text-primary" />
                                        Email
                                    </Label>
                                    {isEditing ? (
                                        <Input
                                            placeholder="Enter your email"
                                            type="email"
                                            value={editData.email}
                                            onChange={(e) => updateEditData("email", e.target.value)}
                                            className="border-input focus:border-primary"
                                        />
                                    ) : (
                                        <div className="p-3 bg-muted rounded-md border border-border text-foreground">{profileData.email ?? "-"}</div>
                                    )}
                                </div>

                                {/* Phone */}
                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2 text-foreground">
                                        <Phone className="w-4 h-4 text-primary" />
                                        Phone Number (Optional)
                                    </Label>
                                    {isEditing ? (
                                        <Input
                                            placeholder="Enter your phone number"
                                            type="tel"
                                            value={editData.phone}
                                            onChange={(e) => updateEditData("phone", e.target.value)}
                                            className="border-input focus:border-primary"
                                        />
                                    ) : (
                                        <div className="p-3 bg-muted rounded-md border border-border text-foreground">{profileData.phone === null ? "-" : profileData.phone}</div>
                                    )}
                                </div>

                                {/* Username */}
                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2 text-foreground">
                                        <User2 className="w-4 h-4 text-primary" />
                                        Username
                                    </Label>
                                    {isEditing ? (
                                        <Input
                                            placeholder="Enter your username"
                                            value={editData.username}
                                            onChange={(e) => updateEditData("username", e.target.value)}
                                            className="border-input focus:border-primary"
                                        />
                                    ) : (
                                        <div className="p-3 bg-muted rounded-md border border-border text-foreground">{profileData.username ?? "-"}</div>
                                    )}
                                </div>

                                {/* Birthday */}
                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2 text-foreground">
                                        <Calendar className="w-4 h-4 text-primary" />
                                        Birthday
                                    </Label>
                                    {isEditing ? (
                                        <Input
                                            placeholder="Enter your birthday"
                                            type="date"
                                            value={editData.birthday}
                                            onChange={(e) => updateEditData("birthday", e.target.value)}
                                            className="border-input focus:border-primary"
                                        />
                                    ) : (
                                        <div className="p-3 bg-muted rounded-md border border-border text-foreground">
                                            {new Date(profileData.birthday).toLocaleDateString("en-US", {
                                                year: "numeric",
                                                month: "long",
                                                day: "numeric",
                                            }) || "-"}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="telegram" className="mt-0">
                            <SettingTap />
                        </TabsContent>

                        <TabsContent value="history" className="mt-0">
                            <TelegramHistory />
                        </TabsContent>

                        <TabsContent value="security" className="mt-0">
                            <SecurityTap data={profile_data} />
                        </TabsContent>
                    </div>
                </Tabs>
            </DialogContent>
        </Dialog>
    )
}

export default ProfileContrainer
