import { describe, it, expect } from 'vitest'
import { pilihLww } from '../sync.js'

describe('pilihLww', () => {
  it('cloud lebih baru → pakai cloud', () => {
    const lokal = { payload: { a: 1 }, updated_at: '2026-07-01T00:00:00Z' }
    const cloud = { payload: { a: 2 }, updated_at: '2026-07-02T00:00:00Z' }
    expect(pilihLww(lokal, cloud).payload.a).toBe(2)
  })
  it('lokal lebih baru → pakai lokal', () => {
    const lokal = { payload: { a: 9 }, updated_at: '2026-07-03T00:00:00Z' }
    const cloud = { payload: { a: 2 }, updated_at: '2026-07-02T00:00:00Z' }
    expect(pilihLww(lokal, cloud).payload.a).toBe(9)
  })
  it('salah satu null → pakai yang ada', () => {
    const cloud = { payload: { a: 2 }, updated_at: '2026-07-02T00:00:00Z' }
    expect(pilihLww(null, cloud)).toBe(cloud)
    expect(pilihLww(cloud, null)).toBe(cloud)
  })
})
