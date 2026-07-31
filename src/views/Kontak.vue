<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { supabase } from '../lib/supabase'
import { useAuth } from '../composables/useAuth'
import ModalEditKontak from '../components/ModalEditKontak.vue'
import { confirmDialog, showError, showInfo, showToast, showSuccess } from '../utils/swal'
import * as XLSX from 'xlsx'

const { user } = useAuth()
const keyword = ref('')
const kontakList = ref([])
const loading = ref(true)

const showForm = ref(false)
const namaBaru = ref('')
const hpBaru = ref('')
const alamatBaru = ref('')
const saving = ref(false)

const showEditModal = ref(false)
const kontakToEdit = ref(null)

async function loadKontak() {
  loading.value = true
  let query = supabase.from('kontak').select('*').order('nama')
  if (keyword.value.trim()) {
    const safeKw = keyword.value.trim().replace(/,/g, ' ')
    query = query.or(`nama.ilike.%${safeKw}%,no_hp.ilike.%${safeKw}%,alamat_lengkap.ilike.%${safeKw}%`)
  }
  const { data, error } = await query
  if (!error) kontakList.value = data
  loading.value = false
}

let debounceTimer
watch(keyword, () => {
  clearTimeout(debounceTimer)
  currentPage.value = 1
  debounceTimer = setTimeout(loadKontak, 250)
})

const itemsPerPage = ref(10)
const currentPage = ref(1)

const totalPages = computed(() => Math.ceil(kontakList.value.length / itemsPerPage.value) || 1)

const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return kontakList.value.slice(start, end)
})

async function tambahKontak() {
  if (!namaBaru.value.trim() || !alamatBaru.value.trim()) return
  saving.value = true
  const { error } = await supabase.from('kontak').insert({
    keluarga_id: user.value.id,
    nama: namaBaru.value.trim(),
    no_hp: hpBaru.value.trim() || null,
    alamat_lengkap: alamatBaru.value.trim(),
  })
  saving.value = false
  if (!error) {
    namaBaru.value = ''
    hpBaru.value = ''
    alamatBaru.value = ''
    showForm.value = false
    loadKontak()
  }
}

function openEdit(k) {
  kontakToEdit.value = k
  showEditModal.value = true
}

async function hapusKontak(k) {
  const { data: transaksis } = await supabase
    .from('transaksi')
    .select('id')
    .eq('kontak_id', k.id)
    .limit(1)
    
  if (transaksis && transaksis.length > 0) {
    showInfo('Tidak Bisa Dihapus', 'Hapus riwayat transaksinya terlebih dahulu di halaman Riwayat.')
    return
  }

  const isConfirmed = await confirmDialog('Hapus Kontak', `Apakah Anda yakin ingin menghapus kontak "${k.nama}"?`)
  if (!isConfirmed) return

  const { error } = await supabase
    .from('kontak')
    .delete()
    .eq('id', k.id)
  if (!error) {
    showToast('Kontak berhasil dihapus')
    loadKontak()
  } else {
    showError('Gagal', 'Gagal menghapus kontak: ' + error.message)
  }
}

const fileInput = ref(null)
const importFile = ref(null)

function triggerFileInput() {
  fileInput.value?.click()
}

function handleFileSelect(event) {
  const file = event.target.files[0]
  if (!file) return
  importFile.value = file
  processImport()
}

async function processImport() {
  if (!importFile.value) return
  loading.value = true
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
        
        if (!nama) continue
        
        const existingKontak = kontakList.value.find(k => k.nama.toLowerCase() === String(nama).trim().toLowerCase())
        if (!existingKontak) {
          const { error } = await supabase.from('kontak').insert({
            keluarga_id: user.value.id,
            nama: String(nama).trim(),
            alamat_lengkap: alamat ? String(alamat).trim() : '-',
            no_hp: noHp ? String(noHp).trim() : null
          })
          if (!error) importedCount++
        }
      }
      
      if (importedCount > 0) {
        showSuccess('Berhasil', `${importedCount} kontak baru berhasil diimpor!`)
        loadKontak()
      } else {
        showInfo('Info', 'Tidak ada kontak baru yang ditambahkan (mungkin data sudah ada semua atau format salah).')
        loading.value = false
      }
    } catch (err) {
      showError('Gagal', 'Terjadi kesalahan saat membaca file Excel.')
      loading.value = false
    } finally {
      importFile.value = null
      if (fileInput.value) fileInput.value.value = ''
    }
  }
  reader.readAsArrayBuffer(importFile.value)
}

