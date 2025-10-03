'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Paperclip, Smile, MoreVertical, File } from 'lucide-react'
import Image from 'next/image'
import { useSession } from 'next-auth/react'
import { ChatRoom, ChatMessage } from '@/lib/types/chatRoom'

interface ChatConversationProps {
  selectedRoom: ChatRoom | null
  messages: ChatMessage[]
  onSendMessage: (text: string) => void
  onSendFile: (file: File) => void
  isDarkMode: boolean
  loading: boolean
}

const ChatConversation = ({
  selectedRoom,
  messages,
  onSendMessage,
  onSendFile,
  isDarkMode,
  loading
}: ChatConversationProps) => {
  console.log('selectedRoom', selectedRoom)
  const { data: session, status } = useSession()
  const [inputText, setInputText] = useState('')
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [isTyping, setIsTyping] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const emojis = ['😊', '❤️', '👍', '🎉', '🔥', '💯', '👏', '🙌', '😍', '🤔']

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSendMessage = () => {
    if (inputText.trim()) {
      onSendMessage(inputText)
      setInputText('')
      setShowEmojiPicker(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      onSendFile(file)
    }
  }

  // Helper function to get room display name
  const getRoomDisplayName = (room: ChatRoom) => {
    if (room.type === 'DIRECT' && room.participants) {
      const currentUserId = typeof session?.user?.id === 'number' ? session.user.id : parseInt(session?.user?.id as string) || 1
      console.log('getRoomDisplayName - currentUserId:', currentUserId, 'session:', session)
      const otherParticipant = room.participants.find(p => p.user.id !== currentUserId)
      return otherParticipant?.user.displayName || room.name || 'Unknown User'
    }
    return room.name || 'Unknown Room'
  }

  // Helper function to get room avatar
  const getRoomAvatar = (room: ChatRoom) => {
    if (room.type === 'DIRECT' && room.participants) {
      const currentUserId = typeof session?.user?.id === 'number' ? session.user.id : parseInt(session?.user?.id as string) || 1
      console.log('getRoomAvatar - currentUserId:', currentUserId, 'session:', session)
      const otherParticipant = room.participants.find(p => p.user.id !== currentUserId)
      return otherParticipant?.user.displayName?.charAt(0) || (room.name || 'U').charAt(0)
    }
    return (room.name || 'U').charAt(0)
  }

  if (!selectedRoom) {
    return (
      <div className={`flex-1 flex items-center justify-center ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
        }`}>
        <div className="text-center">
          <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center`}>
            <span className="text-white text-2xl">💬</span>
          </div>
          <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
            Select a chat to start messaging
          </h3>
          <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
            Choose from your conversations or start a new one
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={`flex-1 flex flex-col ${isDarkMode ? 'bg-gray-900' : 'bg-white'
      }`}>
      {/* Header */}
      <div className={`p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'
        }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                {getRoomAvatar(selectedRoom)}
              </div>
              {/* Online status could be determined by checking if any participant is online */}
            </div>
            <div>
              <h2 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                {getRoomDisplayName(selectedRoom)}
              </h2>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                {selectedRoom.type === 'DIRECT' ? 'Direct message' : 'Group chat'}
              </p>
            </div>
          </div>

          <button className={`p-2 rounded-full transition-colors ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
            }`}>
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <AnimatePresence>
            {(messages || []).map((message, index) => {
              // Handle session loading state
              if (status === 'loading') {
                return null
              }

              const currentUserId = typeof session?.user?.id === 'number' ? session.user.id : parseInt(session?.user?.id as string) || 1
              console.log('Message rendering - currentUserId:', currentUserId, 'session:', session, 'message sender:', message?.sender?.id)
              const isCurrentUser = message?.sender?.id === currentUserId
              return (
                <motion.div
                  key={message?.id || index}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-xs lg:max-w-md ${isCurrentUser ? 'order-2' : 'order-1'
                    }`}>
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className={`relative p-4 rounded-2xl shadow-lg ${isCurrentUser
                        ? isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-900 text-white'
                        : isDarkMode
                          ? 'bg-gray-800 text-white'
                          : 'bg-gray-100 text-gray-900'
                        }`}
                    >
                      {message?.messageType === 'IMAGE' && (
                        <div className="mb-2">
                          <Image
                            src={message?.content || ''}
                            alt="attachment"
                            width={400}
                            height={128}
                            className="w-full h-32 object-cover rounded-lg"
                          />
                        </div>
                      )}

                      {message?.messageType === 'FILE' && (
                        <div className={`flex items-center space-x-2 p-2 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
                          }`}>
                          <File className="w-4 h-4" />
                          <div>
                            <div className="text-sm font-medium">{message?.content || ''}</div>
                          </div>
                        </div>
                      )}

                      {message?.messageType === 'TEXT' && (
                        <p className="text-sm">{message?.content || ''}</p>
                      )}

                      <div className={`flex items-center justify-between mt-2 text-xs ${isCurrentUser ? 'text-gray-300' : 'text-gray-500'
                        }`}>
                        <span>{new Date(message?.sentAt || new Date()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        {!isCurrentUser && (
                          <span className="text-xs opacity-70">{message?.sender?.displayName || 'Unknown'}</span>
                        )}
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        )}

        {/* Typing Indicator */}
        <AnimatePresence>
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex justify-start"
            >
              <div className={`p-4 rounded-2xl shadow-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'
                }`}>
                <div className="flex space-x-1">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      animate={{ y: [0, -10, 0] }}
                      transition={{
                        duration: 0.6,
                        repeat: Infinity,
                        delay: i * 0.2
                      }}
                      className={`w-2 h-2 rounded-full ${isDarkMode ? 'bg-gray-400' : 'bg-gray-500'
                        }`}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className={`p-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'
        }`}>
        <div className="flex items-end space-x-3">
          <div className="flex-1 relative">
            <div className={`flex items-end space-x-2 p-3 rounded-2xl border ${isDarkMode
              ? 'bg-gray-800 border-gray-600'
              : 'bg-gray-50 border-gray-300'
              }`}>
              <button
                onClick={() => fileInputRef.current?.click()}
                className={`p-2 rounded-full transition-colors ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'
                  }`}
              >
                <Paperclip className="w-5 h-5" />
              </button>

              <div className="flex-1">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Write a message..."
                  className={`w-full bg-transparent outline-none ${isDarkMode ? 'text-white placeholder-gray-400' : 'text-gray-900 placeholder-gray-500'
                    }`}
                />
              </div>

              <button
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className={`p-2 rounded-full transition-colors ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'
                  }`}
              >
                <Smile className="w-5 h-5" />
              </button>
            </div>

            {/* Emoji Picker */}
            <AnimatePresence>
              {showEmojiPicker && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className={`absolute bottom-full mb-2 p-3 rounded-lg shadow-lg ${isDarkMode ? 'bg-gray-700' : 'bg-white'
                    }`}
                >
                  <div className="grid grid-cols-5 gap-2">
                    {emojis.map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => {
                          setInputText(prev => prev + emoji)
                          setShowEmojiPicker(false)
                        }}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSendMessage}
            disabled={!inputText.trim()}
            className={`p-3 rounded-full transition-colors ${inputText.trim()
              ? 'bg-blue-500 text-white'
              : isDarkMode
                ? 'bg-gray-600 text-gray-400'
                : 'bg-gray-200 text-gray-400'
              }`}
          >
            <Send className="w-5 h-5" />
          </motion.button>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileUpload}
        className="hidden"
        accept="image/*,.pdf,.doc,.docx"
      />
    </div>
  )
}

export default ChatConversation 