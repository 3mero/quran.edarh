"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronUp, ChevronDown, Share2, BarChart3 } from "lucide-react"

interface ItemData {
  number: number
  day: string
  completed: boolean
  completedTime?: string
  completionBatchId?: string
}

interface StatisticsSectionProps {
  mode: "hizb" | "juz"
  items: ItemData[]
  completedCount: number
  remainingCount: number
  lastCompleted: ItemData | undefined
}

export default function StatisticsSection({
  mode,
  items,
  completedCount,
  remainingCount,
  lastCompleted,
}: StatisticsSectionProps) {
  const [isVisible, setIsVisible] = useState(true)

  const shareProgress = () => {
    if (!lastCompleted) {
      alert("لم يتم إكمال أي حزب/جزء بعد.")
      return
    }

    const date = new Date()
    const days = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"]
    const dayName = days[date.getDay()]
    const formattedDate = date.toLocaleDateString()
    const formattedTime = date.toLocaleTimeString()

    let completionMessage = ""
    if (lastCompleted.completionBatchId) {
      const batchItems = items.filter((i) => i.completionBatchId === lastCompleted.completionBatchId)
      if (batchItems.length > 1) {
        const first = batchItems[0].number
        const last = batchItems[batchItems.length - 1].number
        completionMessage = `تم بحمد الله وتوفيقه إكمال ${mode === "hizb" ? "الأحزاب" : "الأجزاء"} من ${first} إلى ${last}.`
      } else {
        completionMessage = `تم بحمد الله وتوفيقه إكمال ${mode === "hizb" ? "الحزب" : "الجزء"} رقم ${lastCompleted.number}.`
      }
    } else {
      completionMessage = `تم بحمد الله وتوفيقه إكمال ${mode === "hizb" ? "الحزب" : "الجزء"} رقم ${lastCompleted.number}.`
    }

    const message = `${completionMessage}
آخر قراءة وحفظ كانت في يوم ${dayName}، بتاريخ ${formattedDate}، والساعة ${formattedTime}.
${mode === "hizb" ? "الأحزاب" : "الأجزاء"} المتبقية: ${remainingCount}.`

    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, "_blank")
  }

  let lastCompletedDisplay = null
  if (lastCompleted) {
    if (lastCompleted.completionBatchId) {
      const batchItems = items.filter((i) => i.completionBatchId === lastCompleted.completionBatchId)
      if (batchItems.length > 1) {
        const first = batchItems[0].number
        const last = batchItems[batchItems.length - 1].number
        lastCompletedDisplay = `${mode === "hizb" ? "الأحزاب" : "الأجزاء"} من ${first} إلى ${last}`
      } else {
        lastCompletedDisplay = `${mode === "hizb" ? "حزب" : "جزء"} ${lastCompleted.number}`
      }
    } else {
      lastCompletedDisplay = `${mode === "hizb" ? "حزب" : "جزء"} ${lastCompleted.number}`
    }
  }

  return (
    <Card
      className={`w-full max-w-2xl mx-auto border-2 bg-slate-800 border-slate-600 ${mode === "hizb" ? "border-emerald-500" : "border-rose-500"}`}
    >
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl text-white flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-emerald-400" />
            الإحصائيات
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsVisible(!isVisible)}
            className="flex items-center gap-2 text-white hover:text-emerald-400"
          >
            {isVisible ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            {isVisible ? "إخفاء" : "إظهار"}
          </Button>
        </div>
      </CardHeader>

      {isVisible && (
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-emerald-900/30 border border-emerald-500/30 rounded-lg">
              <div className="text-3xl font-bold text-emerald-400">{completedCount}</div>
              <div className="text-sm text-emerald-300">المكتمل</div>
            </div>
            <div className="text-center p-4 bg-orange-900/30 border border-orange-500/30 rounded-lg">
              <div className="text-3xl font-bold text-orange-400">{remainingCount}</div>
              <div className="text-sm text-orange-300">المتبقي</div>
            </div>
          </div>

          {lastCompleted && (
            <div className="bg-slate-700 border border-slate-600 p-4 rounded-lg">
              <h3 className="font-semibold mb-2 text-white">آخر ما تم إنهاؤه:</h3>
              <div className="space-y-1 text-sm text-slate-300">
                <div>
                  <span className="font-medium text-emerald-400">العنصر:</span> {lastCompletedDisplay}
                </div>
                <div>
                  <span className="font-medium text-emerald-400">التاريخ:</span> {lastCompleted.completedTime}
                </div>
              </div>
            </div>
          )}

          <Button
            onClick={shareProgress}
            className="w-full flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700"
            variant="default"
            disabled={!lastCompleted}
          >
            <Share2 className="h-4 w-4" />
            مشاركة التقدم عبر الواتساب
          </Button>
        </CardContent>
      )}
    </Card>
  )
}
