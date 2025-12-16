import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getUserInitials(fullName: string, fallback?: string): string {
  if (!fullName || fullName.trim() === "") {
    return fallback?.charAt(0).toUpperCase() || "U"
  }

  const parts = fullName.trim().split(" ").filter(Boolean)

  if (parts.length === 0) {
    return fallback?.charAt(0).toUpperCase() || "U"
  }

  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase()
  }

  // Take first letter of first name and first letter of last name
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
}
