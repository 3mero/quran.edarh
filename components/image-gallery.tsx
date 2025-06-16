"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Download,
  Trash2,
  ArrowLeft,
  Maximize,
} from "lucide-react"

interface ImageData {
  id: string
  url: string
  name: string
  size: number
  timestamp: number
}

interface ImageGalleryProps {
  images: ImageData[]
  isOpen: boolean
  initialIndex?: number
  onClose: () => void
  onDelete?: (imageIds: string[]) => void
}

export default function ImageGallery({ images, isOpen, initialIndex = 0, onClose, onDelete }: ImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set())
  const [showThumbnails, setShowThumbnails] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex)
      setZoom(1)
      setRotation(0)
      setSelectedImages(new Set())
      setIsFullscreen(false)
    }
  }, [isOpen, initialIndex])

  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "Escape":
          if (isFullscreen) {
            setIsFullscreen(false)
          } else {
            onClose()
          }
          break
        case "ArrowLeft":
          goToPrevious()
          break
        case "ArrowRight":
          goToNext()
          break
        case "Delete":
          if (images[currentIndex] && !isFullscreen) {
            handleDeleteCurrent()
          }
          break
        case "+":
        case "=":
          setZoom((prev) => Math.min(prev + 0.25, 3))
          break
        case "-":
          setZoom((prev) => Math.max(prev - 0.25, 0.25))
          break
        case "r":
          setRotation((prev) => (prev + 90) % 360)
          break
        case "f":
          setIsFullscreen((prev) => !prev)
          break
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, currentIndex, images, isFullscreen])

  if (!isOpen || images.length === 0) return null

  const currentImage = images[currentIndex]

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length)
    setZoom(1)
    setRotation(0)
  }

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
    setZoom(1)
    setRotation(0)
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

  const handleDeleteSelected = () => {
    if (selectedImages.size > 0 && onDelete) {
      if (confirm(`هل أنت متأكد من حذف ${selectedImages.size} صورة؟`)) {
        onDelete(Array.from(selectedImages))
        setSelectedImages(new Set())
      }
    }
  }

  const handleDeleteCurrent = () => {
    if (currentImage && onDelete) {
      if (confirm("هل أنت متأكد من حذف هذه الصورة؟")) {
        onDelete([currentImage.id])
      }
    }
  }

  const handleDownload = () => {
    if (currentImage) {
      const link = document.createElement("a")
      link.href = currentImage.url
      link.download = currentImage.name || `image_${currentImage.id}.jpg`
      link.click()
    }
  }

  const toggleFullscreen = () => {
    setIsFullscreen((prev) => !prev)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  // Fullscreen Mode
  if (isFullscreen) {
    return (
      <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
        {/* Back Button */}
        <Button
          variant="ghost"
          size="lg"
          onClick={() => setIsFullscreen(false)}
          className="absolute top-4 left-4 text-white hover:bg-white hover:bg-opacity-20 z-10"
        >
          <ArrowLeft className="h-6 w-6 ml-2" />
          رجوع
        </Button>

        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="lg"
              onClick={goToPrevious}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:bg-white hover:bg-opacity-20 z-10"
            >
              <ChevronLeft className="h-8 w-8" />
            </Button>

            <Button
              variant="ghost"
              size="lg"
              onClick={goToNext}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:bg-white hover:bg-opacity-20 z-10"
            >
              <ChevronRight className="h-8 w-8" />
            </Button>
          </>
        )}

        {/* Image */}
        {currentImage && (
          <img
            src={currentImage.url || "/placeholder.svg"}
            alt={currentImage.name}
            className="max-w-full max-h-full object-contain transition-transform duration-200"
            style={{
              transform: `scale(${zoom}) rotate(${rotation}deg)`,
            }}
          />
        )}

        {/* Minimal Controls */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-2 bg-black bg-opacity-70 rounded-lg p-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setZoom((prev) => Math.max(prev - 0.25, 0.25))}
            className="text-white hover:bg-white hover:bg-opacity-20"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>

          <span className="text-white text-sm min-w-[60px] text-center">{Math.round(zoom * 100)}%</span>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setZoom((prev) => Math.min(prev + 0.25, 3))}
            className="text-white hover:bg-white hover:bg-opacity-20"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>

          <div className="w-px h-6 bg-gray-600 mx-2" />

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setRotation((prev) => (prev + 90) % 360)}
            className="text-white hover:bg-white hover:bg-opacity-20"
          >
            <RotateCw className="h-4 w-4" />
          </Button>
        </div>

        {/* Image Counter */}
        {images.length > 1 && (
          <div className="absolute top-4 right-4 bg-black bg-opacity-70 rounded-lg px-3 py-1">
            <span className="text-white text-sm">
              {currentIndex + 1} من {images.length}
            </span>
          </div>
        )}
      </div>
    )
  }

  // Normal Gallery Mode
  return (
    <div className="fixed inset-0 bg-black bg-opacity-95 z-50 flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center p-4 bg-black bg-opacity-50">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onClose} className="text-white hover:bg-white hover:bg-opacity-20">
            <ArrowLeft className="h-5 w-5 ml-2" />
            رجوع
          </Button>

          <div className="text-white">
            <span className="text-lg font-semibold">
              {currentIndex + 1} من {images.length}
            </span>
            {currentImage && (
              <div className="text-sm text-gray-300">
                {currentImage.name} • {formatFileSize(currentImage.size)}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {selectedImages.size > 0 && (
            <Button variant="destructive" size="sm" onClick={handleDeleteSelected} className="flex items-center gap-2">
              <Trash2 className="h-4 w-4" />
              حذف المحدد ({selectedImages.size})
            </Button>
          )}

          <Button variant="ghost" size="sm" onClick={onClose} className="text-white hover:bg-white hover:bg-opacity-20">
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Main Image Area */}
      <div className="flex-1 flex items-center justify-center relative overflow-hidden">
        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="lg"
              onClick={goToPrevious}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:bg-white hover:bg-opacity-20 z-10"
            >
              <ChevronLeft className="h-8 w-8" />
            </Button>

            <Button
              variant="ghost"
              size="lg"
              onClick={goToNext}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:bg-white hover:bg-opacity-20 z-10"
            >
              <ChevronRight className="h-8 w-8" />
            </Button>
          </>
        )}

        {/* Image */}
        {currentImage && (
          <img
            src={currentImage.url || "/placeholder.svg"}
            alt={currentImage.name}
            className="max-w-full max-h-full object-contain transition-transform duration-200"
            style={{
              transform: `scale(${zoom}) rotate(${rotation}deg)`,
              cursor: zoom > 1 ? "grab" : "default",
            }}
            onClick={(e) => e.stopPropagation()}
          />
        )}

        {/* Controls Overlay */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-2 bg-black bg-opacity-50 rounded-lg p-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setZoom((prev) => Math.max(prev - 0.25, 0.25))}
            className="text-white hover:bg-white hover:bg-opacity-20"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>

          <span className="text-white text-sm min-w-[60px] text-center">{Math.round(zoom * 100)}%</span>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setZoom((prev) => Math.min(prev + 0.25, 3))}
            className="text-white hover:bg-white hover:bg-opacity-20"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>

          <div className="w-px h-6 bg-gray-600 mx-2" />

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setRotation((prev) => (prev + 90) % 360)}
            className="text-white hover:bg-white hover:bg-opacity-20"
          >
            <RotateCw className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={toggleFullscreen}
            className="text-white hover:bg-white hover:bg-opacity-20"
            title="عرض بكامل الشاشة (F)"
          >
            <Maximize className="h-4 w-4" />
          </Button>

          <div className="w-px h-6 bg-gray-600 mx-2" />

          <Button
            variant="ghost"
            size="sm"
            onClick={handleDownload}
            className="text-white hover:bg-white hover:bg-opacity-20"
          >
            <Download className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleDeleteCurrent}
            className="text-red-400 hover:bg-red-500 hover:bg-opacity-20"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Thumbnails */}
      {showThumbnails && images.length > 1 && (
        <div className="bg-black bg-opacity-50 p-4">
          <div className="flex gap-2 overflow-x-auto max-w-full">
            {images.map((image, index) => (
              <div key={image.id} className="flex-shrink-0 relative">
                <div className="flex items-center gap-2 mb-2">
                  <Checkbox
                    checked={selectedImages.has(image.id)}
                    onCheckedChange={(checked) => handleImageSelect(image.id, checked as boolean)}
                    className="bg-white"
                  />
                </div>
                <img
                  src={image.url || "/placeholder.svg"}
                  alt={image.name}
                  className={`w-16 h-16 object-cover rounded cursor-pointer border-2 transition-all ${
                    index === currentIndex
                      ? "border-blue-500 opacity-100"
                      : "border-gray-600 opacity-70 hover:opacity-100"
                  }`}
                  onClick={() => {
                    setCurrentIndex(index)
                    setZoom(1)
                    setRotation(0)
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
