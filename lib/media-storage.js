// نظام تخزين الوسائط المتقدم باستخدام IndexedDB
class MediaStorage {
  constructor() {
    this.dbName = "QuranAppMedia"
    this.version = 1
    this.db = null
    this.init()
  }

  async init() {
    if (typeof window === "undefined") return

    try {
      this.db = await this.openDB()
    } catch (error) {
      console.error("Error initializing MediaStorage:", error)
    }
  }

  openDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result)

      request.onupgradeneeded = (event) => {
        const db = event.target.result

        // إنشاء store للصور
        if (!db.objectStoreNames.contains("images")) {
          const imageStore = db.createObjectStore("images", { keyPath: "id" })
          imageStore.createIndex("itemId", "itemId", { unique: false })
        }

        // إنشاء store للصوتيات
        if (!db.objectStoreNames.contains("audio")) {
          const audioStore = db.createObjectStore("audio", { keyPath: "id" })
          audioStore.createIndex("itemId", "itemId", { unique: false })
        }
      }
    })
  }

  // ضغط الصور
  compressImage(file, maxWidth = 1920, maxHeight = 1080, quality = 0.8) {
    return new Promise((resolve) => {
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")
      const img = new Image()

      img.onload = () => {
        // حساب الأبعاد الجديدة
        let { width, height } = img
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height)
          width *= ratio
          height *= ratio
        }

        canvas.width = width
        canvas.height = height
        ctx.drawImage(img, 0, 0, width, height)

        canvas.toBlob(resolve, "image/jpeg", quality)
      }

      img.src = URL.createObjectURL(file)
    })
  }

  // حفظ صورة
  async saveImage(file, itemId) {
    if (!this.db) await this.init()

    try {
      const compressedFile = await this.compressImage(file)
      const id = `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

      const imageData = {
        id,
        itemId,
        file: compressedFile,
        name: file.name,
        size: compressedFile.size,
        type: compressedFile.type,
        timestamp: Date.now(),
      }

      const transaction = this.db.transaction(["images"], "readwrite")
      const store = transaction.objectStore("images")
      await store.add(imageData)

      return id
    } catch (error) {
      console.error("Error saving image:", error)
      return null
    }
  }

  // حفظ صوت
  async saveAudio(blob, title, itemId) {
    if (!this.db) await this.init()

    try {
      const id = `audio_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

      const audioData = {
        id,
        itemId,
        blob,
        title,
        size: blob.size,
        type: blob.type,
        timestamp: Date.now(),
      }

      const transaction = this.db.transaction(["audio"], "readwrite")
      const store = transaction.objectStore("audio")
      await store.add(audioData)

      return id
    } catch (error) {
      console.error("Error saving audio:", error)
      return null
    }
  }

  // استرداد الصور
  async getImages(itemId) {
    if (!this.db) await this.init()

    try {
      const transaction = this.db.transaction(["images"], "readonly")
      const store = transaction.objectStore("images")
      const index = store.index("itemId")
      const request = index.getAll(itemId)

      return new Promise((resolve, reject) => {
        request.onsuccess = () => {
          const images = request.result.map((img) => ({
            id: img.id,
            url: URL.createObjectURL(img.file),
            name: img.name,
            size: img.size,
            timestamp: img.timestamp,
          }))
          resolve(images)
        }
        request.onerror = () => reject(request.error)
      })
    } catch (error) {
      console.error("Error getting images:", error)
      return []
    }
  }

  // استرداد الصوتيات
  async getAudio(itemId) {
    if (!this.db) await this.init()

    try {
      const transaction = this.db.transaction(["audio"], "readonly")
      const store = transaction.objectStore("audio")
      const index = store.index("itemId")
      const request = index.getAll(itemId)

      return new Promise((resolve, reject) => {
        request.onsuccess = () => {
          const audios = request.result.map((audio) => ({
            id: audio.id,
            url: URL.createObjectURL(audio.blob),
            title: audio.title,
            size: audio.size,
            timestamp: audio.timestamp,
          }))
          resolve(audios)
        }
        request.onerror = () => reject(request.error)
      })
    } catch (error) {
      console.error("Error getting audio:", error)
      return []
    }
  }

  // حذف صورة
  async deleteImage(imageId) {
    if (!this.db) await this.init()

    try {
      const transaction = this.db.transaction(["images"], "readwrite")
      const store = transaction.objectStore("images")
      await store.delete(imageId)
      return true
    } catch (error) {
      console.error("Error deleting image:", error)
      return false
    }
  }

  // حذف صوت
  async deleteAudio(audioId) {
    if (!this.db) await this.init()

    try {
      const transaction = this.db.transaction(["audio"], "readwrite")
      const store = transaction.objectStore("audio")
      await store.delete(audioId)
      return true
    } catch (error) {
      console.error("Error deleting audio:", error)
      return false
    }
  }

  // حساب حجم البيانات
  async getStorageSize() {
    if (!this.db) await this.init()

    try {
      const [images, audios] = await Promise.all([this.getAllImages(), this.getAllAudios()])

      const imageSize = images.reduce((total, img) => total + (img.size || 0), 0)
      const audioSize = audios.reduce((total, audio) => total + (audio.size || 0), 0)

      return {
        images: imageSize,
        audio: audioSize,
        total: imageSize + audioSize,
      }
    } catch (error) {
      console.error("Error calculating storage size:", error)
      return { images: 0, audio: 0, total: 0 }
    }
  }

  async getAllImages() {
    if (!this.db) await this.init()

    try {
      const transaction = this.db.transaction(["images"], "readonly")
      const store = transaction.objectStore("images")
      const request = store.getAll()

      return new Promise((resolve, reject) => {
        request.onsuccess = () => resolve(request.result)
        request.onerror = () => reject(request.error)
      })
    } catch (error) {
      console.error("Error getting all images:", error)
      return []
    }
  }

  async getAllAudios() {
    if (!this.db) await this.init()

    try {
      const transaction = this.db.transaction(["audio"], "readonly")
      const store = transaction.objectStore("audio")
      const request = store.getAll()

      return new Promise((resolve, reject) => {
        request.onsuccess = () => resolve(request.result)
        request.onerror = () => reject(request.error)
      })
    } catch (error) {
      console.error("Error getting all audios:", error)
      return []
    }
  }

  // مسح جميع البيانات
  async clearAll() {
    if (!this.db) await this.init()

    try {
      const transaction = this.db.transaction(["images", "audio"], "readwrite")
      await Promise.all([transaction.objectStore("images").clear(), transaction.objectStore("audio").clear()])
      return true
    } catch (error) {
      console.error("Error clearing storage:", error)
      return false
    }
  }
}

// إنشاء instance واحد
export const mediaStorage = new MediaStorage()
