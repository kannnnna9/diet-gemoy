import { describe, it, expect } from 'vitest'
import { buildIcs } from '../ics.js'

const slots = [
  { id: 'ganjel', label: 'Ganjel pagi', jam: '04:50', ulang: 'harian-kerja', catatan: 'Sebelum pagi' },
  { id: 'if', label: 'Mulai IF', jam: '11:00', ulang: 'harian', catatan: '' },
  { id: 'timbang', label: 'Timbang', jam: '06:30', ulang: 'harian-libur', catatan: 'Sabtu' },
]

describe('buildIcs', () => {
  it('menghasilkan VCALENDAR valid', () => {
    const ics = buildIcs(slots, 'paypey')
    expect(ics.startsWith('BEGIN:VCALENDAR')).toBe(true)
    expect(ics.trim().endsWith('END:VCALENDAR')).toBe(true)
    expect(ics).toContain('VERSION:2.0')
    expect(ics).toContain('PRODID:-//Diet Gemoy//Fase2//ID')
  })
  it('membuat 1 VEVENT per slot dengan RRULE & VALARM', () => {
    const ics = buildIcs(slots, 'paypey')
    expect((ics.match(/BEGIN:VEVENT/g) || []).length).toBe(3)
    expect((ics.match(/BEGIN:VALARM/g) || []).length).toBe(3)
    expect((ics.match(/END:VALARM/g) || []).length).toBe(3)
    expect(ics).toContain('RRULE:FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR') // harian-kerja
    expect(ics).toContain('RRULE:FREQ=DAILY') // harian
    expect(ics).toContain('RRULE:FREQ=WEEKLY;BYDAY=SA') // harian-libur (Sabtu)
  })
  it('jam 04:50 → DTSTART berakhiran T045000', () => {
    const ics = buildIcs(slots, 'paypey')
    expect(ics).toMatch(/DTSTART[^\n]*T045000/)
  })
  it('UID unik per slot & mengandung profil', () => {
    const ics = buildIcs(slots, 'ffazeyall')
    expect(ics).toContain('UID:dietgemoy-ffazeyall-ganjel@dietgemoy')
    expect(ics).toContain('UID:dietgemoy-ffazeyall-if@dietgemoy')
  })
  it('escape karakter khusus koma, titik koma, backslash, newline', () => {
    const ics = buildIcs([{ id: 'x', label: 'A,B;C\\D', jam: '07:00', ulang: 'harian', catatan: 'baris1\nbaris2' }], 'p')
    expect(ics).toContain('SUMMARY:Diet Gemoy — A\\,B\\;C\\\\D')
    expect(ics).toContain('DESCRIPTION:baris1\\nbaris2')
  })
  it('baris dipisah CRLF (\\r\\n)', () => {
    const ics = buildIcs(slots, 'paypey')
    expect(ics).toContain('BEGIN:VCALENDAR\r\n')
    expect(ics.endsWith('\r\n')).toBe(true)
  })
})
