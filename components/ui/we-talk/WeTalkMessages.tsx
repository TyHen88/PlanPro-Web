import React, { useRef, useEffect, useCallback } from 'react'
import { AlertCircle, RefreshCw, ChevronUp, User } from 'lucide-react'
import { Message, Contact, MyContact } from '@/lib/types/weTalk.types'
import { formatDate, formatDateTime } from '@/utils/dateformat'
import Image from 'next/image'
import { useFetchProfile } from '@/lib/hooks/useFetchProfile'

interface WeTalkMessagesProps {
  messages: Message[]
  activeContact: MyContact | null
  isTyping: boolean
  typingUsers?: string[]
  isLoading: boolean
  hasNextPage?: boolean
  isFetchingNextPage?: boolean
  onLoadMore?: () => void
  error?: string
  onRetry?: () => void
}

const WeTalkMessages: React.FC<WeTalkMessagesProps> = ({
  messages,
  activeContact,
  isTyping,
  typingUsers = [],
  isLoading,
  hasNextPage = false,
  isFetchingNextPage = false,
  onLoadMore,
  error,
  onRetry
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const isScrolledToBottomRef = useRef(true)

  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior })
  }, [])

  // Check if user is scrolled to bottom
  const checkScrollPosition = useCallback(() => {
    if (!messagesContainerRef.current) return
    
    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current
    const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10 // 10px threshold
    isScrolledToBottomRef.current = isAtBottom
  }, [])

  // Scroll to bottom when new messages arrive (only if user was already at bottom)
  useEffect(() => {
    if (isScrolledToBottomRef.current) {
      scrollToBottom()
    }
  }, [messages, scrollToBottom])

  const prevScrollHeightRef = useRef<number>(0)
  const isLoadingMoreRef = useRef(false)

  // Scroll to bottom when conversation changes
  useEffect(() => {
    scrollToBottom('auto')
    isScrolledToBottomRef.current = true
  }, [activeContact?.conversationId, scrollToBottom])

  // Preserve scroll position when loading older messages
  useEffect(() => {
    if (!messagesContainerRef.current) return

    if (isLoadingMoreRef.current && !isFetchingNextPage) {
      const newScrollHeight = messagesContainerRef.current.scrollHeight
      const delta = newScrollHeight - prevScrollHeightRef.current
      messagesContainerRef.current.scrollTop = delta
      isLoadingMoreRef.current = false
    }
  }, [messages.length, isFetchingNextPage])

  const handleScroll = useCallback(() => {
    checkScrollPosition()
    
    if (!messagesContainerRef.current || !onLoadMore || !hasNextPage || isFetchingNextPage) return

    const { scrollTop, scrollHeight } = messagesContainerRef.current
    if (scrollTop <= 20) {
      prevScrollHeightRef.current = scrollHeight
      isLoadingMoreRef.current = true
      onLoadMore()
    }
  }, [onLoadMore, hasNextPage, isFetchingNextPage, checkScrollPosition])

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  if (isLoading && messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading messages...</p>
        </div>
      </div>
    )
  }

  if (error && messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center p-8">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Failed to load messages</h3>
          <p className="text-gray-500 mb-4">{error}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="flex items-center space-x-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors mx-auto"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Retry</span>
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div
      ref={messagesContainerRef}
      className="flex-1 overflow-y-auto p-6 space-y-4"
      onScroll={handleScroll}
    >
      {/* Load More Button / Loading indicator at top */}
      {(hasNextPage || isFetchingNextPage) && (
        <div className="flex justify-center py-4">
          {isFetchingNextPage ? (
            <div className="flex items-center space-x-2 text-gray-500">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-500"></div>
              <span className="text-sm">Loading more messages...</span>
            </div>
          ) : (
            hasNextPage && onLoadMore && (
              <button
                onClick={onLoadMore}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full transition-colors"
              >
                <ChevronUp className="w-4 h-4" />
                <span className="text-sm">Load more messages</span>
              </button>
            )
          )}
        </div>
      )}

      {/* Error indicator for partial failures */}
      {error && messages.length > 0 && (
        <div className="flex justify-center py-2">
          <div className="flex items-center space-x-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="w-4 h-4 text-red-500" />
            <span className="text-sm text-red-700">Some messages failed to load</span>
            {onRetry && (
              <button
                onClick={onRetry}
                className="text-red-600 hover:text-red-800 text-xs underline"
              >
                Retry
              </button>
            )}
          </div>
        </div>
      )}

      {messages.map((msg) => (
        <MessageBubble
          key={msg.id}
          message={msg}
          activeContact={activeContact}
        />
      ))}

      {/* Show typing indicators from other users */}
      {typingUsers.length > 0 && (
        <TypingIndicator 
          activeContact={activeContact} 
          typingUsers={typingUsers}
        />
      )}

      <div ref={messagesEndRef} />
    </div>
  )
}

