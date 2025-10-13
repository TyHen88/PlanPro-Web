'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Plus, Sun, Moon } from 'lucide-react'
import { ChatRoom } from '@/lib/types/chatRoom'

interface ChatListProps {
  rooms: ChatRoom[]
  selectedRoomId?: number
  onChatSelect: (roomId: number) => void
  onNewChat: () => void
  isDarkMode: boolean
  onThemeToggle: () => void
  loading: boolean
}

const ChatList = ({
  rooms,
  selectedRoomId,
  onChatSelect,
  onNewChat,
  isDarkMode,
  onThemeToggle,
  loading
}: ChatListProps) => {
  const [searchQuery, setSearchQuery] = useState('')

  // Debug: Log what we're receiving
  console.log('ChatList received rooms:', rooms, 'type:', typeof rooms, 'isArray:', Array.isArray(rooms))

  // Ensure rooms is always an array
  const safeRooms = Array.isArray(rooms) ? rooms : []

  const filteredRooms = safeRooms.filter(room =>
    (room.name || '').toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Helper function to get room display name
  const getRoomDisplayName = (room: ChatRoom) => {
    if (room.type === 'DIRECT' && room.participants) {
      // For direct chats, show the other participant's name
      const otherParticipant = room.participants.find(p => p.user.id !== 1) // Assuming current user ID is 1
      return otherParticipant?.user.displayName || room.name || 'Unknown User'
    }
    return room.name || 'Unknown Room'
  }

  // Helper function to get room avatar
  const getRoomAvatar = (room: ChatRoom) => {
    if (room.type === 'DIRECT' && room.participants) {
      const otherParticipant = room.participants.find(p => p.user.id !== 1)
      return otherParticipant?.user.displayName?.charAt(0) || (room.name || 'U').charAt(0)
    }
    return (room.name || 'U').charAt(0)
  }

  return (
    <div className={`w-80 border-r ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'
      }`}>
      {/* Header */}
      <div className={`p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'
        }`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
            Chats
          </h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={onThemeToggle}
              className={`p-2 rounded-full transition-colors ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                }`}
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button
              onClick={onNewChat}
              className={`p-2 rounded-full transition-colors ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                }`}
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search chats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-10 pr-4 py-2 rounded-lg border ${isDarkMode
              ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400'
              : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
          />
        </div>
      </div>

      {/* Chat List */}
      <div className="overflow-y-auto h-[calc(100vh-120px)]">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <AnimatePresence>
            {filteredRooms.map((room) => (
              <motion.div
                key={room.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                whileHover={{ backgroundColor: isDarkMode ? '#374151' : '#f3f4f6' }}
                onClick={() => onChatSelect(room.id)}
                className={`p-4 cursor-pointer transition-colors ${selectedRoomId === room.id
                  ? isDarkMode ? 'bg-purple-900/20' : 'bg-purple-100'
                  : ''
                  }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                      {getRoomAvatar(room)}
                    </div>
                    {/* Online status could be determined by checking if any participant is online */}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className={`font-medium truncate ${isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                        {getRoomDisplayName(room)}
                      </h3>
                      <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                        {new Date(room.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className={`text-sm truncate ${isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                      {room.type === 'DIRECT' ? 'Direct message' : 'Group chat'}
                    </p>
                  </div>

                  {/* Unread count could be added here if needed */}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}

        {!loading && filteredRooms.length === 0 && (
          <div className={`p-8 text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-sm">
              {searchQuery ? 'No rooms found' : 'No chats yet. Start a new conversation!'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default ChatList 