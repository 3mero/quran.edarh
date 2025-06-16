"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Search, BookOpen, History, RotateCcw, Trash2, Clock, X, ChevronDown, ChevronUp } from "lucide-react"
import { searchHistory } from "@/lib/search-history"

interface SearchBoxProps {
  onSearch: (term: string, withTashkeel: boolean) => void
  suggestions: string[]
  onSuggestionClick: (suggestion: string) => void
}

interface SearchHistoryItem {
  id: number
  term: string
  withTashkeel: boolean
  resultsCount: number
  timestamp: number
  date: string
}

export default function SearchBox({ onSearch, suggestions, onSuggestionClick }: SearchBoxProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [withTashkeel, setWithTashkeel] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [history, setHistory] = useState<SearchHistoryItem[]>([])

  const historyRef = useRef<HTMLDivElement>(null)

  // تحميل سجل البحث عند بدء التشغيل
  useEffect(() => {
    setHistory(searchHistory.getHistory())
  }, [])

  // إغلاق سجل البحث عند النقر خارجه
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (historyRef.current && !historyRef.current.contains(event.target as Node)) {
        setShowHistory(false)
      }
    }

    if (showHistory) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [showHistory])

  const handleSearch = () => {
    if (!searchTerm.trim()) {
      alert("الرجاء إدخال كلمة للبحث")
      return
    }

    // إضافة البحث إلى السجل
    const updatedHistory = searchHistory.addSearch(searchTerm.trim(), withTashkeel, 0)
    setHistory(updatedHistory)

    onSearch(searchTerm.trim(), withTashkeel)
    setShowSuggestions(false)
    setShowHistory(false)
  }

  const handleInputChange = (value: string) => {
    setSearchTerm(value)
    setShowSuggestions(value.length >= 2)
    setShowHistory(false)
  }

  const handleSuggestionClick = (suggestion: string) => {
    setSearchTerm(suggestion)
    setShowSuggestions(false)
    onSuggestionClick(suggestion)
  }

  const handleHistorySearch = (historyItem: SearchHistoryItem) => {
    setSearchTerm(historyItem.term)
    setWithTashkeel(historyItem.withTashkeel)
    setShowHistory(false)
    onSearch(historyItem.term, historyItem.withTashkeel)
  }

  const handleRemoveFromHistory = (searchId: number, event: React.MouseEvent) => {
    event.stopPropagation()
    const updatedHistory = searchHistory.removeSearch(searchId)
    setHistory(updatedHistory)
  }

  const handleClearHistory = () => {
    const updatedHistory = searchHistory.clearHistory()
    setHistory(updatedHistory)
    setShowHistory(false)
  }

  const toggleHistory = () => {
    setShowHistory(!showHistory)
    setShowSuggestions(false)
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-emerald-500/30 shadow-2xl">
        <CardHeader className="pb-4 text-center">
          <CardTitle className="text-2xl text-white flex items-center justify-center gap-3">
            <BookOpen className="h-7 w-7 text-emerald-400" />
            البحث في القرآن الكريم
          </CardTitle>
          <p className="text-slate-300 mt-2">ابحث في آيات الكتاب الكريم واعثر على ما تريد</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="relative">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
                <Input
                  value={searchTerm}
                  onChange={(e) => handleInputChange(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  placeholder="ادخل كلمة أو جملة للبحث..."
                  className="pr-12 pl-4 py-4 text-lg bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-emerald-500 focus:ring-emerald-500/20"
                />
              </div>

              {/* زر سجل البحث */}
              <Button
                onClick={toggleHistory}
                variant="outline"
                className="px-4 py-4 bg-slate-700/50 border-slate-600 text-white hover:bg-slate-600 hover:border-emerald-500 transition-all duration-200"
                title="سجل آخر بحث"
              >
                <History className="h-5 w-5" />
                {showHistory ? <ChevronUp className="h-4 w-4 mr-1" /> : <ChevronDown className="h-4 w-4 mr-1" />}
              </Button>
            </div>

            {/* Suggestions */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full mt-2 w-full bg-slate-700 border border-slate-600 rounded-lg shadow-xl z-20 max-h-48 overflow-y-auto">
                {suggestions.slice(0, 5).map((suggestion, index) => (
                  <div
                    key={index}
                    className="p-3 hover:bg-slate-600 cursor-pointer text-white text-sm border-b border-slate-600 last:border-b-0 transition-colors"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    {suggestion.length > 80 ? `${suggestion.substring(0, 80)}...` : suggestion}
                  </div>
                ))}
              </div>
            )}

            {/* سجل البحث */}
            {showHistory && (
              <div
                ref={historyRef}
                className="absolute top-full mt-2 w-full bg-slate-700 border border-slate-600 rounded-lg shadow-xl z-20 max-h-80 overflow-y-auto"
              >
                <div className="p-4 border-b border-slate-600">
                  <div className="flex items-center justify-between">
                    <h3 className="text-white font-semibold flex items-center gap-2">
                      <Clock className="h-4 w-4 text-emerald-400" />
                      سجل البحث الأخير
                    </h3>
                    <div className="flex items-center gap-2">
                      {history.length > 0 && (
                        <Button
                          onClick={handleClearHistory}
                          variant="ghost"
                          size="sm"
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/10 relative"
                        >
                          <X className="h-3 w-3 absolute -top-1 -right-1 text-red-500 bg-red-500/20 rounded-full p-0.5" />
                          <Trash2 className="h-4 w-4 mr-1" />
                          مسح الكل
                        </Button>
                      )}
                      <Button
                        onClick={() => setShowHistory(false)}
                        variant="ghost"
                        size="sm"
                        className="text-slate-400 hover:text-slate-300 hover:bg-slate-600 p-1"
                        title="إغلاق"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {history.length === 0 ? (
                  <div className="p-6 text-center text-slate-400">
                    <History className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>لا يوجد سجل بحث حتى الآن</p>
                    <p className="text-sm mt-1">ابدأ بالبحث لحفظ كلماتك المفضلة</p>
                  </div>
                ) : (
                  <div className="max-h-64 overflow-y-auto">
                    {history.map((item) => (
                      <div
                        key={item.id}
                        className="p-3 hover:bg-slate-600 cursor-pointer border-b border-slate-600 last:border-b-0 transition-all duration-200 group"
                        onClick={() => handleHistorySearch(item)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-white font-medium text-lg">"{item.term}"</span>
                              {item.withTashkeel && (
                                <Badge
                                  variant="secondary"
                                  className="text-xs bg-emerald-600/20 text-emerald-400 border-emerald-500/30"
                                >
                                  بالتشكيل
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-4 text-xs text-slate-400">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {item.date}
                              </span>
                              {item.resultsCount > 0 && (
                                <span className="text-emerald-400">{item.resultsCount} نتيجة</span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              onClick={() => handleHistorySearch(item)}
                              variant="ghost"
                              size="sm"
                              className="text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10"
                              title="إعادة البحث"
                            >
                              <RotateCcw className="h-4 w-4" />
                            </Button>
                            <Button
                              onClick={(e) => handleRemoveFromHistory(item.id, e)}
                              variant="ghost"
                              size="sm"
                              className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                              title="حذف من السجل"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center justify-center space-x-3 rtl:space-x-reverse">
            <Checkbox
              id="tashkeel"
              checked={withTashkeel}
              onCheckedChange={(checked) => setWithTashkeel(checked as boolean)}
              className="border-emerald-500 data-[state=checked]:bg-emerald-600"
            />
            <label htmlFor="tashkeel" className="text-white cursor-pointer font-medium">
              البحث بالتشكيل
            </label>
          </div>

          <Button
            onClick={handleSearch}
            className="w-full py-4 text-lg bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-semibold shadow-lg transition-all duration-200 transform hover:scale-[1.02]"
          >
            <Search className="h-5 w-5 mr-2" />
            بحث في القرآن الكريم
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
