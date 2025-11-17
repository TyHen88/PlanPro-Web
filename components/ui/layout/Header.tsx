"use client"

import { ThemeToggle } from "@/components/shared/theme-toggle"
import { Button } from "@/components/shared/ui/Button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/shared/ui/popover"
import { useFetchProfile } from "@/lib/hooks/useFetchProfile"
import profile from "@/public/asset/profile.jpg"
import { LogOut, Settings, Smile } from "lucide-react"
import { signOut } from "next-auth/react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/router"
import { useState } from "react"
import ProfileContrainer from "../profile/ProfileContrainer"
import { useTheme } from "next-themes"

export function Header() {
    const [isOpenSettingsMenu, setIsOpenSettingsMenu] = useState(false)
    const [showProfile, setShowProfile] = useState(false)
    const { data: userInfoData, isError } = useFetchProfile()
    const router = useRouter()
    const { theme, setTheme } = useTheme()
    const handleLogout = () => {
        signOut()
        router.push("/login")
    }

    const profileData = userInfoData || null

    return (
        <>
            <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="w-full max-w-full h-16 px-4 md:px-6 flex items-center justify-between mx-auto">
                    {/* Left (Logo/brand) */}
                    <div className="flex items-center">
                        <Link href="/" className="flex items-center space-x-2 min-w-0">
                            <span className="font-bold text-lg truncate max-w-[120px] sm:max-w-none text-foreground inline-flex items-center">
                                Welcome back,&nbsp;
                                <span>{profileData?.username || profileData?.first_name || "User"}!</span>
                                <Smile className="h-4 w-4 ml-1 shrink-0 text-foreground inline" />
                            </span>
                        </Link>
                    </div>

                    {/* Right navigation/actions */}
                    <nav className="flex items-center gap-3 sm:gap-4">
                        <Popover open={isOpenSettingsMenu} onOpenChange={setIsOpenSettingsMenu} modal={true}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    aria-label="Open Settings Menu"
                                    className="p-2"
                                    tabIndex={0}
                                    type="button"
                                >
                                    <Settings className="h-5 w-5" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent
                                align="end"
                                className="w-60 min-w-[210px] px-0 py-2"
                                sideOffset={10}
                            >
                                {profileData && (
                                    <div className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="relative">
                                                <Image
                                                    src={profileData?.profile_image_url || profile}
                                                    alt="Profile"
                                                    width={36}
                                                    height={36}
                                                    className="rounded-full object-cover w-9 h-9"
                                                />
                                            </div>
                                            <div className="min-w-0">
                                                <div className="font-medium truncate max-w-[110px] text-foreground">
                                                    {profileData?.username || profileData?.first_name || "User"}
                                                </div>
                                                <div className="text-xs truncate text-muted-foreground max-w-[110px]">
                                                    {profileData?.email || "N/A"}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="mt-3 grid gap-1">
                                            <div>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="justify-start w-full"
                                                    tabIndex={0}
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        setShowProfile(true)
                                                        setIsOpenSettingsMenu(false)
                                                    }}
                                                >
                                                    <Settings className="mr-2 h-4 w-4" />
                                                    Edit Profile / Settings
                                                </Button>
                                            </div>
                                            <div
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    handleLogout()
                                                }}
                                            >
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="justify-start w-full text-destructive hover:text-destructive"
                                                    tabIndex={0}
                                                    type="button"
                                                >
                                                    <LogOut className="mr-2 h-4 w-4" />
                                                    Logout
                                                </Button>
                                            </div>
                                            <div className="pt-2 border-t border-border">
                                                <div className="px-2">
                                                    <ThemeToggle onClick={() => setTheme?.(theme === "light" ? "dark" : "light")} /> <span className="sr-only">Toggle theme</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </PopoverContent>
                        </Popover>
                    </nav>
                </div>
            </header>

            {showProfile && profileData && (
                <ProfileContrainer
                    showProfile={showProfile}
                    profile_data={profileData as any}
                    onClose={() => setShowProfile(false)}
                />
            )}
        </>
    )
}

