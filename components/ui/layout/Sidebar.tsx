import { useNavigation } from "@/lib/hooks/useNavigation"
import { Path } from "@/utils/enum"
import {
    AlertCircle,
    Calendar1,
    ChevronLeft,
    ChevronRight,
    MessageCircle,
    Notebook,
    Sparkles,
    Wallet
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/router"
import type React from "react"
import { memo, useCallback, useEffect, useState } from "react"

interface SidebarProps {
    isOpen: boolean
    setIsOpen: (isOpen: boolean) => void
}

interface SidebarItemProps {
    icon: React.ReactNode
    text: string
    active?: boolean
    collapsed?: boolean
    notification?: number | null
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
    href,
    onClick,
}) => {
    const [isHovered, setIsHovered] = useState(false)

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
            className={`relative flex items-center rounded-md text-sm font-medium cursor-pointer transition-colors ${active
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                } ${collapsed ? "justify-center px-2 py-2" : "justify-start px-3 py-2"}`}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onClick={onClick ? handleClick : undefined}
        >
            <div className={`flex-shrink-0 ${active ? "text-foreground" : ""}`}>
                {icon}
            </div>

            {!collapsed && (
                <>
                    <span className={`ml-3 flex-1 ${active ? "font-medium" : ""}`}>
                    {text}
                </span>
                    {notification !== null && notification !== undefined && (
                        <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-medium">
                    {notification}
                </span>
                    )}
                </>
            )}

            {collapsed && notification !== null && notification !== undefined && (
                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-primary"></span>
            )}

            {collapsed && isHovered && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-popover border border-border rounded-md shadow-md text-sm whitespace-nowrap z-50 text-popover-foreground">
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
        icon: <Wallet size={18} />,
        text: "Trips",
        notification: undefined,
    },
    {
        href: Path.NOTES,
        icon: <Notebook size={18} />,
        text: "Notes",
        notification: undefined,
    },
    {
        href: Path.REMINDER,
        icon: <AlertCircle size={18} />,
        text: "Reminder",
        notification: undefined,
    },
    {
        href: Path.CALENDAR,
        icon: <Calendar1 size={18} />,
        text: "Calendar",
        notification: 3,
    },
    {
        href: Path.CHAT_PAGE,
        icon: <MessageCircle size={18} />,
        text: "We Talk",
        notification: undefined,
    },
] as const

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
    const router = useRouter()
    const currentPath = router.pathname
    const [mounted, setMounted] = useState(false)
    const { isNavigating } = useNavigation()

    // Memoize current path check
    const isActivePath = useCallback((path: string) => currentPath === path, [currentPath])

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) return null

    return (
        <div
            className={`bg-card border-r border-border transition-all duration-300 h-screen ${isOpen ? "w-64" : "w-16"
                } flex flex-col fixed left-0 top-0 z-10`}
        >
            {/* Sidebar header */}
            <div
                className={`h-16 flex items-center border-b border-border ${isOpen ? "justify-start px-4" : "justify-center"
                    }`}
            >
                {isOpen ? (
                    <div className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-foreground" />
                        <span className="text-lg font-semibold text-foreground">
                            PlanPro
                        </span>
                    </div>
                ) : (
                    <Sparkles className="h-5 w-5 text-foreground" />
                )}
            </div>

            {/* Sidebar content */}
            <div className="flex-1 overflow-y-auto py-4 px-2">
                <nav className="space-y-1">
                    {/* Menu items */}
                    {MENU_ITEMS.map((item) => (
                        <SidebarItem
                            key={item.href}
                            href={item.href}
                            icon={item.icon}
                            text={item.text}
                            active={isActivePath(item.href)}
                            collapsed={!isOpen}
                            notification={item.notification}
                        />
                    ))}
                </nav>
            </div>

            {/* Sidebar footer */}
            <div className="p-2 border-t border-border">
                    <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center w-full rounded-md px-2 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                    >
                    {isOpen ? (
                        <>
                            <ChevronLeft size={16} className="mr-2" />
                            <span>Collapse</span>
                        </>
                    ) : (
                        <ChevronRight size={16} className="mx-auto" />
                    )}
                    </button>
            </div>

            {/* Navigation loading indicator */}
            {isNavigating && (
                <div className="absolute top-0 left-0 w-full h-0.5 bg-primary z-50"></div>
            )}
        </div>
    )

}

export default memo(Sidebar)
