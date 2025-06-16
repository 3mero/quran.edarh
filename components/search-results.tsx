"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BarChart3, Search } from "lucide-react"
import AyaCard from "./aya-card"

interface AyaData {
  suraIndex: string
  suraName: string
  ayaIndex: string
  ayaText: string
  bismillah?: string
  highlighted?: string
}

interface SearchResultsProps {
  results: AyaData[]
  searchTerm: string
  totalResults: number
  totalSuras: number
}

export default function SearchResults({ results, searchTerm, totalResults, totalSuras }: SearchResultsProps) {
  const [currentAyaIndex, setCurrentAyaIndex] = useState(0)

  // Reset to first result when new search is performed
  useEffect(() => {
    setCurrentAyaIndex(0)
  }, [results])

  const handleNavigate = (direction: "prev" | "next") => {
    if (direction === "prev" && currentAyaIndex > 0) {
      setCurrentAyaIndex(currentAyaIndex - 1)
    } else if (direction === "next" && currentAyaIndex < results.length - 1) {
      setCurrentAyaIndex(currentAyaIndex + 1)
    }
  }

  // Simple green highlight function
  const simpleGreenHighlight = (text: string, searchTerm: string): string => {
    const regex = new RegExp(`(${searchTerm})`, "gi")
    return text.replace(regex, '<span class="text-white bg-emerald-600 px-1 rounded">$1</span>')
  }

  if (results.length === 0) {
    return (
      <div className="w-full max-w-4xl mx-auto">
        <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-red-500/30">
          <CardContent className="p-12 text-center">
            <Search className="h-16 w-16 text-red-400 mx-auto mb-4" />
            <div className="text-red-400 text-2xl font-semibold mb-2">لا توجد نتائج</div>
            <div className="text-slate-400 text-lg">لم يتم العثور على نتائج للبحث عن "{searchTerm}"</div>
            <div className="text-slate-500 mt-2">جرب كلمات مختلفة أو تأكد من الإملاء</div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Apply simple green highlighting
  const highlightedResults = results.map((result) => ({
    ...result,
    highlighted: simpleGreenHighlight(result.ayaText, searchTerm),
  }))

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Search Statistics */}
      <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-emerald-500/30">
        <CardHeader className="text-center">
          <CardTitle className="text-xl text-white flex items-center justify-center gap-3">
            <BarChart3 className="h-6 w-6 text-emerald-400" />
            نتائج البحث
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap justify-center gap-3">
            <Badge variant="secondary" className="bg-emerald-600 text-white px-4 py-2 text-sm">
              {totalResults} نتيجة
            </Badge>
            <Badge variant="outline" className="border-slate-600 text-slate-300 px-4 py-2 text-sm">
              {totalSuras} سورة
            </Badge>
            <Badge variant="outline" className="border-yellow-500 text-yellow-300 px-4 py-2 text-sm bg-yellow-500/10">
              البحث عن: "{searchTerm}"
            </Badge>
          </div>
          <div className="text-center text-sm text-slate-400 mt-4">
            الكلمات المميزة باللون الأخضر هي نتائج البحث • استخدم أزرار التنقل للانتقال بين النتائج
          </div>
        </CardContent>
      </Card>

      {/* Current Aya */}
      <AyaCard
        aya={highlightedResults[currentAyaIndex]}
        allAyas={highlightedResults}
        currentIndex={currentAyaIndex}
        onNavigate={handleNavigate}
        isSearchResult={true}
      />

      {/* All Results Summary */}
      <Card className="bg-slate-800 border-slate-600">
        <CardHeader>
          <CardTitle className="text-lg text-white text-center">جميع النتائج ({totalResults} آية)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {highlightedResults.map((aya, index) => (
              <div
                key={`${aya.suraIndex}-${aya.ayaIndex}`}
                className={`p-4 rounded-lg cursor-pointer transition-all duration-200 text-center ${
                  index === currentAyaIndex
                    ? "bg-emerald-600 text-white shadow-lg transform scale-[1.02]"
                    : "bg-slate-700/50 text-slate-200 hover:bg-slate-700"
                }`}
                onClick={() => setCurrentAyaIndex(index)}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold">سورة {aya.suraName}</span>
                  <span className="text-sm">آية {aya.ayaIndex}</span>
                </div>
                <div
                  className="text-sm opacity-90"
                  dangerouslySetInnerHTML={{
                    __html:
                      aya.ayaText.length > 100
                        ? simpleGreenHighlight(aya.ayaText.substring(0, 100) + "...", searchTerm)
                        : simpleGreenHighlight(aya.ayaText, searchTerm),
                  }}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
