<script setup>
import { ref, onMounted, computed } from 'vue'
import { supabase } from '../../lib/supabase'

const stats = ref({
  total_users: 0,
  total_transactions: 0,
  total_masuk: 0,
  total_keluar: 0,
  kategori_stats: []
})
const isLoading = ref(true)
const loadError = ref(false)

async function loadData() {
  isLoading.value = true
  loadError.value = false
  try {
    const { data, error } = await supabase.rpc('get_admin_dashboard_stats')
    if (error) {
      // If RPC fails (e.g. user hasn't run the SQL yet), we catch it
      throw error
    }
    if (data) stats.value = data
  } catch (err) {
    console.error('Failed to load admin stats:', err)
    loadError.value = true
  } finally {
    isLoading.value = false
  }
}

const totalSukaCita = computed(() => {
  const stat = stats.value.kategori_stats?.find(s => s.kategori_acara === 'suka_cita')
  return stat ? stat.count : 0
})

const totalDuka = computed(() => {
  const stat = stats.value.kategori_stats?.find(s => s.kategori_acara === 'duka')
  return stat ? stat.count : 0
})

const totalSemuaKategori = computed(() => totalSukaCita.value + totalDuka.value)
const persenSukaCita = computed(() => totalSemuaKategori.value ? Math.round((totalSukaCita.value / totalSemuaKategori.value) * 100) : 0)
const persenDuka = computed(() => totalSemuaKategori.value ? Math.round((totalDuka.value / totalSemuaKategori.value) * 100) : 0)

const totalKeuangan = computed(() => Number(stats.value.total_masuk) + Number(stats.value.total_keluar))
const persenMasuk = computed(() => totalKeuangan.value ? Math.round((Number(stats.value.total_masuk) / totalKeuangan.value) * 100) : 0)
const persenKeluar = computed(() => totalKeuangan.value ? Math.round((Number(stats.value.total_keluar) / totalKeuangan.value) * 100) : 0)

function formatRupiah(n) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(n))
}

onMounted(loadData)
</script>

