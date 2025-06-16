"use client"

import { useState, useEffect } from "react"
import TodayInfo from "@/components/today-info"
import PageSelector from "@/components/page-selector"
import ShareSection from "@/components/share-section"
import LastSharedBar from "@/components/last-shared-bar"
import Navbar from "@/components/navbar"

export default function SharePage() {
  const [selectedPageIndex, setSelectedPageIndex] = useState(0)
  const [shareInfo, setShareInfo] = useState({
    pageText: "1",
    pageLink: "https://read-quran.github.io/quran/1-Pages/1",
    title: "",
  })
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    // Load last selected page
    const savedIndex = localStorage.getItem("lastSelectedPageIndex")
    if (savedIndex) {
      setSelectedPageIndex(Number.parseInt(savedIndex))
    }
  }, [])

  const handlePageChange = (pageInfo: { text: string; link: string; index: number }) => {
    setSelectedPageIndex(pageInfo.index)
    setShareInfo({
      pageText: pageInfo.text,
      pageLink: pageInfo.link,
      title: shareInfo.title,
    })
  }

  const handleShare = (title: string) => {
    setShareInfo((prev) => ({ ...prev, title }))
    // Trigger refresh of LastSharedBar component
    setRefreshKey((prev) => prev + 1)

    // Dispatch custom event for same-tab updates
    window.dispatchEvent(new Event("shareUpdate"))
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />

      <div className="container mx-auto px-4 py-8 pt-24 space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-6 text-emerald-400">مشاركة صفحات القرآن الكريم</h1>
          <p className="text-slate-300 text-lg">شارك صفحات القرآن الكريم مع الآخرين بسهولة</p>
        </div>

        <div className="max-w-2xl mx-auto space-y-6">
          {/* Today Info */}
          <TodayInfo />

          {/* Last Shared Bar */}
          <div key={refreshKey}>
            <LastSharedBar />
          </div>

          {/* Page Selector */}
          <PageSelector onPageChange={handlePageChange} selectedPageIndex={selectedPageIndex} />

          {/* Share Section */}
          <ShareSection shareInfo={shareInfo} onShare={handleShare} />
        </div>
      </div>
    </div>
  )
}
