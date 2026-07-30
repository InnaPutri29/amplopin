<script setup>
import { ref, onMounted, computed } from 'vue'
import { supabase } from '../lib/supabase'
import { KATEGORI_LABEL } from '../constants/jenisAcara'
import { useAuth } from '../composables/useAuth'
import { JENIS_ACARA_DEFAULT } from '../constants/jenisAcara'
import ModalEditTransaksi from '../components/ModalEditTransaksi.vue'
import GlassSelect from '../components/GlassSelect.vue'
import GlassDatePicker from '../components/GlassDatePicker.vue'
import ModalEditKontak from '../components/ModalEditKontak.vue'
import * as XLSX from 'xlsx'
import { confirmDialog, showError, showSuccess } from '../utils/swal'

const { user } = useAuth()
const data = ref([])
const loading = ref(true)
const filterKategori = ref('suka_cita')

const tipeOptions = [
  { label: 'Diterima (Mereka memberi ke kita)', value: 'masuk' },
  { label: 'Diberikan (Kita memberi ke mereka)', value: 'keluar' }
]
const jenisAcaraOptions = JENIS_ACARA_DEFAULT.map(j => ({ label: j.label, value: j.label }))
const searchQuery = ref('')

const showDetailModal = ref(false)
const selectedKontakDetail = ref(null)
const detailTransaksi = ref([])
const loadingDetail = ref(false)

const showEditKontakModal = ref(false)
const kontakToEdit = ref(null)

const showEditModal = ref(false)
const selectedTransaksiId = ref(null)

async function editTransaksiJejak(row) {
  const { data } = await supabase
    .from('transaksi')
    .select('id')
    .eq('keluarga_id', user.value.id)
    .eq('kontak_id', row.kontak_id)
    .eq('kategori_acara', filterKategori.value)
    .eq('tipe', 'masuk')
    .order('tanggal_acara', { ascending: false })
    .limit(1)
    .single()
    
  if (data) {
    selectedTransaksiId.value = data.id
    showEditModal.value = true
  } else {
    showError('Tidak Ditemukan', 'Data transaksi tidak ditemukan.')
  }
}

async function hapusTransaksiJejak(row) {
  const isConfirmed = await confirmDialog('Hapus Catatan', `Hapus catatan amplop masuk untuk "${row.nama_kontak}"?`)
  if (!isConfirmed) return
  
  const { error } = await supabase
    .from('transaksi')
    .delete()
    .eq('keluarga_id', user.value.id)
    .eq('kontak_id', row.kontak_id)
    .eq('kategori_acara', filterKategori.value)
    .eq('tipe', 'masuk')
    
  if (!error) {
    load()
  } else {
    showError('Gagal', 'Gagal menghapus: ' + error.message)
  }
}

function editTransaksi(id) {
  selectedTransaksiId.value = id
  showEditModal.value = true
}

async function handleDelete(id) {
  const isConfirmed = await confirmDialog('Hapus Catatan', 'Apakah Anda yakin ingin menghapus catatan ini?')
  if (!isConfirmed) return
  
  const { error } = await supabase
    .from('transaksi')
    .delete()
    .eq('id', id)
    
  if (!error) {
    if (selectedKontakDetail.value) {
      await viewDetail(selectedKontakDetail.value)
    }
    load()
  } else {
    showError('Gagal', 'Gagal menghapus catatan.')
  }
}

async function handleTransaksiUpdated() {
  if (selectedKontakDetail.value) {
    await viewDetail(selectedKontakDetail.value)
  }
  load()
}

async function viewDetail(row) {
  selectedKontakDetail.value = row
  showDetailModal.value = true
  loadingDetail.value = true
  
  const { data, error } = await supabase
    .from('transaksi')
    .select('id, tipe, nominal, tanggal_acara, keterangan, jenis_acara')
    .eq('keluarga_id', user.value.id)
    .eq('kontak_id', row.kontak_id)
    .eq('kategori_acara', filterKategori.value)
    .eq('tipe', 'masuk')
    .order('tanggal_acara', { ascending: false })
    
  if (error) {
    showError('Gagal', 'Gagal memuat rincian: ' + error.message)
    detailTransaksi.value = []
  } else {
    detailTransaksi.value = data || []
  }
  loadingDetail.value = false
}