function downloadTemplate() {
  const ws = XLSX.utils.aoa_to_sheet([
    ['Nama', 'Alamat', 'No HP (Opsional)'],
    ['Budi Santoso', 'Jl. Merdeka No 1', '081234567890'],
    ['Siti Aminah', 'Desa Sukamaju', '']
  ])
  
  const wscols = [
    { wch: 25 },
    { wch: 35 },
    { wch: 20 }
  ]
  ws['!cols'] = wscols
  
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Template')
  XLSX.writeFile(wb, 'Template_Impor_Kontak.xlsx')
}

onMounted(loadKontak)
</script>

<template>
  <div>
    <div class="mb-6 px-2 flex flex-col md:flex-row md:justify-between md:items-end gap-4">
      <div>
        <h1 class="font-display text-3xl font-bold text-slate-800">Buku Kontak</h1>
        <p class="text-slate-500 text-sm mt-1">Kelola daftar kontak untuk pencatatan amplop.</p>
      </div>
      <div class="flex items-center gap-2 flex-wrap">
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
        <button v-if="!showForm" class="btn-primary shadow-none py-2 px-4 text-sm whitespace-nowrap" @click="showForm = true">
          + Tambah
        </button>
      </div>
    </div>

    <div class="card p-6 md:p-8 mb-6 relative overflow-hidden">
      <!-- Decorative background blur -->
      <div class="absolute -right-20 -top-20 w-64 h-64 bg-serenity-100 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
      
      <div class="relative z-10">
        <div class="relative mb-6">
          <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5 text-slate-400">
              <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
          </div>
          <input
            v-model="keyword"
            type="text"
            placeholder="Cari nama, alamat, atau no HP..."
            class="input-field pl-11"
          />
        </div>

        <transition enter-active-class="transition duration-300 ease-out" enter-from-class="transform -translate-y-4 opacity-0" enter-to-class="transform translate-y-0 opacity-100" leave-active-class="transition duration-200 ease-in" leave-from-class="transform translate-y-0 opacity-100" leave-to-class="transform -translate-y-4 opacity-0">
          <form v-if="showForm" class="bg-slate-50/50 p-5 rounded-2xl border border-white/60 mb-6 space-y-4 shadow-inner" @submit.prevent="tambahKontak">
            <h3 class="font-semibold text-slate-700 text-sm uppercase tracking-wider mb-2">Kontak Baru</h3>
            <input v-model="namaBaru" type="text" required placeholder="Nama Lengkap" class="input-field" />
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input v-model="alamatBaru" type="text" placeholder="Alamat Lengkap" required class="input-field" />
              <input v-model="hpBaru" type="text" placeholder="No. HP (opsional)" class="input-field" />
            </div>
            <div class="flex gap-3 pt-2">
              <button type="button" class="btn-ghost flex-1 border border-slate-200 bg-white hover:bg-slate-50" @click="showForm = false">Batal</button>
              <button type="submit" class="btn-primary flex-1 bg-serenity-500 hover:bg-serenity-600 shadow-serenity-500/30" :disabled="saving">
                {{ saving ? 'Menyimpan...' : 'Simpan' }}
              </button>
            </div>
          </form>
        </transition>

        <div v-if="loading" class="text-slate-400 text-sm animate-pulse flex justify-center py-8">Memuat...</div>
        <div v-else-if="kontakList.length === 0" class="text-center text-slate-500 text-sm py-12 flex flex-col items-center">
          <div class="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8 text-slate-300">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
            </svg>
          </div>
          Belum ada kontak ditemukan.
        </div>
        <ul v-else class="space-y-3 overflow-y-auto max-h-[500px] custom-scrollbar pr-2">
          <RouterLink v-for="k in paginatedData" :key="k.id" :to="`/kontak/${k.id}`" class="flex items-center justify-between p-4 rounded-[1.25rem] hover:bg-slate-50/80 transition-colors border border-transparent hover:border-slate-100 group block">
            <div class="flex items-center gap-4">
              <div class="w-10 h-10 rounded-full bg-gradient-to-tr from-quartz-100 to-serenity-100 flex items-center justify-center text-serenity-600 font-bold shadow-sm shrink-0">
                {{ k.nama.charAt(0).toUpperCase() }}
              </div>
              <div>
                <p class="font-bold text-slate-700 group-hover:text-serenity-600 transition-colors">{{ k.nama }}</p>
                <p v-if="k.no_hp || k.alamat_lengkap" class="text-xs text-slate-400 mt-0.5 font-medium">
                  {{ [k.no_hp, k.alamat_lengkap].filter(Boolean).join(' - ') }}
                </p>
              </div>
            </div>
            <div class="flex justify-end items-center gap-2">
              <button @click.prevent="openEdit(k)" class="text-xs font-semibold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 p-2 md:px-3 md:py-1.5 rounded-lg transition-colors flex items-center gap-1.5" title="Edit">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" /></svg>
                <span class="hidden md:inline">Edit</span>
              </button>
              <button @click.prevent="hapusKontak(k)" class="text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 p-2 md:px-3 md:py-1.5 rounded-lg transition-colors flex items-center gap-1.5" title="Hapus">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
                <span class="hidden md:inline">Hapus</span>
              </button>
            </div>
          </RouterLink>
        </ul>

        <!-- Pagination Controls -->
        <div v-if="!loading && kontakList.length > 0" class="flex flex-col md:flex-row justify-between items-center mt-6 pt-6 border-t border-slate-100 gap-4">
          <div class="text-sm text-slate-500 flex items-center flex-wrap gap-2">
            <div>
              Menampilkan <span class="font-bold text-slate-700">{{ (currentPage - 1) * itemsPerPage + 1 }}</span> - 
              <span class="font-bold text-slate-700">{{ Math.min(currentPage * itemsPerPage, kontakList.length) }}</span> 
              dari <span class="font-bold text-slate-700">{{ kontakList.length }}</span> kontak
            </div>
            <div class="hidden md:block text-slate-300">|</div>
            <div class="flex items-center">
              Tampilkan:
              <select v-model="itemsPerPage" @change="currentPage = 1" class="ml-2 border border-slate-200 rounded-lg text-slate-700 bg-white focus:ring-serenity-300 focus:border-serenity-300 text-sm py-1 px-2 outline-none shadow-sm cursor-pointer">
                <option :value="10">10</option>
                <option :value="20">20</option>
                <option :value="30">30</option>
                <option :value="50">50</option>
                <option :value="100">100</option>
              </select>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <button 
              @click="currentPage > 1 && currentPage--" 
              :disabled="currentPage === 1"
              class="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </button>
            
            <div class="flex gap-1 flex-wrap justify-center max-w-[200px] md:max-w-none">
              <button 
                v-for="page in totalPages" 
                :key="page"
                @click="currentPage = page"
                class="w-8 h-8 flex items-center justify-center rounded-lg text-sm font-semibold transition-colors"
                :class="currentPage === page ? 'bg-serenity-500 text-white shadow-md shadow-serenity-500/30' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'"
              >
                {{ page }}
              </button>
            </div>

            <button 
              @click="currentPage < totalPages && currentPage++" 
              :disabled="currentPage === totalPages"
              class="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
                <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <ModalEditKontak 
      :show="showEditModal" 
      :kontak="kontakToEdit" 
      @close="showEditModal = false" 
      @updated="loadKontak" 
    />
  </div>
</template>
