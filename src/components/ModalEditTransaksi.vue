<script setup>
import { ref, watch, onMounted, computed } from 'vue'
import { supabase } from '../lib/supabase'
import { JENIS_ACARA_DEFAULT } from '../constants/jenisAcara'
import GlassSelect from './GlassSelect.vue'
import GlassDatePicker from './GlassDatePicker.vue'
import { showAlert } from '../utils/alert'

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
      tanggal_acara: formData.value.tanggal_acara || null,
      kategori_acara: formData.value.kategori_acara,
      jenis_acara: formData.value.jenis_acara,
      keterangan: formData.value.keterangan || null
    })
    .eq('id', props.transaksiId)
    
  saving.value = false
  if (!error) {
    emit('updated')
    emit('close')
  } else {
    showAlert('Gagal Menyimpan', 'Gagal menyimpan perubahan: ' + error.message, 'error')
  }
}
</script>

<template>
  <div v-if="show" class="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4" @click.self="emit('close')">
    <div class="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl relative animate-blob max-h-[90vh] overflow-y-auto flex flex-col" style="animation-duration: 0.3s; animation-name: popIn;">
      <button @click="emit('close')" class="absolute top-4 right-4 text-slate-400 hover:text-slate-700">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      
      <h2 class="font-display text-xl font-bold text-slate-800 mb-6">Edit Transaksi</h2>
      
      <div v-if="loading" class="text-center text-slate-400 py-8">Memuat data...</div>
      
      <form v-else @submit.prevent="handleSave" class="space-y-4">
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
          <input :value="nominalDisplay" @input="formatNominal" type="text" required class="input-field" />
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

        <div class="pt-4">
          <button type="submit" class="btn-primary w-full" :disabled="saving">
            {{ saving ? 'Menyimpan...' : 'Simpan Perubahan' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
@keyframes popIn {
  0% { transform: scale(0.95); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}
</style>
