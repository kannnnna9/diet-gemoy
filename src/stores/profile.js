import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { get, set, getRaw, setRaw } from '../lib/storage'

export const useProfileStore = defineStore('profile', () => {
  const profilAktif = ref(getRaw('_global', 'profilAktif', 'paypey'))
  const namaOverride = ref({})

  function getNama(profilId) {
    return getRaw(profilId, 'nama', null)
  }

  function gantiProfil(id) {
    profilAktif.value = id
    setRaw('_global', 'profilAktif', id)
  }

  function ubahNama(profilId, nama) {
    setRaw(profilId, 'nama', nama)
    namaOverride.value[profilId] = nama
  }

  // Cadangan reaktif mode haid per profil supaya toggle langsung terlihat (tanpa refresh).
  const haidMap = ref({
    paypey: getRaw('paypey', 'modeHaid', 'false') === 'true',
    ffazeyall: getRaw('ffazeyall', 'modeHaid', 'false') === 'true',
  })

  const modeHaid = computed(() => !!haidMap.value[profilAktif.value])

  function setModeHaid(val) {
    haidMap.value[profilAktif.value] = !!val
    setRaw(profilAktif.value, 'modeHaid', val ? 'true' : 'false')
  }

  return {
    profilAktif,
    namaOverride,
    gantiProfil,
    ubahNama,
    getNama,
    modeHaid,
    setModeHaid,
  }
})
