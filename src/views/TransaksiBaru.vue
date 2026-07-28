<script setup>
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../lib/supabase'
import { useAuth } from '../composables/useAuth'
import { JENIS_ACARA_DEFAULT } from '../constants/jenisAcara'

const router = useRouter()
const { user } = useAuth()

const tipe = ref('masuk')
const keyword = ref('')
const hasilKontak = ref([])
const kontakTerpilih = ref(null)
const showDropdown = ref(false)
const alamatBaru = ref('')

const jenisAcaraLabel = ref(JENIS_ACARA_DEFAULT[0].label)
const kategoriAcara = ref(JENIS_ACARA_DEFAULT[0].kategori_acara)
const tanggalAcara = ref(new Date().toISOString().slice(0, 10))
const nominalDisplay = ref('')
const nominalValue = ref(0)
const keterangan = ref('')

const saving = ref(false)
const errorMsg = ref('')
const successMsg = ref('')

function formatNominal(e) {
  let val = e.target.value.replace(/\D/g, '')
  if (!val) {
    nominalDisplay.value = ''
    nominalValue.value = 0
    e.target.value = ''
    return
  }
  nominalValue.value = parseInt(val, 10)
  nominalDisplay.value = nominalValue.value.toLocaleString('id-ID')
  if (e.target.value !== nominalDisplay.value) {
    e.target.value = nominalDisplay.value
  }
}

let debounceTimer
watch(keyword, () => {
  clearTimeout(debounceTimer)
  if (!keyword.value.trim() || kontakTerpilih.value) {
    hasilKontak.value = []
    return
  }
  debounceTimer = setTimeout(async () => {
    const { data } = await supabase
      .from('kontak')
      .select('id, nama, no_hp, alamat_lengkap')
      .ilike('nama', `%${keyword.value.trim()}%`)
      .limit(8)
    hasilKontak.value = data || []
    showDropdown.value = true
  }, 250)
})

function onKeywordInput() {
  kontakTerpilih.value = null
}

function pilihKontak(k) {
  kontakTerpilih.value = k
  keyword.value = k.nama
  showDropdown.value = false
  hasilKontak.value = []
}

function onJenisAcaraChange() {
  const found = JENIS_ACARA_DEFAULT.find((j) => j.label === jenisAcaraLabel.value)
  if (found) kategoriAcara.value = found.kategori_acara
}

async function simpanTransaksi() {
  errorMsg.value = ''
  successMsg.value = ''

  if (!keyword.value.trim()) {
    errorMsg.value = 'Nama kontak (Dari / Kepada) harus diisi.'
    return
  }
  if (!nominalValue.value || nominalValue.value <= 0) {
    errorMsg.value = 'Nominal harus diisi.'
    return
  }

  saving.value = true
  let finalKontakId = null

  if (kontakTerpilih.value) {
    finalKontakId = kontakTerpilih.value.id
  } else {
    if (!alamatBaru.value.trim()) {
      errorMsg.value = 'Alamat kontak baru wajib diisi.'
      saving.value = false
      return
    }
    // Create new contact
    const { data: newK, error: errK } = await supabase.from('kontak').insert({
      keluarga_id: user.value.id,
      nama: keyword.value.trim(),
      alamat_lengkap: alamatBaru.value.trim()
    }).select().single()

    if (errK) {
      errorMsg.value = 'Gagal membuat kontak baru: ' + errK.message
      saving.value = false
      return
    }
    finalKontakId = newK.id
  }

  const { error } = await supabase.from('transaksi').insert({
    keluarga_id: user.value.id,
    kontak_id: finalKontakId,
    tipe: tipe.value,
    kategori_acara: kategoriAcara.value,
    jenis_acara: jenisAcaraLabel.value,
    tanggal_acara: tanggalAcara.value || null,
    nominal: nominalValue.value,
    keterangan: keterangan.value || null,
  })
  saving.value = false

  if (error) {
    errorMsg.value = 'Gagal menyimpan: ' + error.message
    return
  }
  successMsg.value = 'Transaksi berhasil dicatat.'
  setTimeout(() => router.push({ name: 'dashboard' }), 900)
}
</script>

