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
        <div className={`flex flex-row-reverse space-x-reverse space-x-2 ${className}`}>
            <textarea
                ref={textareaRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                disabled={disabled}
                className="flex-1 bg-gray-100 text-gray-900 placeholder-gray-400 rounded-lg px-6 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                style={{ minHeight: '30px', maxHeight: '120px' }}
            />
            <button
                type="button"
                disabled={!input.trim() || disabled}
                onClick={handleSend}
                className="p-2"
                style={{ background: "none", border: "none", boxShadow: "none" }}
            >
                <PaperAirplaneIcon
                    className="w-5 h-5 rotate-[-90deg]"
                    style={{ color: (!input.trim() || disabled) ? "#9ca3af" : "#a21caf" }}
                />
            </button>
        </div>
    )
}
