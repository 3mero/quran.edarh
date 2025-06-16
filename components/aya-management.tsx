"use client"

import { useRef } from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Heart,
  Plus,
  Trash2,
  Edit,
  Save,
  X,
  ImageIcon,
  Mic,
  Square,
  Play,
  Pause,
  Copy,
  FolderPlus,
  List,
  Eye,
} from "lucide-react"
import { localDB } from "@/lib/local-db"

interface AyaData {
  suraIndex: string
  suraName: string
  ayaIndex: string
  ayaText: string
  bismillah?: string
}

interface AyaManagementProps {
  aya: AyaData
}

export default function AyaManagement({ aya }: AyaManagementProps) {
  const [lists, setLists] = useState([])
  const [ayaData, setAyaData] = useState({
    lists: [],
    notes: "",
    images: [],
    audioNotes: [],
  })
  const [showNewListForm, setShowNewListForm] = useState(false)
  const [newListName, setNewListName] = useState("")
  const [isEditingNotes, setIsEditingNotes] = useState(false)
  const [tempNotes, setTempNotes] = useState("")
  const [isRecording, setIsRecording] = useState(false)
  const [recordedAudio, setRecordedAudio] = useState(null)
  const [audioTitle, setAudioTitle] = useState("")
  const [playingIndex, setPlayingIndex] = useState(null)
  const [selectedImage, setSelectedImage] = useState(null)

  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])
  const audioRefs = useRef([])
  const fileInputRef = useRef(null)

  useEffect(() => {
    if (aya && aya.suraIndex && aya.ayaIndex) {
      loadData()
    }
  }, [aya])

  const loadData = () => {
    try {
      const loadedLists = localDB.getLists()
      const loadedAyaData = localDB.getAyaData(aya.suraIndex, aya.ayaIndex)

      setLists(Array.isArray(loadedLists) ? loadedLists : [])
      setAyaData({
        lists: Array.isArray(loadedAyaData.lists) ? loadedAyaData.lists : [],
        notes: loadedAyaData.notes || "",
        images: Array.isArray(loadedAyaData.images) ? loadedAyaData.images : [],
        audioNotes: Array.isArray(loadedAyaData.audioNotes) ? loadedAyaData.audioNotes : [],
      })
    } catch (error) {
      console.error("Error loading data:", error)
      // Set default values if there's an error
      setLists([])
      setAyaData({
        lists: [],
        notes: "",
        images: [],
        audioNotes: [],
      })
    }
  }

  const handleAddToList = (listId) => {
    try {
      if (!aya || !aya.suraIndex || !aya.ayaIndex || !listId) {
        console.error("Missing required data for adding to list")
        return
      }

      localDB.addAyaToList(aya.suraIndex, aya.ayaIndex, listId)
      loadData()
    } catch (error) {
      console.error("Error adding to list:", error)
      alert("حدث خطأ أثناء إضافة الآية للقائمة")
    }
  }

  const handleRemoveFromList = (listId) => {
    try {
      if (!aya || !aya.suraIndex || !aya.ayaIndex || !listId) {
        console.error("Missing required data for removing from list")
        return
      }

      localDB.removeAyaFromList(aya.suraIndex, aya.ayaIndex, listId)
      loadData()
    } catch (error) {
      console.error("Error removing from list:", error)
      alert("حدث خطأ أثناء إزالة الآية من القائمة")
    }
  }

  const handleCreateList = () => {
    if (newListName.trim()) {
      try {
        const newList = localDB.createList(newListName.trim())
        if (newList) {
          setNewListName("")
          setShowNewListForm(false)
          loadData()
        } else {
          alert("فشل في إنشاء القائمة")
        }
      } catch (error) {
        console.error("Error creating list:", error)
        alert("حدث خطأ أثناء إ��شاء القائمة")
      }
    }
  }

  const handleSaveNotes = () => {
    try {
      if (!aya || !aya.suraIndex || !aya.ayaIndex) {
        console.error("Missing required data for saving notes")
        return
      }

      localDB.saveAyaData(aya.suraIndex, aya.ayaIndex, {
        ...ayaData,
        notes: tempNotes,
      })
      setIsEditingNotes(false)
      loadData()
    } catch (error) {
      console.error("Error saving notes:", error)
      alert("حدث خطأ أثناء حفظ الملاحظات")
    }
  }

  const handleImageUpload = (event) => {
    const files = event.target.files
    if (files && aya && aya.suraIndex && aya.ayaIndex) {
      Array.from(files).forEach((file) => {
        const reader = new FileReader()
        reader.onload = (e) => {
          try {
            const result = e.target?.result
            const newImages = [...(ayaData.images || []), result]
            localDB.saveAyaData(aya.suraIndex, aya.ayaIndex, {
              ...ayaData,
              images: newImages,
            })
            loadData()
          } catch (error) {
            console.error("Error uploading image:", error)
            alert("حدث خطأ أثناء رفع الصورة")
          }
        }
        reader.readAsDataURL(file)
      })
    }
  }

  const removeImage = (index) => {
    try {
      if (!aya || !aya.suraIndex || !aya.ayaIndex) {
        console.error("Missing required data for removing image")
        return
      }

      const newImages = (ayaData.images || []).filter((_, i) => i !== index)
      localDB.saveAyaData(aya.suraIndex, aya.ayaIndex, {
        ...ayaData,
        images: newImages,
      })
      loadData()
    } catch (error) {
      console.error("Error removing image:", error)
      alert("حدث خطأ أثناء حذف الصورة")
    }
  }

  const openImageViewer = (image) => {
    setSelectedImage(image)
  }

  const closeImageViewer = () => {
    setSelectedImage(null)
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data)
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" })
        const audioUrl = URL.createObjectURL(audioBlob)
        setRecordedAudio(audioUrl)
        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
    } catch (err) {
      console.error("Error accessing microphone:", err)
      alert("لا يمكن الوصول للميكروفون")
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  const saveRecording = () => {
    if (recordedAudio && audioTitle.trim() && aya && aya.suraIndex && aya.ayaIndex) {
      try {
        const audioNote = {
          url: recordedAudio,
          title: audioTitle.trim(),
          timestamp: new Date().toLocaleString(),
        }
        const newAudioNotes = [...(ayaData.audioNotes || []), audioNote]
        localDB.saveAyaData(aya.suraIndex, aya.ayaIndex, {
          ...ayaData,
          audioNotes: newAudioNotes,
        })
        setRecordedAudio(null)
        setAudioTitle("")
        loadData()
      } catch (error) {
        console.error("Error saving recording:", error)
        alert("حدث خطأ أثناء حفظ التسجيل")
      }
    }
  }

  const deleteAudioNote = (index) => {
    if (confirm("هل أنت متأكد من حذف هذه الملاحظة الصوتية؟")) {
      try {
        if (!aya || !aya.suraIndex || !aya.ayaIndex) {
          console.error("Missing required data for deleting audio note")
          return
        }

        const newAudioNotes = (ayaData.audioNotes || []).filter((_, i) => i !== index)
        localDB.saveAyaData(aya.suraIndex, aya.ayaIndex, {
          ...ayaData,
          audioNotes: newAudioNotes,
        })
        loadData()
      } catch (error) {
        console.error("Error deleting audio note:", error)
        alert("حدث خطأ أثناء حذف التسجيل")
      }
    }
  }

  const playAudio = (index) => {
    const audio = audioRefs.current[index]
    if (audio) {
      if (playingIndex === index) {
        audio.pause()
        setPlayingIndex(null)
      } else {
        audioRefs.current.forEach((a, i) => {
          if (a && i !== index) a.pause()
        })
        audio.play()
        setPlayingIndex(index)
      }
    }
  }

  const copyAya = async () => {
    try {
      if (!aya || !aya.ayaText) {
        alert("لا يوجد نص آية للنسخ")
        return
      }

      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(aya.ayaText)
        alert("تم نسخ الآية بنجاح!")
      } else {
        const textArea = document.createElement("textarea")
        textArea.value = aya.ayaText
        textArea.style.position = "fixed"
        textArea.style.left = "-999999px"
        document.body.appendChild(textArea)
        textArea.focus()
        textArea.select()
        const successful = document.execCommand("copy")
        document.body.removeChild(textArea)
        if (successful) {
          alert("تم نسخ الآية بنجاح!")
        } else {
          alert("فشل في نسخ الآية")
        }
      }
    } catch (err) {
      console.error("Error copying aya:", err)
      alert("فشل في نسخ الآية")
    }
  }

  // التحقق من وجود البيانات المطلوبة
  if (!aya || !aya.suraIndex || !aya.ayaIndex) {
    return (
      <Card className="w-full bg-slate-800 border-slate-600">
        <CardContent className="p-6 text-center">
          <p className="text-slate-400">خطأ: بيانات الآية غير مكتملة</p>
        </CardContent>
      </Card>
    )
  }

  // Ensure arrays are properly initialized
  const safeAyaLists = Array.isArray(ayaData.lists) ? ayaData.lists : []
  const safeImages = Array.isArray(ayaData.images) ? ayaData.images : []
  const safeAudioNotes = Array.isArray(ayaData.audioNotes) ? ayaData.audioNotes : []

  return (
    <>
      <Card className="w-full bg-slate-800 border-slate-600">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-white flex items-center gap-2">
            <List className="h-5 w-5 text-emerald-400" />
            إدارة الآية
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Lists Management */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-medium text-white">القوائم:</h4>
              <Button
                onClick={() => setShowNewListForm(!showNewListForm)}
                size="sm"
                variant="outline"
                className="bg-slate-700 border-slate-600 text-slate-200 hover:bg-slate-600"
              >
                <FolderPlus className="h-4 w-4 mr-1" />
                قائمة جديدة
              </Button>
            </div>

            {showNewListForm && (
              <div className="flex gap-2 mb-3">
                <Input
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  placeholder="اسم القائمة الجديدة"
                  className="bg-slate-700 border-slate-600 text-white"
                />
                <Button onClick={handleCreateList} size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                  <Save className="h-4 w-4" />
                </Button>
                <Button
                  onClick={() => setShowNewListForm(false)}
                  size="sm"
                  variant="outline"
                  className="bg-slate-700 border-slate-600"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              {lists.map((list) => {
                const isInList = safeAyaLists.includes(list.id)
                return (
                  <Badge
                    key={list.id}
                    variant={isInList ? "default" : "outline"}
                    className={`cursor-pointer transition-colors ${
                      isInList
                        ? "bg-emerald-600 text-white hover:bg-emerald-700"
                        : "border-slate-600 text-slate-300 hover:bg-slate-700"
                    }`}
                    onClick={() => (isInList ? handleRemoveFromList(list.id) : handleAddToList(list.id))}
                  >
                    {list.id === "favorites" ? <Heart className="h-3 w-3 mr-1" /> : <Plus className="h-3 w-3 mr-1" />}
                    {list.name}
                  </Badge>
                )
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              onClick={copyAya}
              variant="outline"
              size="sm"
              className="bg-slate-700 border-slate-600 text-slate-200 hover:bg-slate-600"
            >
              <Copy className="h-4 w-4 mr-1" />
              نسخ الآية
            </Button>
          </div>

          {/* Notes Section */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-medium text-white">الملاحظات:</h4>
              <Button
                onClick={() => {
                  setIsEditingNotes(!isEditingNotes)
                  setTempNotes(ayaData.notes || "")
                }}
                size="sm"
                variant="outline"
                className="bg-slate-700 border-slate-600 text-slate-200 hover:bg-slate-600"
              >
                <Edit className="h-4 w-4 mr-1" />
                {isEditingNotes ? "إلغاء" : "تعديل"}
              </Button>
            </div>

            {isEditingNotes ? (
              <div className="space-y-2">
                <Textarea
                  value={tempNotes}
                  onChange={(e) => setTempNotes(e.target.value)}
                  placeholder="اكتب ملاحظاتك هنا..."
                  className="bg-slate-700 border-slate-600 text-white"
                />
                <Button onClick={handleSaveNotes} size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                  <Save className="h-4 w-4 mr-1" />
                  حفظ
                </Button>
              </div>
            ) : (
              ayaData.notes && (
                <div className="bg-slate-700 p-3 rounded border border-slate-600">
                  <p className="text-white whitespace-pre-wrap">{ayaData.notes}</p>
                </div>
              )
            )}
          </div>

          {/* Images Section */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-medium text-white">الصور:</h4>
              <Button
                onClick={() => fileInputRef.current?.click()}
                size="sm"
                variant="outline"
                className="bg-slate-700 border-slate-600 text-slate-200 hover:bg-slate-600"
              >
                <ImageIcon className="h-4 w-4 mr-1" />
                إضافة صورة
              </Button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              className="hidden"
            />

            {safeImages.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {safeImages.map((image, index) => (
                  <div key={index} className="relative group">
                    <div className="relative cursor-pointer" onClick={() => openImageViewer(image)}>
                      <img
                        src={image || "/placeholder.svg"}
                        alt={`صورة ${index + 1}`}
                        className="w-full h-20 object-cover rounded border border-slate-600 hover:opacity-80 transition-opacity"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 transition-all duration-200 rounded flex items-center justify-center">
                        <Eye className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation()
                        removeImage(index)
                      }}
                      size="sm"
                      variant="destructive"
                      className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Audio Recording Section */}
          <div>
            <h4 className="font-medium text-white mb-2">التسجيلات الصوتية:</h4>

            {/* Recording Controls */}
            <div className="space-y-2 mb-3">
              {!isRecording && !recordedAudio && (
                <Button
                  onClick={startRecording}
                  size="sm"
                  variant="outline"
                  className="bg-slate-700 border-slate-600 text-slate-200 hover:bg-slate-600"
                >
                  <Mic className="h-4 w-4 mr-1" />
                  بدء التسجيل
                </Button>
              )}

              {isRecording && (
                <Button onClick={stopRecording} size="sm" variant="destructive">
                  <Square className="h-4 w-4 mr-1" />
                  إيقاف التسجيل
                </Button>
              )}

              {recordedAudio && (
                <div className="space-y-2">
                  <audio src={recordedAudio} controls className="w-full" />
                  <Input
                    placeholder="عنوان التسجيل"
                    value={audioTitle}
                    onChange={(e) => setAudioTitle(e.target.value)}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                  <div className="flex gap-2">
                    <Button onClick={saveRecording} size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                      حفظ التسجيل
                    </Button>
                    <Button
                      onClick={() => setRecordedAudio(null)}
                      size="sm"
                      variant="outline"
                      className="bg-slate-700 border-slate-600"
                    >
                      إلغاء
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Saved Audio Notes */}
            {safeAudioNotes.length > 0 && (
              <div className="space-y-2">
                {safeAudioNotes.map((note, index) => (
                  <div key={index} className="bg-slate-700 p-3 rounded border border-slate-600">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="font-medium text-white">{note.title}</div>
                        <div className="text-sm text-slate-400">{note.timestamp}</div>
                      </div>
                      <Button
                        onClick={() => deleteAudioNote(index)}
                        size="sm"
                        variant="ghost"
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => playAudio(index)}
                        size="sm"
                        variant="outline"
                        className="bg-slate-600 border-slate-500 text-slate-200"
                      >
                        {playingIndex === index ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                      </Button>
                      <audio
                        ref={(el) => (audioRefs.current[index] = el)}
                        src={note.url}
                        onEnded={() => setPlayingIndex(null)}
                        className="hidden"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Image Viewer Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4"
          onClick={closeImageViewer}
        >
          <div className="relative max-w-4xl max-h-full">
            <Button
              onClick={closeImageViewer}
              size="sm"
              variant="ghost"
              className="absolute top-2 right-2 z-10 bg-black bg-opacity-50 text-white hover:bg-opacity-70"
            >
              <X className="h-4 w-4" />
            </Button>
            <img
              src={selectedImage || "/placeholder.svg"}
              alt="عرض الصورة"
              className="max-w-full max-h-full object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </>
  )
}
