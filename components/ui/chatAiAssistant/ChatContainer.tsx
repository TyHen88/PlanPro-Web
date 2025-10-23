"use client"

import { ReactNode, useRef, useEffect } from "react"

interface ChatContainerProps {
    children: ReactNode
    className?: string
    autoScroll?: boolean
    scrollToBottom?: boolean
}

export default function ChatContainer({
    children,
    className = "",
    autoScroll = true,
    scrollToBottom = false
}: ChatContainerProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const bottomRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (autoScroll && bottomRef.current) {
            bottomRef.current.scrollIntoView({
                behavior: "smooth",
                block: "nearest"
            })
        }
    }, [children, autoScroll])

    useEffect(() => {
        if (scrollToBottom && bottomRef.current) {
            bottomRef.current.scrollIntoView({
                behavior: "smooth",
                block: "end"
            })
        }
    }, [scrollToBottom])

    return (
        <div
            ref={containerRef}
            className={`flex-1 overflow-y-auto px-4 sm:px-6 space-y-4 ${className}`}
        >
            {children}
            <div ref={bottomRef} />
        </div>
    )
}
