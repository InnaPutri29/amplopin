import { createRouter, createWebHistory } from 'vue-router'
import { useAuth } from '../composables/useAuth'

import Dashboard from '../views/Dashboard.vue'
import TransaksiBaru from '../views/TransaksiBaru.vue'
import JejakSilaturahmi from '../views/JejakSilaturahmi.vue'
import Riwayat from '../views/Riwayat.vue'
import Kontak from '../views/Kontak.vue'
import KontakDetail from '../views/KontakDetail.vue'

import Profil from '../views/Profil.vue'

const routes = [
  { path: '/selamat-datang', name: 'welcome', component: () => import('../views/Welcome.vue'), meta: { public: true } },
  { path: '/masuk', name: 'masuk', component: () => import('../views/Login.vue'), meta: { public: true } },
  { path: '/daftar', name: 'daftar', component: () => import('../views/Signup.vue'), meta: { public: true } },
  { path: '/', name: 'dashboard', component: Dashboard },
  { path: '/kontak', name: 'kontak', component: Kontak },
  { path: '/kontak/:id', name: 'kontak-detail', component: KontakDetail },
  { path: '/catat', name: 'catat', component: TransaksiBaru },
  { path: '/jejak', name: 'jejak', component: JejakSilaturahmi },
  { path: '/riwayat', name: 'riwayat', component: Riwayat },
  { path: '/profil', name: 'profil', component: Profil },
  { path: '/admin/dasbor', name: 'admin-dasbor', component: () => import('../views/admin/AdminDashboard.vue'), meta: { adminOnly: true } },
  { path: '/admin/masukan', name: 'admin-masukan', component: () => import('../views/admin/AdminMasukan.vue'), meta: { adminOnly: true } },
  { path: '/admin/pengguna', name: 'admin-pengguna', component: () => import('../views/admin/AdminPengguna.vue'), meta: { adminOnly: true } },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach(async (to) => {
  const { user, userRole, isReady, init } = useAuth()
  if (!isReady.value) await init()

  if (!to.meta.public && !user.value) {
    return { name: 'welcome' }
  }
  if (to.meta.public && user.value) {
    return { name: 'dashboard' }
  }
  if (to.meta.adminOnly && userRole.value !== 'admin') {
    return { name: 'dashboard' }
  }
  return true
})

export default router
