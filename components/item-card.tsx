"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Check,
  Undo,
  Info,
  Edit,
  Eye,
  EyeOff,
  Palette,
  ChevronDown,
  ChevronUp,
  FileText,
  ImageIcon,
  Mic,
} from "lucide-react"
import NoteEditor from "./note-editor"
import AudioRecorder from "./audio-recorder"
import ImageGallery from "./image-gallery"
import { mediaStorage } from "@/lib/media-storage"

interface AudioNote {
  id: string
  url: string
  title: string
  timestamp: string
  size: number
}

interface ImageData {
  id: string
  url: string
  name: string
  size: number
  timestamp: number
}

interface ItemData {
  number: number
  day: string
  completed: boolean
  completedTime?: string
  note?: string
  images?: ImageData[]
  color?: string
  hidden?: boolean
  audioNotes?: AudioNote[]
}

interface ItemCardProps {
  item: ItemData
  mode: "hizb" | "juz"
  onUpdate: (updatedItem: ItemData) => void
  onShowDetails: (item: ItemData) => void
}

export default function ItemCard({ item, mode, onUpdate, onShowDetails }: ItemCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isEditingNote, setIsEditingNote] = useState(false)
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [showImageGallery, setShowImageGallery] = useState(false)
  const [galleryIndex, setGalleryIndex] = useState(0)
  const [loadedImages, setLoadedImages] = useState<ImageData[]>([])
  const [loadedAudio, setLoadedAudio] = useState<AudioNote[]>([])

  const itemId = `${mode}_${item.number}`

  // تحميل الوسائط عند فتح البطاقة
  useEffect(() => {
    if (isExpanded) {
      loadMedia()
    }
  }, [isExpanded])

  const loadMedia = async () => {
    try {
      const [images, audios] = await Promise.all([mediaStorage.getImages(itemId), mediaStorage.getAudio(itemId)])

      setLoadedImages(images)
      setLoadedAudio(audios)
    } catch (error) {
      console.error("Error loading media:", error)
    }
  }

  const handleComplete = () => {
    const updatedItem = {
      ...item,
      completed: true,
      completedTime: new Date().toLocaleString(),
    }
    onUpdate(updatedItem)
  }

  const handleUndo = () => {
    const updatedItem = {
      ...item,
      completed: false,
      completedTime: undefined,
    }
    onUpdate(updatedItem)
  }

  const handleToggleVisibility = () => {
    const updatedItem = {
      ...item,
      hidden: !item.hidden,
    }
    onUpdate(updatedItem)
  }

  const handleColorChange = (color: string) => {
    const updatedItem = {
      ...item,
      color,
    }
    onUpdate(updatedItem)
    setShowColorPicker(false)
  }

  const handleSaveNote = (note: string, images: ImageData[]) => {
    const updatedItem = {
      ...item,
      note: note.trim() || undefined,
      images,
    }
    onUpdate(updatedItem)
    setLoadedImages(images)
    setIsEditingNote(false)
  }

  const handleSaveAudio = (audioNote: AudioNote) => {
    const updatedAudio = [...loadedAudio, audioNote]
    const updatedItem = {
      ...item,
      audioNotes: updatedAudio,
    }
    onUpdate(updatedItem)
    setLoadedAudio(updatedAudio)
  }

  const handleDeleteAudio = async (audioId: string) => {
    try {
      await mediaStorage.deleteAudio(audioId)
      const updatedAudio = loadedAudio.filter((audio) => audio.id !== audioId)
      const updatedItem = {
        ...item,
        audioNotes: updatedAudio,
      }
      onUpdate(updatedItem)
      setLoadedAudio(updatedAudio)
    } catch (error) {
      console.error("Error deleting audio:", error)
      alert("حدث خطأ أثناء حذف التسجيل")
    }
  }

  const handleEditAudio = (audioId: string, newTitle: string) => {
    const updatedAudio = loadedAudio.map((audio) => (audio.id === audioId ? { ...audio, title: newTitle } : audio))
    const updatedItem = {
      ...item,
      audioNotes: updatedAudio,
    }
    onUpdate(updatedItem)
    setLoadedAudio(updatedAudio)
  }

  const handleImageGalleryDelete = async (imageIds: string[]) => {
    try {
      await Promise.all(imageIds.map((id) => mediaStorage.deleteImage(id)))
      const updatedImages = loadedImages.filter((img) => !imageIds.includes(img.id))
      const updatedItem = {
        ...item,
        images: updatedImages,
      }
      onUpdate(updatedItem)
      setLoadedImages(updatedImages)

      // إغلاق المعرض إذا تم حذف جميع الصور
      if (updatedImages.length === 0) {
        setShowImageGallery(false)
      }
    } catch (error) {
      console.error("Error deleting images:", error)
      alert("حدث خطأ أثناء حذف الصور")
    }
  }

  const openImageGallery = (index: number) => {
    setGalleryIndex(index)
    setShowImageGallery(true)
  }

  // تحديد ما إذا كان العنصر يحتوي على محتوى
  const hasNote = item.note && item.note.trim().length > 0
  const hasImages = (item.images && item.images.length > 0) || (loadedImages && loadedImages.length > 0)
  const hasAudio = (item.audioNotes && item.audioNotes.length > 0) || (loadedAudio && loadedAudio.length > 0)

  if (item.hidden) {
    return null
  }

  return (
    <>
      <Card
        className="w-full transition-all duration-200 hover:shadow-xl bg-slate-800 border-slate-600"
        style={{ backgroundColor: item.color && item.color !== "#1e1e2f" ? item.color : undefined }}
      >
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3 flex-wrap">
              <h3 className="text-lg font-semibold text-white">
                {mode === "hizb" ? "حزب" : "جزء"} {item.number}
              </h3>
              <Badge variant="secondary" className="bg-slate-700 text-slate-200">
                {item.day}
              </Badge>
              {item.completed && (
                <Badge variant="default" className="bg-emerald-600 text-white">
                  مكتمل
                </Badge>
              )}

              {/* أيقونات المحتوى */}
              <div className="flex items-center gap-1">
                {hasNote && (
                  <div
                    className="flex items-center justify-center w-6 h-6 bg-blue-600 rounded-full"
                    title="يحتوي على ملاحظة"
                  >
                    <FileText className="h-3 w-3 text-white" />
                  </div>
                )}
                {hasImages && (
                  <div
                    className="flex items-center justify-center w-6 h-6 bg-green-600 rounded-full"
                    title="يحتوي على صور"
                  >
                    <ImageIcon className="h-3 w-3 text-white" />
                  </div>
                )}
                {hasAudio && (
                  <div
                    className="flex items-center justify-center w-6 h-6 bg-purple-600 rounded-full"
                    title="يحتوي على تسجيلات صوتية"
                  >
                    <Mic className="h-3 w-3 text-white" />
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-white hover:text-emerald-400"
              >
                {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleToggleVisibility}
                className="text-white hover:text-emerald-400"
              >
                {item.hidden ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </CardHeader>

        {isExpanded && (
          <CardContent className="space-y-4">
            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={item.completed ? handleUndo : handleComplete}
                variant={item.completed ? "outline" : "default"}
                size="sm"
                className={`flex items-center gap-1 ${
                  item.completed
                    ? "border-slate-600 text-slate-200 hover:bg-slate-700 hover:text-white"
                    : "bg-emerald-600 hover:bg-emerald-700 text-white"
                }`}
              >
                {item.completed ? (
                  <>
                    <Undo className="h-4 w-4" />
                    تراجع
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    إنهاء
                  </>
                )}
              </Button>

              <Button
                onClick={() => onShowDetails(item)}
                variant="outline"
                size="sm"
                className="flex items-center gap-1 border-slate-600 text-slate-200 hover:bg-slate-700 hover:text-white bg-slate-800"
              >
                <Info className="h-4 w-4" />
                تفاصيل
              </Button>

              <Button
                onClick={() => setIsEditingNote(!isEditingNote)}
                variant="outline"
                size="sm"
                className="flex items-center gap-1 border-slate-600 text-slate-200 hover:bg-slate-700 hover:text-white bg-slate-800"
              >
                <Edit className="h-4 w-4" />
                {item.note ? "تعديل الملاحظة" : "إضافة ملاحظة"}
              </Button>

              <div className="relative">
                <Button
                  onClick={() => setShowColorPicker(!showColorPicker)}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1 border-slate-600 text-slate-200 hover:bg-slate-700 hover:text-white bg-slate-800"
                >
                  <Palette className="h-4 w-4" />
                  اللون
                </Button>

                {showColorPicker && (
                  <div className="absolute top-full mt-1 z-10 bg-slate-800 border border-slate-600 rounded-lg p-3 shadow-xl">
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        "#1e1e2f",
                        "#dc2626",
                        "#16a34a",
                        "#2563eb",
                        "#d97706",
                        "#7c3aed",
                        "#db2777",
                        "#0891b2",
                        "#65a30d",
                        "#ea580c",
                        "#4f46e5",
                        "#059669",
                      ].map((color) => (
                        <button
                          key={color}
                          className="w-8 h-8 rounded border-2 border-slate-500 hover:border-slate-300 transition-colors"
                          style={{ backgroundColor: color }}
                          onClick={() => handleColorChange(color)}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Completion Info */}
            {item.completed && item.completedTime && (
              <div className="text-sm text-emerald-300 bg-emerald-900/20 border border-emerald-500/30 p-3 rounded-lg">
                تم الانتهاء: {item.completedTime}
              </div>
            )}

            {/* Note Section */}
            {isEditingNote ? (
              <NoteEditor
                itemId={itemId}
                note={item.note || ""}
                images={loadedImages}
                onSave={handleSaveNote}
                onCancel={() => setIsEditingNote(false)}
              />
            ) : (
              item.note && (
                <div className="bg-slate-700 border border-slate-600 p-4 rounded-lg">
                  <h4 className="font-medium mb-2 text-white">الملاحظة:</h4>
                  <p className="text-sm whitespace-pre-wrap text-slate-200">{item.note}</p>

                  {loadedImages.length > 0 && (
                    <div className="mt-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-slate-300">الصور المرفقة ({loadedImages.length})</span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {loadedImages.map((image, index) => (
                          <img
                            key={image.id}
                            src={image.url || "/placeholder.svg"}
                            alt={image.name}
                            className="w-full h-16 object-cover rounded cursor-pointer hover:opacity-80 border border-slate-500 transition-opacity"
                            onClick={() => openImageGallery(index)}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )
            )}

            {/* Audio Recorder */}
            <AudioRecorder
              itemId={itemId}
              audioNotes={loadedAudio}
              onSaveAudio={handleSaveAudio}
              onDeleteAudio={handleDeleteAudio}
              onEditAudio={handleEditAudio}
            />
          </CardContent>
        )}
      </Card>

      {/* Image Gallery */}
      <ImageGallery
        images={loadedImages}
        isOpen={showImageGallery}
        initialIndex={galleryIndex}
        onClose={() => setShowImageGallery(false)}
        onDelete={handleImageGalleryDelete}
      />
    </>
  )
}
