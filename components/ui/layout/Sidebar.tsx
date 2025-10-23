import { useFetchProfile } from "@/lib/hooks/useFetchProfile"
import { useNavigation } from "@/lib/hooks/useNavigation"
import profile from "@/public/asset/profile.jpg"
import { Path } from "@/utils/enum"
import {
    AlertCircle,
    Calendar1,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    LogOut,
    MessageCircle,
    Notebook,
    Sparkles,
    UserIcon,
    Wallet
} from "lucide-react"
import { signOut, useSession } from "next-auth/react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/router"
import type React from "react"
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react"
import ProfileContrainer from "../profile/ProfileContrainer"
import LogoutPopup from "./LogoutPopup"

interface SidebarProps {
    isOpen: boolean
    setIsOpen: (isOpen: boolean) => void
}

// Color configuration - moved outside component to prevent recreation
const COLOR_MAP = {
    blue: {
        bg: "bg-blue-50",
        text: "text-blue-600",
        hover: "hover:bg-blue-50/70 hover:text-blue-600",
        icon: "text-blue-500",
        notification: "bg-blue-100 text-blue-600",
        gradient: "from-blue-500 to-blue-400",
    },
    orange: {
        bg: "bg-orange-50",
        text: "text-orange-600",
        hover: "hover:bg-orange-50/70 hover:text-orange-600",
        icon: "text-orange-500",
        notification: "bg-orange-100 text-orange-600",
        gradient: "from-orange-500 to-orange-400",
    },
    yellow: {
        bg: "bg-yellow-50",
        text: "text-yellow-600",
        hover: "hover:bg-yellow-50/70 hover:text-yellow-600",
        icon: "text-yellow-500",
        notification: "bg-yellow-100 text-yellow-600",
        gradient: "from-yellow-500 to-yellow-400",
    },
    green: {
        bg: "bg-green-50",
        text: "text-green-600",
        hover: "hover:bg-green-50/70 hover:text-green-600",
        icon: "text-green-500",
        notification: "bg-green-100 text-green-600",
        gradient: "from-green-500 to-green-400",
    },
    teal: {
        bg: "bg-teal-50",
        text: "text-teal-600",
        hover: "hover:bg-teal-50/70 hover:text-teal-600",
        icon: "text-teal-500",
        notification: "bg-teal-100 text-teal-600",
        gradient: "from-teal-500 to-teal-400",
    },
    purple: {
        bg: "bg-purple-50",
        text: "text-purple-600",
        hover: "hover:bg-purple-50/70 hover:text-purple-600",
        icon: "text-purple-500",
        notification: "bg-purple-100 text-purple-600",
        gradient: "from-purple-500 to-purple-400",
    },
} as const

type ColorType = keyof typeof COLOR_MAP

interface SidebarItemProps {
    icon: React.ReactNode
    text: string
    active?: boolean
    collapsed?: boolean
    notification?: number | null
    color?: ColorType
    href?: string
    onClick?: () => void
}

// Memoized Sidebar item component
const SidebarItem = memo<SidebarItemProps>(({
    icon,
    text,
    active = false,
    collapsed = false,
    notification = null,
    color = "blue",
    href,
    onClick,
}) => {
    const [isHovered, setIsHovered] = useState(false)
    const colors = COLOR_MAP[color]

    const handleClick = useCallback((e: React.MouseEvent) => {
        if (onClick) {
            e.preventDefault()
            onClick()
        }
    }, [onClick])

    const handleMouseEnter = useCallback(() => setIsHovered(true), [])
    const handleMouseLeave = useCallback(() => setIsHovered(false), [])

    const itemContent = (
        <div
            className={`relative flex items-center px-3 py-2.5 rounded-lg text-sm font-medium cursor-pointer transition-all duration-200 ${active ? `${colors.bg} ${colors.text}` : `text-gray-700 ${colors.hover}`
                } ${collapsed ? "justify-center mx-2" : "justify-start mx-1"} ${isHovered && !active ? "shadow-sm" : ""
                }`}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onClick={onClick ? handleClick : undefined}
        >
            {active && !collapsed && (
                <div
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b rounded-r-md"
                    style={{
                        background: `linear-gradient(to bottom, var(--${color}-500), var(--${color}-400))`,
                    }}
                />
            )}

            <div className={`${active ? colors.icon : "text-gray-500"} transition-colors duration-200`}>
                {icon}
            </div>

            {!collapsed && (
                <span className={`ml-3 flex-1 transition-all duration-200 ${active ? "font-semibold" : ""}`}>
                    {text}
                </span>
            )}

            {!collapsed && notification && (
                <span className={`${colors.notification} px-2 py-0.5 rounded-full text-xs font-medium`}>
                    {notification}
                </span>
            )}

            {collapsed && notification && (
                <span className="absolute top-1 right-1 h-2 w-2 bg-blue-600 rounded-full"></span>
            )}

            {collapsed && isHovered && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-white rounded-md shadow-md text-sm whitespace-nowrap z-50">
                    {text}
                </div>
            )}
        </div>
    )

    if (href) {
        return (
            <Link href={href} prefetch={true} passHref>
                {itemContent}
            </Link>
        )
    }

    return itemContent
})

