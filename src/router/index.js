import { createRouter, createWebHashHistory } from 'vue-router'
import { isSupabaseReady } from '../lib/supabase'
import { useAuthStore } from '../stores/auth'

const routes = [
  { path: '/', name: 'beranda', component: () => import('../views/Beranda.vue') },
  { path: '/program', name: 'program', component: () => import('../views/Program.vue') },
  { path: '/gerakan', name: 'gerakan', component: () => import('../views/SemuaGerakan.vue') },
  { path: '/catat', name: 'catat', component: () => import('../views/Catat.vue') },
  { path: '/progres', name: 'progres', component: () => import('../views/Progres.vue') },
  { path: '/pengaturan', name: 'pengaturan', component: () => import('../views/Pengaturan.vue') },
  { path: '/pasangan', name: 'pasangan', component: () => import('../views/Pasangan.vue') },
  { path: '/login', name: 'login', component: () => import('../views/Login.vue') },
  { path: '/:pathMatch(.*)*', redirect: { name: 'beranda' } },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

router.beforeEach(async (to) => {
  if (!isSupabaseReady) return true
  const auth = useAuthStore()
  if (!auth.siap) await auth.init()
  if (to.name !== 'login' && !auth.profilId) return { name: 'login', query: { redirect: to.fullPath } }
  if (to.name === 'login' && auth.profilId) return { name: 'beranda' }
  return true
})

export default router
