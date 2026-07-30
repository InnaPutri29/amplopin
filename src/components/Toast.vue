<script setup>
import { useToast, removeToast } from '../composables/useToast'
const { toasts } = useToast()
</script>

<template>
  <div class="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
    <transition-group 
      enter-active-class="transition duration-400 ease-out"
      enter-from-class="transform translate-y-10 opacity-0 scale-95"
      enter-to-class="transform translate-y-0 opacity-100 scale-100"
      leave-active-class="transition duration-300 ease-in absolute"
      leave-from-class="transform translate-y-0 opacity-100 scale-100"
      leave-to-class="transform translate-y-4 opacity-0 scale-95"
      move-class="transition duration-400 ease-in-out"
    >
      <div 
        v-for="toast in toasts" 
        :key="toast.id"
        class="pointer-events-auto flex items-center gap-3 px-4 py-3.5 min-w-[300px] max-w-sm rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] backdrop-blur-xl border overflow-hidden relative group"
        :class="toast.type === 'success' ? 'bg-white/95 border-emerald-100/50' : 'bg-white/95 border-red-100/50'"
      >
        <!-- Icon -->
        <div 
          class="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-sm"
          :class="toast.type === 'success' ? 'bg-emerald-50 text-emerald-500' : 'bg-red-50 text-red-500'"
        >
          <svg v-if="toast.type === 'success'" xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" /></svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
        </div>
        
        <!-- Message -->
        <p class="text-[13px] font-bold flex-1 font-sans text-slate-700 tracking-wide">{{ toast.message }}</p>
        
        <!-- Close Button -->
        <button @click="removeToast(toast.id)" class="text-slate-400 hover:text-slate-600 transition-colors p-1 opacity-0 group-hover:opacity-100 focus:opacity-100">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>
    </transition-group>
  </div>
</template>
