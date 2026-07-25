import { describe, it, expect } from 'vitest'
import { slotSekarang } from '../slotAktif.js'

const slots = [
  { id: 'ganjel', label: 'Ganjel pagi', jam: '04:50', ulang: 'harian-kerja', catatan: 'Sebelum aktivitas pagi' },
  { id: 'if', label: 'Mulai IF', jam: '11:00', ulang: 'harian', catatan: 'Buka window makan' },
  { id: 'snack', label: 'Snack sore', jam: '16:00', ulang: 'harian', catatan: 'Wajib' },
  { id: 'tidur', label: 'Tidur', jam: '22:30', ulang: 'harian', catatan: '' },
]

describe('slotSekarang', () => {
  it('memilih slot terdekat yang sudah lewat (<=90 mnt lewat)', () => {
    // 11:30 → IF baru 30 mnt lewat (terdekat), ganjel sudah jauh lewat 395 mnt (>90) → tidak ikut
    expect(slotSekarang(slots, 11 * 60 + 30).id).toBe('if')
  })
  it('sebelum slot pertama hari → null', () => {
    expect(slotSekarang(slots, 3 * 60)).toBe(null) // 03:00
  })
  it('jauh setelah semua slot (>90 mnt) → null', () => {
    // tidurnya 22:30; 01:00 berikutnya = 150 mnt lewat → lewat ambang 90
    expect(slotSekarang(slots, 1 * 60)).toBe(null)
  })
  it('jam tepat saat slot mulai → slot itu', () => {
    expect(slotSekarang(slots, 11 * 60).id).toBe('if')
  })
  it('90 menit pas lewat slot terakhir → masih pilih', () => {
    // tidur 22:30, menit = 00:00 (23:59?) — mari pakai 23:59 (tidur 22:30 → 89 mnt lewat) → masih tidur
    expect(slotSekarang(slots, 23 * 60 + 59).id).toBe('tidur')
  })
})
