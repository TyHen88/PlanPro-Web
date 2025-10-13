// src/types/chat.ts
export interface ChatMessage {
    id: string;
    role: 'user' | 'model' | 'system'; // 'system' for status messages
    text: string;
    images?: string[]; // Base64 encoded images
}

// For history sent to API
export interface ApiChatMessage {
    role: 'user' | 'model';
    parts: { text: string }[];
}