function formatDate(dateStr) {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

const filteredData = computed(() => {
  if (!searchQuery.value.trim()) return data.value
  const q = searchQuery.value.toLowerCase()
  return data.value.filter(row => {
    const nama = (row.nama_kontak || '').toLowerCase()
    const alamat = (row.alamat || '').toLowerCase()
    const hp = (row.no_hp || '').toLowerCase()
    return nama.includes(q) || alamat.includes(q) || hp.includes(q)
  })
})

const fileInput = ref(null)
const showImportModal = ref(false)
const importFile = ref(null)
const isImporting = ref(false)
const importConfig = ref({
  jenisAcaraLabel: JENIS_ACARA_DEFAULT[0].label,
  kategoriAcara: JENIS_ACARA_DEFAULT[0].kategori_acara,
  tanggalAcara: new Date().toISOString().slice(0, 10),
  tipe: 'masuk'
})

function onImportJenisAcaraChange() {
  const selected = JENIS_ACARA_DEFAULT.find(j => j.label === importConfig.value.jenisAcaraLabel)
  if (selected) {
    importConfig.value.kategoriAcara = selected.kategori_acara
  }
}

function triggerFileInput() {
  if (fileInput.value) fileInput.value.click()
}

function handleFileSelect(e) {
  const file = e.target.files[0]
  if (!file) return
  importFile.value = file
  showImportModal.value = true
  e.target.value = ''
}

async function processImport() {
  if (!importFile.value) return
  isImporting.value = true
  
  const reader = new FileReader()
  reader.onload = async (e) => {
    try {
      const arrayBuffer = new Uint8Array(e.target.result)
      const workbook = XLSX.read(arrayBuffer, { type: 'array' })
      const sheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[sheetName]
      const jsonData = XLSX.utils.sheet_to_json(worksheet)
      
      let importedCount = 0

      for (const row of jsonData) {
        const keys = Object.keys(row)
        const getVal = (possibleNames) => {
          const key = keys.find(k => possibleNames.some(p => k.toLowerCase().includes(p)))
          return key ? row[key] : null
        }
        
        const nama = getVal(['nama'])
        const alamat = getVal(['alamat'])
        const noHp = getVal(['hp', 'telepon', 'telp', 'nomor'])
        const nominalRaw = getVal(['nominal', 'jumlah', 'uang'])
        
        if (!nama || !nominalRaw) continue
        
        let nominalStr = String(nominalRaw).replace(/\D/g, '')
        let nominal = parseInt(nominalStr, 10) || 0
        if (nominal <= 0) continue

        let kontakId = null
        const { data: existingKontak } = await supabase
          .from('kontak')
          .select('id')
          .eq('keluarga_id', user.value.id)
          .ilike('nama', String(nama).trim())
          .maybeSingle()
          
        if (existingKontak) {
          kontakId = existingKontak.id
        } else {
          const { data: newKontak, error: errK } = await supabase.from('kontak').insert({
            keluarga_id: user.value.id,
            nama: String(nama).trim(),
            alamat_lengkap: alamat ? String(alamat).trim() : null,
            no_hp: noHp ? String(noHp).trim() : null
          }).select('id').single()
          
          if (!errK && newKontak) {
            kontakId = newKontak.id
          }
        }
        
        if (!kontakId) continue

        await supabase.from('transaksi').insert({
          keluarga_id: user.value.id,
          kontak_id: kontakId,
          tipe: importConfig.value.tipe,
          kategori_acara: importConfig.value.kategoriAcara,
          jenis_acara: importConfig.value.jenisAcaraLabel,
          tanggal_acara: importConfig.value.tanggalAcara,
          nominal: nominal,
          keterangan: 'Hasil Impor Excel'
        })
        
        importedCount++
      }
      
      showSuccess('Berhasil', `Berhasil mengimpor ${importedCount} catatan.`)
      showImportModal.value = false
      importFile.value = null
      load()
    } catch (err) {
      showError('Gagal', 'Gagal memproses file Excel: ' + err.message)
    } finally {
      isImporting.value = false
    }
  }
  reader.readAsArrayBuffer(importFile.value)
}

function downloadTemplate() {
  const ws = XLSX.utils.aoa_to_sheet([
    ['Nama', 'Alamat', 'No HP (Opsional)', 'Nominal'],
    ['Budi Santoso', 'Jl. Merdeka No 1', '081234567890', 100000],
    ['Siti Aminah', 'Desa Sukamaju', '', 50000]
  ])
  
  const wscols = [
    { wch: 25 },
    { wch: 35 },
    { wch: 20 },
    { wch: 15 }
  ]
  ws['!cols'] = wscols
  
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Template')
  XLSX.writeFile(wb, 'Template_Impor_Amplopin.xlsx')
}

function formatRupiah(n) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)
}

