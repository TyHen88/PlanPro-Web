"use client"

import { ReactNode } from "react"

interface ChatHeaderProps {
    title: string
    icon?: ReactNode
    subtitle?: string
    onClose?: () => void
    showCloseButton?: boolean
    className?: string
}

export default function ChatHeader({
    title,
    icon,
    subtitle,
    onClose,
    showCloseButton = true,
    className = ""
}: ChatHeaderProps) {
    return (
        <div className={`px-4 sm:px-6 ${className}`}>
            <div className="relative flex justify-start mb-4 gap-2">
                {icon && (
                    <div className="relative z-10">
                        {icon}
                    </div>
                )}
                <div className="flex-1">
                    <h2 className="text-base font-semibold text-foreground">{title}</h2>
                    {subtitle && (
                        <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
                    )}
                </div>
                {showCloseButton && onClose && (
                    <button
                        type="button"
                        onClick={onClose}
                        className="relative rounded-md text-muted-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary transition-colors"
                    >
                        <span className="absolute -inset-2.5" />
                        <span className="sr-only">Close panel</span>
                        <svg className="size-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                )}
            </div>
        </div>
    )
}
