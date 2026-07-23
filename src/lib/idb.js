const DB_NAME = 'diet-gemoy'
const DB_VERSION = 1
const STORE = 'foto'

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: 'id' })
      }
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

export async function putFoto(profilId, tanggal, blob, catatan = '') {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite')
    const store = tx.objectStore(STORE)
    store.put({ id: `${profilId}:${tanggal}`, profilId, tanggal, blob, catatan, createdAt: new Date().toISOString() })
    tx.oncomplete = () => resolve(true)
    tx.onerror = () => reject(tx.error)
  })
}

export async function getFoto(profilId, tanggal) {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly')
    const store = tx.objectStore(STORE)
    const req = store.get(`${profilId}:${tanggal}`)
    req.onsuccess = () => resolve(req.result || null)
    req.onerror = () => reject(req.error)
  })
}

export async function listFoto(profilId) {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly')
    const store = tx.objectStore(STORE)
    const req = store.getAll()
    req.onsuccess = () => {
      const all = req.result || []
      resolve(all.filter(f => f.profilId === profilId).sort((a, b) => b.tanggal.localeCompare(a.tanggal)))
    }
    req.onerror = () => reject(req.error)
  })
}

export async function delFoto(profilId, tanggal) {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite')
    const store = tx.objectStore(STORE)
    store.delete(`${profilId}:${tanggal}`)
    tx.oncomplete = () => resolve(true)
    tx.onerror = () => reject(tx.error)
  })
}