interface MessageBubbleProps {
  message: Message
  activeContact: MyContact | null
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, activeContact }) => {
  const { data: profile } = useFetchProfile()
  return (
    <div
      className={`flex items-end space-x-3 animate-fadeIn mb-4 ${message.sender === 'user' ? 'justify-end' : 'justify-start'
        }`}
    >
      {/* Contact Avatar - Left side for contact messages */}
      {message.sender === 'other' && activeContact && (
        <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${activeContact.gradient} flex items-center justify-center text-lg flex-shrink-0 shadow-md border-2 border-white`}>
          {
            profile?.profile_image_url ? (
              <Image src={profile?.profile_image_url || profile} alt="Contact Avatar" width={34} height={34} className='rounded-full'/>
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-gray-600 to-gray-800 flex items-center justify-center text-lg flex-shrink-0 text-white shadow-md border-2 border-white">
                <User className="w-4 h-4" />
              </div>
            )
          }
        </div>
      )}

      {/* Message Bubble */}
      <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-lg relative ${message.sender === 'user'
          ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-br-md ml-auto'
          : 'bg-white text-gray-800 rounded-bl-md border border-gray-200 mr-auto'
        }`}>
        {/* Tail for message bubble */}
        <div className={`absolute bottom-0 w-4 h-4 ${message.sender === 'user'
            ? 'right-0 transform translate-x-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-br-full'
            : 'left-0 transform -translate-x-2 bg-white border-l border-b border-gray-200 rounded-bl-full'
          }`}></div>

        {/* Sender name for contact messages */}
        {message.sender === 'other' && (
          <p className="text-xs text-gray-500 mb-1 font-semibold">{message.senderName}</p>
        )}

        {/* Message text */}
        <p className="text-sm leading-relaxed font-medium">{message.text}</p>

        {/* Message footer with time and status */}
        <div className={`flex items-center justify-between mt-2 text-xs ${message.sender === 'user' ? 'text-white/80' : 'text-gray-500'
          }`}>
          <span className="font-medium">{formatDate(message.timestamp)}</span>
          {message.sender === 'user' && (
            <MessageStatus status={message.status} />
          )}
        </div>
      </div>

      {/* User Avatar - Right side for user messages */}
      {message.sender === 'user' && (
        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-gray-600 to-gray-800 flex items-center justify-center text-lg flex-shrink-0 text-white shadow-md border-2 border-white">
          {
            profile?.profile_image_url ? (
              <Image src={profile?.profile_image_url || profile} alt="User Avatar" width={34} height={34} className='rounded-full'/>
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-gray-600 to-gray-800 flex items-center justify-center text-lg flex-shrink-0 text-white shadow-md border-2 border-white">
                <User className="w-4 h-4" />
              </div>
            )
          }
        </div>
      )}
    </div>
  )
}

interface MessageStatusProps {
  status: 'sent' | 'delivered' | 'read'
}

const MessageStatus: React.FC<MessageStatusProps> = ({ status }) => {
  return (
    <div className="flex items-center space-x-1">
      {status === 'sent' && <div className="w-1 h-1 bg-white/70 rounded-full"></div>}
      {status === 'delivered' && <div className="w-1 h-1 bg-white rounded-full"></div>}
      {status === 'read' && <div className="w-1 h-1 bg-blue-300 rounded-full"></div>}
    </div>
  )
}

interface TypingIndicatorProps {
  activeContact: MyContact | null
  typingUsers: string[]
}

const TypingIndicator: React.FC<TypingIndicatorProps> = ({ activeContact, typingUsers }) => {
  if (typingUsers.length === 0) return null

  return (
    <div className="flex items-end space-x-2 animate-fadeIn">
      <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${activeContact?.gradient || 'from-gray-400 to-gray-600'} flex items-center justify-center text-sm`}>
        <Image src={activeContact?.avatarUrl || ''} alt="Contact Avatar" width={32} height={32} />
      </div>
      <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-none shadow-lg border border-gray-100">
        <div className="flex items-center space-x-2">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce animation-delay-200"></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce animation-delay-400"></div>
          </div>
          <span className="text-xs text-gray-500">
            {typingUsers.length === 1 
              ? `${typingUsers[0]} is typing...`
              : `${typingUsers.join(', ')} are typing...`
            }
          </span>
        </div>
      </div>
    </div>
  )
}

export default WeTalkMessages 