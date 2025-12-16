"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { MapPin, Search, Loader2, Navigation, X } from "lucide-react"
import { Input } from "@/components/ui/input"

interface LocationResult {
  display_name: string
  lat: string
  lon: string
  address?: {
    neighbourhood?: string
    suburb?: string
    city?: string
    state?: string
    country?: string
  }
}

interface LocationSearchProps {
  value: string
  onChange: (value: string, coords?: { lat: number; lng: number }) => void
  placeholder?: string
  className?: string
}

export function LocationSearch({
  value,
  onChange,
  placeholder = "Buscar barrio o dirección",
  className,
}: LocationSearchProps) {
  const [query, setQuery] = useState(value)
  const [results, setResults] = useState<LocationResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [isLocating, setIsLocating] = useState(false)
  const searchTimeout = useRef<NodeJS.Timeout | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setQuery(value)
  }, [value])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowResults(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const searchLocation = async (searchQuery: string) => {
    if (searchQuery.length < 3) {
      setResults([])
      return
    }

    setIsSearching(true)
    try {
      // Usar Nominatim (OpenStreetMap) - gratuito y sin API key
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&countrycodes=ar&addressdetails=1&limit=5`,
        {
          headers: {
            "Accept-Language": "es",
          },
        },
      )
      const data = await response.json()
      setResults(data)
      setShowResults(true)
    } catch (error) {
      console.error("Error buscando ubicación:", error)
      setResults([])
    } finally {
      setIsSearching(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setQuery(newValue)
    onChange(newValue)

    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current)
    }

    searchTimeout.current = setTimeout(() => {
      searchLocation(newValue)
    }, 500)
  }

  const handleSelectLocation = (result: LocationResult) => {
    const address = result.address
    // Formatear dirección corta con barrio/ciudad
    const shortAddress =
      [address?.neighbourhood || address?.suburb, address?.city || address?.state].filter(Boolean).join(", ") ||
      result.display_name.split(",").slice(0, 2).join(",")

    setQuery(shortAddress)
    onChange(shortAddress, { lat: Number.parseFloat(result.lat), lng: Number.parseFloat(result.lon) })
    setShowResults(false)
  }

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Tu navegador no soporta geolocalización")
      return
    }

    setIsLocating(true)
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords

        try {
          // Reverse geocoding para obtener la dirección
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`,
            {
              headers: {
                "Accept-Language": "es",
              },
            },
          )
          const data = await response.json()

          const address = data.address
          const shortAddress =
            [address?.neighbourhood || address?.suburb, address?.city || address?.state].filter(Boolean).join(", ") ||
            data.display_name.split(",").slice(0, 2).join(",")

          setQuery(shortAddress)
          onChange(shortAddress, { lat: latitude, lng: longitude })
        } catch (error) {
          console.error("Error obteniendo dirección:", error)
        } finally {
          setIsLocating(false)
        }
      },
      (error) => {
        console.error("Error de geolocalización:", error)
        setIsLocating(false)
        alert("No pudimos obtener tu ubicación. Asegúrate de permitir el acceso.")
      },
      { enableHighAccuracy: true },
    )
  }

  const clearLocation = () => {
    setQuery("")
    onChange("")
    setResults([])
  }

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="relative">
        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          type="text"
          placeholder={placeholder}
          className="h-12 pl-12 pr-24 rounded-xl"
          value={query}
          onChange={handleInputChange}
          onFocus={() => results.length > 0 && setShowResults(true)}
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {isSearching && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
          {query && (
            <button type="button" onClick={clearLocation} className="p-1.5 hover:bg-secondary rounded-full">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
          <button
            type="button"
            onClick={getCurrentLocation}
            disabled={isLocating}
            className="p-1.5 hover:bg-secondary rounded-full text-primary"
            title="Usar mi ubicación actual"
          >
            {isLocating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Navigation className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Resultados de búsqueda */}
      {showResults && results.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-background border border-border rounded-xl shadow-lg overflow-hidden">
          {results.map((result, index) => {
            const address = result.address
            const mainText = address?.neighbourhood || address?.suburb || result.display_name.split(",")[0]
            const secondaryText = [address?.city, address?.state, address?.country].filter(Boolean).join(", ")

            return (
              <button
                key={index}
                type="button"
                onClick={() => handleSelectLocation(result)}
                className="w-full px-4 py-3 flex items-start gap-3 hover:bg-secondary text-left border-b border-border last:border-0"
              >
                <MapPin className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">{mainText}</p>
                  <p className="text-sm text-muted-foreground truncate">{secondaryText}</p>
                </div>
              </button>
            )
          })}
        </div>
      )}

      {/* Botón para abrir en Google Maps */}
      {query && (
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 flex items-center gap-2 text-sm text-primary hover:underline"
        >
          <Search className="w-4 h-4" />
          Ver en Google Maps
        </a>
      )}
    </div>
  )
}
