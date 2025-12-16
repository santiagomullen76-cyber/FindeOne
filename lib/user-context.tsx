"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

export interface UserProfile {
  id: string
  email: string
  name: string
  lastName: string
  phone: string
  birthDate: string
  gender: string
  bio: string
  avatar: string | null
  location: string
  isVerified: boolean
  verificationCode?: string
  createdAt: string
  stats: {
    activitiesCreated: number
    activitiesJoined: number
    connections: number
  }
  interests: string[]
  ratings: UserRating[]
  averageRating: number
  attendanceStats: {
    totalActivities: number
    attended: number
    onTime: number
    attendanceRate: number
    punctualityRate: number
  }
}

export interface UserRating {
  id: string
  fromUserId: string
  fromUserName: string
  fromUserAvatar: string
  rating: number
  comment: string
  activityName: string
  attended: boolean
  onTime: boolean
  createdAt: string
}

interface UserContextType {
  user: UserProfile | null
  isLoggedIn: boolean
  isLoading: boolean
  demoCode: string | null
  login: (email: string, password: string) => Promise<boolean>
  register: (userData: RegisterData) => Promise<{ success: boolean; message: string }>
  verifyEmail: (code: string) => Promise<boolean>
  resendVerification: () => Promise<boolean>
  requestPasswordReset: (email: string) => Promise<{ success: boolean; message: string }>
  resetPassword: (email: string, code: string, newPassword: string) => Promise<boolean>
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; message: string }>
  logout: () => void
  updateProfile: (data: Partial<UserProfile>) => void
  rateUser: (
    userId: string,
    rating: number,
    comment: string,
    activityName: string,
    attended: boolean,
    onTime: boolean,
  ) => void
  getUserRating: (userEmail: string) => number
}

export interface RegisterData {
  email: string
  password: string
  name: string
  lastName: string
  phone: string
  birthDate: string
  gender: string
  bio: string
  avatar: string | null
  location: string
  interests: string[]
}

const UserContext = createContext<UserContextType | undefined>(undefined)

// Simulated users database
const loadUsersFromStorage = (): Map<string, UserProfile & { password: string }> => {
  if (typeof window === "undefined") return new Map()
  try {
    const stored = localStorage.getItem("findone_users")
    if (stored) {
      const parsed = JSON.parse(stored)
      return new Map(Object.entries(parsed))
    }
  } catch (error) {
    console.error("[FindOne] Error loading users:", error)
  }
  return new Map()
}

const saveUsersToStorage = (users: Map<string, UserProfile & { password: string }>) => {
  if (typeof window === "undefined") return
  try {
    const obj = Object.fromEntries(users)
    localStorage.setItem("findone_users", JSON.stringify(obj))
  } catch (error) {
    console.error("[FindOne] Error saving users:", error)
  }
}

const loadRatingsFromStorage = (): Map<string, UserRating[]> => {
  const ratingsMap = new Map<string, UserRating[]>()
  const users = loadUsersFromStorage()

  users.forEach((user, email) => {
    if (user.ratings && user.ratings.length > 0) {
      ratingsMap.set(email, user.ratings)
    }
  })

  return ratingsMap
}

