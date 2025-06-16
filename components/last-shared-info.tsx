"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { History, ExternalLink } from "lucide-react"

interface LastSharedDetails {
  dayName: string
  formattedDate: string
  formattedTime: string
  title: string
  pageText: string
  pageLink: string
}

export default function LastSharedInfo() {
  const [lastShared, setLastShared] = useState<LastSharedDetails | null>(null)

  useEffect(() => {
    const saved = localStorage.getItem("lastSharedDetails")
    if (saved) {
      try {
        setLastShared(JSON.parse(saved))
      } catch (error) {
        console.error("Error parsing last shared details:", error)
      }
    }
  }, [])

  // Listen for storage changes to update when new share happens
  useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem("lastSharedDetails")
      if (saved) {
        try {
          setLastShared(JSON.parse(saved))
        } catch (error) {
          console.error("Error parsing last shared details:", error)
        }
      }
    }

    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [])

  if (!lastShared) {
    return null
  }

  return (
    <Card className="w-full bg-slate-800 border-slate-600">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg text-white flex items-center gap-2">
          <History className="h-5 w-5 text-emerald-400" />
          آخر صفحة تمت مشاركتها
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="bg-slate-700 p-3 rounded">
            <div className="text-yellow-400 font-bold text-sm">آخر يوم مشاركة:</div>
            <div className="text-white">{lastShared.dayName}</div>
          </div>

          <div className="bg-slate-700 p-3 rounded">
            <div className="text-yellow-400 font-bold text-sm">التاريخ:</div>
            <div className="text-white">{lastShared.formattedDate}</div>
          </div>

          <div className="bg-slate-700 p-3 rounded">
            <div className="text-yellow-400 font-bold text-sm">الساعة:</div>
            <div className="text-white">{lastShared.formattedTime}</div>
          </div>

          <div className="bg-slate-700 p-3 rounded">
            <div className="text-yellow-400 font-bold text-sm">العنوان:</div>
            <div className="text-white">{lastShared.title}</div>
          </div>
        </div>

        <div className="bg-slate-700 p-3 rounded border-2 border-red-500">
          <div className="text-yellow-400 font-bold text-sm mb-2">الصفحات:</div>
          <Badge variant="secondary" className="bg-red-600 text-white">
            {lastShared.pageText}
          </Badge>
        </div>

        <div className="bg-slate-700 p-3 rounded">
          <div className="text-yellow-400 font-bold text-sm mb-2">الرابط:</div>
          <a
            href={lastShared.pageLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-white hover:text-yellow-400 transition-colors flex items-center gap-1 break-all"
          >
            {lastShared.pageLink}
            <ExternalLink className="h-3 w-3 flex-shrink-0" />
          </a>
        </div>
      </CardContent>
    </Card>
  )
}
