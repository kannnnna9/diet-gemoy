export function youtubeSearchUrl(nama) {
  const q = encodeURIComponent(`${nama} tutorial`)
  return `https://www.youtube.com/results?search_query=${q}`
}
