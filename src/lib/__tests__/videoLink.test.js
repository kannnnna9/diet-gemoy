import { describe, it, expect } from 'vitest'
import { youtubeSearchUrl } from '../videoLink.js'

describe('youtubeSearchUrl', () => {
  it('meng-encode spasi dan menambahkan tutorial', () => {
    expect(youtubeSearchUrl('March di tempat'))
      .toBe('https://www.youtube.com/results?search_query=March%20di%20tempat%20tutorial')
  })

  it('meng-encode karakter khusus', () => {
    expect(youtubeSearchUrl('Gerakan & Variasi'))
      .toBe('https://www.youtube.com/results?search_query=Gerakan%20%26%20Variasi%20tutorial')
  })

  it('menangani nama pendek', () => {
    const url = youtubeSearchUrl('Lari')
    expect(url).toContain('search_query=Lari%20tutorial')
  })
})
