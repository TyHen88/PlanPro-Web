import React, { useState, useEffect, useCallback } from 'react'
import { Send, Smile, Paperclip, Zap } from 'lucide-react'

interface WeTalkInputProps {
  onSendMessage: (message: string) => void
  onTypingIndicator?: (isTyping: boolean) => void
  disabled?: boolean
  isSending?: boolean
}

const WeTalkInput: React.FC<WeTalkInputProps> = ({ 
  onSendMessage, 
  onTypingIndicator,
  disabled = false, 
  isSending = false 
}) => {
  const [message, setMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const typingTimeoutRef = React.useRef<NodeJS.Timeout | null>(null)

  // Handle typing indicator
  const handleTyping = useCallback((typing: boolean) => {
    if (isTyping !== typing) {
      setIsTyping(typing)
      onTypingIndicator?.(typing)
    }
  }, [isTyping, onTypingIndicator])

  // Clear typing timeout
  const clearTypingTimeout = useCallback(() => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
      typingTimeoutRef.current = null
    }
  }, [])

  // Handle input change with typing indicator
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    setMessage(value)
    
    // Start typing indicator
    if (!isTyping && value.length > 0) {
      handleTyping(true)
    }
    
    // Clear existing timeout
    clearTypingTimeout()
    
    // Set timeout to stop typing indicator
    if (value.length > 0) {
      typingTimeoutRef.current = setTimeout(() => {
        handleTyping(false)
      }, 2000) // Stop typing indicator after 2 seconds of no input
    } else {
      handleTyping(false)
    }
  }

  // Cleanup typing timeout on unmount
  useEffect(() => {
    return () => {
      clearTypingTimeout()
      if (isTyping) {
        handleTyping(false)
      }
    }
  }, [isTyping, clearTypingTimeout, handleTyping])

  const handleSendMessage = () => {
    if (!message.trim() || disabled || isSending) {
      return
    }
    onSendMessage(message)
    setMessage('')
    
    // Stop typing indicator when sending
    clearTypingTimeout()
    handleTyping(false)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const quickActions = [
    { label: '👋 Hi', text: 'Hi there! 👋' },
    { label: '👍 Thanks', text: 'Thank you so much! 👍' },
    { label: '😊 Great!', text: 'That sounds great! 😊' },
  ]

  const handleQuickAction = (text: string) => {
    if (!disabled && !isSending) {
      onSendMessage(text)
    }
  }

  const isInputDisabled = disabled || isSending

  return (
    <div className="bg-white/90 backdrop-blur-sm border-t border-white/50 p-4">
      <div className="flex items-center space-x-3">
        <button 
          className="p-3 text-gray-500 hover:text-purple-500 hover:bg-purple-50 rounded-full transition-all"
          title="Attach file"
          disabled={isInputDisabled}
        >
          <Paperclip className="w-5 h-5" />
        </button>
        
        <div className="flex-1 relative">
          <textarea
            value={message}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            onFocus={() => {
              if (message.length > 0) {
                handleTyping(true)
              }
            }}
            onBlur={() => {
              clearTypingTimeout()
              handleTyping(false)
            }}
            placeholder={isSending ? "Sending..." : "Type a message..."}
            disabled={isInputDisabled}
            rows={1}
            className="w-full px-6 py-4 bg-gray-50 border-0 rounded-full focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all pr-12 resize-none overflow-hidden"
            style={{ minHeight: '56px', maxHeight: '120px' }}
          />
          <button 
            className="absolute right-3 top-1/2 transform -translate-y-1/2 p-2 text-gray-500 hover:text-purple-500 transition-colors"
            title="Add emoji"
            disabled={isInputDisabled}
          >
            <Smile className="w-5 h-5" />
          </button>
        </div>

        <button
          onClick={handleSendMessage}
          disabled={!message.trim() || isInputDisabled}
          className="p-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:hover:scale-100"
          title={message.trim() ? (isSending ? 'Sending...' : 'Send message') : 'Type a message to send'}
        >
          {isSending ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          ) : message.trim() ? (
            <Send className="w-5 h-5" />
          ) : (
            <Zap className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Quick Actions */}
      <div className="flex items-center space-x-2 mt-3">
        <span className="text-xs text-gray-500">Quick actions:</span>
        {quickActions.map((action, index) => (
          <button
            key={index}
            onClick={() => handleQuickAction(action.text)}
            disabled={isInputDisabled}
            className="px-3 py-1 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-600 rounded-full text-xs hover:from-purple-200 hover:to-pink-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {action.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export default WeTalkInput 