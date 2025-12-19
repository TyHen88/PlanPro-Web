import { useState, useCallback, useMemo, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import {
  Message,
  Contact,
  WeTalkState,
  Conversation,
  SendMessageRequest,
  MyContact
} from '@/lib/types/weTalk.types'
import { useWeTalkQueries } from './weTalk/useWeTalkQueries'
import { useWebSocket } from './useWebSocket'
import { WEBSOCKET_CONFIG } from '@/lib/config/websocket'

const useFetchWeTalksWithQuery = () => {
  const { data: session } = useSession()
  const [activeContact, setActiveContact] = useState<MyContact | null>(null)
  const [activeConversation, setActiveConversation] = useState<number | null>(null)
  const [isTyping, setIsTyping] = useState(false)

  // Get React Query hooks
  const {
    useContactsQuery,
    usePendingContactsQuery,
    useUserConversationsQuery,
    useMessagesQuery,
    useSendMessageMutation,
    useCreateDirectConversationMutation,
    useAddContactMutation,
    useAcceptContactMutation,
    useRejectContactMutation,
    useMarkAsReadMutation,
    useDeleteMessageMutation,
    useMyContactsQuery,
  } = useWeTalkQueries()

  // React Query hooks
  const contactsQuery = useContactsQuery()
  const pendingContactsQuery = usePendingContactsQuery()
  const conversationsQuery = useUserConversationsQuery()
  const messagesQuery = useMessagesQuery(activeConversation?.toString() || '')
  const myContactsQuery = useMyContactsQuery()

  const sendMessageMutation = useSendMessageMutation()
  const createDirectConversationMutation = useCreateDirectConversationMutation()
  const addContactMutation = useAddContactMutation()
  const acceptContactMutation = useAcceptContactMutation()
  const rejectContactMutation = useRejectContactMutation()
  const markAsReadMutation = useMarkAsReadMutation()
  const deleteMessageMutation = useDeleteMessageMutation()

  // Data extraction
  const contacts = contactsQuery.data || []
  const pendingContacts = pendingContactsQuery.data || []
  const conversations = conversationsQuery.data || []
  const messages = messagesQuery.data?.pages.flatMap((page: Message[]) => page) || []
  const myContacts = myContactsQuery.data || []

  // Memoize contacts and conversations to prevent exhaustive deps warnings
  const memoizedContacts = useMemo(() => {
    return contactsQuery.data || []
  }, [contactsQuery.data]) 
  
  const memoizedMyContacts = useMemo(() => {
    return myContactsQuery.data || []
  }, [myContactsQuery.data])
  
  const memoizedConversations = useMemo(() => {
    return conversationsQuery.data || []
  }, [conversationsQuery.data])

  // Error handling
  const error = contactsQuery.error?.message || 
                pendingContactsQuery.error?.message ||
                conversationsQuery.error?.message ||
                messagesQuery.error?.message

  // Initialize WebSocket for real-time messaging
  const { 
    isConnected: wsConnected, 
    isReconnecting: wsReconnecting,
    sendMessage: wsSendMessage, 
    sendTypingIndicator,
    typingUsers,
    connectionError: wsConnectionError,
    retryConnection: wsRetryConnection,
    ensureConnection,
  } = useWebSocket(activeConversation || undefined)

  // Fallback polling when WebSocket is not available
  useEffect(() => {
    if (!activeConversation || wsConnected || !WEBSOCKET_CONFIG.FALLBACK.ENABLED) return

    const pollInterval = setInterval(() => {
      // Refetch messages to get any new ones
      if (messagesQuery.data) {
        messagesQuery.refetch()
      }
    }, WEBSOCKET_CONFIG.FALLBACK.POLLING_INTERVAL)

    return () => clearInterval(pollInterval)
  }, [activeConversation, wsConnected, messagesQuery])

  // Actions
  const sendMessage = useCallback(async (text: string) => {
    if (!activeConversation || !session?.user?.id) return

    try {
      const messageData: SendMessageRequest = {
        content: text,
        messageType: 'TEXT', // Default message type
        fileUrl: undefined,
        replyToMessageId: undefined
      }

      // Send via HTTP only - WebSocket will handle receiving messages from other users
      // The HTTP mutation already includes optimistic updates for immediate UI feedback
      await sendMessageMutation.mutateAsync({
        conversationId: activeConversation,
        messageData
      })
    } catch (error) {
      console.error('Failed to send message:', error)
    }
  }, [activeConversation, session?.user?.id, sendMessageMutation])

  // Ensure websocket is connected whenever a conversation is active
  useEffect(() => {
    if (activeConversation) {
      ensureConnection()
    }
  }, [activeConversation, ensureConnection])

  // Handle typing indicator
  const handleTypingIndicator = useCallback((isTyping: boolean) => {
    setIsTyping(isTyping)
    // sendTypingIndicator already calls ensureConnection internally
    sendTypingIndicator(isTyping)
  }, [sendTypingIndicator])

  const switchContact = useCallback(async (contact: MyContact) => {
    setActiveContact(contact)
    
    // Set active conversation if it exists
    if (contact.conversationId) {
      setActiveConversation(contact.conversationId)
      // Mark conversation as read
      try {
        await markAsReadMutation.mutateAsync((contact.conversationId))
      } catch (error) {
        console.error('Failed to mark conversation as read:', error)
      }
    }
  }, [markAsReadMutation])

  const startConversationWithUser = useCallback(async (userId: number) => {
    if (!session?.user?.id) return

    try {
      const result = await createDirectConversationMutation.mutateAsync(userId)
      
      // The result should contain the conversation details
      if (result?.data?.conversationId) {
        setActiveConversation(parseInt(result.data.conversationId))
      }
    } catch (error) {
      console.error('Failed to start conversation:', error)
    }
  }, [session?.user?.id, createDirectConversationMutation])

  const addContact = useCallback(async (contactUserId: number) => {
    try {
      await addContactMutation.mutateAsync({ contactUserId })
    } catch (error) {
      console.error('Failed to add contact:', error)
    }
  }, [addContactMutation])

  const acceptContactRequest = useCallback(async (contactId: number) => {
    try {
      await acceptContactMutation.mutateAsync(contactId)
    } catch (error) {
      console.error('Failed to accept contact request:', error)
    }
  }, [acceptContactMutation])

  const rejectContactRequest = useCallback(async (contactId: number) => {
    try {
      await rejectContactMutation.mutateAsync(contactId)
    } catch (error) {
      console.error('Failed to reject contact request:', error)
    }
  }, [rejectContactMutation])

  const deleteMessage = useCallback(async (messageId: number) => {
    try {
      await deleteMessageMutation.mutateAsync(messageId)
    } catch (error) {
      console.error('Failed to delete message:', error)
    }
  }, [deleteMessageMutation])

  const loadMoreMessages = useCallback(() => {
    if (messagesQuery.hasNextPage && !messagesQuery.isFetchingNextPage) {
      messagesQuery.fetchNextPage()
    }
  }, [messagesQuery])

  return {
    // Data
    contacts: memoizedContacts,
    myContacts: memoizedMyContacts,
    pendingContacts,
    conversations: memoizedConversations,
    messages,
    activeContact,
    activeConversation,
    isTyping,
    error,
    
    // Real-time connection status
    isWebSocketConnected: wsConnected,
    isWebSocketReconnecting: wsReconnecting,
    typingUsers,
    wsConnectionError,
    wsRetryConnection,

    // Actions
    sendMessage,
    handleTypingIndicator,
    switchContact,
    startConversationWithUser,
    addContact,
    acceptContactRequest,
    rejectContactRequest,
    deleteMessage,
    loadMoreMessages,

    // Query states for granular control
    queries: {
      contacts: contactsQuery,
      pendingContacts: pendingContactsQuery,
      conversations: conversationsQuery,
      messages: messagesQuery,
      myContacts: myContactsQuery
    },

    // Mutation states
    mutations: {
      sendMessage: sendMessageMutation,
      createDirectConversation: createDirectConversationMutation,
      addContact: addContactMutation,
      acceptContact: acceptContactMutation,
      rejectContact: rejectContactMutation,
      markAsRead: markAsReadMutation,
      deleteMessage: deleteMessageMutation
    }
  }
}

export default useFetchWeTalksWithQuery 