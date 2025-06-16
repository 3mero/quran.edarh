"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Share2, MessageCircle, Copy } from "lucide-react"

interface ShareInfo {
  pageText: string
  pageLink: string
  title: string
}

interface ShareSectionProps {
  shareInfo: ShareInfo
  onShare: (title: string) => void
}

export default function ShareSection({ shareInfo, onShare }: ShareSectionProps) {
  const [title, setTitle] = useState("")

  useEffect(() => {
    // Load saved title
    const savedTitle = localStorage.getItem("shareTitle")
    if (savedTitle) {
      setTitle(savedTitle)
    }
  }, [])

  useEffect(() => {
    // Save title whenever it changes
    localStorage.setItem("shareTitle", title)
  }, [title])

  // إنشاء نص الرسالة للمشاركة العامة
  const generateShareMessage = () => {
    const pageText = shareInfo.pageText || "1"
    const pageLink = shareInfo.pageLink || "https://read-quran.github.io/quran/1-Pages/1"
    const titleText = title.trim()

    let message: string
    if (titleText) {
      if (pageText.includes("إلى")) {
        message = `${titleText} | الصفحات من ${pageText} | الرابط: ${pageLink}`
      } else {
        message = `${titleText} | الصفحة ${pageText} | الرابط: ${pageLink}`
      }
    } else {
      if (pageText.includes("إلى")) {
        message = `الصفحات من ${pageText} | الرابط: ${pageLink}`
      } else {
        message = `الصفحة ${pageText} | الرابط: ${pageLink}`
      }
    }

    return message
  }

  const handleShare = () => {
    const now = new Date()
    const days = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"]
    const dayName = days[now.getDay()]
    const formattedDate = now.toLocaleDateString("ar-LY", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
    const formattedTime = now.toLocaleTimeString("ar-LY", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    })

    const pageText = shareInfo.pageText || "1"
    const pageLink = shareInfo.pageLink || "https://read-quran.github.io/quran/1-Pages/1"

    // Save last shared info
    localStorage.setItem("lastSharedPages", pageText)

    // Save detailed share info
    const shareDetails = {
      dayName,
      formattedDate,
      formattedTime,
      title: title.trim(),
      pageText,
      pageLink,
      timestamp: Date.now(),
    }
    localStorage.setItem("lastSharedDetails", JSON.stringify(shareDetails))

    onShare(title.trim())
  }

  const handleDirectWhatsAppShare = () => {
    const message = generateShareMessage()
    const whatsappLink = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`
    window.open(whatsappLink, "_blank")
    handleShare()
  }

  const handleGeneralShare = async () => {
    const message = generateShareMessage()

    // نسخ النص إلى الحافظة
    try {
      // محاولة استخدام Clipboard API الحديث
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(message)
        alert("تم نسخ الرسالة إلى الحافظة! يمكنك الآن لصقها في أي تطبيق")
      } else {
        // طريقة بديلة للمتصفحات القديمة
        const textArea = document.createElement("textarea")
        textArea.value = message
        textArea.style.position = "fixed"
        textArea.style.left = "-999999px"
        textArea.style.top = "-999999px"
        document.body.appendChild(textArea)
        textArea.focus()
        textArea.select()

        const successful = document.execCommand("copy")
        document.body.removeChild(textArea)

        if (successful) {
          alert("تم نسخ الرسالة إلى الحافظة! يمكنك الآن لصقها في أي تطبيق")
        } else {
          // عرض النص في نافذة منبثقة للنسخ اليدوي
          prompt("انسخ هذا النص:", message)
        }
      }
      handleShare()
    } catch (err) {
      console.error("فشل في النسخ:", err)
      // عرض النص في نافذة منبثقة للنسخ اليدوي
      prompt("انسخ هذا النص:", message)
      handleShare()
    }
  }

  return (
    <Card className="w-full bg-slate-800 border-slate-600">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg text-white flex items-center gap-2">
          <Share2 className="h-5 w-5 text-emerald-400" />
          مشاركة الصفحات
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Title Input */}
        <div>
          <Label htmlFor="title" className="text-white mb-2 block">
            اكتب عنوان (اختياري):
          </Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="اكتب عنوان هنا..."
            className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
          />
        </div>

        {/* Direct WhatsApp Share Button */}
        <Button
          onClick={handleDirectWhatsAppShare}
          className="w-full bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
        >
          <MessageCircle className="h-4 w-4" />
          مشاركة مباشرة عبر واتساب
        </Button>

        {/* Share Buttons Row */}
        <div className="flex gap-2">
          {/* General Share Button */}
          <Button
            onClick={handleGeneralShare}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
          >
            <Copy className="h-4 w-4" />
            نسخ الرسالة
          </Button>

          {/* WhatsApp Link Button */}
          <a
            href={`https://api.whatsapp.com/send?text=${encodeURIComponent(generateShareMessage())}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 bg-green-600 hover:bg-green-700 text-white flex items-center gap-2 justify-center p-3 rounded-lg transition-colors text-decoration-none"
            onClick={handleShare}
          >
            <MessageCircle className="h-4 w-4" />
            رابط واتساب
          </a>
        </div>

        {/* Preview */}
        <div className="bg-slate-700 p-3 rounded border border-slate-600">
          <div className="text-sm text-slate-300 mb-2">معاينة الرسالة:</div>
          <div className="text-white text-sm break-all">
            {title.trim() && `${title.trim()} | `}
            {shareInfo.pageText
              ? shareInfo.pageText.includes("إلى")
                ? `الصفحات من ${shareInfo.pageText}`
                : `الصفحة ${shareInfo.pageText}`
              : "الصفحة 1"}{" "}
            | الرابط: {shareInfo.pageLink || "https://read-quran.github.io/quran/1-Pages/1"}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
