'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, UserPlus } from 'lucide-react'
import { ChatApiService } from '@/service/chatApi.service'
import { User, UserChat } from '@/lib/types/chatRoom'

interface NewChatModalProps {
  isOpen: boolean
  onClose: () => void
  onStartChat: (userId: number) => void
  isDarkMode: boolean
  users_chat: UserChat[]
}

const NewChatModal = ({ isOpen, onClose, onStartChat, isDarkMode, users_chat }: NewChatModalProps) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [users, setUsers] = useState<UserChat[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Remove debug log and just use users_chat directly as data
  const data = useMemo(() => {
    // If users_chat is an API response object, extract the array from .data
    if (users_chat && Array.isArray((users_chat as any).data)) {
      return (users_chat as any).data;
    }
    // Otherwise, assume it's already an array
    return Array.isArray(users_chat) ? users_chat : [];
  }, [users_chat]);

  // Search users when query changes
  useEffect(() => {
    const searchUsers = async () => {
      setLoading(true)
      setError(null)
      try {
        if (searchQuery.trim().length < 2) {
          // Show only users_chat (existing chat users) if no search or too short
          setUsers(data)
        } else {
          // Search for users and merge with users_chat, removing duplicates
          const searchResults: UserChat[] = await ChatApiService.searchUsers(searchQuery)
          // Remove users already in users_chat from searchResults
          const usersChatIds = new Set(data.map((u: UserChat) => u.id))
          const filteredResults = searchResults.filter(u => !usersChatIds.has(u.id))
          setUsers([...data, ...filteredResults])
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to search users')
        setUsers(data)
      } finally {
        setLoading(false)
      }
    }

    const timeoutId = setTimeout(searchUsers, 300) // Debounce search
    return () => clearTimeout(timeoutId)
  }, [searchQuery, data])

  const handleUserSelect = (userId: number) => {
    onStartChat(userId)
    onClose()
    setSearchQuery('')
    setUsers([])
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className={`relative w-full max-w-md rounded-2xl shadow-xl ${isDarkMode ? 'bg-gray-900' : 'bg-white'
              }`}
          >
            {/* Header */}
            <div className={`p-6 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'
              }`}>
              <div className="flex items-center justify-between">
                <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                  New Chat
                </h2>
                <button
                  onClick={onClose}
                  className={`p-2 rounded-full transition-colors ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                    }`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Search */}
              <div className="relative mt-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 rounded-lg border ${isDarkMode
                    ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                />
              </div>
            </div>

            {/* Users List */}
            <div className="max-h-96 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : error ? (
                <div className={`p-8 text-center ${isDarkMode ? 'text-red-400' : 'text-red-500'
                  }`}>
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
                    <X className="w-8 h-8 text-red-500" />
                  </div>
                  <p className="text-sm">{error}</p>
                </div>
              ) : users.length > 0 ? (
                users.map((user) => (
                  <motion.div
                    key={user.id}
                    whileHover={{ backgroundColor: isDarkMode ? '#374151' : '#f3f4f6' }}
                    onClick={() => handleUserSelect(user.id)}
                    className={`p-4 cursor-pointer transition-colors border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-100'
                      }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                          {user.first_name.charAt(0).toUpperCase()}
                        </div>
                        {/* Online status could be added here if available */}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className={`font-medium truncate ${isDarkMode ? 'text-white' : 'text-gray-900'
                          }`}>
                          {user.first_name} {user.last_name}
                        </h3>
                        <p className={`text-sm truncate ${isDarkMode ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                          @{user.username}
                        </p>
                      </div>

                      <UserPlus className="w-5 h-5 text-gray-400" />
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className={`p-8 text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                    <Search className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-sm">
                    {searchQuery ? 'No users found' : 'Search for users to start a chat'}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default NewChatModal 