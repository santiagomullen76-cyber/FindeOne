"use client"

import { useState } from "react"
import { Bell, X, Check, Star, Clock } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { useActivities, type Activity, type ParticipantRequest } from "@/lib/activities-context"

interface NotificationsPanelProps {
  isOpen: boolean
  onClose: () => void
  pendingRequests: { activity: Activity; request: ParticipantRequest }[]
}

export function NotificationsPanel({ isOpen, onClose, pendingRequests }: NotificationsPanelProps) {
  const { approveRequest, rejectRequest } = useActivities()
  const [processingId, setProcessingId] = useState<string | null>(null)

  const handleApprove = async (activityId: number, userEmail: string) => {
    setProcessingId(`${activityId}-${userEmail}`)
    await new Promise((resolve) => setTimeout(resolve, 300))
    approveRequest(activityId, userEmail)
    setProcessingId(null)
  }

  const handleReject = async (activityId: number, userEmail: string) => {
    setProcessingId(`${activityId}-${userEmail}`)
    await new Promise((resolve) => setTimeout(resolve, 300))
    rejectRequest(activityId, userEmail)
    setProcessingId(null)
  }

  if (!isOpen) return null

  return (
    <div className="absolute inset-0 z-50 bg-black/50 flex items-start justify-center pt-16">
      <div className="bg-card rounded-2xl w-[calc(100%-32px)] max-h-[70%] shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card sticky top-0">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            <h2 className="font-semibold text-foreground">Notificaciones</h2>
            {pendingRequests.length > 0 && (
              <span className="bg-destructive text-destructive-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {pendingRequests.length}
              </span>
            )}
          </div>
          <button onClick={onClose} className="p-2 hover:bg-secondary rounded-full transition-colors">
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(70vh-60px)]">
          {pendingRequests.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <Bell className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No tienes notificaciones</p>
              <p className="text-sm mt-1">Las solicitudes aparecerán aquí</p>
            </div>
          ) : (
            <div className="p-3 space-y-3">
              {pendingRequests.map(({ activity, request }) => {
                const isProcessing = processingId === `${activity.id}-${request.userEmail}`
                return (
                  <div
                    key={`${activity.id}-${request.userEmail}`}
                    className="bg-secondary/50 rounded-xl p-4 border border-border"
                  >
                    {/* Activity info */}
                    <p className="text-xs text-muted-foreground mb-2">Solicitud para tu actividad:</p>
                    <p className="font-medium text-foreground text-sm mb-3">{activity.activity}</p>

                    {/* User info */}
                    <div className="flex items-center gap-3 mb-3">
                      <Avatar className="w-10 h-10 border-2 border-primary/20">
                        <AvatarImage src={request.userAvatar || "/placeholder.svg"} />
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {request.userName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-semibold text-foreground">{request.userName}</p>
                        <div className="flex items-center gap-2">
                          {request.userRating > 0 ? (
                            <span className="flex items-center gap-1 text-xs text-amber-500">
                              <Star className="w-3 h-3 fill-amber-500" />
                              {request.userRating.toFixed(1)} estrellas
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground">Sin calificaciones</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        Hace poco
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="flex-1 rounded-xl bg-green-500 hover:bg-green-600 text-white"
                        onClick={() => handleApprove(activity.id, request.userEmail)}
                        disabled={isProcessing}
                      >
                        {isProcessing ? (
                          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <>
                            <Check className="w-4 h-4 mr-1" />
                            Aprobar
                          </>
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 rounded-xl border-destructive text-destructive hover:bg-destructive/10 bg-transparent"
                        onClick={() => handleReject(activity.id, request.userEmail)}
                        disabled={isProcessing}
                      >
                        <X className="w-4 h-4 mr-1" />
                        Rechazar
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
