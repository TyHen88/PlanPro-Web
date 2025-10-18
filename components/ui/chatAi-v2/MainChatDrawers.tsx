"use client"

import { useState, useRef, useEffect } from "react"
import {
    Dialog,
    DialogBackdrop,
    DialogPanel,
    DialogTitle,
    TransitionChild
} from "@headlessui/react"
import { PaperAirplaneIcon, XMarkIcon } from "@heroicons/react/24/outline"
import { Sparkles } from "lucide-react"

type Props = {
    open: boolean
    setOpen: (open: boolean) => void
}

type QuickAction = {
    icon: React.ReactNode
    label: string
    generateMessage: () => string
}

const quickActions: QuickAction[] = [
    {
        icon: <Sparkles className="w-5 h-5" />,
        label: "New Trip",
        generateMessage: () => "I'd like to plan a new trip!"
    },
    {
        icon: <Sparkles className="w-5 h-5" />,
        label: "New Note",
        generateMessage: () => "Create a new note for me."
    },
    {
        icon: <Sparkles className="w-5 h-5" />,
        label: "Reminder",
        generateMessage: () => "Set a reminder, please."
    },
    {
        icon: <Sparkles className="w-5 h-5" />,
        label: "Calendar",
        generateMessage: () => "Open my calendar."
    }
]

export default function MainChatDrawer({ open, setOpen }: Props) {
    const [input, setInput] = useState<string>("")
    const [messages, setMessages] = useState<{ text: string; from: "ai" | "user" | "system" }[]>([
        { text: "Hello! I'm your AI assistant. How can I help you today?", from: "ai" }
    ])
    const latestMsgRef = useRef<HTMLDivElement | null>(null)

    // When user clicks a quick action: set the input to the generated message
    const handleQuickAction = (label: string) => {
        const action = quickActions.find((a) => a.label === label)
        if (action) {
            setInput(action.generateMessage())
        }
    }

    // Handles sending a message
    const handleSend = () => {
        const trimmed = input.trim()
        if (!trimmed) return
        setMessages((msgs) => [...msgs, { text: trimmed, from: "user" }])
        setInput("")
        // Simulate an AI reply in real use; replace with your real AI call
        setTimeout(() => {
            setMessages(msgs => [
                ...msgs,
                { text: `AI response to: "${trimmed}"`, from: "ai" }
            ])
        }, 600)
    }

    const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            handleSend()
        }
    }

    // Auto-scroll to last message #target div every time messages changes
    useEffect(() => {
        if (latestMsgRef.current) {
            latestMsgRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" })
        }
    }, [messages, open])

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
                                            <XMarkIcon aria-hidden="true" className="size-6" />
                                        </button>
                                    </div>
                                </TransitionChild>
                                {/* Set background to white and use flex-col to ensure input is bottom-aligned */}
                                <div className="relative flex h-full flex-col bg-white py-6 shadow-xl after:absolute after:inset-y-0 after:left-0 after:w-px after:bg-black/10 overflow-hidden">
                                    <div className="px-4 sm:px-6">
                                        <div className="relative flex justify-start mb-4 gap-2">
                                            <Sparkles className="h-6 w-6 text-blue-500 relative z-10" />
                                            <DialogTitle className="text-base font-semibold text-gray-900">PlanPro AI Assistant</DialogTitle>
                                        </div>
                                    </div>
                                    {/* Make message area scrollable and input area sticky at the bottom */}
                                    <div className="relative flex-1 flex flex-col justify-between min-h-0">
                                        <div className="mt-6 flex-1 overflow-y-auto px-4 sm:px-6 space-y-4">
                                            {/* Chat messages here */}
                                            {messages.map((msg, idx) => {
                                                const isLast = idx === messages.length - 1
                                                return (
                                                    <div
                                                        key={idx}
                                                        ref={isLast ? latestMsgRef : undefined}
                                                        id={isLast ? "target" : undefined}
                                                        className={`flex w-full ${msg.from === "user" ? "justify-end" : "justify-start"}`}
                                                    >
                                                        <div
                                                            className={
                                                                (msg.from === "user"
                                                                    ? "bg-blue-500 text-white ml-12 rounded-br-2xl rounded-tl-2xl rounded-bl-md"
                                                                    : "bg-gray-100 text-gray-900 mr-12 rounded-bl-2xl rounded-tr-2xl rounded-br-md"
                                                                ) +
                                                                " max-w-[90%] px-4 py-2 text-sm inline-block shadow-md break-words"
                                                            }
                                                            style={{ wordBreak: 'break-word', whiteSpace: 'pre-wrap', alignSelf: msg.from === "user" ? "flex-end" : "flex-start" }}
                                                        >
                                                            {msg.text}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        <div className="px-4 sm:px-6 pt-4 pb-0 bg-white" style={{ width: '88%' }}>
                                            {/* Suggested Quick Messages */}
                                            <div className="w-full flex flex-wrap items-center gap-2 mb-3">
                                                {quickActions.map((action) => (
                                                    <button
                                                        key={action.label}
                                                        type="button"
                                                        onClick={() => handleQuickAction(action.label)}
                                                        className="italic px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-500 hover:bg-blue-100 border border-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-400/30 transition shadow-sm hover:shadow-md"
                                                        aria-label={action.label}
                                                    >
                                                        {action.label}
                                                    </button>
                                                ))}
                                            </div>
                                            <div className="flex flex-row-reverse space-x-reverse space-x-2">
                                                <textarea
                                                    value={input}
                                                    onChange={e => setInput(e.target.value)}
                                                    onKeyDown={e => {
                                                        if (e.key === "Enter" && !e.shiftKey) {
                                                            e.preventDefault();
                                                            handleSend();
                                                        }
                                                        // otherwise, allow Enter (w/ Shift) for new line
                                                    }}
                                                    placeholder="Type your message..."
                                                    className="flex-1 bg-gray-100 text-gray-900 placeholder-gray-400 rounded-lg px-6 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                                    rows={1}
                                                    style={{ minHeight: '30px', maxHeight: '60px' }}
                                                />
                                                <button
                                                    type="button"
                                                    disabled={!input.trim()}
                                                    onClick={handleSend}
                                                    className="p-2 rounded-full transition-colors bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:hover:scale-100"
                                                >
                                                    <PaperAirplaneIcon className="w-5 h-5 rotate-[-90deg]" />
                                                </button>
                                            </div>
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
