"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, Home, Search, Share, Settings, X, Cog } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  const menuItems = [
    { href: "/", label: "الصفحة الرئيسية", icon: Home },
    { href: "/search", label: "البحث في القرآن الكريم", icon: Search },
    { href: "/share", label: "مشاركة صفحات القرآن الكريم", icon: Share },
    { href: "/manage", label: "إدارة صفحات القرآن الكريم", icon: Settings },
    { href: "/settings", label: "التهيئة والإعدادات", icon: Cog },
  ]

  const isActive = (href: string) => {
    return pathname === href
  }

  return (
    <nav className="fixed top-0 w-full bg-slate-900 border-b border-slate-700 text-white z-50 shadow-xl">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Title */}
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <img src="/quran-icon.png" alt="القرآن الكريم" className="w-8 h-8" />
            <span className="text-xl font-bold text-emerald-400">إدارة الأحزاب والأجزاء</span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden lg:flex space-x-6 rtl:space-x-reverse">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 transition-colors px-3 py-2 rounded-lg hover:bg-slate-800 ${
                  isActive(item.href)
                    ? "text-emerald-400 bg-slate-800 border-b-2 border-emerald-400"
                    : "text-white hover:text-emerald-400"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </div>

          {/* Mobile Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 bg-slate-900 border-slate-700">
              <SheetHeader className="flex flex-row items-center justify-between">
                <SheetTitle className="text-right text-emerald-400 flex items-center gap-2">
                  <img src="/quran-icon.png" alt="القرآن الكريم" className="w-6 h-6" />
                  إدارة الأحزاب والأجزاء
                </SheetTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </Button>
              </SheetHeader>
              <div className="flex flex-col space-y-4 mt-8">
                {menuItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-3 transition-colors p-3 rounded-lg hover:bg-slate-800 ${
                      isActive(item.href)
                        ? "text-emerald-400 bg-slate-800 border-r-4 border-emerald-400"
                        : "text-white hover:text-emerald-400"
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                ))}
              </div>

              {/* Additional Info in Mobile Menu */}
              <div className="mt-8 pt-8 border-t border-slate-700">
                <div className="text-center text-slate-400 text-sm">
                  <p>تطبيق إدارة الأحزاب والأجزاء</p>
                  <p className="mt-2">سبحان الله وبحمده</p>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  )
}
