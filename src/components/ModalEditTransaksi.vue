<script setup>
import { ref, watch, onMounted, computed, onErrorCaptured } from 'vue'
import { supabase } from '../lib/supabase'
import { JENIS_ACARA_DEFAULT, KATEGORI_LABEL } from '../constants/jenisAcara'
import GlassSelect from './GlassSelect.vue'
import GlassDatePicker from './GlassDatePicker.vue'
import { showError, showToast } from '../utils/swal'

onErrorCaptured((err, instance, info) => {
  console.warn('Caught error in ModalEditTransaksi:', err, info)
  return false
})

const props = defineProps({
  show: Boolean,
  transaksiId: String
})

const emit = defineEmits(['close', 'updated'])

const loading = ref(false)
const saving = ref(false)
const formData = ref({
  tipe: 'masuk',
  kontak_id: '',
  nominal: 0,
  tanggal_acara: '',
  kategori_acara: 'suka_cita',
  jenis_acara: JENIS_ACARA_DEFAULT[0].label,
  keterangan: ''
})

function onJenisAcaraChange() {
  const found = JENIS_ACARA_DEFAULT.find((j) => j.label === formData.value.jenis_acara)
  if (found) formData.value.kategori_acara = found.kategori_acara
}

const nominalDisplay = ref('')

function formatNominal(e) {
  let val = e.target.value.replace(/\D/g, '')
  if (!val) {
    nominalDisplay.value = ''
    formData.value.nominal = 0
    e.target.value = ''
    return
  }
  formData.value.nominal = parseInt(val, 10)
  nominalDisplay.value = formData.value.nominal.toLocaleString('id-ID')
  if (e.target.value !== nominalDisplay.value) {
    e.target.value = nominalDisplay.value
  }
}

const tipeOptions = [
  { label: 'Diterima (Amplop Masuk)', value: 'masuk' },
  { label: 'Diberikan (Amplop Keluar)', value: 'keluar' }
]
const jenisAcaraOptions = JENIS_ACARA_DEFAULT.map(j => ({ label: j.label, value: j.label }))

const kontakList = ref([])
const kontakOptions = computed(() => kontakList.value.map(k => ({ label: k.nama, value: k.id })))

onMounted(async () => {
  const { data } = await supabase.from('kontak').select('id, nama').order('nama')
  if (data) kontakList.value = data
})

watch(() => props.show, async (newVal) => {
  if (newVal && props.transaksiId) {
    loading.value = true
    const { data } = await supabase
      .from('transaksi')
      .select('*')
      .eq('id', props.transaksiId)
      .single()
      
    if (data) {
      formData.value = {
        tipe: data.tipe,
        kontak_id: data.kontak_id,
        nominal: data.nominal,
        tanggal_acara: data.tanggal_acara,
        kategori_acara: data.kategori_acara,
        jenis_acara: data.jenis_acara || JENIS_ACARA_DEFAULT[0].label,
        keterangan: data.keterangan || ''
      }
      nominalDisplay.value = data.nominal.toLocaleString('id-ID')
    }
    loading.value = false
  }
})

async function handleSave() {
  saving.value = true
  const { error } = await supabase
    .from('transaksi')
    .update({
      tipe: formData.value.tipe,
      kontak_id: formData.value.kontak_id,
      nominal: formData.value.nominal,
      tanggal_acara: formData.value.tanggal_acara || new Date().toISOString().split('T')[0],
      kategori_acara: formData.value.kategori_acara,
      jenis_acara: formData.value.jenis_acara,
      keterangan: formData.value.keterangan || null
    })
    .eq('id', props.transaksiId)
    
  saving.value = false
  if (!error) {
    showToast('Transaksi berhasil diperbarui')
    emit('updated')
    emit('close')
  } else {
    showError('Gagal', 'Gagal menyimpan perubahan: ' + error.message)
  }
}
</script>

<template>
  <div v-if="show" class="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 md:p-6" @click.self="emit('close')">
    <div class="bg-white rounded-[2rem] w-full max-w-md shadow-2xl relative animate-blob max-h-[85vh] flex flex-col" style="animation-duration: 0.3s; animation-name: popIn;">
      <!-- Header -->
      <div class="px-8 pt-8 pb-5 flex justify-between items-center border-b border-slate-100">
        <h2 class="font-display text-xl font-bold text-slate-800">Edit Transaksi</h2>
        <button @click="emit('close')" class="text-slate-400 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 p-2 rounded-full transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <!-- Scrollable Content -->
      <div class="flex-1 overflow-y-auto custom-scrollbar">
        <div class="px-8 py-6">
          <div v-if="loading" class="text-center text-slate-400 py-8">Memuat data...</div>
          
          <form v-else @submit.prevent="handleSave" class="space-y-5 pb-2">
            <div>
              <label class="block text-sm font-semibold text-slate-600 mb-1.5">Jenis Transaksi</label>
              <GlassSelect v-model="formData.tipe" :options="tipeOptions" />
            </div>
            
            <div>
              <label class="block text-sm font-semibold text-slate-600 mb-1.5">Kontak</label>
              <GlassSelect v-model="formData.kontak_id" :options="kontakOptions" placeholder="Pilih Kontak" />
            </div>

            <div>
              <label class="block text-sm font-semibold text-slate-600 mb-1.5">Nominal (Rp)</label>
              <input :value="nominalDisplay" @input="formatNominal" type="text" required class="input-field font-display font-bold text-lg" />
            </div>

            <div>
              <label class="block text-sm font-semibold text-slate-600 mb-1.5">Tanggal (Opsional)</label>
              <GlassDatePicker v-model="formData.tanggal_acara" />
            </div>
            
            <div>
              <label class="block text-sm font-semibold text-slate-600 mb-1.5">Jenis Acara</label>
              <GlassSelect v-model="formData.jenis_acara" :options="jenisAcaraOptions" @change="onJenisAcaraChange" />
            </div>

            <div>
              <label class="block text-sm font-semibold text-slate-600 mb-1.5">Keterangan (Opsional)</label>
              <input v-model="formData.keterangan" type="text" placeholder="Contoh: Nikahan Budi" class="input-field" />
            </div>

            <div class="pt-6">
              <button type="submit" class="btn-primary w-full py-3 text-base shadow-lg shadow-serenity-500/30" :disabled="saving">
                {{ saving ? 'Menyimpan...' : 'Simpan Perubahan' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes popIn {
  0% { transform: scale(0.95); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}

.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
  margin: 16px 0;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #cbd5e1;
  border-radius: 20px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background-color: #94a3b8;
}
</style>
