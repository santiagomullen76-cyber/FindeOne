"use client"

import { Star, MapPin, Calendar, Shield, X } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import type { UserRating as UserRatingType } from "@/lib/user-context"

interface UserProfileCardProps {
  user: {
    id: string
    name: string
    lastName?: string
    avatar: string | null
    bio?: string
    location?: string
    isVerified: boolean
    createdAt: string
    stats: {
      activitiesCreated: number
      activitiesJoined: number
      connections: number
    }
    interests: string[]
    ratings: UserRatingType[]
    averageRating: number
  }
  onClose: () => void
  onRate?: () => void
  showRateButton?: boolean
}

export function UserProfileCard({ user, onClose, onRate, showRateButton = false }: UserProfileCardProps) {
  const fullName = user.lastName ? `${user.name} ${user.lastName}` : user.name
  const memberSince = new Date(user.createdAt).toLocaleDateString("es-AR", {
    month: "long",
    year: "numeric",
  })

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-3xl w-full max-w-sm max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="relative p-6 pb-4">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-secondary"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col items-center">
            <Avatar className="w-24 h-24 border-4 border-primary/20 mb-3">
              <AvatarImage src={user.avatar || "/placeholder.svg"} alt={fullName} />
              <AvatarFallback className="bg-primary/10 text-primary text-2xl">
                {fullName
                  .split(" ")
                  .map((n) => n.charAt(0))
                  .join("")}
              </AvatarFallback>
            </Avatar>

            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-foreground">{fullName}</h2>
              {user.isVerified && <Shield className="w-5 h-5 text-primary fill-primary/20" />}
            </div>

            {/* Rating */}
            <div className="flex items-center gap-1 mt-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-4 h-4 ${
                    star <= Math.round(user.averageRating) ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
                  }`}
                />
              ))}
              <span className="text-sm text-muted-foreground ml-1">({user.ratings.length})</span>
            </div>

            {user.location && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground mt-2">
                <MapPin className="w-4 h-4" />
                {user.location}
              </div>
            )}

            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
              <Calendar className="w-3 h-3" />
              Miembro desde {memberSince}
            </div>
          </div>
        </div>

        {/* Bio */}
        {user.bio && (
          <div className="px-6 pb-4">
            <p className="text-sm text-muted-foreground text-center">{user.bio}</p>
          </div>
        )}

        {/* Stats */}
        <div className="px-6 pb-4">
          <div className="grid grid-cols-3 gap-2 p-4 bg-secondary/50 rounded-2xl">
            <div className="text-center">
              <p className="text-xl font-bold text-foreground">{user.stats.activitiesCreated}</p>
              <p className="text-xs text-muted-foreground">Creadas</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-foreground">{user.stats.activitiesJoined}</p>
              <p className="text-xs text-muted-foreground">Unidas</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-foreground">{user.stats.connections}</p>
              <p className="text-xs text-muted-foreground">Conexiones</p>
            </div>
          </div>
        </div>

        {/* Interests */}
        {user.interests.length > 0 && (
          <div className="px-6 pb-4">
            <h3 className="text-sm font-semibold text-foreground mb-2">Intereses</h3>
            <div className="flex flex-wrap gap-2">
              {user.interests.map((interest) => (
                <span key={interest} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                  {interest}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Recent Reviews */}
        {user.ratings.length > 0 && (
          <div className="px-6 pb-4">
            <h3 className="text-sm font-semibold text-foreground mb-2">Calificaciones recientes</h3>
            <div className="space-y-3">
              {user.ratings.slice(0, 3).map((rating) => (
                <div key={rating.id} className="p-3 bg-secondary/30 rounded-xl">
                  <div className="flex items-center gap-2 mb-1">
                    <Avatar className="w-6 h-6">
                      <AvatarImage src={rating.fromUserAvatar || "/placeholder.svg"} />
                      <AvatarFallback className="text-xs">{rating.fromUserName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium text-foreground">{rating.fromUserName}</span>
                    <div className="flex items-center ml-auto">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-3 h-3 ${
                            star <= rating.rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  {rating.comment && <p className="text-xs text-muted-foreground">{rating.comment}</p>}
                  <p className="text-xs text-muted-foreground/60 mt-1">{rating.activityName}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Rate Button */}
        {showRateButton && onRate && (
          <div className="p-6 pt-2">
            <Button className="w-full h-12 rounded-2xl" onClick={onRate}>
              <Star className="w-4 h-4 mr-2" />
              Calificar usuario
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
