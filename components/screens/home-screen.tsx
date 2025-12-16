"use client"

import { useState, useMemo, useEffect } from "react"
import {
  Search,
  MapPin,
  Clock,
  Users,
  Navigation,
  Map,
  Check,
  UserPlus,
  Hourglass,
  Star,
  Dumbbell,
  Bell,
  MessageCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { FindOneLogo } from "@/components/findone-logo"
import { CategoryFilter } from "@/components/category-filter"
import { useGeolocation, calculateDistance, formatDistance } from "@/hooks/use-geolocation"
import { MapView } from "@/components/map-view"
import { useActivities } from "@/lib/activities-context"
import { useUser } from "@/lib/user-context"
import { useChat } from "@/lib/chat-context" // Added useChat import
import { NotificationsPanel } from "@/components/notifications-panel"
import { getUserInitials } from "@/lib/utils"

const categoryColors: Record<string, string> = {
  sports: "bg-sports/10 text-sports border-sports/20",
  travel: "bg-travel/10 text-travel border-travel/20",
  leisure: "bg-leisure/10 text-leisure border-leisure/20",
  studies: "bg-studies/10 text-studies border-studies/20",
}

const categoryLabels: Record<string, string> = {
  sports: "Deportes",
  travel: "Viajes",
  leisure: "Ocio",
  studies: "Estudios",
}

const skillLevelLabels: Record<number, string> = {
  1: "Principiante",
  2: "Básico",
  3: "Intermedio",
  4: "Avanzado",
  5: "Experto",
}

export function HomeScreen({
  initialFilter,
  onNavigate,
}: {
  initialFilter?: { category: string; subcategory: string } | null
  onNavigate?: (screen: string) => void // Added onNavigate prop
}) {
  const {
    activities,
    requestToJoin,
    cancelRequest,
    getUserRequestStatus,
    getAvailableSpots,
    getPendingRequestsForMyActivities,
  } = useActivities()
  const { user, isLoggedIn, getUserRating } = useUser()
  const { getUnreadCount } = useChat() // Added useChat hook

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortByDistance, setSortByDistance] = useState(true)
  const [showMap, setShowMap] = useState(false)
  const [joiningId, setJoiningId] = useState<number | null>(null)
  const [showLoginAlert, setShowLoginAlert] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const { coordinates: userCoords, loading: geoLoading } = useGeolocation()

  const [expandedNotes, setExpandedNotes] = useState<Record<number, boolean>>({}) // Added state to track expanded notes for each activity

  const myPendingRequests = user ? getPendingRequestsForMyActivities(user.email) : []
  const unreadMessagesCount = user ? getUnreadCount(user.email) : 0 // Get unread messages count

  const postsWithDistance = useMemo(() => {
    if (!userCoords) return activities.map((p) => ({ ...p, distance: null }))

    return activities.map((post) => ({
      ...post,
      distance: calculateDistance(userCoords.lat, userCoords.lng, post.coordinates.lat, post.coordinates.lng),
    }))
  }, [userCoords, activities])

  useEffect(() => {
    if (initialFilter) {
      setSelectedCategory(initialFilter.category)
      if (initialFilter.subcategory) {
        setSearchQuery(initialFilter.subcategory)
      }
    }
  }, [initialFilter])

  const filteredPosts = useMemo(() => {
    let posts = postsWithDistance.filter((post) => {
      if (selectedCategory && post.category !== selectedCategory) return false
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const matchesActivity = post.activity.toLowerCase().includes(query)
        const matchesSubcategory = post.subcategory?.toLowerCase().includes(query)
        if (!matchesActivity && !matchesSubcategory) return false
      }
      return true
    })

    if (sortByDistance && userCoords) {
      posts = [...posts].sort((a, b) => (a.distance ?? 0) - (b.distance ?? 0))
    }

    return posts
  }, [postsWithDistance, selectedCategory, searchQuery, sortByDistance, userCoords])

  const handleJoinActivity = async (activityId: number) => {
    if (!isLoggedIn || !user) {
      setShowLoginAlert(true)
      setTimeout(() => setShowLoginAlert(false), 3000)
      return
    }

    const userEmail = user.email
    const requestStatus = getUserRequestStatus(activityId, userEmail)

    setJoiningId(activityId)
    await new Promise((resolve) => setTimeout(resolve, 500))

    if (requestStatus === "pending" || requestStatus === "approved") {
      // Cancel request or leave activity
      cancelRequest(activityId, userEmail)
    } else {
      // Send join request
      const userRating = getUserRating(userEmail)
      requestToJoin(activityId, userEmail, `${user.name} ${user.lastName}`, user.avatar || "", userRating)
    }

    setJoiningId(null)
  }

  const getButtonState = (activityId: number) => {
    if (!user) return { status: "login", text: "Unirme", icon: UserPlus }

    const requestStatus = getUserRequestStatus(activityId, user.email)
    const availableSpots = getAvailableSpots(activityId)

    if (requestStatus === "approved") {
      return { status: "approved", text: "Ya estás unido", icon: Check }
    }
    if (requestStatus === "pending") {
      return { status: "pending", text: "Solicitud pendiente", icon: Hourglass }
    }
    if (requestStatus === "rejected") {
      return { status: "rejected", text: "Solicitud rechazada", icon: null }
    }
    if (availableSpots <= 0) {
      return { status: "full", text: "Actividad completa", icon: null }
    }
    return { status: "available", text: "Solicitar unirme", icon: UserPlus }
  }

  const toggleNotes = (activityId: number) => {
    setExpandedNotes((prev) => ({
      ...prev,
      [activityId]: !prev[activityId],
    }))
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {showMap && <MapView activities={filteredPosts} userLocation={userCoords} onClose={() => setShowMap(false)} />}

      <NotificationsPanel
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
        pendingRequests={myPendingRequests}
      />

      {showLoginAlert && (
        <div className="absolute top-16 left-4 right-4 z-50 bg-destructive text-destructive-foreground px-4 py-3 rounded-xl shadow-lg animate-in fade-in slide-in-from-top-2">
          <p className="text-sm font-medium text-center">Debes iniciar sesión para unirte a una actividad</p>
        </div>
      )}

      <div className="px-4 py-3 bg-card border-b border-border flex items-center justify-between">
        <FindOneLogo />
        {isLoggedIn && (
          <div className="flex items-center gap-2">
            {/* Messages icon */}
            <button
              onClick={() => onNavigate?.("messages")}
              className="relative p-2 hover:bg-secondary rounded-full transition-colors"
            >
              <MessageCircle className="w-6 h-6 text-muted-foreground" />
              {unreadMessagesCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1 animate-pulse">
                  {unreadMessagesCount}
                </span>
              )}
            </button>

            {/* Notifications bell */}
            <button
              onClick={() => setShowNotifications(true)}
              className="relative p-2 hover:bg-secondary rounded-full transition-colors"
            >
              <Bell className="w-6 h-6 text-muted-foreground" />
              {myPendingRequests.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1 animate-pulse">
                  {myPendingRequests.length}
                </span>
              )}
            </button>
          </div>
        )}
      </div>

      <div className="px-4 py-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar actividades..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-secondary rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
      </div>

      <CategoryFilter selected={selectedCategory} onSelect={setSelectedCategory} />

      <div className="px-4 pb-2 flex items-center gap-2">
        <button
          onClick={() => setSortByDistance(!sortByDistance)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
            sortByDistance ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
          }`}
        >
          <Navigation className="w-3.5 h-3.5" />
          {geoLoading ? "Localizando..." : sortByDistance ? "Ordenando por cercanía" : "Ordenar por cercanía"}
        </button>

        <button
          onClick={() => setShowMap(true)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-secondary text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
        >
          <Map className="w-3.5 h-3.5" />
          Ver mapa
        </button>
      </div>

      <div className="flex-1 px-4 py-2 space-y-3 overflow-y-auto">
        {filteredPosts.map((post) => {
          const buttonState = getButtonState(post.id)
          const isJoining = joiningId === post.id
          const isFull = buttonState.status === "full"
          const isRejected = buttonState.status === "rejected"
          const userRating = getUserRating(post.user.email || "")
          const isNotesExpanded = expandedNotes[post.id] || false // Check if notes are expanded for this activity

          return (
            <div
              key={post.id}
              className="bg-card rounded-2xl p-4 shadow-sm border border-border hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-3">
                <Avatar className="w-10 h-10 border-2 border-primary/20">
                  <AvatarImage src={post.user.avatar || "/placeholder.svg"} alt={post.user.name} />
                  <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
                    {getUserInitials(post.user.name, post.user.email?.split("@")[0])}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-semibold text-foreground text-sm">{post.user.name}</span>
                    <span className="flex items-center gap-0.5 text-xs text-amber-500">
                      <Star className="w-3 h-3 fill-amber-500" />
                      {userRating > 0 ? userRating.toFixed(1) : "5.0"}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${categoryColors[post.category]}`}>
                      {categoryLabels[post.category]}
                    </span>
                    {post.subcategory && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                        {post.subcategory}
                      </span>
                    )}
                  </div>
                  <p className="text-foreground font-medium mb-2">{post.activity}</p>
                  {post.category === "sports" && post.skillLevel && (
                    <div className="flex items-center gap-2 mb-2">
                      <span className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-sports/10 text-sports border border-sports/20">
                        <Dumbbell className="w-3 h-3" />
                        Nivel {post.skillLevel}: {skillLevelLabels[post.skillLevel]}
                        <span className="flex items-center ml-1">
                          {Array.from({ length: post.skillLevel }).map((_, i) => (
                            <Star key={i} className="w-2.5 h-2.5 fill-sports text-sports" />
                          ))}
                        </span>
                      </span>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {post.time}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {post.location}
                    </span>
                    <span className={`flex items-center gap-1 ${isFull ? "text-destructive" : ""}`}>
                      <Users className="w-3.5 h-3.5" />
                      {isFull
                        ? "Completo"
                        : `${getAvailableSpots(post.id)} lugar${getAvailableSpots(post.id) > 1 ? "es" : ""}`}
                    </span>
                    {post.distance !== null && (
                      <span className="flex items-center gap-1 text-primary font-medium">
                        <Navigation className="w-3.5 h-3.5" />
                        {formatDistance(post.distance)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              {post.notes && (
                <div className="mt-3 pt-3 border-t border-border">
                  <button
                    onClick={() => toggleNotes(post.id)}
                    className="flex items-center justify-between w-full text-left"
                  >
                    <span className="text-sm font-medium text-muted-foreground">Notas adicionales</span>
                    {isNotesExpanded ? (
                      <ChevronUp className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    )}
                  </button>
                  {isNotesExpanded && <p className="text-sm text-foreground mt-2 leading-relaxed">{post.notes}</p>}
                </div>
              )}
              <div className="mt-3 pt-3 border-t border-border">
                <Button
                  onClick={() => handleJoinActivity(post.id)}
                  disabled={isJoining || isFull || isRejected}
                  className={`w-full rounded-xl font-semibold transition-all ${
                    buttonState.status === "approved"
                      ? "bg-green-500 hover:bg-green-600 text-white"
                      : buttonState.status === "pending"
                        ? "bg-amber-500 hover:bg-amber-600 text-white"
                        : buttonState.status === "rejected"
                          ? "bg-destructive/20 text-destructive cursor-not-allowed"
                          : isFull
                            ? "bg-muted text-muted-foreground cursor-not-allowed"
                            : "bg-primary hover:bg-primary/90 text-primary-foreground"
                  }`}
                >
                  {isJoining ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Procesando...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      {buttonState.icon && <buttonState.icon className="w-4 h-4" />}
                      {buttonState.text}
                    </span>
                  )}
                </Button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
