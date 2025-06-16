// إدارة سجل البحث - متوافق مع SSR
let searchHistory = null

if (typeof window !== "undefined") {
  class SearchHistory {
    constructor() {
      this.storageKey = "quranSearchHistory"
      this.maxEntries = 10
    }

    // إضافة بحث جديد
    addSearch(term, withTashkeel = false, resultsCount = 0) {
      try {
        const history = this.getHistory()

        // إزالة البحث المكرر إن وجد
        const filteredHistory = history.filter((item) => item.term !== term)

        // إضافة البحث الجديد في المقدمة
        const newEntry = {
          term,
          withTashkeel,
          resultsCount,
          timestamp: Date.now(),
          date: this.formatDate(new Date()),
        }

        filteredHistory.unshift(newEntry)

        // الاحتفاظ بآخر 10 عمليات بحث فقط
        const limitedHistory = filteredHistory.slice(0, this.maxEntries)

        localStorage.setItem(this.storageKey, JSON.stringify(limitedHistory))
      } catch (error) {
        console.error("Error adding search to history:", error)
      }
    }

    // الحصول على سجل البحث
    getHistory() {
      try {
        const history = localStorage.getItem(this.storageKey)
        return history ? JSON.parse(history) : []
      } catch (error) {
        console.error("Error getting search history:", error)
        return []
      }
    }

    // حذف عنصر من السجل
    removeSearch(term) {
      try {
        const history = this.getHistory()
        const filteredHistory = history.filter((item) => item.term !== term)
        localStorage.setItem(this.storageKey, JSON.stringify(filteredHistory))
      } catch (error) {
        console.error("Error removing search from history:", error)
      }
    }

    // مسح جميع السجل
    clearHistory() {
      try {
        localStorage.removeItem(this.storageKey)
      } catch (error) {
        console.error("Error clearing search history:", error)
      }
    }

    // تنسيق التاريخ
    formatDate(date) {
      const months = [
        "يناير",
        "فبراير",
        "مارس",
        "أبريل",
        "مايو",
        "يونيو",
        "يوليو",
        "أغسطس",
        "سبتمبر",
        "أكتوبر",
        "نوفمبر",
        "ديسمبر",
      ]

      const day = date.getDate()
      const month = months[date.getMonth()]
      const year = date.getFullYear()
      const hours = date.getHours().toString().padStart(2, "0")
      const minutes = date.getMinutes().toString().padStart(2, "0")

      return `${day} - ${month} - ${year}م - ${hours}:${minutes}`
    }
  }

  searchHistory = new SearchHistory()
} else {
  // إنشاء mock object للخادم
  searchHistory = {
    addSearch: () => {},
    getHistory: () => [],
    removeSearch: () => {},
    clearHistory: () => {},
    formatDate: () => "",
  }
}

export { searchHistory }
