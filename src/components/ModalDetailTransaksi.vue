<script setup>
import { computed } from 'vue'

const props = defineProps({
  show: Boolean,
  transaksi: Object
})

const emit = defineEmits(['close'])

const formatRupiah = (n) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n || 0)
}

const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

const formatKategori = (kat) => {
  if (!kat) return '-'
  return kat.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
}
</script>

<template>
  <transition
    enter-active-class="transition duration-300 ease-out"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition duration-200 ease-in"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" @click="emit('close')"></div>
      
      <transition
        enter-active-class="transition duration-300 ease-out"
        enter-from-class="opacity-0 translate-y-8 scale-95"
        enter-to-class="opacity-100 translate-y-0 scale-100"
        leave-active-class="transition duration-200 ease-in"
        leave-from-class="opacity-100 translate-y-0 scale-100"
        leave-to-class="opacity-0 translate-y-4 scale-95"
      >
        <div v-if="show" class="bg-white/95 backdrop-blur-xl w-full max-w-md rounded-[2rem] shadow-2xl overflow-hidden relative z-10 border border-white/50 flex flex-col max-h-[85vh]">
          
          <!-- Header -->
          <div class="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h2 class="font-display font-bold text-xl text-slate-800">Detail Transaksi</h2>
            <button @click="emit('close')" class="text-slate-400 hover:text-slate-600 bg-white hover:bg-slate-100 rounded-full p-2 transition-colors shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Body -->
          <div v-if="transaksi" class="p-6 md:p-8 overflow-y-auto custom-scrollbar">
            
            <!-- Amount Section -->
            <div class="text-center mb-8">
              <p class="text-sm font-semibold text-slate-500 uppercase tracking-widest mb-2">Total Nominal</p>
              <h3 
                class="font-display font-bold text-4xl md:text-5xl tracking-tight"
                :class="transaksi.tipe === 'masuk' ? 'text-serenity-600' : 'text-quartz-600'"
              >
                {{ formatRupiah(transaksi.nominal) }}
              </h3>
              <div class="mt-4">
                <span 
                  class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase shadow-sm"
                  :class="transaksi.tipe === 'masuk' ? 'bg-serenity-100 text-serenity-700 border border-serenity-200' : 'bg-quartz-100 text-quartz-700 border border-quartz-200'"
                >
                  <svg v-if="transaksi.tipe === 'masuk'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-11.25a.75.75 0 00-1.5 0v4.59L7.3 9.24a.75.75 0 00-1.1 1.02l3.25 3.5a.75.75 0 001.1 0l3.25-3.5a.75.75 0 10-1.1-1.02l-1.95 2.1V6.75z" clip-rule="evenodd" /></svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-.75-4.75a.75.75 0 001.5 0V8.66l1.95 2.1a.75.75 0 101.1-1.02l-3.25-3.5a.75.75 0 00-1.1 0L6.2 9.74a.75.75 0 101.1 1.02l1.95-2.1v4.59z" clip-rule="evenodd" /></svg>
                  {{ transaksi.tipe === 'masuk' ? 'DITERIMA DARI' : 'DIBERIKAN KEPADA' }}
                </span>
              </div>
            </div>

            <div class="space-y-4">
              <!-- Contact Details -->
              <div class="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                <div class="flex items-center gap-3 mb-4">
                  <div class="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5"><path fill-rule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clip-rule="evenodd" /></svg>
                  </div>
                  <div>
                    <h4 class="font-bold text-slate-800 text-lg">{{ transaksi.kontak?.nama || 'Tanpa Kontak' }}</h4>
                    <p class="text-xs text-slate-500 font-medium mt-0.5">Kontak Amplop</p>
                  </div>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-200">
                  <div>
                    <p class="text-xs text-slate-400 font-semibold uppercase mb-1">Nomor HP</p>
                    <p class="text-sm font-medium text-slate-700">{{ transaksi.kontak?.no_hp || '-' }}</p>
                  </div>
                  <div>
                    <p class="text-xs text-slate-400 font-semibold uppercase mb-1">Alamat</p>
                    <p class="text-sm font-medium text-slate-700 leading-relaxed">{{ transaksi.kontak?.alamat_lengkap || '-' }}</p>
                  </div>
                </div>
              </div>

              <!-- Event Details -->
              <div class="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-4">
                  <div>
                    <p class="text-xs text-slate-400 font-semibold uppercase mb-1">Tanggal Acara</p>
                    <p class="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 text-slate-400"><path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>
                      {{ formatDate(transaksi.tanggal_acara) }}
                    </p>
                  </div>
                  <div>
                    <p class="text-xs text-slate-400 font-semibold uppercase mb-1">Kategori Acara</p>
                    <p class="text-sm font-medium text-slate-700">{{ formatKategori(transaksi.kategori_acara) }}</p>
                  </div>
                  <div class="md:col-span-2">
                    <p class="text-xs text-slate-400 font-semibold uppercase mb-1">Jenis Acara</p>
                    <p class="text-sm font-medium text-slate-700">{{ transaksi.jenis_acara || '-' }}</p>
                  </div>
                </div>
              </div>

              <!-- Notes -->
              <div class="bg-yellow-50/50 rounded-2xl p-5 border border-yellow-100/50">
                <p class="text-xs text-yellow-600/70 font-semibold uppercase mb-1 flex items-center gap-1.5">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-3.5 h-3.5"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
                  Catatan Tambahan
                </p>
                <p class="text-sm font-medium text-slate-700 leading-relaxed italic">{{ transaksi.keterangan || 'Tidak ada catatan.' }}</p>
              </div>

            </div>

            <div class="pt-6">
              <button @click="emit('close')" class="btn-primary w-full py-3 text-base shadow-lg shadow-serenity-500/30">
                Tutup Detail
              </button>
            </div>
          </div>
          
        </div>
      </transition>
    </div>
  </transition>
</template>
