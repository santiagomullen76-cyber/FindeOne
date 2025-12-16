"use client"

import { useState } from "react"
import {
  Settings,
  Edit2,
  LogOut,
  ChevronRight,
  Star,
  Shield,
  Camera,
  UserCheck,
  Clock3,
  TrendingUp,
  ArrowLeft,
  Bell,
  Lock,
  Moon,
  Globe,
  HelpCircle,
  FileText,
  Trash2,
  X,
  Check,
  Sun,
  Monitor,
  Key,
  ShieldCheck,
  AlertCircle,
  ChevronLeft,
  Palette,
  CheckCircle2,
  Clock,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { FindOneLogo } from "@/components/findone-logo"
import { useUser } from "@/lib/user-context"
import type { UserRating } from "@/lib/user-context"
import { useI18n } from "@/lib/i18n-context"
import { useActivities } from "@/lib/activities-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { LocationSearch } from "@/components/location-search"
import { getUserInitials } from "@/lib/utils"
import { useTheme } from "@/lib/theme-context"

interface ProfileScreenProps {
  onLogout?: () => void
  viewingUserId?: string
}

export function ProfileScreen({ onLogout, viewingUserId }: ProfileScreenProps) {
  const { user, logout, updateProfile, changePassword } = useUser()
  const { language, setLanguage, t } = useI18n()
  const { getActivitiesByCreator, getActivitiesJoinedBy } = useActivities()
  const { theme, setTheme } = useTheme()
  const [showSettings, setShowSettings] = useState(false)
  const [showEditProfile, setShowEditProfile] = useState(false)
  const [activeSettingsPanel, setActiveSettingsPanel] = useState<string | null>(null)
  const [showRatings, setShowRatings] = useState(false)
  const [notifications, setNotifications] = useState({
    activityRequests: true,
    activityUpdates: true,
    newMessages: true,
    reminders: true,
    marketing: false,
  })
  const [privacy, setPrivacy] = useState({
    profileVisibility: "public" as "public" | "connections" | "private",
    showLocation: true,
    showPhone: false,
    showStats: true,
  })
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false) // Declared the variable here

  const [editForm, setEditForm] = useState({
    name: user?.name || "",
    lastName: user?.lastName || "",
    bio: user?.bio || "",
    phone: user?.phone || "",
    location: user?.location || "",
  })

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [passwordError, setPasswordError] = useState("")
  const [passwordSuccess, setPasswordSuccess] = useState(false)

  const handleLogout = () => {
    logout()
    if (onLogout) {
      onLogout()
    }
  }

  const handlePasswordChange = async () => {
    setPasswordError("")
    setPasswordSuccess(false)

    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setPasswordError(t("profileScreen.errors.completeFields"))
      return
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError(t("profileScreen.errors.passwordMismatch"))
      return
    }

    if (passwordForm.newPassword.length < 8) {
      setPasswordError(t("profileScreen.errors.passwordLength"))
      return
    }

    const result = await changePassword(passwordForm.currentPassword, passwordForm.newPassword)

    if (result.success) {
      setPasswordSuccess(true)
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" })
      setTimeout(() => {
        setPasswordSuccess(false)
        setActiveSettingsPanel(null)
      }, 2000)
    } else {
      setPasswordError(result.message)
    }
  }

  // Default demo user if not logged in
  const displayUser = user || {
    name: "Usuario",
    lastName: "Demo",
    bio: "Inicia sesión para ver tu perfil completo",
    avatar: null,
    isVerified: false,
    stats: { activitiesCreated: 0, activitiesJoined: 0, connections: 0 },
    interests: [],
    ratings: [] as UserRating[],
    averageRating: 0,
    location: "",
    attendanceStats: {
      totalActivities: 0,
      attended: 0,
      onTime: 0,
      attendanceRate: 100,
      punctualityRate: 100,
    },
  }

  const fullName =
    displayUser.name && displayUser.lastName
      ? `${displayUser.name} ${displayUser.lastName}`.trim()
      : displayUser.name || displayUser.lastName || "Usuario"

  const menuItems = [
    { label: t("profileScreen.menu.editProfile"), icon: Edit2, action: () => setShowEditProfile(true) },
    { label: t("profileScreen.menu.settings"), icon: Settings, action: () => setShowSettings(true) },
    { label: t("profileScreen.menu.logout"), icon: LogOut, danger: true, action: handleLogout },
  ]

  const settingsItems = [
    {
      id: "password",
      label: t("profileScreen.settings.password"),
      icon: Key,
      description: t("profileScreen.settings.passwordDesc"),
    },
    {
      id: "notifications",
      label: t("profileScreen.settings.notifications"),
      icon: Bell,
      description: t("profileScreen.settings.notificationsDesc"),
    },
    {
      id: "privacy",
      label: t("profileScreen.settings.privacy"),
      icon: Lock,
      description: t("profileScreen.settings.privacyDesc"),
    },
    {
      id: "language",
      label: t("profileScreen.settings.language"),
      icon: Globe,
      description: t("profileScreen.settings.languageDesc"),
    },
    {
      id: "appearance",
      label: t("profileScreen.settings.appearance"),
      icon: Palette, // Changed from Moon to Palette for better general representation
      description: t("profileScreen.settings.appearanceDesc"),
    },
    {
      id: "help",
      label: t("profileScreen.settings.help"),
      icon: HelpCircle,
      description: t("profileScreen.settings.helpDesc"),
    },
    {
      id: "terms",
      label: t("profileScreen.settings.terms"),
      icon: FileText,
      description: t("profileScreen.settings.termsDesc"),
    },
  ]

  const getStatColor = (percentage: number) => {
    if (percentage >= 80) return "text-green-500"
    if (percentage >= 60) return "text-amber-500"
    return "text-destructive"
  }

  const handleSaveProfile = () => {
    updateProfile({
      name: editForm.name,
      lastName: editForm.lastName,
      bio: editForm.bio,
      phone: editForm.phone,
      location: editForm.location,
    })
    setShowEditProfile(false)
  }

  const renderSettingsPanel = () => {
    switch (activeSettingsPanel) {
      case "notifications":
        return (
          <div className="flex flex-col h-full bg-background">
            <div className="px-4 py-3 bg-card border-b border-border flex items-center gap-3">
              <button
                onClick={() => setActiveSettingsPanel(null)}
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-secondary transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-foreground" />
              </button>
              <h1 className="text-lg font-semibold text-foreground">{t("profileScreen.settings.notifications")}</h1>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {[
                {
                  key: "activityRequests",
                  label: t("profileScreen.settings.activityRequests"),
                  desc: t("profileScreen.settings.activityRequestsDesc"),
                },
                {
                  key: "activityUpdates",
                  label: t("profileScreen.settings.activityUpdates"),
                  desc: t("profileScreen.settings.activityUpdatesDesc"),
                },
                {
                  key: "newMessages",
                  label: t("profileScreen.settings.newMessages"),
                  desc: t("profileScreen.settings.newMessagesDesc"),
                },
                {
                  key: "reminders",
                  label: t("profileScreen.settings.reminders"),
                  desc: t("profileScreen.settings.remindersDesc"),
                },
                {
                  key: "marketing",
                  label: t("profileScreen.settings.marketing"),
                  desc: t("profileScreen.settings.marketingDesc"),
                },
              ].map((item) => (
                <div
                  key={item.key}
                  className="flex items-center justify-between p-4 bg-card rounded-xl border border-border"
                >
                  <div>
                    <p className="font-medium text-foreground">{item.label}</p>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                  <Switch
                    checked={notifications[item.key as keyof typeof notifications]}
                    onCheckedChange={() =>
                      setNotifications({
                        ...notifications,
                        [item.key as keyof typeof notifications]:
                          !notifications[item.key as keyof typeof notifications],
                      })
                    }
                  />
                </div>
              ))}
            </div>
          </div>
        )

      case "privacy":
        return (
          <div className="flex flex-col h-full bg-background">
            <div className="px-4 py-3 bg-card border-b border-border flex items-center gap-3">
              <button
                onClick={() => setActiveSettingsPanel(null)}
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-secondary transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-foreground" />
              </button>
              <h1 className="text-lg font-semibold text-foreground">{t("profileScreen.settings.privacy")}</h1>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div className="bg-card rounded-xl border border-border p-4">
                <p className="font-medium text-foreground mb-3">{t("profileScreen.settings.profileVisibility")}</p>
                {[
                  {
                    value: "public",
                    label: t("profileScreen.settings.visibilityPublic"),
                    desc: t("profileScreen.settings.visibilityPublicDesc"),
                  },
                  {
                    value: "connections",
                    label: t("profileScreen.settings.visibilityConnections"),
                    desc: t("profileScreen.settings.visibilityConnectionsDesc"),
                  },
                  {
                    value: "private",
                    label: t("profileScreen.settings.visibilityPrivate"),
                    desc: t("profileScreen.settings.visibilityPrivateDesc"),
                  },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() =>
                      setPrivacy({ ...privacy, profileVisibility: option.value as typeof privacy.profileVisibility })
                    }
                    className={`w-full flex items-center justify-between p-3 rounded-lg mb-2 transition-colors ${
                      privacy.profileVisibility === option.value
                        ? "bg-primary/10 border border-primary"
                        : "bg-secondary/50"
                    }`}
                  >
                    <div className="text-left">
                      <p className="font-medium text-foreground">{option.label}</p>
                      <p className="text-sm text-muted-foreground">{option.desc}</p>
                    </div>
                    {privacy.profileVisibility === option.value && <Check className="w-5 h-5 text-primary" />}
                  </button>
                ))}
              </div>

              <div className="space-y-3">
                {[
                  {
                    key: "showLocation",
                    label: t("profileScreen.settings.showLocation"),
                    desc: t("profileScreen.settings.showLocationDesc"),
                  },
                  {
                    key: "showPhone",
                    label: t("profileScreen.settings.showPhone"),
                    desc: t("profileScreen.settings.showPhoneDesc"),
                  },
                  {
                    key: "showStats",
                    label: t("profileScreen.settings.showStats"),
                    desc: t("profileScreen.settings.showStatsDesc"),
                  },
                ].map((item) => (
                  <div
                    key={item.key}
                    className="flex items-center justify-between p-4 bg-card rounded-xl border border-border"
                  >
                    <div>
                      <p className="font-medium text-foreground">{item.label}</p>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                    <Switch
                      checked={privacy[item.key as keyof typeof privacy]}
                      onCheckedChange={() =>
                        setPrivacy({ ...privacy, [item.key]: !privacy[item.key as keyof typeof privacy] })
                      }
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )

      case "password":
        return (
          <div className="flex flex-col h-full bg-background">
            <div className="px-4 py-3 bg-card border-b border-border flex items-center gap-3">
              <button
                onClick={() => {
                  setActiveSettingsPanel(null)
                  setPasswordError("")
                  setPasswordSuccess(false)
                  setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" })
                }}
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-secondary transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-foreground" />
              </button>
              <h1 className="text-lg font-semibold text-foreground">{t("profileScreen.settings.password")}</h1>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <div className="bg-card rounded-xl border border-border p-4 space-y-4">
                {passwordError && (
                  <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-xl flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-destructive" />
                    <p className="text-sm text-destructive font-medium">{passwordError}</p>
                  </div>
                )}

                {passwordSuccess && (
                  <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center gap-2">
                    <Check className="w-5 h-5 text-green-600" />
                    <p className="text-sm text-green-600 font-medium">{t("profileScreen.settings.passwordSuccess")}</p>
                  </div>
                )}

                <div>
                  <Label className="block text-sm font-medium text-foreground mb-2">
                    {t("profileScreen.settings.currentPassword")}
                  </Label>
                  <Input
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    placeholder={t("profileScreen.settings.currentPasswordPlaceholder")}
                    className="w-full px-4 py-3 bg-secondary rounded-xl border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <Label className="block text-sm font-medium text-foreground mb-2">
                    {t("profileScreen.settings.newPassword")}
                  </Label>
                  <Input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    placeholder={t("profileScreen.settings.newPasswordPlaceholder")}
                    className="w-full px-4 py-3 bg-secondary rounded-xl border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <Label className="block text-sm font-medium text-foreground mb-2">
                    {t("profileScreen.settings.confirmPassword")}
                  </Label>
                  <Input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    placeholder={t("profileScreen.settings.confirmPasswordPlaceholder")}
                    className="w-full px-4 py-3 bg-secondary rounded-xl border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="bg-primary/10 rounded-xl p-3 flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-muted-foreground">
                    <p className="font-medium text-foreground mb-1">{t("profileScreen.settings.securityTips")}</p>
                    <ul className="list-disc list-inside space-y-1 text-xs">
                      <li>{t("profileScreen.settings.tip1")}</li>
                      <li>{t("profileScreen.settings.tip2")}</li>
                      <li>{t("profileScreen.settings.tip3")}</li>
                    </ul>
                  </div>
                </div>

                <Button onClick={handlePasswordChange} disabled={passwordSuccess} className="w-full">
                  {passwordSuccess
                    ? t("profileScreen.settings.passwordUpdated")
                    : t("profileScreen.settings.changePassword")}
                </Button>
              </div>
            </div>
          </div>
        )

      case "appearance":
        return (
          <div className="flex flex-col h-full bg-background">
            <div className="px-4 py-3 bg-card border-b border-border flex items-center gap-3">
              <button
                onClick={() => setActiveSettingsPanel(null)}
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-secondary transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-foreground" />
              </button>
              <h1 className="text-lg font-semibold text-foreground">{t("profileScreen.settings.appearance")}</h1>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <div className="bg-card rounded-xl border border-border p-4">
                <p className="font-medium text-foreground mb-4">{t("profileScreen.settings.appTheme")}</p>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: "light", label: t("profileScreen.settings.themeLight"), icon: Sun },
                    { value: "dark", label: t("profileScreen.settings.themeDark"), icon: Moon },
                    { value: "system", label: t("profileScreen.settings.themeSystem"), icon: Monitor },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setTheme(option.value as typeof theme)}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl transition-colors ${
                        theme === option.value ? "bg-primary/10 border-2 border-primary" : "bg-secondary/50"
                      }`}
                    >
                      <option.icon
                        className={`w-6 h-6 ${theme === option.value ? "text-primary" : "text-muted-foreground"}`}
                      />
                      <span
                        className={`text-sm font-medium ${theme === option.value ? "text-primary" : "text-foreground"}`}
                      >
                        {option.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )

      case "language":
        return (
          <div className="flex flex-col h-full bg-background">
            <div className="px-4 py-3 bg-card border-b border-border flex items-center gap-3">
              <button
                onClick={() => setActiveSettingsPanel(null)}
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-secondary transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-foreground" />
              </button>
              <h1 className="text-lg font-semibold text-foreground">{t("profileScreen.settings.language")}</h1>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <div className="bg-card rounded-xl border border-border overflow-hidden">
                {[
                  { code: "es-AR", label: t("profileScreen.settings.languageEsAr"), flag: "🇦🇷" },
                  { code: "es-ES", label: t("profileScreen.settings.languageEsEs"), flag: "🇪🇸" },
                  { code: "en-US", label: t("profileScreen.settings.languageEnUs"), flag: "🇺🇸" },
                  { code: "pt-BR", label: t("profileScreen.settings.languagePtBr"), flag: "🇧🇷" },
                  { code: "fr-FR", label: t("profileScreen.settings.languageFrFr"), flag: "🇫🇷" },
                ].map((lang, index) => (
                  <button
                    key={lang.code}
                    onClick={() => setLanguage(lang.code)}
                    className={`w-full flex items-center justify-between p-4 transition-colors hover:bg-secondary/50 ${
                      index !== 4 ? "border-b border-border" : ""
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{lang.flag}</span>
                      <span className="font-medium text-foreground">{lang.label}</span>
                    </div>
                    {language === lang.code && <Check className="w-5 h-5 text-primary" />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )

      case "help":
        return (
          <div className="flex flex-col h-full bg-background">
            <div className="px-4 py-3 bg-card border-b border-border flex items-center gap-3">
              <button
                onClick={() => setActiveSettingsPanel(null)}
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-secondary transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-foreground" />
              </button>
              <h1 className="text-lg font-semibold text-foreground">{t("profileScreen.settings.help")}</h1>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {[
                {
                  title: t("profileScreen.faq.createActivity"),
                  content: t("profileScreen.faq.createActivityContent"),
                },
                {
                  title: t("profileScreen.faq.joinActivity"),
                  content: t("profileScreen.faq.joinActivityContent"),
                },
                {
                  title: t("profileScreen.faq.verifyAccount"),
                  content: t("profileScreen.faq.verifyAccountContent"),
                },
                {
                  title: t("profileScreen.faq.rateUser"),
                  content: t("profileScreen.faq.rateUserContent"),
                },
                {
                  title: t("profileScreen.faq.reportProblem"),
                  content: t("profileScreen.faq.reportProblemContent"),
                },
              ].map((faq, index) => (
                <details key={index} className="bg-card rounded-xl border border-border overflow-hidden group">
                  <summary className="p-4 font-medium text-foreground cursor-pointer flex items-center justify-between list-none">
                    {faq.title}
                    <ChevronRight className="w-5 h-5 text-muted-foreground transition-transform group-open:rotate-90" />
                  </summary>
                  <div className="px-4 pb-4 text-sm text-muted-foreground">{faq.content}</div>
                </details>
              ))}

              <div className="mt-6 p-4 bg-primary/10 rounded-xl">
                <p className="font-medium text-foreground mb-2">{t("profileScreen.settings.needMoreHelp")}</p>
                <p className="text-sm text-muted-foreground mb-3">{t("profileScreen.settings.supportAvailable")}</p>
                <Button className="w-full">{t("profileScreen.settings.contactSupport")}</Button>
              </div>
            </div>
          </div>
        )

      case "terms":
        return (
          <div className="flex flex-col h-full bg-background">
            <div className="px-4 py-3 bg-card border-b border-border flex items-center gap-3">
              <button
                onClick={() => setActiveSettingsPanel(null)}
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-secondary transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-foreground" />
              </button>
              <h1 className="text-lg font-semibold text-foreground">{t("profileScreen.settings.terms")}</h1>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <div className="bg-card rounded-xl border border-border p-4 space-y-4">
                <div>
                  <h2 className="font-semibold text-foreground mb-2">{t("profileScreen.terms.acceptance")}</h2>
                  <p className="text-sm text-muted-foreground">{t("profileScreen.terms.acceptanceContent")}</p>
                </div>
                <div>
                  <h2 className="font-semibold text-foreground mb-2">{t("profileScreen.terms.usage")}</h2>
                  <p className="text-sm text-muted-foreground">{t("profileScreen.terms.usageContent")}</p>
                </div>
                <div>
                  <h2 className="font-semibold text-foreground mb-2">{t("profileScreen.terms.userBehavior")}</h2>
                  <p className="text-sm text-muted-foreground">{t("profileScreen.terms.userBehaviorContent")}</p>
                </div>
                <div>
                  <h2 className="font-semibold text-foreground mb-2">{t("profileScreen.terms.privacy")}</h2>
                  <p className="text-sm text-muted-foreground">{t("profileScreen.terms.privacyContent")}</p>
                </div>
                <div>
                  <h2 className="font-semibold text-foreground mb-2">{t("profileScreen.terms.responsibility")}</h2>
                  <p className="text-sm text-muted-foreground">{t("profileScreen.terms.responsibilityContent")}</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground text-center mt-4">{t("profileScreen.terms.lastUpdated")}</p>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  if (activeSettingsPanel) {
    return renderSettingsPanel()
  }

  if (showSettings) {
    return (
      <div className="flex flex-col h-full bg-background">
        {/* Header */}
        <div className="px-4 py-3 bg-card border-b border-border flex items-center gap-3">
          <button
            onClick={() => setShowSettings(false)}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-secondary transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="text-lg font-semibold text-foreground">{t("profileScreen.settings")}</h1>
        </div>

        {/* Settings list */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 space-y-2">
            {settingsItems.map((item) => (
              <button
                key={item.label}
                onClick={() => setActiveSettingsPanel(item.id)}
                className="w-full px-4 py-4 bg-card rounded-xl border border-border flex items-center gap-4 hover:bg-secondary/50 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <item.icon className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-medium text-foreground">{item.label}</p>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </button>
            ))}
          </div>

          {/* Danger zone */}
          <div className="p-4 border-t border-border">
            <p className="text-sm font-medium text-muted-foreground mb-3">{t("profileScreen.settings.dangerZone")}</p>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full px-4 py-4 bg-destructive/10 rounded-xl border border-destructive/20 flex items-center gap-4 hover:bg-destructive/20 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-destructive" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-medium text-destructive">{t("profileScreen.settings.deleteAccount")}</p>
                <p className="text-sm text-destructive/70">{t("profileScreen.settings.deleteAccountDesc")}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-destructive/50" />
            </button>
          </div>

          {/* App version */}
          <div className="p-4 text-center">
            <p className="text-xs text-muted-foreground">{t("profileScreen.settings.appVersion")}</p>
            <p className="text-xs text-muted-foreground">{t("profileScreen.settings.madeWithLove")}</p>
          </div>
        </div>
      </div>
    )
  }

  if (showEditProfile) {
    return (
      <div className="flex flex-col h-full bg-background">
        {/* Header */}
        <div className="px-4 py-3 bg-card border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowEditProfile(false)}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-secondary transition-colors"
            >
              <X className="w-5 h-5 text-foreground" />
            </button>
            <h1 className="text-lg font-semibold text-foreground">{t("profileScreen.editProfile.title")}</h1>
          </div>
          <Button onClick={handleSaveProfile} className="text-sm font-medium">
            {t("profileScreen.editProfile.save")}
          </Button>
        </div>

        {/* Edit form */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Avatar */}
          <div className="flex justify-center">
            <div className="relative">
              <Avatar className="w-24 h-24 border-4 border-primary/20">
                <AvatarImage src={displayUser.avatar || "/placeholder.svg"} alt={fullName} />
                <AvatarFallback className="bg-primary/10 text-primary text-3xl font-bold">
                  {getUserInitials(displayUser.name || "", displayUser.lastName || "")}
                </AvatarFallback>
              </Avatar>
              <button className="absolute bottom-0 right-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground">
                <Camera className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Form fields */}
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-foreground mb-1 block">
                {t("profileScreen.editProfile.name")}
              </Label>
              <Input
                type="text"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                className="w-full px-4 py-3 bg-card border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-foreground mb-1 block">
                {t("profileScreen.editProfile.lastName")}
              </Label>
              <Input
                type="text"
                value={editForm.lastName}
                onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                className="w-full px-4 py-3 bg-card border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-foreground mb-1 block">
                {t("profileScreen.editProfile.bio")}
              </Label>
              <Textarea
                value={editForm.bio}
                onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                className="w-full px-4 py-3 bg-card border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                placeholder={t("profileScreen.editProfile.bioPlaceholder")}
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-foreground mb-1 block">
                {t("profileScreen.editProfile.phone")}
              </Label>
              <Input
                type="tel"
                value={editForm.phone}
                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                className="w-full px-4 py-3 bg-card border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-foreground mb-1 block">
                {t("profileScreen.editProfile.location")}
              </Label>
              <LocationSearch
                value={editForm.location}
                onChange={(location) => setEditForm({ ...editForm, location: location })}
                placeholder={t("profileScreen.editProfile.locationPlaceholder")}
                className="w-full px-4 py-3 bg-card border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        </div>
      </div>
    )
  }

  // If viewing another user's profile, we don't show edit/settings options
  if (viewingUserId) {
    return (
      <div className="flex flex-col h-full bg-background">
        {/* Header */}
        <div className="px-4 py-3 bg-card border-b border-border flex items-center justify-between">
          <button
            onClick={() => history.back()} // Use history.back() for navigation
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-secondary transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="text-lg font-semibold text-foreground">{t("profileScreen.profile")}</h1>
          {/* No settings button for other users */}
        </div>

        {/* Profile Header */}
        <div className="px-4 py-6 bg-card border-b border-border">
          <div className="flex items-center gap-4">
            <Avatar className="w-20 h-20 border-4 border-primary/20">
              <AvatarImage src={displayUser.avatar || "/placeholder.svg"} alt={fullName} />
              <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
                {getUserInitials(displayUser.name || "", displayUser.lastName || "")}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-foreground">{fullName}</h1>
                {displayUser.isVerified && <Shield className="w-5 h-5 text-primary fill-primary/20" />}
              </div>

              {/* Rating */}
              {displayUser.ratings && displayUser.ratings.length > 0 && (
                <div className="flex items-center gap-1 mt-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${
                        star <= Math.round(displayUser.averageRating)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-muted-foreground"
                      }`}
                    />
                  ))}
                  <span className="text-sm text-muted-foreground ml-1">
                    {displayUser.averageRating.toFixed(1)} ({displayUser.ratings.length})
                  </span>
                </div>
              )}

              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{displayUser.bio}</p>

              {!displayUser.isVerified && (
                <span className="inline-flex items-center gap-1 mt-2 px-2 py-1 bg-yellow-500/10 text-yellow-600 rounded-full text-xs">
                  <Shield className="w-3 h-3" />
                  {t("profileScreen.emailNotVerified")}
                </span>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">{displayUser.stats.activitiesCreated}</p>
              <p className="text-xs text-muted-foreground">{t("profileScreen.stats.created")}</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">{displayUser.stats.activitiesJoined}</p>
              <p className="text-xs text-muted-foreground">{t("profileScreen.stats.joined")}</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">{displayUser.stats.connections}</p>
              <p className="text-xs text-muted-foreground">{t("profileScreen.stats.connections")}</p>
            </div>
          </div>
        </div>

        {displayUser.attendanceStats && displayUser.attendanceStats.totalActivities > 0 && (
          <div className="px-4 py-4 border-b border-border">
            <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              {t("profileScreen.userReputation")}
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-card rounded-xl p-3 border border-border">
                <div className="flex items-center gap-2 mb-1">
                  <UserCheck className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{t("profileScreen.stats.attendance")}</span>
                </div>
                <p className={`text-xl font-bold ${getStatColor(displayUser.attendanceStats.attendanceRate)}`}>
                  {displayUser.attendanceStats.attendanceRate}%
                </p>
                <p className="text-xs text-muted-foreground">
                  {displayUser.attendanceStats.attended} de {displayUser.attendanceStats.totalActivities}{" "}
                  {t("profileScreen.stats.events")}
                </p>
              </div>
              <div className="bg-card rounded-xl p-3 border border-border">
                <div className="flex items-center gap-2 mb-1">
                  <Clock3 className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{t("profileScreen.stats.punctuality")}</span>
                </div>
                <p className={`text-xl font-bold ${getStatColor(displayUser.attendanceStats.punctualityRate)}`}>
                  {displayUser.attendanceStats.punctualityRate}%
                </p>
                <p className="text-xs text-muted-foreground">
                  {displayUser.attendanceStats.onTime} de {displayUser.attendanceStats.attended}{" "}
                  {t("profileScreen.stats.onTime")}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Interests */}
        {displayUser.interests.length > 0 && (
          <div className="px-4 py-4">
            <h2 className="text-sm font-semibold text-foreground mb-3">{t("profileScreen.interests")}</h2>
            <div className="flex flex-wrap gap-2">
              {displayUser.interests.map((interest) => (
                <span
                  key={interest}
                  className="px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium"
                >
                  {interest}
                </span>
              ))}
            </div>
          </div>
        )}

        {displayUser.ratings && displayUser.ratings.length > 0 && (
          <div className="px-4 py-4 border-t border-border">
            <h2 className="text-sm font-semibold text-foreground mb-3">{t("profileScreen.recentRatings")}</h2>
            <div className="space-y-3">
              {displayUser.ratings.slice(0, 3).map((rating) => (
                <div key={rating.id} className="bg-card rounded-xl p-3 border border-border">
                  <div className="flex items-start gap-2">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={rating.fromUserAvatar || "/placeholder.svg"} />
                      <AvatarFallback className="text-xs">{getUserInitials(rating.fromUserName, "")}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-foreground">{rating.fromUserName}</p>
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-3 h-3 ${
                                star <= rating.rating ? "fill-amber-500 text-amber-500" : "text-muted-foreground"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">{rating.activityName}</p>
                      {rating.comment && <p className="text-sm text-foreground mt-1">{rating.comment}</p>}
                      <div className="flex items-center gap-2 mt-2">
                        {rating.attended ? (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/10 text-green-600">
                            {t("profileScreen.stats.attendedYes")}
                          </span>
                        ) : (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-destructive/10 text-destructive">
                            {t("profileScreen.stats.attendedNo")}
                          </span>
                        )}
                        {rating.attended &&
                          (rating.onTime ? (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/10 text-green-600">
                              {t("profileScreen.stats.onTimeYes")}
                            </span>
                          ) : (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600">
                              {t("profileScreen.stats.onTimeNo")}
                            </span>
                          ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  // Ratings Panel
  if (showRatings) {
    return (
      <div className="absolute inset-0 bg-background z-50 overflow-y-auto">
        <div className="sticky top-0 bg-background border-b border-border p-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => setShowRatings(false)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h2 className="text-lg font-semibold">{t("profileScreen.allRatings")}</h2>
        </div>

        <div className="p-4">
          {/* Rating Summary */}
          <div className="bg-muted/30 rounded-2xl p-6 mb-6">
            <div className="text-center">
              <div className="text-5xl font-bold text-foreground mb-2">
                {displayUser.averageRating > 0 ? displayUser.averageRating.toFixed(1) : "N/A"}
              </div>
              <div className="flex items-center justify-center gap-1 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-6 h-6 ${
                      star <= Math.round(displayUser.averageRating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <p className="text-sm text-muted-foreground">
                {t("profileScreen.basedOn")} {displayUser.ratings.length} {t("profileScreen.reviews")}
              </p>
            </div>

            {/* Attendance Stats */}
            <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-border">
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground mb-1">
                  {displayUser.attendanceStats.attendanceRate}%
                </div>
                <div className="text-xs text-muted-foreground">{t("profileScreen.attendance")}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground mb-1">
                  {displayUser.attendanceStats.punctualityRate}%
                </div>
                <div className="text-xs text-muted-foreground">{t("profileScreen.punctuality")}</div>
              </div>
            </div>
          </div>

          {/* Reviews List */}
          <h3 className="text-sm font-semibold text-muted-foreground mb-4">{t("profileScreen.allReviews")}</h3>

          {displayUser.ratings.length === 0 ? (
            <div className="text-center py-12">
              <Star className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">{t("profileScreen.noRatingsYet")}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {displayUser.ratings.map((rating) => (
                <div key={rating.id} className="bg-muted/30 rounded-2xl p-4">
                  <div className="flex items-start gap-3">
                    <Avatar className="w-10 h-10">
                      {rating.fromUserAvatar ? (
                        <AvatarImage src={rating.fromUserAvatar || "/placeholder.svg"} alt={rating.fromUserName} />
                      ) : null}
                      <AvatarFallback className="bg-primary/10 text-primary text-sm">
                        {getUserInitials(rating.fromUserName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-sm">{rating.fromUserName}</span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(rating.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 mb-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-4 h-4 ${
                              star <= rating.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">{rating.activityName}</p>
                      {rating.comment && <p className="text-sm text-foreground">{rating.comment}</p>}
                      <div className="flex items-center gap-4 mt-2">
                        {rating.attended && (
                          <div className="flex items-center gap-1 text-xs text-green-600">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>{t("profileScreen.attended")}</span>
                          </div>
                        )}
                        {rating.onTime && (
                          <div className="flex items-center gap-1 text-xs text-blue-600">
                            <Clock className="w-3 h-3" />
                            <span>{t("profileScreen.onTime")}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  const realStats = user
    ? {
        activitiesCreated: getActivitiesByCreator(user.email).length,
        activitiesJoined: getActivitiesJoinedBy(user.email).length,
        connections: displayUser.stats.connections,
      }
    : displayUser.stats

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="px-4 py-3 bg-card border-b border-border flex items-center justify-between">
        <FindOneLogo />
        <button
          onClick={() => setShowSettings(true)}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-secondary text-foreground hover:bg-secondary/80 transition-colors"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>

      {/* Profile Header */}
      <div className="px-4 py-6 bg-card border-b border-border">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Avatar className="w-20 h-20 border-4 border-primary/20">
              <AvatarImage src={displayUser.avatar || "/placeholder.svg"} alt={fullName} />
              <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
                {getUserInitials(displayUser.name || "", displayUser.lastName || "")}
              </AvatarFallback>
            </Avatar>
            {user && (
              <button
                onClick={() => setShowEditProfile(true)}
                className="absolute bottom-0 right-0 w-7 h-7 bg-primary rounded-full flex items-center justify-center text-primary-foreground"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-foreground">{fullName}</h1>
              {displayUser.isVerified && <Shield className="w-5 h-5 text-primary fill-primary/20" />}
            </div>

            {/* Rating */}
            {displayUser.ratings && displayUser.ratings.length > 0 && (
              <div className="flex items-center gap-1 mt-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${
                      star <= Math.round(displayUser.averageRating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-muted-foreground"
                    }`}
                  />
                ))}
                <span className="text-sm text-muted-foreground ml-1">
                  {displayUser.averageRating.toFixed(1)} ({displayUser.ratings.length})
                </span>
              </div>
            )}

            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{displayUser.bio}</p>

            {!displayUser.isVerified && user && (
              <span className="inline-flex items-center gap-1 mt-2 px-2 py-1 bg-yellow-500/10 text-yellow-600 rounded-full text-xs">
                <Shield className="w-3 h-3" />
                {t("profileScreen.emailNotVerified")}
              </span>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">{realStats.activitiesCreated}</p>
            <p className="text-xs text-muted-foreground">{t("profileScreen.stats.created")}</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">{realStats.activitiesJoined}</p>
            <p className="text-xs text-muted-foreground">{t("profileScreen.stats.joined")}</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">{realStats.connections}</p>
            <p className="text-xs text-muted-foreground">{t("profileScreen.stats.connections")}</p>
          </div>
        </div>

        {/* Rating Section */}
        <div className="mt-6 p-4 bg-muted/30 rounded-2xl">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              <span className="text-lg font-semibold text-foreground">
                {displayUser.averageRating > 0 ? displayUser.averageRating.toFixed(1) : "N/A"}
              </span>
              <span className="text-sm text-muted-foreground">
                ({displayUser.ratings.length} {t("profileScreen.reviews")})
              </span>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setShowRatings(true)} className="text-primary">
              {t("profileScreen.viewRatings")}
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>

          {/* Attendance Stats */}
          <div className="grid grid-cols-2 gap-2 mt-3">
            <div className="flex items-center gap-2">
              <CheckCircle2
                className={`w-4 h-4 ${
                  displayUser.attendanceStats.attendanceRate >= 80
                    ? "text-green-500"
                    : displayUser.attendanceStats.attendanceRate >= 60
                      ? "text-yellow-500"
                      : "text-red-500"
                }`}
              />
              <span className="text-xs text-muted-foreground">
                {t("profileScreen.attendance")}: {displayUser.attendanceStats.attendanceRate}%
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock
                className={`w-4 h-4 ${
                  displayUser.attendanceStats.punctualityRate >= 80
                    ? "text-green-500"
                    : displayUser.attendanceStats.punctualityRate >= 60
                      ? "text-yellow-500"
                      : "text-red-500"
                }`}
              />
              <span className="text-xs text-muted-foreground">
                {t("profileScreen.punctuality")}: {displayUser.attendanceStats.punctualityRate}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {displayUser.attendanceStats && displayUser.attendanceStats.totalActivities > 0 && (
        <div className="px-4 py-4 border-b border-border">
          <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            {t("profileScreen.userReputation")}
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-card rounded-xl p-3 border border-border">
              <div className="flex items-center gap-2 mb-1">
                <UserCheck className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{t("profileScreen.stats.attendance")}</span>
              </div>
              <p className={`text-xl font-bold ${getStatColor(displayUser.attendanceStats.attendanceRate)}`}>
                {displayUser.attendanceStats.attendanceRate}%
              </p>
              <p className="text-xs text-muted-foreground">
                {displayUser.attendanceStats.attended} de {displayUser.attendanceStats.totalActivities}{" "}
                {t("profileScreen.stats.events")}
              </p>
            </div>
            <div className="bg-card rounded-xl p-3 border border-border">
              <div className="flex items-center gap-2 mb-1">
                <Clock3 className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{t("profileScreen.stats.punctuality")}</span>
              </div>
              <p className={`text-xl font-bold ${getStatColor(displayUser.attendanceStats.punctualityRate)}`}>
                {displayUser.attendanceStats.punctualityRate}%
              </p>
              <p className="text-xs text-muted-foreground">
                {displayUser.attendanceStats.onTime} de {displayUser.attendanceStats.attended}{" "}
                {t("profileScreen.stats.onTime")}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Interests */}
      {displayUser.interests.length > 0 && (
        <div className="px-4 py-4">
          <h2 className="text-sm font-semibold text-foreground mb-3">{t("profileScreen.interests")}</h2>
          <div className="flex flex-wrap gap-2">
            {displayUser.interests.map((interest) => (
              <span key={interest} className="px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium">
                {interest}
              </span>
            ))}
          </div>
        </div>
      )}

      {displayUser.ratings && displayUser.ratings.length > 0 && (
        <div className="px-4 py-4 border-t border-border">
          <h2 className="text-sm font-semibold text-foreground mb-3">{t("profileScreen.recentRatings")}</h2>
          <div className="space-y-3">
            {displayUser.ratings.slice(0, 3).map((rating) => (
              <div key={rating.id} className="bg-card rounded-xl p-3 border border-border">
                <div className="flex items-start gap-2">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={rating.fromUserAvatar || "/placeholder.svg"} />
                    <AvatarFallback className="text-xs">{getUserInitials(rating.fromUserName, "")}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-foreground">{rating.fromUserName}</p>
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-3 h-3 ${
                              star <= rating.rating ? "fill-amber-500 text-amber-500" : "text-muted-foreground"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">{rating.activityName}</p>
                    {rating.comment && <p className="text-sm text-foreground mt-1">{rating.comment}</p>}
                    <div className="flex items-center gap-2 mt-2">
                      {rating.attended ? (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/10 text-green-600">
                          {t("profileScreen.stats.attendedYes")}
                        </span>
                      ) : (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-destructive/10 text-destructive">
                          {t("profileScreen.stats.attendedNo")}
                        </span>
                      )}
                      {rating.attended &&
                        (rating.onTime ? (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/10 text-green-600">
                            {t("profileScreen.stats.onTimeYes")}
                          </span>
                        ) : (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600">
                            {t("profileScreen.stats.onTimeNo")}
                          </span>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Menu */}
      <div className="flex-1 px-4 pb-4">
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          {menuItems.map((item, index) => (
            <button
              key={item.label}
              onClick={item.action}
              className={`w-full px-4 py-4 flex items-center gap-3 hover:bg-secondary/50 transition-colors ${
                index !== menuItems.length - 1 ? "border-b border-border" : ""
              }`}
            >
              <item.icon className={`w-5 h-5 ${item.danger ? "text-destructive" : "text-muted-foreground"}`} />
              <span className={`flex-1 text-left font-medium ${item.danger ? "text-destructive" : "text-foreground"}`}>
                {item.label}
              </span>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
