// Interpolasi keyframe animasi rig. Fungsi murni — bisa diuji tanpa DOM.
// Lihat spec peraga-gerak §7: interpolasi linear per sendi dengan easeInOutSine.

export const easeInOutSine = (t) => -(Math.cos(Math.PI * t) - 1) / 2

// Daftar 10 sendi yang diinterpolasi (sama dengan kontrak keyframe spec §5).
export const SENDI = [
  'torsoCondong', 'leher',
  'bahuDekat', 'sikuDekat', 'bahuJauh', 'sikuJauh',
  'pinggulDekat', 'lututDekat', 'pinggulJauh', 'lututJauh',
]

// pingpong = maju lalu mundur → durasi efektif dua kali lipat.
export function durasiEfektif(aset) {
  return aset.putar === 'pingpong' ? aset.durasiMs * 2 : aset.durasiMs
}

// Keyframe hasil interpolasi pada tNorm 0..1, BELUM dipenambatan.
// pingpong: tNorm dipetakan ke segitiga supaya maju lalu mundur otomatis.
export function poseSaat(aset, tNorm) {
  const kfs = aset.keyframes
  const tTerkunci = Math.min(1, Math.max(0, tNorm))
  const t = aset.putar === 'pingpong'
    ? (tTerkunci < 0.5 ? tTerkunci * 2 : (1 - tTerkunci) * 2)
    : tTerkunci

  // Cari dua keyframe pengapit.
  let a = kfs[0]
  let b = kfs[kfs.length - 1]
  for (let i = 0; i < kfs.length - 1; i++) {
    if (t >= kfs[i].t && t <= kfs[i + 1].t) {
      a = kfs[i]
      b = kfs[i + 1]
      break
    }
  }
  const rentang = b.t - a.t
  const u = easeInOutSine(rentang === 0 ? 0 : (t - a.t) / rentang)
  const lerp = (x, y) => x + (y - x) * u

  const out = {
    t,
    akar: {
      x: lerp(a.akar?.x ?? 0, b.akar?.x ?? 0),
      rotasi: lerp(a.akar?.rotasi ?? 0, b.akar?.rotasi ?? 0),
    },
  }
  for (const sk of SENDI) {
    out[sk] = lerp(a[sk] ?? 0, b[sk] ?? 0)
  }
  return out
}
