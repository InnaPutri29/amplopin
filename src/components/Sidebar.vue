<script setup>
import { useRoute } from 'vue-router'
import { 
  HomeIcon, 
  UsersIcon, 
  PlusCircleIcon, 
  ChartBarIcon,
  ListBulletIcon
} from '@heroicons/vue/24/outline'
import {
  HomeIcon as HomeIconSolid,
  UsersIcon as UsersIconSolid,
  PlusCircleIcon as PlusCircleIconSolid,
  ChartBarIcon as ChartBarIconSolid,
  ListBulletIcon as ListBulletIconSolid
} from '@heroicons/vue/24/solid'
import { useAuth } from '../composables/useAuth'
import { useRouter } from 'vue-router'

const route = useRoute()
const { signOut } = useAuth()
const router = useRouter()

const isActive = (path) => route.path === path

const handleLogout = async () => {
  await signOut()
  router.push('/masuk')
}
</script>

<template>
  <aside class="w-64 bg-[#f8fafc] flex flex-col justify-between py-8 px-6 hidden md:flex sticky top-0 h-full md:rounded-l-[2.5rem] border-r border-slate-100">
    <div>
      <div class="flex items-center gap-3 mb-10 pl-2">
        <div class="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-white font-bold text-xl shadow-lg">
          A
        </div>
        <span class="font-display font-bold text-2xl text-slate-900 tracking-tight">Amplopin</span>
      </div>

      <nav class="space-y-3">
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
          <span>Jejak</span>
        </RouterLink>

        <RouterLink 
          to="/riwayat" 
          class="flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300"
          :class="isActive('/riwayat') ? 'bg-slate-900 text-white shadow-md font-bold' : 'text-slate-500 hover:bg-slate-200/50 hover:text-slate-900 font-medium'"
        >
          <component :is="isActive('/riwayat') ? ListBulletIconSolid : ListBulletIcon" class="w-6 h-6" />
          <span>Riwayat</span>
        </RouterLink>
      </nav>
    </div>

    <button 
      @click="handleLogout"
      class="flex items-center gap-4 px-4 py-3 rounded-xl text-slate-500 hover:bg-red-50 hover:text-red-600 font-medium transition-all duration-300 mt-auto"
    >
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6">
        <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
      </svg>
      <span>Keluar</span>
    </button>
  </aside>
</template>
