import { describe, it, expect } from 'vitest'
import { perluKeBeranda, perluKeLogin, tujuanSetelahLogin } from '../authNav.js'

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

describe('tujuanSetelahLogin', () => {
  const ruteDikenal = ['/beranda', '/program', '/progres', '/pengaturan', '/gerakan', '/catat', '/pasangan']

  it('redirect /progres → /progres', () => {
    expect(tujuanSetelahLogin('login', '/progres', ruteDikenal)).toBe('/progres')
  })

  it('redirect //evil → beranda', () => {
    expect(tujuanSetelahLogin('login', '//evil', ruteDikenal)).toEqual({ name: 'beranda' })
  })

  it('redirect http://x → beranda', () => {
    expect(tujuanSetelahLogin('login', 'http://x', ruteDikenal)).toEqual({ name: 'beranda' })
  })

  it('tanpa redirect → beranda', () => {
    expect(tujuanSetelahLogin('login', null, ruteDikenal)).toEqual({ name: 'beranda' })
    expect(tujuanSetelahLogin('login', undefined, ruteDikenal)).toEqual({ name: 'beranda' })
  })

  it('routeName bukan login → null', () => {
    expect(tujuanSetelahLogin('beranda', '/progres', ruteDikenal)).toBeNull()
    expect(tujuanSetelahLogin('program', null, ruteDikenal)).toBeNull()
  })

  it('redirect ke path tak dikenal → beranda', () => {
    expect(tujuanSetelahLogin('login', '/tidak-ada', ruteDikenal)).toEqual({ name: 'beranda' })
  })
})