<template>
  <div class="h-full flex flex-col">
    <div class="mb-4">
      <router-link to="/profil" class="inline-flex items-center gap-1.5 text-slate-400 hover:text-slate-700 font-semibold text-sm transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
        Kembali
      </router-link>
    </div>
    <div class="mb-8 flex justify-between items-start">
      <div>
        <h1 class="font-display text-3xl font-bold text-slate-800">Dasbor Admin</h1>
        <p class="text-slate-500 text-sm font-medium mt-1">Pantau statistik global aplikasi Amplopin.</p>
      </div>
      <button v-if="loadError" @click="loadData" class="btn-primary text-xs py-2">Coba Lagi</button>
    </div>

    <div v-if="isLoading" class="flex justify-center p-12">
      <div class="w-8 h-8 border-4 border-serenity-200 border-t-serenity-500 rounded-full animate-spin"></div>
    </div>
    
    <div v-else-if="loadError" class="card p-8 text-center text-rose-500 bg-rose-50 border-rose-100">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-10 h-10 mx-auto mb-3 opacity-70"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
      <p class="font-bold mb-1">Gagal memuat data statistik.</p>
      <p class="text-xs text-rose-400">Pastikan Anda telah menjalankan script SQL terbaru di Supabase.</p>
    </div>

    <div v-else class="space-y-6">
      <!-- Top Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
        <div class="card p-6 border-l-4 border-l-serenity-500 relative overflow-hidden group">
          <div class="absolute -right-4 -top-4 w-20 h-20 bg-serenity-50 rounded-full opacity-50 group-hover:scale-125 transition-transform duration-700"></div>
          <h2 class="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2 relative z-10">Total Keluarga</h2>
          <p class="text-4xl font-display font-bold text-slate-800 relative z-10">{{ stats.total_users }}</p>
          <p class="text-xs text-slate-400 mt-2 relative z-10">Keluarga terdaftar di sistem</p>
        </div>
        
        <div class="card p-6 border-l-4 border-l-quartz-500 relative overflow-hidden group">
          <div class="absolute -right-4 -top-4 w-20 h-20 bg-quartz-50 rounded-full opacity-50 group-hover:scale-125 transition-transform duration-700"></div>
          <h2 class="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2 relative z-10">Total Transaksi</h2>
          <p class="text-4xl font-display font-bold text-slate-800 relative z-10">{{ stats.total_transactions }}</p>
          <p class="text-xs text-slate-400 mt-2 relative z-10">Catatan amplop global</p>
        </div>
      </div>

      <!-- Charts Section -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <!-- Chart: Kategori Acara -->
        <div class="card p-6 flex flex-col">
          <h3 class="font-bold text-slate-700 mb-6">Perbandingan Kategori Acara</h3>
          
          <div v-if="totalSemuaKategori === 0" class="flex-1 flex items-center justify-center text-sm text-slate-400 bg-slate-50 rounded-xl">
            Belum ada data kategori
          </div>
          <div v-else class="flex-1 flex flex-col justify-center gap-6">
            <!-- Progress Bar -->
            <div class="h-8 w-full rounded-full overflow-hidden flex bg-slate-100 shadow-inner">
              <div class="h-full bg-gradient-to-r from-serenity-400 to-serenity-500 transition-all duration-1000 ease-out flex items-center px-3" :style="`width: ${persenSukaCita}%`">
                 <span v-if="persenSukaCita > 15" class="text-[10px] font-bold text-white">{{ persenSukaCita }}%</span>
              </div>
              <div class="h-full bg-gradient-to-r from-slate-700 to-slate-800 transition-all duration-1000 ease-out flex items-center justify-end px-3" :style="`width: ${persenDuka}%`">
                 <span v-if="persenDuka > 15" class="text-[10px] font-bold text-white">{{ persenDuka }}%</span>
              </div>
            </div>
            
            <!-- Legend -->
            <div class="flex justify-between items-center px-1">
              <div class="flex items-center gap-3">
                <div class="w-3 h-3 rounded-full bg-serenity-500 shadow-sm"></div>
                <div>
                  <p class="text-sm font-bold text-slate-800">Suka Cita</p>
                  <p class="text-xs text-slate-500">{{ totalSukaCita }} Transaksi</p>
                </div>
              </div>
              <div class="flex items-center gap-3 text-right">
                <div>
                  <p class="text-sm font-bold text-slate-800">Duka Cita</p>
                  <p class="text-xs text-slate-500">{{ totalDuka }} Transaksi</p>
                </div>
                <div class="w-3 h-3 rounded-full bg-slate-700 shadow-sm"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Chart: Arus Keuangan -->
        <div class="card p-6 flex flex-col">
          <h3 class="font-bold text-slate-700 mb-6">Arus Keuangan Global</h3>
          
          <div v-if="totalKeuangan === 0" class="flex-1 flex items-center justify-center text-sm text-slate-400 bg-slate-50 rounded-xl">
            Belum ada perputaran uang
          </div>
          <div v-else class="flex-1 flex flex-col justify-center gap-6">
            <!-- Progress Bar -->
            <div class="h-8 w-full rounded-full overflow-hidden flex bg-slate-100 shadow-inner">
              <div class="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 transition-all duration-1000 ease-out flex items-center px-3" :style="`width: ${persenMasuk}%`">
                <span v-if="persenMasuk > 15" class="text-[10px] font-bold text-white">{{ persenMasuk }}%</span>
              </div>
              <div class="h-full bg-gradient-to-r from-rose-400 to-rose-500 transition-all duration-1000 ease-out flex items-center justify-end px-3" :style="`width: ${persenKeluar}%`">
                <span v-if="persenKeluar > 15" class="text-[10px] font-bold text-white">{{ persenKeluar }}%</span>
              </div>
            </div>
            
            <!-- Legend -->
            <div class="flex justify-between items-center px-1">
              <div class="flex items-center gap-3">
                <div class="w-3 h-3 rounded-full bg-emerald-500 shadow-sm"></div>
                <div>
                  <p class="text-sm font-bold text-slate-800">Uang Masuk</p>
                  <p class="text-[11px] text-slate-500 font-semibold">{{ formatRupiah(stats.total_masuk) }}</p>
                </div>
              </div>
              <div class="flex items-center gap-3 text-right">
                <div>
                  <p class="text-sm font-bold text-slate-800">Uang Keluar</p>
                  <p class="text-[11px] text-slate-500 font-semibold">{{ formatRupiah(stats.total_keluar) }}</p>
                </div>
                <div class="w-3 h-3 rounded-full bg-rose-500 shadow-sm"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
