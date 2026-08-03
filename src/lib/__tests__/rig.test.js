import { describe, it, expect } from 'vitest'
import { hitungPose, rantaiTungkai, Y_AKAR_NETRAL, KANVAS } from '../rig.js'

// Keyframe netral: semua sendi 0, akar di tengah.
// Bila tungkai ditekuk, KEDUA sisi ditekuk sama — titik tambat kaki = ankle
// terendah, jadi kaki yang tetap lurus akan menahan figur di lantai.
const netral = {
  akar: { x: 0, rotasi: 0 },
  torsoCondong: 0, leher: 0,
  bahuDekat: 0, sikuDekat: 0,
  bahuJauh: 0, sikuJauh: 0,
  pinggulDekat: 0, lututDekat: 0,
  pinggulJauh: 0, lututJauh: 0,
}

const kf = (over) => ({ ...netral, ...over })

// PRNG deterministik (LCG) supaya test invarian stabil antar-lari.
function buatAcak(seed) {
  let s = seed
  return () => {
    s = (s * 1103515245 + 12345) % 2147483648
    return s / 2147483648
  }
}

describe('rantaiTungkai', () => {
  it('netral: lutut di bawah akar, ankle 38 lagi di bawahnya', () => {
    const r = rantaiTungkai(0, 0)
    expect(r.lutut.x).toBeCloseTo(0, 6)
    expect(r.lutut.y).toBeCloseTo(38, 6)
    expect(r.ankle.x).toBeCloseTo(0, 6)
    expect(r.ankle.y).toBeCloseTo(76, 6)
  })

  it('pinggul 90: paha mendatar ke kanan', () => {
    const r = rantaiTungkai(90, 0)
    expect(r.lutut.x).toBeCloseTo(38, 6)
    expect(r.lutut.y).toBeCloseTo(0, 6)
    expect(r.ankle.x).toBeCloseTo(76, 6)
    expect(r.ankle.y).toBeCloseTo(0, 6)
  })

  it('pinggul 90 + lutut 90: kering tepat vertikal', () => {
    const r = rantaiTungkai(90, 90)
    expect(r.ankle.x).toBeCloseTo(38, 6)
    expect(r.ankle.y).toBeCloseTo(38, 6)
  })
})

describe('penambatan lantai — kontak kaki', () => {
  it('netral: yAkar 128.5, yLutut 166.5, yAnkle 204.5', () => {
    const p = hitungPose(netral, { kontak: 'kaki' })
    expect(p.akar.y).toBeCloseTo(128.5, 1)
    expect(p.lutut.dekat.y).toBeCloseTo(166.5, 1)
    expect(p.ankle.dekat.y).toBeCloseTo(204.5, 1)
  })

  it('pinggul 90 + lutut 90: yAkar 166.5 TEPAT sejajar yLutut, ankle tetap di lantai', () => {
    const p = hitungPose(
      kf({ pinggulDekat: 90, lututDekat: 90, pinggulJauh: 90, lututJauh: 90 }),
      { kontak: 'kaki' },
    )
    expect(p.akar.y).toBeCloseTo(166.5, 1)
    expect(p.lutut.dekat.y).toBeCloseTo(166.5, 1)
    expect(p.ankle.dekat.y).toBeCloseTo(204.5, 1)
    expect(Math.abs(p.akar.y - p.lutut.dekat.y)).toBeLessThan(0.001)
  })

  it('pinggul 42 + lutut 28: yAkar 139.4', () => {
    const p = hitungPose(
      kf({ pinggulDekat: 42, lututDekat: 28, pinggulJauh: 42, lututJauh: 28 }),
      { kontak: 'kaki' },
    )
    expect(p.akar.y).toBeCloseTo(139.4, 1)
    expect(p.ankle.dekat.y).toBeCloseTo(204.5, 1)
  })

  it('pinggul 93 + lutut 88: yAkar 168.6', () => {
    const p = hitungPose(
      kf({ pinggulDekat: 93, lututDekat: 88, pinggulJauh: 93, lututJauh: 88 }),
      { kontak: 'kaki' },
    )
    expect(p.akar.y).toBeCloseTo(168.6, 1)
    expect(p.ankle.dekat.y).toBeCloseTo(204.5, 1)
  })

  it('invarian: 20 kombinasi acak pinggul 0-95 & lutut 0-95 — ankle SELALU 204.5', () => {
    const acak = buatAcak(42)
    for (let i = 0; i < 20; i++) {
      const pg = Math.round(acak() * 95)
      const lt = Math.round(acak() * 95)
      const p = hitungPose(
        kf({ pinggulDekat: pg, lututDekat: lt, pinggulJauh: pg, lututJauh: lt }),
        { kontak: 'kaki' },
      )
      expect(p.ankle.dekat.y, `pinggul ${pg} lutut ${lt}`).toBeCloseTo(204.5, 1)
    }
  })

  it('tambat jari: titik tambat pindah ke ujungJari, telapak ikut kering', () => {
    const p = hitungPose(kf({ pinggulDekat: 90, lututDekat: 90 }), { kontak: 'kaki', tambat: 'jari' })
    // kering vertikal (keringAbs 0) → telapak tetap mendatar; ujung jari di y ankle.
    expect(p.ujungJari.dekat.y).toBeCloseTo(p.ankle.dekat.y, 6)
    expect(p.ujungJari.dekat.x).toBeGreaterThan(p.ankle.dekat.x)
    expect(p.sudutTelapak.dekat).toBe(0)
  })
})

