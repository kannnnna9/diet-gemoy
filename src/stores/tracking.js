import { defineStore } from 'pinia'
import { ref } from 'vue'
import { get, set } from '../lib/storage'
import { useProfileStore } from './profile'

export const useTrackingStore = defineStore('tracking', () => {
  const profile = useProfileStore()

  const pid = () => profile.profilAktif

  // Cadangan reaktif checklist: key `${pid}:${tanggal}` -> { itemId: bool }.
  // Tampilan baca dari sini (bukan localStorage langsung) supaya klik langsung terlihat.
  const checklists = ref({})

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
  }

  function getRiwayatBB() {
    return get(pid(), 'riwayatBB', [])
  }

  function tambahBB(kg) {
    const r = getRiwayatBB()
    const tgl = new Date().toISOString().slice(0, 10)
    const idx = r.findIndex(e => e.tanggal === tgl)
    if (idx >= 0) {
      r[idx].kg = kg
    } else {
      r.push({ tanggal: tgl, kg })
    }
    r.sort((a, b) => a.tanggal.localeCompare(b.tanggal))
    set(pid(), 'riwayatBB', r)
    return r
  }

  function getRiwayatUkuran() {
    return get(pid(), 'riwayatUkuran', [])
  }

  function tambahUkuran(entry) {
    const r = getRiwayatUkuran()
    const tgl = new Date().toISOString().slice(0, 10)
    entry.tanggal = tgl
    const idx = r.findIndex(e => e.tanggal === tgl)
    if (idx >= 0) {
      r[idx] = { ...r[idx], ...entry }
    } else {
      r.push(entry)
    }
    r.sort((a, b) => a.tanggal.localeCompare(b.tanggal))
    set(pid(), 'riwayatUkuran', r)
    return r
  }

  return {
    ensureChecklist,
    getChecklist,
    setChecklistItem,
    getRiwayatBB,
    tambahBB,
    getRiwayatUkuran,
    tambahUkuran,
  }
})
