"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { History, Clock, Calendar, FileText } from "lucide-react"

interface LastSharedDetails {
  dayName: string
  formattedDate: string
  formattedTime: string
  title: string
  pageText: string
  pageLink: string
  timestamp: number
}

export default function LastSharedBar() {
  const [lastShared, setLastShared] = useState<LastSharedDetails | null>(null)

  useEffect(() => {
    loadLastShared()
  }, [])

  // Listen for storage changes to update when new share happens
  useEffect(() => {
    const handleStorageChange = () => {
      loadLastShared()
    }

    window.addEventListener("storage", handleStorageChange)

    // Also listen for custom event when sharing happens in same tab
    const handleShareUpdate = () => {
      loadLastShared()
    }

    window.addEventListener("shareUpdate", handleShareUpdate)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
      window.removeEventListener("shareUpdate", handleShareUpdate)
    }
  }, [])

  const loadLastShared = () => {
    const saved = localStorage.getItem("lastSharedDetails")
    if (saved) {
      try {
        setLastShared(JSON.parse(saved))
      } catch (error) {
        console.error("Error parsing last shared details:", error)
      }
    }
  }

  const formatDateWithEnglishMonth = () => {
    if (!lastShared) return ""

    const date = new Date(lastShared.timestamp)
    const englishMonths = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ]

    const day = date.getDate()
    const month = englishMonths[date.getMonth()]
    const year = date.getFullYear()

    return `${day} ${month} ${year}`
  }

  if (!lastShared) {
    return null
  }

  return (
    <Card className="w-full bg-slate-700 border-slate-500">
      <CardContent className="p-3">
        <div className="flex items-center gap-2 text-sm flex-wrap">
          <History className="h-4 w-4 text-yellow-400 flex-shrink-0" />
          <span className="text-yellow-400 font-medium">آخر مشاركة:</span>

          {lastShared.title && (
            <>
              <FileText className="h-3 w-3 text-blue-400 flex-shrink-0" />
              <span className="text-blue-400 truncate">{lastShared.title}</span>
              <span className="text-slate-400">|</span>
            </>
          )}

          <span className="text-emerald-400">{lastShared.pageText}</span>
          <span className="text-slate-400">|</span>

          <Calendar className="h-3 w-3 text-slate-400 flex-shrink-0" />
          <span className="text-slate-300">{lastShared.dayName}</span>

          <span className="text-orange-400 font-medium">{formatDateWithEnglishMonth()}</span>
          <span className="text-slate-400">|</span>

          <Clock className="h-3 w-3 text-slate-400 flex-shrink-0" />
          <span className="text-slate-300">{lastShared.formattedTime}</span>
        </div>
      </CardContent>
    </Card>
  )
}
