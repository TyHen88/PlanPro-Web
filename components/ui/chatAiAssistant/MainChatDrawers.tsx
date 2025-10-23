"use client"

import { useState, useRef, useEffect } from "react"
import {
    Dialog,
    DialogBackdrop,
    DialogPanel,
    TransitionChild
} from "@headlessui/react"
import { Sparkles } from "lucide-react"
import {
    ChatInput,
    ChatMessage,
    QuickActions,
    ChatHeader,
    ChatContainer,
    AIAssistantProvider,
    useAIAssistant,
    QuickAction
} from "./index"
import ChatMarkdown from "./ChatMarkdown"
import { AIResponseFormatter } from "./AIResponseFormatter"

type Props = {
    open: boolean
    setOpen: (open: boolean) => void
}



function ChatDrawerContent({ open, setOpen }: Props) {
    const [messages, setMessages] = useState<{ text: string; suggestions: string[]; from: "ai" | "user" | "system"; timestamp?: number; isLoading?: boolean }[]>([
        { text: "Hello! I'm your AI assistant. How can I help you today?", suggestions: [], from: "ai", timestamp: Date.now() }
    ])
    const [isLoading, setIsLoading] = useState(false)
    const { processMessage } = useAIAssistant()

    // Handle sending a message with enhanced error handling
    const handleSend = async (message: string) => {
        if (!message.trim()) return

        // Add user message
        const userMessage = {
            text: message,
            suggestions: [],
            from: "user" as const,
            timestamp: Date.now()
        }
        setMessages(prev => [...prev, userMessage])
        setIsLoading(true)

        try {
            // Use the main flow: analyze -> execute/chat
            const response = await processMessage({ message })

            // Add AI response based on the action taken
            let responseText = ""
            if (response.success) {
                if (response.data?.action === 'execute') {
                    // Command was executed
                    responseText = response.data?.result || response.message
                } else {
                    // General chat response - handle multiple response fields
                    responseText = response.data?.aiResponse ||
                        response.data?.response ||
                        response.data?.message ||
                        response.message
                }
            } else {
                responseText = response.message || "Sorry, I couldn't process your request."
            }

            const aiMessage = {
                text: responseText,
                suggestions: response.data?.suggestions || [],
                from: "ai" as const,
                timestamp: Date.now()
            }
            setMessages(prev => [...prev, aiMessage])
        } catch (error) {
            console.error('AI Assistant error:', error)
            // Add error message
            const errorMessage = {
                text: "Sorry, I encountered an error. Please try again.",
                suggestions: [],
                from: "ai" as const,
                timestamp: Date.now()
            }
            setMessages(prev => [...prev, errorMessage])
        } finally {
            setIsLoading(false)
        }
    }

    // Handle quick action clicks
    const handleQuickAction = (action: QuickAction) => {
        handleSend(action.generateMessage?.() || "")
    }

    return (
        <div>
            <Dialog open={open} onClose={setOpen} className="relative z-10">
                <DialogBackdrop
                    transition
                    className="fixed inset-0 bg-gray-500/50 transition-opacity duration-500 ease-in-out data-[closed]:opacity-0"
                />

                <div className="fixed inset-0 overflow-hidden">
                    <div className="absolute inset-0 overflow-hidden">
                        <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full">
                            <DialogPanel
                                transition
                                className="pointer-events-auto relative w-screen max-w-md transform transition duration-500 ease-in-out data-[closed]:translate-x-full sm:duration-700"
                            >
                                <TransitionChild>
                                    <div className="absolute top-0 right-0 flex pt-4 pr-2 duration-500 ease-in-out data-[closed]:opacity-0">
                                        <button
                                            type="button"
                                            onClick={() => setOpen(false)}
                                            className="relative rounded-md text-gray-400 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                                        >
                                            <span className="absolute -inset-2.5" />
                                            <span className="sr-only">Close panel</span>
                                            <svg className="size-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                </TransitionChild>

                                <div className="relative flex h-full flex-col bg-white py-6 shadow-xl after:absolute after:inset-y-0 after:left-0 after:w-px after:bg-black/10 overflow-hidden">
                                    <ChatHeader
                                        title="PlanPro AI Assistant"
                                        icon={<Sparkles className="h-6 w-6 text-blue-500" />}
                                        onClose={() => setOpen(false)}
                                    />

                                    <div className="relative flex-1 flex flex-col justify-between min-h-0">
                                        <ChatContainer className="mt-6">
                                            {messages.map((msg, idx) => (
                                                <div key={idx} className={`flex w-full ${msg.from === "user" ? "justify-end" : "justify-start"}`}>
                                                    <div className="max-w-[90%]">
                                                        <div
                                                            className={
                                                                (msg.from === "user"
                                                                    ? "bg-blue-500 text-white ml-12 rounded-br-2xl rounded-tl-2xl rounded-bl-md"
                                                                    : "bg-gray-100 text-gray-900 mr-12 rounded-bl-2xl rounded-tr-2xl rounded-br-md"
                                                                ) +
                                                                " px-4 py-2 text-sm inline-block shadow-md break-words"
                                                            }
                                                            style={{
                                                                wordBreak: 'break-word',
                                                                whiteSpace: 'pre-wrap',
                                                                alignSelf: msg.from === "user" ? "flex-end" : "flex-start"
                                                            }}
                                                        >
                                                            {msg.from === "ai" ? (
                                                                <AIResponseFormatter content={msg.text || ""} />
                                                            ) : (
                                                                msg.text
                                                            )}
                                                        </div>
                                                        {msg.timestamp && (
                                                            <div className={`text-xs text-gray-500 mt-1 ${msg.from === "user" ? "text-right" : "text-left"}`}>
                                                                {new Date(msg.timestamp).toLocaleTimeString([], {
                                                                    hour: '2-digit',
                                                                    minute: '2-digit'
                                                                })}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                            {isLoading && (
                                                <div className="flex w-full justify-start">
                                                    <div className="max-w-[90%]">
                                                        <div className="bg-gray-100 text-gray-900 mr-12 rounded-bl-2xl rounded-tr-2xl rounded-br-md px-4 py-2 text-sm inline-block shadow-md break-words">
                                                            <div className="flex items-center space-x-1">
                                                                <div className="flex space-x-1">
                                                                    <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                                                    <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                                                    <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                                                </div>
                                                                <span className="ml-2">AI is thinking...</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </ChatContainer>

                                        <div className="px-4 sm:px-6 pt-4 pb-0 bg-white" style={{ width: '88%' }}>

                                            {(() => {
                                                const lastAiMsg = [...messages].reverse().find(msg => msg.from === "ai" && Array.isArray(msg.suggestions) && msg.suggestions.length > 0);
                                                return lastAiMsg ? (
                                                    <QuickActions
                                                        actions={lastAiMsg.suggestions.map(suggestion => ({
                                                            icon: <Sparkles className="w-5 h-5" />,
                                                            label: suggestion,
                                                            generateMessage: () => suggestion
                                                        }))}
                                                        onActionClick={handleQuickAction}
                                                        className="mb-3"
                                                        disabled={isLoading}
                                                    />
                                                ) : null;
                                            })()}
                                            <ChatInput
                                                onSend={handleSend}
                                                disabled={isLoading}
                                                placeholder={isLoading ? "AI is thinking..." : "Type your message..."}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </DialogPanel>
                        </div>
                    </div>
                </div>
            </Dialog>
        </div>
    )
}

export default function MainChatDrawer({ open, setOpen }: Props) {
    return (
        <AIAssistantProvider>
            <ChatDrawerContent open={open} setOpen={setOpen} />
        </AIAssistantProvider>
    )
}