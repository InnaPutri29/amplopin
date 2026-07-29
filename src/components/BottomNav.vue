<script setup>
import { RouterLink, useRoute } from 'vue-router'
import { 
  HomeIcon, 
  UsersIcon, 
  PlusCircleIcon, 
  ChartBarIcon,
  ListBulletIcon,
  UserCircleIcon
} from '@heroicons/vue/24/outline'
import {
  HomeIcon as HomeIconSolid,
  UsersIcon as UsersIconSolid,
  PlusCircleIcon as PlusCircleIconSolid,
  ChartBarIcon as ChartBarIconSolid,
  ListBulletIcon as ListBulletIconSolid,
  UserCircleIcon as UserCircleIconSolid
} from '@heroicons/vue/24/solid'

const route = useRoute()
const items = [
  { to: '/', label: 'Dasbor', name: 'dashboard', icon: HomeIcon, iconSolid: HomeIconSolid },
  { to: '/kontak', label: 'Kontak', name: 'kontak', icon: UsersIcon, iconSolid: UsersIconSolid },
  { to: '/catat', label: 'Tambah', name: 'catat', icon: PlusCircleIcon, iconSolid: PlusCircleIconSolid },
  { to: '/jejak', label: 'Laporan', name: 'jejak', icon: ChartBarIcon, iconSolid: ChartBarIconSolid },
  { to: '/riwayat', label: 'Riwayat', name: 'riwayat', icon: ListBulletIcon, iconSolid: ListBulletIconSolid },
  { to: '/profil', label: 'Profil', name: 'profil', icon: UserCircleIcon, iconSolid: UserCircleIconSolid },
]
</script>

<template>
  <nav class="fixed bottom-0 inset-x-0 bg-white/60 backdrop-blur-xl border-t border-white/80 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] flex justify-around py-3 px-2 z-20 pb-safe">
    <RouterLink
      v-for="item in items"
      :key="item.name"
      :to="item.to"
      class="flex flex-col items-center gap-1.5 px-3 py-1 rounded-2xl text-[10px] sm:text-xs font-semibold transition-all duration-300"
      :class="route.name === item.name ? 'text-serenity-700 -translate-y-1' : 'text-slate-400 hover:text-serenity-500'"
    >
      <div 
        class="p-2 rounded-xl transition-all duration-300"
        :class="route.name === item.name ? 'bg-gradient-to-tr from-quartz-100 to-serenity-100 text-serenity-600 shadow-sm' : 'bg-transparent text-slate-400'"
      >
        <component :is="route.name === item.name ? item.iconSolid : item.icon" class="w-6 h-6" />
      </div>
      {{ item.label }}
    </RouterLink>
  </nav>
</template>

