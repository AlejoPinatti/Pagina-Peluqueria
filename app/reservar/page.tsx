"use client"

import type React from "react"

import { useState } from "react"
import { ArrowLeft, Calendar, User, Phone, MessageCircle, Mail } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import CalendarPicker from "@/components/calendar-picker"

const servicios = ["Corte de pelo", "Tintura"]

export default function ReservarPage() {
  const [formData, setFormData] = useState({
    nombre: "",
    telefono: "",
    email: "",
    fecha: "",
    hora: "",
    servicio: "",
    comentarios: "",
  })
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validar que todos los campos requeridos estén completos
    if (
      !formData.nombre ||
      !formData.telefono ||
      !formData.email ||
      !formData.fecha ||
      !formData.hora ||
      !formData.servicio
    ) {
      toast({
        title: "Campos incompletos",
        description: "Por favor completa todos los campos requeridos.",
        variant: "destructive",
      })
      return
    }

    // Verificar si el horario ya está ocupado
    const turnos = JSON.parse(localStorage.getItem("turnos") || "[]")
    const horarioOcupado = turnos.some((turno: any) => turno.fecha === formData.fecha && turno.hora === formData.hora)

    if (horarioOcupado) {
      toast({
        title: "Horario no disponible",
        description: "Este horario ya está ocupado. Por favor selecciona otro.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      // Guardar en localStorage
      const nuevoTurno = {
        id: Date.now(),
        ...formData,
        fechaCreacion: new Date().toISOString(),
      }
      turnos.push(nuevoTurno)
      localStorage.setItem("turnos", JSON.stringify(turnos))

      // Mensaje para WhatsApp
      const mensajeWhatsApp = `🌟 *NUEVO TURNO RESERVADO* 🌟

👤 *Cliente:* ${formData.nombre}
📞 *Teléfono:* ${formData.telefono}
📧 *Email:* ${formData.email}
📅 *Fecha:* ${new Date(formData.fecha + "T00:00:00").toLocaleDateString("es-AR", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })}
🕐 *Hora:* ${formData.hora}
✂️ *Servicio:* ${formData.servicio}
💬 *Comentarios:* ${formData.comentarios || "Ninguno"}

¡Confirma la disponibilidad! 💅`

      // Simular envío de email
      const emailData = {
        to: "peluqueriabella@gmail.com", // Tu email
        subject: `Nuevo turno reservado - ${formData.nombre}`,
        body: `
          NUEVO TURNO RESERVADO
          
          Cliente: ${formData.nombre}
          Teléfono: ${formData.telefono}
          Email: ${formData.email}
          Fecha: ${new Date(formData.fecha + "T00:00:00").toLocaleDateString("es-AR")}
          Hora: ${formData.hora}
          Servicio: ${formData.servicio}
          Comentarios: ${formData.comentarios || "Ninguno"}
          
          Fecha de reserva: ${new Date().toLocaleString("es-AR")}
        `,
      }

      console.log("Email enviado:", emailData) // En producción usar servicio real de email

      toast({
        title: "¡Turno reservado exitosamente!",
        description: "Te contactaremos pronto para confirmar tu cita.",
      })

      // Abrir WhatsApp
      const whatsappUrl = `https://wa.me/5491123456789?text=${encodeURIComponent(mensajeWhatsApp)}`
      window.open(whatsappUrl, "_blank")

      // Limpiar formulario
      setFormData({
        nombre: "",
        telefono: "",
        email: "",
        fecha: "",
        hora: "",
        servicio: "",
        comentarios: "",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Hubo un problema al reservar tu turno. Intenta nuevamente.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const isFormValid =
    formData.nombre && formData.telefono && formData.email && formData.fecha && formData.hora && formData.servicio

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 py-4">
          <Link href="/">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">Reservar Turno</h1>
        </div>

        {/* Form */}
        <Card className="shadow-lg border-0">
          <CardHeader className="bg-blue-600 text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Datos de la Reserva
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Nombre */}
              <div className="space-y-2">
                <Label htmlFor="nombre" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Nombre completo *
                </Label>
                <Input
                  id="nombre"
                  value={formData.nombre}
                  onChange={(e) => handleChange("nombre", e.target.value)}
                  placeholder="Tu nombre completo"
                  required
                  className="text-lg py-3"
                />
              </div>

              {/* Teléfono */}
              <div className="space-y-2">
                <Label htmlFor="telefono" className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Teléfono *
                </Label>
                <Input
                  id="telefono"
                  type="tel"
                  value={formData.telefono}
                  onChange={(e) => handleChange("telefono", e.target.value)}
                  placeholder="Tu número de teléfono"
                  required
                  className="text-lg py-3"
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email *
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  placeholder="tu@email.com"
                  required
                  className="text-lg py-3"
                />
              </div>

              {/* Calendario */}
              <div className="space-y-2">
                <CalendarPicker
                  selectedDate={formData.fecha}
                  selectedTime={formData.hora}
                  onDateSelect={(date) => handleChange("fecha", date)}
                  onTimeSelect={(time) => handleChange("hora", time)}
                />
              </div>

              {/* Servicio */}
              <div className="space-y-2">
                <Label htmlFor="servicio">Servicio *</Label>
                <Select value={formData.servicio} onValueChange={(value) => handleChange("servicio", value)}>
                  <SelectTrigger className="text-lg py-3">
                    <SelectValue placeholder="¿Qué servicio necesitas?" />
                  </SelectTrigger>
                  <SelectContent>
                    {servicios.map((servicio) => (
                      <SelectItem key={servicio} value={servicio}>
                        {servicio}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Comentarios */}
              <div className="space-y-2">
                <Label htmlFor="comentarios">Comentarios (opcional)</Label>
                <Textarea
                  id="comentarios"
                  value={formData.comentarios}
                  onChange={(e) => handleChange("comentarios", e.target.value)}
                  placeholder="Algún detalle especial o preferencia..."
                  className="text-lg"
                  rows={3}
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading || !isFormValid}
                className={`w-full py-3 text-lg mt-6 ${
                  isFormValid
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                {loading ? (
                  "Reservando..."
                ) : (
                  <>
                    <MessageCircle className="h-5 w-5 mr-2" />
                    Reservar Turno
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Info */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <p className="text-blue-800 text-sm text-center">
              📱 Después de reservar, se abrirá WhatsApp automáticamente y recibirás un email de confirmación
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
