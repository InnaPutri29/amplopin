<script setup>
import { ref, onMounted, computed } from 'vue'
import { supabase } from '../lib/supabase'
import { useAuth } from '../composables/useAuth'
import { showAlert, showConfirm } from '../utils/alert'
import ModalEditTransaksi from '../components/ModalEditTransaksi.vue'

const { user } = useAuth()
const riwayat = ref([])
const loading = ref(true)

const showEditModal = ref(false)
const selectedTransaksiId = ref(null)

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
  const confirmed = await showConfirm('Hapus Catatan?', 'Apakah Anda yakin ingin menghapus catatan amplop ini?')
  if (!confirmed) return
  
  const { error } = await supabase
    .from('transaksi')
    .delete()
    .eq('id', id)
    
  if (!error) {
    loadRiwayat()
  } else {
    Swal.fire('Gagal Menghapus', 'Terjadi kesalahan saat menghapus catatan.', 'error')
  }
}
</script>

<template>
  <div>
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
      <div>
        <h1 class="font-display text-3xl font-bold text-slate-800 mb-1">Riwayat Transaksi</h1>
        <p class="text-slate-500 text-sm">Lihat, ubah, atau hapus seluruh catatan amplop.</p>
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
      
      <div v-else-if="riwayat.length === 0" class="text-center text-slate-500 text-sm py-12 flex flex-col items-center">
        <div class="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8 text-slate-300">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
        </div>
        Belum ada catatan amplop.
      </div>
      
      <div v-else class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="border-b border-slate-100 text-slate-500 text-xs uppercase tracking-wider">
              <th class="py-3 px-4 font-semibold">Tanggal</th>
              <th class="py-3 px-4 font-semibold">Kontak</th>
              <th class="py-3 px-4 font-semibold">Jenis & Acara</th>
              <th class="py-3 px-4 font-semibold text-right">Nominal</th>
              <th class="py-3 px-4 font-semibold text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in riwayat" :key="item.id" class="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
              <td class="py-4 px-4 text-sm text-slate-700">{{ formatDate(item.tanggal_acara) }}</td>
              <td class="py-4 px-4 text-sm font-medium text-slate-800">
                {{ item.kontak?.nama || 'Tanpa Kontak' }}
              </td>
              <td class="py-4 px-4 text-sm">
                <div class="flex flex-col gap-1">
                  <span 
                    class="inline-block px-2 py-0.5 rounded text-[10px] font-bold w-fit"
                    :class="item.tipe === 'masuk' ? 'bg-serenity-100 text-serenity-700' : 'bg-quartz-100 text-quartz-700'"
                  >
                    {{ item.tipe === 'masuk' ? 'DITERIMA' : 'DIBERIKAN' }}
                  </span>
                  <span class="text-slate-500 text-xs">{{ item.kategori_acara.replace('_', ' ') }}</span>
                </div>
              </td>
              <td class="py-4 px-4 text-sm text-right font-display font-bold" :class="item.tipe === 'masuk' ? 'text-serenity-600' : 'text-quartz-600'">
                {{ formatRupiah(item.nominal) }}
              </td>
              <td class="py-4 px-4">
                <div class="flex items-center justify-center gap-2">
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
    </div>
    
    <ModalEditTransaksi 
      :show="showEditModal" 
      :transaksiId="selectedTransaksiId" 
      @close="showEditModal = false" 
      @updated="loadRiwayat" 
    />
  </div>
</template>
