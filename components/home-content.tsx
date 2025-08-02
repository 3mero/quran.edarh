"use client"

import { useState, useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ArrowUp, Search } from "lucide-react"
import StatisticsSection from "@/components/statistics-section"
import SettingsSection from "@/components/settings-section"
import ItemCard from "@/components/item-card"
import DetailsModal from "@/components/details-modal"
import { useLocalStorage } from "@/hooks/use-local-storage"

interface ItemData {
  number: number
  day: string
  completed: boolean
  completedTime?: string
  note?: string
  images?: any[] // Assuming ImageData type from item-card
  color?: string
  hidden?: boolean
  audioNotes?: any[]
  completionBatchId?: string
  batchColor?: string
}

export default function HomeContent() {
  const [mode, setMode, isModeLoaded] = useLocalStorage<"hizb" | "juz">("currentMode", "hizb")
  const [hizbData, setHizbData, isHizbLoaded] = useLocalStorage<ItemData[]>("hizbData", [])
  const [juzData, setJuzData, isJuzLoaded] = useLocalStorage<ItemData[]>("juzData", [])

  const [searchTerm, setSearchTerm] = useState("")
  const [selectedItem, setSelectedItem] = useState<ItemData | null>(null)
  const [showScrollTop, setShowScrollTop] = useState(false)

  const items = mode === "hizb" ? hizbData : juzData
  const setItems = mode === "hizb" ? setHizbData : setJuzData

  useEffect(() => {
    if (isModeLoaded && isHizbLoaded && isJuzLoaded) {
      if (hizbData.length === 0) {
        createDefaultItems("hizb", setHizbData)
      }
      if (juzData.length === 0) {
        createDefaultItems("juz", setJuzData)
      }
    }
  }, [isModeLoaded, isHizbLoaded, isJuzLoaded, hizbData.length, juzData.length])

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleModeChange = (newMode: "hizb" | "juz") => {
    setMode(newMode)
  }

  const handleGenerate = (from: number, to: number, firstDay: string) => {
    const days = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"]
    let currentDayIndex = days.indexOf(firstDay)
    const newItems: ItemData[] = []
    for (let i = from; i <= to; i++) {
      newItems.push({
        number: i,
        day: days[currentDayIndex],
        completed: false,
        color: "#1e1e2f",
        hidden: false,
      })
      currentDayIndex = (currentDayIndex + 1) % days.length
    }
    setItems(newItems)
  }

  const handleReset = () => {
    setHizbData([])
    setJuzData([])
    setMode("hizb")
  }

  const handleUpdateItem = (updatedItem: ItemData) => {
    setItems((prevItems) => prevItems.map((item) => (item.number === updatedItem.number ? updatedItem : item)))
  }

  const generateRandomColor = () => {
    const letters = "89ABCDEF"
    let color = "#"
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * letters.length)]
    }
    return color
  }

  const handleCompleteItems = (startNumber: number, count: number) => {
    const batchId = `batch_${Date.now()}`
    const batchColor = generateRandomColor()
    const days = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"]
    const firstItemOfBatch = items.find((i) => i.number === startNumber)
    if (!firstItemOfBatch) return

    const completionDay = firstItemOfBatch.day
    const completionDayIndex = days.indexOf(completionDay)

    const updatedItems = items.map((item) => {
      if (item.number >= startNumber && item.number < startNumber + count) {
        return {
          ...item,
          completed: true,
          completedTime: new Date().toLocaleString(),
          completionBatchId: batchId,
          batchColor: batchColor,
          day: completionDay,
        }
      }
      return item
    })

    if (completionDayIndex !== -1) {
      let nextDayIndex = (completionDayIndex + 1) % 7
      const lastCompletedItemIndex = updatedItems.findIndex((item) => item.number === startNumber + count - 1)

      if (lastCompletedItemIndex !== -1) {
        for (let i = lastCompletedItemIndex + 1; i < updatedItems.length; i++) {
          updatedItems[i].day = days[nextDayIndex]
          nextDayIndex = (nextDayIndex + 1) % 7
        }
      }
    }
    setItems(updatedItems)
  }

  const handleUndoCompletion = (itemsToUndoNumbers: number[]) => {
    const tempItems = items.map((item) => {
      if (itemsToUndoNumbers.includes(item.number)) {
        const { completedTime, completionBatchId, batchColor, ...rest } = item
        return {
          ...rest,
          completed: false,
        }
      }
      return item
    })

    const lastCompletedIndex = tempItems.map((i) => i.completed).lastIndexOf(true)
    const days = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"]
    let dayIndex = lastCompletedIndex === -1 ? 0 : (days.indexOf(tempItems[lastCompletedIndex].day) + 1) % 7

    const finalItems = tempItems.map((item, index) => {
      if (index > lastCompletedIndex) {
        const newItem = { ...item, day: days[dayIndex] }
        dayIndex = (dayIndex + 1) % 7
        return newItem
      }
      return item
    })

    setItems(finalItems)
  }

  const handleShowDetails = (item: ItemData) => {
    setSelectedItem(item)
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const filteredItems = items.filter(
    (item) =>
      !item.hidden &&
      (item.number.toString().includes(searchTerm) || item.day.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  const completedCount = items.filter((item) => item.completed).length
  const remainingCount = items.length - completedCount
  const lastCompleted = items
    .filter((item) => item.completed)
    .sort((a, b) => a.number - b.number)
    .pop()
  const hiddenItems = items.filter((item) => item.hidden)

  const createDefaultItems = (currentMode: "hizb" | "juz", setter: (items: ItemData[]) => void) => {
    const days = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"]
    const maxItems = currentMode === "hizb" ? 60 : 30
    let currentDayIndex = 0
    const defaultItems: ItemData[] = []
    for (let i = 1; i <= maxItems; i++) {
      defaultItems.push({
        number: i,
        day: days[currentDayIndex],
        completed: false,
        color: "#1e1e2f",
        hidden: false,
      })
      currentDayIndex = (currentDayIndex + 1) % 7
    }
    setter(defaultItems)
  }

  if (!isModeLoaded || !isHizbLoaded || !isJuzLoaded) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400 mx-auto mb-4"></div>
          <p className="text-slate-300">جاري التحميل...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white" dir="rtl">
      <main className="container mx-auto px-4 pt-20 pb-8 space-y-6">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-6 text-emerald-400">إدارة الأحزاب والأجزاء</h1>
          <div className="max-w-xs mx-auto">
            <Select value={mode} onValueChange={handleModeChange}>
              <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-600">
                <SelectItem value="hizb" className="text-white hover:bg-slate-700">
                  الأحزاب
                </SelectItem>
                <SelectItem value="juz" className="text-white hover:bg-slate-700">
                  الأجزاء
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <StatisticsSection
          mode={mode}
          items={items}
          completedCount={completedCount}
          remainingCount={remainingCount}
          lastCompleted={lastCompleted}
        />

        <SettingsSection mode={mode} onGenerate={handleGenerate} onReset={handleReset} />

        <div
          className={`w-full max-w-2xl mx-auto border-2 rounded-lg p-4 bg-slate-800 border-slate-600 ${mode === "hizb" ? "border-emerald-500" : "border-rose-500"}`}
        >
          <h2 className="text-xl font-semibold mb-4 text-center text-white">
            قائمة {mode === "hizb" ? "الأحزاب" : "الأجزاء"}
          </h2>

          <div className="relative mb-4">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
            <Input
              placeholder="بحث بالرقم أو اليوم..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10 bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
            />
          </div>

          {hiddenItems.length > 0 && (
            <div className="mb-4">
              <Select
                onValueChange={(value) => {
                  const itemNumber = Number.parseInt(value)
                  const item = items.find((i) => i.number === itemNumber)
                  if (item) {
                    handleUpdateItem({ ...item, hidden: false })
                  }
                }}
              >
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue placeholder="استرجاع عنصر مخفي" />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  {hiddenItems.map((item) => (
                    <SelectItem
                      key={item.number}
                      value={item.number.toString()}
                      className="text-white hover:bg-slate-600"
                    >
                      {mode === "hizb" ? "حزب" : "جزء"} {item.number}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-4">
            {filteredItems.length > 0 ? (
              filteredItems.map((item) => (
                <ItemCard
                  key={item.number}
                  item={item}
                  items={items}
                  mode={mode}
                  onUpdate={handleUpdateItem}
                  onShowDetails={handleShowDetails}
                  onComplete={handleCompleteItems}
                  onUndo={handleUndoCompletion}
                />
              ))
            ) : (
              <div className="text-center py-8 text-slate-400">
                {items.length === 0 ? "لا توجد عناصر. استخدم الإعدادات لتوليد القائمة." : "لا توجد نتائج للبحث."}
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="bg-slate-900 border-t border-slate-700 text-center py-6">
        <p className="text-slate-300">سبحان الله وبحمده سبحان الله العظيم</p>
      </footer>

      {showScrollTop && (
        <Button
          onClick={scrollToTop}
          className={`fixed bottom-6 left-6 rounded-full p-3 shadow-xl bg-emerald-600 hover:bg-emerald-700 ${mode === "hizb" ? "border-emerald-500" : "border-rose-500"} border-2`}
          size="icon"
        >
          <ArrowUp className="h-4 w-4" />
        </Button>
      )}

      {selectedItem && (
        <DetailsModal
          item={selectedItem}
          mode={mode}
          onClose={() => setSelectedItem(null)}
          onUpdate={handleUpdateItem}
        />
      )}
    </div>
  )
}
