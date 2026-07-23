const PREFIX = 'dg'

function key(profilId, k) {
  return `${PREFIX}:${profilId}:${k}`
}

export function get(profilId, k, fallback = null) {
  try {
    const raw = localStorage.getItem(key(profilId, k))
    return raw !== null ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

export function set(profilId, k, val) {
  try {
    localStorage.setItem(key(profilId, k), JSON.stringify(val))
    return true
  } catch {
    return false
  }
}

export function remove(profilId, k) {
  try {
    localStorage.removeItem(key(profilId, k))
    return true
  } catch {
    return false
  }
}

export function getRaw(profilId, k, fallback = null) {
  try {
    return localStorage.getItem(key(profilId, k)) ?? fallback
  } catch {
    return fallback
  }
}

export function setRaw(profilId, k, val) {
  try {
    localStorage.setItem(key(profilId, k), val)
    return true
  } catch {
    return false
  }
}
