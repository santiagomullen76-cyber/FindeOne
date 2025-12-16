"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

export interface ParticipantRequest {
  oderId: string
  userEmail: string
  userName: string
  userAvatar: string
  userRating: number
  status: "pending" | "approved" | "rejected"
  requestedAt: Date
}

export interface AttendanceRecord {
  oderId: string
  userEmail: string
  attended: boolean
  onTime: boolean
  ratedBy: string[] // Track who has rated this user
}

export interface Activity {
  id: number
  user: { name: string; avatar: string; initials: string; email?: string }
  activity: string
  category: string
  subcategory: string
  time: string
  location: string
  coordinates: { lat: number; lng: number }
  spots: number
  notes?: string
  skillLevel?: number
  createdAt: Date
  participants: string[]
  participantRequests: ParticipantRequest[]
  attendanceRecords: AttendanceRecord[]
  isCompleted: boolean
}

interface ActivitiesContextType {
  activities: Activity[]
  addActivity: (
    activity: Omit<
      Activity,
      "id" | "createdAt" | "participants" | "participantRequests" | "attendanceRecords" | "isCompleted"
    >,
  ) => void
  requestToJoin: (
    activityId: number,
    userEmail: string,
    userName: string,
    userAvatar: string,
    userRating: number,
  ) => boolean
  approveRequest: (activityId: number, userEmail: string) => void
  rejectRequest: (activityId: number, userEmail: string) => void
  cancelRequest: (activityId: number, userEmail: string) => void
  leaveActivity: (activityId: number, userId: string) => void
  isUserJoined: (activityId: number, userId: string) => boolean
  getUserRequestStatus: (activityId: number, userEmail: string) => "none" | "pending" | "approved" | "rejected"
  getAvailableSpots: (activityId: number) => number
  getPendingRequests: (activityId: number) => ParticipantRequest[]
  markAttendance: (activityId: number, userEmail: string, attended: boolean, onTime: boolean) => void
  completeActivity: (activityId: number) => void
  getActivitiesByCreator: (userEmail: string) => Activity[]
  getActivitiesJoinedBy: (userEmail: string) => Activity[]
  getMyRequests: (userEmail: string) => { activity: Activity; request: ParticipantRequest }[]
  getPendingRequestsForMyActivities: (userEmail: string) => { activity: Activity; request: ParticipantRequest }[]
}

const ActivitiesContext = createContext<ActivitiesContextType | undefined>(undefined)

const initialActivities: Activity[] = [
  {
    id: 1,
    user: { name: "Martín García", avatar: "/young-man-smiling.png", initials: "MG", email: "martin@example.com" },
    activity: "Busco compañero para partido de tenis",
    category: "sports",
    subcategory: "Tenis",
    skillLevel: 3,
    time: "Hoy 19:00 hs",
    location: "Club Palermo, CABA",
    coordinates: { lat: -34.5794, lng: -58.4218 },
    spots: 1,
    participants: [],
    participantRequests: [],
    attendanceRecords: [],
    isCompleted: false,
    createdAt: new Date(),
  },
  {
    id: 2,
    user: { name: "Lucía Fernández", avatar: "/young-woman-smiling.png", initials: "LF", email: "lucia@example.com" },
    activity: "Nos falta uno para fútbol 5 mañana",
    category: "sports",
    subcategory: "Fútbol",
    skillLevel: 2,
    time: "Mañana 20:00 hs",
    location: "Cancha El Gol, Belgrano",
    coordinates: { lat: -34.5614, lng: -58.4569 },
    spots: 1,
    participants: [],
    participantRequests: [],
    attendanceRecords: [],
    isCompleted: false,
    createdAt: new Date(),
  },
  {
    id: 3,
    user: { name: "Pablo Méndez", avatar: "/thoughtful-man-glasses.png", initials: "PM", email: "pablo@example.com" },
    activity: "¿Alguien quiere ir al cine esta noche?",
    category: "leisure",
    subcategory: "Cine",
    time: "Hoy 21:30 hs",
    location: "Cinemark Palermo",
    coordinates: { lat: -34.5833, lng: -58.4167 },
    spots: 3,
    participants: [],
    participantRequests: [],
    attendanceRecords: [],
    isCompleted: false,
    createdAt: new Date(),
  },
  {
    id: 4,
    user: { name: "Ana Torres", avatar: "/woman-reading-book.jpg", initials: "AT", email: "ana@example.com" },
    activity: "Busco gente para leer en una plaza",
    category: "studies",
    subcategory: "Grupos de lectura",
    time: "Sábado 16:00 hs",
    location: "Plaza Francia, Recoleta",
    coordinates: { lat: -34.5858, lng: -58.3932 },
    spots: 5,
    participants: [],
    participantRequests: [],
    attendanceRecords: [],
    isCompleted: false,
    createdAt: new Date(),
  },
  {
    id: 5,
    user: { name: "Diego Ruiz", avatar: "/traveler-man-with-backpack.jpg", initials: "DR", email: "diego@example.com" },
    activity: "Busco compañero de viaje a Bariloche",
    category: "travel",
    subcategory: "Compañero de viaje",
    time: "15-20 Enero",
    location: "Desde Buenos Aires",
    coordinates: { lat: -34.6037, lng: -58.3816 },
    spots: 1,
    participants: [],
    participantRequests: [],
    attendanceRecords: [],
    isCompleted: false,
    createdAt: new Date(),
  },
]

