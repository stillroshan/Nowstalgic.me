import { useEffect, useState, useRef } from 'react'
import useMessageStore from '../stores/messageStore'
import useAuthStore from '../stores/authStore'

const Messages = () => {
  const { user } = useAuthStore()
  const {
    conversations,
    messages,
    currentChat,
    getConversations,
    getMessages,
    sendMessage,
    initializeSocket
  } = useMessageStore()
  const [newMessage, setNewMessage] = useState('')
  const messagesEndRef = useRef(null)

  useEffect(() => {
    initializeSocket()
    getConversations()
  }, [initializeSocket, getConversations])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async (e) => {
    e.preventDefault()
    if (!newMessage.trim() || !currentChat) return

    try {
      await sendMessage(currentChat, newMessage)
      setNewMessage('')
    } catch (error) {
      console.error('Failed to send message:', error)
    }
  }

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Conversations List */}
      <div className="w-80 border-r border-base-300 overflow-y-auto">
        <div className="p-4">
          <h2 className="text-xl font-bold mb-4">Messages</h2>
          <div className="space-y-2">
            {conversations.map((conv) => (
              <div
                key={conv.user._id}
                onClick={() => getMessages(conv.user._id)}
                className={`p-3 rounded-lg cursor-pointer hover:bg-base-200 ${
                  currentChat === conv.user._id ? 'bg-base-200' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="avatar">
                    <div className="w-12 rounded-full">
                      <img
                        src={conv.user.profilePicture || "https://via.placeholder.com/48"}
                        alt={conv.user.username}
                      />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{conv.user.username}</h3>
                    <p className="text-sm text-base-content/70 truncate">
                      {conv.lastMessage.content}
                    </p>
                  </div>
                  {conv.unreadCount > 0 && (
                    <div className="badge badge-primary">{conv.unreadCount}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {currentChat ? (
          <>
            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto">
              {messages.map((message) => (
                <div
                  key={message._id}
                  className={`chat ${
                    message.sender._id === user._id ? 'chat-end' : 'chat-start'
                  }`}
                >
                  <div className="chat-image avatar">
                    <div className="w-10 rounded-full">
                      <img
                        src={message.sender.profilePicture || "https://via.placeholder.com/40"}
                        alt={message.sender.username}
                      />
                    </div>
                  </div>
                  <div className="chat-bubble">{message.content}</div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <form onSubmit={handleSend} className="p-4 border-t border-base-300">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="input input-bordered flex-1"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="btn btn-primary"
                >
                  Send
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-base-content/70">
            Select a conversation to start messaging
          </div>
        )}
      </div>
    </div>
  )
}

export default Messages 