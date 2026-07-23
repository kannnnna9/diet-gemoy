import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  { path: '/', name: 'beranda', component: () => import('../views/Beranda.vue') },
  { path: '/program', name: 'program', component: () => import('../views/Program.vue') },
  { path: '/catat', name: 'catat', component: () => import('../views/Catat.vue') },
  { path: '/progres', name: 'progres', component: () => import('../views/Progres.vue') },
  { path: '/pengaturan', name: 'pengaturan', component: () => import('../views/Pengaturan.vue') },
]

export default createRouter({
  history: createWebHashHistory(),
  routes,
})