SidebarItem.displayName = 'SidebarItem'

// Menu items configuration
const MENU_ITEMS = [
    {
        href: Path.TRIP,
        icon: <Wallet size={20} />,
        text: "Trips",
        color: "blue" as const,
        notification: undefined,
    },
    {
        href: Path.NOTES,
        icon: <Notebook size={20} />,
        text: "Notes",
        color: "yellow" as const,
        notification: undefined,
    },
    {
        href: Path.REMINDER,
        icon: <AlertCircle size={20} />,
        text: "Reminder",
        color: "green" as const,
        notification: undefined,
    },
    {
        href: Path.CALENDAR,
        icon: <Calendar1 size={20} />,
        text: "Calendar",
        color: "teal" as const,
        notification: 3,
    },
    // {
    //     href: Path.CHAT,
    //     icon: <Bot size={20} />,
    //     text: "Chat AI",
    //     color: "purple" as const,
    //     notification: undefined,
    // },
    // {
    //     href: Path.TELEGRAM,
    //     icon: <MessageCircleDashed size={20} />,
    //     text: "Telegram",
    //     color: "purple" as const,
    //     notification: undefined,
    // },
    {
        href: Path.CHAT_PAGE,
        icon: <MessageCircle size={20} />,
        text: "We Talk",
        color: "purple" as const,
        notification: undefined,
    },
] as const

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
    const router = useRouter()
    const currentPath = router.pathname
    const [mounted, setMounted] = useState(false)
    const { isNavigating } = useNavigation()
    const [isLogoutPopupOpen, setIsLogoutPopupOpen] = useState(false)
    const { data, isError, isLoading } = useFetchProfile()
    const session = useSession()
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)
    const [showProfile, setShowProfile] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)

    // Memoize current path check
    const isActivePath = useCallback((path: string) => currentPath === path, [currentPath])

    // Setup CSS variables once
    useEffect(() => {
        setMounted(true)

        const cssVariables = {
            "--blue-500": "#3b82f6",
            "--blue-400": "#60a5fa",
            "--orange-500": "#f97316",
            "--orange-400": "#fb923c",
            "--yellow-500": "#eab308",
            "--yellow-400": "#facc15",
            "--green-500": "#22c55e",
            "--green-400": "#4ade80",
            "--teal-500": "#14b8a6",
            "--teal-400": "#2dd4bf",
            "--purple-500": "#a855f7",
            "--purple-400": "#c084fc",
        }

        Object.entries(cssVariables).forEach(([key, value]) => {
            document.documentElement.style.setProperty(key, value)
        })
    }, [])

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false)
            }
        }

        document.addEventListener("mousedown", handleClickOutside)
        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [])

    // Handle logout
    const handleLogout = useCallback(() => {
        signOut()
        router.push("/login")
    }, [])

    // Memoize profile data
    const profileData = useMemo(() => ({
        name: data?.first_name && data?.last_name
            ? `${data.first_name} ${data.last_name}`
            : data?.username || 'User',
        email: data?.email || '',
        imageUrl: data?.profile_image_url || profile,
    }), [data])

    if (!mounted) return null

    if (isError) {
        return (
            <div className="bg-white border-r border-gray-200 w-64 h-screen flex items-center justify-center">
                <div className="text-red-500">Error loading sidebar</div>
            </div>
        )
    }

    return (
        <div
            className={`bg-white border-r border-gray-200 transition-all duration-300 h-screen ${isOpen ? "w-64" : "w-20"
                } flex flex-col fixed left-0 top-0 z-10 shadow-sm`}
        >
            {isLogoutPopupOpen && <LogoutPopup open={isLogoutPopupOpen} onClose={() => setIsLogoutPopupOpen(false)} onLogout={handleLogout} />}
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-full h-64 bg-gradient-to-b from-blue-50 to-transparent opacity-50 pointer-events-none"></div>
            <div className="absolute bottom-0 right-0 w-full h-64 bg-gradient-to-t from-teal-50 to-transparent opacity-50 pointer-events-none"></div>

            {/* Sidebar header */}
            <div
                className={`h-16 flex items-center px-4 border-b border-gray-200 relative z-10 ${isOpen ? "justify-start" : "justify-center"
                    }`}
            >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-teal-50 opacity-50 pointer-events-none"></div>
                {isOpen ? (
                    <div className="flex items-center relative z-10">
                        <div className="relative">
                            <div className="absolute inset-0 bg-blue-500 rounded-full blur-sm opacity-20 animate-pulse"></div>
                            <Sparkles className="h-8 w-8 text-blue-500 relative z-10" />
                        </div>
                        <span className="ml-2 text-xl font-bold bg-gradient-to-r from-blue-500 to-teal-400 bg-clip-text text-transparent">
                            PlanPro
                        </span>
                    </div>
                ) : (
                    <div className="relative z-10">
                        <div className="absolute inset-0 bg-blue-500 rounded-full blur-sm opacity-20 animate-pulse"></div>
                        <Sparkles className="h-8 w-8 text-blue-500 relative z-10" />
                    </div>
                )}
            </div>

            {/* Sidebar content */}
            <div className="flex-1 overflow-y-auto py-4 px-2">
                <div className="space-y-1.5">
                    {/* Menu items */}
                    {MENU_ITEMS.map((item) => (
                        <SidebarItem
                            key={item.href}
                            href={item.href}
                            icon={item.icon}
                            text={item.text}
                            active={isActivePath(item.href)}
                            collapsed={!isOpen}
                            color={item.color}
                            notification={item.notification}
                        />
                    ))}

                    {/* Favorites section */}
                    {isOpen && (
                        <div className="mt-8 mb-3 px-3">
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-200"></div>
                                </div>
                                <div className="relative flex justify-center text-xs">
                                    <span className="px-2 bg-white text-gray-500 uppercase tracking-wider font-semibold">
                                        Profile
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {!isOpen && <div className="mt-8 mb-3 border-t border-gray-200"></div>}
                    {/* User profile */}
                    <div className="relative ml-4 flex flex-col items-center" ref={dropdownRef}>
                        <button
                            className="flex items-center justify-center p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            aria-expanded={isDropdownOpen}
                            aria-haspopup="true"
                        >
                            <div
                                className={`h-8 w-8 rounded-full overflow-hidden flex items-center justify-center border-2 ${isDropdownOpen ? `border-blue-500` : "border-gray-200 dark:border-gray-600"
                                    }`}
                            >
                                <Image
                                    src={profileData.imageUrl}
                                    alt="User avatar"
                                    width={48}
                                    height={48}
                                    className="h-full w-full object-cover"
                                    priority
                                />
                            </div>
                            <ChevronDown
                                size={16}
                                className={`ml-1 transition-transform duration-200 ${isDropdownOpen ? "rotate-180 text-gray-800 dark:text-white" : "text-gray-400 dark:text-gray-500"
                                    }`}
                            />
                        </button>




                        {/* Dropdown menu - now positioned above the button */}
                        {isDropdownOpen && (
                            <div className="absolute right-0 bottom-full mb-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg py-1 border border-gray-200 dark:border-gray-700 z-10 transition-all duration-200">
                                <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                                    <p className="text-sm font-medium text-gray-800 dark:text-white">
                                        {profileData.name}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        {profileData.email}
                                    </p>
                                </div>

                                <div
                                    onClick={() => setShowProfile(true)}
                                    className="cursor-pointer flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                                >
                                    <UserIcon size={16} className="mr-3 text-gray-500 dark:text-gray-400" />
                                    Settings
                                </div>



                                <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>

                                <div
                                    onClick={
                                        () => setIsLogoutPopupOpen(true)
                                    }
                                    className="cursor-pointer flex items-center px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                                >
                                    <LogOut size={16} className="mr-3" />
                                    Sign out
                                </div>
                            </div>
                        )}

                        {showProfile && (
                            <ProfileContrainer
                                profile_data={data}
                                onClose={() => setShowProfile(false)}
                            />
                        )}
                    </div>


                </div>
            </div>



            {/* Sidebar footer */}
            <div className="p-4 border-t border-gray-200 bg-gradient-to-r from-blue-50/30 to-teal-50/30">
                {isOpen ? (
                    <button
                        onClick={() => setIsOpen(false)}
                        className="flex items-center justify-between w-full px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-white hover:shadow-sm transition-all duration-200"
                    >
                        <span>Collapse Sidebar</span>
                        <ChevronLeft size={16} className="text-gray-500" />
                    </button>
                ) : (
                    <button
                        onClick={() => setIsOpen(true)}
                        className="flex items-center justify-center w-full p-2 text-gray-700 rounded-lg hover:bg-white hover:shadow-sm transition-all duration-200"
                    >
                        <ChevronRight size={16} className="text-gray-500" />
                    </button>
                )}
            </div>

            {/* Navigation loading indicator */}
            {isNavigating && (
                <div className="absolute top-0 left-0 w-full h-1 bg-blue-500 animate-pulse z-50"></div>
            )}
        </div>
    )
}

export default memo(Sidebar)
