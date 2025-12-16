"use client"

import { useState, useRef } from "react"
import {
  Mail,
  Lock,
  User,
  Phone,
  Calendar,
  Camera,
  ChevronLeft,
  Eye,
  EyeOff,
  Check,
  X,
  Loader2,
  Copy,
} from "lucide-react"
import { FindOneLogo } from "@/components/findone-logo"
import { useUser, type RegisterData } from "@/lib/user-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { LocationSearch } from "@/components/location-search"

type AuthView = "welcome" | "login" | "register" | "verify" | "forgot-password" | "reset-password"

const availableInterests = [
  "Tenis",
  "Pádel",
  "Fútbol",
  "Running",
  "Natación",
  "Ciclismo",
  "Viajes",
  "Cine",
  "Lectura",
  "Fotografía",
  "Música",
  "Cocina",
  "Yoga",
  "Gimnasio",
  "Escalada",
  "Senderismo",
]

export function AuthScreen({ onComplete }: { onComplete: () => void }) {
  const {
    register,
    login,
    verifyEmail,
    resendVerification,
    requestPasswordReset,
    resetPassword,
    isLoading,
    user,
    demoCode,
  } = useUser()

  const [view, setView] = useState<AuthView>("welcome")
  const [step, setStep] = useState(1)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [codeCopied, setCodeCopied] = useState(false)

  // Login form
  const [loginEmail, setLoginEmail] = useState("")
  const [loginPassword, setLoginPassword] = useState("")

  // Register form
  const [formData, setFormData] = useState<RegisterData>({
    email: "",
    password: "",
    name: "",
    lastName: "",
    phone: "",
    birthDate: "",
    gender: "",
    bio: "",
    avatar: null,
    location: "",
    interests: [],
  })
  const [locationCoords, setLocationCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [confirmPassword, setConfirmPassword] = useState("")

  // Password recovery states
  const [recoveryEmail, setRecoveryEmail] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmNewPassword, setConfirmNewPassword] = useState("")

  const [verificationCode, setVerificationCode] = useState(["", "", "", "", "", ""])
  const codeInputsRef = useRef<(HTMLInputElement | null)[]>([])

  const copyDemoCode = () => {
    if (demoCode) {
      navigator.clipboard.writeText(demoCode)
      setCodeCopied(true)
      const codeArray = demoCode.split("")
      setVerificationCode(codeArray)
      setTimeout(() => setCodeCopied(false), 2000)
    }
  }

  const handleLogin = async () => {
    setError("")
    if (!loginEmail || !loginPassword) {
      setError("Completa todos los campos")
      return
    }

    const success = await login(loginEmail, loginPassword)
    if (success) {
      onComplete()
    } else {
      setError("Email o contraseña incorrectos")
    }
  }

  const handleRegisterNext = () => {
    setError("")

    if (step === 1) {
      if (!formData.email || !formData.password || !confirmPassword) {
        setError("Completa todos los campos")
        return
      }
      if (formData.password !== confirmPassword) {
        setError("Las contraseñas no coinciden")
        return
      }
      if (formData.password.length < 6) {
        setError("La contraseña debe tener al menos 6 caracteres")
        return
      }
      setStep(2)
    } else if (step === 2) {
      if (!formData.name || !formData.lastName || !formData.phone || !formData.birthDate) {
        setError("Completa todos los campos obligatorios")
        return
      }
      setStep(3)
    } else if (step === 3) {
      if (formData.interests.length < 2) {
        setError("Selecciona al menos 2 intereses")
        return
      }
      handleRegister()
    }
  }

  const handleRegister = async () => {
    const result = await register(formData)
    if (result.success) {
      setSuccess(result.message)
      setView("verify")
    } else {
      setError(result.message)
    }
  }

  const handleVerify = async () => {
    const code = verificationCode.join("")
    if (code.length !== 6) {
      setError("Ingresa el código completo")
      return
    }

    const success = await verifyEmail(code)
    if (success) {
      onComplete()
    } else {
      setError("Código incorrecto")
    }
  }

  const handleSendRecoveryCode = async () => {
    setError("")
    if (!recoveryEmail) {
      setError("Ingresa tu email")
      return
    }

    const result = await requestPasswordReset(recoveryEmail)
    if (result.success) {
      setSuccess(result.message)
      setView("reset-password")
    } else {
      setError(result.message)
    }
  }

  const handleResetPassword = async () => {
    const code = verificationCode.join("")
    if (code.length !== 6) {
      setError("Ingresa el código completo")
      return
    }
    if (!newPassword || !confirmNewPassword) {
      setError("Completa todos los campos")
      return
    }
    if (newPassword !== confirmNewPassword) {
      setError("Las contraseñas no coinciden")
      return
    }
    if (newPassword.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres")
      return
    }

    const success = await resetPassword(recoveryEmail, code, newPassword)
    if (success) {
      setSuccess("Contraseña actualizada correctamente")
      setTimeout(() => {
        setView("login")
        setLoginEmail(recoveryEmail)
        setLoginPassword("")
        setError("")
        setSuccess("")
        setVerificationCode(["", "", "", "", "", ""])
      }, 2000)
    } else {
      setError("Código incorrecto o expirado")
    }
  }

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) value = value.slice(-1)
    if (!/^\d*$/.test(value)) return

    const newCode = [...verificationCode]
    newCode[index] = value
    setVerificationCode(newCode)

    if (value && index < 5) {
      codeInputsRef.current[index + 1]?.focus()
    }
  }

  const handleResend = async () => {
    setCodeCopied(false)
    const success = await resendVerification()
    if (success) {
      setSuccess("Código reenviado")
      setError("")
      setVerificationCode(["", "", "", "", "", ""])
    }
  }

  const toggleInterest = (interest: string) => {
    setFormData((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest],
    }))
  }

  const handleLocationChange = (value: string, coords?: { lat: number; lng: number }) => {
    setFormData({ ...formData, location: value })
    if (coords) {
      setLocationCoords(coords)
    }
  }

  if (view === "welcome") {
    return (
      <div className="flex flex-col h-full bg-gradient-to-b from-primary/10 to-background">
        <div className="flex-1 flex flex-col items-center justify-center px-8">
          <div className="w-24 h-24 rounded-3xl flex items-center justify-center mb-6 bg-background">
            <FindOneLogo className="w-16 h-16 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold mb-2 text-card-foreground">FindOne</h1>
          <p className="text-center text-muted-foreground mb-12">
            Encuentra personas para compartir actividades y crear conexiones reales
          </p>

          <div className="w-full space-y-3">
            <Button className="w-full h-14 text-lg rounded-2xl" onClick={() => setView("register")}>
              Crear cuenta
            </Button>
            <Button
              variant="outline"
              className="w-full h-14 text-lg rounded-2xl bg-transparent"
              onClick={() => setView("login")}
            >
              Iniciar sesión
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (view === "login") {
    return (
      <div className="flex flex-col h-full bg-background">
        <div className="px-4 py-3 flex items-center gap-3 border-b border-border">
          <button
            onClick={() => setView("welcome")}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-secondary"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-semibold">Iniciar sesión</h1>
        </div>

        <div className="flex-1 px-6 py-8">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="tu@email.com"
                  className="h-14 pl-12 rounded-2xl"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-foreground">Contraseña</label>
                <button
                  onClick={() => {
                    setView("forgot-password")
                    setRecoveryEmail(loginEmail)
                  }}
                  className="text-sm text-primary font-medium"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="h-14 pl-12 pr-12 rounded-2xl"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <Eye className="w-5 h-5 text-muted-foreground" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-xl text-sm">
                <X className="w-4 h-4" />
                {error}
              </div>
            )}

            <Button className="w-full h-14 text-lg rounded-2xl mt-6" onClick={handleLogin} disabled={isLoading}>
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Ingresar"}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              ¿No tienes cuenta?{" "}
              <button
                onClick={() => {
                  setView("register")
                  setStep(1)
                }}
                className="text-primary font-medium"
              >
                Regístrate
              </button>
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (view === "forgot-password") {
    return (
      <div className="flex flex-col h-full bg-background">
        <div className="px-4 py-3 flex items-center gap-3 border-b border-border">
          <button
            onClick={() => setView("login")}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-secondary"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-semibold">Recuperar contraseña</h1>
        </div>

        <div className="flex-1 px-6 py-8 flex flex-col items-center">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
            <Lock className="w-10 h-10 text-primary" />
          </div>

          <h2 className="text-xl font-bold text-foreground mb-2">¿Olvidaste tu contraseña?</h2>
          <p className="text-center text-muted-foreground mb-6">
            No te preocupes, enviaremos un código de verificación a tu email para que puedas crear una nueva contraseña
          </p>

          <div className="w-full space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="tu@email.com"
                  className="h-14 pl-12 rounded-2xl"
                  value={recoveryEmail}
                  onChange={(e) => setRecoveryEmail(e.target.value)}
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-xl text-sm">
                <X className="w-4 h-4" />
                {error}
              </div>
            )}

            <Button className="w-full h-14 text-lg rounded-2xl" onClick={handleSendRecoveryCode} disabled={isLoading}>
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Enviar código"}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              <button onClick={() => setView("login")} className="text-primary font-medium">
                Volver a iniciar sesión
              </button>
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (view === "reset-password") {
    return (
      <div className="flex flex-col h-full bg-background">
        <div className="px-4 py-3 flex items-center gap-3 border-b border-border">
          <button
            onClick={() => setView("forgot-password")}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-secondary"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-semibold">Nueva contraseña</h1>
        </div>

        <div className="flex-1 px-6 py-8 overflow-y-auto">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6 mx-auto">
            <Mail className="w-10 h-10 text-primary" />
          </div>

          <h2 className="text-xl font-bold text-foreground mb-2 text-center">Revisa tu email</h2>
          <p className="text-center text-muted-foreground mb-6">
            Enviamos un código de 6 dígitos a<br />
            <span className="font-medium text-foreground">{recoveryEmail}</span>
          </p>

          {demoCode && (
            <div className="w-full mb-6 p-4 bg-amber-50 dark:bg-amber-950 border-2 border-amber-300 dark:border-amber-700 rounded-2xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-amber-800 dark:text-amber-200">Modo Demo - Tu código:</span>
                <button
                  onClick={copyDemoCode}
                  className="flex items-center gap-1 text-xs text-amber-700 dark:text-amber-300 hover:text-amber-900 dark:hover:text-amber-100"
                >
                  <Copy className="w-3 h-3" />
                  {codeCopied ? "Copiado!" : "Copiar"}
                </button>
              </div>
              <div className="flex justify-center">
                <span className="text-3xl font-bold tracking-[0.5em] text-amber-900 dark:text-amber-100">
                  {demoCode}
                </span>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block text-center">Código de verificación</label>
              <div className="flex gap-2 justify-center mb-6">
                {verificationCode.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => {
                      codeInputsRef.current[index] = el
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleCodeChange(index, e.target.value)}
                    className="w-12 h-14 text-center text-2xl font-bold border-2 border-border rounded-xl focus:border-primary focus:outline-none bg-background"
                  />
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Nueva contraseña</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Mínimo 6 caracteres"
                  className="h-14 pl-12 pr-12 rounded-2xl"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <Eye className="w-5 h-5 text-muted-foreground" />
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Confirmar contraseña</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Repetir contraseña"
                  className="h-14 pl-12 rounded-2xl"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-xl text-sm">
                <X className="w-4 h-4" />
                {error}
              </div>
            )}

            {success && (
              <div className="flex items-center gap-2 p-3 bg-green-500/10 text-green-600 rounded-xl text-sm">
                <Check className="w-4 h-4" />
                {success}
              </div>
            )}

            <Button className="w-full h-14 text-lg rounded-2xl" onClick={handleResetPassword} disabled={isLoading}>
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Cambiar contraseña"}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (view === "verify") {
    return (
      <div className="flex flex-col h-full bg-background">
        <div className="px-4 py-3 flex items-center gap-3 border-b border-border">
          <h1 className="text-lg font-semibold">Verificar email</h1>
        </div>

        <div className="flex-1 px-6 py-8 flex flex-col items-center">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
            <Mail className="w-10 h-10 text-primary" />
          </div>

          <h2 className="text-xl font-bold text-foreground mb-2">Revisa tu email</h2>
          <p className="text-center text-muted-foreground mb-6">
            Enviamos un código de 6 dígitos a<br />
            <span className="font-medium text-foreground">{user?.email}</span>
          </p>

          {demoCode && (
            <div className="w-full mb-6 p-4 bg-amber-50 dark:bg-amber-950 border-2 border-amber-300 dark:border-amber-700 rounded-2xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-amber-800 dark:text-amber-200">Modo Demo - Tu código:</span>
                <button
                  onClick={copyDemoCode}
                  className="flex items-center gap-1 text-xs text-amber-700 dark:text-amber-300 hover:text-amber-900 dark:hover:text-amber-100"
                >
                  <Copy className="w-3 h-3" />
                  {codeCopied ? "Copiado!" : "Copiar"}
                </button>
              </div>
              <div className="flex justify-center">
                <span className="text-3xl font-bold tracking-[0.5em] text-amber-900 dark:text-amber-100">
                  {demoCode}
                </span>
              </div>
              <p className="text-xs text-amber-600 dark:text-amber-400 text-center mt-2">
                Agrega RESEND_API_KEY para enviar emails reales
              </p>
            </div>
          )}

          <div className="flex gap-2 mb-6">
            {verificationCode.map((digit, index) => (
              <input
                key={index}
                ref={(el) => {
                  codeInputsRef.current[index] = el
                }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleCodeChange(index, e.target.value)}
                className="w-12 h-14 text-center text-2xl font-bold border-2 border-border rounded-xl focus:border-primary focus:outline-none bg-background"
              />
            ))}
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-xl text-sm mb-4">
              <X className="w-4 h-4" />
              {error}
            </div>
          )}

          {success && !demoCode && (
            <div className="flex items-center gap-2 p-3 bg-green-500/10 text-green-600 rounded-xl text-sm mb-4">
              <Check className="w-4 h-4" />
              {success}
            </div>
          )}

          <Button className="w-full h-14 text-lg rounded-2xl" onClick={handleVerify} disabled={isLoading}>
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Verificar"}
          </Button>

          <button onClick={handleResend} className="mt-4 text-primary font-medium" disabled={isLoading}>
            Reenviar código
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="px-4 py-3 flex items-center gap-3 border-b border-border">
        <button
          onClick={() => (step > 1 ? setStep(step - 1) : setView("welcome"))}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-secondary"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-semibold">Crear cuenta</h1>
        <span className="ml-auto text-sm text-muted-foreground">Paso {step}/3</span>
      </div>

      <div className="h-1 bg-secondary">
        <div className="h-full bg-primary transition-all duration-300" style={{ width: `${(step / 3) * 100}%` }} />
      </div>

      <div className="flex-1 px-6 py-6 overflow-y-auto">
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold mb-4">Datos de acceso</h2>

            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="tu@email.com"
                  className="h-14 pl-12 rounded-2xl"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Mínimo 6 caracteres"
                  className="h-14 pl-12 pr-12 rounded-2xl"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <Eye className="w-5 h-5 text-muted-foreground" />
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Confirmar contraseña</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Repetir contraseña"
                  className="h-14 pl-12 rounded-2xl"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold mb-4">Datos personales</h2>

            <div className="flex justify-center mb-4">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-secondary flex items-center justify-center overflow-hidden border-4 border-primary/20">
                  {formData.avatar ? (
                    <img
                      src={formData.avatar || "/placeholder.svg"}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-10 h-10 text-muted-foreground" />
                  )}
                </div>
                <button className="absolute bottom-0 right-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground">
                  <Camera className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nombre *</label>
                <Input
                  placeholder="Juan"
                  className="h-12 rounded-xl"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Apellido *</label>
                <Input
                  placeholder="Pérez"
                  className="h-12 rounded-xl"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Teléfono *</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="tel"
                  placeholder="+54 11 1234 5678"
                  className="h-12 pl-12 rounded-xl"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Fecha de nacimiento *</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="date"
                  className="h-12 pl-12 rounded-xl"
                  value={formData.birthDate}
                  onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Género</label>
              <div className="flex gap-2">
                {["Masculino", "Femenino", "Otro"].map((gender) => (
                  <button
                    key={gender}
                    onClick={() => setFormData({ ...formData, gender })}
                    className={`flex-1 h-12 rounded-xl border-2 transition-colors ${
                      formData.gender === gender
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground"
                    }`}
                  >
                    {gender}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Ubicación / Barrio</label>
              <LocationSearch
                value={formData.location}
                onChange={handleLocationChange}
                placeholder="Buscar tu barrio..."
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Sobre mí</label>
              <textarea
                placeholder="Cuéntanos un poco sobre ti..."
                className="w-full h-24 px-4 py-3 rounded-xl border border-border bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold mb-2">Tus intereses</h2>
            <p className="text-muted-foreground text-sm mb-4">Selecciona al menos 2 actividades que te gusten</p>

            <div className="flex flex-wrap gap-2">
              {availableInterests.map((interest) => (
                <button
                  key={interest}
                  onClick={() => toggleInterest(interest)}
                  className={`px-4 py-2 rounded-full border-2 transition-colors ${
                    formData.interests.includes(interest)
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border text-muted-foreground hover:border-primary/50"
                  }`}
                >
                  {interest}
                </button>
              ))}
            </div>

            <p className="text-sm text-muted-foreground mt-4">{formData.interests.length} de 2 mínimo seleccionados</p>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-xl text-sm mt-4">
            <X className="w-4 h-4" />
            {error}
          </div>
        )}
      </div>

      <div className="p-6 border-t border-border">
        <Button className="w-full h-14 text-lg rounded-2xl" onClick={handleRegisterNext} disabled={isLoading}>
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : step === 3 ? "Crear cuenta" : "Continuar"}
        </Button>
      </div>
    </div>
  )
}
