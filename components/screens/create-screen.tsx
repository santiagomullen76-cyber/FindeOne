"use client"

import { useState } from "react"
import {
  MapPin,
  Calendar,
  Clock,
  Users,
  FileText,
  ChevronDown,
  Check,
  ChevronRight,
  Search,
  ExternalLink,
  Dumbbell,
  Star,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FindOneLogo } from "@/components/findone-logo"
import { useActivities } from "@/lib/activities-context"
import { useUser } from "@/lib/user-context"

interface CreateScreenProps {
  onComplete: () => void
}

const categories = [
  {
    id: "sports",
    name: "Deportes",
    emoji: "⚽",
    subcategories: [
      "Tenis",
      "Pádel",
      "Fútbol",
      "Squash",
      "Running",
      "Bicicleta",
      "Skate",
      "Roller",
      "Natación",
      "Voley",
      "Otros",
    ],
  },
  {
    id: "travel",
    name: "Viajes",
    emoji: "✈️",
    subcategories: ["Compañero de viaje", "Compartir ruta", "Escapadas", "Mochileros", "Road trips", "Camping"],
  },
  {
    id: "leisure",
    name: "Ocio",
    emoji: "🎬",
    subcategories: ["Cine", "Teatro", "Conciertos", "Museos", "Caminar", "Plaza", "Charlas", "Juegos de mesa"],
  },
  {
    id: "studies",
    name: "Estudios",
    emoji: "📚",
    subcategories: ["Debates", "Grupos de lectura", "Intercambio de ideas", "Idiomas", "Tutorías", "Coworking"],
  },
]

const skillLevelLabels = [
  { level: 1, label: "Principiante", description: "Estoy empezando" },
  { level: 2, label: "Básico", description: "Conozco lo básico" },
  { level: 3, label: "Intermedio", description: "Juego regularmente" },
  { level: 4, label: "Avanzado", description: "Buen nivel competitivo" },
  { level: 5, label: "Experto", description: "Nivel profesional/torneo" },
]

