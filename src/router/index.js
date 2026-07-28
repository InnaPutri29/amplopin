import { createRouter, createWebHistory } from 'vue-router'
import { useAuth } from '../composables/useAuth'

const routes = [
  { path: '/masuk', name: 'masuk', component: () => import('../views/Login.vue'), meta: { public: true } },
  { path: '/daftar', name: 'daftar', component: () => import('../views/Signup.vue'), meta: { public: true } },
  { path: '/', name: 'dashboard', component: () => import('../views/Dashboard.vue') },
  { path: '/kontak', name: 'kontak', component: () => import('../views/Kontak.vue') },
  { path: '/kontak/:id', name: 'kontak-detail', component: () => import('../views/KontakDetail.vue') },
  { path: '/catat', name: 'catat', component: () => import('../views/TransaksiBaru.vue') },
  { path: '/jejak', name: 'jejak', component: () => import('../views/JejakSilaturahmi.vue') },
  { path: '/riwayat', name: 'riwayat', component: () => import('../views/Riwayat.vue') },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach(async (to) => {
  const { user, isReady, init } = useAuth()
  if (!isReady.value) await init()

  if (!to.meta.public && !user.value) {
    return { name: 'masuk' }
  }
  if (to.meta.public && user.value) {
    return { name: 'dashboard' }
  }
  return true
})

export default router
