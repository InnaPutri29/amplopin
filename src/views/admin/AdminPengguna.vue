<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../composables/useAuth'

const usersList = ref([])
const isLoading = ref(true)
const { userRole, user } = useAuth()

async function loadUsers() {
  isLoading.value = true
  try {
    const { data, error } = await supabase.rpc('get_admin_user_list')
    if (error) throw error
    usersList.value = data || []
  } catch (err) {
    console.error('Gagal memuat daftar pengguna:', err)
  } finally {
    isLoading.value = false
  }
}

async function toggleRole(userId, currentRole) {
  const newRole = currentRole === 'admin' ? 'user' : 'admin'
  const konfirmasi = confirm(`Yakin ingin mengubah status pengguna ini menjadi ${newRole.toUpperCase()}?`)
  
  if (!konfirmasi) return

  try {
    const { error } = await supabase
      .from('keluarga')
      .update({ role: newRole })
      .eq('id', userId)

    if (error) throw error

    // Update local state
    const userIndex = usersList.value.findIndex(u => u.id === userId)
    if (userIndex !== -1) {
      usersList.value[userIndex].role = newRole
    }
  } catch (err) {
    console.error('Gagal mengubah role pengguna:', err)
    alert('Terjadi kesalahan saat mengubah status pengguna.')
  }
}

function formatDate(isoString) {
  if (!isoString) return '-'
  return new Date(isoString).toLocaleDateString('id-ID', {
    year: 'numeric', month: 'long', day: 'numeric'
  })
}

onMounted(loadUsers)
</script>

<template>
  <div class="h-full flex flex-col">
    <div class="mb-8">
      <h1 class="font-display text-3xl font-bold text-slate-800">Manajemen Pengguna</h1>
      <p class="text-slate-500 text-sm font-medium mt-1">Kelola daftar seluruh keluarga yang terdaftar dalam aplikasi.</p>
    </div>

    <div v-if="isLoading" class="flex justify-center p-12">
      <div class="w-8 h-8 border-4 border-serenity-200 border-t-serenity-500 rounded-full animate-spin"></div>
    </div>

    <div v-else class="card overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-slate-50 border-b border-slate-100 text-xs uppercase tracking-wider text-slate-500">
              <th class="px-6 py-4 font-bold">Nama Keluarga</th>
              <th class="px-6 py-4 font-bold">Email (Rahasia)</th>
              <th class="px-6 py-4 font-bold">Terdaftar Pada</th>
              <th class="px-6 py-4 font-bold text-center">Status (Role)</th>
              <th class="px-6 py-4 font-bold text-center">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="item in usersList" :key="item.id" class="hover:bg-slate-50/50 transition-colors">
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                    {{ item.nama_keluarga?.charAt(0).toUpperCase() || '?' }}
                  </div>
                  <span class="font-semibold text-slate-800">{{ item.nama_keluarga || 'Pengguna' }}</span>
                </div>
              </td>
              <td class="px-6 py-4 text-sm text-slate-500">
                {{ item.email || '-' }}
              </td>
              <td class="px-6 py-4 text-sm text-slate-500">
                {{ formatDate(item.created_at) }}
              </td>
              <td class="px-6 py-4 text-center">
                <span 
                  class="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider inline-block"
                  :class="item.role === 'admin' ? 'bg-quartz-100 text-quartz-700' : 'bg-slate-100 text-slate-500'"
                >
                  {{ item.role }}
                </span>
              </td>
              <td class="px-6 py-4 text-center">
                <span v-if="item.id === user?.id" class="text-xs font-medium text-slate-400 italic">Anda (Saat Ini)</span>
                <button 
                  v-else
                  @click="toggleRole(item.id, item.role)"
                  class="text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all"
                  :class="item.role === 'admin' ? 'border-red-200 text-red-600 hover:bg-red-50' : 'border-serenity-200 text-serenity-600 hover:bg-serenity-50'"
                >
                  {{ item.role === 'admin' ? 'Turunkan Pangkat' : 'Jadikan Admin' }}
                </button>
              </td>
            </tr>
            <tr v-if="usersList.length === 0">
              <td colspan="5" class="px-6 py-8 text-center text-slate-500">
                Belum ada data pengguna.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
