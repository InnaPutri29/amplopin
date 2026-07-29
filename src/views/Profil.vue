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
      <h1 class="font-display text-3xl font-bold text-slate-800">Profil Saya</h1>
      <p class="text-slate-500 text-sm font-medium mt-1">Pengaturan Akun</p>
    </div>

    <div class="flex-1">
      <div class="card p-6 md:p-8">
        <form @submit.prevent="handleUpdate" class="space-y-5 w-full">
          <div v-if="successMsg" class="p-4 bg-emerald-50/80 backdrop-blur text-emerald-700 text-sm font-semibold rounded-2xl border border-emerald-100">
            {{ successMsg }}
          </div>
          <div v-if="errorMsg" class="p-4 bg-red-50/80 backdrop-blur text-red-600 text-sm font-semibold rounded-2xl border border-red-100">
            {{ errorMsg }}
          </div>

          <div>
            <label class="block text-sm font-semibold text-slate-600 mb-1.5">Nama Pengguna / Keluarga</label>
            <input 
              v-model="nama" 
              type="text" 
              required 
              class="input-field"
              placeholder="Contoh: Keluarga Budi"
            />
          </div>

          <div>
            <label class="block text-sm font-semibold text-slate-600 mb-1.5">Email</label>
            <input 
              v-model="email" 
              type="email" 
              required 
              class="input-field"
            />
          </div>

          <div>
            <label class="block text-sm font-semibold text-slate-600 mb-1.5">Kata Sandi Baru (Opsional)</label>
            <input 
              v-model="password" 
              type="password" 
              class="input-field"
              placeholder="Kosongkan jika tidak ingin mengubah"
            />
            <p class="text-xs text-slate-400 mt-2 font-medium ml-1">Minimal 6 karakter.</p>
          </div>

          <div class="pt-4">
            <button 
              type="submit" 
              class="btn-primary w-full"
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
