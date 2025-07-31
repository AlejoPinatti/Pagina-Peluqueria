"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Lock, User, Eye, EyeOff } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

export default function LoginPage() {
  const [credentials, setCredentials] = useState({ username: "", password: "" })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Credenciales simples (en producción usar autenticación real)
    if (credentials.username === "admin" && credentials.password === "peluqueria2024") {
      localStorage.setItem("adminAuth", "true")
      toast({
        title: "Acceso autorizado",
        description: "Bienvenido al panel de administración",
      })
      router.push("/admin")
    } else {
      toast({
        title: "Acceso denegado",
        description: "Usuario o contraseña incorrectos",
        variant: "destructive",
      })
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-blue-900 p-4 flex items-center justify-center">
      <div className="max-w-md w-full space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/">
            <Button variant="ghost" size="icon" className="rounded-full text-white hover:bg-white/10">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-white">Acceso Personal</h1>
        </div>

        {/* Login Form */}
        <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur">
          <CardHeader className="bg-slate-800 text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Iniciar Sesión
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Usuario
                </Label>
                <Input
                  id="username"
                  value={credentials.username}
                  onChange={(e) => setCredentials((prev) => ({ ...prev, username: e.target.value }))}
                  placeholder="Ingresa tu usuario"
                  required
                  className="text-lg py-3"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Contraseña
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={credentials.password}
                    onChange={(e) => setCredentials((prev) => ({ ...prev, password: e.target.value }))}
                    placeholder="Ingresa tu contraseña"
                    required
                    className="text-lg py-3 pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading || !credentials.username || !credentials.password}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg mt-6"
              >
                {loading ? "Verificando..." : "Ingresar"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Demo Info */}
        <Card className="bg-blue-900/50 border-blue-400/30 text-white">
          <CardContent className="p-4">
            <p className="text-sm text-center text-blue-100">
              <strong>Demo:</strong> Usuario: admin | Contraseña: peluqueria2024
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
