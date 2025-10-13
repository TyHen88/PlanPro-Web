'use client'

import React, { useState, useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import ChatList from './ChatList'
import ChatConversation from './ChatConversation'
import ChatProfile from './ChatProfile'
import NewChatModal from './NewChatModal'
import { useChat } from '@/lib/hooks/useChat'
import { User } from '@/lib/types/chatRoom'
import { useSession } from 'next-auth/react'

const ChatContainer = () => {
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [showNewChatModal, setShowNewChatModal] = useState(false)

  // Get current user from session
  const { data: session } = useSession()

  console.log('ChatContainer session:', session)

  const currentUser: User = {
    id: typeof session?.user?.id === 'number' ? session.user.id : parseInt(session?.user?.id as string) || 1,
    username: (session?.user as any)?.username || 'currentuser',
    displayName: (session?.user as any)?.username || 'Current User',
    createdAt: new Date().toISOString()
  }

  console.log('ChatContainer currentUser:', currentUser)

  // Use the chat hook
  const {
    rooms,
    currentRoom,
    messages,
    loading,
    error,
    setCurrentRoom,
    loadRooms,
    loadRoomMessages,
    sendMessage,
    createDirectChat,
    createGroupChat,
    loadUsersChat,
    usersChat,
    isConnected
  } = useChat(currentUser)

  // Debug: Log what we're getting from useChat
  console.log('ChatContainer rooms from useChat:', rooms, 'type:', typeof rooms, 'isArray:', Array.isArray(rooms))

  // Load rooms on component mount
  useEffect(() => {
    loadRooms()
    loadUsersChat()
  }, [loadRooms, loadUsersChat])

  const handleChatSelect = (roomId: number) => {
    const selectedRoom = rooms.find(room => room.id === roomId)
    if (selectedRoom) {
      setCurrentRoom(selectedRoom)
      loadRoomMessages(roomId)
      setShowProfile(true)
    }
  }

  const handleNewChat = () => {
    setShowNewChatModal(true)
  }

  const handleStartChat = async (userId: number) => {
    try {
      const newRoom = await createDirectChat(currentUser.id, userId)
      setCurrentRoom(newRoom)
      setShowProfile(true)
      // Reload rooms to include the new chat
      loadRooms()
    } catch (error) {
      console.error('Failed to create chat:', error)
    }
  }

  const handleSendMessage = (text: string) => {
    if (!currentRoom) return
    sendMessage(text, 'TEXT')
  }

  const handleSendFile = (file: File) => {
    if (!currentRoom) return

    // Determine message type based on file type
    let messageType: 'TEXT' | 'IMAGE' | 'FILE' | 'SYSTEM' = 'FILE'
    if (file.type.startsWith('image/')) {
      messageType = 'IMAGE'
    }

    sendMessage(`File: ${file.name}`, messageType)
  }

  // Show error state if there's an error
  if (error) {
    return (
      <div className={`h-screen flex items-center justify-center ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
        }`}>
        <div className="text-center">
          <div className="text-red-500 text-lg mb-2">Error</div>
          <div className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {error}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`h-screen flex transition-colors duration-300 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
      }`}>
      {/* Connection Status Indicator */}
      {!isConnected && (
        <div className="fixed top-4 right-4 z-50 bg-yellow-500 text-white px-4 py-2 rounded-lg shadow-lg">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-sm">WebSocket disconnected</span>
          </div>
        </div>
      )}

      {/* Left Column - Chat List */}
      <ChatList
        rooms={rooms || []}
        selectedRoomId={currentRoom?.id}
        onChatSelect={handleChatSelect}
        onNewChat={handleNewChat}
        isDarkMode={isDarkMode}
        onThemeToggle={() => setIsDarkMode(!isDarkMode)}
        loading={loading}
      />

      {/* Center Column - Chat Conversation */}
      <ChatConversation
        selectedRoom={currentRoom}
        messages={messages}
        onSendMessage={handleSendMessage}
        onSendFile={handleSendFile}
        isDarkMode={isDarkMode}
        loading={loading}
      />

      {/* Right Column - Chat Profile */}
      <AnimatePresence>
        {showProfile && currentRoom && (
          <ChatProfile
            selectedRoom={currentRoom}
            onClose={() => setShowProfile(false)}
            isDarkMode={isDarkMode}
          />
        )}
      </AnimatePresence>

      {/* New Chat Modal */}
      <NewChatModal
        isOpen={showNewChatModal}
        onClose={() => setShowNewChatModal(false)}
        onStartChat={handleStartChat}
        isDarkMode={isDarkMode}
        users_chat={usersChat}
      />
    </div>
  )
}

// Chat container with integrated chat functionality
export default ChatContainer