export interface CommandRequest {
    message: string;
    metadata?: Record<string, any>;
}

export interface AiAssistantResponse {
    success: boolean;
    message: string;
    data?: any;
    intentAnalysis?: any;
    timestamp: number;
}

export interface BatchCommandRequest {
    messages: string[];
}