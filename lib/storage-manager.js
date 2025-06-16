// نظام إدارة التخزين المحلي
class StorageManager {
  constructor() {
    this.storageKeys = [
      "hizbData",
      "juzData",
      "currentMode",
      "quranAppDB_lists",
      "quranAppDB_ayaData",
      "searchHistory",
      "shareHistory",
      "lastSharedInfo",
      "pageSettings",
    ]
  }

  // حساب حجم البيانات المحفوظة
  calculateStorageSize() {
    let totalSize = 0
    const details = {}

    this.storageKeys.forEach((key) => {
      const data = localStorage.getItem(key)
      if (data) {
        const size = new Blob([data]).size
        totalSize += size
        details[key] = {
          size: size,
          sizeFormatted: this.formatBytes(size),
          itemCount: this.getItemCount(key, data),
        }
      }
    })

    return {
      totalSize,
      totalSizeFormatted: this.formatBytes(totalSize),
      details,
    }
  }

  // تنسيق الحجم بالوحدات المناسبة
  formatBytes(bytes) {
    if (bytes === 0) return "0 بايت"

    const k = 1024
    const sizes = ["بايت", "كيلوبايت", "ميجابايت", "جيجابايت"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  // حساب عدد العناصر في كل مفتاح
  getItemCount(key, data) {
    try {
      const parsed = JSON.parse(data)
      if (Array.isArray(parsed)) {
        return parsed.length
      } else if (typeof parsed === "object" && parsed !== null) {
        return Object.keys(parsed).length
      }
      return 1
    } catch {
      return 1
    }
  }

  // حذف جميع البيانات
  clearAllData() {
    this.storageKeys.forEach((key) => {
      localStorage.removeItem(key)
    })

    // مسح أي مفاتيح أخرى قد تكون موجودة
    const allKeys = Object.keys(localStorage)
    allKeys.forEach((key) => {
      if (key.startsWith("quranApp") || key.includes("hizb") || key.includes("juz")) {
        localStorage.removeItem(key)
      }
    })
  }

  // تصدير البيانات
  exportData() {
    const exportData = {}
    this.storageKeys.forEach((key) => {
      const data = localStorage.getItem(key)
      if (data) {
        try {
          exportData[key] = JSON.parse(data)
        } catch {
          exportData[key] = data
        }
      }
    })

    return {
      exportDate: new Date().toISOString(),
      appVersion: "1.0.0",
      data: exportData,
    }
  }

  // استيراد البيانات
  importData(importedData) {
    try {
      if (importedData.data) {
        Object.keys(importedData.data).forEach((key) => {
          const value =
            typeof importedData.data[key] === "string" ? importedData.data[key] : JSON.stringify(importedData.data[key])
          localStorage.setItem(key, value)
        })
        return true
      }
      return false
    } catch (error) {
      console.error("خطأ في استيراد البيانات:", error)
      return false
    }
  }

  // فحص صحة التخزين
  checkStorageHealth() {
    const issues = []

    // فحص حد التخزين
    try {
      const testKey = "storage_test"
      const testData = "x".repeat(1024) // 1KB
      localStorage.setItem(testKey, testData)
      localStorage.removeItem(testKey)
    } catch (error) {
      issues.push("مساحة التخزين ممتلئة")
    }

    // فحص البيانات التالفة
    this.storageKeys.forEach((key) => {
      const data = localStorage.getItem(key)
      if (data) {
        try {
          JSON.parse(data)
        } catch {
          issues.push(`بيانات تالفة في: ${key}`)
        }
      }
    })

    return {
      isHealthy: issues.length === 0,
      issues,
    }
  }
}

export const storageManager = new StorageManager()
