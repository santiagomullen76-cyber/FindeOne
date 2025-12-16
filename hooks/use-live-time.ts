"use client"

import { useState, useEffect } from "react"

export interface LiveTime {
  time: string
  date: string
  timezone: string
}

export function useLiveTime(): LiveTime {
  const [liveTime, setLiveTime] = useState<LiveTime>(() => {
    const now = new Date()
    return {
      time: now.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit", hour12: false }),
      date: now.toLocaleDateString("es-AR", { weekday: "short", day: "numeric", month: "short" }),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    }
  })

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      setLiveTime({
        time: now.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit", hour12: false }),
        date: now.toLocaleDateString("es-AR", { weekday: "short", day: "numeric", month: "short" }),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      })
    }

    const intervalId = setInterval(updateTime, 1000)
    return () => clearInterval(intervalId)
  }, [])

  return liveTime
}
