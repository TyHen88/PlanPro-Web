"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/shared/ui/Button"
import { cn } from "@/utils/utils"


type Props = {
    className?: string
    onClick?: () => void
}

export function ThemeToggle({ className, onClick }: Props) {
    const { theme, setTheme } = useTheme()
    const [mounted, setMounted] = React.useState(false)

    // Avoid hydration mismatch
    React.useEffect(() => {
        setMounted(true)
    }, [])

    // Use fallback button with spinner icon while mounting
    if (!mounted) {
        return (
            <Button
                variant="ghost"
                size="icon"
                className={cn("h-9 w-9", className)}
                disabled
            >
                <Sun className="h-4 w-4 animate-pulse" />
                <span className="sr-only">Toggle theme</span>
            </Button>
        )
    }

    return (
        <Button
            variant="ghost"
            size="icon"
            className={cn("h-9 w-9", className)}
            onClick={onClick ?? (() => setTheme(theme === "light" ? "dark" : "light"))}
            aria-label={
                theme === "light"
                    ? "Switch to dark mode"
                    : "Switch to light mode"
            }
            type="button"
        >
            {theme === "light" ? (
                <Sun className="h-4 w-4" />
            ) : (
                <Moon className="h-4 w-4" />
            )}

        </Button>
    )
}

