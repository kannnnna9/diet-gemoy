import { describe, it, expect } from 'vitest'
import { perluKeBeranda } from '../authNav.js'

describe('perluKeBeranda', () => {
  it('true saat sudah punya profil tapi masih tersangkut di login', () => {
    expect(perluKeBeranda('paypey', 'login')).toBe(true)
    expect(perluKeBeranda('ffazeyall', 'login')).toBe(true)
  })
  it('false saat belum punya profil (mis. email ditolak)', () => {
    expect(perluKeBeranda(null, 'login')).toBe(false)
    expect(perluKeBeranda(undefined, 'login')).toBe(false)
  })
  it('false saat sudah berada di halaman lain', () => {
    expect(perluKeBeranda('paypey', 'beranda')).toBe(false)
    expect(perluKeBeranda('paypey', 'program')).toBe(false)
  })
})
