"use client"

import { useState, useEffect } from "react"
import { Calendar, Copy, CalendarDays } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import Navbar from "@/components/navbar"

export default function ManagePage() {
  const [pagesPerDay, setPagesPerDay] = useState(3)
  const [startPage, setStartPage] = useState(1)
  const [startDate, setStartDate] = useState("")
  const [numDays, setNumDays] = useState("")
  const [dateResults, setDateResults] = useState<{ date: string; pages: string; monthYear?: string }[]>([])
  const [showResults, setShowResults] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    // تعيين تاريخ اليوم كقيمة افتراضية
    const today = new Date().toISOString().split("T")[0]
    setStartDate(today)
  }, [])

  const generateDateDropdown = () => {
    const totalPages = 604
    const pagesPerDayValue = Number.parseInt(String(pagesPerDay))
    const startPageValue = Number.parseInt(String(startPage))
    const startDateValue = new Date(startDate)
    const numDaysValue = numDays
      ? Number.parseInt(numDays)
      : Math.ceil((totalPages - startPageValue + 1) / pagesPerDayValue)

    if (
      isNaN(pagesPerDayValue) ||
      isNaN(startPageValue) ||
      !startDateValue ||
      startPageValue < 1 ||
      startPageValue > totalPages
    ) {
      toast({
        title: "خطأ في الإدخال",
        description: "يرجى إدخال قيم صحيحة لجميع الحقول.",
        variant: "destructive",
      })
      return
    }

    let currentPage = startPageValue
    const currentStartDate = new Date(startDateValue)
    let currentMonth = ""
    const results: { date: string; pages: string; monthYear?: string }[] = []

    for (let i = 0; i < numDaysValue && currentPage <= totalPages; i++) {
      const endPage = Math.min(currentPage + pagesPerDayValue - 1, totalPages)

      // تنسيق التاريخ بالعربية
      const day = currentStartDate.getDate()
      const monthIndex = currentStartDate.getMonth()
      const year = currentStartDate.getFullYear()

      // أسماء الأشهر بالعربية
      const arabicMonths = [
        "يناير",
        "فبراير",
        "مارس",
        "أبريل",
        "مايو",
        "يونيو",
        "يوليو",
        "أغسطس",
        "سبتمبر",
        "أكتوبر",
        "نوفمبر",
        "ديسمبر",
      ]

      // أسماء أيام الأسبوع بالعربية
      const arabicDays = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"]

      const dayName = arabicDays[currentStartDate.getDay()]
      const monthName = arabicMonths[monthIndex]

      const dateString = `${dayName} ${day} - ${monthName} - ${year}م`
      const monthYear = `${monthName} ${year}م`

      if (monthYear !== currentMonth) {
        if (currentMonth !== "") {
          results.push({ date: "", pages: "", monthYear })
        }
        currentMonth = monthYear
      }

      results.push({
        date: dateString,
        pages: `الصفحات ${currentPage} - ${endPage}`,
      })

      currentPage = endPage + 1
      currentStartDate.setDate(currentStartDate.getDate() + 1)
    }

    setDateResults(results)
    setShowResults(true)
  }

  const getFormattedText = () => {
    let formattedText = "تقسيم الصفحات:\n\n"
    const currentMonth = ""

    dateResults.forEach((item) => {
      if (item.monthYear) {
        formattedText += "\n" + "=".repeat(20) + "\n"
        formattedText += item.monthYear + "\n"
        formattedText += "=".repeat(20) + "\n\n"
      } else {
        formattedText += `${item.date}: ${item.pages}\n`
      }
    })

    return formattedText
  }

  const copyDates = () => {
    const formattedText = getFormattedText()

    if (formattedText.trim() !== "تقسيم الصفحات:") {
      navigator.clipboard
        .writeText(formattedText)
        .then(() => {
          toast({
            title: "تم النسخ بنجاح!",
            description: "تم نسخ تقسيم الصفحات إلى الحافظة",
          })
        })
        .catch((err) => {
          console.error("حدث خطأ أثناء النسخ: ", err)
          toast({
            title: "خطأ في النسخ",
            description: "حدث خطأ أثناء النسخ. يرجى المحاولة مرة أخرى.",
            variant: "destructive",
          })
        })
    } else {
      toast({
        title: "لا توجد بيانات",
        description: "لا يوجد بيانات لنسخها.",
        variant: "destructive",
      })
    }
  }

  const shareDates = () => {
    const formattedText = getFormattedText()

    if (formattedText.trim() !== "تقسيم الصفحات:") {
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(formattedText)}`
      window.open(whatsappUrl, "_blank")
    } else {
      toast({
        title: "لا توجد بيانات",
        description: "لا يوجد بيانات لمشاركتها.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />

      <div className="container mx-auto px-4 py-8 pt-24">
        <div className="max-w-3xl mx-auto">
          <div className="mb-6">
            <h1 className="text-4xl font-bold text-emerald-400 text-center">إدارة صفحات القرآن الكريم</h1>
          </div>

          <Card className="bg-slate-800 border-slate-700 shadow-lg mb-8">
            <CardHeader>
              <CardTitle className="text-2xl text-emerald-400 flex items-center gap-2">
                <CalendarDays className="h-6 w-6" />
                تقسيم الصفحات
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="pages-per-day" className="text-slate-200">
                    عدد الصفحات لكل يوم:
                  </Label>
                  <Input
                    id="pages-per-day"
                    type="number"
                    min="1"
                    value={pagesPerDay}
                    onChange={(e) => setPagesPerDay(Number.parseInt(e.target.value))}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="start-page" className="text-slate-200">
                    بداية العرض من الصفحة:
                  </Label>
                  <Input
                    id="start-page"
                    type="number"
                    min="1"
                    max="604"
                    value={startPage}
                    onChange={(e) => setStartPage(Number.parseInt(e.target.value))}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="start-date" className="text-slate-200">
                    تاريخ البدء:
                  </Label>
                  <Input
                    id="start-date"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="num-days" className="text-slate-200">
                    عدد الأيام (في حال عدم التحديد سيتم عرض 604 صفحة لكامل المصحف):
                  </Label>
                  <Input
                    id="num-days"
                    type="number"
                    min="1"
                    value={numDays}
                    onChange={(e) => setNumDays(e.target.value)}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>

                <Button
                  onClick={generateDateDropdown}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  <Calendar className="mr-2 h-4 w-4" /> عرض التقسيم
                </Button>
              </div>
            </CardContent>
          </Card>

          {showResults && (
            <Card className="bg-slate-800 border-slate-700 shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl text-emerald-400">نتائج التقسيم</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-slate-700 border border-slate-600 rounded-lg p-4 h-80 overflow-y-auto mb-4 text-right">
                  {dateResults.map((item, index) =>
                    item.monthYear ? (
                      <div key={index} className="relative my-6">
                        <Separator className="bg-emerald-500/50" />
                        <span className="absolute -top-3 right-4 bg-slate-700 px-2 text-emerald-400 font-bold">
                          {item.monthYear}
                        </span>
                      </div>
                    ) : (
                      <div key={index} className="py-2 border-b border-slate-600 last:border-0">
                        <span className="font-bold text-emerald-300">{item.date}:</span>{" "}
                        <span className="text-slate-200">{item.pages}</span>
                      </div>
                    ),
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button onClick={copyDates} className="flex-1 bg-amber-600 hover:bg-amber-700 text-white">
                    <Copy className="mr-2 h-4 w-4" /> نسخ إلى الحافظة
                  </Button>
                  <Button onClick={shareDates} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="mr-2 h-4 w-4"
                    >
                      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                      <path d="M13 8a1 1 0 1 0 2 0 1 1 0 0 0-2 0"></path>
                      <path d="M5 20l-1 1"></path>
                      <path d="M19 20l1 1"></path>
                    </svg>
                    مشاركة عبر واتساب
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
