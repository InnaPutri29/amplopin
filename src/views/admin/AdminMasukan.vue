<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../../lib/supabase'
import { confirmDialog, showError } from '../../utils/swal'

const masukanList = ref([])
const isLoading = ref(true)

async function loadMasukan() {
  isLoading.value = true
  try {
    const { data, error } = await supabase
      .from('masukan')
      .select(`
        id,
        pesan,
        status,
        created_at,
        keluarga:keluarga_id(nama_keluarga)
      `)
      .order('created_at', { ascending: false })

    if (error) throw error
    masukanList.value = data || []
  } catch (err) {
    console.error('Gagal memuat masukan:', err)
  } finally {
    isLoading.value = false
  }
}

async function tandaiDibaca(id) {
  try {
    const { error } = await supabase
      .from('masukan')
      .update({ status: 'dibaca' })
      .eq('id', id)
      
    if (error) throw error
    const m = masukanList.value.find(x => x.id === id)
    if (m) m.status = 'dibaca'
  } catch (err) {
    console.error('Gagal update status:', err)
  }
}

async function hapusMasukan(id) {
  const isConfirmed = await confirmDialog('Hapus Masukan', 'Yakin ingin menghapus masukan ini secara permanen?')
  if (!isConfirmed) return

  try {
    const { error } = await supabase
      .from('masukan')
      .delete()
      .eq('id', id)
      
    if (error) throw error
    masukanList.value = masukanList.value.filter(x => x.id !== id)
  } catch (err) {
    console.error('Gagal menghapus masukan:', err)
    showError('Gagal', 'Gagal menghapus masukan.')
  }
}

function formatDate(isoString) {
  return new Date(isoString).toLocaleDateString('id-ID', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

onMounted(loadMasukan)
</script>

<template>
  <div class="h-full flex flex-col">
    <div class="mb-4">
      <router-link to="/profil" class="inline-flex items-center gap-1 bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 font-semibold text-[13px] py-1.5 pr-3.5 pl-2.5 rounded-full shadow-sm transition-all hover:-translate-x-0.5">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7"/></svg>
        Kembali
      </router-link>
    </div>
    <div class="mb-8">
      <h1 class="font-display text-3xl font-bold text-slate-800">Masukan Pengguna</h1>
      <p class="text-slate-500 text-sm font-medium mt-1">Daftar saran dan kritik dari pengguna aplikasi.</p>
    </div>

    <div v-if="isLoading" class="flex justify-center p-12">
      <div class="w-8 h-8 border-4 border-serenity-200 border-t-serenity-500 rounded-full animate-spin"></div>
    </div>

    <div v-else-if="masukanList.length === 0" class="card p-12 text-center text-slate-500">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-12 h-12 mx-auto mb-4 text-slate-300">
        <path stroke-linecap="round" stroke-linejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
      </svg>
      <p>Belum ada masukan dari pengguna.</p>
    </div>

    <div v-else class="space-y-4">
      <div 
        v-for="item in masukanList" 
        :key="item.id"
        class="card p-5 transition-all"
        :class="item.status === 'baru' ? 'border-l-4 border-l-serenity-500 bg-white' : 'bg-slate-50 opacity-80'"
      >
        <div class="flex justify-between items-start mb-2">
          <div>
            <h3 class="font-bold text-slate-800">{{ item.keluarga?.nama_keluarga || 'Pengguna Tidak Diketahui' }}</h3>
            <p class="text-xs text-slate-400">{{ formatDate(item.created_at) }}</p>
          </div>
          <span 
            v-if="item.status === 'baru'" 
            class="px-2.5 py-1 text-[10px] font-bold bg-serenity-100 text-serenity-700 rounded-full uppercase"
          >
            Baru
          </span>
        </div>
        <div class="bg-white p-4 rounded-xl border border-slate-100 mt-3 text-sm text-slate-700 whitespace-pre-wrap">
          {{ item.pesan }}
        </div>
        <div class="mt-4 flex justify-end items-center gap-4">
          <button v-if="item.status === 'baru'" @click="tandaiDibaca(item.id)" class="text-xs font-semibold text-serenity-600 hover:text-serenity-800 flex items-center gap-1" title="Tandai Dibaca">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
            <span class="hidden sm:inline">Tandai Dibaca</span>
          </button>
          <button @click="hapusMasukan(item.id)" class="text-xs font-semibold text-red-500 hover:text-red-700 flex items-center gap-1 transition-colors" title="Hapus">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
            <span class="hidden sm:inline">Hapus</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
