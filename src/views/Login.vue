<script setup>
import { ref } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { useAuth } from '../composables/useAuth'

const router = useRouter()
const { signIn } = useAuth()

const email = ref('')
const password = ref('')
const errorMsg = ref('')
const loading = ref(false)

async function handleSubmit() {
  errorMsg.value = ''
  loading.value = true
  const { error } = await signIn(email.value, password.value)
  loading.value = false
  if (error) {
    errorMsg.value = 'Email atau kata sandi salah. Coba lagi.'
    return
  }
  router.push({ name: 'dashboard' })
}
</script>

<template>
  <div class="w-full max-w-md mx-auto px-4">
    <div class="text-center mb-8">
      <div class="w-16 h-16 rounded-full bg-gradient-to-br from-quartz-500 to-serenity-500 mx-auto flex items-center justify-center text-white font-bold text-3xl shadow-lg shadow-serenity-500/30 mb-4">
        A
      </div>
      <h1 class="font-display text-4xl font-bold text-slate-800 mb-2">Amplopin</h1>
      <p class="text-slate-500 text-sm">Masuk untuk kelola catatan amplop keluargamu.</p>
    </div>

    <div class="card p-8">
      <form class="space-y-5" @submit.prevent="handleSubmit">
        <div>
          <label class="block text-sm font-semibold text-slate-600 mb-1.5">Email</label>
          <input v-model="email" type="email" required class="input-field" placeholder="nama@email.com" />
        </div>
        <div>
          <label class="block text-sm font-semibold text-slate-600 mb-1.5">Kata Sandi</label>
          <input v-model="password" type="password" required class="input-field" placeholder="••••••••" />
        </div>

        <div v-if="errorMsg" class="p-3 bg-red-50 text-red-600 rounded-xl text-sm font-medium">
          {{ errorMsg }}
        </div>

        <button type="submit" class="btn-primary w-full mt-2" :disabled="loading">
          {{ loading ? 'Memproses...' : 'Masuk' }}
        </button>
      </form>

      <div class="mt-8 pt-6 border-t border-slate-100/50 text-center">
        <p class="text-sm text-slate-500">
          Belum punya akun?
          <RouterLink to="/daftar" class="text-serenity-600 font-bold hover:text-serenity-700 transition-colors">Daftar di sini</RouterLink>
        </p>
      </div>
    </div>
  </div>
</template>
