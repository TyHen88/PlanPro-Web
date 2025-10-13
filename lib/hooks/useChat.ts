import { useState, useEffect, useCallback, useRef } from 'react';
import { ChatRoom, ChatMessage, ChatMessageDTO, SendMessageRequest, User, UserChat } from '@/lib/types/chatRoom';
import { webSocketService } from '@/service/websocketService';
import { ChatApiService } from '@/service/chatApi.service';

export const useChat = (currentUser: User) => {
    const [rooms, setRooms] = useState<ChatRoom[]>([]);
    const [currentRoom, setCurrentRoom] = useState<ChatRoom | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [usersChat, setUsersChat] = useState<UserChat[]>([]);
    const [isWsConnected, setIsWsConnected] = useState(false);

    const currentRoomRef = useRef<ChatRoom | null>(null);
    const isWsConnectedRef = useRef(false);
    const messageCallbackRef = useRef<((msg: ChatMessageDTO) => void) | null>(null);

    // Update refs when state changes
    useEffect(() => {
        currentRoomRef.current = currentRoom;
    }, [currentRoom]);

    useEffect(() => {
        isWsConnectedRef.current = isWsConnected;
    }, [isWsConnected]);

    // Load users chat
    const loadUsersChat = useCallback(async () => {
        try {
            const usersChat = await ChatApiService.getUserChat();
            setUsersChat(usersChat);
        } catch (err) {
            console.error('Error loading user chats:', err);
            setError('Failed to load user chats');
        }
    }, []);

    // Load user's rooms
    const loadRooms = useCallback(async () => {
        try {
            setLoading(true);
            const userRooms = await ChatApiService.getUserRooms(currentUser.id);
            console.log('API returned userRooms:', userRooms);

            let roomsData: ChatRoom[] = [];
            if (Array.isArray(userRooms)) {
                roomsData = userRooms;
            } else if (userRooms && typeof userRooms === 'object') {
                roomsData = userRooms.data || userRooms.rooms || userRooms.content || [];
            }

            setRooms(Array.isArray(roomsData) ? roomsData : []);
        } catch (err) {
            console.error('Error loading rooms:', err);
            setError(err instanceof Error ? err.message : 'Failed to load rooms');
            setRooms([]);
        } finally {
            setLoading(false);
        }
    }, [currentUser.id]);

    // Load room messages
    const loadRoomMessages = useCallback(async (roomId: number) => {
        if (!roomId) return;

        try {
            setLoading(true);
            const roomMessages = await ChatApiService.getRoomMessages(roomId, currentUser.id);

            let messagesData: ChatMessage[] = [];
            if (Array.isArray(roomMessages)) {
                messagesData = roomMessages;
            } else if (roomMessages && typeof roomMessages === 'object') {
                messagesData = roomMessages.data || roomMessages.messages || roomMessages.content || [];
            }

            setMessages(Array.isArray(messagesData) ? messagesData : []);
            await ChatApiService.markAsRead(roomId, currentUser.id);
        } catch (err) {
            console.error('Error loading messages:', err);
            setError(err instanceof Error ? err.message : 'Failed to load messages');
            setMessages([]);
        } finally {
            setLoading(false);
        }
    }, [currentUser.id]);

    const sendMessage = useCallback(async (content: string, messageType: 'TEXT' | 'IMAGE' | 'FILE' | 'SYSTEM' = 'TEXT') => {
        if (!currentRoomRef.current || !content.trim()) return;

        const tempId = Date.now();

        try {
            // Create temporary message for immediate UI update
            const tempMessage: ChatMessage = {
                id: tempId,
                content: content.trim(),
                sender: currentUser,
                room: currentRoomRef.current,
                messageType,
                sentAt: new Date().toISOString(),
                isTemporary: true,
            };

            // Add message immediately to UI
            setMessages(prev => [...prev, tempMessage]);

            // ALWAYS use REST API to save the message (source of truth)
            console.log('💾 Sending message via REST API to:', currentRoomRef.current.id);
            const savedMessage = await ChatApiService.sendMessage(
                currentRoomRef.current.id,
                currentUser.id,
                content.trim(),
                messageType
            );

            // Replace temporary message with the saved one
            setMessages(prev => prev.map(msg =>
                msg.id === tempId ? { ...savedMessage, isTemporary: false } : msg
            ));
            console.log('✅ Message sent successfully via REST API, ID:', savedMessage.id);

            // ALSO send via WebSocket for instant delivery to other users (if connected)
            if (isWsConnectedRef.current) {
                console.log('📡 Broadcasting via WebSocket for real-time delivery');
                const messageRequest: SendMessageRequest = {
                    content: content.trim(),
                    messageType
                };
                webSocketService.sendMessage(currentRoomRef.current.id, messageRequest);
            }
        } catch (err) {
            console.error('❌ Error sending message:', err);
            // Provide specific error messages
            let errorMessage = 'Failed to send message';
            if (err instanceof Error) {
                if (err.message.includes('404')) {
                    errorMessage = 'Chat service unavailable. Please try again later.';
                } else if (err.message.includes('Network Error') || err.message.includes('Failed to fetch')) {
                    errorMessage = 'Network error. Please check your connection.';
                } else {
                    errorMessage = err.message;
                }
            }

            setError(errorMessage);
            // Remove temporary message on error
            setMessages(prev => prev.filter(msg => msg.id !== tempId));
        }
    }, [currentUser]);

    // Handle incoming real-time messages - STABLE REFERENCE
    const handleNewMessage = useCallback((messageDTO: ChatMessageDTO) => {
        console.log('📨 Received message via WebSocket:', {
            id: messageDTO.id,
            from: messageDTO.senderName,
            content: messageDTO.content.substring(0, 50),
            isFromMe: messageDTO.senderId === currentUser.id
        });

        const newMessage: ChatMessage = {
            id: messageDTO.id,
            content: messageDTO.content,
            sender: {
                id: messageDTO.senderId,
                username: messageDTO.senderName,
                displayName: messageDTO.senderName,
                createdAt: new Date().toISOString(),
            },
            room: currentRoomRef.current || {
                id: messageDTO.roomId,
                name: 'Unknown Room',
                type: 'DIRECT',
                createdBy: currentUser,
                createdAt: new Date().toISOString()
            },
            messageType: messageDTO.messageType,
            sentAt: messageDTO.sentAt,
            isTemporary: false,
        };

        setMessages(prev => {
            // First check if this message already exists (by ID)
            const existingMessage = prev.find(msg => msg.id === newMessage.id);
            if (existingMessage && !existingMessage.isTemporary) {
                console.log('⚠️ Message already exists, skipping:', newMessage.id);
                return prev;
            }

            // If it's our own message and we already have a non-temporary version, skip
            if (messageDTO.senderId === currentUser.id) {
                const hasNonTemporary = prev.some(msg =>
                    !msg.isTemporary &&
                    msg.content === newMessage.content &&
                    msg.sender.id === currentUser.id &&
                    Math.abs(new Date(msg.sentAt).getTime() - new Date(newMessage.sentAt).getTime()) < 5000
                );
                if (hasNonTemporary) {
                    console.log('⚠️ Own message already saved via API, skipping WebSocket duplicate');
                    return prev;
                }
            }

            // Replace temporary messages with real ones
            const filteredPrev = prev.filter(msg =>
                !(msg.isTemporary && msg.content === newMessage.content && msg.sender.id === messageDTO.senderId)
            );

            console.log('✅ Adding message to state:', newMessage.id);
            return [...filteredPrev, newMessage];
        });

        // Mark as read if it's for the current room and NOT from current user
        if (currentRoomRef.current &&
            currentRoomRef.current.id === messageDTO.roomId &&
            messageDTO.senderId !== currentUser.id) {
            ChatApiService.markAsRead(currentRoomRef.current.id, currentUser.id).catch(err => {
                console.error('Failed to mark as read:', err);
            });
        }
    }, [currentUser]);

    // Store the callback in ref so it doesn't change
    useEffect(() => {
        messageCallbackRef.current = handleNewMessage;
    }, [handleNewMessage]);

    // WebSocket connection management
    useEffect(() => {
        let isMounted = true;
        let reconnectTimeout: NodeJS.Timeout;

        const handleConnection = () => {
            if (isMounted) {
                console.log('✅ WebSocket connected successfully');
                setIsWsConnected(true);
                setError(null);
            }
        };

        const handleDisconnection = () => {
            if (isMounted) {
                console.log('🔌 WebSocket disconnected');
                setIsWsConnected(false);
            }
        };

        const handleError = (error: any) => {
            if (isMounted) {
                console.error('❌ WebSocket connection error:', error);
                setIsWsConnected(false);

                // Auto-reconnect after 3 seconds
                reconnectTimeout = setTimeout(() => {
                    if (isMounted && !isWsConnectedRef.current) {
                        console.log('🔄 Attempting to reconnect WebSocket...');
                        webSocketService.connect(currentUser.id);
                    }
                }, 3000);
            }
        };

        // Initialize WebSocket connection
        console.log('🔌 Initializing WebSocket connection for user:', currentUser.id);
        webSocketService.connect(currentUser.id);
        webSocketService.onConnection(handleConnection);
        webSocketService.onDisconnection(handleDisconnection);
        webSocketService.onError(handleError);

        return () => {
            isMounted = false;
            clearTimeout(reconnectTimeout);
            webSocketService.offConnection(handleConnection);
            webSocketService.offDisconnection(handleDisconnection);
            webSocketService.offError(handleError);
        };
    }, [currentUser.id]);

    // Subscribe to current room messages - CRITICAL FIX
    useEffect(() => {
        if (!currentRoom) {
            console.log('⚠️ No current room, skipping subscription');
            return;
        }

        if (!isWsConnected) {
            console.log('⚠️ WebSocket not connected, will subscribe when connected');
            return;
        }

        // Create a stable wrapper function
        const messageHandler = (msg: ChatMessageDTO) => {
            console.log('🔔 Message handler called for room', currentRoom.id);
            if (messageCallbackRef.current) {
                messageCallbackRef.current(msg);
            }
        };

        console.log('📡 ✅ Subscribing to room:', currentRoom.id);
        webSocketService.subscribeToRoom(currentRoom.id, messageHandler);

        return () => {
            console.log('📡 ❌ Unsubscribing from room:', currentRoom.id);
            webSocketService.unsubscribeFromRoom(currentRoom.id, messageHandler);
        };
    }, [currentRoom?.id, isWsConnected]); // Only depend on room ID and connection status

    // Load initial data
    useEffect(() => {
        loadRooms();
        loadUsersChat();
    }, [loadRooms, loadUsersChat]);

    // Auto-reload messages when current room changes
    useEffect(() => {
        if (currentRoom) {
            loadRoomMessages(currentRoom.id);
        } else {
            setMessages([]);
        }
    }, [currentRoom, loadRoomMessages]);

    // Debug connection status
    useEffect(() => {
        console.log('🔗 WebSocket connection status:', isWsConnected ? 'Connected ✅' : 'Disconnected ❌');
        if (isWsConnected && currentRoom) {
            console.log('📍 Current room:', currentRoom.id, '- Should be receiving messages');
        }
    }, [isWsConnected, currentRoom]);

    return {
        rooms: Array.isArray(rooms) ? rooms : [],
        currentRoom,
        messages: Array.isArray(messages) ? messages : [],
        loading,
        error,
        setCurrentRoom,
        loadRooms,
        loadRoomMessages,
        sendMessage,
        createDirectChat: ChatApiService.createDirectChat,
        createGroupChat: ChatApiService.createGroupChat,
        loadUsersChat,
        usersChat,
        isConnected: isWsConnected,
        reconnect: () => {
            console.log('🔄 Manual reconnect triggered');
            webSocketService.disconnect();
            setTimeout(() => webSocketService.connect(currentUser.id), 1000);
        }
    };
};