<template>
  <div class="max-w-2xl mx-auto">
    <div class="mb-6 px-2">
      <h1 class="font-display text-3xl font-bold text-slate-800">Catat Amplop</h1>
      <p class="text-slate-500 text-sm mt-1">Tambahkan catatan pemasukan atau pengeluaran baru.</p>
    </div>

    <div class="card p-6 md:p-8">
      <div class="flex p-1 bg-slate-100/50 rounded-[1.25rem] mb-8 border border-white/60 shadow-inner">
        <button
          class="flex-1 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300"
          :class="tipe === 'masuk' ? 'bg-white text-serenity-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'"
          @click="tipe = 'masuk'"
        >
          Amplop Masuk
        </button>
        <button
          class="flex-1 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300"
          :class="tipe === 'keluar' ? 'bg-white text-quartz-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'"
          @click="tipe = 'keluar'"
        >
          Amplop Keluar
        </button>
      </div>

      <form class="space-y-5" @submit.prevent="simpanTransaksi">
        <div class="relative">
          <label class="block text-sm font-semibold text-slate-600 mb-1.5">Dari / Kepada</label>
          <input
            v-model="keyword"
            type="text"
            placeholder="Cari atau ketik nama kontak baru..."
            class="input-field"
            @input="onKeywordInput"
          />
          <ul v-if="hasilKontak.length > 0 && showDropdown" class="absolute z-10 w-full bg-white/90 backdrop-blur-md border border-white/80 rounded-xl mt-2 shadow-xl overflow-hidden max-h-60 overflow-y-auto">
            <li
              v-for="k in hasilKontak"
              :key="k.id"
              class="px-4 py-3 hover:bg-slate-50 cursor-pointer transition-colors border-b border-slate-100/50 last:border-0"
              @click="pilihKontak(k)"
            >
              <p class="font-bold text-slate-700">{{ k.nama }}</p>
              <p v-if="k.no_hp || k.alamat_lengkap" class="text-xs text-slate-400 mt-0.5">
                {{ [k.no_hp, k.alamat_lengkap].filter(Boolean).join(' · ') }}
              </p>
            </li>
          </ul>
          
          <div v-if="!kontakTerpilih && keyword.trim().length > 0" class="mt-3 p-4 bg-serenity-50/50 rounded-xl border border-serenity-100">
            <p class="text-xs font-semibold text-serenity-700 mb-2 flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Kontak Baru
            </p>
            <input
              v-model="alamatBaru"
              type="text"
              required
              placeholder="Alamat Lengkap"
              class="input-field bg-white py-2 text-sm"
            />
          </div>
          
          <p v-if="kontakTerpilih" class="text-xs font-medium text-serenity-600 mt-2 flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clip-rule="evenodd" />
            </svg>
            Kontak terpilih: {{ kontakTerpilih.nama }}
          </p>
        </div>

        <div>
          <label class="block text-sm font-semibold text-slate-600 mb-1.5">Jenis Acara</label>
          <select v-model="jenisAcaraLabel" class="input-field" @change="onJenisAcaraChange">
            <option v-for="j in JENIS_ACARA_DEFAULT" :key="j.label" :value="j.label">{{ j.label }}</option>
          </select>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-semibold text-slate-600 mb-1.5">Tanggal (Opsional)</label>
            <input v-model="tanggalAcara" type="date" class="input-field" />
          </div>

          <div>
            <label class="block text-sm font-semibold text-slate-600 mb-1.5">Nominal (Rp)</label>
            <input :value="nominalDisplay" @input="formatNominal" type="text" required placeholder="500.000" class="input-field font-display font-bold text-lg" />
          </div>
        </div>

        <div>
          <label class="block text-sm font-semibold text-slate-600 mb-1.5">Keterangan (opsional)</label>
          <textarea v-model="keterangan" class="input-field resize-none" rows="2" placeholder="Tulis catatan tambahan..."></textarea>
        </div>

        <div v-if="errorMsg || successMsg" class="p-3 rounded-xl text-sm font-medium" :class="errorMsg ? 'bg-red-50 text-red-600' : 'bg-serenity-50 text-serenity-700'">
          {{ errorMsg || successMsg }}
        </div>

        <button type="submit" class="btn-primary w-full mt-4" :disabled="saving" :class="tipe === 'masuk' ? 'bg-serenity-500 hover:bg-serenity-600 shadow-serenity-500/30' : 'bg-quartz-500 hover:bg-quartz-600 shadow-quartz-500/30'">
          {{ saving ? 'Menyimpan...' : 'Simpan Transaksi' }}
        </button>
      </form>
    </div>
  </div>
</template>
