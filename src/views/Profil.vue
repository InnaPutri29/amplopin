<script setup>
import { ref, onMounted } from 'vue'
import { useAuth } from '../composables/useAuth'
import { useRouter } from 'vue-router'
import ModalMasukan from '../components/ModalMasukan.vue'

const router = useRouter()
const { user, userRole, updateProfile, signOut } = useAuth()

const handleSignOut = async () => {
  await signOut()
  router.push('/selamat-datang')
}
const showModalMasukan = ref(false)

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
    <div class="mb-2 flex justify-between items-start gap-4">
      <div>
        <h1 class="font-display text-3xl font-bold text-slate-800">Profil Saya</h1>
        <p class="text-slate-500 text-sm font-medium mt-1">Pengaturan Akun</p>
      </div>
      <div class="flex gap-2">
        <!-- Feedback Button (Mobile) -->
        <button v-if="userRole === 'user'" @click="showModalMasukan = true" class="md:hidden flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-serenity-600 bg-serenity-50 hover:bg-serenity-100 border border-serenity-100 rounded-xl transition-colors shadow-sm whitespace-nowrap">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" /></svg>
          Masukan
        </button>
        <!-- Logout Button (Mobile) -->
        <button class="md:hidden flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-100 rounded-xl transition-colors shadow-sm whitespace-nowrap" @click="handleSignOut">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" /></svg>
        </button>
      </div>
    </div>

    <div class="flex-1 space-y-6">
      <!-- Admin Links (Mobile/Secondary) -->
      <div v-if="userRole === 'admin'" class="px-2 space-y-4 md:hidden">
        <h2 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Menu Super Admin</h2>
        <button @click="$router.push('/admin/dasbor')" class="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-white bg-slate-800 hover:bg-slate-900 rounded-xl transition-colors shadow-sm mb-3">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z" /><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z" /></svg>
          Statistik Admin
        </button>
        <button @click="$router.push('/admin/masukan')" class="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-white bg-slate-800 hover:bg-slate-900 rounded-xl transition-colors shadow-sm mb-3">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.909A2.25 2.25 0 012.25 6.993V6.75m19.5 0v.243m0-2.493V17.25" /></svg>
          Masukan Pengguna
        </button>
        <button @click="$router.push('/admin/pengguna')" class="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-white bg-slate-800 hover:bg-slate-900 rounded-xl transition-colors shadow-sm">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>
          Manajemen User
        </button>
      </div>

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

  <ModalMasukan v-model="showModalMasukan" />
</template>