const loadActivitiesFromStorage = (): Activity[] => {
  if (typeof window === "undefined") return initialActivities
  try {
    const stored = localStorage.getItem("findone_activities")
    if (stored) {
      const parsed = JSON.parse(stored)
      // Convert date strings back to Date objects
      return parsed.map((a: any) => ({
        ...a,
        createdAt: new Date(a.createdAt),
        participantRequests: a.participantRequests.map((r: any) => ({
          ...r,
          requestedAt: new Date(r.requestedAt),
        })),
      }))
    }
  } catch (error) {
    console.error("[FindOne] Error loading activities:", error)
  }
  return initialActivities
}

export function ActivitiesProvider({ children }: { children: ReactNode }) {
  const [activities, setActivities] = useState<Activity[]>(loadActivitiesFromStorage())

  useEffect(() => {
    if (typeof window === "undefined") return
    try {
      localStorage.setItem("findone_activities", JSON.stringify(activities))
    } catch (error) {
      console.error("[FindOne] Error saving activities:", error)
    }
  }, [activities])

  const addActivity = (
    activity: Omit<
      Activity,
      "id" | "createdAt" | "participants" | "participantRequests" | "attendanceRecords" | "isCompleted"
    >,
  ) => {
    const newActivity: Activity = {
      ...activity,
      id: Date.now(),
      createdAt: new Date(),
      participants: [],
      participantRequests: [],
      attendanceRecords: [],
      isCompleted: false,
    }
    setActivities((prev) => [newActivity, ...prev])
  }

  const requestToJoin = (
    activityId: number,
    userEmail: string,
    userName: string,
    userAvatar: string,
    userRating: number,
  ): boolean => {
    const activity = activities.find((a) => a.id === activityId)
    if (!activity) return false

    // Check if user already has a request
    const existingRequest = activity.participantRequests.find((r) => r.userEmail === userEmail)
    if (existingRequest) return false

    // Check if already a participant
    if (activity.participants.includes(userEmail)) return false

    const availableSpots = activity.spots - activity.participants.length
    if (availableSpots <= 0) return false

    const newRequest: ParticipantRequest = {
      oderId: `req_${Date.now()}`,
      userEmail,
      userName,
      userAvatar,
      userRating,
      status: "pending",
      requestedAt: new Date(),
    }

    setActivities((prev) =>
      prev.map((a) =>
        a.id === activityId ? { ...a, participantRequests: [...a.participantRequests, newRequest] } : a,
      ),
    )
    return true
  }

  const approveRequest = (activityId: number, userEmail: string) => {
    setActivities((prev) =>
      prev.map((a) => {
        if (a.id !== activityId) return a

        const updatedRequests = a.participantRequests.map((r) =>
          r.userEmail === userEmail ? { ...r, status: "approved" as const } : r,
        )

        return {
          ...a,
          participantRequests: updatedRequests,
          participants: [...a.participants, userEmail],
        }
      }),
    )

    if (typeof window !== "undefined") {
      const activity = activities.find((a) => a.id === activityId)
      const request = activity?.participantRequests.find((r) => r.userEmail === userEmail)
      if (activity && request) {
        window.dispatchEvent(
          new CustomEvent("createChatForApprovedRequest", {
            detail: { activity, request },
          }),
        )
      }
    }
  }

  const rejectRequest = (activityId: number, userEmail: string) => {
    setActivities((prev) =>
      prev.map((a) => {
        if (a.id !== activityId) return a

        const updatedRequests = a.participantRequests.map((r) =>
          r.userEmail === userEmail ? { ...r, status: "rejected" as const } : r,
        )

        return { ...a, participantRequests: updatedRequests }
      }),
    )
  }

  const cancelRequest = (activityId: number, userEmail: string) => {
    setActivities((prev) =>
      prev.map((a) => {
        if (a.id !== activityId) return a

        return {
          ...a,
          participantRequests: a.participantRequests.filter((r) => r.userEmail !== userEmail),
          participants: a.participants.filter((p) => p !== userEmail),
        }
      }),
    )
  }

  const leaveActivity = (activityId: number, userId: string) => {
    setActivities((prev) =>
      prev.map((a) => {
        if (a.id !== activityId) return a

        return {
          ...a,
          participants: a.participants.filter((p) => p !== userId),
          participantRequests: a.participantRequests.filter((r) => r.userEmail !== userId),
        }
      }),
    )
  }

  const isUserJoined = (activityId: number, userId: string): boolean => {
    const activity = activities.find((a) => a.id === activityId)
    return activity?.participants.includes(userId) ?? false
  }

  const getUserRequestStatus = (
    activityId: number,
    userEmail: string,
  ): "none" | "pending" | "approved" | "rejected" => {
    const activity = activities.find((a) => a.id === activityId)
    if (!activity) return "none"

    const request = activity.participantRequests.find((r) => r.userEmail === userEmail)
    return request?.status ?? "none"
  }

  const getAvailableSpots = (activityId: number): number => {
    const activity = activities.find((a) => a.id === activityId)
    if (!activity) return 0
    return activity.spots - activity.participants.length
  }

  const getPendingRequests = (activityId: number): ParticipantRequest[] => {
    const activity = activities.find((a) => a.id === activityId)
    if (!activity) return []
    return activity.participantRequests.filter((r) => r.status === "pending")
  }

  const markAttendance = (activityId: number, userEmail: string, attended: boolean, onTime: boolean) => {
    setActivities((prev) =>
      prev.map((a) => {
        if (a.id !== activityId) return a

        const existingRecord = a.attendanceRecords.find((r) => r.userEmail === userEmail)
        if (existingRecord) {
          return {
            ...a,
            attendanceRecords: a.attendanceRecords.map((r) =>
              r.userEmail === userEmail ? { ...r, attended, onTime } : r,
            ),
          }
        }

        const newRecord: AttendanceRecord = {
          oderId: `att_${Date.now()}`,
          userEmail,
          attended,
          onTime,
          ratedBy: [],
        }

        return { ...a, attendanceRecords: [...a.attendanceRecords, newRecord] }
      }),
    )
  }

  const completeActivity = (activityId: number) => {
    setActivities((prev) => prev.map((a) => (a.id === activityId ? { ...a, isCompleted: true } : a)))
  }

  const getActivitiesByCreator = (userEmail: string): Activity[] => {
    return activities.filter((a) => a.user.email === userEmail)
  }

  const getActivitiesJoinedBy = (userEmail: string): Activity[] => {
    return activities.filter((a) => a.participants.includes(userEmail))
  }

  const getMyRequests = (userEmail: string): { activity: Activity; request: ParticipantRequest }[] => {
    const results: { activity: Activity; request: ParticipantRequest }[] = []
    activities.forEach((activity) => {
      const request = activity.participantRequests.find((r) => r.userEmail === userEmail)
      if (request) {
        results.push({ activity, request })
      }
    })
    return results
  }

  const getPendingRequestsForMyActivities = (
    userEmail: string,
  ): { activity: Activity; request: ParticipantRequest }[] => {
    const results: { activity: Activity; request: ParticipantRequest }[] = []
    activities.forEach((activity) => {
      if (activity.user.email === userEmail) {
        activity.participantRequests
          .filter((r) => r.status === "pending")
          .forEach((request) => {
            results.push({ activity, request })
          })
      }
    })
    return results
  }

  return (
    <ActivitiesContext.Provider
      value={{
        activities,
        addActivity,
        requestToJoin,
        approveRequest,
        rejectRequest,
        cancelRequest,
        leaveActivity,
        isUserJoined,
        getUserRequestStatus,
        getAvailableSpots,
        getPendingRequests,
        markAttendance,
        completeActivity,
        getActivitiesByCreator,
        getActivitiesJoinedBy,
        getMyRequests,
        getPendingRequestsForMyActivities,
      }}
    >
      {children}
    </ActivitiesContext.Provider>
  )
}

export function useActivities() {
  const context = useContext(ActivitiesContext)
  if (!context) {
    throw new Error("useActivities must be used within an ActivitiesProvider")
  }
  return context
}
