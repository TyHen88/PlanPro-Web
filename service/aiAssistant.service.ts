import { http } from "@/utils/http";
import { AiAssistantResponse, BatchCommandRequest, CommandRequest } from "@/lib/types/aiAssistant";

const ServiceId = {
    GET_AI_ASSISTANT: '/api/v1/ai-assistant/intents',
    GET_AI_ASSISTANT_CONTEXT: '/api/v1/ai-assistant/context',
    PROCESS_MESSAGE: '/api/v1/ai-assistant/process', // Single unified endpoint for all AI operations
} as const;

// Enhanced error handling
const handleServiceError = (error: any, operation: string): AiAssistantResponse => {
    console.error(`AI Assistant ${operation} error:`, error);
    return {
        success: false,
        message: error?.response?.data?.message || error?.message || `Failed to ${operation.toLowerCase()}.`,
        timestamp: Date.now(),
    };
};

const getSupportedIntents = async (): Promise<AiAssistantResponse> => {
    try {
        const response = await http.get(ServiceId.GET_AI_ASSISTANT);
        return response.data;
    } catch (error: any) {
        return handleServiceError(error, 'fetch supported intents');
    }
};

const getAiAssistantContext = async (data: Partial<AiAssistantResponse> = {}): Promise<AiAssistantResponse> => {
    try {
        const response = await http.get(ServiceId.GET_AI_ASSISTANT_CONTEXT, { params: data });
        return response.data;
    } catch (error: any) {
        return handleServiceError(error, 'fetch assistant context');
    }
};

// All AI operations now use the unified process endpoint
const analyzeIntent = async (data: CommandRequest): Promise<AiAssistantResponse> => {
    try {
        const response = await http.post(ServiceId.PROCESS_MESSAGE, data);
        return response.data;
    } catch (error: any) {
        return handleServiceError(error, 'analyze intent');
    }
};

const executeCommand = async (data: Partial<AiAssistantResponse>): Promise<AiAssistantResponse> => {
    try {
        const response = await http.post(ServiceId.PROCESS_MESSAGE, data);
        return response.data;
    } catch (error: any) {
        return handleServiceError(error, 'execute command');
    }
};

const executeCommandBatch = async (data: BatchCommandRequest): Promise<AiAssistantResponse> => {
    try {
        const response = await http.post(ServiceId.PROCESS_MESSAGE, data);
        return response.data;
    } catch (error: any) {
        return handleServiceError(error, 'execute command batch');
    }
};

const chatAiAssistant = async (data: CommandRequest): Promise<AiAssistantResponse> => {
    try {
        const response = await http.post(ServiceId.PROCESS_MESSAGE, data);
        return response.data;
    } catch (error: any) {
        return handleServiceError(error, 'chat with AI assistant');
    }
};

// Main AI assistant processing - all operations use the unified endpoint
const processMessage = async (data: CommandRequest): Promise<AiAssistantResponse> => {
    try {
        const response = await http.post(ServiceId.PROCESS_MESSAGE, data);
        return response.data;
    } catch (error: any) {
        return handleServiceError(error, 'process message');
    }
};



const aiAssistantService = {
    getSupportedIntents,
    getAiAssistantContext,
    analyzeIntent,
    executeCommand,
    executeCommandBatch,
    chatAiAssistant,
    processMessage, // Main method - all operations use unified endpoint
}

export default aiAssistantService;