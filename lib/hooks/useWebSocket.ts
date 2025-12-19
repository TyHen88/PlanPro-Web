import { useEffect, useRef, useState, useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import { Message } from '@/lib/types/weTalk.types'
import { getCurrentUserId } from '@/lib/utils/weTalk.utils'
import { WEBSOCKET_CONFIG } from '@/lib/config/websocket'

// STOMP Client types
interface StompClient {
  connect: (headers: any, callback: () => void) => void
  subscribe: (destination: string, callback: (message: any) => void) => { unsubscribe: () => void }
  publish: (params: { destination: string; body: string }) => void
  deactivate: () => void
  onConnect?: () => void
  onStompError?: (frame: any) => void
  activate: () => void
}

interface ChatEvent {
  eventType: 'NEW_MESSAGE' | 'MESSAGE_EDITED' | 'MESSAGE_DELETED' | 'TYPING' | null
  messageId?: number
  conversationId: number
  senderId?: number
  senderUsername?: string
  senderDisplayName?: string
  senderAvatarUrl?: string
  content?: string
  messageType?: string
  fileUrl?: string | null
  replyToMessageId?: number | null
  isEdited?: boolean
  createdAt?: string
  updatedAt?: string
  userId?: number
  username?: string
  isTyping?: boolean
}

export const useWebSocket = (conversationId?: number) => {
  const { data: session } = useSession()
  const queryClient = useQueryClient()
  const stompClientRef = useRef<StompClient | null>(null)
  const conversationSubRef = useRef<{ unsubscribe: () => void } | null>(null)
  const userQueueSubRef = useRef<{ unsubscribe: () => void } | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [typingUsers, setTypingUsers] = useState<string[]>([])
  const [connectionError, setConnectionError] = useState<string | null>(null)
  const [currentEndpointIndex, setCurrentEndpointIndex] = useState(0)
  const [isReconnecting, setIsReconnecting] = useState(false)
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const connectionHealthCheckRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const idleTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastActivityRef = useRef<number>(Date.now())
  const currentUserId = getCurrentUserId(session)
  const [connectionRequested, setConnectionRequested] = useState(false)
  const pendingTypingRef = useRef<boolean | null>(null)

  // Idle timeout should never break an active chat; only used to tear down an unused transport.
  const IDLE_TIMEOUT = 5 * 60 * 1000 // 5 minutes

  const getCurrentEndpoint = useCallback(() => {
    const endpoints = [
      WEBSOCKET_CONFIG.ENDPOINTS.SOCKJS,
      ...WEBSOCKET_CONFIG.ENDPOINTS.ALTERNATIVES,
    ]
    return endpoints[currentEndpointIndex] || WEBSOCKET_CONFIG.ENDPOINTS.SOCKJS
  }, [currentEndpointIndex])

  const updateActivity = useCallback(() => {
    lastActivityRef.current = Date.now()
  }, [])

  const clearAllTimeouts = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }
    if (connectionHealthCheckRef.current) {
      clearTimeout(connectionHealthCheckRef.current)
      connectionHealthCheckRef.current = null
    }
    if (idleTimeoutRef.current) {
      clearTimeout(idleTimeoutRef.current)
      idleTimeoutRef.current = null
    }
  }, [])

  const startIdleTimeout = useCallback(() => {
    if (idleTimeoutRef.current) {
      clearTimeout(idleTimeoutRef.current)
    }

    // If the user is actively in a conversation, do not auto-unsubscribe.
    if (conversationId) return

    idleTimeoutRef.current = setTimeout(() => {
      // No active conversation + idle => fully disconnect transport.
      try {
        stompClientRef.current?.deactivate()
      } catch {
        // ignore
      } finally {
        stompClientRef.current = null
        setIsConnected(false)
        setTypingUsers([])
        setConnectionRequested(false)

        if (connectionHealthCheckRef.current) {
          clearInterval(connectionHealthCheckRef.current)
          connectionHealthCheckRef.current = null
        }
      }
    }, IDLE_TIMEOUT)
  }, [IDLE_TIMEOUT, conversationId])

  const stopIdleTimeout = useCallback(() => {
    if (idleTimeoutRef.current) {
      clearTimeout(idleTimeoutRef.current)
      idleTimeoutRef.current = null
    }
  }, [])

  const startConnectionHealthCheck = useCallback(() => {
    if (connectionHealthCheckRef.current) {
      clearInterval(connectionHealthCheckRef.current)
    }

    connectionHealthCheckRef.current = setInterval(() => {
      // Placeholder for future checks (heartbeats handled by STOMP settings).
      if (!stompClientRef.current || !isConnected) return
    }, 30000)
  }, [isConnected])

  const stopConnectionHealthCheck = useCallback(() => {
    if (connectionHealthCheckRef.current) {
      clearInterval(connectionHealthCheckRef.current)
      connectionHealthCheckRef.current = null
    }
  }, [])

  const initializeStompClient = useCallback(async () => {
    if (typeof window === 'undefined') return null
    try {
      const SockJS = (await import('sockjs-client')).default
      const { Client } = await import('@stomp/stompjs')
      const currentEndpoint = getCurrentEndpoint()

      const client = new Client({
        webSocketFactory: () => new SockJS(currentEndpoint),
        debug: WEBSOCKET_CONFIG.STOMP.DEBUG ? (str: string) => console.log('STOMP Debug:', str) : undefined,
        reconnectDelay: WEBSOCKET_CONFIG.STOMP.RECONNECT_DELAY,
        heartbeatIncoming: WEBSOCKET_CONFIG.STOMP.HEARTBEAT_INCOMING,
        heartbeatOutgoing: WEBSOCKET_CONFIG.STOMP.HEARTBEAT_OUTGOING,
        connectHeaders: {
          'X-User-ID': currentUserId?.toString() || ''
        }
      })
      return client as unknown as StompClient
    } catch (error) {
      setConnectionError('Failed to initialize WebSocket client')
      return null
    }
  }, [currentUserId, getCurrentEndpoint])

  const handleNewMessage = useCallback((event: ChatEvent) => {
    if (!event.messageId || !event.conversationId) return
    if (event.senderId === currentUserId) return

    const newMessage: Message = {
      id: event.messageId.toString(),
      text: event.content || '',
      sender: event.senderId === currentUserId ? 'user' : 'other',
      timestamp: new Date(event.createdAt || Date.now()),
      type: (event.messageType as 'text' | 'image' | 'voice') || 'text',
      status: 'delivered',
      avatar: event.senderAvatarUrl,
      senderName: event.senderDisplayName || event.senderUsername,
      conversationId: event.conversationId.toString(),
      userId: event.senderId
    }

    const conversationIdStr = event.conversationId.toString()
    queryClient.setQueryData(['messages', conversationIdStr], (old: any) => {
      if (!old) return { pages: [[newMessage]], pageParams: [1] }
      const exists = old.pages.some((page: Message[]) => page.some((m: Message) => m.id === newMessage.id))
      if (exists) return old
      const lastPageIndex = old.pages.length - 1
      return {
        ...old,
        pages: old.pages.map((page: Message[], idx: number) => idx === lastPageIndex ? [...page, newMessage] : page)
      }
    })
    queryClient.invalidateQueries({ queryKey: ['contacts'] })
    queryClient.invalidateQueries({ queryKey: ['my-contacts'] })
  }, [currentUserId, queryClient])

  const handleMessageEdited = useCallback((event: ChatEvent) => {
    if (!event.messageId || !event.conversationId) return
    const key = event.conversationId.toString()
    queryClient.setQueryData(['messages', key], (old: any) => {
      if (!old) return old
      return {
        ...old,
        pages: old.pages.map((page: Message[]) => page.map((m: Message) => m.id === event.messageId!.toString() ? { ...m, text: event.content || m.text, timestamp: new Date(event.updatedAt || Date.now()) } : m))
      }
    })
  }, [queryClient])

  const handleMessageDeleted = useCallback((event: ChatEvent) => {
    if (!event.messageId || !event.conversationId) return
    const key = event.conversationId.toString()
    queryClient.setQueryData(['messages', key], (old: any) => {
      if (!old) return old
      return { ...old, pages: old.pages.map((page: Message[]) => page.filter((m: Message) => m.id !== event.messageId!.toString())) }
    })
  }, [queryClient])

  const handleTypingEvent = useCallback((event: ChatEvent) => {
    if (event.username === undefined || event.isTyping === undefined) return
    updateActivity()
    setTypingUsers((prev: string[]) => {
      if (event.isTyping) {
        return prev.includes(event.username as string) ? prev : [...prev, event.username as string]
      } else {
        return prev.filter((u: string) => u !== (event.username as string))
      }
    })
  }, [updateActivity])

  const handleChatEvent = useCallback((event: ChatEvent) => {
    updateActivity()
    if (!event.eventType && event.messageId && event.content) {
      handleNewMessage(event)
      return
    }
    switch (event.eventType) {
      case 'NEW_MESSAGE':
        handleNewMessage(event)
        break
      case 'MESSAGE_EDITED':
        handleMessageEdited(event)
        break
      case 'MESSAGE_DELETED':
        handleMessageDeleted(event)
        break
      case 'TYPING':
        handleTypingEvent(event)
        break
      default:
        break
    }
  }, [updateActivity, handleNewMessage, handleMessageEdited, handleMessageDeleted, handleTypingEvent])

  // Keep a stable reference so subscriptions always call the latest handler without reconnect loops.
  const handleChatEventRef = useRef(handleChatEvent)
  useEffect(() => {
    handleChatEventRef.current = handleChatEvent
  }, [handleChatEvent])

  const retryConnection = useCallback(() => {
    const endpoints = [WEBSOCKET_CONFIG.ENDPOINTS.SOCKJS, ...WEBSOCKET_CONFIG.ENDPOINTS.ALTERNATIVES]
    if (currentEndpointIndex < endpoints.length - 1) {
      setCurrentEndpointIndex(prev => prev + 1)
      setConnectionError(null)
    } else {
      setConnectionError('All WebSocket endpoints failed - check server configuration')
    }
  }, [currentEndpointIndex])

  // On-demand transport: connects only when requested
  useEffect(() => {
    if (!session?.user || !conversationId || !connectionRequested || isConnected) return

    let client: StompClient | undefined
    let connectionTimeout: NodeJS.Timeout | null = null

    const connectTransport = async () => {
      try {
        setConnectionError(null)
        client = await initializeStompClient() || undefined
        if (!client) return

        connectionTimeout = setTimeout(() => {
          setConnectionError('WebSocket connection timeout - trying next endpoint...')
          setIsConnected(false)
          setIsReconnecting(true)
          setTimeout(() => { retryConnection(); setIsReconnecting(false) }, 1000)
        }, WEBSOCKET_CONFIG.STOMP.CONNECT_TIMEOUT)

        // Assign to ref before wiring handlers
        stompClientRef.current = client

        client.onConnect = () => {
          setIsConnected(true)
          setConnectionError(null)
          if (connectionTimeout) { clearTimeout(connectionTimeout); connectionTimeout = null }
          startConnectionHealthCheck()
          startIdleTimeout()

          // Subscribe to user queue once per transport
          const c = stompClientRef.current
          if (currentUserId && !userQueueSubRef.current && c) {
            userQueueSubRef.current = c.subscribe(WEBSOCKET_CONFIG.STOMP.DESTINATIONS.USER_QUEUE(currentUserId), (message) => {
              try {
                const event: ChatEvent = JSON.parse(message.body)
                handleChatEventRef.current(event)
              } catch {
                // ignore
              }
            })
          }

          // Also subscribe to current conversation immediately
          if (c && conversationId && !conversationSubRef.current) {
            conversationSubRef.current = c.subscribe(
              WEBSOCKET_CONFIG.STOMP.DESTINATIONS.CONVERSATION_TOPIC(conversationId),
              (message) => {
                try {
                  const event: ChatEvent = JSON.parse(message.body)
                  handleChatEventRef.current(event)
                } catch {
                  // ignore
                }
              },
            )
            c.publish({ destination: WEBSOCKET_CONFIG.STOMP.DESTINATIONS.JOIN_CONVERSATION, body: conversationId.toString() })
          }
        }

        client.onStompError = () => {
          setConnectionError('WebSocket error - trying next endpoint...')
          setIsConnected(false)
          setIsReconnecting(true)
          if (connectionTimeout) { clearTimeout(connectionTimeout); connectionTimeout = null }
          setTimeout(() => { retryConnection(); setIsReconnecting(false) }, 1000)
        }

        client.activate()
        stompClientRef.current = client
      } catch (error) {
        setConnectionError('Failed to connect to WebSocket server - trying next endpoint...')
        setIsConnected(false)
        setIsReconnecting(true)
        if (connectionTimeout) { clearTimeout(connectionTimeout); connectionTimeout = null }
        setTimeout(() => { retryConnection(); setIsReconnecting(false) }, 1000)
      }
    }

    connectTransport()

    return () => {
      if (connectionTimeout) { clearTimeout(connectionTimeout) }
      if (client) {
        try { client.deactivate() } catch { }
        stompClientRef.current = null
        setIsConnected(false)
        setTypingUsers([])
        setConnectionError(null)
        stopConnectionHealthCheck()
        stopIdleTimeout()
        if (userQueueSubRef.current) { try { userQueueSubRef.current.unsubscribe() } catch { }; userQueueSubRef.current = null }
        if (conversationSubRef.current) { try { conversationSubRef.current.unsubscribe() } catch { }; conversationSubRef.current = null }
      }
    }
  }, [session?.user, conversationId, connectionRequested, isConnected, currentUserId, initializeStompClient, retryConnection, startConnectionHealthCheck, stopConnectionHealthCheck, startIdleTimeout, stopIdleTimeout, handleChatEvent])

  // Subscribe/unsubscribe when conversation changes (only if connected)
  useEffect(() => {
    setTypingUsers([])
    stopIdleTimeout()
    if (!stompClientRef.current || !isConnected) return

    if (conversationSubRef.current) { try { conversationSubRef.current.unsubscribe() } catch { }; conversationSubRef.current = null }
    if (!conversationId) return

    conversationSubRef.current = stompClientRef.current.subscribe(
      WEBSOCKET_CONFIG.STOMP.DESTINATIONS.CONVERSATION_TOPIC(conversationId),
      (message) => {
        try {
          const event: ChatEvent = JSON.parse(message.body)
          handleChatEventRef.current(event)
        } catch {
          // ignore
        }
      },
    )
    stompClientRef.current.publish({ destination: WEBSOCKET_CONFIG.STOMP.DESTINATIONS.JOIN_CONVERSATION, body: conversationId.toString() })
    startIdleTimeout()

    return () => {
      if (conversationSubRef.current) { try { conversationSubRef.current.unsubscribe() } catch { }; conversationSubRef.current = null }
      if (stompClientRef.current && conversationId) {
        stompClientRef.current.publish({ destination: WEBSOCKET_CONFIG.STOMP.DESTINATIONS.LEAVE_CONVERSATION, body: conversationId.toString() })
      }
    }
  }, [conversationId, isConnected, handleChatEvent, startIdleTimeout, stopIdleTimeout])

  const ensureConnection = useCallback(() => {
    setConnectionRequested(true)
  }, [])

  const sendMessage = useCallback((message: any) => {
    // Ensure connection on demand
    ensureConnection()
    if (stompClientRef.current && isConnected) {
      stompClientRef.current.publish({
        destination: WEBSOCKET_CONFIG.STOMP.DESTINATIONS.SEND_MESSAGE,
        body: JSON.stringify(message)
      })
    }
  }, [isConnected, ensureConnection])

  const sendTypingIndicator = useCallback((isTyping: boolean) => {
    // Ensure connection on demand when typing
    ensureConnection()

    // If we're not connected yet, queue the latest typing state and flush when connected.
    if (!isConnected) {
      pendingTypingRef.current = isTyping
      return
    }

    if (stompClientRef.current && conversationId) {
      updateActivity()
      stompClientRef.current.publish({
        destination: WEBSOCKET_CONFIG.STOMP.DESTINATIONS.TYPING,
        body: JSON.stringify({ conversationId, isTyping }),
      })
    }
  }, [isConnected, conversationId, updateActivity, ensureConnection])

  useEffect(() => {
    if (!isConnected || !conversationId) return
    if (pendingTypingRef.current === null) return

    const queued = pendingTypingRef.current
    pendingTypingRef.current = null

    try {
      stompClientRef.current?.publish({
        destination: WEBSOCKET_CONFIG.STOMP.DESTINATIONS.TYPING,
        body: JSON.stringify({ conversationId, isTyping: queued }),
      })
    } catch {
      // ignore
    }
  }, [isConnected, conversationId])

  return {
    isConnected,
    isReconnecting,
    sendMessage,
    sendTypingIndicator,
    typingUsers,
    connectionError,
    retryConnection,
    ensureConnection
  }
} 