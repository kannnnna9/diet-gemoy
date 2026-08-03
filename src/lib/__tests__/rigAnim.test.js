import { describe, it, expect } from 'vitest'
import { poseSaat, durasiEfektif, easeInOutSine, SENDI } from '../rigAnim.js'

// Keyframe lengkap: seluruh 10 sendi + akar (kontrak spec §5).
function kf(t, over = {}) {
  return {
    t,
    akar: { x: 0, rotasi: 0 },
    torsoCondong: 0, leher: 0,
    bahuDekat: 0, sikuDekat: 0,
    bahuJauh: 0, sikuJauh: 0,
    pinggulDekat: 0, lututDekat: 0,
    pinggulJauh: 0, lututJauh: 0,
    ...over,
  }
}

// 4 keyframe: squat sederhana, sisi dekat menekuk, sisi jauh hampir diam.
const aset4 = {
  durasiMs: 4000,
  putar: 'pingpong',
  keyframes: [
    kf(0),
    kf(0.33, { torsoCondong: 16, pinggulDekat: 30, lututDekat: 20, akar: { x: -3, rotasi: 0 } }),
    kf(0.66, { torsoCondong: 30, pinggulDekat: 60, lututDekat: 45, akar: { x: -8, rotasi: 0 } }),
    kf(1, { torsoCondong: 42, pinggulDekat: 90, lututDekat: 90, akar: { x: -18, rotasi: 0 } }),
  ],
}

// 6 keyframe loop tertutup: keyframe terakhir = pertama (siklus selesai).
const aset6 = {
  durasiMs: 3000,
  putar: 'loop',
  keyframes: [
    kf(0, { pinggulDekat: 0 }),
    kf(0.2, { pinggulDekat: 30, pinggulJauh: 0 }),
    kf(0.4, { pinggulDekat: 0, pinggulJauh: 30 }),
    kf(0.6, { pinggulDekat: 30, pinggulJauh: 0 }),
    kf(0.8, { pinggulDekat: 0, pinggulJauh: 30 }),
    kf(1, { pinggulDekat: 0 }),
  ],
}

describe('easeInOutSine', () => {
  it('nol di tepi, setengah di tengah, simetris terhadap titik tengah', () => {
    expect(easeInOutSine(0)).toBeCloseTo(0, 6)
    expect(easeInOutSine(1)).toBeCloseTo(1, 6)
    expect(easeInOutSine(0.5)).toBeCloseTo(0.5, 6)
    expect(easeInOutSine(0.25) + easeInOutSine(0.75)).toBeCloseTo(1, 6)
  })
})

// Bandingkan isi pose (akar + semua sendi), tanpa field t yang boleh berbeda.
function samaPose(a, b) {
  expect(a.akar).toEqual(b.akar)
  for (const sk of SENDI) {
    expect(a[sk], sk).toBeCloseTo(b[sk], 9)
  }
}

describe('poseSaat — titik ujung', () => {
  it('tNorm 0 → identik keyframe pertama', () => {
    const p = poseSaat(aset4, 0)
    expect(p).toEqual(aset4.keyframes[0])
  })

  it('pingpong tNorm 0.5 → identik keyframe TERAKHIR (puncak segitiga)', () => {
    const p = poseSaat(aset4, 0.5)
    expect(p).toEqual(aset4.keyframes[aset4.keyframes.length - 1])
  })

  it('pingpong simetris: tNorm 0.25 dan 0.75 sama persis', () => {
    const a = poseSaat(aset4, 0.25)
    const b = poseSaat(aset4, 0.75)
    expect(a).toEqual(b)
  })

  it('loop tNorm 1 → identik keyframe pertama (siklus tertutup)', () => {
    samaPose(poseSaat(aset6, 1), aset6.keyframes[0])
  })

  it('tNorm di luar 0..1 dikunci ke tepi sebelum pemetaan pingpong', () => {
    samaPose(poseSaat(aset4, -1), aset4.keyframes[0])
    samaPose(poseSaat(aset4, 2), aset4.keyframes[0])
  })
})

describe('poseSaat — interpolasi antar keyframe', () => {
  it('hasil selalu di antara nilai dua keyframe pengapit (tak ada lonjakan)', () => {
    for (const tN of [0.05, 0.15, 0.3, 0.45, 0.55, 0.7, 0.85, 0.95]) {
      const p = poseSaat(aset4, tN)
      const t = aset4.putar === 'pingpong'
        ? (tN < 0.5 ? tN * 2 : (1 - tN) * 2)
        : tN
      let a = aset4.keyframes[0]
      let b = aset4.keyframes[aset4.keyframes.length - 1]
      for (let i = 0; i < aset4.keyframes.length - 1; i++) {
        if (t >= aset4.keyframes[i].t && t <= aset4.keyframes[i + 1].t) {
          a = aset4.keyframes[i]
          b = aset4.keyframes[i + 1]
          break
        }
      }
      for (const sk of SENDI) {
        const lo = Math.min(a[sk], b[sk])
        const hi = Math.max(a[sk], b[sk])
        expect(p[sk], `tNorm ${tN} sendi ${sk}`).toBeGreaterThanOrEqual(lo)
        expect(p[sk], `tNorm ${tN} sendi ${sk}`).toBeLessThanOrEqual(hi)
      }
      expect(p.akar.x).toBeGreaterThanOrEqual(Math.min(a.akar.x, b.akar.x))
      expect(p.akar.x).toBeLessThanOrEqual(Math.max(a.akar.x, b.akar.x))
    }
  })

  it('nilai tengah segmen = rata-rata dengan easing (monotonik)', () => {
    // 0.33..0.66 → pinggulDekat 30..60; di u=0.5 easing → 45 persis.
    const p = poseSaat({ ...aset4, putar: 'loop' }, 0.495)
    expect(p.pinggulDekat).toBeCloseTo(45, 6)
  })

  it('aset 4 keyframe dan 6 keyframe dua-duanya jalan', () => {
    expect(() => poseSaat(aset4, 0.3)).not.toThrow()
    expect(() => poseSaat(aset6, 0.3)).not.toThrow()
    expect(poseSaat(aset6, 0.3).pinggulDekat).not.toBeNaN()
  })
})

describe('durasiEfektif', () => {
  it('pingpong = durasiMs × 2, loop = durasiMs', () => {
    expect(durasiEfektif(aset4)).toBe(8000)
    expect(durasiEfektif(aset6)).toBe(3000)
  })
})
