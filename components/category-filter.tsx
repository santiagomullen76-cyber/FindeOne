"use client"

import { Dumbbell, Plane, Coffee, BookOpen } from "lucide-react"

interface CategoryFilterProps {
  selected: string | null
  onSelect: (category: string | null) => void
}

const categories = [
  { id: "sports", name: "Deportes", icon: Dumbbell, color: "bg-sports" },
  { id: "travel", name: "Viajes", icon: Plane, color: "bg-travel" },
  { id: "leisure", name: "Ocio", icon: Coffee, color: "bg-leisure" },
  { id: "studies", name: "Estudios", icon: BookOpen, color: "bg-studies" },
]

export function CategoryFilter({ selected, onSelect }: CategoryFilterProps) {
  return (
    <div className="px-4 pb-3">
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        <button
          onClick={() => onSelect(null)}
          className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            selected === null
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-muted-foreground hover:bg-secondary/80"
          }`}
        >
          Todos
        </button>
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onSelect(category.id)}
            className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selected === category.id
                ? `${category.color} text-white`
                : "bg-secondary text-muted-foreground hover:bg-secondary/80"
            }`}
          >
            <category.icon className="w-4 h-4" />
            {category.name}
          </button>
        ))}
      </div>
    </div>
  )
}
