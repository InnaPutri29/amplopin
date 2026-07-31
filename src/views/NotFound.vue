<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<template>
  <div class="min-h-screen flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
    <!-- Background Accents -->
    <div class="absolute -top-32 -left-32 w-96 h-96 bg-serenity-200/40 rounded-full blur-3xl pointer-events-none"></div>
    <div class="absolute -bottom-32 -right-32 w-96 h-96 bg-quartz-200/40 rounded-full blur-3xl pointer-events-none"></div>

    <div class="relative z-10 max-w-md">
      <div class="relative w-48 h-48 mx-auto mb-8">
        <div class="absolute inset-0 bg-gradient-to-tr from-serenity-100 to-quartz-100 rounded-full animate-pulse blur-xl opacity-60"></div>
        <div class="relative w-full h-full bg-white rounded-full flex items-center justify-center shadow-2xl border border-white/60">
          <span class="font-display font-bold text-6xl text-slate-800 tracking-tighter">404</span>
        </div>
      </div>
      
      <h1 class="font-display font-bold text-3xl md:text-4xl text-slate-800 mb-4 tracking-tight">Halaman Tidak Ditemukan</h1>
      <p class="text-slate-500 mb-10 leading-relaxed font-medium">
        Maaf, halaman yang Anda tuju sepertinya tidak ada, telah dipindahkan, atau Anda salah mengetikkan alamat.
      </p>

      <button @click="router.push('/')" class="btn-primary w-full md:w-auto inline-flex items-center justify-center gap-2 shadow-serenity-500/30">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
        </svg>
        Kembali ke Beranda
      </button>
    </div>
  </div>
</template>
