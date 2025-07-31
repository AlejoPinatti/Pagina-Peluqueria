"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { supabase } from "@/lib/supabase"

interface CalendarPickerProps {
  selectedDate: string
  selectedTime: string
  onDateSelect: (date: string) => void
  onTimeSelect: (time: string) => void
  showErrors?: boolean
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
  showErrors = false,
}: CalendarPickerProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [turnosOcupados, setTurnosOcupados] = useState<{ [key: string]: string[] }>({})

  useEffect(() => {
    cargarTurnosOcupados()
  }, [])

  const cargarTurnosOcupados = async () => {
    try {
      const { data: turnos, error } = await supabase.from("turnos").select("fecha, hora")

      if (error) throw error

      const ocupados: { [key: string]: string[] } = {}
      turnos?.forEach((turno) => {
        if (!ocupados[turno.fecha]) {
          ocupados[turno.fecha] = []
        }
        ocupados[turno.fecha].push(turno.hora)
      })

      setTurnosOcupados(ocupados)
    } catch (error) {
      console.error("Error cargando turnos ocupados:", error)
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
    return turnosOcupados[selectedDate]?.includes(hora) || false
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
          className={`bg-blue-600 text-white ${showErrors && !selectedDate ? "border-b-2 border-red-500" : ""}`}
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
                  className={`h-10 w-full text-sm ${
                    isSelected
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : dayInfo.disabled
                        ? dayInfo.isSunday
                          ? "text-red-400 cursor-not-allowed bg-red-50"
                          : "text-gray-300 cursor-not-allowed"
                        : "hover:bg-blue-50"
                  }`}
                  onClick={() => !dayInfo.disabled && onDateSelect(dateString)}
                >
                  {dayInfo.day}
                  {dayInfo.isSunday && !dayInfo.isPast && <span className="ml-1 text-xs">🚫</span>}
                </Button>
              )
            })}
          </div>
          {showErrors && !selectedDate && <p className="text-red-500 text-sm mt-2">Debes seleccionar una fecha</p>}

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
            className={`bg-slate-800 text-white ${showErrors && !selectedTime ? "border-b-2 border-red-500" : ""}`}
          >
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Horarios Disponibles
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="grid grid-cols-3 gap-2">
              {horarios.map((hora) => {
                const ocupado = isHorarioOcupado(hora)
                const seleccionado = selectedTime === hora

                return (
                  <Button
                    key={hora}
                    variant={seleccionado ? "default" : ocupado ? "destructive" : "outline"}
                    className={`py-3 ${
                      seleccionado
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : ocupado
                          ? "bg-red-500 text-white cursor-not-allowed hover:bg-red-500"
                          : "hover:bg-slate-50"
                    }`}
                    onClick={() => !ocupado && onTimeSelect(hora)}
                    disabled={ocupado}
                  >
                    {hora}
                    {ocupado && <span className="ml-1 text-xs">❌</span>}
                  </Button>
                )
              })}
            </div>
            {turnosOcupados[selectedDate]?.length > 0 && (
              <p className="text-sm text-red-600 mt-2 text-center">❌ Los horarios en rojo ya están ocupados</p>
            )}
            {showErrors && !selectedTime && <p className="text-red-500 text-sm mt-2">Debes seleccionar una hora</p>}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
