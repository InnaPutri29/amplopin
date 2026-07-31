<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'

const router = useRouter()
const { sendPasswordResetEmail } = useAuth()

const email = ref('')
const loading = ref(false)
const message = ref('')
const errorMsg = ref('')

async function handleResetRequest() {
  if (!email.value) return
  loading.value = true
  message.value = ''
  errorMsg.value = ''
  
  const { error } = await sendPasswordResetEmail(email.value)
  
  if (error) {
    errorMsg.value = error.message
  } else {
    message.value = 'Tautan reset kata sandi telah dikirim ke email Anda. Silakan periksa kotak masuk (atau spam) Anda.'
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
            <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
          </svg>
        </div>
        <h1 class="font-display font-bold text-3xl text-slate-800 tracking-tight">Lupa Kata Sandi?</h1>
        <p class="text-slate-500 mt-2 text-sm">Masukkan email yang terdaftar untuk mengatur ulang kata sandi Anda.</p>
      </div>

      <div v-if="message" class="bg-emerald-50 text-emerald-700 p-4 rounded-xl text-sm font-medium border border-emerald-100 mb-6 text-center leading-relaxed">
        {{ message }}
      </div>

      <div v-if="errorMsg" class="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium border border-red-100 mb-6 text-center">
        {{ errorMsg }}
      </div>

      <form @submit.prevent="handleResetRequest" class="space-y-5">
        <div>
          <label class="block text-sm font-semibold text-slate-700 mb-1.5">Alamat Email</label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5 text-slate-400"><path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.909A2.25 2.25 0 012.25 6.993V6.75m19.5 0v.243m0-2.493V17.25" /></svg>
            </div>
            <input 
              v-model="email" 
              type="email" 
              required 
              placeholder="nama@email.com" 
              class="input-field pl-11"
              :disabled="loading"
            />
          </div>
        </div>

        <button type="submit" class="w-full btn-primary" :disabled="loading">
          {{ loading ? 'Mengirim...' : 'Kirim Tautan Reset' }}
        </button>
      </form>

      <div class="mt-8 text-center">
        <p class="text-slate-500 text-sm">
          Ingat kata sandi Anda? 
          <button @click="router.push('/masuk')" class="text-serenity-600 font-bold hover:text-serenity-700 hover:underline underline-offset-4 ml-1 transition-all">
            Kembali Masuk
          </button>
        </p>
      </div>
    </div>
  </div>
</template>
