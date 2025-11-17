"use client"

import { useState, useRef, useEffect } from "react"
import { PaperAirplaneIcon } from "@heroicons/react/24/outline"

interface ChatInputProps {
    onSend: (message: string) => void
    disabled?: boolean
    placeholder?: string
    className?: string
}

export default function ChatInput({
    onSend,
    disabled = false,
    placeholder = "Type your message...",
    className = ""
}: ChatInputProps) {
    const [input, setInput] = useState<string>("")
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto'
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`
        }
    }, [input])

    const handleSend = () => {
        const trimmed = input.trim()
        if (!trimmed || disabled) return

        onSend(trimmed)
        setInput("")
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    return (
        <div className={`flex items-center gap-2 ${className}`}>
            <textarea
                ref={textareaRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                disabled={disabled}
                className="flex-1 bg-muted text-foreground placeholder:text-muted-foreground rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary resize-none border border-input disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <button
                type="button"
                disabled={!input.trim() || disabled}
                onClick={handleSend}
                className="p-2.5 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-opacity hover:bg-accent flex-shrink-0"
            >
                <PaperAirplaneIcon
                    className={`w-5 h-5 rotate-[-90deg] ${(!input.trim() || disabled) ? "text-muted-foreground" : "text-primary"}`}
                />
            </button>
        </div>
    )
}
