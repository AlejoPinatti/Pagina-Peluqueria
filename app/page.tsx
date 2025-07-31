"use client"

import type React from "react"

import { useState } from "react"
import { Calendar, User, Phone, MessageCircle, Mail, Scissors } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import CalendarPicker from "@/components/calendar-picker"
import { supabase } from "@/lib/supabase"

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
  const [errors, setErrors] = useState<string[]>([])
  const { toast } = useToast()

  const validateForm = () => {
    const newErrors = []

    if (!formData.nombre.trim()) newErrors.push("Nombre completo es requerido")
    if (!formData.telefono.trim()) newErrors.push("Teléfono es requerido")
    if (!formData.email.trim()) newErrors.push("Email es requerido")
    if (!formData.fecha) newErrors.push("Fecha es requerida")
    if (!formData.hora) newErrors.push("Hora es requerida")
    if (!formData.servicio) newErrors.push("Servicio es requerido")

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.push("Email debe tener un formato válido")
    }

    setErrors(newErrors)
    return newErrors.length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validar formulario
    if (!validateForm()) {
      toast({
        title: "Información incompleta",
        description: "Por favor completa todos los campos requeridos correctamente.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      // Verificar si el horario ya está ocupado
      const { data: turnosExistentes, error: errorConsulta } = await supabase
        .from("turnos")
        .select("*")
        .eq("fecha", formData.fecha)
        .eq("hora", formData.hora)

      if (errorConsulta) throw errorConsulta

      if (turnosExistentes && turnosExistentes.length > 0) {
        toast({
          title: "Horario no disponible",
          description: "Este horario ya está ocupado. Por favor selecciona otro.",
          variant: "destructive",
        })
        setLoading(false)
        return
      }

      // Guardar en Supabase
      const { data, error } = await supabase.from("turnos").insert([
        {
          nombre: formData.nombre,
          telefono: formData.telefono,
          email: formData.email,
          fecha: formData.fecha,
          hora: formData.hora,
          servicio: formData.servicio,
          comentarios: formData.comentarios,
          confirmado: false,
        },
      ])

      if (error) throw error

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
        to: "peluqueriabella@gmail.com",
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

      console.log("Email enviado:", emailData)

      toast({
        title: "¡Turno reservado exitosamente!",
        description: "Te contactaremos pronto para confirmar tu cita.",
      })

      // Abrir WhatsApp
      const whatsappUrl = `https://wa.me/5491123456789?text=${encodeURIComponent(mensajeWhatsApp)}`
      window.open(whatsappUrl, "_blank")

      // Limpiar formulario y errores
      setFormData({
        nombre: "",
        telefono: "",
        email: "",
        fecha: "",
        hora: "",
        servicio: "",
        comentarios: "",
      })
      setErrors([])
    } catch (error) {
      console.error("Error:", error)
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
    // Limpiar errores cuando el usuario empiece a escribir
    if (errors.length > 0) {
      setErrors([])
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <div className="text-center py-6">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-600 p-4 rounded-full">
              <Scissors className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Peluquería Bella</h1>
          <p className="text-gray-600">Reserva tu turno</p>
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
              {/* Mostrar errores solo después de intentar enviar */}
              {errors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="text-red-800 font-medium mb-2">Por favor corrige los siguientes errores:</h4>
                  <ul className="text-red-700 text-sm space-y-1">
                    {errors.map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                  </ul>
                </div>
              )}

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
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg mt-6"
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

        {/* Footer */}
        <div className="text-center text-gray-500 text-sm py-4">
          <Link href="/login" className="text-xs text-gray-400 hover:text-gray-600">
            Acceso Personal
          </Link>
        </div>
      </div>
    </div>
  )
}
