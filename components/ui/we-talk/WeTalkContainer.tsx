import React, { useState } from 'react'
import { useSession } from 'next-auth/react'
import useFetchWeTalksWithQuery from '@/lib/hooks/useFetchWeTalksWithQuery'
import WeTalkBackground from './WeTalkBackground'
import WeTalkSidebar from './WeTalkSidebar'
import WeTalkHeader from './WeTalkHeader'
import WeTalkMessages from './WeTalkMessages'
import WeTalkInput from './WeTalkInput'
import WeTalkStatus from './WeTalkStatus'
import UserSelectionPopup from './UserSelectionPopup'
import GroupChatCreator from './GroupChatCreator'
import { Contact, MyContact } from '@/lib/types/weTalk.types'

const WeTalkContainer = () => {
  const { data: session, status } = useSession()
  const [showUserSelection, setShowUserSelection] = useState(false)
  const [showGroupCreator, setShowGroupCreator] = useState(false)
  
  const {
    contacts,
    myContacts,
    pendingContacts,
    conversations,
    messages,
    activeContact,
    activeConversation,
    isTyping,
    error,
    isWebSocketConnected,
    typingUsers,
    sendMessage,
    handleTypingIndicator,
    switchContact,
    startConversationWithUser,
    addContact,
    acceptContactRequest,
    rejectContactRequest,
    deleteMessage,
    loadMoreMessages,
    queries,
    mutations,
    wsConnectionError,
    wsRetryConnection
  } = useFetchWeTalksWithQuery()

  const handleSendMessage = (text: string) => {
    // console.log('WeTalkContainer: handleSendMessage called with:', text)
    // console.log('WeTalkContainer: Current active contact:', activeContact?.name)
    console.log('WeTalkContainer: Current active conversation:', activeConversation)
    sendMessage(text)
  }

  const handleContactSelect = async (contact: MyContact) => {
    await switchContact(contact)
  }

  const handleShowUserSelection = () => {
    setShowUserSelection(true)
  }

  const handleShowGroupCreator = () => {
    setShowGroupCreator(true)
  }

  const handleCloseUserSelection = () => {
    setShowUserSelection(false)
  }

  const handleCloseGroupCreator = () => {
    setShowGroupCreator(false)
  }

  const handleStartConversation = async (user: Contact) => {
    try {
      if (user.userId) {
        await startConversationWithUser(user.userId)
        setShowUserSelection(false)
      }
    } catch (error) {
      console.error('Failed to start conversation:', error)
    }
  }

  const handleAddContact = async (contactUserId: number) => {
    try {
      await addContact(contactUserId)
    } catch (error) {
      console.error('Failed to add contact:', error)
    }
  }

  const handleAcceptContact = async (contactId: number) => {
    try {
      await acceptContactRequest(contactId)
    } catch (error) {
      console.error('Failed to accept contact:', error)
    }
  }

  const handleRejectContact = async (contactId: number) => {
    try {
      await rejectContactRequest(contactId)
    } catch (error) {
      console.error('Failed to reject contact:', error)
    }
  }

  const handleDeleteMessage = async (messageId: number) => {
    try {
      await deleteMessage(messageId)
    } catch (error) {
      console.error('Failed to delete message:', error)
    }
  }

  const handleCallClick = () => {
    if (activeContact) {
      alert(`Starting voice call with`)
    }
  }

  const handleVideoClick = () => {
    if (activeContact) {
      alert(`Starting video call with`)
    }
  }

  const handleHeartClick = () => {
    if (activeContact) {
      alert(`Sending love to  💝`)
    }
  }

  const handleLoadMoreMessages = () => {
    loadMoreMessages()
  }

  const handleRetry = () => {
    // Retry failed queries
    queries.contacts.refetch()
    queries.pendingContacts.refetch()
    queries.conversations.refetch()
    if (activeConversation) {
      queries.messages.refetch()
    }
  }

  if (error) {
    return (
      <div className="h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Connection Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="flex space-x-3 justify-center">
            <button 
              onClick={handleRetry}
              className="px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
            >
              Retry
            </button>
            <button 
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 flex">
      <WeTalkBackground />
      
      <WeTalkSidebar
        contacts={contacts}
        myContacts={myContacts}
        activeContact={activeContact}
        onContactSelect={handleContactSelect}
        onShowUserSelection={handleShowUserSelection}
        onShowGroupCreator={handleShowGroupCreator}
        isLoading={queries.contacts.isLoading}
        hasError={!!queries.contacts.error}
        onRetry={() => queries.contacts.refetch()}
      />

      <div className="flex-1 flex flex-col relative z-10">
        <WeTalkHeader
          activeContact={activeContact}
          isTyping={isTyping}
          onCallClick={handleCallClick}
          onVideoClick={handleVideoClick}
          onHeartClick={handleHeartClick}
          isWebSocketConnected={isWebSocketConnected}
          // wsConnectionError={wsConnectionError}
        />

        <WeTalkMessages
          messages={messages}
          activeContact={activeContact}
          isTyping={isTyping}
          typingUsers={typingUsers}
          isLoading={queries.messages.isLoading}
          hasNextPage={queries.messages.hasNextPage}
          isFetchingNextPage={queries.messages.isFetchingNextPage}
          onLoadMore={handleLoadMoreMessages}
          error={queries.messages.error?.message}
          onRetry={() => queries.messages.refetch()}
        />

        <WeTalkInput
          onSendMessage={handleSendMessage}
          onTypingIndicator={handleTypingIndicator}
          disabled={!activeContact || mutations.sendMessage.isPending}
          isSending={mutations.sendMessage.isPending}
        />
      </div>

      <UserSelectionPopup
        isOpen={showUserSelection}
        onClose={handleCloseUserSelection}
        allUsers={[...contacts, ...pendingContacts]}
        onStartConversation={handleStartConversation}
        isLoading={queries.contacts.isLoading || mutations.createDirectConversation.isPending}
        error={queries.contacts.error?.message}
        onRetry={() => queries.contacts.refetch()}
      />

      <GroupChatCreator
        isOpen={showGroupCreator}
        onClose={handleCloseGroupCreator}
        allUsers={[...contacts, ...pendingContacts]}
        onCreateGroup={() => {
          // Group chat functionality would need to be implemented
          // based on your backend API requirements
          console.log('Group chat creation not implemented yet')
          setShowGroupCreator(false)
        }}
        isLoading={false}
        error={undefined}
        onRetry={() => {}}
      />

      {/* WebSocket Status for debugging */}
      {/* <WeTalkStatus
        isConnected={isWebSocketConnected}
        connectionError={wsConnectionError}
        isTyping={isTyping}
        typingUsers={typingUsers}
        onRetry={wsRetryConnection}
      /> */}
    </div>
  )
}

export default WeTalkContainer