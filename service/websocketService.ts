// service/websocketService.ts
import { Client, StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { ChatMessageDTO, SendMessageRequest } from '@/lib/types/chatRoom';

type MessageCallback = (message: ChatMessageDTO) => void;
type ConnectionCallback = () => void;
type DisconnectionCallback = () => void;
type ErrorCallback = (error: any) => void;

class WebSocketService {
    private stompClient: Client | null = null;
    private isConnected = false;
    private messageCallbacks: Map<number, MessageCallback[]> = new Map();
    private connectionCallbacks: ConnectionCallback[] = [];
    private disconnectionCallbacks: DisconnectionCallback[] = [];
    private errorCallbacks: ErrorCallback[] = [];
    private activeSubscriptions: Map<number, StompSubscription> = new Map();
    private userQueueSubscription: StompSubscription | null = null;
    private currentUserId: number | null = null;

    connect(userId: number) {
        if (this.stompClient && this.isConnected) {
            console.log('WebSocket already connected');
            return;
        }

        this.currentUserId = userId;

        // Clean up existing connection
        if (this.stompClient) {
            try {
                this.stompClient.deactivate();
            } catch (error) {
                console.error('Error deactivating existing client:', error);
            }
        }

        // Use the correct WebSocket URL - matching the JavaScript example
        const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:8080/ws';
        console.log('🔌 Connecting to WebSocket:', wsUrl);

        // Create SockJS socket - exactly like: var socket = new SockJS('/ws');
        const socket = new SockJS(wsUrl);

        // Create STOMP client - exactly like: stompClient = Stomp.over(socket);
        this.stompClient = new Client({
            webSocketFactory: () => socket,
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
            debug: (str) => {
                if (process.env.NODE_ENV === 'development') {
                    console.log('STOMP:', str);
                }
            },
        });

        // Set up connection handler - matching: stompClient.connect({}, onConnected, onError);
        this.stompClient.onConnect = (frame) => {
            console.log('✅ WebSocket Connected!', frame);
            this.isConnected = true;

            // Notify connection callbacks
            this.connectionCallbacks.forEach(callback => {
                try {
                    callback();
                } catch (error) {
                    console.error('Error in connection callback:', error);
                }
            });

            // Subscribe to user-specific queue
            if (this.stompClient) {
                try {
                    this.userQueueSubscription = this.stompClient.subscribe(
                        `/user/${userId}/queue/messages`,
                        (message) => {
                            console.log('📨 Received user message:', message.body);
                            try {
                                const messageData: ChatMessageDTO = JSON.parse(message.body);
                                this.handleMessage(messageData);
                            } catch (error) {
                                console.error('Error parsing user message:', error);
                            }
                        }
                    );
                    console.log(`✅ Subscribed to user queue: /user/${userId}/queue/messages`);
                } catch (error) {
                    console.error('Error subscribing to user queue:', error);
                }
            }

            // Subscribe to all registered rooms
            this.messageCallbacks.forEach((_, roomId) => {
                this.subscribeToRoomInternal(roomId);
            });

            // Send join notification (like the JavaScript example)
            if (this.stompClient) {
                try {
                    this.stompClient.publish({
                        destination: '/app/chat.addUser',
                        body: JSON.stringify({
                            sender: `User_${userId}`,
                            type: 'JOIN'
                        })
                    });
                    console.log('✅ Sent JOIN notification');
                } catch (error) {
                    console.error('Error sending join notification:', error);
                }
            }
        };

        // Set up error handler - matching: onError
        this.stompClient.onStompError = (frame) => {
            console.error('❌ STOMP error:', frame.headers['message']);
            console.error('Details:', frame.body);
            this.isConnected = false;
            this.errorCallbacks.forEach(callback => {
                try {
                    callback(frame);
                } catch (error) {
                    console.error('Error in error callback:', error);
                }
            });
        };

        this.stompClient.onWebSocketError = (event) => {
            console.error('❌ WebSocket error:', event);
            this.isConnected = false;
        };

        this.stompClient.onDisconnect = () => {
            console.log('🔌 WebSocket disconnected');
            this.isConnected = false;
            this.disconnectionCallbacks.forEach(callback => {
                try {
                    callback();
                } catch (error) {
                    console.error('Error in disconnection callback:', error);
                }
            });
        };

        // Activate the connection
        try {
            this.stompClient.activate();
            console.log('🚀 WebSocket activation initiated');
        } catch (error) {
            console.error('❌ Failed to activate WebSocket:', error);
            this.isConnected = false;
            this.errorCallbacks.forEach(callback => callback(error));
        }
    }

    disconnect() {
        if (this.stompClient) {
            console.log('🔌 Disconnecting WebSocket');

            // Send leave notification
            if (this.isConnected && this.currentUserId) {
                try {
                    this.stompClient.publish({
                        destination: '/app/chat.addUser',
                        body: JSON.stringify({
                            sender: `User_${this.currentUserId}`,
                            type: 'LEAVE'
                        })
                    });
                } catch (error) {
                    console.error('Error sending leave notification:', error);
                }
            }

            // Clean up all subscriptions
            this.activeSubscriptions.forEach((subscription) => {
                try {
                    subscription.unsubscribe();
                } catch (error) {
                    console.error('Error unsubscribing from room:', error);
                }
            });
            this.activeSubscriptions.clear();

            if (this.userQueueSubscription) {
                try {
                    this.userQueueSubscription.unsubscribe();
                } catch (error) {
                    console.error('Error unsubscribing from user queue:', error);
                }
                this.userQueueSubscription = null;
            }

            try {
                this.stompClient.deactivate();
            } catch (error) {
                console.error('Error deactivating client:', error);
            }

            this.stompClient = null;
            this.isConnected = false;
            this.currentUserId = null;
        }
    }

    private subscribeToRoomInternal(roomId: number) {
        if (!this.stompClient || !this.isConnected) {
            console.warn('⚠️ Cannot subscribe to room - not connected');
            return;
        }

        // Unsubscribe from existing subscription if any
        if (this.activeSubscriptions.has(roomId)) {
            try {
                this.activeSubscriptions.get(roomId)?.unsubscribe();
            } catch (error) {
                console.error('Error unsubscribing from existing room:', error);
            }
        }

        try {
            const destination = `/topic/room/${roomId}`;
            console.log(`📡 Subscribing to: ${destination}`);

            // Subscribe like: stompClient.subscribe('/topic/public', onMessageReceived);
            const subscription = this.stompClient.subscribe(destination, (message) => {
                console.log(`📨 Received room message for room ${roomId}:`, message.body);
                try {
                    const messageData: ChatMessageDTO = JSON.parse(message.body);
                    this.handleMessage(messageData);
                } catch (error) {
                    console.error('Error parsing room message:', error);
                }
            });

            this.activeSubscriptions.set(roomId, subscription);
            console.log(`✅ Subscribed to room ${roomId}`);
        } catch (error) {
            console.error(`❌ Failed to subscribe to room ${roomId}:`, error);
        }
    }

    subscribeToRoom(roomId: number, callback: MessageCallback) {
        if (!this.messageCallbacks.has(roomId)) {
            this.messageCallbacks.set(roomId, []);
        }

        const callbacks = this.messageCallbacks.get(roomId);
        if (callbacks && !callbacks.includes(callback)) {
            callbacks.push(callback);
        }

        // Subscribe immediately if connected
        if (this.isConnected) {
            this.subscribeToRoomInternal(roomId);
        }
    }

    unsubscribeFromRoom(roomId: number, callback: MessageCallback) {
        const callbacks = this.messageCallbacks.get(roomId);
        if (callbacks) {
            const index = callbacks.indexOf(callback);
            if (index > -1) {
                callbacks.splice(index, 1);
            }

            // If no more callbacks for this room, unsubscribe from the topic
            if (callbacks.length === 0) {
                const subscription = this.activeSubscriptions.get(roomId);
                if (subscription) {
                    try {
                        subscription.unsubscribe();
                    } catch (error) {
                        console.error('Error unsubscribing:', error);
                    }
                    this.activeSubscriptions.delete(roomId);
                }
                this.messageCallbacks.delete(roomId);
            }
        }
    }

    sendMessage(roomId: number, message: SendMessageRequest): boolean {
        if (!this.canSendMessage()) {
            console.warn('⚠️ WebSocket not connected, cannot send message');
            return false;
        }

        try {
            console.log('📤 Sending message to room:', roomId, message);

            // Send like: stompClient.send("/app/chat.sendMessage", {}, JSON.stringify(chatMessage));
            if (this.stompClient) {
                this.stompClient.publish({
                    destination: '/app/chat.send',
                    body: JSON.stringify({
                        roomId: roomId,
                        content: message.content,
                        messageType: message.messageType || 'TEXT',
                        senderId: this.currentUserId
                    }),
                    headers: {}
                });
                console.log('✅ Message sent successfully');
                return true;
            }
            return false;
        } catch (error) {
            console.error('❌ Failed to send message:', error);
            return false;
        }
    }

    // Event registration methods
    onConnection(callback: ConnectionCallback) {
        this.connectionCallbacks.push(callback);
    }

    offConnection(callback: ConnectionCallback) {
        const index = this.connectionCallbacks.indexOf(callback);
        if (index > -1) {
            this.connectionCallbacks.splice(index, 1);
        }
    }

    onDisconnection(callback: DisconnectionCallback) {
        this.disconnectionCallbacks.push(callback);
    }

    offDisconnection(callback: DisconnectionCallback) {
        const index = this.disconnectionCallbacks.indexOf(callback);
        if (index > -1) {
            this.disconnectionCallbacks.splice(index, 1);
        }
    }

    onError(callback: ErrorCallback) {
        this.errorCallbacks.push(callback);
    }

    offError(callback: ErrorCallback) {
        const index = this.errorCallbacks.indexOf(callback);
        if (index > -1) {
            this.errorCallbacks.splice(index, 1);
        }
    }

    private handleMessage(message: ChatMessageDTO) {
        const callbacks = this.messageCallbacks.get(message.roomId) || [];
        console.log(`📬 Handling message for room ${message.roomId}, ${callbacks.length} callbacks`);
        callbacks.forEach(callback => {
            try {
                callback(message);
            } catch (error) {
                console.error('Error in message callback:', error);
            }
        });
    }

    get connected(): boolean {
        return this.isConnected && this.stompClient?.connected === true;
    }

    // Method to manually reconnect
    reconnect(userId: number) {
        console.log('🔄 Attempting to reconnect WebSocket...');
        this.disconnect();
        setTimeout(() => {
            this.connect(userId);
        }, 1000);
    }

    // Method to check if we can send messages
    canSendMessage(): boolean {
        return this.connected && this.stompClient !== null;
    }

    // Method to test connection
    testConnection(): void {
        console.log('🧪 Testing WebSocket connection...');
        console.log('Environment:', {
            NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL,
            NODE_ENV: process.env.NODE_ENV
        });
        console.log('Status:', {
            isConnected: this.isConnected,
            clientExists: !!this.stompClient,
            clientConnected: this.stompClient?.connected,
            currentUserId: this.currentUserId,
            activeRooms: Array.from(this.activeSubscriptions.keys())
        });
    }
}

export const webSocketService = new WebSocketService();