describe('kontak punggung / bebas', () => {
  it('telentang (rotasi -90) kontak punggung: yAkar 201.5 — tepi bawah torso di lantai', () => {
    const p = hitungPose(kf({ akar: { x: 0, rotasi: -90 } }), { kontak: 'punggung' })
    expect(p.akar.y).toBeCloseTo(201.5, 1)
    expect(p.kepalaPusat.x).toBeLessThan(p.akar.x) // kepala di KIRI
  })

  it('kontak bebas: akar dipatok di Y_AKAR_NETRAL', () => {
    const p = hitungPose(kf({ pinggulDekat: 90, lututDekat: 90 }), { kontak: 'bebas' })
    expect(p.akar.y).toBeCloseTo(Y_AKAR_NETRAL, 6)
    expect(p.ankle.dekat.y).toBeCloseTo(Y_AKAR_NETRAL + 38, 6)
  })

  it('kontak sisi sama dengan punggung (penambatan titik tengah torso)', () => {
    const a = hitungPose(kf({ akar: { x: 0, rotasi: -90 } }), { kontak: 'punggung' })
    const b = hitungPose(kf({ akar: { x: 0, rotasi: -90 } }), { kontak: 'sisi' })
    expect(b.akar.y).toBeCloseTo(a.akar.y, 6)
  })
})

describe('kepala & stabilitas', () => {
  it('netral: yKepalaPusat 56.5 dan di atas akar (tak jungkir balik)', () => {
    const p = hitungPose(netral, { kontak: 'kaki' })
    expect(p.kepalaPusat.y).toBeCloseTo(56.5, 1)
    expect(p.kepalaPusat.y).toBeLessThan(p.akar.y)
  })

  it('akar.y & kaki* pada masukan DIPAKSA DIABAIKAN — pose identik', () => {
    const bersih = hitungPose(kf({ pinggulDekat: 66, lututDekat: 52 }), { kontak: 'kaki' })
    const kotor = hitungPose(
      kf({ pinggulDekat: 66, lututDekat: 52, akar: { x: 0, rotasi: 0, y: 999 }, kakiDekat: 45, kakiJauh: -30 }),
      { kontak: 'kaki' },
    )
    expect(kotor).toEqual(bersih)
  })

  it('akar.x menggeser figur tanpa mengubah penambatan', () => {
    const p = hitungPose(kf({ akar: { x: -18, rotasi: 0 } }), { kontak: 'kaki' })
    expect(p.akar.x).toBeCloseTo(KANVAS.xTengah - 18, 6)
    expect(p.ankle.dekat.y).toBeCloseTo(204.5, 1)
  })

  it('torso condong: bahu tetap pada torso, kepala tetap di atas akar', () => {
    const p = hitungPose(kf({ torsoCondong: 40 }), { kontak: 'kaki' })
    expect(p.kepalaPusat.y).toBeLessThan(p.akar.y)
    expect(p.bahu.x).toBeGreaterThan(p.akar.x)
  })
})
