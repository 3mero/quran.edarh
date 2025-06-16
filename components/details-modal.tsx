"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { X } from "lucide-react"
import { hizbData, juzData } from "@/data/quran-data"

interface ItemData {
  number: number
  day: string
  completed: boolean
  completedTime?: string
  note?: string
  color?: string
  hidden?: boolean
}

interface DetailsModalProps {
  item: ItemData
  mode: "hizb" | "juz"
  onClose: () => void
}

export default function DetailsModal({ item, mode, onClose }: DetailsModalProps) {
  const getDetails = () => {
    if (mode === "hizb") {
      return {
        الحزب: item.number,
        السورة: hizbData.surahs[item.number] || "غير محدد",
        "رقم الصفحة": hizbData.pages[item.number] || "غير محدد",
        "رقم الآية": hizbData.verses[item.number] || "غير محدد",
        "من الآية": hizbData.texts[item.number] || "غير محدد",
      }
    } else {
      return {
        الجزء: item.number,
        السورة: juzData.surahs[item.number] || "غير محدد",
        "رقم الصفحة": juzData.pages[item.number] || "غير محدد",
        "رقم الآية": juzData.verses[item.number] || "غير محدد",
        "من الآية": juzData.texts[item.number] || "غير محدد",
      }
    }
  }

  const details = getDetails()

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg">
            تفاصيل {mode === "hizb" ? "الحزب" : "الجزء"} {item.number}
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(details).map(([key, value]) => (
              <div key={key} className="flex justify-between items-start">
                <span className="font-medium text-sm">{key}:</span>
                <span className="text-sm text-right flex-1 mr-2">{value}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
