// Geometri rig figur 2D: panjang tulang, forward kinematics, penambatan lantai.
// Semua fungsi murni — bisa diuji tanpa DOM. Lihat spec peraga-gerak §3–§6.

export const TULANG = {
  torso: 52,
  leher: 20,
  kepalaR: 15,
  hidung: 6,
  lenganAtas: 28,
  lenganBawah: 26,
  paha: 38,
  kering: 38,
  telapak: 18,
  bahuDariLeher: 8,
}

export const STROKE = {
  torso: 13,
  leher: 7,
  hidung: 4,
  lengan: 8,
  tungkai: 10,
  telapak: 7,
}

export const KANVAS = { w: 200, h: 220, lantai: 208, xTengah: 100 }

// Turunan, bukan angka lepas: naik/turunnya panjang tulang mengubah ini otomatis.
export const Y_AKAR_NETRAL =
  KANVAS.lantai - (TULANG.paha + TULANG.kering + STROKE.telapak / 2) // = 128.5

const rad = (deg) => (deg * Math.PI) / 180

// Rotasi 2D di sekitar (0,0). Sudut derajat; Y menurun (konvensi SVG).
function putar(p, derajat) {
  const t = rad(derajat)
  const c = Math.cos(t)
  const s = Math.sin(t)
  return { x: c * p.x - s * p.y, y: s * p.x + c * p.y }
}

// Offsets relatif akar untuk satu tungkai. Sudut diukur dari arah vertikal-BAWAH,
// positif = berputar ke depan (kanan). lutut positif = menekuk (kering ke belakang).
export function rantaiTungkai(pinggul, lutut) {
  const lx = Math.sin(rad(pinggul)) * TULANG.paha
  const ly = Math.cos(rad(pinggul)) * TULANG.paha
  const keringAbs = pinggul - lutut
  const ax = lx + Math.sin(rad(keringAbs)) * TULANG.kering
  const ay = ly + Math.cos(rad(keringAbs)) * TULANG.kering
  return { lutut: { x: lx, y: ly }, ankle: { x: ax, y: ay }, keringAbs }
}

// Sudut telapak dihitung, TIDAK diambil dari masukan (spec §6): telapak selalu
// mendatar sejajar lantai, terlepas sudut kering. Nilai relatif terhadap arah
// kering; bila `tambat: 'jari'` (calf-raise) telapak mengikuti kering.
function sudutTelapakUntuk(keringAbs, tambat) {
  return tambat === 'jari' ? 0 : -keringAbs
}

