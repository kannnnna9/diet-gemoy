import { describe, it, expect, afterAll } from 'vitest'
import { writeFileSync, mkdirSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { validasiSemua, validasiIsi } from '../../../scripts/validasi-anim.mjs'

const AKAR = join(fileURLToPath(new URL('.', import.meta.url)), '../../..')
const DIR = join(AKAR, 'public', 'gerakan-anim')
const FILE_CACAT = join(DIR, '__cacat-uji.json')

const kfPenuh = (t, over = {}) => ({
  t,
  akar: { x: 0, rotasi: 0 },
  torsoCondong: 0, leher: 0,
  bahuDekat: 0, sikuDekat: 0,
  bahuJauh: 0, sikuJauh: 0,
  pinggulDekat: 0, lututDekat: 0,
  pinggulJauh: 0, lututJauh: 0,
  ...over,
})

afterAll(() => {
  rmSync(FILE_CACAT, { force: true })
})

describe('sapuan seluruh aset animasi', () => {
  it('semua file di public/gerakan-anim/ (selain index.json) LOLOS validator', () => {
    const hasil = validasiSemua()
    for (const h of hasil) {
      expect(h.ok, `${h.file}: ${h.kesalahan.join('; ')}`).toBe(true)
    }
  })
})

describe('validator menolak file cacat', () => {
  it('lututDekat 120 (deep squat tanpa izinDalam) → DITOLAK', () => {
    const aset = {
      id: 'squat-kursi',
      nama: 'Squat ke kursi',
      tampilan: 'samping',
      durasiMs: 4000,
      putar: 'pingpong',
      kontak: 'kaki',
      keyframes: [
        kfPenuh(0),
        kfPenuh(0.33, { torsoCondong: 20, pinggulDekat: 40, lututDekat: 30 }),
        kfPenuh(0.66, { torsoCondong: 40, pinggulDekat: 90, lututDekat: 80 }),
        kfPenuh(1, { torsoCondong: 45, pinggulDekat: 100, lututDekat: 120 }),
      ],
    }
    mkdirSync(DIR, { recursive: true })
    writeFileSync(FILE_CACAT, JSON.stringify(aset))
    const hasil = validasiSemua()
    const h = hasil.find((x) => x.file === '__cacat-uji.json')
    expect(h).toBeTruthy()
    expect(h.ok).toBe(false)
    expect(h.kesalahan.some((e) => e.includes('lututDekat 120'))).toBe(true)
    rmSync(FILE_CACAT, { force: true })
  })

  it('id tak dikenal → ditolak; id dikenal tapi keyframe rusak → ditolak', () => {
    const hasil = validasiIsi(JSON.stringify({ id: 'tak-ada-id', keyframes: [] }), 100)
    expect(hasil.ok).toBe(false)
    expect(hasil.kesalahan.join()).toContain('tak-ada-id')

    const rusak = validasiIsi(JSON.stringify({ id: 'squat-kursi', keyframes: [{ t: 0 }] }), 100)
    expect(rusak.ok).toBe(false)
    expect(rusak.kesalahan.some((e) => e.includes('tidak memuat sendi'))).toBe(true)
  })

  it('field usang akar.y/kaki* → PERINGATAN, bukan tolak', () => {
    const aset = {
      id: 'squat-kursi',
      keyframes: [
        kfPenuh(0, { akar: { x: 0, rotasi: 0, y: 999 }, kakiDekat: 45 }),
        kfPenuh(0.5, { pinggulDekat: 30, lututDekat: 20 }),
        kfPenuh(0.75, { pinggulDekat: 40, lututDekat: 30 }),
        kfPenuh(1, { pinggulDekat: 50, lututDekat: 40 }),
      ],
    }
    const hasil = validasiIsi(JSON.stringify(aset), 500)
    expect(hasil.ok).toBe(true)
    expect(hasil.peringatan.length).toBeGreaterThanOrEqual(2)
  })

  it('ukuran > 2 KB → ditolak', () => {
    const aset = {
      id: 'squat-kursi',
      keyframes: [kfPenuh(0), kfPenuh(0.4), kfPenuh(0.7), kfPenuh(1)],
    }
    const isi = JSON.stringify(aset)
    const hasil = validasiIsi(isi, 3000)
    expect(hasil.ok).toBe(false)
    expect(hasil.kesalahan.some((e) => e.includes('ukuran'))).toBe(true)
    // ukuran asli (< 2 KB) harus lolos (semua sendi 0, kontak default)
    expect(validasiIsi(isi, Buffer.byteLength(isi)).ok).toBe(true)
  })
})