const mockUsers: Map<string, UserProfile & { password: string }> = loadUsersFromStorage()
const userRatings: Map<string, UserRating[]> = loadRatingsFromStorage()

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [demoCode, setDemoCode] = useState<string | null>(null)

  const generateVerificationCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString()
  }

  const sendVerificationEmail = async (email: string, code: string): Promise<boolean> => {
    try {
      const response = await fetch("/api/send-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      })

      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        console.log("[FindOne] API no disponible, usando modo demo")
        setDemoCode(code)
        return true
      }

      const data = await response.json()

      if (data.demo || !data.success) {
        setDemoCode(code)
      }

      return true
    } catch (error) {
      console.log("[FindOne] Error en API, usando modo demo:", error)
      setDemoCode(code)
      return true
    }
  }

  useEffect(() => {
    if (typeof window === "undefined") return
    try {
      const storedUser = localStorage.getItem("findone_current_user")
      if (storedUser) {
        setUser(JSON.parse(storedUser))
      }
    } catch (error) {
      console.error("[FindOne] Error loading current user:", error)
    }
  }, [])

  useEffect(() => {
    if (typeof window === "undefined") return
    try {
      if (user) {
        localStorage.setItem("findone_current_user", JSON.stringify(user))
      } else {
        localStorage.removeItem("findone_current_user")
      }
    } catch (error) {
      console.error("[FindOne] Error saving current user:", error)
    }
  }, [user])

  const register = async (userData: RegisterData): Promise<{ success: boolean; message: string }> => {
    setIsLoading(true)
    setDemoCode(null)

    await new Promise((resolve) => setTimeout(resolve, 1000))

    if (mockUsers.has(userData.email)) {
      setIsLoading(false)
      return { success: false, message: "Este email ya está registrado" }
    }

    const verificationCode = generateVerificationCode()
    const newUser: UserProfile & { password: string } = {
      id: `user_${Date.now()}`,
      email: userData.email,
      password: userData.password,
      name: userData.name,
      lastName: userData.lastName,
      phone: userData.phone,
      birthDate: userData.birthDate,
      gender: userData.gender,
      bio: userData.bio,
      avatar: userData.avatar,
      location: userData.location,
      isVerified: false,
      verificationCode,
      createdAt: new Date().toISOString(),
      stats: {
        activitiesCreated: 0,
        activitiesJoined: 0,
        connections: 0,
      },
      interests: userData.interests,
      ratings: [],
      averageRating: 0,
      attendanceStats: {
        totalActivities: 0,
        attended: 0,
        onTime: 0,
        attendanceRate: 100,
        punctualityRate: 100,
      },
    }

    mockUsers.set(userData.email, newUser)
    saveUsersToStorage(mockUsers)

    const { password, ...userWithoutPassword } = newUser
    setUser(userWithoutPassword)

    await sendVerificationEmail(userData.email, verificationCode)

    setIsLoading(false)
    return { success: true, message: `Código de verificación enviado a ${userData.email}` }
  }

  const verifyEmail = async (code: string): Promise<boolean> => {
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 500))

    if (user && user.verificationCode === code) {
      const updatedUser = { ...user, isVerified: true, verificationCode: undefined }
      setUser(updatedUser)
      setDemoCode(null)

      const storedUser = mockUsers.get(user.email)
      if (storedUser) {
        mockUsers.set(user.email, { ...storedUser, isVerified: true })
        saveUsersToStorage(mockUsers)
      }

      setIsLoading(false)
      return true
    }

    setIsLoading(false)
    return false
  }

  const resendVerification = async (): Promise<boolean> => {
    if (!user) return false

    setIsLoading(true)
    setDemoCode(null)
    await new Promise((resolve) => setTimeout(resolve, 500))

    const newCode = generateVerificationCode()
    const updatedUser = { ...user, verificationCode: newCode }
    setUser(updatedUser)

    const storedUser = mockUsers.get(user.email)
    if (storedUser) {
      mockUsers.set(user.email, { ...storedUser, verificationCode: newCode })
      saveUsersToStorage(mockUsers)
    }

    await sendVerificationEmail(user.email, newCode)

    setIsLoading(false)
    return true
  }

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true)
    setDemoCode(null)
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const storedUser = mockUsers.get(email)
    if (storedUser && storedUser.password === password) {
      const { password: _, ...userWithoutPassword } = storedUser
      setUser(userWithoutPassword)
      setIsLoading(false)
      return true
    }

    setIsLoading(false)
    return false
  }

  const logout = () => {
    setUser(null)
    setDemoCode(null)
  }

  const updateProfile = (data: Partial<UserProfile>) => {
    if (user) {
      const updatedUser = { ...user, ...data }
      setUser(updatedUser)

      const storedUser = mockUsers.get(user.email)
      if (storedUser) {
        mockUsers.set(user.email, { ...storedUser, ...data })
        saveUsersToStorage(mockUsers)
      }
    }
  }

  const rateUser = (
    userEmail: string,
    rating: number,
    comment: string,
    activityName: string,
    attended: boolean,
    onTime: boolean,
  ) => {
    if (!user) return

    const newRating: UserRating = {
      id: `rating_${Date.now()}`,
      fromUserId: user.id,
      fromUserName: `${user.name} ${user.lastName}`,
      fromUserAvatar: user.avatar || "",
      rating,
      comment,
      activityName,
      attended,
      onTime,
      createdAt: new Date().toISOString(),
    }

    // Store rating globally
    const existingRatings = userRatings.get(userEmail) || []
    userRatings.set(userEmail, [...existingRatings, newRating])

    // Update stored user's ratings if they exist
    const targetUser = mockUsers.get(userEmail)
    if (targetUser) {
      const updatedRatings = [...targetUser.ratings, newRating]
      const avgRating = updatedRatings.reduce((sum, r) => sum + r.rating, 0) / updatedRatings.length

      // Update attendance stats
      const totalActivities = targetUser.attendanceStats.totalActivities + 1
      const attendedCount = targetUser.attendanceStats.attended + (attended ? 1 : 0)
      const onTimeCount = targetUser.attendanceStats.onTime + (onTime ? 1 : 0)

      mockUsers.set(userEmail, {
        ...targetUser,
        ratings: updatedRatings,
        averageRating: avgRating,
        attendanceStats: {
          totalActivities,
          attended: attendedCount,
          onTime: onTimeCount,
          attendanceRate: Math.round((attendedCount / totalActivities) * 100),
          punctualityRate: attendedCount > 0 ? Math.round((onTimeCount / attendedCount) * 100) : 100,
        },
      })
      saveUsersToStorage(mockUsers)
    }

    console.log(`[FindOne] Usuario ${user.name} calificó a ${userEmail} con ${rating} estrellas`)
  }

  const getUserRating = (userEmail: string): number => {
    const storedUser = mockUsers.get(userEmail)
    if (storedUser && storedUser.averageRating > 0) {
      return storedUser.averageRating
    }

    const ratings = userRatings.get(userEmail) || []
    if (ratings.length === 0) return 0
    return ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
  }

  const requestPasswordReset = async (email: string): Promise<{ success: boolean; message: string }> => {
    setIsLoading(true)
    setDemoCode(null)

    await new Promise((resolve) => setTimeout(resolve, 1000))

    const storedUser = mockUsers.get(email)
    if (!storedUser) {
      setIsLoading(false)
      return { success: false, message: "No existe una cuenta con este email" }
    }

    const recoveryCode = generateVerificationCode()
    mockUsers.set(email, { ...storedUser, verificationCode: recoveryCode })
    saveUsersToStorage(mockUsers)

    await sendVerificationEmail(email, recoveryCode)

    setIsLoading(false)
    return { success: true, message: `Código de recuperación enviado a ${email}` }
  }

  const resetPassword = async (email: string, code: string, newPassword: string): Promise<boolean> => {
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 500))

    const storedUser = mockUsers.get(email)
    if (storedUser && storedUser.verificationCode === code) {
      mockUsers.set(email, { ...storedUser, password: newPassword, verificationCode: undefined })
      saveUsersToStorage(mockUsers)
      setDemoCode(null)
      setIsLoading(false)
      return true
    }

    setIsLoading(false)
    return false
  }

  const changePassword = async (
    currentPassword: string,
    newPassword: string,
  ): Promise<{ success: boolean; message: string }> => {
    if (!user) {
      return { success: false, message: "Debes iniciar sesión primero" }
    }

    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 500))

    const storedUser = mockUsers.get(user.email)
    if (!storedUser || storedUser.password !== currentPassword) {
      setIsLoading(false)
      return { success: false, message: "La contraseña actual es incorrecta" }
    }

    mockUsers.set(user.email, { ...storedUser, password: newPassword })
    saveUsersToStorage(mockUsers)

    setIsLoading(false)
    return { success: true, message: "Contraseña actualizada exitosamente" }
  }

  return (
    <UserContext.Provider
      value={{
        user,
        isLoggedIn: !!user,
        isLoading,
        demoCode,
        login,
        register,
        verifyEmail,
        resendVerification,
        requestPasswordReset,
        resetPassword,
        changePassword,
        logout,
        updateProfile,
        rateUser,
        getUserRating,
      }}
    >
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider")
  }
  return context
}
