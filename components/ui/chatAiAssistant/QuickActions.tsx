"use client"

import { ReactNode } from "react"

export interface QuickAction {
    icon?: ReactNode
    label?: string
    generateMessage?: () => string
    color?: string
}

interface QuickActionsProps {
    actions: QuickAction[]
    onActionClick: (action: QuickAction) => void
    className?: string
    disabled?: boolean
}

export default function QuickActions({
    actions,
    onActionClick,
    className = "",
    disabled = false
}: QuickActionsProps) {
    return (
        <div className={`w-full flex flex-wrap items-center gap-2 ${className}`}>
            {actions.map((action, index) => (
                <button
                    key={`${action.label}-${index}`}
                    type="button"
                    onClick={() => !disabled && onActionClick(action)}
                    disabled={disabled}
                    className={`italic px-3 py-1 rounded-full text-xs font-medium border focus:outline-none focus:ring-2 transition shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed ${action.color || "bg-primary/10 dark:bg-primary/20 text-primary hover:bg-primary/20 dark:hover:bg-primary/30 border-primary/30 dark:border-primary/40 focus:ring-primary/30"
                        }`}
                    aria-label={action.label}
                >
                    {action.label}
                </button>
            ))}
        </div>
    )
}
