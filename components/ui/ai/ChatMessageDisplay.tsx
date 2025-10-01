// components/ChatMessageDisplay.tsx
import type { ChatMessage } from "@/lib/types/chat"
import { BotIcon, Sparkles } from "lucide-react"
import type React from "react"
import MarkdownContentChat from "./util/MarkdownContentChat"

interface ChatMessageDisplayProps {
  message: ChatMessage
  currentTheme: {
    color: string
    ring: string
    name: string
    gradient: string
  }
}

const ChatMessageDisplay: React.FC<ChatMessageDisplayProps> = ({ message, currentTheme }) => {
  const isUser = message.role === "user"
  const isSystem = message.role === "system"
  const isModel = message.role === "model"

  return (
    <div className={`w-full flex ${isUser ? "justify-end" : "justify-start"} py-3 px-4 items-start animate-fadeIn`}>
      {!isUser && (
        <div className="mr-3 flex-shrink-0">
          {isModel ? (
            <div className={`bg-gradient-to-br ${currentTheme.gradient} p-2 rounded-full shadow-lg`}>
              <BotIcon width={24} height={24} className="text-white" />
            </div>
          ) : (
            <div className="bg-gradient-to-br from-yellow-400 to-orange-500 p-2 rounded-full shadow-lg">
              <Sparkles width={24} height={24} className="text-white" />
            </div>
          )}
        </div>
      )}
      <div
        className={`max-w-[80%] rounded-2xl whitespace-pre-wrap break-words shadow-md transition-all duration-300 ${isUser
          ? `bg-gradient-to-r ${currentTheme.gradient} text-white rounded-tr-none`
          : isSystem
            ? "bg-gradient-to-r from-gray-200 to-gray-300 text-gray-900 italic rounded-tl-none"
            : "bg-gray-500 text-gray-900 border border-gray-200 rounded-tl-none"
          } p-4`}
      >
        {/* Display images if present */}
        {message.images && message.images.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {message.images.map((image, index) => (
              <img
                key={index}
                src={image}
                alt={`Upload ${index + 1}`}
                className="max-w-32 max-h-32 object-cover rounded-lg border border-white/20"
              />
            ))}
          </div>
        )}
        <MarkdownContentChat content={message.text} />
      </div>
      {isUser && (
        <div className="ml-3 flex-shrink-0">
          <div className="bg-gradient-to-br from-gray-700 to-gray-900 p-2 rounded-full shadow-lg">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z"
                fill="white"
              />
            </svg>
          </div>
        </div>
      )}
    </div>
  )
}

export default ChatMessageDisplay
