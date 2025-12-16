"use client"

import { useState } from "react"
import { ArrowLeft, Send, Phone, MoreVertical } from "lucide-react"
import { useChat } from "@/lib/chat-context"
import { useUser } from "@/lib/user-context"
import { useI18n } from "@/lib/i18n-context"

export function MessagesScreen() {
  const { chats, getChatsByUser, getChatById, sendMessage, markMessagesAsRead } = useChat()
  const { user } = useUser()
  const { t } = useI18n()
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null)
  const [messageText, setMessageText] = useState("")

  const userChats = user ? getChatsByUser(user.email) : []
  const selectedChat = selectedChatId ? getChatById(selectedChatId) : null

  const handleSendMessage = () => {
    if (!messageText.trim() || !selectedChatId || !user) return

    sendMessage(selectedChatId, user.email, user.name, messageText.trim())
    setMessageText("")
  }

  const handleOpenChat = (chatId: string) => {
    setSelectedChatId(chatId)
    if (user) {
      markMessagesAsRead(chatId, user.email)
    }
  }

  if (selectedChat) {
    const otherParticipant = selectedChat.participants.find((p) => p.email !== user?.email)

    return (
      <div className="flex flex-col h-full bg-background">
        {/* Chat Header */}
        <div className="flex items-center gap-3 px-4 py-3 bg-card border-b border-border">
          <button onClick={() => setSelectedChatId(null)} className="text-foreground hover:text-primary">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-3 flex-1">
            <img src={otherParticipant?.avatar || "/placeholder.svg"} alt="" className="w-10 h-10 rounded-full" />
            <div className="flex-1">
              <h3 className="font-semibold text-foreground">{otherParticipant?.name}</h3>
              <p className="text-xs text-muted-foreground line-clamp-1">{selectedChat.activityTitle}</p>
            </div>
          </div>
          <button className="text-foreground hover:text-primary">
            <Phone className="w-5 h-5" />
          </button>
          <button className="text-foreground hover:text-primary">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {selectedChat.messages.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <p className="text-sm">{t("chat.noMessages")}</p>
              <p className="text-xs mt-1">{t("chat.startConversation")}</p>
            </div>
          ) : (
            selectedChat.messages.map((msg) => {
              const isOwn = msg.senderEmail === user?.email

              return (
                <div key={msg.id} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[75%] ${isOwn ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"} rounded-2xl px-4 py-2`}
                  >
                    <p className="text-sm break-words">{msg.content}</p>
                    <p className={`text-xs mt-1 ${isOwn ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                      {msg.timestamp.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Message Input */}
        <div className="flex items-center gap-2 px-4 py-3 bg-card border-t border-border">
          <input
            type="text"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            placeholder={t("chat.typeMessage")}
            className="flex-1 px-4 py-2 bg-muted rounded-full text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            onClick={handleSendMessage}
            disabled={!messageText.trim()}
            className="w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="px-6 py-4 bg-card border-b border-border">
        <h1 className="text-2xl font-bold text-foreground">{t("chat.messages")}</h1>
      </div>

      {/* Chats List */}
      <div className="flex-1 overflow-y-auto">
        {userChats.length === 0 ? (
          <div className="text-center py-12 px-6">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Send className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">{t("chat.noChats")}</h3>
            <p className="text-sm text-muted-foreground">{t("chat.noChatsDescription")}</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {userChats.map((chat) => {
              const otherParticipant = chat.participants.find((p) => p.email !== user?.email)
              const lastMessage = chat.messages[chat.messages.length - 1]
              const unreadCount = chat.messages.filter((m) => m.senderEmail !== user?.email && !m.read).length

              return (
                <button
                  key={chat.id}
                  onClick={() => handleOpenChat(chat.id)}
                  className="w-full flex items-center gap-3 px-6 py-4 hover:bg-muted/50 transition-colors text-left"
                >
                  <div className="relative">
                    <img
                      src={otherParticipant?.avatar || "/placeholder.svg"}
                      alt=""
                      className="w-12 h-12 rounded-full"
                    />
                    {unreadCount > 0 && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs font-bold rounded-full flex items-center justify-center">
                        {unreadCount}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-foreground">{otherParticipant?.name}</h3>
                      <span className="text-xs text-muted-foreground">
                        {chat.lastMessageAt.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-1 mb-1">{chat.activityTitle}</p>
                    {lastMessage && (
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {lastMessage.senderEmail === user?.email ? "Tú: " : ""}
                        {lastMessage.content}
                      </p>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
