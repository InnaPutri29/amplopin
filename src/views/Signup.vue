<script setup>
import { ref } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { useAuth } from '../composables/useAuth'

const router = useRouter()
const { signUp } = useAuth()

const namaKeluarga = ref('')
const email = ref('')
const password = ref('')
const errorMsg = ref('')
const successMsg = ref('')
const loading = ref(false)

async function handleSubmit() {
  errorMsg.value = ''
  successMsg.value = ''
  loading.value = true
  const { error } = await signUp(email.value, password.value, namaKeluarga.value)
  loading.value = false

  if (error) {
    errorMsg.value = error.message
    return
  }
  successMsg.value = 'Akun berhasil dibuat. Silakan masuk.'
  setTimeout(() => router.push({ name: 'masuk' }), 1200)
}
</script>

<template>
  <div class="w-full max-w-md mx-auto px-4">
    <div class="text-center mb-8">
      <div class="w-16 h-16 rounded-full bg-gradient-to-br from-quartz-500 to-serenity-500 mx-auto flex items-center justify-center text-white font-bold text-3xl shadow-lg shadow-serenity-500/30 mb-4">
        A
      </div>
      <h1 class="font-display text-4xl font-bold text-slate-800 mb-2">Daftar Keluarga</h1>
      <p class="text-slate-500 text-sm">Satu akun untuk satu keluarga, privat dan terpisah dari keluarga lain.</p>
    </div>

    <div class="card p-8">
      <form class="space-y-5" @submit.prevent="handleSubmit">
        <div>
          <label class="block text-sm font-semibold text-slate-600 mb-1.5">Nama Keluarga</label>
          <input v-model="namaKeluarga" type="text" required class="input-field" placeholder="Keluarga Bapak Budi" />
        </div>
        <div>
          <label class="block text-sm font-semibold text-slate-600 mb-1.5">Email</label>
          <input v-model="email" type="email" required class="input-field" placeholder="nama@email.com" />
        </div>
        <div>
          <label class="block text-sm font-semibold text-slate-600 mb-1.5">Kata Sandi</label>
          <input v-model="password" type="password" required minlength="6" class="input-field" placeholder="Minimal 6 karakter" />
        </div>

        <div v-if="errorMsg" class="p-3 bg-red-50 text-red-600 rounded-xl text-sm font-medium">
          {{ errorMsg }}
        </div>
        <div v-if="successMsg" class="p-3 bg-serenity-50 text-serenity-700 rounded-xl text-sm font-medium">
          {{ successMsg }}
        </div>

        <button type="submit" class="btn-primary w-full mt-2" :disabled="loading">
          {{ loading ? 'Memproses...' : 'Buat Akun' }}
        </button>
      </form>

      <div class="mt-8 pt-6 border-t border-slate-100/50 text-center">
        <p class="text-sm text-slate-500">
          Sudah punya akun?
          <RouterLink to="/masuk" class="text-serenity-600 font-bold hover:text-serenity-700 transition-colors">Masuk di sini</RouterLink>
        </p>
      </div>
    </div>
  </div>
</template>
