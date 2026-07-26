import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useTrackingStore } from '../../stores/tracking.js'
import { useProfileStore } from '../../stores/profile.js'

vi.mock('../sync.js', () => ({
  pilihLww: vi.fn((lokal, cloud) => cloud || lokal),
  push: vi.fn(),
  initSync: vi.fn(),
  pullMine: vi.fn(),
  pullPartner: vi.fn(),
}))

const ls = {}
beforeEach(() => {
  Object.keys(ls).forEach(k => delete ls[k])
  ls['dg:_global:profilAktif'] = 'paypey'
  vi.resetAllMocks()
})

globalThis.localStorage = {
  getItem: (key) => ls[key] ?? null,
  setItem: (key, val) => { ls[key] = String(val) },
  removeItem: (key) => { delete ls[key] },
  clear: () => { Object.keys(ls).forEach(k => delete ls[k]) },
}

describe('tracking store — riwayat reaktif', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('tambahBB lalu getRiwayatBB langsung memuat entri baru tanpa reload', () => {
    const tracking = useTrackingStore()
    tracking.tambahBB(58)
    const r = tracking.getRiwayatBB()
    expect(r).toHaveLength(1)
    const today = new Date().toISOString().slice(0, 10)
    expect(r[0]).toEqual({ tanggal: today, kg: 58 })
  })

  it('tambahBB di hari sama timpa entri', () => {
    const tracking = useTrackingStore()
    tracking.tambahBB(58)
    tracking.tambahBB(57)
    const r = tracking.getRiwayatBB()
    expect(r).toHaveLength(1)
    expect(r[0].kg).toBe(57)
  })

  it('tambahUkuran lalu getRiwayatUkuran memuat entri', () => {
    const tracking = useTrackingStore()
    tracking.tambahUkuran({ pinggang: 72 })
    const r = tracking.getRiwayatUkuran()
    expect(r).toHaveLength(1)
    const today = new Date().toISOString().slice(0, 10)
    expect(r[0].pinggang).toBe(72)
    expect(r[0].tanggal).toBe(today)
  })

  it('ganti profil → getRiwayatBB mengembalikan data profil lain', () => {
    const profile = useProfileStore()
    const tracking = useTrackingStore()

    tracking.tambahBB(58)

    profile.gantiProfil('ffazeyall')
    expect(tracking.getRiwayatBB()).toEqual([])

    tracking.tambahBB(62)
    expect(tracking.getRiwayatBB()).toHaveLength(1)
    expect(tracking.getRiwayatBB()[0].kg).toBe(62)

    profile.gantiProfil('paypey')
    const r = tracking.getRiwayatBB()
    expect(r).toHaveLength(1)
    expect(r[0].kg).toBe(58)
  })
})
