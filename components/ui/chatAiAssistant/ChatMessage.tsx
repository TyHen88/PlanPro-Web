"use client"

import { ReactNode } from "react"
import TypewriterText from "./TypewriterText"
import { AIResponseFormatter } from "./AIResponseFormatter"

interface ChatMessageProps {
    text: string
    from: "ai" | "user" | "system"
    timestamp?: number
    isLoading?: boolean
    children?: ReactNode
    className?: string
    typewriterEnabled?: boolean
    typewriterSpeed?: number
    onTypewriterComplete?: () => void
}

export default function ChatMessage({
    text,
    from,
    timestamp,
    isLoading = false,
    children,
    className = "",
    typewriterEnabled = true,
    typewriterSpeed = 30,
    onTypewriterComplete
}: ChatMessageProps) {
    const formatTime = (timestamp?: number) => {
        if (!timestamp) return ""
        return new Date(timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const isUser = from === "user"
    const isSystem = from === "system"

    return (
        <div className={`flex w-full ${isUser ? "justify-end" : "justify-start"} ${className}`}>
            <div className="max-w-[90%]">
                <div
                    className={
                        (isUser
                            ? "bg-blue-500 text-white ml-12 rounded-br-2xl rounded-tl-2xl rounded-bl-md"
                            : isSystem
                                ? "bg-yellow-100 text-yellow-800 mr-12 rounded-lg border border-yellow-200"
                                : "bg-gray-100 text-gray-900 mr-12 rounded-bl-2xl rounded-tr-2xl rounded-br-md"
                        ) +
                        " px-4 py-2 text-sm inline-block shadow-md break-words"
                    }
                    style={{
                        wordBreak: 'break-word',
                        whiteSpace: 'pre-wrap',
                        alignSelf: isUser ? "flex-end" : "flex-start"
                    }}
                >
                    {isLoading ? (
                        <div className="flex items-center space-x-1">
                            <div className="flex space-x-1">
                                <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                            </div>
                            <span className="ml-2">AI is thinking...</span>
                        </div>
                    ) : from === "ai" && typewriterEnabled ? (
                        <TypewriterText
                            text={text}
                            speed={typewriterSpeed}
                            cursor={true}
                            cursorChar="|"
                            onComplete={onTypewriterComplete}
                        />
                    ) : from === "ai" ? (
                        <AIResponseFormatter content={text} />
                    ) : (
                        text
                    )}
                </div>
                {timestamp && (
                    <div className={`text-xs text-gray-500 mt-1 ${isUser ? "text-right" : "text-left"}`}>
                        {formatTime(timestamp)}
                    </div>
                )}
                {children}
            </div>
        </div>
    )
}
