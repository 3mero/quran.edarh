"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Trash2, FolderOpen, Heart, List, Plus, Save, X, Eye, Copy, ArrowRight } from "lucide-react"
import { localDB } from "@/lib/local-db"
import { quranData } from "@/data/quran-search-data"

export default function ListsManager() {
  const [lists, setLists] = useState([])
  const [stats, setStats] = useState(null)
  const [selectedList, setSelectedList] = useState(null)
  const [listAyas, setListAyas] = useState([])
  const [showNewListForm, setShowNewListForm] = useState(false)
  const [newListName, setNewListName] = useState("")

  // Parse XML data for getting actual aya text
  const parser = typeof DOMParser !== "undefined" ? new DOMParser() : null
  const quranXMLDoc = parser ? parser.parseFromString(quranData, "text/xml") : null

  useEffect(() => {
    loadData()
  }, [])

  const loadData = () => {
    setLists(localDB.getLists())
    setStats(localDB.getStats())
  }

  const getAyaText = (suraIndex: string, ayaIndex: string): { text: string; suraName: string; bismillah?: string } => {
    if (!quranXMLDoc) return { text: `آية ${ayaIndex} من سورة ${suraIndex}`, suraName: `سورة ${suraIndex}` }

    const suras = quranXMLDoc.getElementsByTagName("sura")
    for (const sura of Array.from(suras)) {
      if (sura.getAttribute("index") === suraIndex) {
        const suraName = sura.getAttribute("name") || `سورة ${suraIndex}`
        const ayas = sura.getElementsByTagName("aya")
        for (const aya of Array.from(ayas)) {
          if (aya.getAttribute("index") === ayaIndex) {
            return {
              text: aya.getAttribute("text") || `آية ${ayaIndex} من سورة ${suraName}`,
              suraName,
              bismillah: aya.getAttribute("bismillah") || undefined,
            }
          }
        }
        return { text: `آية ${ayaIndex} من سورة ${suraName}`, suraName }
      }
    }
    return { text: `آية ${ayaIndex} من سورة ${suraIndex}`, suraName: `سورة ${suraIndex}` }
  }

  const handleDeleteList = (listId) => {
    if (confirm("هل أنت متأكد من حذف هذه القائمة؟ سيتم حذف جميع الآيات المحفوظة فيها.")) {
      localDB.deleteList(listId)
      loadData()
      if (selectedList && selectedList.id === listId) {
        setSelectedList(null)
        setListAyas([])
      }
    }
  }

  const handleCreateList = () => {
    if (newListName.trim()) {
      const newList = localDB.createList(newListName.trim())
      if (newList) {
        setNewListName("")
        setShowNewListForm(false)
        loadData()
      }
    }
  }

  const handleViewList = (list) => {
    setSelectedList(list)
    const ayas = localDB.getAyasInList(list.id)
    setListAyas(ayas)
  }

  const copyAya = async (ayaText) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(ayaText)
        alert("تم نسخ الآية بنجاح!")
      } else {
        const textArea = document.createElement("textarea")
        textArea.value = ayaText
        textArea.style.position = "fixed"
        textArea.style.left = "-999999px"
        document.body.appendChild(textArea)
        textArea.focus()
        textArea.select()
        const successful = document.execCommand("copy")
        document.body.removeChild(textArea)
        if (successful) {
          alert("تم نسخ الآية بنجاح!")
        }
      }
    } catch (err) {
      alert("فشل في نسخ الآية")
    }
  }

  const formatDate = (timestamp) => {
    if (!timestamp) return "غير محدد"
    const date = new Date(timestamp)
    return date.toLocaleDateString("ar-LY", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (selectedList) {
    return (
      <div className="w-full max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-emerald-500/30">
          <CardHeader className="text-center">
            <div className="flex items-center justify-between">
              <Button
                onClick={() => {
                  setSelectedList(null)
                  setListAyas([])
                }}
                variant="outline"
                className="bg-slate-700 border-slate-600 text-slate-200 hover:bg-slate-600 flex items-center gap-2"
              >
                <ArrowRight className="h-4 w-4" />
                العودة للقوائم
              </Button>
              <CardTitle className="text-2xl text-white flex items-center gap-3">
                {selectedList.id === "favorites" ? (
                  <Heart className="h-7 w-7 text-red-400" />
                ) : (
                  <List className="h-7 w-7 text-blue-400" />
                )}
                {selectedList.name}
              </CardTitle>
              <div className="w-32" /> {/* Spacer for centering */}
            </div>
            <p className="text-slate-300 mt-2 text-center">
              {listAyas.length} {listAyas.length === 1 ? "آية" : "آية"} محفوظة
            </p>
          </CardHeader>
        </Card>

        {/* Ayas List */}
        <div className="space-y-6">
          {listAyas.length > 0 ? (
            listAyas.map((ayaInfo, index) => {
              const ayaDetails = getAyaText(ayaInfo.suraIndex, ayaInfo.ayaIndex)
              const ayaData = ayaInfo.data
              return (
                <div key={`${ayaInfo.suraIndex}_${ayaInfo.ayaIndex}`} className="space-y-3">
                  {/* Aya Header - Outside the card */}
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary" className="bg-emerald-600 text-white px-3 py-1">
                        سورة {ayaDetails.suraName}
                      </Badge>
                      <Badge variant="outline" className="border-slate-600 text-slate-300 px-3 py-1">
                        آية {ayaInfo.ayaIndex}
                      </Badge>
                    </div>
                    <div className="text-sm text-slate-400">أضيفت: {formatDate(ayaData.addedAt)}</div>
                  </div>

                  {/* Aya Card */}
                  <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-600">
                    <CardContent className="p-6">
                      {/* Bismillah */}
                      {ayaDetails.bismillah && (
                        <div className="text-center text-emerald-400 text-xl font-bold mb-4 py-3 border-b border-slate-600/50">
                          {ayaDetails.bismillah}
                        </div>
                      )}

                      {/* Aya Text - Centered */}
                      <div className="text-white text-xl leading-relaxed text-center p-6 bg-gradient-to-r from-slate-700/50 to-slate-600/50 rounded-xl border border-slate-600/30 mb-6">
                        {ayaDetails.text}
                      </div>

                      {/* Actions and Notes */}
                      <div className="space-y-4">
                        <div className="flex justify-center">
                          <Button
                            onClick={() => copyAya(ayaDetails.text)}
                            variant="outline"
                            className="bg-slate-700 border-slate-600 text-slate-200 hover:bg-slate-600 px-6"
                          >
                            <Copy className="h-4 w-4 mr-2" />
                            نسخ الآية
                          </Button>
                        </div>

                        {ayaData.notes && (
                          <div className="bg-slate-700/50 p-4 rounded-lg border border-slate-600/30">
                            <div className="text-sm font-medium text-emerald-400 mb-2 text-center">الملاحظة:</div>
                            <div className="text-slate-200 text-center">{ayaData.notes}</div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )
            })
          ) : (
            <Card className="bg-slate-800 border-slate-600">
              <CardContent className="p-12 text-center">
                <div className="text-slate-400 text-xl mb-2">لا توجد آيات في هذه القائمة</div>
                <div className="text-slate-500">ابدأ بإضافة آيات من صفحة البحث</div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-emerald-500/30 shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-white flex items-center justify-center gap-3">
            <FolderOpen className="h-7 w-7 text-emerald-400" />
            إدارة القوائم
          </CardTitle>
          <p className="text-slate-300 mt-2">أدر مجموعاتك المفضلة من الآيات الكريمة</p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Statistics */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gradient-to-r from-emerald-600/20 to-emerald-700/20 p-4 rounded-lg border border-emerald-500/30 text-center">
                <div className="text-3xl font-bold text-emerald-400">{stats.totalAyas}</div>
                <div className="text-sm text-emerald-300">إجمالي الآيات المحفوظة</div>
              </div>
              <div className="bg-gradient-to-r from-blue-600/20 to-blue-700/20 p-4 rounded-lg border border-blue-500/30 text-center">
                <div className="text-3xl font-bold text-blue-400">{stats.totalLists}</div>
                <div className="text-sm text-blue-300">إجمالي القوائم</div>
              </div>
            </div>
          )}

          {/* New List Form */}
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold text-white">قوائمك</h3>
            <Button
              onClick={() => setShowNewListForm(!showNewListForm)}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              <Plus className="h-4 w-4 mr-1" />
              قائمة جديدة
            </Button>
          </div>

          {showNewListForm && (
            <Card className="bg-slate-700 border-slate-600">
              <CardContent className="p-4">
                <div className="flex gap-2">
                  <Input
                    value={newListName}
                    onChange={(e) => setNewListName(e.target.value)}
                    placeholder="اسم القائمة الجديدة"
                    className="bg-slate-800 border-slate-600 text-white text-center"
                  />
                  <Button onClick={handleCreateList} className="bg-emerald-600 hover:bg-emerald-700">
                    <Save className="h-4 w-4" />
                  </Button>
                  <Button
                    onClick={() => setShowNewListForm(false)}
                    variant="outline"
                    className="bg-slate-800 border-slate-600"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Lists */}
          <div className="grid gap-4">
            {lists.map((list) => {
              const listStats = stats?.listsWithCounts.find((l) => l.id === list.id)
              return (
                <Card
                  key={list.id}
                  className="bg-slate-700/50 border-slate-600 hover:bg-slate-700 transition-all duration-200 hover:shadow-lg"
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        {list.id === "favorites" ? (
                          <Heart className="h-6 w-6 text-red-400" />
                        ) : (
                          <List className="h-6 w-6 text-blue-400" />
                        )}
                        <div className="text-center">
                          <span className="text-white font-semibold text-lg">{list.name}</span>
                          <div className="flex items-center justify-center gap-2 mt-1">
                            <Badge variant="outline" className="border-slate-500 text-slate-300 bg-slate-800/50">
                              {listStats?.count || 0} آية
                            </Badge>
                            <span className="text-xs text-slate-400">أنشئت: {formatDate(list.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={() => handleViewList(list)}
                          variant="outline"
                          size="sm"
                          className="bg-slate-600 border-slate-500 text-slate-200 hover:bg-slate-500"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          عرض
                        </Button>
                        {list.id !== "favorites" && (
                          <Button
                            onClick={() => handleDeleteList(list.id)}
                            size="sm"
                            variant="destructive"
                            className="hover:bg-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
