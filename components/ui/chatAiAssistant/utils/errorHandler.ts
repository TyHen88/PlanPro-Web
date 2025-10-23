import { AiAssistantResponse } from "@/lib/types/aiAssistant"

export interface ErrorDetails {
    code: string
    message: string
    timestamp: number
    context?: string
}

export class AIAssistantError extends Error {
    public readonly code: string
    public readonly timestamp: number
    public readonly context?: string

    constructor(message: string, code: string = 'UNKNOWN_ERROR', context?: string) {
        super(message)
        this.name = 'AIAssistantError'
        this.code = code
        this.timestamp = Date.now()
        this.context = context
    }
}

export const createErrorResponse = (
    error: any,
    operation: string,
    context?: string
): AiAssistantResponse => {
    console.error(`AI Assistant ${operation} error:`, error)

    const errorCode = error?.code || 'UNKNOWN_ERROR'
    const errorMessage = error?.message || `Failed to ${operation.toLowerCase()}`

    return {
        success: false,
        message: errorMessage,
        data: {
            error: {
                code: errorCode,
                message: errorMessage,
                timestamp: Date.now(),
                context: context || operation
            }
        },
        timestamp: Date.now()
    }
}

export const handleServiceError = (error: any, operation: string): AiAssistantResponse => {
    if (error instanceof AIAssistantError) {
        return createErrorResponse(error, operation, error.context)
    }

    return createErrorResponse(error, operation)
}

export const validateMessage = (message: string): { isValid: boolean; error?: string } => {
    if (!message || typeof message !== 'string') {
        return { isValid: false, error: 'Message is required and must be a string' }
    }

    if (message.trim().length === 0) {
        return { isValid: false, error: 'Message cannot be empty' }
    }

    if (message.length > 10000) {
        return { isValid: false, error: 'Message is too long (max 10000 characters)' }
    }

    return { isValid: true }
}

export const validateCommandRequest = (data: any): { isValid: boolean; error?: string } => {
    if (!data || typeof data !== 'object') {
        return { isValid: false, error: 'Request data is required' }
    }

    if (!data.message) {
        return { isValid: false, error: 'Message is required' }
    }

    const messageValidation = validateMessage(data.message)
    if (!messageValidation.isValid) {
        return { isValid: false, error: messageValidation.error }
    }

    return { isValid: true }
}
