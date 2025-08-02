"use client"

import { useState, useEffect } from "react"
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  Phone,
  Trash2,
  CheckCircle,
  LogOut,
  History,
  Filter,
  MessageCircle,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"

interface Turno {
  id: number
  nombre: string
  telefono: string
  fecha: string
  hora: string
  servicio: string
  comentarios: string
  created_at: string
  confirmado?: boolean
}

export default function AdminPage() {
  const [turnos, setTurnos] = useState<Turno[]>([])
  const [turnosHistorial, setTurnosHistorial] = useState<Turno[]>([])
  const [fechaSeleccionada, setFechaSeleccionada] = useState("")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    console.log("🔐 Verificando autenticación admin...")

    // Verificar autenticación
    const auth = localStorage.getItem("adminAuth")
    console.log("🔑 Auth status:", auth)

    if (auth !== "true") {
      console.log("❌ No autenticado, redirigiendo a login...")
      router.push("/login")
      return
    }

    console.log("✅ Autenticado, cargando turnos...")
    setIsAuthenticated(true)
    cargarTurnos()

    // Configurar actualización en tiempo real
    const subscription = supabase
      .channel("turnos_changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "turnos" }, () => {
        console.log("🔄 Cambio detectado en turnos, recargando...")
        cargarTurnos()
      })
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [router])

  const cargarTurnos = async () => {
    try {
      console.log("📊 Cargando turnos desde Supabase...")
      const { data, error } = await supabase
        .from("turnos")
        .select("*")
        .order("fecha", { ascending: true })
        .order("hora", { ascending: true })

      if (error) {
        console.error("❌ Error cargando turnos:", error)
        throw error
      }

      console.log("✅ Turnos cargados:", data)

      const hoy = new Date().toISOString().split("T")[0]
      const turnosActivos = data?.filter((turno) => turno.fecha >= hoy) || []
      const turnosPasados = data?.filter((turno) => turno.fecha < hoy) || []

      console.log("📅 Turnos activos:", turnosActivos.length)
      console.log("📜 Turnos pasados:", turnosPasados.length)

      setTurnos(turnosActivos)
      setTurnosHistorial(turnosPasados)
    } catch (error) {
      console.error("Error cargando turnos:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los turnos.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const eliminarTurno = async (id: number) => {
    try {
      console.log("🗑️ Eliminando turno:", id)
      const { error } = await supabase.from("turnos").delete().eq("id", id)

      if (error) throw error

      toast({
        title: "Turno eliminado",
        description: "El turno ha sido eliminado exitosamente.",
      })
      cargarTurnos()
    } catch (error) {
      console.error("Error eliminando turno:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar el turno.",
        variant: "destructive",
      })
    }
  }

  const confirmarTurno = async (id: number, confirmado: boolean, turno: Turno) => {
    try {
      console.log("✅ Confirmando turno:", id, !confirmado)
      const { error } = await supabase.from("turnos").update({ confirmado: !confirmado }).eq("id", id)

      if (error) throw error

      // Si se está confirmando el turno, enviar WhatsApp
      if (!confirmado) {
        const mensajeConfirmacion = `✅ *TURNO CONFIRMADO* ✅

Hola ${turno.nombre}! 

Tu turno ha sido confirmado:
📅 *Fecha:* ${new Date(turno.fecha + "T00:00:00").toLocaleDateString("es-AR", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
🕐 *Hora:* ${turno.hora}
✂️ *Servicio:* ${turno.servicio}

¡Te esperamos! 💅✨

*Peluquería Bella*`

        const whatsappUrl = `https://wa.me/${turno.telefono.replace(/\D/g, "")}?text=${encodeURIComponent(mensajeConfirmacion)}`
        window.open(whatsappUrl, "_blank")
      }

      toast({
        title: confirmado ? "Turno desconfirmado" : "Turno confirmado",
        description: confirmado ? "El turno ha sido desconfirmado." : "Se envió WhatsApp de confirmación al cliente.",
      })
      cargarTurnos()
    } catch (error) {
      console.error("Error actualizando turno:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar el turno.",
        variant: "destructive",
      })
    }
  }

  const cerrarSesion = () => {
    console.log("🚪 Cerrando sesión admin...")
    localStorage.removeItem("adminAuth")
    router.push("/")
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-blue-900 flex items-center justify-center text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Verificando acceso...</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-blue-900 flex items-center justify-center text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Cargando turnos...</p>
        </div>
      </div>
    )
  }

  const turnosFiltrados = fechaSeleccionada ? turnos.filter((turno) => turno.fecha === fechaSeleccionada) : turnos
  const turnosHoy = turnos.filter((turno) => turno.fecha === new Date().toISOString().split("T")[0])
  const turnosProximos = turnos.filter((turno) => new Date(turno.fecha) > new Date())
  const fechasConTurnos = [...new Set(turnos.map((turno) => turno.fecha))].sort()

  const TurnoCard = ({ turno, showActions = true }: { turno: Turno; showActions?: boolean }) => (
    <Card className={`shadow-md bg-white/95 backdrop-blur ${turno.confirmado ? "border-green-400 border-2" : ""}`}>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-gray-500" />
            <span className="font-semibold text-lg">{turno.nombre}</span>
            {turno.confirmado && <Badge className="bg-green-500">Confirmado</Badge>}
          </div>
          {showActions && (
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => confirmarTurno(turno.id, turno.confirmado || false, turno)}
                className={turno.confirmado ? "text-green-600" : "text-gray-400"}
                title={turno.confirmado ? "Desconfirmar turno" : "Confirmar turno (envía WhatsApp)"}
              >
                {turno.confirmado ? <CheckCircle className="h-4 w-4" /> : <MessageCircle className="h-4 w-4" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => eliminarTurno(turno.id)}
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-gray-500" />
            <span>{turno.telefono}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span>
              {new Date(turno.fecha + "T00:00:00").toLocaleDateString("es-AR", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-gray-500" />
            <span>{turno.hora}</span>
          </div>
          <div className="bg-blue-50 p-2 rounded">
            <strong>Servicio:</strong> {turno.servicio}
          </div>
          {turno.comentarios && (
            <div className="bg-slate-50 p-2 rounded">
              <strong>Comentarios:</strong> {turno.comentarios}
            </div>
          )}
        </div>

        <div className="mt-3 pt-3 border-t text-xs text-gray-500">
          Reservado: {new Date(turno.created_at).toLocaleString("es-AR")}
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-blue-900 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon" className="rounded-full text-white hover:bg-white/10">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-white">Panel de Administración</h1>
              <p className="text-sm text-blue-200">Gestión de turnos en tiempo real</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={cerrarSesion} className="text-white hover:bg-white/10">
            <LogOut className="h-5 w-5" />
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="bg-green-600 text-white border-0">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold">{turnosHoy.length}</div>
              <div className="text-sm text-green-100">Hoy</div>
            </CardContent>
          </Card>
          <Card className="bg-blue-600 text-white border-0">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold">{turnosProximos.length}</div>
              <div className="text-sm text-blue-100">Próximos</div>
            </CardContent>
          </Card>
          <Card className="bg-purple-600 text-white border-0">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold">{turnosHistorial.length}</div>
              <div className="text-sm text-purple-100">Historial</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="activos" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-white/10">
            <TabsTrigger
              value="activos"
              className="text-white data-[state=active]:bg-white data-[state=active]:text-black"
            >
              Turnos Activos
            </TabsTrigger>
            <TabsTrigger
              value="historial"
              className="text-white data-[state=active]:bg-white data-[state=active]:text-black"
            >
              <History className="h-4 w-4 mr-2" />
              Historial
            </TabsTrigger>
          </TabsList>

          <TabsContent value="activos" className="space-y-4">
            {/* Filter */}
            <Card className="bg-white/95 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Filtrar por Fecha
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={fechaSeleccionada === "" ? "default" : "outline"}
                    onClick={() => setFechaSeleccionada("")}
                    size="sm"
                    className={fechaSeleccionada === "" ? "bg-blue-600 hover:bg-blue-700" : ""}
                  >
                    Todos ({turnos.length})
                  </Button>
                  {fechasConTurnos.map((fecha) => {
                    const cantidadTurnos = turnos.filter((t) => t.fecha === fecha).length
                    return (
                      <Button
                        key={fecha}
                        variant={fechaSeleccionada === fecha ? "default" : "outline"}
                        onClick={() => setFechaSeleccionada(fecha)}
                        size="sm"
                        className={fechaSeleccionada === fecha ? "bg-blue-600 hover:bg-blue-700" : ""}
                      >
                        {new Date(fecha + "T00:00:00").toLocaleDateString("es-AR", {
                          month: "short",
                          day: "numeric",
                        })}{" "}
                        ({cantidadTurnos})
                      </Button>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Turnos Activos */}
            <div className="space-y-4">
              {turnosFiltrados.length === 0 ? (
                <Card className="bg-white/95 backdrop-blur">
                  <CardContent className="p-8 text-center">
                    <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No hay turnos programados</p>
                  </CardContent>
                </Card>
              ) : (
                turnosFiltrados.map((turno) => <TurnoCard key={turno.id} turno={turno} />)
              )}
            </div>
          </TabsContent>

          <TabsContent value="historial" className="space-y-4">
            <div className="space-y-4">
              {turnosHistorial.length === 0 ? (
                <Card className="bg-white/95 backdrop-blur">
                  <CardContent className="p-8 text-center">
                    <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No hay turnos en el historial</p>
                  </CardContent>
                </Card>
              ) : (
                turnosHistorial.map((turno) => <TurnoCard key={turno.id} turno={turno} showActions={false} />)
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Quick Actions */}
        <Card className="bg-slate-800 text-white border-0">
          <CardContent className="p-4">
            <h3 className="font-semibold mb-2">Acciones Rápidas</h3>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={cargarTurnos}
                className="text-white border-white hover:bg-white hover:text-black bg-transparent"
              >
                Actualizar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
