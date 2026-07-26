import { defineStore } from 'pinia'
import { ref } from 'vue'
import { get, set } from '../lib/storage'
import { useProfileStore } from './profile'
import { pilihLww, push } from '../lib/sync'

export const useTrackingStore = defineStore('tracking', () => {
  const profile = useProfileStore()

  const pid = () => profile.profilAktif

  // Cadangan reaktif checklist: key `${pid}:${tanggal}` -> { itemId: bool }.
  const checklists = ref({})

  // Cadangan reaktif riwayat BB & Ukuran per profil: key = pid()
  const riwayatBBMap = ref({})
  const riwayatUkuranMap = ref({})

  const keyFor = (tanggal) => `${pid()}:${tanggal}`

  function ensureChecklist(tanggal) {
    const k = keyFor(tanggal)
    if (!(k in checklists.value)) {
      checklists.value[k] = get(pid(), `checklist:${tanggal}`, {})
    }
  }

  function getChecklist(tanggal) {
    return checklists.value[keyFor(tanggal)] || {}
  }

  function setChecklistItem(tanggal, key, val) {
    ensureChecklist(tanggal)
    const k = keyFor(tanggal)
    checklists.value[k] = { ...checklists.value[k], [key]: val }
    set(pid(), `checklist:${tanggal}`, checklists.value[k])
    const ts = new Date().toISOString()
    set(pid(), `checklist:${tanggal}:ts`, ts)
    push('checklist', tanggal, checklists.value[k])
  }

  function ensureRiwayatBB() {
    const p = pid()
    if (!(p in riwayatBBMap.value)) {
      riwayatBBMap.value[p] = get(p, 'riwayatBB', [])
    }
  }

  function ensureRiwayatUkuran() {
    const p = pid()
    if (!(p in riwayatUkuranMap.value)) {
      riwayatUkuranMap.value[p] = get(p, 'riwayatUkuran', [])
    }
  }

  function getRiwayatBB() {
    ensureRiwayatBB()
    return riwayatBBMap.value[pid()]
  }

  function tambahBB(kg) {
    ensureRiwayatBB()
    const p = pid()
    const r = [...riwayatBBMap.value[p]]
    const tgl = new Date().toISOString().slice(0, 10)
    const idx = r.findIndex(e => e.tanggal === tgl)
    if (idx >= 0) {
      r[idx] = { ...r[idx], kg }
    } else {
      r.push({ tanggal: tgl, kg })
    }
    r.sort((a, b) => a.tanggal.localeCompare(b.tanggal))
    riwayatBBMap.value = { ...riwayatBBMap.value, [p]: r }
    set(p, 'riwayatBB', r)
    set(p, `bb:${tgl}:ts`, new Date().toISOString())
    push('bb', tgl, { kg })
    return r
  }

  function getRiwayatUkuran() {
    ensureRiwayatUkuran()
    return riwayatUkuranMap.value[pid()]
  }

  function tambahUkuran(entry) {
    ensureRiwayatUkuran()
    const p = pid()
    const tgl = new Date().toISOString().slice(0, 10)
    const r = [...riwayatUkuranMap.value[p]]
    const idx = r.findIndex(e => e.tanggal === tgl)
    if (idx >= 0) {
      r[idx] = { ...r[idx], ...entry, tanggal: tgl }
    } else {
      r.push({ ...entry, tanggal: tgl })
    }
    r.sort((a, b) => a.tanggal.localeCompare(b.tanggal))
    riwayatUkuranMap.value = { ...riwayatUkuranMap.value, [p]: r }
    set(p, 'riwayatUkuran', r)
    set(p, `ukuran:${tgl}:ts`, new Date().toISOString())
    push('ukuran', tgl, entry)
    return r
  }

  // Terima hasil pull dari cloud, rekonsiliasi LWW vs timestamp lokal, tulis balik ke ref & localStorage.
  function terimaDariCloud(jenis, tanggal, payload, updated_at) {
    const p = pid()
    const cloud = { payload, updated_at: updated_at || new Date().toISOString() }

    if (jenis === 'checklist') {
      const kunci = `checklist:${tanggal}`
      const kunciTs = `${kunci}:ts`
      const lokalRaw = get(p, kunci, null)
      const lokal = lokalRaw
        ? { payload: lokalRaw, updated_at: get(p, kunciTs, '1970-01-01T00:00:00Z') }
        : null
      const menang = pilihLww(lokal, cloud)
      checklists.value[keyFor(tanggal)] = menang.payload
      set(p, kunci, menang.payload)
      set(p, kunciTs, menang.updated_at)
      return
    }
    if (jenis === 'bb') {
      const kunciTs = `bb:${tanggal}:ts`
      ensureRiwayatBB()
      const r = [...riwayatBBMap.value[p]]
      const lokalEntry = r.find(e => e.tanggal === tanggal)
      const lokal = lokalEntry
        ? { payload: { kg: lokalEntry.kg }, updated_at: get(p, kunciTs, '1970-01-01T00:00:00Z') }
        : null
      const menang = pilihLww(lokal, cloud)
      const idx = r.findIndex(e => e.tanggal === tanggal)
      if (idx >= 0) r[idx] = { ...r[idx], kg: menang.payload.kg }
      else r.push({ tanggal, kg: menang.payload.kg })
      r.sort((a, b) => a.tanggal.localeCompare(b.tanggal))
      riwayatBBMap.value = { ...riwayatBBMap.value, [p]: r }
      set(p, 'riwayatBB', r)
      set(p, kunciTs, menang.updated_at)
      return
    }
    if (jenis === 'ukuran') {
      const tgl = payload.tanggal || tanggal
      const kunciTs = `ukuran:${tgl}:ts`
      ensureRiwayatUkuran()
      const r = [...riwayatUkuranMap.value[p]]
      const lokalEntry = r.find(e => e.tanggal === tgl)
      const lokal = lokalEntry
        ? { payload: lokalEntry, updated_at: get(p, kunciTs, '1970-01-01T00:00:00Z') }
        : null
      const menang = pilihLww(lokal, cloud)
      const menangEntry = { ...menang.payload, tanggal: tgl }
      const idx = r.findIndex(e => e.tanggal === tgl)
      if (idx >= 0) r[idx] = { ...r[idx], ...menangEntry }
      else r.push(menangEntry)
      r.sort((a, b) => a.tanggal.localeCompare(b.tanggal))
      riwayatUkuranMap.value = { ...riwayatUkuranMap.value, [p]: r }
      set(p, 'riwayatUkuran', r)
      set(p, kunciTs, menang.updated_at)
    }
  }

  return {
    ensureChecklist,
    getChecklist,
    setChecklistItem,
    ensureRiwayatBB,
    ensureRiwayatUkuran,
    getRiwayatBB,
    tambahBB,
    getRiwayatUkuran,
    tambahUkuran,
    terimaDariCloud,
  }
})
