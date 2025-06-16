// إدارة قاعدة البيانات المحلية - متوافق مع SSR
let localDB = null

// تأخير إنشاء LocalDB حتى يتم تحميل العميل
if (typeof window !== "undefined") {
  class LocalDB {
    constructor() {
      this.dbName = "quranAppDB"
      this.init()
    }

    init() {
      try {
        // إنشاء الجداول الأساسية إذا لم تكن موجودة
        if (!localStorage.getItem(`${this.dbName}_lists`)) {
          localStorage.setItem(
            `${this.dbName}_lists`,
            JSON.stringify([{ id: "favorites", name: "المفضلة", createdAt: Date.now() }]),
          )
        }

        if (!localStorage.getItem(`${this.dbName}_ayaData`)) {
          localStorage.setItem(`${this.dbName}_ayaData`, JSON.stringify({}))
        }
      } catch (error) {
        console.error("Error initializing LocalDB:", error)
      }
    }

    // إدارة القوائم
    getLists() {
      try {
        const lists = JSON.parse(localStorage.getItem(`${this.dbName}_lists`) || "[]")
        return Array.isArray(lists) ? lists : []
      } catch (error) {
        console.error("Error getting lists:", error)
        return []
      }
    }

    createList(name) {
      try {
        const lists = this.getLists()
        const newList = {
          id: `list_${Date.now()}`,
          name,
          createdAt: Date.now(),
        }
        lists.push(newList)
        localStorage.setItem(`${this.dbName}_lists`, JSON.stringify(lists))
        return newList
      } catch (error) {
        console.error("Error creating list:", error)
        return null
      }
    }

    deleteList(listId) {
      try {
        if (listId === "favorites") return false // لا يمكن حذف المفضلة

        const lists = this.getLists().filter((list) => list.id !== listId)
        localStorage.setItem(`${this.dbName}_lists`, JSON.stringify(lists))

        // حذف جميع الآيات من هذه القائمة
        const ayaData = this.getAllAyaData()
        Object.keys(ayaData).forEach((ayaKey) => {
          if (ayaData[ayaKey].lists && Array.isArray(ayaData[ayaKey].lists)) {
            ayaData[ayaKey].lists = ayaData[ayaKey].lists.filter((id) => id !== listId)
          }
        })
        localStorage.setItem(`${this.dbName}_ayaData`, JSON.stringify(ayaData))
        return true
      } catch (error) {
        console.error("Error deleting list:", error)
        return false
      }
    }

    // إدارة بيانات الآيات
    getAllAyaData() {
      try {
        const data = JSON.parse(localStorage.getItem(`${this.dbName}_ayaData`) || "{}")
        return typeof data === "object" && data !== null ? data : {}
      } catch (error) {
        console.error("Error getting all aya data:", error)
        return {}
      }
    }

    getAyaData(suraIndex, ayaIndex) {
      try {
        const ayaKey = `${suraIndex}_${ayaIndex}`
        const allData = this.getAllAyaData()
        const ayaData = allData[ayaKey] || {}

        // ضمان وجود جميع الخصائص المطلوبة كمصفوفات
        return {
          lists: Array.isArray(ayaData.lists) ? ayaData.lists : [],
          notes: ayaData.notes || "",
          images: Array.isArray(ayaData.images) ? ayaData.images : [],
          audioNotes: Array.isArray(ayaData.audioNotes) ? ayaData.audioNotes : [],
          addedAt: ayaData.addedAt || Date.now(), // إضافة تاريخ الإضافة
        }
      } catch (error) {
        console.error("Error getting aya data:", error)
        return {
          lists: [],
          notes: "",
          images: [],
          audioNotes: [],
          addedAt: Date.now(),
        }
      }
    }

    saveAyaData(suraIndex, ayaIndex, data) {
      try {
        const ayaKey = `${suraIndex}_${ayaIndex}`
        const allData = this.getAllAyaData()

        // الحصول على البيانات الحالية
        const currentData = allData[ayaKey] || {}

        // دمج البيانات الجديدة مع الحالية مع ضمان صحة المصفوفات
        allData[ayaKey] = {
          lists: Array.isArray(data.lists) ? data.lists : Array.isArray(currentData.lists) ? currentData.lists : [],
          notes: data.notes !== undefined ? data.notes : currentData.notes || "",
          images: Array.isArray(data.images)
            ? data.images
            : Array.isArray(currentData.images)
              ? currentData.images
              : [],
          audioNotes: Array.isArray(data.audioNotes)
            ? data.audioNotes
            : Array.isArray(currentData.audioNotes)
              ? currentData.audioNotes
              : [],
          addedAt: currentData.addedAt || Date.now(), // الحفاظ على تاريخ الإضافة الأصلي
        }

        localStorage.setItem(`${this.dbName}_ayaData`, JSON.stringify(allData))
      } catch (error) {
        console.error("Error saving aya data:", error)
      }
    }

    // إضافة/إزالة آية من قائمة
    addAyaToList(suraIndex, ayaIndex, listId) {
      try {
        const ayaData = this.getAyaData(suraIndex, ayaIndex)

        // ضمان أن lists هي مصفوفة
        if (!Array.isArray(ayaData.lists)) {
          ayaData.lists = []
        }

        // إضافة إلى القائمة إذا لم تكن موجودة
        if (!ayaData.lists.includes(listId)) {
          ayaData.lists.push(listId)
          // تحديث تاريخ الإضافة إذا كانت هذه أول قائمة
          if (ayaData.lists.length === 1) {
            ayaData.addedAt = Date.now()
          }
          this.saveAyaData(suraIndex, ayaIndex, ayaData)
        }
      } catch (error) {
        console.error("Error adding aya to list:", error)
      }
    }

    removeAyaFromList(suraIndex, ayaIndex, listId) {
      try {
        const ayaData = this.getAyaData(suraIndex, ayaIndex)

        // ضمان أن lists هي مصفوفة
        if (!Array.isArray(ayaData.lists)) {
          ayaData.lists = []
        }

        // إزالة من القائمة
        ayaData.lists = ayaData.lists.filter((id) => id !== listId)
        this.saveAyaData(suraIndex, ayaIndex, ayaData)
      } catch (error) {
        console.error("Error removing aya from list:", error)
      }
    }

    // الحصول على آيات قائمة معينة
    getAyasInList(listId) {
      try {
        const allData = this.getAllAyaData()
        const result = []

        Object.keys(allData).forEach((ayaKey) => {
          const ayaInfo = allData[ayaKey]
          if (ayaInfo && Array.isArray(ayaInfo.lists) && ayaInfo.lists.includes(listId)) {
            const [suraIndex, ayaIndex] = ayaKey.split("_")
            result.push({
              suraIndex,
              ayaIndex,
              data: ayaInfo,
            })
          }
        })

        // ترتيب حسب تاريخ الإضافة (الأحدث أولاً)
        return result.sort((a, b) => (b.data.addedAt || 0) - (a.data.addedAt || 0))
      } catch (error) {
        console.error("Error getting ayas in list:", error)
        return []
      }
    }

    // إحصائيات
    getStats() {
      try {
        const allData = this.getAllAyaData()
        const lists = this.getLists()

        return {
          totalAyas: Object.keys(allData).length,
          totalLists: lists.length,
          listsWithCounts: lists.map((list) => ({
            ...list,
            count: this.getAyasInList(list.id).length,
          })),
        }
      } catch (error) {
        console.error("Error getting stats:", error)
        return {
          totalAyas: 0,
          totalLists: 0,
          listsWithCounts: [],
        }
      }
    }
  }

  localDB = new LocalDB()
} else {
  // إنشاء mock object للخادم
  localDB = {
    getLists: () => [],
    createList: () => null,
    deleteList: () => false,
    getAllAyaData: () => ({}),
    getAyaData: () => ({ lists: [], notes: "", images: [], audioNotes: [], addedAt: Date.now() }),
    saveAyaData: () => {},
    addAyaToList: () => {},
    removeAyaFromList: () => {},
    getAyasInList: () => [],
    getStats: () => ({ totalAyas: 0, totalLists: 0, listsWithCounts: [] }),
  }
}

export { localDB }
