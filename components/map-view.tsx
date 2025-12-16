"use client"

import { useEffect, useRef, useState } from "react"
import { X, Navigation, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Activity {
  id: number
  activity: string
  category: string
  location: string
  coordinates: { lat: number; lng: number }
  time: string
  spots: number
  distance?: number | null
  user: { name: string }
}

interface MapViewProps {
  activities: Activity[]
  userLocation: { lat: number; lng: number } | null
  onClose: () => void
  onSelectActivity?: (activity: Activity) => void
}

const categoryMarkerColors: Record<string, string> = {
  sports: "#22C55E",
  travel: "#F59E0B",
  leisure: "#EC4899",
  studies: "#8B5CF6",
}

const categoryLabels: Record<string, string> = {
  sports: "Deportes",
  travel: "Viajes",
  leisure: "Ocio",
  studies: "Estudios",
}

function loadLeaflet(): Promise<typeof import("leaflet")> {
  return new Promise((resolve, reject) => {
    // Check if already loaded
    if ((window as any).L) {
      resolve((window as any).L)
      return
    }

    // Load CSS
    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link")
      link.id = "leaflet-css"
      link.rel = "stylesheet"
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
      document.head.appendChild(link)
    }

    // Load JS
    const script = document.createElement("script")
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
    script.onload = () => resolve((window as any).L)
    script.onerror = reject
    document.head.appendChild(script)
  })
}

export function MapView({ activities, userLocation, onClose, onSelectActivity }: MapViewProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    async function initMap() {
      if (!mapContainerRef.current) return

      try {
        const L = await loadLeaflet()
        if (!isMounted || mapRef.current) return

        setIsLoading(false)

        const center = userLocation || { lat: -34.6037, lng: -58.3816 }

        const map = L.map(mapContainerRef.current, {
          center: [center.lat, center.lng],
          zoom: 13,
          zoomControl: false,
        })

        L.control.zoom({ position: "bottomright" }).addTo(map)

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        }).addTo(map)

        // Add user location marker
        if (userLocation) {
          const userIcon = L.divIcon({
            className: "user-marker",
            html: `<div style="width:20px;height:20px;background:#4A90E2;border:3px solid white;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,0.3);"></div>`,
            iconSize: [20, 20],
            iconAnchor: [10, 10],
          })
          L.marker([userLocation.lat, userLocation.lng], { icon: userIcon }).addTo(map).bindPopup("Tu ubicación")
        }

        // Add activity markers
        activities.forEach((activity) => {
          const color = categoryMarkerColors[activity.category] || "#4A90E2"
          const activityIcon = L.divIcon({
            className: "custom-marker",
            html: `
              <div style="width:36px;height:36px;background:${color};border-radius:50% 50% 50% 0;transform:rotate(-45deg);display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,0.3);border:2px solid white;">
                <span style="transform:rotate(45deg);color:white;font-weight:bold;font-size:14px;">${activity.spots}</span>
              </div>
            `,
            iconSize: [36, 36],
            iconAnchor: [18, 36],
          })

          const marker = L.marker([activity.coordinates.lat, activity.coordinates.lng], {
            icon: activityIcon,
          }).addTo(map)

          marker.on("click", () => {
            setSelectedActivity(activity)
          })
        })

        mapRef.current = map
      } catch (error) {
        console.error("Error loading map:", error)
        setIsLoading(false)
      }
    }

    initMap()

    return () => {
      isMounted = false
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [userLocation, activities])

  const centerOnUser = () => {
    if (mapRef.current && userLocation) {
      mapRef.current.setView([userLocation.lat, userLocation.lng], 14)
    }
  }

  return (
    <div className="absolute inset-0 z-50 bg-background flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-card border-b border-border">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-primary" />
          <span className="font-semibold text-foreground">Mapa de actividades</span>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-secondary hover:bg-secondary/80 transition-colors"
        >
          <X className="w-5 h-5 text-foreground" />
        </button>
      </div>

      {/* Map Container */}
      <div className="flex-1 relative">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background z-10">
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <span className="text-sm text-muted-foreground">Cargando mapa...</span>
            </div>
          </div>
        )}
        <div ref={mapContainerRef} className="w-full h-full" />

        {/* Legend */}
        <div className="absolute top-3 left-3 bg-card/95 backdrop-blur-sm rounded-xl p-3 shadow-lg border border-border z-[1000]">
          <p className="text-xs font-medium text-foreground mb-2">Categorías</p>
          <div className="space-y-1.5">
            {Object.entries(categoryMarkerColors).map(([key, color]) => (
              <div key={key} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                <span className="text-xs text-muted-foreground">{categoryLabels[key]}</span>
              </div>
            ))}
            <div className="flex items-center gap-2 pt-1 border-t border-border mt-1">
              <div className="w-3 h-3 rounded-full bg-primary border-2 border-white" />
              <span className="text-xs text-muted-foreground">Tu ubicación</span>
            </div>
          </div>
        </div>

        {/* User location button */}
        {userLocation && (
          <button
            onClick={centerOnUser}
            className="absolute bottom-24 right-3 w-10 h-10 bg-card rounded-full shadow-lg border border-border flex items-center justify-center hover:bg-secondary transition-colors z-[1000]"
          >
            <Navigation className="w-5 h-5 text-primary" />
          </button>
        )}
      </div>

      {/* Selected Activity Card */}
      {selectedActivity && (
        <div className="absolute bottom-20 left-3 right-3 bg-card rounded-2xl p-4 shadow-xl border border-border z-[1000]">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: categoryMarkerColors[selectedActivity.category] }}
                />
                <span className="text-xs text-muted-foreground">{categoryLabels[selectedActivity.category]}</span>
              </div>
              <h3 className="font-semibold text-foreground">{selectedActivity.activity}</h3>
              <p className="text-sm text-muted-foreground">{selectedActivity.user.name}</p>
            </div>
            <button
              onClick={() => setSelectedActivity(null)}
              className="w-6 h-6 flex items-center justify-center rounded-full bg-secondary"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              {selectedActivity.location}
            </span>
            <span>{selectedActivity.time}</span>
            <span>
              {selectedActivity.spots} lugar{selectedActivity.spots > 1 ? "es" : ""}
            </span>
          </div>
          <Button
            onClick={() => onSelectActivity?.(selectedActivity)}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-semibold"
          >
            Unirme
          </Button>
        </div>
      )}
    </div>
  )
}
