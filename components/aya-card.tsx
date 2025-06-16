"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, Settings, BookOpen } from "lucide-react"
import AyaManagement from "./aya-management"

interface AyaData {
  suraIndex: string
  suraName: string
  ayaIndex: string
  ayaText: string
  bismillah?: string
  highlighted?: string
}

interface AyaCardProps {
  aya: AyaData
  allAyas: AyaData[]
  currentIndex: number
  onNavigate: (direction: "prev" | "next") => void
  isSearchResult?: boolean
}

export default function AyaCard({ aya, allAyas, currentIndex, onNavigate, isSearchResult = false }: AyaCardProps) {
  const [showManagement, setShowManagement] = useState(false)
  const [currentAya, setCurrentAya] = useState(aya)

  // Update current aya when prop changes
  useEffect(() => {
    setCurrentAya(aya)
  }, [aya])

  const canGoPrev = currentIndex > 0
  const canGoNext = currentIndex < allAyas.length - 1

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-emerald-500/30 shadow-2xl">
        <CardContent className="p-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="bg-emerald-600 text-white px-3 py-1 text-sm">
                سورة {currentAya.suraName}
              </Badge>
              <Badge variant="outline" className="border-slate-600 text-slate-300 px-3 py-1 text-sm">
                آية {currentAya.ayaIndex}
              </Badge>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-sm text-slate-400 bg-slate-700/50 px-3 py-1 rounded-full">
                {currentIndex + 1} من {allAyas.length}
              </div>
              <Button
                onClick={() => setShowManagement(!showManagement)}
                variant="outline"
                size="sm"
                className="bg-slate-700 border-slate-600 text-slate-200 hover:bg-slate-600 transition-all duration-200"
              >
                <Settings className="h-4 w-4 mr-1" />
                إدارة
              </Button>
            </div>
          </div>

          {/* Bismillah */}
          {currentAya.bismillah && (
            <div className="text-center text-emerald-400 text-2xl font-bold mb-6 py-4 border-b border-slate-600/50">
              {currentAya.bismillah}
            </div>
          )}

          {/* Aya Text - Centered */}
          <div className="text-white text-xl leading-relaxed mb-8 p-6 bg-gradient-to-r from-slate-700/50 to-slate-600/50 rounded-xl border border-slate-600/30 text-center">
            {currentAya.highlighted ? (
              <div dangerouslySetInnerHTML={{ __html: currentAya.highlighted }} />
            ) : (
              currentAya.ayaText
            )}
          </div>

          {/* Aya Info Card - Separate from navigation */}
          <div className="bg-slate-700/50 rounded-lg border border-slate-600/30 p-4 mb-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <BookOpen className="h-5 w-5 text-emerald-400" />
              <span className="text-lg font-semibold text-white">آية {currentAya.ayaIndex}</span>
            </div>
            <div className="text-sm text-slate-300">من سورة {currentAya.suraName}</div>
            <div className="text-xs text-slate-400 mt-1">
              {isSearchResult
                ? `نتيجة ${currentIndex + 1} من ${allAyas.length}`
                : `آية ${currentIndex + 1} من ${allAyas.length}`}
            </div>
          </div>

          {/* Navigation - Separate from info */}
          <div className="flex justify-between items-center">
            <Button
              onClick={() => onNavigate("next")}
              disabled={!canGoNext}
              variant="outline"
              className="flex-1 flex items-center justify-center gap-2 bg-slate-700 border-slate-600 text-slate-200 hover:bg-slate-600 hover:text-white disabled:opacity-50 px-6 py-3 transition-all duration-200"
            >
              {isSearchResult ? "النتيجة التالية" : "الآية التالية"}
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div className="w-8"></div> {/* Spacer */}
            <Button
              onClick={() => onNavigate("prev")}
              disabled={!canGoPrev}
              variant="outline"
              className="flex-1 flex items-center justify-center gap-2 bg-slate-700 border-slate-600 text-slate-200 hover:bg-slate-600 hover:text-white disabled:opacity-50 px-6 py-3 transition-all duration-200"
            >
              <ChevronRight className="h-5 w-5" />
              {isSearchResult ? "النتيجة السابقة" : "الآية السابقة"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Management Panel */}
      {showManagement && <AyaManagement aya={currentAya} />}
    </div>
  )
}
