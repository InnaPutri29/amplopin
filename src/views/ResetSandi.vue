<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'

const router = useRouter()
const { updatePassword, isReady } = useAuth()

const password = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const message = ref('')
const errorMsg = ref('')

// Jika user langsung membuka halaman ini tanpa token dari email, Supabase tidak akan mengenali session reset
// Session reset password ditangani secara otomatis oleh Supabase di balik layar ketika URL memiliki akses token.
onMounted(() => {
  // Hanya memastikan auth init selesai
})

async function handleResetPassword() {
  if (password.value !== confirmPassword.value) {
    errorMsg.value = 'Kata sandi baru dan konfirmasinya tidak cocok!'
    return
  }

  if (password.value.length < 6) {
    errorMsg.value = 'Kata sandi minimal 6 karakter!'
    return
  }

  loading.value = true
  message.value = ''
  errorMsg.value = ''
  
  const { error } = await updatePassword(password.value)
  
  if (error) {
    errorMsg.value = 'Gagal menyimpan kata sandi. Pastikan Anda membuka link yang valid atau coba minta link reset baru.'
  } else {
    message.value = 'Kata sandi berhasil diubah! Anda akan dialihkan...'
    setTimeout(() => {
      router.push('/dasbor')
    }, 2000)
  }
  
  loading.value = false
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
    <!-- Animated background accents -->
    <div class="absolute -top-32 -left-32 w-96 h-96 bg-serenity-200/40 rounded-full blur-3xl pointer-events-none animate-pulse"></div>
    <div class="absolute -bottom-32 -right-32 w-96 h-96 bg-quartz-200/40 rounded-full blur-3xl pointer-events-none animate-pulse animation-delay-2000"></div>

    <div class="card w-full max-w-md p-8 relative z-10">
      <div class="text-center mb-8">
        <div class="w-16 h-16 bg-gradient-to-tr from-serenity-500 to-quartz-400 rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-serenity-500/20 mb-6 rotate-3">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8 text-white">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
          </svg>
        </div>
        <h1 class="font-display font-bold text-3xl text-slate-800 tracking-tight">Atur Kata Sandi Baru</h1>
        <p class="text-slate-500 mt-2 text-sm">Silakan masukkan kata sandi baru Anda di bawah ini.</p>
      </div>

      <div v-if="message" class="bg-emerald-50 text-emerald-700 p-4 rounded-xl text-sm font-medium border border-emerald-100 mb-6 text-center leading-relaxed">
        {{ message }}
      </div>

      <div v-if="errorMsg" class="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium border border-red-100 mb-6 text-center leading-relaxed">
        {{ errorMsg }}
      </div>

      <form @submit.prevent="handleResetPassword" class="space-y-5">
        <div>
          <label class="block text-sm font-semibold text-slate-700 mb-1.5">Kata Sandi Baru</label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5 text-slate-400"><path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" /></svg>
            </div>
            <input 
              v-model="password" 
              type="password" 
              required 
              placeholder="Minimal 6 karakter" 
              class="input-field pl-11"
              :disabled="loading"
            />
          </div>
        </div>

        <div>
          <label class="block text-sm font-semibold text-slate-700 mb-1.5">Konfirmasi Kata Sandi Baru</label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5 text-slate-400"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <input 
              v-model="confirmPassword" 
              type="password" 
              required 
              placeholder="Ketik ulang kata sandi" 
              class="input-field pl-11"
              :disabled="loading"
            />
          </div>
        </div>

        <button type="submit" class="w-full btn-primary" :disabled="loading">
          {{ loading ? 'Menyimpan...' : 'Simpan Kata Sandi' }}
        </button>
      </form>
    </div>
  </div>
</template>
