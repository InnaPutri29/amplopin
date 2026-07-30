<script setup>
import { ref, onMounted, computed } from 'vue'
import { supabase } from '../lib/supabase'
import { useAuth } from '../composables/useAuth'
import { useRouter } from 'vue-router'
import { KATEGORI_LABEL } from '../constants/jenisAcara'

const router = useRouter()
const { user, signOut } = useAuth()

const handleSignOut = async () => {
  await signOut()
  router.push('/selamat-datang')
}
const ringkasan = ref([])
const loading = ref(true)

const totalMasuk = computed(() =>
  ringkasan.value.reduce((sum, r) => sum + Number(r.total_masuk), 0)
)
const totalKeluar = computed(() =>
  ringkasan.value.reduce((sum, r) => sum + Number(r.total_keluar), 0)
)

function formatRupiah(n) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)
}

async function loadRingkasan() {
  loading.value = true
  const { data, error } = await supabase
    .from('transaksi')
    .select('nominal, tipe, kategori_acara')
    .eq('keluarga_id', user.value.id)

  if (!error && data) {
    const summary = {}
    data.forEach(t => {
      const cat = t.kategori_acara || 'suka_cita'
      if (!summary[cat]) {
        summary[cat] = { kategori_acara: cat, total_masuk: 0, total_keluar: 0 }
      }
      if (t.tipe === 'masuk') summary[cat].total_masuk += Number(t.nominal)
      else if (t.tipe === 'keluar') summary[cat].total_keluar += Number(t.nominal)
    })
    ringkasan.value = Object.values(summary)
  } else {
    ringkasan.value = []
  }
  loading.value = false
}

onMounted(loadRingkasan)
</script>

<template>
  <div>
    <div class="flex justify-between items-start gap-4 mb-8">
      <div>
        <h1 class="font-display text-3xl font-bold text-slate-800">Dasbor</h1>
        <p class="text-slate-500 text-sm font-medium mt-1">Selamat datang, <span class="text-slate-700 font-bold">{{ user?.user_metadata?.nama_keluarga || 'Keluarga' }}</span>. Berikut merupakan ringkasan catatan amplop Anda.</p>
      </div>
      <button class="md:hidden flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-100 rounded-xl transition-colors shadow-sm whitespace-nowrap" @click="handleSignOut">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" /></svg>
        Keluar
      </button>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
      <div class="card p-5 relative overflow-hidden group">
        <div class="absolute -right-6 -top-6 w-24 h-24 bg-serenity-100 rounded-full opacity-50 group-hover:scale-110 transition-transform duration-500"></div>
        <p class="text-xs font-semibold text-slate-500 mb-2 relative z-10 uppercase tracking-wider">Total Diterima</p>
        <p class="font-display text-2xl sm:text-3xl font-bold text-serenity-600 relative z-10 truncate" :title="formatRupiah(totalMasuk)">{{ formatRupiah(totalMasuk) }}</p>
      </div>
      <div class="card p-5 relative overflow-hidden group">
        <div class="absolute -right-6 -top-6 w-24 h-24 bg-quartz-100 rounded-full opacity-50 group-hover:scale-110 transition-transform duration-500"></div>
        <p class="text-xs font-semibold text-slate-500 mb-2 relative z-10 uppercase tracking-wider">Total Diberikan</p>
        <p class="font-display text-2xl sm:text-3xl font-bold text-quartz-600 relative z-10 truncate" :title="formatRupiah(totalKeluar)">{{ formatRupiah(totalKeluar) }}</p>
      </div>
    </div>

    <h2 class="font-semibold text-slate-600 mb-4 text-sm uppercase tracking-wider">Per Kategori</h2>
    <div v-if="loading" class="text-slate-400 text-sm animate-pulse">Memuat...</div>
    <div v-else-if="ringkasan.length === 0" class="card p-8 text-center text-slate-500 text-sm flex flex-col items-center justify-center min-h-[160px]">
      <div class="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mb-3">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 text-slate-300">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      Belum ada transaksi tercatat.<br/>Yuk mulai catat amplop pertamamu.
    </div>
    <div v-else class="space-y-3">
      <div v-for="r in ringkasan" :key="r.kategori_acara" class="card p-5 flex justify-between items-center group">
        <div class="flex-1 pr-4">
          <p class="font-bold text-slate-700 text-lg">{{ KATEGORI_LABEL[r.kategori_acara] }}</p>
          <div class="flex flex-wrap items-center gap-y-2 gap-x-2 mt-2 text-[11px] font-medium">
            <span class="text-serenity-600 bg-serenity-50 px-2 py-1 rounded-md whitespace-nowrap">Masuk: {{ formatRupiah(r.total_masuk) }}</span>
            <span class="text-slate-300 hidden sm:inline-block">•</span>
            <span class="text-quartz-600 bg-quartz-50 px-2 py-1 rounded-md whitespace-nowrap">Keluar: {{ formatRupiah(r.total_keluar) }}</span>
          </div>
        </div>
        <div class="w-10 h-10 rounded-full flex flex-shrink-0 items-center justify-center" :class="r.kategori_acara === 'suka_cita' ? 'bg-serenity-50 text-serenity-500' : 'bg-slate-100 text-slate-500'">
           <svg v-if="r.kategori_acara === 'suka_cita'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5">
              <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5">
              <path fill-rule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-2.625 6c-.54 0-.828.419-.936.634a1.96 1.96 0 00-.189.866c0 .298.059.605.189.866.108.215.395.634.936.634.54 0 .828-.419.936-.634.13-.26.189-.568.189-.866 0-.298-.059-.605-.189-.866-.108-.215-.395-.634-.936-.634zm4.314.634c.108-.215.395-.634.936-.634.54 0 .828.419.936.634.13.26.189.568.189.866 0 .298-.059.605-.189.866-.108.215-.395.634-.936.634-.54 0-.828-.419-.936-.634a1.96 1.96 0 00-.189-.866zM12.75 16.125v-.375a.75.75 0 00-1.5 0v.375c0 .414.336.75.75.75s.75-.336.75-.75z" clip-rule="evenodd" />
            </svg>
        </div>
      </div>
    </div>
  </div>
</template>
