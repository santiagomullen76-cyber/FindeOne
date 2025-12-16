"use client"

import type React from "react"

import { Home, Grid3X3, Plus, Calendar, User } from "lucide-react"
import type { Screen } from "./mobile-app"

interface BottomNavProps {
  currentScreen: Screen
  onNavigate: (screen: Screen) => void
}

export function BottomNav({ currentScreen, onNavigate }: BottomNavProps) {
  const navItems: { screen: Screen; icon: React.ReactNode; label: string }[] = [
    { screen: "home", icon: <Home className="w-6 h-6" />, label: "Inicio" },
    { screen: "categories", icon: <Grid3X3 className="w-6 h-6" />, label: "Categorías" },
    { screen: "create", icon: <Plus className="w-6 h-6" />, label: "Crear" },
    { screen: "activities", icon: <Calendar className="w-6 h-6" />, label: "Actividades" },
    { screen: "profile", icon: <User className="w-6 h-6" />, label: "Perfil" },
  ]

  return (
    <nav className="absolute bottom-6 left-0 right-0 flex items-center justify-around px-4 py-3 bg-card border-t border-border">
      {navItems.map((item) => (
        <button
          key={item.screen}
          onClick={() => onNavigate(item.screen)}
          className={`flex flex-col items-center gap-1 transition-colors relative ${
            currentScreen === item.screen ? "text-primary" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {item.screen === "create" ? (
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-primary-foreground shadow-lg -mt-6">
              {item.icon}
            </div>
          ) : (
            <>
              {item.icon}
              <span className="text-xs font-medium">{item.label}</span>
            </>
          )}
        </button>
      ))}
    </nav>
  )
}
