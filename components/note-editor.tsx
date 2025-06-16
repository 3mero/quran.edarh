"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Copy, Clipboard, ImageIcon, Trash2 } from "lucide-react"
import { mediaStorage } from "@/lib/media-storage"
import ImageGallery from "./image-gallery"

interface ImageData {
  id: string
  url: string
  name: string
  size: number
  timestamp: number
}

interface NoteEditorProps {
  itemId: string
  note: string
  images: ImageData[]
  onSave: (note: string, images: ImageData[]) => void
  onCancel: () => void
}

export default function NoteEditor({ itemId, note, images, onSave, onCancel }: NoteEditorProps) {
  const [currentNote, setCurrentNote] = useState(note)
  const [currentImages, setCurrentImages] = useState<ImageData[]>(images || [])
  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set())
  const [showGallery, setShowGallery] = useState(false)
  const [galleryIndex, setGalleryIndex] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleCopy = async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(currentNote)
        alert("تم نسخ النص بنجاح!")
      } else {
        // Fallback للمتصفحات القديمة
        const textArea = document.createElement("textarea")
        textArea.value = currentNote
        textArea.style.position = "fixed"
        textArea.style.left = "-999999px"
        textArea.style.top = "-999999px"
        document.body.appendChild(textArea)
        textArea.focus()
        textArea.select()

        const successful = document.execCommand("copy")
        document.body.removeChild(textArea)

        if (successful) {
          alert("تم نسخ النص بنجاح!")
        } else {
          alert("فشل في نسخ النص")
        }
      }
    } catch (err) {
      console.error("خطأ في النسخ:", err)
      alert("فشل في نسخ النص")
    }
  }

  const handlePaste = async () => {
    try {
      let pastedText = ""

      if (navigator.clipboard && window.isSecureContext) {
        pastedText = await navigator.clipboard.readText()
      } else {
        // Fallback للمتصفحات القديمة
        const textArea = document.createElement("textarea")
        textArea.style.position = "fixed"
        textArea.style.left = "-999999px"
        textArea.style.top = "-999999px"
        textArea.style.opacity = "0"
        document.body.appendChild(textArea)
        textArea.focus()
        textArea.select()

        const successful = document.execCommand("paste")
        pastedText = textArea.value
        document.body.removeChild(textArea)
      }

      if (pastedText) {
        setCurrentNote((prev) => prev + pastedText)
        alert("تم لصق النص بنجاح!")
      }
    } catch (err) {
      console.error("فشل في لصق النص:", err)
      alert("فشل في لصق النص. يرجى المحاولة مرة أخرى أو استخدام Ctrl+V")
    }
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    setIsUploading(true)

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const imageId = await mediaStorage.saveImage(file, itemId)
        if (imageId) {
          return {
            id: imageId,
            url: URL.createObjectURL(file),
            name: file.name,
            size: file.size,
            timestamp: Date.now(),
          }
        }
        return null
      })

      const uploadedImages = await Promise.all(uploadPromises)
      const validImages = uploadedImages.filter((img) => img !== null) as ImageData[]

      setCurrentImages((prev) => [...prev, ...validImages])
    } catch (error) {
      console.error("Error uploading images:", error)
      alert("حدث خطأ أثناء رفع الصور")
    } finally {
      setIsUploading(false)
      // إعادة تعيين input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleImageSelect = (imageId: string, checked: boolean) => {
    const newSelected = new Set(selectedImages)
    if (checked) {
      newSelected.add(imageId)
    } else {
      newSelected.delete(imageId)
    }
    setSelectedImages(newSelected)
  }

  const handleDeleteSelected = async () => {
    if (selectedImages.size === 0) return

    if (confirm(`هل أنت متأكد من حذف ${selectedImages.size} صورة؟`)) {
      try {
        // حذف من IndexedDB
        await Promise.all(Array.from(selectedImages).map((imageId) => mediaStorage.deleteImage(imageId)))

        // حذف من الحالة المحلية
        setCurrentImages((prev) => prev.filter((img) => !selectedImages.has(img.id)))
        setSelectedImages(new Set())
      } catch (error) {
        console.error("Error deleting images:", error)
        alert("حدث خطأ أثناء حذف الصور")
      }
    }
  }

  const handleGalleryDelete = async (imageIds: string[]) => {
    try {
      await Promise.all(imageIds.map((id) => mediaStorage.deleteImage(id)))
      setCurrentImages((prev) => prev.filter((img) => !imageIds.includes(img.id)))

      // إغلاق المعرض إذا تم حذف جميع الصور
      if (currentImages.length === imageIds.length) {
        setShowGallery(false)
      }
    } catch (error) {
      console.error("Error deleting images:", error)
      alert("حدث خطأ أثناء حذف الصور")
    }
  }

  const openGallery = (index: number) => {
    setGalleryIndex(index)
    setShowGallery(true)
  }

  const handleSave = () => {
    onSave(currentNote, currentImages)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  return (
    <>
      <div className="space-y-4">
        {/* Action Buttons */}
        <div className="flex gap-2 mb-2 flex-wrap">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className="flex items-center gap-1 bg-slate-700 border-slate-600 text-slate-200 hover:bg-slate-600 hover:text-white"
          >
            <Copy className="h-4 w-4" />
            نسخ
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handlePaste}
            className="flex items-center gap-1 bg-slate-700 border-slate-600 text-slate-200 hover:bg-slate-600 hover:text-white"
          >
            <Clipboard className="h-4 w-4" />
            لصق
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="flex items-center gap-1 bg-slate-700 border-slate-600 text-slate-200 hover:bg-slate-600 hover:text-white"
          >
            <ImageIcon className="h-4 w-4" />
            {isUploading ? "جاري الرفع..." : "إرفاق صور"}
          </Button>

          {selectedImages.size > 0 && (
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleDeleteSelected}
              className="flex items-center gap-1"
            >
              <Trash2 className="h-4 w-4" />
              حذف المحدد ({selectedImages.size})
            </Button>
          )}
        </div>

        {/* Note Textarea */}
        <Textarea
          value={currentNote}
          onChange={(e) => setCurrentNote(e.target.value)}
          placeholder="اكتب ملاحظتك هنا..."
          className="min-h-[120px] resize-vertical bg-slate-800 border-slate-600 text-white"
        />

        {/* File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageUpload}
          className="hidden"
        />

        {/* Images Grid */}
        {currentImages.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h5 className="font-medium text-slate-200">الصور المرفقة ({currentImages.length})</h5>
              {selectedImages.size > 0 && (
                <span className="text-sm text-blue-400">تم تحديد {selectedImages.size} صورة</span>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {currentImages.map((image, index) => (
                <div key={image.id} className="relative group">
                  {/* Checkbox */}
                  <div className="absolute top-2 left-2 z-10">
                    <input
                      type="checkbox"
                      checked={selectedImages.has(image.id)}
                      onChange={(e) => handleImageSelect(image.id, e.target.checked)}
                      className="w-4 h-4 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500"
                    />
                  </div>

                  {/* Image */}
                  <img
                    src={image.url || "/placeholder.svg"}
                    alt={image.name}
                    className="w-full h-24 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity border border-slate-600"
                    onClick={() => openGallery(index)}
                  />

                  {/* Image Info */}
                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white text-xs p-1 rounded-b-lg opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="truncate">{image.name}</div>
                    <div>{formatFileSize(image.size)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Save/Cancel Buttons */}
        <div className="flex gap-2">
          <Button onClick={handleSave} className="flex-1 bg-emerald-600 hover:bg-emerald-700">
            حفظ
          </Button>
          <Button onClick={onCancel} variant="outline" className="flex-1">
            إلغاء
          </Button>
        </div>
      </div>

      {/* Image Gallery */}
      <ImageGallery
        images={currentImages}
        isOpen={showGallery}
        initialIndex={galleryIndex}
        onClose={() => setShowGallery(false)}
        onDelete={handleGalleryDelete}
      />
    </>
  )
}
