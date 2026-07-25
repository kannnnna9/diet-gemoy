import programData from '../../content/program.json'

export function getProgram() {
  return programData
}

export function getSlotHarian(profilId) {
  return programData.slotHarian?.[profilId] || []
}

export function getProfil(profilId) {
  return programData.profil.find(p => p.id === profilId) || null
}

export function getFase(profilId) {
  return programData.fase.filter(f => f.profilId === profilId)
}

export function getFaseAktif(profilId) {
  const today = new Date().toISOString().slice(0, 10)
  const faseList = getFase(profilId)
  return faseList.find(f => today >= f.tglMulai && today <= f.tglSelesai) || null
}

export function getJadwal(profilId) {
  return programData.jadwalMingguan[profilId] || {}
}

export function getJadwalHari(profilId, hari) {
  const jadwal = getJadwal(profilId)
  return jadwal[hari] || null
}

export function getGerakan(id) {
  return programData.gerakan.find(g => g.id === id) || null
}

export function getGerakanList() {
  return programData.gerakan
}

export function getSesi(id) {
  return programData.sesiLatihan.find(s => s.id === id) || null
}

export function getSesiProfil(profilId) {
  return programData.sesiLatihan.filter(s => s.profilId === profilId)
}

export function getHariIni() {
  const hariNames = ['minggu', 'senin', 'selasa', 'rabu', 'kamis', 'jumat', 'sabtu']
  const day = new Date().getDay()
  return hariNames[day]
}

const BULAN_ID = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']

// Parse manual dari string ISO "YYYY-MM-DD" — hindari isu timezone new Date(iso).
export function formatTanggalId(iso) {
  const [y, m, d] = iso.split('-')
  return `${parseInt(d, 10)} ${BULAN_ID[parseInt(m, 10) - 1]} ${y}`
}
