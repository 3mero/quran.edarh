import Navbar from "@/components/navbar"
import HomeClientWrapper from "@/components/home-client-wrapper"

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-white" dir="rtl">
      <Navbar />
      <HomeClientWrapper />
    </div>
  )
}
