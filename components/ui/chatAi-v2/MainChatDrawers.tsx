"use client"

import { useState } from "react"
import {
    Dialog,
    DialogBackdrop,
    DialogPanel,
    DialogTitle,
    TransitionChild
} from "@headlessui/react"
import { PaperAirplaneIcon, XMarkIcon } from "@heroicons/react/24/outline"

type Props = {
    open: boolean
    setOpen: (open: boolean) => void
}

export default function MainChatDrawer({ open, setOpen }: Props) {

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
                                        <DialogTitle className="text-base font-semibold text-gray-900">AI Assistant</DialogTitle>
                                    </div>
                                    {/* Make message area scrollable and input area sticky at the bottom */}
                                    <div className="relative flex-1 flex flex-col justify-between min-h-0">
                                        <div className="mt-6 flex-1 overflow-y-auto px-4 sm:px-6 space-y-4">
                                            <div className="bg-gray-100 rounded-lg p-3">
                                                <p className="text-sm text-gray-800">Hello! I'm your AI assistant. How can I help you today?</p>
                                            </div>
                                            {/* Place for chat messages here in the future */}
                                        </div>
                                        <div className="px-4 sm:px-6 pt-4 pb-0 bg-white">
                                            <div className="flex flex-row-reverse space-x-reverse space-x-2">
                                                <input
                                                    type="text"
                                                    placeholder="Type your message..."
                                                    className="flex-1 bg-gray-100 text-gray-900 placeholder-gray-400 rounded-lg px-6 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                />
                                                <button className="p-2 rounded-full transition-colors bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:hover:scale-100">
                                                    <PaperAirplaneIcon className="w-5 h-5" />
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
