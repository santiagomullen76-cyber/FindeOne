"use client"

import { useState } from "react"
import {
  Clock,
  MapPin,
  Users,
  CheckCircle,
  XCircle,
  Star,
  Check,
  X,
  UserCheck,
  Clock3,
  Send,
  Hourglass,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { FindOneLogo } from "@/components/findone-logo"
import { useActivities } from "@/lib/activities-context"
import { useUser } from "@/lib/user-context"
import { getUserInitials } from "@/lib/utils"

type Tab = "upcoming" | "created" | "requests" | "sent" | "past"

export function ActivitiesScreen() {
  const [activeTab, setActiveTab] = useState<Tab>("upcoming")
  const [ratingModal, setRatingModal] = useState<{
    show: boolean
    activityId: number
    userEmail: string
    userName: string
    activityName: string
  } | null>(null)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState("")
  const [attended, setAttended] = useState(true)
  const [onTime, setOnTime] = useState(true)

  const {
    activities,
    getActivitiesByCreator,
    getActivitiesJoinedBy,
    getPendingRequests,
    approveRequest,
    rejectRequest,
    cancelRequest,
    completeActivity,
    markAttendance,
    getMyRequests,
    setActivities,
  } = useActivities()
  const { user, rateUser, getUserRating } = useUser()

  const myCreatedActivities = user ? getActivitiesByCreator(user.email) : []
  const myJoinedActivities = user ? getActivitiesJoinedBy(user.email) : []
  const myRequests = user ? getMyRequests(user.email) : []
  const pendingRequestsCount = myRequests.filter((r) => r.request.status === "pending").length

  // Get all activities with pending requests for current user
  const activitiesWithPendingRequests = myCreatedActivities.filter((a) => getPendingRequests(a.id).length > 0)

  const totalPendingRequests = activitiesWithPendingRequests.reduce(
    (sum, a) => sum + getPendingRequests(a.id).length,
    0,
  )

  const hasRatedUser = (activityId: number, targetUserEmail: string): boolean => {
    const activity = activities.find((a) => a.id === activityId)
    if (!activity || !user) return false

    const record = activity.attendanceRecords.find((r) => r.userEmail === targetUserEmail)
    return record?.ratedBy.includes(user.email) ?? false
  }

  const handleApprove = (activityId: number, userEmail: string) => {
    approveRequest(activityId, userEmail)
  }

  const handleReject = (activityId: number, userEmail: string) => {
    rejectRequest(activityId, userEmail)
  }

  const handleCancelRequest = (activityId: number) => {
    if (user) {
      cancelRequest(activityId, user.email)
    }
  }

  const handleRateUser = () => {
    if (!ratingModal || !user) return

    // Mark that this user has rated the target user
    const activity = activities.find((a) => a.id === ratingModal.activityId)
    if (activity) {
      setActivities((prev) =>
        prev.map((a) => {
          if (a.id !== ratingModal.activityId) return a

          const existingRecord = a.attendanceRecords.find((r) => r.userEmail === ratingModal.userEmail)
          if (existingRecord) {
            return {
              ...a,
              attendanceRecords: a.attendanceRecords.map((r) =>
                r.userEmail === ratingModal.userEmail
                  ? { ...r, attended, onTime, ratedBy: [...r.ratedBy, user.email] }
                  : r,
              ),
            }
          }

          const newRecord: any = {
            oderId: `att_${Date.now()}`,
            userEmail: ratingModal.userEmail,
            attended,
            onTime,
            ratedBy: [user.email],
          }

          return { ...a, attendanceRecords: [...a.attendanceRecords, newRecord] }
        }),
      )
    }

    rateUser(ratingModal.userEmail, rating, comment, ratingModal.activityName, attended, onTime)
    setRatingModal(null)
    setRating(5)
    setComment("")
    setAttended(true)
    setOnTime(true)
  }

  const openRatingModal = (activityId: number, userEmail: string, userName: string, activityName: string) => {
    setRatingModal({ show: true, activityId, userEmail, userName, activityName })
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Rating Modal */}
      {ratingModal && (
        <div className="absolute inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-card rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <h3 className="text-lg font-bold text-foreground mb-2">Calificar a {ratingModal.userName}</h3>
            <p className="text-sm text-muted-foreground mb-4">Actividad: {ratingModal.activityName}</p>

            {/* Attendance toggles */}
            <div className="space-y-3 mb-4">
              <button
                onClick={() => setAttended(!attended)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-colors ${
                  attended
                    ? "bg-green-500/10 border-green-500/30 text-green-600"
                    : "bg-destructive/10 border-destructive/30 text-destructive"
                }`}
              >
                {attended ? <UserCheck className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                <span className="font-medium">{attended ? "Asistió al evento" : "No asistió al evento"}</span>
              </button>

              {attended && (
                <button
                  onClick={() => setOnTime(!onTime)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-colors ${
                    onTime
                      ? "bg-green-500/10 border-green-500/30 text-green-600"
                      : "bg-amber-500/10 border-amber-500/30 text-amber-600"
                  }`}
                >
                  {onTime ? <Clock3 className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                  <span className="font-medium">{onTime ? "Llegó a horario" : "Llegó tarde"}</span>
                </button>
              )}
            </div>

            {/* Star rating */}
            <div className="flex items-center justify-center gap-2 mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <button key={star} onClick={() => setRating(star)}>
                  <Star
                    className={`w-8 h-8 transition-colors ${
                      star <= rating ? "fill-amber-500 text-amber-500" : "text-muted-foreground"
                    }`}
                  />
                </button>
              ))}
            </div>

            {/* Comment */}
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Escribe un comentario (opcional)..."
              className="w-full p-3 bg-secondary rounded-xl text-foreground placeholder:text-muted-foreground resize-none h-20 mb-4"
            />

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1 rounded-xl bg-transparent"
                onClick={() => setRatingModal(null)}
              >
                Cancelar
              </Button>
              <Button className="flex-1 rounded-xl bg-primary" onClick={handleRateUser}>
                Enviar calificación
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="px-4 py-3 bg-card border-b border-border">
        <FindOneLogo />
      </div>

      {/* Title */}
      <div className="px-4 py-4">
        <h1 className="text-2xl font-bold text-foreground">Mis actividades</h1>
        <p className="text-muted-foreground mt-1">Gestiona tus planes y solicitudes</p>
      </div>

      <div className="px-4 mb-4">
        <div className="flex bg-secondary rounded-xl p-1">
          {(["upcoming", "created", "requests", "sent", "past"] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 px-1 rounded-lg text-[10px] font-medium transition-colors relative ${
                activeTab === tab ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab === "upcoming" && "Próximas"}
              {tab === "created" && "Creadas"}
              {tab === "requests" && (
                <span className="flex items-center justify-center gap-0.5">
                  Solicitudes
                  {totalPendingRequests > 0 && (
                    <span className="bg-destructive text-destructive-foreground text-[9px] rounded-full w-4 h-4 flex items-center justify-center">
                      {totalPendingRequests}
                    </span>
                  )}
                </span>
              )}
              {tab === "sent" && (
                <span className="flex items-center justify-center gap-0.5">
                  Enviadas
                  {pendingRequestsCount > 0 && (
                    <span className="bg-amber-500 text-white text-[9px] rounded-full w-4 h-4 flex items-center justify-center">
                      {pendingRequestsCount}
                    </span>
                  )}
                </span>
              )}
              {tab === "past" && "Pasadas"}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 pb-4 space-y-3 overflow-y-auto">
        {/* Upcoming tab - activities I joined (approved) */}
        {activeTab === "upcoming" && (
          <>
            {myJoinedActivities.filter((a) => !a.isCompleted).length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No tienes actividades próximas</p>
                <p className="text-sm mt-1">Únete a una actividad desde el inicio</p>
              </div>
            ) : (
              myJoinedActivities
                .filter((a) => !a.isCompleted)
                .map((activity) => (
                  <div key={activity.id} className="bg-card rounded-2xl p-4 border border-border">
                    <div className="flex items-start gap-3">
                      <Avatar className="w-10 h-10 border-2 border-primary/20">
                        <AvatarImage src={activity.user.avatar || "/placeholder.svg"} alt={activity.user.name} />
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {getUserInitials(activity.user.name, activity.user.email?.split("@")[0])}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">{activity.activity}</h3>
                        <p className="text-sm text-muted-foreground">con {activity.user.name}</p>
                        <div className="flex flex-wrap gap-3 mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {activity.time}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5" />
                            {activity.location}
                          </span>
                        </div>
                      </div>
                      <div className="px-2 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-600">
                        Confirmado
                      </div>
                    </div>
                  </div>
                ))
            )}
          </>
        )}

        {/* Created tab - activities I created */}
        {activeTab === "created" && (
          <>
            {myCreatedActivities.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No has creado actividades</p>
                <p className="text-sm mt-1">Crea una actividad desde el botón +</p>
              </div>
            ) : (
              myCreatedActivities.map((activity) => {
                const pendingCount = getPendingRequests(activity.id).length
                return (
                  <div key={activity.id} className="bg-card rounded-2xl p-4 border border-border">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-foreground">{activity.activity}</h3>
                      {pendingCount > 0 && (
                        <span className="bg-amber-500/10 text-amber-600 text-xs px-2 py-1 rounded-full">
                          {pendingCount} solicitud{pendingCount > 1 ? "es" : ""}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-3 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {activity.time}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {activity.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" />
                        {activity.participants.length}/{activity.spots} participantes
                      </span>

                      {activity.ageRange && (
                       <span className="flex items-center gap-1">
                         <Users className="w-3.5 h-3.5" />
                         {activity.ageRange.min}–{activity.ageRange.max} años
                       </span>
      )}

                    </div>

                    {/* Show approved participants */}
                    {activity.participants.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-border">
                        <p className="text-xs text-muted-foreground mb-2">Participantes aprobados:</p>
                        <div className="space-y-2">
                          {activity.participantRequests
                            .filter((r) => r.status === "approved")
                            .map((participant) => (
                              <div
                                key={participant.userEmail}
                                className="flex items-center justify-between bg-secondary/50 rounded-lg p-2"
                              >
                                <div className="flex items-center gap-2">
                                  <Avatar className="w-6 h-6">
                                    <AvatarImage src={participant.userAvatar || "/placeholder.svg"} />
                                    <AvatarFallback className="text-xs">
                                      {getUserInitials(participant.userName)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="text-sm text-foreground">{participant.userName}</span>
                                </div>
                                <CheckCircle className="w-4 h-4 text-green-500" />
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </>
        )}

        {/* Requests tab - pending requests to approve */}
        {activeTab === "requests" && (
          <>
            {activitiesWithPendingRequests.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No tienes solicitudes pendientes</p>
                <p className="text-sm mt-1">Las solicitudes aparecerán aquí cuando alguien quiera unirse</p>
              </div>
            ) : (
              activitiesWithPendingRequests.map((activity) => (
                <div key={activity.id} className="bg-card rounded-2xl p-4 border border-border">
                  <h3 className="font-semibold text-foreground mb-3">{activity.activity}</h3>
                  <p className="text-xs text-muted-foreground mb-3">Solicitudes pendientes:</p>

                  <div className="space-y-3">
                    {getPendingRequests(activity.id).map((request) => (
                      <div key={request.userEmail} className="bg-secondary/50 rounded-xl p-3">
                        <div className="flex items-center gap-3 mb-3">
                          <Avatar className="w-10 h-10 border-2 border-primary/20">
                            <AvatarImage src={request.userAvatar || "/placeholder.svg"} />
                            <AvatarFallback>{getUserInitials(request.userName)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="font-medium text-foreground">{request.userName}</p>
                            <div className="flex items-center gap-2">
                              {request.userRating > 0 ? (
                                <span className="flex items-center gap-1 text-xs text-amber-500">
                                  <Star className="w-3 h-3 fill-amber-500" />
                                  {request.userRating.toFixed(1)} estrellas
                                </span>
                              ) : (
                                <span className="text-xs text-muted-foreground">Sin calificaciones aún</span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            className="flex-1 rounded-xl bg-green-500 hover:bg-green-600 text-white"
                            onClick={() => handleApprove(activity.id, request.userEmail)}
                          >
                            <Check className="w-4 h-4 mr-1" />
                            Aprobar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 rounded-xl border-destructive text-destructive hover:bg-destructive/10 bg-transparent"
                            onClick={() => handleReject(activity.id, request.userEmail)}
                          >
                            <X className="w-4 h-4 mr-1" />
                            Rechazar
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </>
        )}

        {activeTab === "sent" && (
          <>
            {myRequests.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Send className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No has enviado solicitudes</p>
                <p className="text-sm mt-1">Únete a una actividad desde el inicio</p>
              </div>
            ) : (
              myRequests.map(({ activity, request }) => (
                <div key={activity.id} className="bg-card rounded-2xl p-4 border border-border">
                  <div className="flex items-start gap-3">
                    <Avatar className="w-10 h-10 border-2 border-primary/20">
                      <AvatarImage src={activity.user.avatar || "/placeholder.svg"} alt={activity.user.name} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {getUserInitials(activity.user.name, activity.user.email?.split("@")[0])}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">{activity.activity}</h3>
                      <p className="text-sm text-muted-foreground">Organiza: {activity.user.name}</p>
                      <div className="flex flex-wrap gap-3 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {activity.time}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {activity.location}
                        </span>
                      </div>
                    </div>
                    {/* Status badge */}
                    <div
                      className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
                        request.status === "pending"
                          ? "bg-amber-500/10 text-amber-600"
                          : request.status === "approved"
                            ? "bg-green-500/10 text-green-600"
                            : "bg-destructive/10 text-destructive"
                      }`}
                    >
                      {request.status === "pending" && <Hourglass className="w-3 h-3" />}
                      {request.status === "approved" && <CheckCircle className="w-3 h-3" />}
                      {request.status === "rejected" && <XCircle className="w-3 h-3" />}
                      {request.status === "pending" && "Pendiente"}
                      {request.status === "approved" && "Aprobado"}
                      {request.status === "rejected" && "Rechazado"}
                    </div>
                  </div>

                  {/* Cancel button for pending requests */}
                  {request.status === "pending" && (
                    <div className="mt-3 pt-3 border-t border-border">
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full rounded-xl border-destructive text-destructive hover:bg-destructive/10 bg-transparent"
                        onClick={() => handleCancelRequest(activity.id)}
                      >
                        <X className="w-4 h-4 mr-1" />
                        Cancelar solicitud
                      </Button>
                    </div>
                  )}
                </div>
              ))
            )}
          </>
        )}

        {/* Past tab - completed activities with rating option */}
        {activeTab === "past" && (
          <>
            {myJoinedActivities.filter((a) => a.isCompleted).length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No tienes actividades pasadas</p>
                <p className="text-sm mt-1">Aquí verás las actividades completadas</p>
              </div>
            ) : (
              myJoinedActivities
                .filter((a) => a.isCompleted)
                .map((activity) => (
                  <div key={activity.id} className="bg-card rounded-2xl p-4 border border-border opacity-90">
                    <div className="flex items-start gap-3">
                      <Avatar className="w-10 h-10 border-2 border-border">
                        <AvatarImage src={activity.user.avatar || "/placeholder.svg"} alt={activity.user.name} />
                        <AvatarFallback className="bg-muted text-muted-foreground">
                          {getUserInitials(activity.user.name, activity.user.email?.split("@")[0])}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">{activity.activity}</h3>
                        <p className="text-sm text-muted-foreground">con {activity.user.name}</p>
                        <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                      </div>
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    </div>

                    {/* Rate participants button */}
                    <div className="mt-3 pt-3 border-t border-border">
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full rounded-xl bg-transparent"
                        onClick={() =>
                          openRatingModal(activity.id, activity.user.email || "", activity.user.name, activity.activity)
                        }
                      >
                        <Star className="w-4 h-4 mr-2" />
                        Calificar organizador
                      </Button>
                    </div>

                    <div className="space-y-3">
                      {activity.participantRequests
                        .filter((req) => req.status === "approved" && req.userEmail !== user?.email)
                        .map((req) => (
                          <div
                            key={req.userEmail}
                            className="flex items-center justify-between p-3 bg-secondary rounded-xl"
                          >
                            <div className="flex items-center gap-3">
                              <Avatar className="w-10 h-10">
                                <AvatarImage src={req.userAvatar || "/placeholder.svg"} />
                                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                                  {getUserInitials(req.userName)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium text-foreground">{req.userName}</p>
                                <p className="text-xs text-muted-foreground">Participante</p>
                              </div>
                            </div>
                            {!hasRatedUser(activity.id, req.userEmail) ? (
                              <Button
                                size="sm"
                                variant="outline"
                                className="rounded-xl bg-transparent"
                                onClick={() =>
                                  openRatingModal(activity.id, req.userEmail, req.userName, activity.activity)
                                }
                              >
                                <Star className="w-4 h-4 mr-1" />
                                Calificar
                              </Button>
                            ) : (
                              <span className="text-xs text-green-600 flex items-center gap-1">
                                <Check className="w-4 h-4" />
                                Calificado
                              </span>
                            )}
                          </div>
                        ))}
                    </div>
                  </div>
                ))
            )}
          </>
        )}
      </div>
    </div>
  )
}
