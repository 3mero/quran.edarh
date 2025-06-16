"use client"

import { useState, useEffect } from "react"
import { Trash2, Download, Upload, Database, AlertTriangle, CheckCircle, HardDrive } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { storageManager } from "@/lib/storage-manager"
import Navbar from "@/components/navbar"

export default function SettingsPage() {
  const [storageInfo, setStorageInfo] = useState(null)
  const [deleteConfirmText, setDeleteConfirmText] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)
  const [storageHealth, setStorageHealth] = useState(null)
  const { toast } = useToast()

  useEffect(() => {
    loadStorageInfo()
    checkStorageHealth()
  }, [])

  const loadStorageInfo = () => {
    const info = storageManager.calculateStorageSize()
    setStorageInfo(info)
  }

  const checkStorageHealth = () => {
    const health = storageManager.checkStorageHealth()
    setStorageHealth(health)
  }

  const handleDeleteAll = async () => {
    if (deleteConfirmText !== "حذف كل شي") {
      toast({
        title: "نص التأكيد غير صحيح",
        description: "يرجى كتابة 'حذف كل شي' بالضبط للتأكيد",
        variant: "destructive",
      })
      return
    }

    setIsDeleting(true)

    try {
      storageManager.clearAllData()

      toast({
        title: "تم حذف جميع البيانات",
        description: "تم حذف جميع البيانات المحفوظة بنجاح",
      })

      setDeleteConfirmText("")
      loadStorageInfo()

      // إعادة تحميل الصفحة بعد ثانيتين
      setTimeout(() => {
        window.location.reload()
      }, 2000)
    } catch (error) {
      toast({
        title: "خطأ في الحذف",
        description: "حدث خطأ أثناء حذف البيانات",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const handleExportData = () => {
    try {
      const exportData = storageManager.exportData()
      const dataStr = JSON.stringify(exportData, null, 2)
      const dataBlob = new Blob([dataStr], { type: "application/json" })

      const url = URL.createObjectURL(dataBlob)
      const link = document.createElement("a")
      link.href = url
      link.download = `quran-app-backup-${new Date().toISOString().split("T")[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast({
        title: "تم تصدير البيانات",
        description: "تم تصدير جميع البيانات بنجاح",
      })
    } catch (error) {
      toast({
        title: "خطأ في التصدير",
        description: "حدث خطأ أثناء تصدير البيانات",
        variant: "destructive",
      })
    }
  }

  const handleImportData = (event) => {
    const file = event.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const importData = JSON.parse(e.target.result)
        const success = storageManager.importData(importData)

        if (success) {
          toast({
            title: "تم استيراد البيانات",
            description: "تم استيراد البيانات بنجاح",
          })
          loadStorageInfo()
          setTimeout(() => {
            window.location.reload()
          }, 2000)
        } else {
          throw new Error("فشل في استيراد البيانات")
        }
      } catch (error) {
        toast({
          title: "خطأ في الاستيراد",
          description: "ملف البيانات غير صالح أو تالف",
          variant: "destructive",
        })
      }
    }
    reader.readAsText(file)
  }

  const getStoragePercentage = () => {
    if (!storageInfo) return 0
    // افتراض أن الحد الأقصى للتخزين المحلي هو 10MB
    const maxStorage = 10 * 1024 * 1024 // 10MB
    return Math.min((storageInfo.totalSize / maxStorage) * 100, 100)
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />

      <div className="container mx-auto px-4 py-8 pt-24">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h1 className="text-4xl font-bold text-emerald-400 text-center">التهيئة والإعدادات</h1>
          </div>

          {/* معلومات التخزين */}
          <Card className="bg-slate-800 border-slate-700 shadow-lg mb-8">
            <CardHeader>
              <CardTitle className="text-2xl text-emerald-400 flex items-center gap-2">
                <Database className="h-6 w-6" />
                معلومات التخزين
              </CardTitle>
            </CardHeader>
            <CardContent>
              {storageInfo && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-200">إجمالي حجم البيانات:</span>
                    <span className="text-emerald-400 font-bold text-lg">{storageInfo.totalSizeFormatted}</span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>استخدام التخزين</span>
                      <span>{getStoragePercentage().toFixed(1)}%</span>
                    </div>
                    <Progress value={getStoragePercentage()} className="h-2" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                    {Object.entries(storageInfo.details).map(([key, info]) => (
                      <div key={key} className="bg-slate-700 p-3 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-300 text-sm">{getKeyDisplayName(key)}</span>
                          <span className="text-emerald-400 text-sm">{info.sizeFormatted}</span>
                        </div>
                        <div className="text-slate-400 text-xs mt-1">{info.itemCount} عنصر</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* حالة التخزين */}
          {storageHealth && (
            <Card className="bg-slate-800 border-slate-700 shadow-lg mb-8">
              <CardHeader>
                <CardTitle className="text-2xl text-emerald-400 flex items-center gap-2">
                  <HardDrive className="h-6 w-6" />
                  حالة التخزين
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Alert className={`bg-slate-700 ${storageHealth.isHealthy ? "border-emerald-500" : "border-red-500"}`}>
                  <div className="flex items-center gap-2">
                    {storageHealth.isHealthy ? (
                      <CheckCircle className="h-4 w-4 text-emerald-500" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                    )}
                    <AlertDescription className="text-white">
                      {storageHealth.isHealthy
                        ? "التخزين يعمل بشكل طبيعي"
                        : `مشاكل في التخزين: ${storageHealth.issues.join(", ")}`}
                    </AlertDescription>
                  </div>
                </Alert>
              </CardContent>
            </Card>
          )}

          {/* نسخ احتياطي واستعادة */}
          <Card className="bg-slate-800 border-slate-700 shadow-lg mb-8">
            <CardHeader>
              <CardTitle className="text-2xl text-emerald-400 flex items-center gap-2">
                <Download className="h-6 w-6" />
                النسخ الاحتياطي والاستعادة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button onClick={handleExportData} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
                    <Download className="mr-2 h-4 w-4" />
                    تصدير البيانات
                  </Button>

                  <div className="flex-1">
                    <input type="file" accept=".json" onChange={handleImportData} className="hidden" id="import-file" />
                    <Button
                      onClick={() => document.getElementById("import-file").click()}
                      className="w-full bg-green-600 hover:bg-green-700 text-white"
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      استيراد البيانات
                    </Button>
                  </div>
                </div>

                <Alert className="bg-slate-700 border-blue-500">
                  <AlertDescription className="text-slate-300">
                    يمكنك تصدير جميع بياناتك كنسخة احتياطية، أو استيراد بيانات محفوظة مسبقاً
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>

          {/* حذف البيانات */}
          <Card className="bg-slate-800 border-red-500 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl text-red-400 flex items-center gap-2">
                <Trash2 className="h-6 w-6" />
                حذف جميع البيانات
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert className="border-red-500">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  <AlertDescription className="text-red-300">
                    تحذير: هذا الإجراء سيحذف جميع البيانات المحفوظة ولا يمكن التراجع عنه!
                  </AlertDescription>
                </Alert>

                <div className="space-y-3">
                  <Label htmlFor="delete-confirm" className="text-slate-200">
                    اكتب "حذف كل شي" للتأكيد:
                  </Label>
                  <Input
                    id="delete-confirm"
                    type="text"
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                    placeholder="حذف كل شي"
                    className="bg-slate-700 border-slate-600 text-white"
                  />

                  <Button
                    onClick={handleDeleteAll}
                    disabled={deleteConfirmText !== "حذف كل شي" || isDeleting}
                    className="w-full bg-red-600 hover:bg-red-700 text-white disabled:opacity-50"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    {isDeleting ? "جاري الحذف..." : "حذف جميع البيانات"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function getKeyDisplayName(key) {
  const displayNames = {
    hizbData: "بيانات الأحزاب",
    juzData: "بيانات الأجزاء",
    currentMode: "الوضع الحالي",
    quranAppDB_lists: "قوائم الآيات",
    quranAppDB_ayaData: "بيانات الآيات",
    searchHistory: "سجل البحث",
    shareHistory: "سجل المشاركة",
    lastSharedInfo: "آخر مشاركة",
    pageSettings: "إعدادات الصفحات",
  }
  return displayNames[key] || key
}
