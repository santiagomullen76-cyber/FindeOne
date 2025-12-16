"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

export interface Message {
  id: string
  chatId: string
  senderEmail: string
  senderName: string
  content: string
  timestamp: Date
  read: boolean
}

export interface Chat {
  id: string
  activityId: number
  activityTitle: string
  participants: {
    email: string
    name: string
    avatar: string
  }[]
  messages: Message[]
  createdAt: Date
  lastMessageAt: Date
}

interface ChatContextType {
  chats: Chat[]
  createChat: (activityId: number, activityTitle: string, participant1: any, participant2: any) => string
  sendMessage: (chatId: string, senderEmail: string, senderName: string, content: string) => void
  markMessagesAsRead: (chatId: string, userEmail: string) => void
  getChatById: (chatId: string) => Chat | undefined
  getChatsByUser: (userEmail: string) => Chat[]
  getUnreadCount: (userEmail: string) => number
  getChatByActivityAndUsers: (activityId: number, user1Email: string, user2Email: string) => Chat | undefined
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

const loadChatsFromStorage = (): Chat[] => {
  if (typeof window === "undefined") return []
  try {
    const stored = localStorage.getItem("findone_chats")
    if (stored) {
      const parsed = JSON.parse(stored)
      return parsed.map((c: any) => ({
        ...c,
        createdAt: new Date(c.createdAt),
        lastMessageAt: new Date(c.lastMessageAt),
        messages: c.messages.map((m: any) => ({
          ...m,
          timestamp: new Date(m.timestamp),
        })),
      }))
    }
  } catch (error) {
    console.error("[FindOne] Error loading chats:", error)
  }
  return []
}

export function ChatProvider({ children }: { children: ReactNode }) {
  const [chats, setChats] = useState<Chat[]>(loadChatsFromStorage())

  useEffect(() => {
    if (typeof window === "undefined") return
    try {
      localStorage.setItem("findone_chats", JSON.stringify(chats))
    } catch (error) {
      console.error("[FindOne] Error saving chats:", error)
    }
  }, [chats])

  const createChat = (activityId: number, activityTitle: string, participant1: any, participant2: any): string => {
    // Check if chat already exists
    const existingChat = chats.find(
      (c) =>
        c.activityId === activityId &&
        c.participants.some((p) => p.email === participant1.email) &&
        c.participants.some((p) => p.email === participant2.email),
    )

    if (existingChat) return existingChat.id

    const newChat: Chat = {
      id: `chat_${Date.now()}`,
      activityId,
      activityTitle,
      participants: [participant1, participant2],
      messages: [],
      createdAt: new Date(),
      lastMessageAt: new Date(),
    }

    setChats((prev) => [newChat, ...prev])
    return newChat.id
  }

  const sendMessage = (chatId: string, senderEmail: string, senderName: string, content: string) => {
    const newMessage: Message = {
      id: `msg_${Date.now()}`,
      chatId,
      senderEmail,
      senderName,
      content,
      timestamp: new Date(),
      read: false,
    }

    setChats((prev) =>
      prev.map((chat) =>
        chat.id === chatId
          ? {
              ...chat,
              messages: [...chat.messages, newMessage],
              lastMessageAt: new Date(),
            }
          : chat,
      ),
    )
  }

  const markMessagesAsRead = (chatId: string, userEmail: string) => {
    setChats((prev) =>
      prev.map((chat) =>
        chat.id === chatId
          ? {
              ...chat,
              messages: chat.messages.map((msg) => (msg.senderEmail !== userEmail ? { ...msg, read: true } : msg)),
            }
          : chat,
      ),
    )
  }

  const getChatById = (chatId: string): Chat | undefined => {
    return chats.find((c) => c.id === chatId)
  }

  const getChatsByUser = (userEmail: string): Chat[] => {
    return chats.filter((c) => c.participants.some((p) => p.email === userEmail))
  }

  const getUnreadCount = (userEmail: string): number => {
    return chats.reduce((count, chat) => {
      if (!chat.participants.some((p) => p.email === userEmail)) return count
      const unreadMessages = chat.messages.filter((m) => m.senderEmail !== userEmail && !m.read)
      return count + unreadMessages.length
    }, 0)
  }

  const getChatByActivityAndUsers = (activityId: number, user1Email: string, user2Email: string): Chat | undefined => {
    return chats.find(
      (c) =>
        c.activityId === activityId &&
        c.participants.some((p) => p.email === user1Email) &&
        c.participants.some((p) => p.email === user2Email),
    )
  }

  return (
    <ChatContext.Provider
      value={{
        chats,
        createChat,
        sendMessage,
        markMessagesAsRead,
        getChatById,
        getChatsByUser,
        getUnreadCount,
        getChatByActivityAndUsers,
      }}
    >
      {children}
    </ChatContext.Provider>
  )
}

export function useChat() {
  const context = useContext(ChatContext)
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider")
  }
  return context
}
