"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react"

interface PageSelectorProps {
  onPageChange: (pageInfo: { text: string; link: string; index: number }) => void
  selectedPageIndex: number
}

export default function PageSelector({ onPageChange, selectedPageIndex }: PageSelectorProps) {
  const [pageCount, setPageCount] = useState(3)
  const [pages, setPages] = useState<{ text: string; link: string }[]>([])

  useEffect(() => {
    // Load saved page count
    const savedPageCount = localStorage.getItem("pageCount")
    if (savedPageCount) {
      setPageCount(Number.parseInt(savedPageCount))
    }
  }, [])

  useEffect(() => {
    updatePages()
  }, [pageCount])

  useEffect(() => {
    // Trigger initial page selection when pages are loaded
    if (pages.length > 0 && pages[selectedPageIndex]) {
      onPageChange({
        text: pages[selectedPageIndex].text,
        link: pages[selectedPageIndex].link,
        index: selectedPageIndex,
      })
    }
  }, [pages, selectedPageIndex])

  const updatePages = () => {
    const newPages: { text: string; link: string }[] = []

    if (pageCount === 1) {
      // Single page mode
      for (let i = 1; i <= 604; i++) {
        newPages.push({
          text: `${i}`,
          link: `https://read-quran.github.io/quran/1-Pages/${i}`,
        })
      }
    } else {
      // Multiple pages mode
      for (let i = 1; i <= 604; i += pageCount) {
        const end = Math.min(i + pageCount - 1, 604)
        newPages.push({
          text: `${i} إلى ${end}`,
          link: `https://read-quran.github.io/quran/${pageCount}-Pages/${end}-${i}`,
        })
      }
    }

    setPages(newPages)
  }

  const handlePageCountChange = (newCount: string) => {
    const count = Number.parseInt(newCount)
    if (confirm("هل أنت متأكد من تغيير عدد الصفحات؟")) {
      setPageCount(count)
      localStorage.setItem("pageCount", count.toString())
    }
  }

  const navigate = (direction: "prev" | "next") => {
    const currentIndex = selectedPageIndex
    let newIndex: number

    if (direction === "prev") {
      newIndex = Math.max(0, currentIndex - 1)
    } else {
      newIndex = Math.min(pages.length - 1, currentIndex + 1)
    }

    if (newIndex !== currentIndex && pages[newIndex]) {
      onPageChange({
        text: pages[newIndex].text,
        link: pages[newIndex].link,
        index: newIndex,
      })
      localStorage.setItem("lastSelectedPageIndex", newIndex.toString())
    }
  }

  const handlePageSelect = (value: string) => {
    const index = Number.parseInt(value)
    if (pages[index]) {
      onPageChange({
        text: pages[index].text,
        link: pages[index].link,
        index,
      })
      localStorage.setItem("lastSelectedPageIndex", index.toString())
    }
  }

  return (
    <Card className="w-full bg-slate-800 border-slate-600">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg text-white flex items-center gap-2">
          <Calendar className="h-5 w-5 text-emerald-400" />
          اختيار الصفحات
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Page Count Selector */}
        <div>
          <Label htmlFor="page-count" className="text-white mb-2 block">
            عدد الصفحات:
          </Label>
          <Select value={pageCount.toString()} onValueChange={handlePageCountChange}>
            <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-700 border-slate-600">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 20].map((count) => (
                <SelectItem key={count} value={count.toString()} className="text-white hover:bg-slate-600">
                  {count} {count === 1 ? "صفحة" : "صفحات"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Page Selector */}
        <div>
          <Label htmlFor="pages" className="text-white mb-2 block">
            <span className="text-red-400 font-bold">اختر الصفحات:</span>
          </Label>
          <Select value={selectedPageIndex.toString()} onValueChange={handlePageSelect}>
            <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
              <SelectValue placeholder="اختر الصفحات" />
            </SelectTrigger>
            <SelectContent className="bg-slate-700 border-slate-600 max-h-60">
              {pages.map((page, index) => (
                <SelectItem key={index} value={index.toString()} className="text-white hover:bg-slate-600">
                  {pageCount === 1 ? `صفحة ${page.text}` : `صفحات ${page.text}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between gap-2">
          <Button
            onClick={() => navigate("prev")}
            disabled={selectedPageIndex <= 0}
            variant="outline"
            className="flex-1 bg-slate-700 border-slate-600 text-slate-200 hover:bg-slate-600 hover:text-white disabled:opacity-50"
          >
            <ChevronRight className="h-4 w-4 ml-1" />
            السابق
          </Button>
          <Button
            onClick={() => navigate("next")}
            disabled={selectedPageIndex >= pages.length - 1}
            variant="outline"
            className="flex-1 bg-slate-700 border-slate-600 text-slate-200 hover:bg-slate-600 hover:text-white disabled:opacity-50"
          >
            التالي
            <ChevronLeft className="h-4 w-4 mr-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
