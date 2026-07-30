<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { supabase } from '../lib/supabase'
import ModalEditKontak from '../components/ModalEditKontak.vue'
import { confirmDialog, showError, showInfo } from '../utils/swal'

const route = useRoute()
const router = useRouter()
const kontakId = route.params.id

const kontak = ref(null)
const riwayat = ref([])
const totalDiterima = ref(0)
const totalDiberikan = ref(0)
const loading = ref(true)

const showEditModal = ref(false)

function formatRupiah(n) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

async function loadData() {
  loading.value = true
  
  // 1. Fetch detail kontak
  const { data: kontakData } = await supabase
    .from('kontak')
    .select('*')
    .eq('id', kontakId)
    .single()
    
  if (kontakData) kontak.value = kontakData
  
  // 2. Fetch transaksi dengan kontak ini
  const { data: riwayatData } = await supabase
    .from('transaksi')
    .select('*')
    .eq('kontak_id', kontakId)
    .order('tanggal_acara', { ascending: false })
    .order('created_at', { ascending: false })
    
  if (riwayatData) {
    riwayat.value = riwayatData
    totalDiterima.value = riwayatData.filter(t => t.tipe === 'masuk').reduce((sum, t) => sum + t.nominal, 0)
    totalDiberikan.value = riwayatData.filter(t => t.tipe === 'keluar').reduce((sum, t) => sum + t.nominal, 0)
  }
  
  loading.value = false
}

async function hapusKontak() {
  if (riwayat.value.length > 0) {
    showInfo('Tidak Bisa Dihapus', 'Hapus riwayat transaksi dengan kontak ini terlebih dahulu di halaman Riwayat.')
    return
  }

  const isConfirmed = await confirmDialog('Hapus Kontak', 'Apakah Anda yakin ingin menghapus kontak ini secara permanen?')
  if (!isConfirmed) return

  const { error } = await supabase
    .from('kontak')
    .delete()
    .eq('id', kontakId)

  if (!error) {
    router.push('/kontak')
  } else {
    showError('Gagal', 'Gagal menghapus kontak: ' + error.message)
  }
}

onMounted(loadData)
</script>

<template>
  <div>
    <button @click="router.back()" class="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-semibold mb-6 transition-colors">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
        <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
      </svg>
      Kembali
    </button>
    
    <div v-if="loading" class="text-slate-400 text-sm animate-pulse flex justify-center py-8">Memuat detail kontak...</div>
    
    <div v-else-if="!kontak" class="text-center text-slate-500 py-12">Kontak tidak ditemukan.</div>
    
    <div v-else>
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div class="flex items-center gap-5">
          <div class="w-16 h-16 rounded-full bg-gradient-to-tr from-quartz-100 to-serenity-100 flex items-center justify-center text-serenity-600 font-bold text-2xl shadow-sm shrink-0">
            {{ kontak.nama.charAt(0).toUpperCase() }}
          </div>
          <div>
            <h1 class="font-display text-3xl font-bold text-slate-800">{{ kontak.nama }}</h1>
            <p class="text-slate-500 text-sm mt-1">{{ kontak.no_hp || 'Tidak ada No HP' }} · {{ kontak.alamat_lengkap || 'Tidak ada alamat' }}</p>
          </div>
        </div>
        
        <div class="flex items-center gap-2">
          <button @click="showEditModal = true" class="p-2 md:px-4 md:py-2 bg-white border border-slate-200 text-slate-600 font-medium rounded-xl hover:bg-slate-50 transition-colors shadow-sm text-sm flex items-center gap-1.5" title="Edit">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" /></svg>
            <span class="hidden md:inline">Edit</span>
          </button>
          <button @click="hapusKontak" class="p-2 md:px-4 md:py-2 bg-white border border-red-100 text-red-600 font-medium rounded-xl hover:bg-red-50 transition-colors shadow-sm text-sm flex items-center gap-1.5" title="Hapus">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
            <span class="hidden md:inline">Hapus</span>
          </button>
        </div>
      </div>
      
      <div class="grid grid-cols-2 gap-4 mb-8">
        <div class="card p-5 border-t-4 border-t-serenity-500">
          <p class="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">Total Diterima</p>
          <p class="font-display text-2xl font-bold text-serenity-600">{{ formatRupiah(totalDiterima) }}</p>
        </div>
        <div class="card p-5 border-t-4 border-t-quartz-500">
          <p class="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">Total Diberikan</p>
          <p class="font-display text-2xl font-bold text-quartz-600">{{ formatRupiah(totalDiberikan) }}</p>
        </div>
      </div>
      
      <div class="card p-6 md:p-8">
        <h2 class="font-display text-xl font-bold text-slate-800 mb-6">Kronologi Transaksi</h2>
        
        <div v-if="riwayat.length === 0" class="text-center text-slate-500 text-sm py-8">
          Belum ada riwayat transaksi dengan kontak ini.
        </div>
        
        <div v-else class="relative border-l border-slate-200 ml-3 space-y-8">
          <div v-for="item in riwayat" :key="item.id" class="relative pl-6">
            <span class="absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full" :class="item.tipe === 'masuk' ? 'bg-serenity-500 shadow-[0_0_0_4px_#f5f7fc]' : 'bg-quartz-500 shadow-[0_0_0_4px_#fdf5f5]'"></span>
            
            <div class="flex justify-between items-start mb-1">
              <div>
                <span 
                  class="inline-block px-2 py-0.5 rounded text-[10px] font-bold mb-2"
                  :class="item.tipe === 'masuk' ? 'bg-serenity-100 text-serenity-700' : 'bg-quartz-100 text-quartz-700'"
                >
                  {{ item.tipe === 'masuk' ? 'KITA TERIMA DARI MEREKA' : 'KITA BERIKAN KE MEREKA' }}
                </span>
                <p class="text-slate-800 font-bold">{{ item.jenis_acara || item.kategori_acara.replace('_', ' ') }}</p>
              </div>
              <p class="font-display font-bold text-lg" :class="item.tipe === 'masuk' ? 'text-serenity-600' : 'text-quartz-600'">
                {{ item.tipe === 'masuk' ? '+' : '-' }} {{ formatRupiah(item.nominal) }}
              </p>
            </div>
            
            <p class="text-xs font-medium text-slate-400 mb-1">{{ formatDate(item.tanggal_acara) }}</p>
            <p v-if="item.keterangan" class="text-sm text-slate-600 italic bg-slate-50 p-3 rounded-xl mt-2">"{{ item.keterangan }}"</p>
          </div>
        </div>
      </div>
    </div>
    
    <ModalEditKontak 
      :show="showEditModal" 
      :kontak="kontak" 
      @close="showEditModal = false" 
      @updated="loadData" 
    />
  </div>
</template>
