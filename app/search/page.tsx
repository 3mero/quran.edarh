"use client"

import { useState } from "react"
import { quranData, quranTashkeelData } from "@/data/quran-search-data"
import SearchBox from "@/components/search-box"
import SearchResults from "@/components/search-results"
import ListsManager from "@/components/lists-manager"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { searchHistory } from "@/lib/search-history"
import Navbar from "@/components/navbar"

interface AyaData {
  suraIndex: string
  suraName: string
  ayaIndex: string
  ayaText: string
  bismillah?: string
  highlighted?: string
}

export default function SearchPage() {
  const [results, setResults] = useState<AyaData[]>([])
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchStats, setSearchStats] = useState({ totalResults: 0, totalSuras: 0, searchTerm: "" })

  // Parse XML data
  const parser = typeof DOMParser !== "undefined" ? new DOMParser() : null
  const quranXMLDoc = parser ? parser.parseFromString(quranData, "text/xml") : null
  const quranTashkeelXMLDoc = parser ? parser.parseFromString(quranTashkeelData, "text/xml") : null

  const generateSuggestions = (searchTerm: string) => {
    if (!quranXMLDoc || searchTerm.length < 2) {
      setSuggestions([])
      return
    }

    const suggestionsList: string[] = []
    const suras = quranXMLDoc.getElementsByTagName("sura")

    for (const sura of Array.from(suras)) {
      const ayas = sura.getElementsByTagName("aya")
      for (const aya of Array.from(ayas)) {
        const ayaText = aya.getAttribute("text") || ""
        if (ayaText.includes(searchTerm)) {
          suggestionsList.push(ayaText)
          if (suggestionsList.length >= 5) break
        }
      }
      if (suggestionsList.length >= 5) break
    }

    setSuggestions(suggestionsList)
  }

  const getAyaWithTashkeel = (suraIndex: string, ayaIndex: string): string => {
    if (!quranTashkeelXMLDoc) return ""

    const suras = quranTashkeelXMLDoc.getElementsByTagName("sura")
    for (const sura of Array.from(suras)) {
      if (sura.getAttribute("index") === suraIndex) {
        const ayas = sura.getElementsByTagName("aya")
        for (const aya of Array.from(ayas)) {
          if (aya.getAttribute("index") === ayaIndex) {
            return aya.getAttribute("text") || ""
          }
        }
      }
    }
    return ""
  }

  const highlightSearchTerm = (text: string, searchTerm: string): string => {
    // Enhanced highlighting with multiple styles
    const regex = new RegExp(`(${searchTerm})`, "gi")
    return text.replace(
      regex,
      '<span class="bg-gradient-to-r from-yellow-400 to-orange-400 text-black px-2 py-1 rounded-md font-bold shadow-lg border border-yellow-500 animate-pulse">$1</span>',
    )
  }

  const performSearch = (searchTerm: string, searchWithTashkeel: boolean) => {
    if (!quranXMLDoc) return

    setIsLoading(true)
    setResults([])

    setTimeout(() => {
      const searchResults: AyaData[] = []
      const suras = quranXMLDoc.getElementsByTagName("sura")
      let totalSuras = 0

      for (const sura of Array.from(suras)) {
        const suraIndex = sura.getAttribute("index") || ""
        const suraName = sura.getAttribute("name") || ""
        const ayas = sura.getElementsByTagName("aya")
        let suraHasResults = false

        for (const aya of Array.from(ayas)) {
          const ayaIndex = aya.getAttribute("index") || ""
          const ayaText = aya.getAttribute("text") || ""
          const bismillah = aya.getAttribute("bismillah") || ""

          if (ayaText.includes(searchTerm)) {
            const ayaTashkeel = searchWithTashkeel ? getAyaWithTashkeel(suraIndex, ayaIndex) : ""
            const finalText = searchWithTashkeel && ayaTashkeel ? ayaTashkeel : ayaText

            searchResults.push({
              suraIndex,
              suraName,
              ayaIndex,
              ayaText: finalText,
              bismillah: bismillah || undefined,
              highlighted: highlightSearchTerm(finalText, searchTerm),
            })

            if (!suraHasResults) {
              suraHasResults = true
              totalSuras++
            }
          }
        }
      }

      setResults(searchResults)
      setSearchStats({
        totalResults: searchResults.length,
        totalSuras,
        searchTerm,
      })

      // تحديث سجل البحث بعدد النتائج
      searchHistory.addSearch(searchTerm, searchWithTashkeel, searchResults.length)

      setIsLoading(false)
    }, 100)
  }

  const handleSuggestionClick = (suggestion: string) => {
    const words = suggestion.split(" ")
    const searchTerm = words.find((word) => word.length > 2) || words[0]
    performSearch(searchTerm, false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      <Navbar />

      <div className="container mx-auto px-4 py-8 pt-24 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent">
            البحث في القرآن الكريم
          </h1>
          <p className="text-slate-300 text-xl max-w-2xl mx-auto">
            ابحث في آيات القرآن الكريم وأدر مجموعاتك المفضلة بسهولة ويسر
          </p>
        </div>

        <div className="flex justify-center">
          <Tabs defaultValue="search" className="w-full max-w-4xl">
            <div className="flex justify-center mb-8">
              <TabsList className="grid grid-cols-2 bg-slate-800 border-slate-600 h-12 w-80">
                <TabsTrigger
                  value="search"
                  className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white text-lg"
                >
                  البحث
                </TabsTrigger>
                <TabsTrigger
                  value="lists"
                  className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white text-lg"
                >
                  إدارة القوائم
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="search" className="space-y-8">
              {/* Search Box */}
              <SearchBox onSearch={performSearch} suggestions={suggestions} onSuggestionClick={handleSuggestionClick} />

              {/* Loading */}
              {isLoading && (
                <div className="text-center py-12">
                  <div className="inline-flex items-center gap-3 text-emerald-400 text-xl">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-400"></div>
                    جاري البحث في القرآن الكريم...
                  </div>
                </div>
              )}

              {/* Results */}
              {!isLoading && (results.length > 0 || searchStats.searchTerm) && (
                <SearchResults
                  results={results}
                  searchTerm={searchStats.searchTerm}
                  totalResults={searchStats.totalResults}
                  totalSuras={searchStats.totalSuras}
                />
              )}
            </TabsContent>

            <TabsContent value="lists">
              <ListsManager />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
