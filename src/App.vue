<script setup>
import { RouterView, useRoute } from 'vue-router'
import { useAuth } from './composables/useAuth'
import BottomNav from './components/BottomNav.vue'
import Sidebar from './components/Sidebar.vue'

const route = useRoute()
const { user } = useAuth()
</script>

<template>
  <div :class="['min-h-screen relative overflow-hidden flex items-center justify-center p-0 z-0', route.meta.public ? 'bg-white md:p-6' : 'bg-[#f3f4fa] md:p-6']">
    <!-- Liquid Background Blobs (hidden on auth pages) -->
    <template v-if="!route.meta.public">
      <div class="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#e0c3fc] rounded-full mix-blend-multiply filter blur-[100px] opacity-70 animate-blob"></div>
      <div class="absolute top-[20%] right-[-10%] w-[40%] h-[50%] bg-[#8ec5fc] rounded-full mix-blend-multiply filter blur-[100px] opacity-70 animate-blob animation-delay-2000"></div>
      <div class="absolute bottom-[-20%] left-[20%] w-[60%] h-[60%] bg-[#ffecd2] rounded-full mix-blend-multiply filter blur-[100px] opacity-70 animate-blob animation-delay-4000"></div>
    </template>
    
    <!-- App Container (Glassmorphism) -->
    <div class="w-full h-screen md:h-[90vh] max-w-[1400px] bg-white/70 backdrop-blur-2xl md:rounded-[2.5rem] shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] border border-white/50 overflow-hidden flex flex-col md:flex-row relative z-10">
      
      <!-- Sidebar for Desktop -->
      <Sidebar v-if="user && !route.meta.public" />
      
      <!-- Main Content Area -->
      <div :class="['flex-1 flex flex-col h-full relative bg-white/40 md:rounded-r-[2.5rem]', route.meta.public ? 'overflow-hidden' : 'overflow-y-auto scrollbar-hide']">
        <main 
          class="flex-1"
          :class="user && !route.meta.public ? 'p-6 md:p-10 lg:p-12 pb-24 md:pb-12' : 'flex items-center justify-center min-h-full'"
          :style="!user || route.meta.public ? 'padding: 0; height: 100%;' : ''"
        >
          <div :class="user && !route.meta.public ? 'max-w-5xl mx-auto w-full' : 'w-full h-full'">
            <RouterView />
          </div>
        </main>
      </div>
      
      <!-- Bottom Nav for Mobile -->
      <BottomNav v-if="user && !route.meta.public" class="md:hidden" />
    </div>
  </div>
</template>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
    display: none;
}
.scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
}
</style>
