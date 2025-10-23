"use client"

import { createContext, useContext, ReactNode } from "react"
import { useFetchSupportedIntents, useFetchAiAssistantContext } from "@/lib/hooks/ai/useFetchAIAssistant"
import aiAssistantService from "@/service/aiAssistant.service"
import { CommandRequest, AiAssistantResponse } from "@/lib/types/aiAssistant"

interface AIAssistantContextType {
    // Data
    supportedIntents: any
    context: any
    isLoadingIntents: boolean
    isLoadingContext: boolean

    // Actions
    analyzeIntent: (data: CommandRequest) => Promise<AiAssistantResponse>
    executeCommand: (data: Partial<AiAssistantResponse>) => Promise<AiAssistantResponse>
    executeCommandBatch: (data: { messages: string[] }) => Promise<AiAssistantResponse>
    chatAiAssistant: (data: CommandRequest) => Promise<AiAssistantResponse>
    processMessage: (data: CommandRequest) => Promise<AiAssistantResponse> // Main flow method
}

const AIAssistantContext = createContext<AIAssistantContextType | undefined>(undefined)

interface AIAssistantProviderProps {
    children: ReactNode
}

export function AIAssistantProvider({ children }: AIAssistantProviderProps) {
    const { data: supportedIntents, isLoading: isLoadingIntents } = useFetchSupportedIntents()
    const { data: context, isLoading: isLoadingContext } = useFetchAiAssistantContext()

    const analyzeIntent = async (data: CommandRequest): Promise<AiAssistantResponse> => {
        try {
            return await aiAssistantService.analyzeIntent(data)
        } catch (error) {
            console.error('Analyze intent error:', error)
            return {
                success: false,
                message: 'Failed to analyze intent',
                timestamp: Date.now()
            }
        }
    }

    const executeCommand = async (data: Partial<AiAssistantResponse>): Promise<AiAssistantResponse> => {
        try {
            return await aiAssistantService.executeCommand(data)
        } catch (error) {
            console.error('Execute command error:', error)
            return {
                success: false,
                message: 'Failed to execute command',
                timestamp: Date.now()
            }
        }
    }

    const executeCommandBatch = async (data: { messages: string[] }): Promise<AiAssistantResponse> => {
        try {
            return await aiAssistantService.executeCommandBatch(data)
        } catch (error) {
            console.error('Execute command batch error:', error)
            return {
                success: false,
                message: 'Failed to execute command batch',
                timestamp: Date.now()
            }
        }
    }

    const chatAiAssistant = async (data: CommandRequest): Promise<AiAssistantResponse> => {
        try {
            return await aiAssistantService.chatAiAssistant(data)
        } catch (error) {
            console.error('Chat AI assistant error:', error)
            return {
                success: false,
                message: 'Failed to chat with AI assistant',
                timestamp: Date.now()
            }
        }
    }

    const processMessage = async (data: CommandRequest): Promise<AiAssistantResponse> => {
        try {
            return await aiAssistantService.processMessage(data)
        } catch (error) {
            console.error('Process message error:', error)
            return {
                success: false,
                message: 'Failed to process message',
                timestamp: Date.now()
            }
        }
    }

    const value: AIAssistantContextType = {
        supportedIntents,
        context,
        isLoadingIntents,
        isLoadingContext,
        analyzeIntent,
        executeCommand,
        executeCommandBatch,
        chatAiAssistant,
        processMessage, // Main flow method
    }

    return (
        <AIAssistantContext.Provider value={value}>
            {children}
        </AIAssistantContext.Provider>
    )
}

export function useAIAssistant() {
    const context = useContext(AIAssistantContext)
    if (context === undefined) {
        throw new Error('useAIAssistant must be used within an AIAssistantProvider')
    }
    return context
}
