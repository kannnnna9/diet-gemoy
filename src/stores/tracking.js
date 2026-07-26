import { defineStore } from 'pinia'
import { ref } from 'vue'
import { get, set } from '../lib/storage'
import { useProfileStore } from './profile'
import { pilihLww, push } from '../lib/sync'

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
    const ts = new Date().toISOString()
    set(pid(), `checklist:${tanggal}:ts`, ts)
    push('checklist', tanggal, checklists.value[k])
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
    set(pid(), `bb:${tgl}:ts`, new Date().toISOString())
    push('bb', tgl, { kg })
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
    set(pid(), `ukuran:${tgl}:ts`, new Date().toISOString())
    push('ukuran', tgl, entry)
    return r
  }

  // Terima hasil pull dari cloud, rekonsiliasi LWW vs timestamp lokal, tulis balik ke ref & localStorage.
  function terimaDariCloud(jenis, tanggal, payload, updated_at) {
    const cloud = { payload, updated_at: updated_at || new Date().toISOString() }

    if (jenis === 'checklist') {
      const kunci = `checklist:${tanggal}`
      const kunciTs = `${kunci}:ts`
      const lokalRaw = get(pid(), kunci, null)
      const lokal = lokalRaw
        ? { payload: lokalRaw, updated_at: get(pid(), kunciTs, '1970-01-01T00:00:00Z') }
        : null
      const menang = pilihLww(lokal, cloud)
      checklists.value[keyFor(tanggal)] = menang.payload
      set(pid(), kunci, menang.payload)
      set(pid(), kunciTs, menang.updated_at)
      return
    }
    if (jenis === 'bb') {
      const kunciTs = `bb:${tanggal}:ts`
      const r = getRiwayatBB()
      const lokalEntry = r.find(e => e.tanggal === tanggal)
      const lokal = lokalEntry
        ? { payload: { kg: lokalEntry.kg }, updated_at: get(pid(), kunciTs, '1970-01-01T00:00:00Z') }
        : null
      const menang = pilihLww(lokal, cloud)
      const idx = r.findIndex(e => e.tanggal === tanggal)
      if (idx >= 0) r[idx].kg = menang.payload.kg
      else r.push({ tanggal, kg: menang.payload.kg })
      r.sort((a, b) => a.tanggal.localeCompare(b.tanggal))
      set(pid(), 'riwayatBB', r)
      set(pid(), kunciTs, menang.updated_at)
      return
    }
    if (jenis === 'ukuran') {
      const tgl = payload.tanggal || tanggal
      const kunciTs = `ukuran:${tgl}:ts`
      const r = getRiwayatUkuran()
      const lokalEntry = r.find(e => e.tanggal === tgl)
      const lokal = lokalEntry
        ? { payload: lokalEntry, updated_at: get(pid(), kunciTs, '1970-01-01T00:00:00Z') }
        : null
      const menang = pilihLww(lokal, cloud)
      const menangEntry = { ...menang.payload, tanggal: tgl }
      const idx = r.findIndex(e => e.tanggal === tgl)
      if (idx >= 0) r[idx] = { ...r[idx], ...menangEntry }
      else r.push(menangEntry)
      r.sort((a, b) => a.tanggal.localeCompare(b.tanggal))
      set(pid(), 'riwayatUkuran', r)
      set(pid(), kunciTs, menang.updated_at)
    }
  }

  return {
    ensureChecklist,
    getChecklist,
    setChecklistItem,
    getRiwayatBB,
    tambahBB,
    getRiwayatUkuran,
    tambahUkuran,
    terimaDariCloud,
  }
})
