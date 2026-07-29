<script setup>
import { ref, watch } from 'vue'
import { supabase } from '../lib/supabase'

const props = defineProps({
  show: Boolean,
  kontak: Object
})

const emit = defineEmits(['close', 'updated'])

const saving = ref(false)
const formData = ref({
  nama: '',
  no_hp: '',
  alamat_lengkap: ''
})

watch(() => props.show, (newVal) => {
  if (newVal && props.kontak) {
    formData.value = {
      nama: props.kontak.nama,
      no_hp: props.kontak.no_hp || '',
      alamat_lengkap: props.kontak.alamat_lengkap || ''
    }
  }
})

async function handleSave() {
  saving.value = true
  const { error } = await supabase
    .from('kontak')
    .update({
      nama: formData.value.nama,
      no_hp: formData.value.no_hp || null,
      alamat_lengkap: formData.value.alamat_lengkap
    })
    .eq('id', props.kontak.id)
    
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
    <div class="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl relative animate-blob" style="animation-duration: 0.3s; animation-name: popIn;">
      <button @click="emit('close')" class="absolute top-4 right-4 text-slate-400 hover:text-slate-700">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      
      <h2 class="font-display text-xl font-bold text-slate-800 mb-6">Edit Kontak</h2>
      
      <form @submit.prevent="handleSave" class="space-y-4">
        <div>
          <label class="block text-sm font-semibold text-slate-600 mb-1.5">Nama Lengkap</label>
          <input v-model="formData.nama" type="text" required class="input-field" />
        </div>
        
        <div>
          <label class="block text-sm font-semibold text-slate-600 mb-1.5">Alamat Lengkap</label>
          <input v-model="formData.alamat_lengkap" type="text" required class="input-field" />
        </div>
        
        <div>
          <label class="block text-sm font-semibold text-slate-600 mb-1.5">No HP (Opsional)</label>
          <input v-model="formData.no_hp" type="text" class="input-field" />
        </div>

        <div class="pt-4 flex gap-3">
          <button type="button" @click="emit('close')" class="flex-1 btn-ghost border border-slate-200 bg-white hover:bg-slate-50">Batal</button>
          <button type="submit" class="flex-1 btn-primary" :disabled="saving">
            {{ saving ? 'Menyimpan...' : 'Simpan' }}
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
