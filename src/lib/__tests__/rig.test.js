import { describe, it, expect } from 'vitest'
import { hitungPose, rantaiTungkai, Y_AKAR_NETRAL, KANVAS } from '../rig.js'
import { validasiIsi } from '../../../scripts/validasi-anim.mjs'

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

describe('kontak bahu-kaki (glute bridge)', () => {
  // Titik tambat = titik terendah antara bahu dan ankle kaki dekat; setelah
  // penambatan titik itu menyentuh lantai: KANVAS.lantai - STROKE.telapak/2.
  const LANTAI_KONTAK = KANVAS.lantai - 7 / 2

  it('t0 berbaring penuh (semua 0): bahu == titik tambat, panggul di lantai', () => {
    const p = hitungPose(kf({ akar: { x: 0, rotasi: -90 } }), { kontak: 'bahu-kaki' })
    expect(p.bahu.y).toBeCloseTo(LANTAI_KONTAK, 1)
    expect(p.ankle.dekat.y).toBeCloseTo(LANTAI_KONTAK, 1)
    expect(p.akar.y).toBeCloseTo(LANTAI_KONTAK, 1)
  })

  it('puncak bridge: bahu tetap == titik tambat, panggul naik >= 20 satuan', () => {
    const t0 = hitungPose(kf({ akar: { x: 0, rotasi: -90 } }), { kontak: 'bahu-kaki' })
    const puncak = hitungPose(
      kf({
        akar: { x: 0, rotasi: -90 },
        torsoCondong: -32, leher: 3,
        pinggulDekat: 20, lututDekat: 90,
        pinggulJauh: 22, lututJauh: 92,
      }),
      { kontak: 'bahu-kaki' },
    )
    expect(puncak.bahu.y).toBeCloseTo(LANTAI_KONTAK, 1)
    expect(puncak.akar.y).toBeLessThanOrEqual(t0.akar.y - 20)
  })

  it('pose berdiri (kontak kaki) tidak terpengaruh mode bahu-kaki: rentangnya tetap', () => {
    const p = hitungPose(kf({ pinggulDekat: 90, lututDekat: 90, pinggulJauh: 90, lututJauh: 90 }), { kontak: 'kaki' })
    expect(p.akar.y).toBeCloseTo(166.5, 1)
    expect(p.ankle.dekat.y).toBeCloseTo(204.5, 1)
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

describe('kontak "merangkak" & aturan pusat massa', () => {
  // Pose merangkak/plank telungkup (rotasi 90); pose berdiri tegak (rotasi 0).
  const aset = (over = {}, kfOver = {}) => {
    const kontak = over.kontak ?? 'merangkak'
    const rotasi = kontak === 'merangkak' || kontak === 'tangan-kaki' ? 90 : 0
    const akar = { x: 0, rotasi }
    return JSON.stringify({
      id: 'cat-cow', nama: 'Uji', tampilan: 'samping',
      durasiMs: 4000, putar: 'pingpong', kontak: 'merangkak',
      keyframes: [
        { ...kf({}), akar, t: 0 },
        { ...kf({}), akar, t: 0.4 },
        { ...kf({}), akar, t: 0.7 },
        { ...kf(kfOver), akar, t: 1 },
      ],
      ...over,
    })
  }

  const jalankan = (isi) => validasiIsi(isi, isi.length)

  it('T1 merangkak menambat identik dengan tangan-kaki', () => {
    const pose = kf({ pinggulDekat: 90, lututDekat: 90, akar: { x: 0, rotasi: 90 } })
    const a = hitungPose(pose, { kontak: 'merangkak' })
    const b = hitungPose(pose, { kontak: 'tangan-kaki' })
    expect(a.akar.y).toBeCloseTo(b.akar.y, 6)
  })

  it('T2 merangkak boleh torsoCondong -22', () => {
    expect(jalankan(aset({}, { torsoCondong: -22 })).kesalahan).toEqual([])
  })

  it('T3 tangan-kaki (plank) TETAP menolak torsoCondong -22', () => {
    const r = jalankan(aset({ kontak: 'tangan-kaki' }, { torsoCondong: -22 }))
    expect(r.kesalahan.join(' ')).toMatch(/torsoCondong -22 di luar rentang/)
  })

  it('T4 pola march lolos: satu lutut naik, kaki lain menapak tegak', () => {
    const isi = aset(
      { kontak: 'kaki', id: 'march' },
      { pinggulDekat: 92, lututDekat: 90, pinggulJauh: 3, lututJauh: 2, torsoCondong: 2 },
    )
    expect(jalankan(isi).kesalahan).toEqual([])
  })

  it('T5 pola squat ditolak: dua kaki menekuk tanpa torso condong', () => {
    const isi = aset(
      { kontak: 'kaki', id: 'goblet-squat' },
      { pinggulDekat: 90, lututDekat: 90, pinggulJauh: 90, lututJauh: 90, torsoCondong: 2 },
    )
    expect(jalankan(isi).kesalahan.join(' ')).toMatch(/pusat massa jatuh/)
  })

  it('T6 single-leg RDL ditolak: kaki belakang MENJULUR, bukan menapak', () => {
    const isi = aset(
      { kontak: 'kaki', id: 'rdl' },
      { pinggulDekat: 70, lututDekat: 20, pinggulJauh: -25, lututJauh: 5, torsoCondong: 2 },
    )
    expect(jalankan(isi).kesalahan.join(' ')).toMatch(/pusat massa jatuh/)
  })

  it('T7 pagar sudut dalam masih hidup tanpa izinDalam', () => {
    const isi = aset({ kontak: 'kaki' }, { pinggulDekat: 130, lututDekat: 90, torsoCondong: 60 })
    expect(jalankan(isi).kesalahan.join(' ')).toMatch(/butuh izinDalam/)
  })
})
