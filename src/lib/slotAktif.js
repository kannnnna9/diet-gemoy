// Pilih slot yang sedang relevan: jam mulai sudah lewat, tapi belum >90 menit lewat.
const AMBANG = 90 // menit

function toMenit(jam) {
  const [h, m] = jam.split(':')
  return (+h) * 60 + (+m)
}

export function slotSekarang(slots, menitSekarang) {
  let pilih = null
  let terbaik = Infinity
  for (const s of slots) {
    const mulai = toMenit(s.jam)
    const selisih = menitSekarang - mulai
    if (selisih >= 0 && selisih <= AMBANG && selisih < terbaik) {
      terbaik = selisih
      pilih = s
    }
  }
  return pilih
}
