"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronUp, ChevronDown, Settings, RotateCcw, Play } from "lucide-react"

interface SettingsSectionProps {
  mode: "hizb" | "juz"
  onGenerate: (from: number, to: number, firstDay: string) => void
  onReset: () => void
}

export default function SettingsSection({ mode, onGenerate, onReset }: SettingsSectionProps) {
  const [isVisible, setIsVisible] = useState(() => {
    const saved = localStorage.getItem("settingsVisible")
    return saved !== null ? JSON.parse(saved) : true
  })
  const [from, setFrom] = useState(1)
  const [to, setTo] = useState(mode === "hizb" ? 60 : 30)
  const [firstDay, setFirstDay] = useState("الأحد")

  const days = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"]
  const maxValue = mode === "hizb" ? 60 : 30

  const handleGenerate = () => {
    if (from < 1 || to > maxValue || from > to) {
      alert("يرجى إدخال نطاق صحيح.")
      return
    }
    onGenerate(from, to, firstDay)
  }

  const handleReset = () => {
    if (confirm("هل أنت متأكد من تهيئة الصفحة؟ سيتم حذف جميع البيانات.")) {
      onReset()
    }
  }

  return (
    <Card
      className={`w-full max-w-2xl mx-auto border-2 bg-slate-800 border-slate-600 ${mode === "hizb" ? "border-emerald-500" : "border-rose-500"}`}
    >
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl flex items-center gap-2 text-white">
            <Settings className="h-5 w-5 text-emerald-400" />
            الإعدادات
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              const newVisibility = !isVisible
              setIsVisible(newVisibility)
              localStorage.setItem("settingsVisible", JSON.stringify(newVisibility))
            }}
            className="flex items-center gap-2 text-white hover:text-emerald-400"
          >
            {isVisible ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            {isVisible ? "إخفاء" : "إظهار"}
          </Button>
        </div>
      </CardHeader>

      {isVisible && (
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="from" className="text-white">
                من:
              </Label>
              <Input
                id="from"
                type="number"
                min={1}
                max={maxValue}
                value={from}
                onChange={(e) => setFrom(Number.parseInt(e.target.value) || 1)}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>
            <div>
              <Label htmlFor="to" className="text-white">
                إلى:
              </Label>
              <Input
                id="to"
                type="number"
                min={1}
                max={maxValue}
                value={to}
                onChange={(e) => setTo(Number.parseInt(e.target.value) || maxValue)}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="first-day" className="text-white">
              اليوم الأول:
            </Label>
            <Select value={firstDay} onValueChange={setFirstDay}>
              <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-700 border-slate-600">
                {days.map((day) => (
                  <SelectItem key={day} value={day} className="text-white hover:bg-slate-600">
                    {day}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              onClick={handleGenerate}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 flex items-center gap-2"
            >
              <Play className="h-4 w-4" />
              توليد
            </Button>
            <Button onClick={handleReset} variant="destructive" className="flex items-center gap-2">
              <RotateCcw className="h-4 w-4" />
              تهيئة الصفحة
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  )
}
