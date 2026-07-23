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

  const modeHaid = computed(() => {
    return getRaw(profilAktif.value, 'modeHaid', 'false') === 'true'
  })

  function setModeHaid(val) {
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
