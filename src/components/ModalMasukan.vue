<script setup>
import { ref } from 'vue'
import { supabase } from '../lib/supabase'
import { useAuth } from '../composables/useAuth'

const props = defineProps({
  modelValue: Boolean
})

const emit = defineEmits(['update:modelValue'])

const { user } = useAuth()
const pesan = ref('')
const isLoading = ref(false)
const showSuccess = ref(false)
const error = ref('')

const closeModal = () => {
  emit('update:modelValue', false)
  // Reset after transition
  setTimeout(() => {
    pesan.value = ''
    showSuccess.value = false
    error.value = ''
  }, 300)
}

const submitMasukan = async () => {
  if (!pesan.value.trim()) {
    error.value = 'Pesan tidak boleh kosong.'
    return
  }

  isLoading.value = true
  error.value = ''

  try {
    const { error: sbError } = await supabase
      .from('masukan')
      .insert({
        keluarga_id: user.value.id,
        pesan: pesan.value.trim()
      })

    if (sbError) throw sbError
    
    showSuccess.value = true
    setTimeout(() => {
      closeModal()
    }, 2000)
  } catch (err) {
    console.error('Gagal mengirim masukan:', err)
    error.value = 'Terjadi kesalahan saat mengirim masukan.'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <transition
    enter-active-class="transition duration-300 ease-out"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition duration-200 ease-in"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div v-if="modelValue" class="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-0">
      <div class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" @click="closeModal"></div>
      
      <transition
        enter-active-class="transition duration-300 ease-out"
        enter-from-class="opacity-0 translate-y-8 sm:translate-y-0 sm:scale-95"
        enter-to-class="opacity-100 translate-y-0 sm:scale-100"
        leave-active-class="transition duration-200 ease-in"
        leave-from-class="opacity-100 translate-y-0 sm:scale-100"
        leave-to-class="opacity-0 translate-y-8 sm:translate-y-0 sm:scale-95"
      >
        <div v-if="modelValue" class="relative bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden border border-white/50">
          <div class="p-6 md:p-8">
            <h2 class="text-2xl font-bold font-display text-slate-800 mb-2">Beri Masukan</h2>
            <p class="text-slate-500 text-sm mb-6">Punya saran, keluhan, atau ide fitur baru? Sampaikan langsung ke tim pengembang.</p>
            
            <div v-if="showSuccess" class="bg-serenity-50 border border-serenity-200 text-serenity-700 p-4 rounded-xl flex items-center gap-3 mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6 text-serenity-500">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p class="font-bold">Terima Kasih!</p>
                <p class="text-sm opacity-90">Masukan Anda telah berhasil dikirim.</p>
              </div>
            </div>
            
            <form v-else @submit.prevent="submitMasukan">
              <div class="mb-4">
                <textarea 
                  v-model="pesan" 
                  rows="4"
                  class="w-full bg-slate-50 border-slate-200 rounded-xl px-4 py-3 text-slate-700 focus:border-serenity-400 focus:ring-serenity-400 transition-all resize-none shadow-inner"
                  placeholder="Ketikkan pesan Anda di sini..."
                ></textarea>
                <p v-if="error" class="text-red-500 text-xs mt-1">{{ error }}</p>
              </div>
              
              <div class="flex gap-3 justify-end mt-8">
                <button 
                  type="button" 
                  @click="closeModal"
                  class="px-5 py-2.5 rounded-xl font-semibold text-slate-500 hover:bg-slate-100 transition-colors"
                  :disabled="isLoading"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  class="btn-primary px-6 py-2.5 shadow-md disabled:opacity-50"
                  :disabled="isLoading"
                >
                  {{ isLoading ? 'Mengirim...' : 'Kirim Masukan' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </transition>
    </div>
  </transition>
</template>
