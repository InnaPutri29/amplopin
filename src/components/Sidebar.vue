<script setup>
import { useRoute } from 'vue-router'
import { 
  HomeIcon, 
  UsersIcon, 
  PlusCircleIcon, 
  ChartBarIcon,
  ListBulletIcon,
  UserCircleIcon,
  ArrowLeftOnRectangleIcon
} from '@heroicons/vue/24/outline'
import {
  HomeIcon as HomeIconSolid,
  UsersIcon as UsersIconSolid,
  PlusCircleIcon as PlusCircleIconSolid,
  ChartBarIcon as ChartBarIconSolid,
  ListBulletIcon as ListBulletIconSolid,
  UserCircleIcon as UserCircleIconSolid
} from '@heroicons/vue/24/solid'
import { useAuth } from '../composables/useAuth'
import { useRouter } from 'vue-router'
import { ref } from 'vue'
import ModalMasukan from './ModalMasukan.vue'

const route = useRoute()
const router = useRouter()
const { signOut, user, userRole } = useAuth()
const showModalMasukan = ref(false)

const isActive = (path) => route.path === path

const handleSignOut = async () => {
  await signOut()
  router.push('/selamat-datang')
}
</script>

<template>
  <aside class="w-64 bg-white/30 backdrop-blur-md flex flex-col py-8 px-6 hidden md:flex sticky top-0 h-full md:rounded-l-[2.5rem] border-r border-white/50 shadow-[4px_0_24px_-4px_rgba(255,255,255,0.5)]">
    
    <!-- Logo (Fixed) -->
    <div class="flex items-center gap-3 mb-8 pl-2 flex-shrink-0">
      <div class="w-10 h-10 rounded-full shadow-sm flex items-center justify-center bg-white p-1">
        <img src="/logo.png" alt="Logo" class="w-full h-full object-contain" />
      </div>
      <span class="font-display font-bold text-2xl text-slate-900 tracking-tight">Amplopin</span>
    </div>

    <!-- Navigation (Scrollable) -->
    <nav class="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
        <RouterLink 
          to="/" 
          class="flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300"
          :class="isActive('/') ? 'bg-slate-900 text-white shadow-md font-bold' : 'text-slate-500 hover:bg-slate-200/50 hover:text-slate-900 font-medium'"
        >
          <component :is="isActive('/') ? HomeIconSolid : HomeIcon" class="w-6 h-6" />
          <span>Dasbor</span>
        </RouterLink>

        <RouterLink 
          to="/kontak" 
          class="flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300"
          :class="isActive('/kontak') ? 'bg-slate-900 text-white shadow-md font-bold' : 'text-slate-500 hover:bg-slate-200/50 hover:text-slate-900 font-medium'"
        >
          <component :is="isActive('/kontak') ? UsersIconSolid : UsersIcon" class="w-6 h-6" />
          <span>Kontak</span>
        </RouterLink>

        <RouterLink 
          to="/catat" 
          class="flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300"
          :class="isActive('/catat') ? 'bg-slate-900 text-white shadow-md font-bold' : 'text-slate-500 hover:bg-slate-200/50 hover:text-slate-900 font-medium'"
        >
          <component :is="isActive('/catat') ? PlusCircleIconSolid : PlusCircleIcon" class="w-6 h-6" />
          <span>Catat Amplop</span>
        </RouterLink>

        <RouterLink 
          to="/jejak" 
          class="flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300"
          :class="isActive('/jejak') ? 'bg-slate-900 text-white shadow-md font-bold' : 'text-slate-500 hover:bg-slate-200/50 hover:text-slate-900 font-medium'"
        >
          <component :is="isActive('/jejak') ? ChartBarIconSolid : ChartBarIcon" class="w-6 h-6" />
          <span>Laporan</span>
        </RouterLink>

        <RouterLink 
          to="/riwayat" 
          class="flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300"
          :class="isActive('/riwayat') ? 'bg-slate-900 text-white shadow-md font-bold' : 'text-slate-500 hover:bg-slate-200/50 hover:text-slate-900 font-medium'"
        >
          <component :is="isActive('/riwayat') ? ListBulletIconSolid : ListBulletIcon" class="w-6 h-6" />
          <span>Riwayat</span>
        </RouterLink>

        <RouterLink 
          to="/profil" 
          class="flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300"
          :class="isActive('/profil') ? 'bg-slate-900 text-white shadow-md font-bold' : 'text-slate-500 hover:bg-slate-200/50 hover:text-slate-900 font-medium'"
        >
          <component :is="isActive('/profil') ? UserCircleIconSolid : UserCircleIcon" class="w-6 h-6" />
          <span>Profil Saya</span>
        </RouterLink>

        <!-- Admin Links -->
        <template v-if="userRole === 'admin'">
          <div class="pt-4 mt-2 border-t border-slate-200/60">
            <p class="px-4 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Super Admin</p>
            <RouterLink 
              to="/admin/dasbor" 
              class="flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300"
              :class="isActive('/admin/dasbor') ? 'bg-slate-900 text-white shadow-md font-bold' : 'text-slate-500 hover:bg-slate-200/50 hover:text-slate-900 font-medium'"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 flex-shrink-0"><path stroke-linecap="round" stroke-linejoin="round" d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z" /><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z" /></svg>
              <span class="whitespace-nowrap truncate">Statistik</span>
            </RouterLink>
            <RouterLink 
              to="/admin/masukan" 
              class="flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 mt-1"
              :class="isActive('/admin/masukan') ? 'bg-slate-900 text-white shadow-md font-bold' : 'text-slate-500 hover:bg-slate-200/50 hover:text-slate-900 font-medium'"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 flex-shrink-0"><path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.909A2.25 2.25 0 012.25 6.993V6.75m19.5 0v.243m0-2.493V17.25" /></svg>
              <span class="whitespace-nowrap truncate">Masukan User</span>
            </RouterLink>
            <RouterLink 
              to="/admin/pengguna" 
              class="flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 mt-1"
              :class="isActive('/admin/pengguna') ? 'bg-slate-900 text-white shadow-md font-bold' : 'text-slate-500 hover:bg-slate-200/50 hover:text-slate-900 font-medium'"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 flex-shrink-0"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>
              <span class="whitespace-nowrap truncate">Manajemen User</span>
            </RouterLink>
          </div>
        </template>
      </nav>

    <!-- User & Feedback Section -->
    <div class="mt-4 flex-shrink-0 space-y-2 pt-5 border-t border-slate-200/60">
      <button 
        v-if="userRole === 'user'"
        @click="showModalMasukan = true" 
        class="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-serenity-600 bg-serenity-50 hover:bg-serenity-100 rounded-xl transition-colors shadow-sm mb-4"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" /></svg>
        Beri Masukan
      </button>

      <div v-if="user" class="flex items-center gap-3 px-2 py-2 mb-2">
        <div class="w-10 h-10 rounded-full bg-gradient-to-tr from-serenity-400 to-quartz-400 flex items-center justify-center text-slate-900 font-bold font-display shadow-inner">
          {{ user.user_metadata?.nama_keluarga?.charAt(0).toUpperCase() || 'K' }}
        </div>
        <div class="overflow-hidden">
          <p class="text-sm font-bold text-slate-800 truncate">{{ user.user_metadata?.nama_keluarga || 'Keluarga' }}</p>
          <p class="text-xs text-slate-500 truncate">{{ user.email }}</p>
        </div>
      </div>
      <button @click="handleSignOut" class="w-full flex items-center gap-4 px-4 py-3 text-slate-500 hover:bg-red-50 hover:text-red-600 rounded-xl font-medium transition-all duration-300">
        <ArrowLeftOnRectangleIcon class="w-6 h-6" />
        <span>Keluar</span>
      </button>
    </div>
  </aside>
  
  <ModalMasukan v-model="showModalMasukan" />
</template>
