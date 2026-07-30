<script setup>
import { ref, onMounted, computed } from 'vue'
import { supabase } from '../lib/supabase'
import { useAuth } from '../composables/useAuth'
import ModalEditTransaksi from '../components/ModalEditTransaksi.vue'
import ModalDetailTransaksi from '../components/ModalDetailTransaksi.vue'
import { confirmDialog, showError, showToast } from '../utils/swal'

const { user } = useAuth()
const riwayat = ref([])
const loading = ref(true)

const showEditModal = ref(false)
const selectedTransaksiId = ref(null)

const showDetailModal = ref(false)
const selectedDetailTransaksi = ref(null)

function viewDetail(item) {
  selectedDetailTransaksi.value = item
  showDetailModal.value = true
}

function editTransaksi(id) {
  selectedTransaksiId.value = id
  showEditModal.value = true
}

async function loadRiwayat() {
  loading.value = true
  const { data, error } = await supabase
    .from('transaksi')
    .select(`
      id,
      tipe,
      nominal,
      tanggal_acara,
      keterangan,
      kategori_acara,
      jenis_acara,
      kontak:kontak_id ( nama, no_hp, alamat_lengkap )
    `)
    .eq('keluarga_id', user.value.id)
    .order('tanggal_acara', { ascending: false })
    .order('created_at', { ascending: false })

  if (!error) riwayat.value = data
  loading.value = false
}

onMounted(loadRiwayat)

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

import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

// Removed Export to CSV function per user request

function exportToPDF() {
  if (riwayat.value.length === 0) return

  const doc = new jsPDF()
  doc.text('Riwayat Transaksi Amplopin', 14, 15)
  
  const headers = [['Tanggal', 'Kontak', 'Kategori', 'Jenis', 'Nominal', 'Keterangan']]
  const rows = riwayat.value.map(item => [
    formatDate(item.tanggal_acara),
    item.kontak?.nama || 'Tanpa Kontak',
    item.kategori_acara.replace('_', ' '),
    item.tipe === 'masuk' ? 'Diterima' : 'Diberikan',
    formatRupiah(item.nominal),
    item.keterangan || '-'
  ])

  autoTable(doc, {
    head: headers,
    body: rows,
    startY: 20,
    styles: { fontSize: 9 },
    headStyles: { fillColor: [134, 158, 201] }
  })

  doc.save(`Riwayat_Amplopin_${new Date().toISOString().split('T')[0]}.pdf`)
}

async function handleDelete(id) {
  const isConfirmed = await confirmDialog('Hapus Catatan', 'Apakah Anda yakin ingin menghapus catatan ini?')
  if (!isConfirmed) return
  
  const { error } = await supabase
    .from('transaksi')
    .delete()
    .eq('id', id)
  if (!error) {
    showToast('Catatan berhasil dihapus')
    loadRiwayat()
  } else {
    showError('Gagal', 'Gagal menghapus catatan.')
  }
}
</script>

