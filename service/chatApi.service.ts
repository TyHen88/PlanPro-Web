// service/chatApi.service.ts
import { ChatRoom, ChatMessage, CreateRoomRequest, User, UnreadCount } from '@/lib/types/chatRoom';
import { http } from '@/utils/http';

const serviceId = {
    CHAT_ROOMS: '/api/chat/rooms',
    CHAT_MESSAGES: '/api/chat/messages',
    USERS: '/api/users',
    USER_CHAT: '/api/wb/v1/users/all'
}

// Room Management
const createDirectChat = async (user1Id: number, user2Id: number) => {
    try {
        const response = await http.post(`${serviceId.CHAT_ROOMS}/direct?user1Id=${user1Id}&user2Id=${user2Id}`);
        return response.data;
    } catch (error: any) {
        console.error('❌ Failed to create direct chat:', error);
        throw error;
    }
}

const createGroupChat = async (creatorId: number, request: CreateRoomRequest) => {
    try {
        const response = await http.post(`${serviceId.CHAT_ROOMS}/group?creatorId=${creatorId}`, request);
        return response.data;
    } catch (error: any) {
        console.error('❌ Failed to create group chat:', error);
        throw error;
    }
}

const getUserRooms = async (userId: number) => {
    try {
        console.log('📥 Fetching user rooms for userId:', userId);
        const response = await http.get(`${serviceId.CHAT_ROOMS}/user/${userId}`);
        console.log('✅ User rooms fetched:', response.data);
        return response.data;
    } catch (error: any) {
        console.error('❌ Failed to get user rooms:', error);
        throw error;
    }
}

const addParticipant = async (roomId: number, userId: number) => {
    try {
        const response = await http.post(`${serviceId.CHAT_ROOMS}/${roomId}/participants?userId=${userId}`);
        return response.data;
    } catch (error: any) {
        console.error('❌ Failed to add participant:', error);
        throw error;
    }
}

// Message Management - CORRECTED ENDPOINTS
const getRoomMessages = async (roomId: number, userId: number) => {
    try {
        console.log('📥 Fetching messages for room:', roomId, 'userId:', userId);
        const response = await http.get(`${serviceId.CHAT_MESSAGES}/rooms/${roomId}/messages?userId=${userId}`);
        console.log('✅ Messages fetched:', response.data);
        return response.data;
    } catch (error: any) {
        console.error('❌ Failed to get room messages:', error);
        console.error('Error details:', {
            status: error.response?.status,
            url: error.config?.url,
            message: error.message
        });
        throw error;
    }
}

const sendMessage = async (roomId: number, userId: number, content: string, messageType: 'TEXT' | 'IMAGE' | 'FILE' | 'SYSTEM' = 'TEXT') => {
    try {
        console.log('📤 Sending message via REST API to room:', roomId);
        const response = await http.post(`${serviceId.CHAT_MESSAGES}/rooms/${roomId}/send?senderId=${userId}`, {
            content,
            messageType
        });
        console.log('✅ Message sent successfully via REST API:', response.data);
        return response.data;
    } catch (error: any) {
        console.error('❌ Failed to send message via REST API:', error);
        console.error('Error details:', {
            status: error.response?.status,
            statusText: error.response?.statusText,
            url: error.config?.url,
            message: error.message
        });
        throw error;
    }
}

const markAsRead = async (roomId: number, userId: number) => {
    try {
        console.log('📖 Marking messages as read for room:', roomId, 'userId:', userId);
        const response = await http.post(`${serviceId.CHAT_MESSAGES}/rooms/${roomId}/read?userId=${userId}`);
        console.log('✅ Messages marked as read');
        return response.data;
    } catch (error: any) {
        console.error('❌ Failed to mark messages as read:', error);
        console.error('Error details:', {
            status: error.response?.status,
            url: error.config?.url,
            message: error.message
        });
        // Don't throw error for mark as read - it's not critical
        return null;
    }
}

const getUnreadCount = async (roomId: number, userId: number) => {
    try {
        const response = await http.get(`${serviceId.CHAT_MESSAGES}/rooms/${roomId}/unread?userId=${userId}`);
        return response.data;
    } catch (error: any) {
        console.error('❌ Failed to get unread count:', error);
        return 0; // Return 0 instead of throwing
    }
}

const getAllUnreadCounts = async (userId: number) => {
    try {
        const rooms = await getUserRooms(userId);
        const roomsArray = Array.isArray(rooms) ? rooms : [];
        const counts = await Promise.all(
            roomsArray.map(async (room: ChatRoom) => ({
                roomId: room.id,
                count: await getUnreadCount(room.id, userId),
            }))
        );
        return counts;
    } catch (error: any) {
        console.error('❌ Failed to get all unread counts:', error);
        return [];
    }
}

// User Management
const getCurrentUser = async () => {
    try {
        const userId = localStorage.getItem('currentUserId');
        if (!userId) {
            throw new Error('No user ID found in localStorage');
        }
        const response = await http.get(`${serviceId.USERS}/${userId}`);
        return response.data;
    } catch (error: any) {
        console.error('❌ Failed to get current user:', error);
        throw error;
    }
}

const searchUsers = async (query: string) => {
    try {
        const response = await http.get(`${serviceId.USERS}/search?q=${encodeURIComponent(query)}`);
        return response.data;
    } catch (error: any) {
        console.error('❌ Failed to search users:', error);
        return [];
    }
}

const getUserChat = async () => {
    try {
        console.log('📥 Fetching user chat list');
        const response = await http.get(`${serviceId.USER_CHAT}`);
        console.log('✅ User chat list fetched:', response.data);
        return response.data;
    } catch (error: any) {
        console.error('❌ Failed to get user chat:', error);
        return [];
    }
}

export const ChatApiService = {
    createDirectChat,
    createGroupChat,
    getUserRooms,
    addParticipant,
    getRoomMessages,
    sendMessage,
    markAsRead,
    getUnreadCount,
    getAllUnreadCounts,
    getCurrentUser,
    searchUsers,
    getUserChat
}