import { useState, useEffect, useRef } from "react"
import type { ChatMessage, ApiChatMessage } from "@/lib/types/chat"
import { v4 as uuidv4 } from "uuid"
import ChatMessageDisplay from "./ChatMessageDisplay"
import ChatInput from "./ChatInput"
import {
  Plus,
  Trash,
  Sparkles,
  MessageSquare,
  Clock,
  Star,
  Settings,
  User,
} from "lucide-react"
import { useFetchProfile } from "@/lib/hooks/useFetchProfile"

// Add a color themes array
const colorThemes = [
  { color: "bg-blue-400", ring: "ring-blue-500", name: "Blue", gradient: "from-blue-400 to-blue-300" },
  { color: "bg-green-400", ring: "ring-green-500", name: "Green", gradient: "from-green-400 to-green-300" },
  { color: "bg-yellow-400", ring: "ring-yellow-500", name: "Yellow", gradient: "from-yellow-400 to-yellow-300" },
  { color: "bg-orange-400", ring: "ring-orange-500", name: "Orange", gradient: "from-orange-400 to-orange-300" },
  { color: "bg-teal-400", ring: "ring-teal-500", name: "Teal", gradient: "from-teal-400 to-teal-300" },
  { color: "bg-purple-400", ring: "ring-purple-500", name: "Purple", gradient: "from-purple-400 to-purple-300" },
  { color: "bg-pink-400", ring: "ring-pink-500", name: "Pink", gradient: "from-pink-400 to-pink-300" },
]

