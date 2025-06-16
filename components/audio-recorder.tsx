"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Mic, Square, Play, Pause, Edit, Trash2, Volume2 } from "lucide-react"
import { mediaStorage } from "@/lib/media-storage"

interface AudioNote {
  id: string
  url: string
  title: string
  timestamp: string
  size: number
}

interface AudioRecorderProps {
  itemId: string
  audioNotes: AudioNote[]
  onSaveAudio: (audioNote: AudioNote) => void
  onDeleteAudio: (audioId: string) => void
  onEditAudio: (audioId: string, newTitle: string) => void
}

export default function AudioRecorder({
  itemId,
  audioNotes,
  onSaveAudio,
  onDeleteAudio,
  onEditAudio,
}: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [recordedAudio, setRecordedAudio] = useState<string | null>(null)
  const [audioTitle, setAudioTitle] = useState("")
  const [playingIndex, setPlayingIndex] = useState<number | null>(null)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editTitle, setEditTitle] = useState("")
  const [recordingTime, setRecordingTime] = useState(0)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const audioRefs = useRef<(HTMLAudioElement | null)[]>([])
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // تنظيف عند إلغاء التحميل
    return () => {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current)
      }
    }
  }, [])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm;codecs=opus",
      })

      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []
      setRecordingTime(0)

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" })
        const audioUrl = URL.createObjectURL(audioBlob)
        setRecordedAudio(audioUrl)

        // إيقاف جميع المسارات
        stream.getTracks().forEach((track) => track.stop())

        if (recordingIntervalRef.current) {
          clearInterval(recordingIntervalRef.current)
        }
      }

      mediaRecorder.start(1000) // جمع البيانات كل ثانية
      setIsRecording(true)

      // بدء عداد الوقت
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1)
      }, 1000)
    } catch (err) {
      console.error("خطأ في الوصول للميكروفون:", err)
      alert("لا يمكن الوصول للميكروفون. تأكد من منح الإذن.")
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)

      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current)
      }
    }
  }

  const saveRecording = async () => {
    if (recordedAudio && audioTitle.trim()) {
      try {
        // تحويل URL إلى Blob
        const response = await fetch(recordedAudio)
        const blob = await response.blob()

        // حفظ في IndexedDB
        const audioId = await mediaStorage.saveAudio(blob, audioTitle.trim(), itemId)

        if (audioId) {
          const audioNote: AudioNote = {
            id: audioId,
            url: recordedAudio,
            title: audioTitle.trim(),
            timestamp: new Date().toLocaleString("ar-EG"),
            size: blob.size,
          }

          onSaveAudio(audioNote)
          setRecordedAudio(null)
          setAudioTitle("")
          setRecordingTime(0)
        } else {
          alert("فشل في حفظ التسجيل")
        }
      } catch (error) {
        console.error("Error saving audio:", error)
        alert("حدث خطأ أثناء حفظ التسجيل")
      }
    } else {
      alert("يرجى إدخال عنوان للتسجيل")
    }
  }

  const playAudio = (index: number) => {
    const audio = audioRefs.current[index]
    if (audio) {
      if (playingIndex === index) {
        audio.pause()
        setPlayingIndex(null)
      } else {
        // إيقاف أي تسجيل آخر يتم تشغيله
        audioRefs.current.forEach((a, i) => {
          if (a && i !== index) {
            a.pause()
          }
        })

        audio.play().catch((error) => {
          console.error("Error playing audio:", error)
          alert("فشل في تشغيل التسجيل")
        })
        setPlayingIndex(index)
      }
    }
  }

  const handleEdit = (index: number) => {
    setEditingIndex(index)
    setEditTitle(audioNotes[index].title)
  }

  const saveEdit = () => {
    if (editingIndex !== null && editTitle.trim()) {
      const audioNote = audioNotes[editingIndex]
      onEditAudio(audioNote.id, editTitle.trim())
      setEditingIndex(null)
      setEditTitle("")
    }
  }

  const cancelEdit = () => {
    setEditingIndex(null)
    setEditTitle("")
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  return (
    <div className="space-y-4 border-t pt-4">
      <h4 className="font-semibold text-white flex items-center gap-2">
        <Volume2 className="h-4 w-4" />
        الملاحظات الصوتية
      </h4>

      {/* Recording Controls */}
      <div className="space-y-3">
        {!isRecording && !recordedAudio && (
          <Button
            onClick={startRecording}
            className="w-full flex items-center gap-2 bg-red-600 hover:bg-red-700"
            variant="default"
          >
            <Mic className="h-4 w-4" />
            بدء التسجيل
          </Button>
        )}

        {isRecording && (
          <div className="space-y-2">
            <div className="flex items-center justify-center gap-2 p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-red-400 font-mono text-lg">{formatTime(recordingTime)}</span>
            </div>
            <Button onClick={stopRecording} className="w-full flex items-center gap-2" variant="destructive">
              <Square className="h-4 w-4" />
              إيقاف التسجيل
            </Button>
          </div>
        )}

        {recordedAudio && (
          <div className="space-y-3 p-4 bg-slate-700/50 border border-slate-600 rounded-lg">
            <div className="text-sm text-slate-300 mb-2">معاينة التسجيل:</div>
            <audio src={recordedAudio} controls className="w-full" />
            <Input
              placeholder="عنوان التسجيل"
              value={audioTitle}
              onChange={(e) => setAudioTitle(e.target.value)}
              className="bg-slate-800 border-slate-600 text-white"
            />
            <div className="flex gap-2">
              <Button onClick={saveRecording} className="flex-1 bg-emerald-600 hover:bg-emerald-700">
                حفظ التسجيل
              </Button>
              <Button
                onClick={() => {
                  setRecordedAudio(null)
                  setAudioTitle("")
                  setRecordingTime(0)
                }}
                variant="outline"
                className="flex-1"
              >
                إلغاء
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Audio Notes List */}
      {audioNotes.length > 0 && (
        <div className="space-y-3">
          <h5 className="font-medium text-slate-200">التسجيلات المحفوظة ({audioNotes.length}):</h5>
          {audioNotes.map((note, index) => (
            <div key={note.id} className="border border-slate-600 rounded-lg p-4 space-y-3 bg-slate-800/50">
              {editingIndex === index ? (
                <div className="space-y-2">
                  <Input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    placeholder="عنوان التسجيل"
                    className="bg-slate-800 border-slate-600 text-white"
                  />
                  <div className="flex gap-2">
                    <Button onClick={saveEdit} size="sm" className="flex-1 bg-emerald-600 hover:bg-emerald-700">
                      حفظ
                    </Button>
                    <Button onClick={cancelEdit} size="sm" variant="outline" className="flex-1">
                      إلغاء
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="font-medium text-white">{note.title}</div>
                      <div className="text-sm text-slate-400 flex items-center gap-4">
                        <span>{note.timestamp}</span>
                        <span>{formatFileSize(note.size)}</span>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        onClick={() => handleEdit(index)}
                        size="sm"
                        variant="ghost"
                        className="text-slate-400 hover:text-white"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        onClick={() => {
                          if (confirm("هل أنت متأكد من حذف هذه الملاحظة الصوتية؟")) {
                            onDeleteAudio(note.id)
                          }
                        }}
                        size="sm"
                        variant="ghost"
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => playAudio(index)}
                      size="sm"
                      variant="outline"
                      className="flex items-center gap-2 bg-slate-700 border-slate-600 text-slate-200 hover:bg-slate-600"
                    >
                      {playingIndex === index ? (
                        <>
                          <Pause className="h-3 w-3" />
                          إيقاف
                        </>
                      ) : (
                        <>
                          <Play className="h-3 w-3" />
                          تشغيل
                        </>
                      )}
                    </Button>
                    <audio
                      ref={(el) => (audioRefs.current[index] = el)}
                      src={note.url}
                      onEnded={() => setPlayingIndex(null)}
                      onError={(e) => {
                        console.error("Audio error:", e)
                        setPlayingIndex(null)
                      }}
                      className="hidden"
                      preload="metadata"
                    />
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