export function CreateScreen({ onComplete }: CreateScreenProps) {
  const { addActivity } = useActivities()
  const { user } = useUser()

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null)
  const [showCategoryPicker, setShowCategoryPicker] = useState(false)
  const [showSubcategoryPicker, setShowSubcategoryPicker] = useState(false)
  const [title, setTitle] = useState("")
  const [location, setLocation] = useState("")
  const [date, setDate] = useState("")
  const [time, setTime] = useState("")
  const [spots, setSpots] = useState("1")
  const [notes, setNotes] = useState("")
  const [isPublishing, setIsPublishing] = useState(false)
  const [skillLevel, setSkillLevel] = useState<number | null>(null)

  const [ageMin, setAgeMin] = useState(18)
  const [ageMax, setAgeMax] = useState(99)


  const currentCategory = categories.find((c) => c.id === selectedCategory)
  const subcategories = currentCategory?.subcategories || []
  const isSportsCategory = selectedCategory === "sports"

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId)
    setSelectedSubcategory(null)
    if (categoryId !== "sports") {
      setSkillLevel(null)
    }
    setShowCategoryPicker(false)
    setShowSubcategoryPicker(true)
  }

  const openGoogleMapsSearch = () => {
    const query = location ? encodeURIComponent(location) : ""
    const url = `https://www.google.com/maps/search/?api=1&query=${query}`
    window.open(url, "_blank")
  }

  const handlePublish = () => {
    if (!selectedCategory || !selectedSubcategory || !title || !location || !date || !time) return
    if (isSportsCategory && !skillLevel) return

    if (ageMin < 18 || ageMax > 99) {
    alert("El rango de edad debe ser entre 18 y 99")
    return

  }

    if (ageMin > ageMax) {
    alert("La edad mínima no puede ser mayor que la máxima")
    return
  }

    setIsPublishing(true)

    const userName = user?.name && user?.lastName ? `${user.name} ${user.lastName}` : "Usuario"
    const userInitials = user?.name && user?.lastName ? `${user.name.charAt(0)}${user.lastName.charAt(0)}` : "U"
    const userAvatar = user?.avatar || ""
    const userEmail = user?.email || ""

    const formattedDate = new Date(date).toLocaleDateString("es-AR", {
      weekday: "long",
      day: "numeric",
      month: "short",
    })

    addActivity({
      user: {
        name: userName,
        avatar: userAvatar,
        initials: userInitials,
        email: userEmail,
      },
      activity: title,
      category: selectedCategory,
      subcategory: selectedSubcategory,
      skillLevel: isSportsCategory ? (skillLevel ?? undefined) : undefined,
      time: `${formattedDate} ${time} hs`,
      location: location,
      coordinates: { lat: -34.6037 + (Math.random() - 0.5) * 0.1, lng: -58.3816 + (Math.random() - 0.5) * 0.1 },
      spots: Number.parseInt(spots),
      notes: notes,

      ageRange: {
        min: ageMin,
        max: ageMax,
  },
    })

    setTimeout(() => {
      setIsPublishing(false)
      setSelectedCategory(null)
      setSelectedSubcategory(null)
      setTitle("")
      setLocation("")
      setDate("")
      setTime("")
      setSpots("1")
      setNotes("")
      setSkillLevel(null)
      onComplete()
    }, 500)
  }

  const isFormValid =
    selectedCategory && selectedSubcategory && title && location && date && time && (!isSportsCategory || skillLevel)

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="px-4 py-3 bg-card border-b border-border">
        <FindOneLogo />
      </div>

      {/* Title */}
      <div className="px-4 py-4">
        <h1 className="text-2xl font-bold text-foreground">Crear actividad</h1>
        <p className="text-muted-foreground mt-1">Publica lo que estás buscando</p>
      </div>

      {/* Form */}
      <div className="flex-1 px-4 pb-4 space-y-4 overflow-y-auto">
        {/* Category Selector */}
        <div className="relative">
          <label className="text-sm font-medium text-foreground mb-2 block">Categoría</label>
          <button
            onClick={() => setShowCategoryPicker(!showCategoryPicker)}
            className="w-full px-4 py-3 bg-secondary rounded-xl flex items-center justify-between text-left"
          >
            <span className={selectedCategory ? "text-foreground" : "text-muted-foreground"}>
              {selectedCategory ? categories.find((c) => c.id === selectedCategory)?.name : "Selecciona una categoría"}
            </span>
            <ChevronDown
              className={`w-5 h-5 text-muted-foreground transition-transform ${showCategoryPicker ? "rotate-180" : ""}`}
            />
          </button>
          {showCategoryPicker && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-card rounded-xl border border-border shadow-lg z-10 overflow-hidden">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleCategorySelect(cat.id)}
                  className="w-full px-4 py-3 flex items-center gap-3 hover:bg-secondary transition-colors"
                >
                  <span className="text-xl">{cat.emoji}</span>
                  <span className="text-foreground font-medium">{cat.name}</span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground ml-auto" />
                </button>
              ))}
            </div>
          )}
        </div>

        {selectedCategory && (
          <div className="relative">
            <label className="text-sm font-medium text-foreground mb-2 block">Subcategoría</label>
            <button
              onClick={() => setShowSubcategoryPicker(!showSubcategoryPicker)}
              className="w-full px-4 py-3 bg-secondary rounded-xl flex items-center justify-between text-left"
            >
              <span className={selectedSubcategory ? "text-foreground" : "text-muted-foreground"}>
                {selectedSubcategory || "Selecciona una subcategoría"}
              </span>
              <ChevronDown
                className={`w-5 h-5 text-muted-foreground transition-transform ${showSubcategoryPicker ? "rotate-180" : ""}`}
              />
            </button>
            {showSubcategoryPicker && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-card rounded-xl border border-border shadow-lg z-10 overflow-hidden max-h-48 overflow-y-auto">
                {subcategories.map((sub) => (
                  <button
                    key={sub}
                    onClick={() => {
                      setSelectedSubcategory(sub)
                      setShowSubcategoryPicker(false)
                    }}
                    className="w-full px-4 py-3 flex items-center gap-3 hover:bg-secondary transition-colors"
                  >
                    <span className="text-foreground">{sub}</span>
                    {selectedSubcategory === sub && <Check className="w-5 h-5 text-primary ml-auto" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {isSportsCategory && selectedSubcategory && (
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              <span className="flex items-center gap-2">
                <Dumbbell className="w-4 h-4" />
                Nivel de juego
              </span>
            </label>
            <div className="grid grid-cols-5 gap-2">
              {skillLevelLabels.map((item) => (
                <button
                  key={item.level}
                  onClick={() => setSkillLevel(item.level)}
                  className={`flex flex-col items-center p-3 rounded-xl border-2 transition-all ${
                    skillLevel === item.level
                      ? "border-primary bg-primary/10"
                      : "border-border bg-secondary hover:border-primary/50"
                  }`}
                >
                  <div className="flex items-center gap-0.5 mb-1">
                    {Array.from({ length: item.level }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3 h-3 ${
                          skillLevel === item.level
                            ? "fill-primary text-primary"
                            : "fill-muted-foreground/50 text-muted-foreground/50"
                        }`}
                      />
                    ))}
                  </div>
                  <span
                    className={`text-xs font-medium ${skillLevel === item.level ? "text-primary" : "text-muted-foreground"}`}
                  >
                    {item.level}
                  </span>
                </button>
              ))}
            </div>
            {skillLevel && (
              <div className="mt-2 px-3 py-2 bg-primary/10 rounded-lg">
                <p className="text-sm font-medium text-primary">{skillLevelLabels[skillLevel - 1].label}</p>
                <p className="text-xs text-muted-foreground">{skillLevelLabels[skillLevel - 1].description}</p>
              </div>
            )}
          </div>
        )}

        {/* Title */}
        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">Título</label>
          <div className="relative">
            <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Ej: Busco uno para pádel"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-secondary rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
        </div>

        {/* Location - Added Google Maps search button */}
        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">Lugar</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Ej: Club Palermo, CABA"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full pl-10 pr-12 py-3 bg-secondary rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <button
              type="button"
              onClick={openGoogleMapsSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-background/50 rounded-lg transition-colors"
              title="Buscar en Google Maps"
            >
              <ExternalLink className="w-4 h-4 text-primary" />
            </button>
          </div>
          {/* Google Maps search link */}
          <button
            type="button"
            onClick={openGoogleMapsSearch}
            className="mt-2 flex items-center gap-2 text-sm text-primary hover:underline"
          >
            <Search className="w-4 h-4" />
            Buscar ubicación en Google Maps
          </button>
        </div>

        {/* Date and Time */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Fecha</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-secondary rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Hora</label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-secondary rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </div>
        </div>

        {/* Spots */}
        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">Cupos disponibles</label>
          <div className="relative">
            <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="number"
              min="1"
              max="20"
              value={spots}
              onChange={(e) => setSpots(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-secondary rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">Notas adicionales</label>
          <textarea
            placeholder="Cualquier información adicional..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full px-4 py-3 bg-secondary rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
          />
        </div>
         
        {/* Age Range */}
<div className="space-y-2">
  <label className="text-sm font-medium">
    Rango de edad
  </label>

  <div className="flex gap-4">
    <div className="flex-1">
      <label className="text-xs text-muted-foreground">
        Edad mínima
      </label>
      <Input
        type="number"
        min={18}
        max={99}
        value={ageMin}
        onChange={(e) => setAgeMin(Number(e.target.value))}
      />
    </div>

    <div className="flex-1">
      <label className="text-xs text-muted-foreground">
        Edad máxima
      </label>
      <Input
        type="number"
        min={18}
        max={99}
        value={ageMax}
        onChange={(e) => setAgeMax(Number(e.target.value))}
      />
    </div>
  </div>
</div>
 
        {/* Publish Button */}
        <Button
          onClick={handlePublish}
          disabled={!isFormValid || isPublishing}
          className="w-full py-6 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-bold text-lg shadow-lg disabled:opacity-50"
        >
          {isPublishing ? "Publicando..." : "Publicar"}
        </Button>
      </div>
    </div>
  )
}