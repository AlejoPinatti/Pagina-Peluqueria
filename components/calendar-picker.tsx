"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, Clock, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { supabase } from "@/lib/supabase"

interface CalendarPickerProps {
  selectedDate: string
  selectedTime: string
  onDateSelect: (date: string) => void
  onTimeSelect: (time: string) => void
  dateError?: string
  timeError?: string
}

const horarios = [
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
  "17:30",
]

export default function CalendarPicker({
  selectedDate,
  selectedTime,
  onDateSelect,
  onTimeSelect,
  dateError,
  timeError,
}: CalendarPickerProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [turnosOcupados, setTurnosOcupados] = useState<{ [key: string]: string[] }>({})
  const [loadingHorarios, setLoadingHorarios] = useState(false)

  useEffect(() => {
    cargarTurnosOcupados()
  }, [])

  // Recargar horarios cuando cambia la fecha seleccionada
  useEffect(() => {
    if (selectedDate) {
      cargarTurnosOcupados()
    }
  }, [selectedDate])

  const cargarTurnosOcupados = async () => {
    setLoadingHorarios(true)
    try {
      console.log("🔍 Cargando turnos ocupados...")
      const { data: turnos, error } = await supabase.from("turnos").select("fecha, hora")

      if (error) {
        console.error("❌ Error consultando turnos:", error)
        throw error
      }

      console.log("📊 Turnos encontrados:", turnos)

      const ocupados: { [key: string]: string[] } = {}
      turnos?.forEach((turno) => {
        if (!ocupados[turno.fecha]) {
          ocupados[turno.fecha] = []
        }
        // ARREGLO CLAVE: Normalizar formato de hora (quitar segundos)
        const horaNormalizada = turno.hora.substring(0, 5) // "16:00:00" → "16:00"
        ocupados[turno.fecha].push(horaNormalizada)
      })

      console.log("🔴 Horarios ocupados NORMALIZADOS por fecha:", ocupados)
      setTurnosOcupados(ocupados)
    } catch (error) {
      console.error("Error cargando turnos ocupados:", error)
    } finally {
      setLoadingHorarios(false)
    }
  }

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Días vacíos al inicio
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push({ day: null, disabled: true, isPast: false, isSunday: false })
    }

    // Días del mes
    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(year, month, day)
      const isPast = currentDate < today
      const isSunday = currentDate.getDay() === 0
      const disabled = isPast || isSunday

      days.push({
        day: day,
        disabled: disabled,
        isPast: isPast,
        isSunday: isSunday,
      })
    }

    return days
  }

  const formatDateForComparison = (year: number, month: number, day: number) => {
    const date = new Date(year, month, day)
    return date.toISOString().split("T")[0]
  }

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
  }

  const prevMonth = () => {
    const today = new Date()
    const prevMonthDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1)
    if (prevMonthDate >= new Date(today.getFullYear(), today.getMonth())) {
      setCurrentMonth(prevMonthDate)
    }
  }

  const isHorarioOcupado = (hora: string) => {
    if (!selectedDate) return false
    const ocupadosEnFecha = turnosOcupados[selectedDate] || []
    const ocupado = ocupadosEnFecha.includes(hora)

    console.log(`🕐 Verificando ${hora} en ${selectedDate}:`)
    console.log(`   - Ocupados en fecha: [${ocupadosEnFecha.join(", ")}]`)
    console.log(`   - ¿${hora} está ocupado? ${ocupado ? "🔴 SÍ" : "✅ NO"}`)

    return ocupado
  }

  // FUNCIÓN CLAVE: Solo seleccionar horario SI NO ESTÁ OCUPADO
  const handleTimeSelect = (hora: string) => {
    const ocupado = isHorarioOcupado(hora)

    if (ocupado) {
      console.log(`🚫 HORARIO ${hora} OCUPADO - NO SELECCIONAR`)
      return // NO hacer nada si está ocupado
    }

    console.log(`⏰ SELECCIONANDO HORARIO DISPONIBLE: ${hora}`)
    onTimeSelect(hora)
  }

  const days = getDaysInMonth(currentMonth)
  const monthNames = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ]
  const dayNames = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"]

  return (
    <div className="space-y-6">
      {/* Calendar */}
      <Card>
        <CardHeader
          className={`bg-blue-600 text-white transition-all duration-200 ${
            dateError ? "border-b-4 border-red-500 bg-red-600" : ""
          }`}
        >
          <CardTitle className="flex items-center justify-between">
            <Button variant="ghost" size="icon" onClick={prevMonth} className="text-white hover:bg-blue-700">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-lg">
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </span>
            <Button variant="ghost" size="icon" onClick={nextMonth} className="text-white hover:bg-blue-700">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          {/* Day headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {dayNames.map((day) => (
              <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar days */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((dayInfo, index) => {
              if (dayInfo.day === null) {
                return <div key={index} className="h-10" />
              }

              const dateString = formatDateForComparison(
                currentMonth.getFullYear(),
                currentMonth.getMonth(),
                dayInfo.day,
              )
              const isSelected = selectedDate === dateString

              return (
                <Button
                  key={dayInfo.day}
                  variant={isSelected ? "default" : "ghost"}
                  disabled={dayInfo.disabled}
                  className={`h-10 w-full text-sm transition-all duration-200 ${
                    isSelected
                      ? "bg-blue-600 text-white hover:bg-blue-700 ring-2 ring-blue-300"
                      : dayInfo.disabled
                        ? dayInfo.isSunday
                          ? "text-red-400 cursor-not-allowed bg-red-50"
                          : "text-gray-300 cursor-not-allowed"
                        : "hover:bg-blue-50 hover:scale-105"
                  }`}
                  onClick={() => {
                    if (!dayInfo.disabled) {
                      console.log(`📅 SELECCIONANDO FECHA: ${dateString}`)
                      onDateSelect(dateString)
                    }
                  }}
                >
                  {dayInfo.day}
                  {dayInfo.isSunday && !dayInfo.isPast && <span className="ml-1 text-xs">🚫</span>}
                </Button>
              )
            })}
          </div>

          {dateError && (
            <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600 text-sm animate-pulse flex items-center gap-1">⚠️ {dateError}</p>
            </div>
          )}

          {/* Legend */}
          <div className="mt-3 text-xs text-gray-500 space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-50 border border-red-200 rounded"></div>
              <span>Domingos (cerrado)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gray-100 border border-gray-200 rounded"></div>
              <span>Días pasados</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Time slots */}
      {selectedDate && (
        <Card>
          <CardHeader
            className={`bg-slate-800 text-white transition-all duration-200 ${
              timeError ? "border-b-4 border-red-500 bg-red-600" : ""
            }`}
          >
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Horarios Disponibles
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={cargarTurnosOcupados}
                disabled={loadingHorarios}
                className="text-white hover:bg-slate-700"
                title="Actualizar disponibilidad"
              >
                <RefreshCw className={`h-4 w-4 ${loadingHorarios ? "animate-spin" : ""}`} />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            {loadingHorarios && (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p className="text-sm text-gray-500">Verificando disponibilidad...</p>
              </div>
            )}

            <div className="grid grid-cols-3 gap-2">
              {horarios.map((hora) => {
                const ocupado = isHorarioOcupado(hora)
                const seleccionado = selectedTime === hora

                console.log(`🎨 Renderizando ${hora}: ocupado=${ocupado}, seleccionado=${seleccionado}`)

                if (ocupado) {
                  // BOTÓN OCUPADO - FORZAR ROJO
                  return (
                    <Button
                      key={hora}
                      disabled={true}
                      className="py-3 bg-red-600 text-white cursor-not-allowed hover:bg-red-600 border-red-600 font-medium"
                      onClick={() => handleTimeSelect(hora)}
                    >
                      {hora} 🚫
                    </Button>
                  )
                } else if (seleccionado) {
                  // BOTÓN SELECCIONADO - AZUL
                  return (
                    <Button
                      key={hora}
                      className="py-3 bg-blue-600 text-white hover:bg-blue-700 ring-2 ring-blue-300 scale-105 font-medium"
                      onClick={() => handleTimeSelect(hora)}
                    >
                      {hora}
                    </Button>
                  )
                } else {
                  // BOTÓN DISPONIBLE - BLANCO
                  return (
                    <Button
                      key={hora}
                      variant="outline"
                      className="py-3 bg-white border-gray-300 hover:bg-slate-50 hover:scale-105 hover:border-blue-300 font-medium"
                      onClick={() => handleTimeSelect(hora)}
                    >
                      {hora}
                    </Button>
                  )
                }
              })}
            </div>

            {/* Debug info MEJORADO */}
            <div className="mt-2 p-2 bg-gray-100 rounded text-xs">
              <p>📅 Fecha seleccionada: {selectedDate}</p>
              <p>⏰ Hora seleccionada: {selectedTime || "Ninguna"}</p>
              <p>🔴 Ocupados esta fecha: {turnosOcupados[selectedDate]?.join(", ") || "Ninguno"}</p>
              <p>📊 Total ocupados: {turnosOcupados[selectedDate]?.length || 0}</p>
            </div>

            {timeError && (
              <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-600 text-sm animate-pulse flex items-center gap-1">⚠️ {timeError}</p>
              </div>
            )}

            {/* Estadísticas de disponibilidad */}
            {selectedDate && (
              <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-xs text-blue-700 text-center">
                  📊 Disponibles: {horarios.length - (turnosOcupados[selectedDate]?.length || 0)} de {horarios.length}{" "}
                  horarios
                </p>
              </div>
            )}

            {/* Leyenda visual */}
            <div className="mt-3 text-xs text-gray-500 space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-600 rounded"></div>
                <span>Horarios ocupados</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-600 rounded"></div>
                <span>Horario seleccionado</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-white border border-gray-300 rounded"></div>
                <span>Horarios disponibles</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