<template>
  <div>
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
      <div>
        <h1 class="font-display text-3xl font-bold text-slate-800">Riwayat Transaksi</h1>
        <p class="text-slate-500 text-sm mt-1">Lihat, ubah, atau hapus seluruh catatan amplop.</p>
      </div>
      <div class="flex items-center gap-2">

        <button @click="exportToPDF" class="flex items-center gap-2 bg-white text-slate-600 font-semibold px-3 py-2 rounded-xl shadow-sm hover:shadow-md border border-slate-100 transition-all text-sm">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
          Unduh PDF
        </button>
      </div>
    </div>

    <div class="card p-6 md:p-8">
      <div v-if="loading" class="text-slate-400 text-sm animate-pulse flex justify-center py-8">Memuat riwayat...</div>
      
      <!-- Desktop Table -->
      <div v-else class="hidden md:block overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="border-b border-slate-100 text-slate-500 text-xs uppercase tracking-wider">
              <th class="py-3 px-4 font-semibold">Tanggal</th>
              <th class="py-3 px-4 font-semibold">Kontak</th>
              <th class="py-3 px-4 font-semibold">Jenis</th>
              <th class="py-3 px-4 font-semibold">Acara</th>
              <th class="py-3 px-4 font-semibold text-right">Nominal</th>
              <th class="py-3 px-4 font-semibold text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="riwayat.length === 0">
              <td colspan="6" class="py-12">
                <div class="flex flex-col items-center justify-center text-slate-500 text-sm">
                  <div class="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8 text-slate-300">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                    </svg>
                  </div>
                  Belum ada catatan amplop.
                </div>
              </td>
            </tr>
            <tr v-else v-for="item in riwayat" :key="item.id" class="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
              <td class="py-4 px-4 text-sm text-slate-700">{{ formatDate(item.tanggal_acara) }}</td>
              <td class="py-4 px-4 text-sm font-medium text-slate-800">
                {{ item.kontak?.nama || 'Tanpa Kontak' }}
              </td>
              <td class="py-4 px-4 text-sm">
                <span 
                  class="inline-block px-2 py-0.5 rounded text-[10px] font-bold"
                  :class="item.tipe === 'masuk' ? 'bg-serenity-100 text-serenity-700' : 'bg-quartz-100 text-quartz-700'"
                >
                  {{ item.tipe === 'masuk' ? 'DITERIMA' : 'DIBERIKAN' }}
                </span>
              </td>
              <td class="py-4 px-4 text-sm text-slate-600 font-medium">
                {{ item.jenis_acara || item.kategori_acara.replace('_', ' ') }}
              </td>
              <td class="py-4 px-4 text-sm text-right font-display font-bold" :class="item.tipe === 'masuk' ? 'text-serenity-600' : 'text-quartz-600'">
                {{ formatRupiah(item.nominal) }}
              </td>
              <td class="py-4 px-4">
                <div class="flex items-center justify-center gap-2">
                  <button @click="viewDetail(item)" class="text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors" title="Detail">
                    Detail
                  </button>
                  <button @click="editTransaksi(item.id)" class="text-xs font-semibold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition-colors" title="Edit">
                    Edit
                  </button>
                  <button @click="handleDelete(item.id)" class="text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors" title="Hapus">
                    Hapus
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Mobile Cards -->
      <div v-if="!loading" class="md:hidden divide-y divide-slate-100">
        <div v-if="riwayat.length === 0" class="py-12 flex flex-col items-center justify-center text-slate-500 text-sm">
          <div class="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8 text-slate-300">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
          </div>
          Belum ada catatan amplop.
        </div>
        <div v-else v-for="item in riwayat" :key="'mobile-'+item.id" class="py-4">
          <div class="flex justify-between items-start mb-2">
            <div class="pr-2">
              <h3 class="font-bold text-slate-800 text-base">{{ item.kontak?.nama || 'Tanpa Kontak' }}</h3>
              <p class="text-xs text-slate-500 mt-0.5">{{ formatDate(item.tanggal_acara) }} - {{ item.jenis_acara || item.kategori_acara.replace('_', ' ') }}</p>
            </div>
            <div class="flex flex-col items-end gap-2 flex-shrink-0">
              <span 
                class="inline-block px-2 py-1 rounded-lg text-[10px] font-bold tracking-wider"
                :class="item.tipe === 'masuk' ? 'bg-serenity-100 text-serenity-700' : 'bg-quartz-100 text-quartz-700'"
              >
                {{ item.tipe === 'masuk' ? 'DITERIMA' : 'DIBERIKAN' }}
              </span>
              <div class="flex gap-1">
                <button @click="viewDetail(item)" class="text-indigo-600 bg-indigo-50 hover:bg-indigo-100 p-1.5 rounded-lg transition-colors" title="Detail">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                </button>
                <button @click="editTransaksi(item.id)" class="text-emerald-600 bg-emerald-50 hover:bg-emerald-100 p-1.5 rounded-lg transition-colors" title="Edit">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" /></svg>
                </button>
                <button @click="handleDelete(item.id)" class="text-red-600 bg-red-50 hover:bg-red-100 p-1.5 rounded-lg transition-colors" title="Hapus">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
                </button>
              </div>
            </div>
          </div>
          
          <div class="flex items-end justify-between mt-4">
            <p class="font-display font-bold text-lg" :class="item.tipe === 'masuk' ? 'text-serenity-600' : 'text-quartz-600'">
              {{ formatRupiah(item.nominal) }}
            </p>
          </div>
        </div>
      </div>
    </div>
    
    <ModalEditTransaksi 
      :show="showEditModal" 
      :transaksiId="selectedTransaksiId" 
      @close="showEditModal = false" 
      @updated="loadRiwayat" 
    />
    
    <ModalDetailTransaksi
      :show="showDetailModal"
      :transaksi="selectedDetailTransaksi"
      @close="showDetailModal = false"
    />
  </div>
</template>
