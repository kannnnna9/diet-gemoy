// Validator aset animasi rig — pagar penolak angka ngawur dari LLM.
// Dipakai dua cara: CLI (`node scripts/validasi-anim.mjs`) dan fungsi
// (diimpor vitest lewat `src/lib/__tests__/asetAnim.test.js`).
// Aturan: spec peraga-gerak §9. Geometri memakai `src/lib/rig.js` yang SAMA
// dengan renderer — tidak ada duplikasi rumus.

import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { hitungPose } from '../src/lib/rig.js'

const AKAR = join(fileURLToPath(new URL('.', import.meta.url)), '..')
const DIR_ASET = join(AKAR, 'public', 'gerakan-anim')

// Rentang wajar spec §4 + toleransi ±15°. [min, max] inklusif.
export const RENTANG_SENDI = {
  torsoCondong: [-15, 90],
  leher: [-35, 45],
  bahuDekat: [-60, 195],
  bahuJauh: [-60, 195],
  sikuDekat: [-15, 165],
  sikuJauh: [-15, 165],
  pinggulDekat: [-45, 135],
  pinggulJauh: [-45, 135],
  lututDekat: [-15, 155],
  lututJauh: [-15, 155],
}

export const SENDI_NAMA = Object.keys(RENTANG_SENDI)

// Field usang yang TIDAK boleh ada di keyframe (spec §4) — peringatan, bukan tolak.
export const SENDI_TERLARANG = ['akar.y', 'kakiDekat', 'kakiJauh']

const MAKS_KEYFRAME = 6
const MIN_KEYFRAME = 4
const MAKS_UKURAN = 2048 // byte

function programId() {
  const data = JSON.parse(readFileSync(join(AKAR, 'content', 'program.json'), 'utf8'))
  return new Set((data.gerakan || []).map((g) => g.id))
}

// Uji fisik spec §9.7 untuk kontak "kaki", per keyframe.
function ujiFisik(kf, kesalahan) {
  const { pinggulDekat = 0, lututDekat = 0, torsoCondong = 0 } = kf
  if (lututDekat > pinggulDekat + 10) {
    kesalahan.push(`lutut melewati ujung jari (lututDekat ${lututDekat} > pinggulDekat ${pinggulDekat} + 10)`)
  }
  if (pinggulDekat > 30 && torsoCondong <= 10) {
    kesalahan.push(`pusat massa jatuh: pinggulDekat ${pinggulDekat} > 30 tapi torsoCondong ${torsoCondong} <= 10`)
  }
  const pose = hitungPose(kf, { kontak: 'kaki' })
  if (!(pose.kepalaPusat.y < pose.akar.y)) {
    kesalahan.push(`figur jungkir balik: yKepalaPusat ${pose.kepalaPusat.y.toFixed(1)} >= yAkar ${pose.akar.y.toFixed(1)}`)
  }
}

// Validasi satu file. `ukuran` = byte dari stat, dicek terpisah (bukan dari string).
export function validasiIsi(isi, ukuran) {
  const kesalahan = []
  const peringatan = []

  let data
  try {
    data = JSON.parse(isi)
  } catch {
    return { ok: false, kesalahan: ['JSON tidak valid'], peringatan: [] }
  }

  const ids = programId()
  if (!data.id || !ids.has(data.id)) {
    kesalahan.push(`id "${data.id}" tidak ada di program.json`)
  }

  if (!Array.isArray(data.keyframes)) {
    kesalahan.push('tidak punya array keyframes')
    return { ok: false, kesalahan, peringatan }
  }

  const { keyframes } = data
  if (keyframes.length < MIN_KEYFRAME || keyframes.length > MAKS_KEYFRAME) {
    kesalahan.push(`jumlah keyframe ${keyframes.length} di luar ${MIN_KEYFRAME}–${MAKS_KEYFRAME}`)
  }

  keyframes.forEach((kf, i) => {
    const s = `keyframe[${i}]`
    if (typeof kf.t !== 'number') {
      kesalahan.push(`${s}: t bukan angka`)
      return
    }
    if (i === 0 && kf.t !== 0) kesalahan.push(`${s}: t pertama harus 0`)
    if (i > 0 && kf.t <= keyframes[i - 1].t) {
      kesalahan.push(`${s}: t ${kf.t} tidak naik monoton (sebelumnya ${keyframes[i - 1].t})`)
    }
    if (!kf.akar || typeof kf.akar !== 'object') {
      kesalahan.push(`${s}: tidak memuat akar`)
    }
    for (const sk of SENDI_NAMA) {
      if (typeof kf[sk] !== 'number') {
        kesalahan.push(`${s}: tidak memuat sendi ${sk}`)
        continue
      }
      const [min, max] = RENTANG_SENDI[sk]
      if (kf[sk] < min || kf[sk] > max) {
        kesalahan.push(`${s}: ${sk} ${kf[sk]} di luar rentang ${min}..${max}`)
      }
    }
    for (const l of SENDI_TERLARANG) {
      const ada = l === 'akar.y' ? !!(kf.akar && kf.akar.y !== undefined) : kf[l] !== undefined
      if (ada) peringatan.push(`${s}: memuat field usang "${l}" (diabaikan renderer)`)
    }
    if (data.kontak === 'kaki') ujiFisik(kf, kesalahan)
  })

  if (ukuran > MAKS_UKURAN) {
    kesalahan.push(`ukuran ${ukuran} byte > ${MAKS_UKURAN}`)
  }

  return { ok: kesalahan.length === 0, kesalahan, peringatan }
}

// Selesaian seluruh aset (kecuali index.json). Hasil per file.
export function validasiSemua() {
  const hasil = []
  if (!existsSync(DIR_ASET)) return hasil
  for (const f of readdirSync(DIR_ASET).sort()) {
    if (f === 'index.json') continue
    const path = join(DIR_ASET, f)
    if (!statSync(path).isFile()) continue
    const isi = readFileSync(path, 'utf8')
    hasil.push({ file: f, ...validasiIsi(isi, Buffer.byteLength(isi)) })
  }
  return hasil
}

// CLI
if (import.meta.url === `file://${process.argv[1]}`) {
  const hasil = validasiSemua()
  let gagal = 0
  for (const h of hasil) {
    for (const p of h.peringatan) console.log(`⚠ ${h.file}: ${p}`)
    if (h.ok) {
      console.log(`✓ ${h.file}`)
    } else {
      gagal++
      console.log(`✗ ${h.file}`)
      for (const e of h.kesalahan) console.log(`    - ${e}`)
    }
  }
  if (hasil.length === 0) console.log('(tidak ada aset di public/gerakan-anim/)')
  if (gagal > 0) {
    console.error(`VALIDASI GAGAL: ${gagal} file ditolak.`)
    process.exit(1)
  }
}
