<script setup>
import { ref, watch, onMounted } from 'vue'
import { supabase } from '../lib/supabase'

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
  tanggal: '',
  kategori_acara: 'suka_cita',
  keterangan: ''
})

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

const kontakList = ref([])

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
        tanggal: data.tanggal,
        kategori_acara: data.kategori_acara,
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
      tanggal: formData.value.tanggal || null,
      kategori_acara: formData.value.kategori_acara,
      keterangan: formData.value.keterangan || null
    })
    .eq('id', props.transaksiId)
    
  saving.value = false
  if (!error) {
    emit('updated')
    emit('close')
  } else {
    alert('Gagal menyimpan perubahan: ' + error.message)
  }
}
</script>

<template>
  <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
    <div class="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl relative animate-blob" style="animation-duration: 0.3s; animation-name: popIn;">
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
          <select v-model="formData.tipe" class="input-field" required>
            <option value="masuk">Diterima (Amplop Masuk)</option>
            <option value="keluar">Diberikan (Amplop Keluar)</option>
          </select>
        </div>
        
        <div>
          <label class="block text-sm font-semibold text-slate-600 mb-1.5">Kontak</label>
          <select v-model="formData.kontak_id" class="input-field" required>
            <option value="" disabled>Pilih Kontak</option>
            <option v-for="k in kontakList" :key="k.id" :value="k.id">{{ k.nama }}</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-semibold text-slate-600 mb-1.5">Nominal (Rp)</label>
          <input :value="nominalDisplay" @input="formatNominal" type="text" required class="input-field" />
        </div>

        <div>
          <label class="block text-sm font-semibold text-slate-600 mb-1.5">Tanggal (Opsional)</label>
          <input v-model="formData.tanggal" type="date" class="input-field" />
        </div>
        
        <div>
          <label class="block text-sm font-semibold text-slate-600 mb-1.5">Kategori Acara</label>
          <select v-model="formData.kategori_acara" class="input-field" required>
            <option value="suka_cita">Suka Cita (Pernikahan, Lahiran, dll)</option>
            <option value="duka">Duka (Meninggal, Sakit, dll)</option>
          </select>
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
