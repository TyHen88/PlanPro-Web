"use client"

import { Send, Mic, Paperclip, Smile, Image, X } from "lucide-react"
import type React from "react"
import { useState, useRef, useEffect } from "react"

interface ChatInputProps {
  onSendMessage: (message: string, images?: string[]) => void
  isLoading: boolean
  currentTheme: {
    color: string
    ring: string
    name: string
    gradient: string
  }
  sidebarState?: "expanded" | "collapsed" | "mini"
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading, currentTheme }) => {
  const [input, setInput] = useState("")
  const [images, setImages] = useState<string[]>([])
  const [isPasting, setIsPasting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim(), images.length > 0 ? images : undefined)
      setInput("")
      setImages([])
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      Array.from(files).forEach((file) => {
        if (file.type.startsWith('image/')) {
          const reader = new FileReader()
          reader.onload = (event) => {
            if (event.target?.result) {
              setImages(prev => [...prev, event.target!.result as string])
            }
          }
          reader.readAsDataURL(file)
        }
      })
    }
  }

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items
    let hasImages = false

    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      if (item.type.indexOf('image') !== -1) {
        hasImages = true
        const file = item.getAsFile()
        if (file) {
          setIsPasting(true)
          const reader = new FileReader()
          reader.onload = (event) => {
            if (event.target?.result) {
              setImages(prev => [...prev, event.target!.result as string])
              setIsPasting(false)
            }
          }
          reader.readAsDataURL(file)
        }
      }
    }

    // If no images were found, allow normal paste behavior
    if (!hasImages) {
      return
    }

    // Prevent default paste behavior for images
    e.preventDefault()
  }

  // Add paste event listener to the input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
        // Allow paste to work on the input
        return
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <div className="w-full">
      {/* Image Preview */}
      {images.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {images.map((image, index) => (
            <div key={index} className="relative">
              <img
                src={image}
                alt={`Upload ${index + 1}`}
                className="w-16 h-16 object-cover rounded-lg border border-gray-200"
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                aria-label="Remove image"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Pasting indicator */}
      {isPasting && (
        <div className="mb-3 flex items-center gap-2 text-sm text-gray-600">
          <div className="animate-spin w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full"></div>
          Processing pasted image...
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex items-center gap-3 w-full rounded-l-xl">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="text-gray-500 hover:text-gray-700 transition-colors flex-shrink-0"
          aria-label="Upload image"
          title="Upload image or paste with Ctrl+V"
        >
          <Image size={20} />
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageUpload}
          className="hidden"
        />

        <div className="relative flex-grow">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onPaste={handlePaste}
            placeholder="Type your message, paste an image (Ctrl+V), or click 📷 to upload..."
            className={`w-full px-5 py-3 border border-gray-200 rounded-full focus:outline-none focus:ring-2 ${currentTheme.ring} bg-gray-50 pr-10 transition-all duration-300`}
            disabled={isLoading}
          />
        </div>

        <button
          type="submit"
          className={`${currentTheme.color} text-white p-3 rounded-full hover:opacity-90 disabled:opacity-50 transition-all duration-300 shadow-md transform hover:scale-105 disabled:hover:scale-100 flex-shrink-0`}
          disabled={isLoading}
          aria-label={isLoading ? "Sending..." : "Send message"}
        >
          {isLoading ? (
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          ) : (
            <Send size={20} />
          )}
        </button>
      </form>
    </div>
  )
}

export default ChatInput
