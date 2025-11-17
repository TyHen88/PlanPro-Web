"use client"

import { useState, useEffect, useRef } from "react"
import { AIResponseFormatter } from "./AIResponseFormatter"

interface TypewriterTextProps {
    text: string
    speed?: number // milliseconds per character
    onComplete?: () => void
    className?: string
    children?: React.ReactNode
    enabled?: boolean // allow disabling the typewriter effect
    cursor?: boolean // show blinking cursor
    cursorChar?: string
    cursorSpeed?: number // cursor blink speed in ms
}

export default function TypewriterText({
    text,
    speed = 8,
    onComplete,
    className = "",
    children,
    enabled = true,
    cursor = true,
    cursorChar = "|",
    cursorSpeed = 500
}: TypewriterTextProps) {
    const [displayedText, setDisplayedText] = useState("")
    const [showCursor, setShowCursor] = useState(true)
    const [isTyping, setIsTyping] = useState(false)
    const timeoutRef = useRef<NodeJS.Timeout | null>(null)
    const cursorTimeoutRef = useRef<NodeJS.Timeout | null>(null)

    // Cursor blinking effect
    useEffect(() => {
        if (cursor && isTyping) {
            const blink = () => {
                setShowCursor(prev => !prev)
                cursorTimeoutRef.current = setTimeout(blink, cursorSpeed)
            }
            cursorTimeoutRef.current = setTimeout(blink, cursorSpeed)
        }

        return () => {
            if (cursorTimeoutRef.current) {
                clearTimeout(cursorTimeoutRef.current)
            }
        }
    }, [cursor, cursorSpeed, isTyping])

    // Typewriter effect
    useEffect(() => {
        if (!enabled) {
            setDisplayedText(text)
            setIsTyping(false)
            if (onComplete) onComplete()
            return
        }

        setDisplayedText("")
        setIsTyping(true)
        let currentIndex = 0

        const typeNextChar = () => {
            if (currentIndex < text.length) {
                setDisplayedText(text.slice(0, currentIndex + 1))
                currentIndex++
                timeoutRef.current = setTimeout(typeNextChar, speed)
            } else {
                setIsTyping(false)
                if (onComplete) onComplete()
            }
        }

        timeoutRef.current = setTimeout(typeNextChar, speed)

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current)
            }
        }
    }, [text, speed, enabled, onComplete])

    // Cleanup timeouts on unmount
    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current)
            }
            if (cursorTimeoutRef.current) {
                clearTimeout(cursorTimeoutRef.current)
            }
        }
    }, [])

    return (
        <span className={className}>
            <AIResponseFormatter content={displayedText} />
            {cursor && isTyping && showCursor && (
                <span className="animate-pulse">{cursorChar}</span>
            )}
            {children}
        </span>
    )
}
