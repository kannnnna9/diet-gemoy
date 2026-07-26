import { describe, it, expect } from 'vitest'
import { pilihTemaLogin } from '../loginTheme.js'

describe('pilihTemaLogin', () => {
  it('selalu mengembalikan paypey atau ffazeyall', () => {
    const valid = ['paypey', 'ffazeyall']
    for (let i = 0; i < 200; i++) {
      expect(valid).toContain(pilihTemaLogin())
    }
  })
  it('kedua nilai bisa muncul (tidak konstan) di 200 percobaan', () => {
    const hasil = new Set()
    for (let i = 0; i < 200; i++) hasil.add(pilihTemaLogin())
    expect(hasil.size).toBe(2)
  })
})
