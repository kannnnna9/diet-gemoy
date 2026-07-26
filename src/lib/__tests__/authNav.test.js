import { describe, it, expect } from 'vitest'
import { perluKeBeranda, perluKeLogin } from '../authNav.js'

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

describe('perluKeLogin', () => {
  it('true saat profil kosong (logout) tapi masih di halaman dalam app', () => {
    expect(perluKeLogin(null, 'pengaturan')).toBe(true)
    expect(perluKeLogin(undefined, 'beranda')).toBe(true)
  })
  it('false saat sudah di login', () => {
    expect(perluKeLogin(null, 'login')).toBe(false)
  })
  it('false saat masih punya profil', () => {
    expect(perluKeLogin('paypey', 'pengaturan')).toBe(false)
  })
})
