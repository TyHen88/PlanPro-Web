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
                    className={`italic px-3 py-1 rounded-full text-xs font-medium border focus:outline-none focus:ring-2 transition shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed ${action.color || "bg-blue-50 text-blue-500 hover:bg-blue-100 border-blue-100 focus:ring-blue-400/30"
                        }`}
                    aria-label={action.label}
                >
                    {action.label}
                </button>
            ))}
        </div>
    )
}