function GeminiChat() {

  const { data: userInfo } = useFetchProfile()

  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [sidebarState, setSidebarState] = useState<"expanded" | "collapsed" | "mini">("expanded") // Updated to include "mini" state
  const [chatHistory, setChatHistory] = useState<
    { id: string; title: string; messages: ChatMessage[]; color: string }[]
  >([])
  const [currentTheme, setCurrentTheme] = useState(colorThemes[0])
  const [activeCategory, setActiveCategory] = useState<string>("recent")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const newSessionId = uuidv4()
    setSessionId(newSessionId)
    setMessages([
      {
        id: uuidv4(),
        role: "system",
        text: "✨ Chat session started. How can I assist you today? ✨",
      },
    ])
  }, [])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(scrollToBottom, [messages])

  const handleSendMessage = async (userInput: string, images?: string[]) => {
    if (!userInput.trim()) return

    const newUserMessage: ChatMessage = {
      id: uuidv4(),
      role: "user",
      text: userInput,
      images: images, // Store images in the message
    }
    setMessages((prevMessages) => [...prevMessages, newUserMessage])
    setIsLoading(true)

    const apiHistory: ApiChatMessage[] = messages
      .filter((msg) => msg.role === "user" || msg.role === "model")
      .map((msg) => ({
        role: msg.role as "user" | "model",
        parts: [{ text: msg.text }],
      }))

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userInput,
          history: apiHistory,
          sessionId: sessionId,
          images: images,
        }),
      })

      if (!response.ok) {
        // Check if response is HTML (404 page) instead of JSON
        const contentType = response.headers.get('content-type')
        if (contentType && contentType.includes('text/html')) {
          throw new Error(`API endpoint not found (${response.status}). Please check if the server is running.`)
        }

        let errorData
        try {
          errorData = await response.json()
        } catch (parseError) {
          throw new Error(`API request failed with status ${response.status}`)
        }
        throw new Error(errorData.error || "API request failed")
      }

      const data = await response.json()
      const aiReply: ChatMessage = {
        id: uuidv4(),
        role: "model",
        text: data.reply,
      }
      setMessages((prevMessages) => [...prevMessages, aiReply])

      // Save to chat history after successful response
      if (messages.length === 1) {
        // First message in conversation
        // Randomly select a color theme for this chat
        const randomTheme = colorThemes[Math.floor(Math.random() * colorThemes.length)]

        const newChat = {
          id: sessionId!,
          title: userInput.slice(0, 30) + "...",
          messages: [...messages, newUserMessage, aiReply],
          color: randomTheme.gradient,
        }
        setChatHistory((prev) => [...prev, newChat])
      }
    } catch (error: unknown) {
      console.error("Failed to send message:", error)
      let errorMessage = "Could not connect to the AI."

      if (error instanceof Error) {
        errorMessage = error.message
      } else if (typeof error === 'string') {
        errorMessage = error
      }

      const errorMessageObj: ChatMessage = {
        id: uuidv4(),
        role: "system",
        text: `Error: ${errorMessage}`,
      }
      setMessages((prevMessages) => [...prevMessages, errorMessageObj])
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddNewMessage = () => {
    // Save current chat to history if it has more than just the initial system message
    if (messages.length > 1) {
      // Randomly select a color theme for this chat
      const randomTheme = colorThemes[Math.floor(Math.random() * colorThemes.length)]

      const currentChat = {
        id: sessionId!,
        title: messages[1]?.text?.slice(0, 30) + "..." || "New Chat", // Added safety for title
        messages: [...messages],
        color: randomTheme.gradient,
      }

      // Check if the current chat is already in the history
      const isAlreadyInHistory = chatHistory.some((chat) => chat.id === sessionId)
      if (!isAlreadyInHistory) {
        setChatHistory((prev) => [...prev, currentChat])
      }
    }

    // Start new chat session and clear messages
    const newSessionId = uuidv4()
    setSessionId(newSessionId)
    setMessages([
      {
        id: uuidv4(),
        role: "system",
        text: "✨ Chat session started. How can I assist you today? ✨",
      },
    ])

    // Set a new random theme
    setCurrentTheme(colorThemes[Math.floor(Math.random() * colorThemes.length)])
  }

  const handleLoadHistory = (chatId: string) => {
    const selectedChat = chatHistory.find((chat) => chat.id === chatId)
    if (selectedChat) {
      setSessionId(selectedChat.id)
      setMessages(selectedChat.messages)
    }
  }

  //handleDeleteHistory
  const handleDeleteHistory = (chatId: string) => {
    setChatHistory((prev) => prev.filter((chat) => chat.id !== chatId))
  }

  // Update the toggleSidebar function to handle three states
  const toggleSidebar = () => {
    setSidebarState((prev) => {
      // if (prev === "expanded") return "mini"
      if (prev === "mini") return "collapsed"
      return "expanded"
    })
  }

  // Replace the return JSX with this updated version
  return (
    <div className="flex w-full overflow-auto h-[100%]">
      {/* Sidebar */}
      <div
        className={` transition-all duration-300 ease-in-out ${sidebarState === "expanded" ? "w-72" : sidebarState === "mini" ? "w-20" : "w-20"
          } overflow-hidden shadow-xl relative flex-shrink-0`}
      >
        <div
          className={`h-full flex flex-col bg-gradient-to-br from-teal-200 to-blue-200 text-white rounded-l-xl ${sidebarState === "mini" ? "items-center" : ""
            }`}
        >
          {/* Sidebar Header */}
          <div className={`p-6 ${sidebarState === "mini" ? "p-4" : ""}`}>
            <div className={`flex items-center ${sidebarState === "mini" ? "justify-center" : "justify-between"} mb-8`}>
              <div className="flex items-center">

                <div
                  className="bg-gradient-to-r from-purple-500 to-indigo-600 p-2 rounded-lg shadow-lg cursor-pointer"
                  onClick={toggleSidebar}
                >
                  <Sparkles className="text-white" size={sidebarState === "mini" ? 24 : 20} />
                </div>
                {sidebarState === "expanded" && <h1 className="text-xl text-blue-500 font-bold ml-3">PlanPro AI</h1>}
              </div>
              {/* {sidebarState === "expanded" && (
                <button onClick={toggleSidebar} className="text-gray-400 hover:text-white transition-colors">
                  <ChevronLeft size={20} />
                </button>
              )} */}
            </div>

            <button
              onClick={handleAddNewMessage}
              className={`flex items-center justify-center gap-2 p-3 ${currentTheme.color} text-white rounded-lg hover:opacity-90 transition-all duration-200 shadow-lg transform hover:scale-105 ${sidebarState === "mini" ? "w-12 h-12 p-0" : "w-full"
                }`}
            >
              <Plus size={18} />
              {sidebarState === "expanded" && "New Chat"}
            </button>
          </div>




          {/* Mini Navigation */}
          {sidebarState === "mini" && (
            <div className="flex flex-col items-center space-y-6 mt-6">
              <button
                className={`p-3 rounded-lg transition-colors ${activeCategory === "recent"
                  ? "bg-gray-700 text-gray-200"
                  : "text-gray-400 hover:text-white hover:bg-gray-700/50"
                  }`}
                onClick={() => setActiveCategory("recent")}
              >
                <Clock size={20} />
              </button>
              <button
                className={`p-3 rounded-lg transition-colors ${activeCategory === "starred"
                  ? "bg-gray-700 text-white"
                  : "text-gray-400 hover:text-white hover:bg-gray-700/50"
                  }`}
                onClick={() => setActiveCategory("starred")}
              >
                <Star size={20} />
              </button>
              <div className="border-t border-gray-700 w-10 my-2"></div>
              <button className="p-3 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors">
                <Settings size={20} />
              </button>
            </div>
          )}

          {/* Chat List */}
          <div className={`flex-1 overflow-y-auto ${sidebarState === "mini" ? "px-2" : "px-6"} pb-6`}>
            {sidebarState === "expanded" && activeCategory === "recent" && (
              <h2 className="text-gray-400 text-sm font-medium uppercase tracking-wider mb-3">Recent Chats</h2>
            )}

            <div className={`space-y-2 ${sidebarState === "mini" ? "flex flex-col items-center space-y-4 mt-4" : ""}`}>
              {chatHistory.map((chat) => (
                <div key={chat.id} className={`group ${sidebarState === "mini" ? "" : "flex items-center"}`}>
                  <button
                    onClick={() => handleLoadHistory(chat.id)}
                    className={`
                      transition-all duration-200
                      ${sidebarState === "mini"
                        ? "w-12 h-12 flex items-center justify-center rounded-lg"
                        : "flex-grow text-left p-3 rounded-lg truncate  flex items-center"
                      }
                    `}
                  >
                    <div
                      className={`
                      ${sidebarState === "mini" ? "w-3 h-3" : "w-2 h-2 mr-3"} 
                      rounded-full bg-gradient-to-r ${chat.color}
                    `}
                    ></div>
                    {sidebarState === "expanded" && <span className="truncate text-gray-600 hover:text-blue-600">{chat.title}</span>}
                  </button>
                  {sidebarState === "expanded" && (
                    <button
                      onClick={() => handleDeleteHistory(chat.id)}
                      className="p-2 text-gray-500 hover:text-red-400 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* User Profile Section */}
          {sidebarState === "expanded" && (
            <div className="mt-auto p-4 border-t border-gray-700/50">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 flex items-center justify-center">
                  <User size={20} className="text-white" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-700">{userInfo?.username}</p>
                  <p className="text-xs text-gray-400 text-gray-300">{userInfo?.email}</p>
                </div>
                {/* <button className="ml-auto p-2 text-gray-400 hover:text-white rounded-lg">
                  <Settings size={18} />
                </button> */}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Toggle Sidebar Button - only show when fully collapsed */}
      {/* {sidebarState === "collapsed" && (
        <div className="relative">
          <button
            onClick={toggleSidebar}
            className={`absolute left-0 top-4 z-10 p-3 ${currentTheme.color} rounded-r-lg hover:opacity-90 transition-colors shadow-lg`}
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )} */}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-screen bg-gradient-to-br from-gray-50 to-gray-100 relative">
        {/* Chat Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center shadow-sm z-10" style={{ zIndex: 1 }}>
          {/* {sidebarState !== "collapsed" && (
            <button onClick={toggleSidebar} className="mr-4 text-gray-500 hover:text-gray-700 transition-colors">
              {sidebarState === "expanded" ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
            </button>
          )} */}
          <div className="flex items-center" >
            <MessageSquare className={`text-${currentTheme.name.toLowerCase()}-500 mr-2`} size={20} />
            <h2 className="font-medium">Current Chat</h2>
          </div>
        </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
          {messages.map((msg) => (
            <ChatMessageDisplay key={msg.id} message={msg} currentTheme={currentTheme} />
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input */}
        <div className="p-3 border-t border-gray-200 bg-white">
          <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} currentTheme={currentTheme} />
        </div>
      </div>
    </div>
  )
}

export default GeminiChat
