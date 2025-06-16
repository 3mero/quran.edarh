"use client"

import dynamic from "next/dynamic"
import ClientOnly from "@/components/client-only"

// Dynamically import the main content with no SSR
const HomeContent = dynamic(() => import("@/components/home-content"), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400 mx-auto mb-4"></div>
        <p className="text-slate-300">جاري التحميل...</p>
      </div>
    </div>
  ),
})

export default function HomeClientWrapper() {
  return (
    <ClientOnly
      fallback={
        <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400 mx-auto mb-4"></div>
            <p className="text-slate-300">جاري التحميل...</p>
          </div>
        </div>
      }
    >
      <HomeContent />
    </ClientOnly>
  )
}
