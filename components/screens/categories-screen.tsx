"use client"

import { useState } from "react"
import { Dumbbell, Plane, Coffee, BookOpen, Bike, ArrowLeft } from "lucide-react"
import { FindOneLogo } from "@/components/findone-logo"
import { useI18n } from "@/lib/i18n-context"

export const CategoriesScreen = ({
  onNavigate,
}: { onNavigate?: (screen: string, filter?: { category: string; subcategory: string }) => void }) => {
  const { t } = useI18n()
  const [selectedCategory, setSelectedCategory] = useState<(typeof categories)[0] | null>(null)

  const getCategories = () => [
    {
      id: "sports",
      name: t("categories.sports"),
      icon: Dumbbell,
      color: "bg-sports",
      lightColor: "bg-sports/10",
      description: t("categories.sportsDesc"),
      subcategories: [
        t("subcategories.tennis"),
        t("subcategories.padel"),
        t("subcategories.football"),
        t("subcategories.squash"),
        t("subcategories.running"),
        t("subcategories.cycling"),
        t("subcategories.skating"),
        t("subcategories.rollerblading"),
      ],
    },
    {
      id: "travel",
      name: t("categories.travel"),
      icon: Plane,
      color: "bg-travel",
      lightColor: "bg-travel/10",
      description: t("categories.travelDesc"),
      subcategories: [
        t("subcategories.travelCompanion"),
        t("subcategories.shareRoute"),
        t("subcategories.getaways"),
        t("subcategories.backpackers"),
        t("subcategories.roadTrips"),
      ],
    },
    {
      id: "leisure",
      name: t("categories.leisure"),
      icon: Coffee,
      color: "bg-leisure",
      lightColor: "bg-leisure/10",
      description: t("categories.leisureDesc"),
      subcategories: [
        t("subcategories.cinema"),
        t("subcategories.reading"),
        t("subcategories.walking"),
        t("subcategories.park"),
        t("subcategories.talks"),
        t("subcategories.concerts"),
        t("subcategories.museums"),
      ],
    },
    {
      id: "studies",
      name: t("categories.studies"),
      icon: BookOpen,
      color: "bg-studies",
      lightColor: "bg-studies/10",
      description: t("categories.studiesDesc"),
      subcategories: [
        t("subcategories.debates"),
        t("subcategories.bookClubs"),
        t("subcategories.exchangeIdeas"),
        t("subcategories.languages"),
        t("subcategories.tutoring"),
      ],
    },
    {
      id: "motos",
      name: t("categories.motos"),
      icon: Bike,
      color: "bg-motos",
      lightColor: "bg-motos/10",
      description: t("categories.motosDesc"),
      subcategories: [
        t("subcategories.motoCross"),
        t("subcategories.enduro"),
        t("subcategories.trailAdventure"),
        t("subcategories.rutaDeportiva"),
        t("subcategories.naked"),
        t("subcategories.chopperCustomCruiser"),
        t("subcategories.touringGranTurismo"),
        t("subcategories.scooter"),
        t("subcategories.streetUrbana"),
        t("subcategories.cafeRacer"),
        t("subcategories.bobber"),
      ],
    },
  ]

  const categories = getCategories()

  const handleSubcategoryClick = (subcategory: string) => {
    if (onNavigate && selectedCategory) {
      onNavigate("home", {
        category: selectedCategory.id,
        subcategory: subcategory,
      })
    }
  }

  if (selectedCategory) {
    return (
      <div className="flex flex-col h-full bg-background">
        {/* Header */}
        <div className="px-4 py-3 bg-card border-b border-border flex items-center gap-3">
          <button
            onClick={() => setSelectedCategory(null)}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-secondary text-foreground hover:bg-secondary/80 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold text-foreground">{selectedCategory.name}</h1>
        </div>

        {/* Subcategories Grid */}
        <div className="flex-1 p-4">
          <div className="grid grid-cols-2 gap-3">
            {selectedCategory.subcategories.map((sub) => (
              <button
                key={sub}
                onClick={() => handleSubcategoryClick(sub)}
                className="p-4 bg-card rounded-2xl border border-border hover:border-primary/50 hover:shadow-md transition-all text-left"
              >
                <span className="font-medium text-foreground">{sub}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="px-4 py-3 bg-card border-b border-border">
        <FindOneLogo />
      </div>

      {/* Title */}
      <div className="px-4 py-4">
        <h1 className="text-2xl font-bold text-foreground">{t("nav.categories")}</h1>
        <p className="text-muted-foreground mt-1">{t("categories.explore")}</p>
      </div>

      {/* Categories Grid */}
      <div className="flex-1 px-4 pb-4">
        <div className="grid grid-cols-2 gap-4">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category)}
              className="relative overflow-hidden rounded-3xl aspect-square bg-card border border-border hover:border-primary/50 hover:shadow-lg transition-all group"
            >
              <div className={`absolute inset-0 ${category.lightColor} opacity-50`} />
              <div className="relative h-full p-5 flex flex-col items-center justify-center text-center">
                <div
                  className={`w-16 h-16 ${category.color} rounded-2xl flex items-center justify-center mb-3 shadow-lg group-hover:scale-110 transition-transform`}
                >
                  <category.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-bold text-foreground text-lg mb-1">{category.name}</h3>
                <p className="text-xs text-muted-foreground line-clamp-2">{category.description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
