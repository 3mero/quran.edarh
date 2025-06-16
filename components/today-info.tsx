"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Calendar, Clock } from "lucide-react"

export default function TodayInfo() {
  const [todayInfo, setTodayInfo] = useState({ dayName: "", date: "" })

  useEffect(() => {
    const now = new Date()
    const days = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"]
    const dayName = days[now.getDay()]

    const formattedDate = now.toLocaleDateString("ar-LY", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })

    setTodayInfo({ dayName, date: formattedDate })
  }, [])

  return (
    <Card className="w-full bg-slate-800 border-slate-600">
      <CardContent className="p-4">
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 text-green-400 font-bold text-lg">
            <Calendar className="h-5 w-5" />
            اليوم الحالي: {todayInfo.dayName}
          </div>
          <div className="flex items-center justify-center gap-2 text-yellow-400 font-bold">
            <Clock className="h-4 w-4" />
            تاريخ اليوم: {todayInfo.date}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