async function load() {
  loading.value = true
  const { data: transaksis, error } = await supabase
    .from('transaksi')
    .select('kontak_id, nominal')
    .eq('keluarga_id', user.value.id)
    .eq('kategori_acara', filterKategori.value)
    .eq('tipe', 'masuk')

  const { data: kontakData } = await supabase
    .from('kontak')
    .select('id, nama, alamat_lengkap, no_hp')
    .eq('keluarga_id', user.value.id)

  if (!error && transaksis && kontakData) {
    const grouped = {}
    for (const t of transaksis) {
      if (!grouped[t.kontak_id]) grouped[t.kontak_id] = 0
      grouped[t.kontak_id] += t.nominal
    }
    
    data.value = Object.keys(grouped).map(kId => {
      const k = kontakData.find(x => x.id === kId)
      return {
        kontak_id: kId,
        nama_kontak: k ? k.nama : 'Unknown',
        alamat: k ? (k.alamat_lengkap || '') : '',
        no_hp: k ? (k.no_hp || '') : '',
        saldo: grouped[kId]
      }
    }).sort((a, b) => b.saldo - a.saldo)
  } else {
    data.value = []
  }
  loading.value = false
}

onMounted(load)
</script>

<template>
  <div>
    <div class="flex flex-col sm:flex-row justify-between items-start mb-8 gap-4">
      <div>
        <h1 class="font-display text-3xl font-bold text-slate-800">Laporan Amplop Masuk</h1>
        <p class="text-slate-500 text-sm mt-1">Daftar total pemasukan amplop dari setiap kontak.</p>
      </div>
      <div class="flex items-center gap-2">
        <button @click="downloadTemplate" class="flex items-center gap-2 bg-white text-slate-600 font-semibold px-3 py-2 rounded-xl shadow-sm hover:shadow-md border border-slate-100 transition-all text-sm">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
          Unduh Template
        </button>
        <input type="file" ref="fileInput" accept=".xlsx, .xls" class="hidden" @change="handleFileSelect" />
        <button @click="triggerFileInput" class="flex items-center gap-2 bg-white text-slate-600 font-semibold px-3 py-2 rounded-xl shadow-sm hover:shadow-md border border-slate-100 transition-all text-sm">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
          </svg>
          Impor Excel
        </button>
      </div>
    </div>

    <div class="card p-6 md:p-8">
      <div class="flex p-1 bg-slate-100/50 rounded-[1.25rem] mb-8 border border-white/60 shadow-inner">
        <button
          class="flex-1 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300"
          :class="filterKategori === 'suka_cita' ? 'bg-white text-serenity-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'"
          @click="filterKategori = 'suka_cita'; load()"
        >
          {{ KATEGORI_LABEL.suka_cita }}
        </button>
        <button
          class="flex-1 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300"
          :class="filterKategori === 'duka' ? 'bg-white text-slate-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'"
          @click="filterKategori = 'duka'; load()"
        >
          {{ KATEGORI_LABEL.duka }}
        </button>
      </div>

      <div class="relative mb-6">
        <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5 text-slate-400">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
        </div>
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="Cari nama, alamat, atau no HP..." 
          class="input-field pl-11 shadow-sm border-slate-200 focus:border-serenity-300 focus:ring focus:ring-serenity-200/50"
        />
      </div>

      <div v-if="loading" class="text-slate-400 text-sm animate-pulse flex justify-center py-8">Memuat...</div>
      
      <div v-else-if="filteredData.length === 0" class="text-center text-slate-500 text-sm py-12 flex flex-col items-center">
        <div class="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8 text-slate-300">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
        </div>
        Belum ada data yang sesuai.
      </div>

      <!-- Desktop Table -->
      <div v-else class="hidden md:block overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="border-b border-slate-100 text-slate-500 text-xs uppercase tracking-wider">
              <th class="py-3 px-4 font-semibold w-12 text-center">No</th>
              <th class="py-3 px-4 font-semibold">Nama</th>
              <th class="py-3 px-4 font-semibold">Alamat</th>
              <th class="py-3 px-4 font-semibold text-right">Jumlah Uang</th>
              <th class="py-3 px-4 font-semibold text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, index) in filteredData" :key="row.kontak_id" class="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
              <td class="py-4 px-4 text-sm text-slate-500 text-center">{{ index + 1 }}</td>
              <td class="py-4 px-4 text-sm font-bold text-slate-800">{{ row.nama_kontak }}</td>
              <td class="py-4 px-4 text-sm text-slate-600">{{ row.alamat || '-' }}</td>
              <td class="py-4 px-4 text-right">
                <p 
                  class="font-display font-bold text-lg"
                  :class="row.saldo > 0 ? 'text-quartz-600' : row.saldo < 0 ? 'text-serenity-600' : 'text-slate-400'"
                >
                  {{ formatRupiah(row.saldo) }}
                </p>
              </td>
              <td class="py-4 px-4">
                <div class="flex items-center justify-center gap-2">
                  <button @click="viewDetail(row)" class="text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors" title="Detail">
                    Detail
                  </button>
                  <button @click="editTransaksiJejak(row)" class="text-xs font-semibold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition-colors" title="Edit">
                    Edit
                  </button>
                  <button @click="hapusTransaksiJejak(row)" class="text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors" title="Hapus">
                    Hapus
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Mobile Cards -->
      <div v-if="!loading && filteredData.length > 0" class="md:hidden divide-y divide-slate-100">
        <div v-for="(row, index) in filteredData" :key="'mobile-'+row.kontak_id" class="py-4">
          <div class="flex justify-between items-start mb-2">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center font-bold text-xs flex-shrink-0">
                {{ index + 1 }}
              </div>
              <div>
                <h3 class="font-bold text-slate-800">{{ row.nama_kontak }}</h3>
                <p class="text-xs text-slate-500">{{ row.alamat || '-' }}</p>
              </div>
            </div>
            <div class="flex gap-1 flex-shrink-0">
              <button @click="viewDetail(row)" class="text-indigo-600 bg-indigo-50 hover:bg-indigo-100 p-1.5 rounded-lg transition-colors" title="Detail">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              </button>
              <button @click="editTransaksiJejak(row)" class="text-emerald-600 bg-emerald-50 hover:bg-emerald-100 p-1.5 rounded-lg transition-colors" title="Edit">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" /></svg>
              </button>
              <button @click="hapusTransaksiJejak(row)" class="text-red-600 bg-red-50 hover:bg-red-100 p-1.5 rounded-lg transition-colors" title="Hapus">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
              </button>
            </div>
          </div>
          
          <div class="mt-4 bg-slate-50 p-3 rounded-xl border border-slate-100 mb-4 flex justify-between items-center">
            <span class="text-xs font-semibold text-slate-500">Jumlah Uang</span>
            <p 
              class="font-display font-bold text-lg"
              :class="row.saldo > 0 ? 'text-quartz-600' : row.saldo < 0 ? 'text-serenity-600' : 'text-slate-400'"
            >
              {{ formatRupiah(row.saldo) }}
            </p>
          </div>


        </div>
      </div>
    </div>

    <!-- Import Config Modal -->
    <div v-if="showImportModal" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div class="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl relative">
        <button @click="showImportModal = false; importFile = null" class="absolute top-4 right-4 text-slate-400 hover:text-slate-700">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <h2 class="font-display text-xl font-bold text-slate-800 mb-2">Pengaturan Impor</h2>
        <div class="bg-blue-50/50 p-3 rounded-xl mb-6 border border-blue-100">
          <p class="text-xs text-blue-700 leading-relaxed">
            <strong>Info:</strong> Sistem akan membaca kolom <strong>Nama</strong>, <strong>Alamat</strong>, <strong>No HP</strong> (opsional), dan <strong>Nominal</strong> (atau <strong>Jumlah Uang</strong>). Kontak baru akan otomatis ditambahkan jika belum ada.
          </p>
          <p class="text-xs text-slate-500 mt-2">
            Silakan tentukan setelan acara dan tipe transaksi yang akan berlaku untuk <strong>seluruh data</strong> di file Excel ini:
          </p>
        </div>
        
        <form @submit.prevent="processImport" class="space-y-4">
          <div>
            <label class="block text-sm font-semibold text-slate-600 mb-1.5">Tipe Transaksi</label>
            <GlassSelect v-model="importConfig.tipe" :options="tipeOptions" />
          </div>
          <div>
            <label class="block text-sm font-semibold text-slate-600 mb-1.5">Jenis Acara</label>
            <GlassSelect v-model="importConfig.jenisAcaraLabel" :options="jenisAcaraOptions" @change="onImportJenisAcaraChange" />
          </div>
          <div>
            <label class="block text-sm font-semibold text-slate-600 mb-1.5">Tanggal Acara</label>
            <GlassDatePicker v-model="importConfig.tanggalAcara" />
          </div>

          <div class="pt-4 flex gap-3">
            <button type="button" @click="showImportModal = false; importFile = null" class="flex-1 btn-ghost border border-slate-200 bg-white hover:bg-slate-50">Batal</button>
            <button type="submit" class="flex-1 btn-primary bg-serenity-500 hover:bg-serenity-600 shadow-serenity-500/30" :disabled="isImporting">
              {{ isImporting ? 'Memproses...' : 'Mulai Impor' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Detail Modal -->
    <div v-if="showDetailModal" class="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 md:p-6" @click.self="showDetailModal = false">
      <div class="bg-white rounded-[2rem] w-full max-w-md shadow-2xl relative animate-blob max-h-[85vh] flex flex-col" style="animation-duration: 0.3s; animation-name: popIn;">
        
        <!-- Header -->
        <div class="px-8 pt-8 pb-5 flex justify-between items-start border-b border-slate-100">
          <div>
            <h2 class="font-display text-xl font-bold text-slate-800 mb-1">Rincian Transaksi</h2>
            <p class="text-sm text-slate-500">
              Kontak: <strong class="text-slate-700">{{ selectedKontakDetail?.nama_kontak }}</strong> ({{ filterKategori === 'suka_cita' ? 'Suka Cita' : 'Duka' }})
            </p>
            <p v-if="selectedKontakDetail?.no_hp || selectedKontakDetail?.alamat" class="text-xs text-slate-400 mt-1 font-medium">
              {{ [selectedKontakDetail?.no_hp, selectedKontakDetail?.alamat].filter(Boolean).join(' - ') }}
            </p>
          </div>
          <button @click="showDetailModal = false" class="text-slate-400 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 p-2 rounded-full transition-colors flex-shrink-0 mt-1">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <!-- Scrollable Content -->
        <div class="flex-1 overflow-y-auto custom-scrollbar">
          <div class="px-8 py-6">
            <div v-if="loadingDetail" class="text-center text-slate-400 py-8 animate-pulse">Memuat rincian...</div>
            <div v-else-if="detailTransaksi.length === 0" class="text-center text-slate-400 py-8">Tidak ada data.</div>
            <div v-else class="space-y-0">
              <div v-for="t in detailTransaksi" :key="t.id" class="p-5 rounded-2xl border border-slate-100 bg-white shadow-sm mb-4">
                
                <div class="flex justify-between items-start mb-4">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>
                    </div>
                    <div>
                      <p class="font-bold text-slate-800 text-base">{{ t.jenis_acara || (t.kategori_acara ? t.kategori_acara.replace('_', ' ') : '-') }}</p>
                      <p class="text-xs text-slate-500 font-medium mt-0.5">{{ formatDate(t.tanggal_acara) }}</p>
                    </div>
                  </div>
                </div>

                <div class="bg-slate-50 rounded-xl p-4 border border-slate-100 mb-4 flex justify-between items-center">
                  <div>
                    <p class="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Nominal</p>
                    <span 
                      class="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase"
                      :class="t.tipe === 'masuk' ? 'bg-serenity-100 text-serenity-700' : 'bg-quartz-100 text-quartz-700'"
                    >
                      {{ t.tipe === 'masuk' ? 'DITERIMA' : 'DIBERIKAN' }}
                    </span>
                  </div>
                  <p class="font-display font-bold text-xl" :class="t.tipe === 'masuk' ? 'text-serenity-600' : 'text-quartz-600'">
                    {{ formatRupiah(t.nominal) }}
                  </p>
                </div>

                <div v-if="t.keterangan" class="bg-yellow-50/50 rounded-xl p-4 border border-yellow-100/50 mb-4">
                  <p class="text-[10px] text-yellow-600/70 font-semibold uppercase mb-1 flex items-center gap-1.5">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-3.5 h-3.5"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
                    Catatan
                  </p>
                  <p class="text-sm font-medium text-slate-700 italic">{{ t.keterangan }}</p>
                </div>

                <div class="flex items-center justify-end gap-2 pt-1">
                  <button @click="editTransaksi(t.id)" class="text-xs font-semibold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 px-4 py-2 rounded-xl transition-colors" title="Edit">
                    Edit
                  </button>
                  <button @click="handleDelete(t.id)" class="text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-xl transition-colors" title="Hapus">
                    Hapus
                  </button>
                </div>
              </div>
            </div>
            
            <div class="pt-4">
              <button @click="showDetailModal = false" class="btn-primary w-full py-3 text-base shadow-lg shadow-serenity-500/30">
                Tutup Detail
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <ModalEditTransaksi 
      :show="showEditModal" 
      :transaksiId="selectedTransaksiId" 
      @close="showEditModal = false" 
      @updated="handleTransaksiUpdated" 
    />
    
    <ModalEditKontak 
      :show="showEditKontakModal" 
      :kontak="kontakToEdit" 
      @close="showEditKontakModal = false" 
      @updated="load" 
    />
  </div>
</template>
