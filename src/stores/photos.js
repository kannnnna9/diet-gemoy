import { defineStore } from 'pinia'
import { useProfileStore } from './profile'
import { putFoto, getFoto, listFoto, delFoto } from '../lib/idb'

export const usePhotosStore = defineStore('photos', () => {
  const profile = useProfileStore()

  const pid = () => profile.profilAktif

  async function simpan(tanggal, blob, catatan) {
    return putFoto(pid(), tanggal, blob, catatan)
  }

  async function ambil(tanggal) {
    return getFoto(pid(), tanggal)
  }

  async function daftar() {
    return listFoto(pid())
  }

  async function hapus(tanggal) {
    return delFoto(pid(), tanggal)
  }

  return { simpan, ambil, daftar, hapus }
})
