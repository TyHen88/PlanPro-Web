'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { X, Volume2, VolumeX, Clock } from 'lucide-react'
import { ChatRoom } from '@/lib/types/chatRoom'

interface ChatProfileProps {
  selectedRoom: ChatRoom | null
  onClose: () => void
  isDarkMode: boolean
}

const ChatProfile = ({ selectedRoom, onClose, isDarkMode }: ChatProfileProps) => {
  const [isMuted, setIsMuted] = React.useState(false)
  const [disappearingMessages, setDisappearingMessages] = React.useState(false)

  if (!selectedRoom) {
    return null
  }

  // Helper function to get room display name
  const getRoomDisplayName = (room: ChatRoom) => {
    if (room.type === 'DIRECT' && room.participants) {
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

  // Get other participant for direct chats
  const getOtherParticipant = (room: ChatRoom) => {
    if (room.type === 'DIRECT' && room.participants) {
      return room.participants.find(p => p.user.id !== 1)?.user
    }
    return null
  }

  return (
    <motion.div
      initial={{ x: 300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 300, opacity: 0 }}
      className={`w-80 border-l ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'
        }`}
    >
      {/* Header */}
      <div className={`p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'
        }`}>
        <div className="flex items-center justify-between">
          <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
            Profile
          </h2>
          <button
            onClick={onClose}
            className={`p-2 rounded-full transition-colors ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
              }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Profile Content */}
      <div className="p-4 space-y-6">
        {/* Profile Picture */}
        <div className="text-center">
          <div className="relative inline-block">
            <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-4xl font-bold mb-4 shadow-lg">
              {getRoomAvatar(selectedRoom)}
            </div>
            {/* Online status could be added here if available */}
          </div>
          <h3 className={`text-xl font-semibold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
            {getRoomDisplayName(selectedRoom)}
          </h3>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
            {selectedRoom.type === 'DIRECT' ? 'Direct message' : 'Group chat'}
          </p>
        </div>

        {/* Room Info */}
        <div>
          <h4 className={`text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
            Room Info
          </h4>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
            Created: {new Date(selectedRoom.createdAt).toLocaleDateString()}
          </p>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
            Type: {selectedRoom.type}
          </p>
        </div>

        {/* Participants for group chats */}
        {selectedRoom.type === 'GROUP' && selectedRoom.participants && (
          <div>
            <h4 className={`text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
              Participants ({selectedRoom.participants.length})
            </h4>
            <div className="space-y-2">
              {selectedRoom.participants.map((participant) => (
                <div key={participant.id} className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold">
                    {participant.user.displayName.charAt(0)}
                  </div>
                  <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                    {participant.user.displayName}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Other participant info for direct chats */}
        {selectedRoom.type === 'DIRECT' && getOtherParticipant(selectedRoom) && (
          <div>
            <h4 className={`text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
              Contact Info
            </h4>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
              Username: @{getOtherParticipant(selectedRoom)?.username}
            </p>
          </div>
        )}

        {/* Settings */}
        <div className="space-y-4">
          <h4 className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
            Settings
          </h4>

          {/* Mute Chat */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {isMuted ? (
                <VolumeX className="w-5 h-5 text-gray-500" />
              ) : (
                <Volume2 className="w-5 h-5 text-gray-500" />
              )}
              <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                Mute Chat
              </span>
            </div>
            <button
              onClick={() => setIsMuted(!isMuted)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isMuted
                ? 'bg-blue-500'
                : isDarkMode
                  ? 'bg-gray-600'
                  : 'bg-gray-300'
                }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isMuted ? 'translate-x-6' : 'translate-x-1'
                  }`}
              />
            </button>
          </div>

          {/* Disappearing Messages */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Clock className="w-5 h-5 text-gray-500" />
              <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                Disappearing Messages
              </span>
            </div>
            <button
              onClick={() => setDisappearingMessages(!disappearingMessages)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${disappearingMessages
                ? 'bg-blue-500'
                : isDarkMode
                  ? 'bg-gray-600'
                  : 'bg-gray-300'
                }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${disappearingMessages ? 'translate-x-6' : 'translate-x-1'
                  }`}
              />
            </button>
          </div>
        </div>

        {/* Media Section */}
        <div>
          <h4 className={`text-sm font-medium mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
            Media, Links and Docs
          </h4>
          <div className={`p-4 rounded-lg border-2 border-dashed ${isDarkMode
            ? 'border-gray-600 text-gray-400'
            : 'border-gray-300 text-gray-500'
            }`}>
            <p className="text-sm text-center">
              No media shared yet
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default ChatProfile 