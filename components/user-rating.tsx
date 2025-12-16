"use client"

import { useState } from "react"
import { Star, X, Send } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { useUser } from "@/lib/user-context"

interface UserRatingProps {
  userId: string
  userName: string
  userAvatar: string
  activityName: string
  onClose: () => void
  onSubmit: () => void
}

export function UserRating({ userId, userName, userAvatar, activityName, onClose, onSubmit }: UserRatingProps) {
  const { rateUser } = useUser()
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [comment, setComment] = useState("")

  const handleSubmit = () => {
    if (rating === 0) return
    rateUser(userId, rating, comment, activityName)
    onSubmit()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-3xl w-full max-w-sm p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-secondary"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center mb-6">
          <Avatar className="w-20 h-20 border-4 border-primary/20 mb-3">
            <AvatarImage src={userAvatar || "/placeholder.svg"} alt={userName} />
            <AvatarFallback className="bg-primary/10 text-primary text-xl">
              {userName
                .split(" ")
                .map((n) => n.charAt(0))
                .join("")}
            </AvatarFallback>
          </Avatar>
          <h2 className="text-lg font-bold text-foreground">{userName}</h2>
          <p className="text-sm text-muted-foreground">{activityName}</p>
        </div>

        <p className="text-center text-foreground mb-4">¿Cómo fue tu experiencia?</p>

        {/* Stars */}
        <div className="flex justify-center gap-2 mb-6">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              className="transition-transform hover:scale-110"
            >
              <Star
                className={`w-10 h-10 transition-colors ${
                  star <= (hoveredRating || rating) ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
                }`}
              />
            </button>
          ))}
        </div>

        {/* Comment */}
        <textarea
          placeholder="Escribe un comentario (opcional)..."
          className="w-full h-24 p-4 border border-border rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-primary bg-background text-sm mb-4"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />

        <Button className="w-full h-12 rounded-2xl" onClick={handleSubmit} disabled={rating === 0}>
          <Send className="w-4 h-4 mr-2" />
          Enviar calificación
        </Button>
      </div>
    </div>
  )
}
