<script setup>
import { ref } from 'vue'
import { useAuth } from '../composables/useAuth'

const { user, updateProfile } = useAuth()

const nama = ref(user.value?.user_metadata?.nama_keluarga || '')
const email = ref(user.value?.email || '')
const password = ref('')
const loading = ref(false)
const successMsg = ref('')
const errorMsg = ref('')

async function handleUpdate() {
  loading.value = true
  successMsg.value = ''
  errorMsg.value = ''
  
  // Prepare updates
  const updates = {}
  if (nama.value && nama.value !== user.value?.user_metadata?.nama_keluarga) {
    updates.nama_keluarga = nama.value
  }
  if (email.value && email.value !== user.value?.email) {
    updates.email = email.value
  }
  if (password.value) {
    updates.password = password.value
  }

  if (Object.keys(updates).length === 0) {
    loading.value = false
    return
  }

  const { error } = await updateProfile(updates)
  
  if (error) {
    errorMsg.value = error.message
  } else {
    successMsg.value = 'Profil berhasil diperbarui!'
    password.value = '' // clear password field after update
    if (updates.email) {
      successMsg.value += ' Silakan cek email baru Anda untuk konfirmasi (jika fitur aktif).'
    }
  }
  loading.value = false
}
</script>

<template>
  <div class="h-full flex flex-col">
    <div class="mb-8">
      <h1 class="font-display text-4xl font-extrabold text-slate-800 mb-2 tracking-tight">Profil Saya</h1>
      <p class="text-slate-500 font-medium text-lg">Kelola informasi akun Anda di sini.</p>
    </div>

    <div class="flex-1">
      <div class="bg-white/60 backdrop-blur-xl border border-white/80 p-8 rounded-[2rem] shadow-xl max-w-xl">
        <form @submit.prevent="handleUpdate" class="space-y-6">
          <div v-if="successMsg" class="p-4 bg-emerald-50/80 backdrop-blur text-emerald-700 text-sm font-semibold rounded-2xl border border-emerald-100">
            {{ successMsg }}
          </div>
          <div v-if="errorMsg" class="p-4 bg-red-50/80 backdrop-blur text-red-600 text-sm font-semibold rounded-2xl border border-red-100">
            {{ errorMsg }}
          </div>

          <div>
            <label class="block text-sm font-bold text-slate-700 mb-2">Nama Pengguna / Keluarga</label>
            <input 
              v-model="nama" 
              type="text" 
              required 
              class="input-field bg-white/70 backdrop-blur-md"
              placeholder="Contoh: Keluarga Budi"
            />
          </div>

          <div>
            <label class="block text-sm font-bold text-slate-700 mb-2">Email</label>
            <input 
              v-model="email" 
              type="email" 
              required 
              class="input-field bg-white/70 backdrop-blur-md"
            />
          </div>

          <div>
            <label class="block text-sm font-bold text-slate-700 mb-2">Kata Sandi Baru (Opsional)</label>
            <input 
              v-model="password" 
              type="password" 
              class="input-field bg-white/70 backdrop-blur-md"
              placeholder="Kosongkan jika tidak ingin mengubah"
            />
            <p class="text-xs text-slate-400 mt-2 font-medium ml-1">Minimal 6 karakter.</p>
          </div>

          <div class="pt-4">
            <button 
              type="submit" 
              class="btn-primary w-full py-3.5 text-base shadow-lg shadow-serenity-500/30"
              :disabled="loading"
            >
              {{ loading ? 'Menyimpan...' : 'Simpan Perubahan' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
