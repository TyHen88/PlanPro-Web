export interface User {
    id: number;
    username: string;
    displayName: string;
    createdAt: string;
}

export interface ChatRoom {
    id: number;
    name: string;
    type: 'DIRECT' | 'GROUP';
    createdBy: User;
    createdAt: string;
    participants?: RoomParticipant[];
}

export interface RoomParticipant {
    id: number;
    user: User;
    joinedAt: string;
    lastReadAt?: string;
}

export interface ChatMessage {
    id: number;
    content: string;
    sender: User;
    room: ChatRoom;
    messageType: 'TEXT' | 'IMAGE' | 'FILE' | 'SYSTEM';
    sentAt: string;
    isTemporary?: boolean; // Optional flag to mark temporary messages
}

export interface ChatMessageDTO {
    id: number;
    content: string;
    senderId: number;
    senderName: string;
    roomId: number;
    messageType: 'TEXT' | 'IMAGE' | 'FILE' | 'SYSTEM';
    sentAt: string;
    type?: 'JOIN' | 'LEAVE' | 'CHAT'; // Message type for WebSocket communication
}

export interface CreateRoomRequest {
    name: string;
    participantIds: number[];
}

export interface SendMessageRequest {
    content: string;
    messageType: 'TEXT' | 'IMAGE' | 'FILE' | 'SYSTEM';
}

export interface UnreadCount {
    roomId: number;
    count: number;
}

export interface UserChat {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
    profile_image_url: string;
    phone_number: string;
}