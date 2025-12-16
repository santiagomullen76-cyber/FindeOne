"use client"

import { useState, useEffect } from "react"

export interface Coordinates {
  lat: number
  lng: number
}

export interface GeolocationState {
  coordinates: Coordinates | null
  error: string | null
  loading: boolean
}

// Calcula la distancia en km entre dos puntos usando la fórmula de Haversine
export function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371 // Radio de la Tierra en km
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) * Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

export function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)} m`
  }
  return `${km.toFixed(1)} km`
}

export function useGeolocation(): GeolocationState {
  const [state, setState] = useState<GeolocationState>({
    coordinates: null,
    error: null,
    loading: true,
  })

  useEffect(() => {
    if (!navigator.geolocation) {
      setState({
        coordinates: null,
        error: "Geolocalización no soportada",
        loading: false,
      })
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          coordinates: {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          },
          error: null,
          loading: false,
        })
      },
      (error) => {
        // Usar ubicación por defecto (Buenos Aires) si no hay permiso
        setState({
          coordinates: { lat: -34.6037, lng: -58.3816 },
          error: null,
          loading: false,
        })
      },
      { enableHighAccuracy: true, timeout: 10000 },
    )
  }, [])

  return state
}
