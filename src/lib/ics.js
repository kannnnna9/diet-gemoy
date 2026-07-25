// Bangun string iCalendar (.ics) dari daftar slotHarian.
// RRULE: harian -> FREQ=DAILY; harian-kerja -> Sen-Jum (Min..Jum, kerja 6 hari); harian-libur -> Sabtu.
// Format lokal floating time (tanpa Z) — ikut zona HP pengguna, bukan UTC.

const RRULE = {
  'harian': 'RRULE:FREQ=DAILY',
  'harian-kerja': 'RRULE:FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR',
  'harian-libur': 'RRULE:FREQ=WEEKLY;BYDAY=SA',
}

function pad(n) {
  return String(n).padStart(2, '0')
}

// Tanggal mulai = hari ini, jam dari slot. Floating time (tanpa Z) agar ikut zona HP.
function dtStart(jam) {
  const now = new Date()
  const [h, m] = jam.split(':')
  return `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}T${pad(+h)}${pad(+m)}00`
}

function stamp() {
  const d = new Date()
  return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`
}

function esc(s) {
  return String(s || '')
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n')
}

export function buildIcs(slots, profilId) {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Diet Gemoy//Fase2//ID',
    'CALSCALE:GREGORIAN',
  ]
  for (const s of slots) {
    lines.push(
      'BEGIN:VEVENT',
      `UID:dietgemoy-${profilId}-${s.id}@dietgemoy`,
      `DTSTAMP:${stamp()}`,
      `DTSTART:${dtStart(s.jam)}`,
      'DURATION:PT10M',
      RRULE[s.ulang] || RRULE['harian'],
      `SUMMARY:${esc('Diet Gemoy — ' + s.label)}`,
      `DESCRIPTION:${esc(s.catatan)}`,
      'BEGIN:VALARM',
      'ACTION:DISPLAY',
      `DESCRIPTION:${esc(s.label)}`,
      'TRIGGER:PT0M',
      'END:VALARM',
      'END:VEVENT',
    )
  }
  lines.push('END:VCALENDAR')
  return lines.join('\r\n') + '\r\n'
}

export function downloadIcs(slots, profilId) {
  const blob = new Blob([buildIcs(slots, profilId)], { type: 'text/calendar' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `dietgemoy-${profilId}.ics`
  a.click()
  URL.revokeObjectURL(url)
}
