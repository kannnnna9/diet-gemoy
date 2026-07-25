import { describe, it, expect } from 'vitest'
import { getSlotHarian } from '../program.js'

describe('getSlotHarian', () => {
  it('mengembalikan array slot untuk paypey', () => {
    const slots = getSlotHarian('paypey')
    expect(Array.isArray(slots)).toBe(true)
    expect(slots.some(s => s.id === 'ganjel')).toBe(true)
    const ganjel = slots.find(s => s.id === 'ganjel')
    expect(ganjel.jam).toMatch(/^\d{2}:\d{2}$/)
    expect(['harian', 'harian-kerja', 'harian-libur']).toContain(ganjel.ulang)
  })
  it('profil tak dikenal → array kosong', () => {
    expect(getSlotHarian('xxx')).toEqual([])
  })
  it('ffazeyall punya slot if-mulai 11:00', () => {
    const slots = getSlotHarian('ffazeyall')
    const ifMulai = slots.find(s => s.id === 'if-mulai')
    expect(ifMulai).toBeTruthy()
    expect(ifMulai.jam).toBe('11:00')
  })
})