// Forward kinematics + penambatan lantai untuk satu keyframe.
// `kf`: 10 sendi + `akar`. `opts.kontak`: kaki|punggung|sisi|tangan-kaki|bahu-kaki|bebas.
// `opts.tambat`: 'jari' opsional untuk jinjit.
// `kf.akar.y`, `kf.kakiDekat`, `kf.kakiJauh` DIPAKSA DIABAIKAN (spec §4).
export function hitungPose(kf, opts = {}) {
  const kontak = opts.kontak ?? 'bebas'
  const tambat = opts.tambat
  const akarIn = kf.akar ?? {}
  const akarX = KANVAS.xTengah + (akarIn.x ?? 0)
  const rotasi = akarIn.rotasi ?? 0

  const toDeg = (v) => v ?? 0

  // 1) Rantai relatif akar (akar di 0,0, tanpa rotasi global).
  const tk = rantaiTungkai(toDeg(kf.pinggulDekat), toDeg(kf.lututDekat))
  const tj = rantaiTungkai(toDeg(kf.pinggulJauh), toDeg(kf.lututJauh))

  const torsoCondong = toDeg(kf.torsoCondong)
  const arahTorso = { x: Math.sin(rad(torsoCondong)), y: -Math.cos(rad(torsoCondong)) }
  const leherBawah = { x: arahTorso.x * TULANG.torso, y: arahTorso.y * TULANG.torso }

  const leher = toDeg(kf.leher)
  const arahLeher = { x: Math.sin(rad(leher)), y: -Math.cos(rad(leher)) }
  const kepalaPusat = {
    x: leherBawah.x + arahLeher.x * TULANG.leher,
    y: leherBawah.y + arahLeher.y * TULANG.leher,
  }

  // Bahu 8 satuan di bawah leherBawah (arah kebalikan arah torso).
  const bahu = {
    x: leherBawah.x - arahTorso.x * TULANG.bahuDariLeher,
    y: leherBawah.y - arahTorso.y * TULANG.bahuDariLeher,
  }

  const lengan = (bahuAng, sikuAng) => {
    const siku = {
      x: bahu.x + Math.sin(rad(bahuAng)) * TULANG.lenganAtas,
      y: bahu.y + Math.cos(rad(bahuAng)) * TULANG.lenganAtas,
    }
    const lenganBawahAbs = bahuAng - sikuAng // pola sama dengan tungkai
    const pergelangan = {
      x: siku.x + Math.sin(rad(lenganBawahAbs)) * TULANG.lenganBawah,
      y: siku.y + Math.cos(rad(lenganBawahAbs)) * TULANG.lenganBawah,
    }
    return { siku, pergelangan }
  }

  const lenganDekat = lengan(toDeg(kf.bahuDekat), toDeg(kf.sikuDekat))
  const lenganJauh = lengan(toDeg(kf.bahuJauh), toDeg(kf.sikuJauh))

  // Telapak: mendatar sejajar lantai. offset = (cos total, -sin total) karena
  // total 0 = arah X positif (mendatar ke kanan di netral).
  const telapakPoin = (ankle, keringAbs) => {
    const sudutTelapak = sudutTelapakUntuk(keringAbs, tambat)
    const total = keringAbs + sudutTelapak
    const ujung = {
      x: ankle.x + Math.cos(rad(total)) * TULANG.telapak,
      y: ankle.y - Math.sin(rad(total)) * TULANG.telapak,
    }
    return { ujung, sudutTelapak }
  }

  const telapakDekat = telapakPoin(tk.ankle, tk.keringAbs)
  const telapakJauh = telapakPoin(tj.ankle, tj.keringAbs)

  // Hidung: penanda arah hadap, dari tepi kepala. Mengikuti miringnya leher:
  // leher positif (dagu menunduk) → hidung turun. Rotasi akar ikut diterapkan
  // di langkah 2 sehingga saat telentang hidung menunjuk ke atas.
  const arahHidung = { x: Math.cos(rad(leher)), y: Math.sin(rad(leher)) }
  const hidungUjung = {
    x: kepalaPusat.x + arahHidung.x * (TULANG.kepalaR + TULANG.hidung),
    y: kepalaPusat.y + arahHidung.y * (TULANG.kepalaR + TULANG.hidung),
  }

  // 2) Rotasi global akar di sekitar akar — SEBELUM penambatan (spec §6).
  const putarSemua = (titik) => {
    const out = {}
    for (const [nama, p] of Object.entries(titik)) {
      out[nama] = { x: p.x, y: p.y }
      if (rotasi !== 0) {
        const q = putar(p, rotasi)
        out[nama] = q
      }
    }
    return out
  }

  const rantai = putarSemua({
    leherBawah,
    kepalaPusat,
    bahu,
    'siku.dekat': lenganDekat.siku,
    'siku.jauh': lenganJauh.siku,
    'pergelanganTangan.dekat': lenganDekat.pergelangan,
    'pergelanganTangan.jauh': lenganJauh.pergelangan,
    'lutut.dekat': tk.lutut,
    'lutut.jauh': tj.lutut,
    'ankle.dekat': tk.ankle,
    'ankle.jauh': tj.ankle,
    'ujungJari.dekat': telapakDekat.ujung,
    'ujungJari.jauh': telapakJauh.ujung,
    hidungUjung,
  })

  // 3) Titik tambat menurut kontak.
  const yTerendah = (...pts) => Math.max(...pts.map((p) => p.y))
  let yTambat = null
  let offsetKontak = 0
  if (kontak === 'kaki') {
    yTambat = tambat === 'jari'
      ? yTerendah(rantai['ujungJari.dekat'], rantai['ujungJari.jauh'])
      : yTerendah(rantai['ankle.dekat'], rantai['ankle.jauh'])
    offsetKontak = STROKE.telapak / 2
  } else if (kontak === 'punggung' || kontak === 'sisi') {
    yTambat = rantai.leherBawah.y / 2 // titik tengah torso
    offsetKontak = STROKE.torso / 2
  } else if (kontak === 'tangan-kaki') {
    yTambat = yTerendah(
      rantai['pergelanganTangan.dekat'], rantai['pergelanganTangan.jauh'],
      rantai['ankle.dekat'], rantai['ankle.jauh'],
    )
    offsetKontak = STROKE.telapak / 2
  } else if (kontak === 'bahu-kaki') {
    // Glute bridge dkk: figur berbaring, bahu di satu ujung, tumit di ujung
    // lain — BUKAN tengah torso. Titik tambat = titik terendah antara bahu
    // dan ankle kaki dekat (koordinat relatif akar, jadi bahu.y − akar.y
    // = rantai.bahu.y). `yAkar` dibuat agar titik terendah menyentuh lantai.
    yTambat = Math.max(rantai.bahu.y, rantai['ankle.dekat'].y)
    offsetKontak = STROKE.telapak / 2
  }

  // 4–5) yAkar final lalu gambar ulang seluruh rantai dari sana.
  const yAkar = kontak === 'bebas' || yTambat === null
    ? Y_AKAR_NETRAL
    : KANVAS.lantai - (yTambat - 0) - offsetKontak

  const geser = (p) => ({ x: p.x + akarX, y: p.y + yAkar })
  const posisi = {
    akar: { x: akarX, y: yAkar, rotasi },
    lutut: { dekat: geser(rantai['lutut.dekat']), jauh: geser(rantai['lutut.jauh']) },
    ankle: { dekat: geser(rantai['ankle.dekat']), jauh: geser(rantai['ankle.jauh']) },
    ujungJari: { dekat: geser(rantai['ujungJari.dekat']), jauh: geser(rantai['ujungJari.jauh']) },
    bahu: geser(rantai.bahu),
    siku: { dekat: geser(rantai['siku.dekat']), jauh: geser(rantai['siku.jauh']) },
    pergelanganTangan: {
      dekat: geser(rantai['pergelanganTangan.dekat']),
      jauh: geser(rantai['pergelanganTangan.jauh']),
    },
    leherBawah: geser(rantai.leherBawah),
    kepalaPusat: geser(rantai.kepalaPusat),
    hidungUjung: geser(rantai.hidungUjung),
    sudutTelapak: { dekat: telapakDekat.sudutTelapak, jauh: telapakJauh.sudutTelapak },
  }

  return posisi
}
