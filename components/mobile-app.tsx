"use client"

import { useState, useEffect } from "react"
import { HomeScreen } from "./screens/home-screen"
import { CategoriesScreen } from "./screens/categories-screen"
import { CreateScreen } from "./screens/create-screen"
import { ActivitiesScreen } from "./screens/activities-screen"
import { ProfileScreen } from "./screens/profile-screen"
import { AuthScreen } from "./screens/auth-screen"
import { MessagesScreen } from "./screens/messages-screen"
import { BottomNav } from "./bottom-nav"
import { ThemeToggle } from "./theme-toggle"
import { UserProvider, useUser } from "@/lib/user-context"
import { ActivitiesProvider } from "@/lib/activities-context"
import { I18nProvider } from "@/lib/i18n-context"
import { ChatProvider, useChat } from "@/lib/chat-context"
import { ThemeProvider, useTheme } from "@/lib/theme-context"
import { useLiveTime } from "@/hooks/use-live-time"

export type Screen = "home" | "categories" | "create" | "activities" | "messages" | "profile" | "auth"

function MobileAppContent() {
  const { isLoggedIn, user } = useUser()
  const { createChat } = useChat()
  const { isDark, setTheme } = useTheme()
  const { time } = useLiveTime()
  const [currentScreen, setCurrentScreen] = useState<Screen>(isLoggedIn ? "home" : "auth")
  const [categoryFilter, setCategoryFilter] = useState<{ category: string; subcategory: string } | null>(null)

  useEffect(() => {
    const handleCreateChat = (event: any) => {
      const { activity, request } = event.detail
      if (user && activity.user.email) {
        createChat(
          activity.id,
          activity.activity,
          {
            email: activity.user.email,
            name: activity.user.name,
            avatar: activity.user.avatar,
          },
          {
            email: request.userEmail,
            name: request.userName,
            avatar: request.userAvatar,
          },
        )
      }
    }

    window.addEventListener("createChatForApprovedRequest", handleCreateChat)
    return () => window.removeEventListener("createChatForApprovedRequest", handleCreateChat)
  }, [user, createChat])

  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark")
  }

  const handleAuthComplete = () => {
    setCurrentScreen("home")
  }

  const handleLogout = () => {
    setCurrentScreen("auth")
  }

  const handleCreateComplete = () => {
    setCurrentScreen("home")
  }

  const handleNavigation = (screen: Screen, filter?: { category: string; subcategory: string }) => {
    setCurrentScreen(screen)
    if (filter) {
      setCategoryFilter(filter)
    } else {
      setCategoryFilter(null)
    }
  }

  if (currentScreen === "auth" || !isLoggedIn) {
    return (
      <div
        className={`relative w-full max-w-[390px] h-[844px] bg-background rounded-[40px] shadow-2xl overflow-hidden border border-border ${isDark ? "dark" : ""}`}
      >
        {/* Status Bar */}
        <div className="flex items-center justify-between px-6 pt-3 pb-2 bg-card">
          <span className="text-sm font-semibold text-foreground">{time}</span>
          <div className="flex items-center gap-1">
            <ThemeToggle isDark={isDark} onToggle={toggleTheme} />
            <svg className="w-4 h-4 text-foreground" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 3C7.46 3 3.34 4.78.29 7.67c-.18.18-.29.43-.29.71 0 .28.11.53.29.71l2.48 2.48c.18.18.43.29.71.29.27 0 .52-.11.7-.28.79-.74 1.69-1.36 2.66-1.85.63-.32 1.08-.96 1.08-1.69V4.59c1.33-.38 2.73-.59 4.18-.59s2.85.21 4.18.59v2.83c0 .73.45 1.37 1.08 1.69.97.49 1.87 1.12 2.66 1.85.18.18.43.28.7.28.28 0 .53-.11.71-.29l2.48-2.48c.18-.18.29-.43.29-.71 0-.28-.11-.53-.29-.71C20.66 4.78 16.54 3 12 3z" />
            </svg>
            <svg className="w-4 h-4 text-foreground" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17 4h-3V2h-4v2H7v18h10V4z" />
            </svg>
          </div>
        </div>

        {/* Auth Screen Content */}
        <div className="h-[calc(100%-60px)] overflow-y-auto">
          <AuthScreen onComplete={handleAuthComplete} />
        </div>

        {/* Home Indicator */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-foreground/20 rounded-full" />
      </div>
    )
  }

  return (
    <div
      className={`relative w-full max-w-[390px] h-[844px] bg-background rounded-[40px] shadow-2xl overflow-hidden border border-border ${isDark ? "dark" : ""}`}
    >
      {/* Status Bar */}
      <div className="flex items-center justify-between px-6 pt-3 pb-2 bg-card">
        <span className="text-sm font-semibold text-foreground">{time}</span>
        <div className="flex items-center gap-1">
          <ThemeToggle isDark={isDark} onToggle={toggleTheme} />
          <svg className="w-4 h-4 text-foreground" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 3C7.46 3 3.34 4.78.29 7.67c-.18.18-.29.43-.29.71 0 .28.11.53.29.71l2.48 2.48c.18.18.43.29.71.29.27 0 .52-.11.7-.28.79-.74 1.69-1.36 2.66-1.85.63-.32 1.08-.96 1.08-1.69V4.59c1.33-.38 2.73-.59 4.18-.59s2.85.21 4.18.59v2.83c0 .73.45 1.37 1.08 1.69.97.49 1.87 1.12 2.66 1.85.18.18.43.28.7.28.28 0 .53-.11.71-.29l2.48-2.48c.18-.18.29-.43.29-.71 0-.28-.11-.53-.29-.71C20.66 4.78 16.54 3 12 3z" />
          </svg>
          <svg className="w-4 h-4 text-foreground" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17 4h-3V2h-4v2H7v18h10V4z" />
          </svg>
        </div>
      </div>

      {/* Screen Content */}
      <div className="h-[calc(100%-140px)] overflow-y-auto">
        {currentScreen === "home" && <HomeScreen initialFilter={categoryFilter} onNavigate={handleNavigation} />}
        {currentScreen === "categories" && <CategoriesScreen onNavigate={handleNavigation} />}
        {currentScreen === "create" && <CreateScreen onComplete={handleCreateComplete} />}
        {currentScreen === "activities" && <ActivitiesScreen />}
        {currentScreen === "messages" && <MessagesScreen />}
        {currentScreen === "profile" && <ProfileScreen onLogout={handleLogout} />}
      </div>

      {/* Bottom Navigation */}
      <BottomNav currentScreen={currentScreen} onNavigate={handleNavigation} />

      {/* Home Indicator */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-foreground/20 rounded-full" />
    </div>
  )
}

export function MobileApp() {
  return (
    <ThemeProvider>
      <I18nProvider>
        <UserProvider>
          <ActivitiesProvider>
            <ChatProvider>
              <MobileAppContent />
            </ChatProvider>
          </ActivitiesProvider>
        </UserProvider>
      </I18nProvider>
    </ThemeProvider>
  )
}
