import { ref } from 'vue'
import { supabase } from '../lib/supabase'

// State global sederhana (bukan Pinia) — cukup untuk skala MVP satu-user-per-tenant.
const user = ref(null)
const isReady = ref(false)

async function init() {
  const { data } = await supabase.auth.getSession()
  user.value = data.session?.user ?? null
  isReady.value = true

  supabase.auth.onAuthStateChange((_event, session) => {
    user.value = session?.user ?? null
  })
}

async function signUp(email, password, namaKeluarga) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { nama_keluarga: namaKeluarga || 'Keluarga Saya' } },
  })
  return { data, error }
}

async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  return { data, error }
}

async function signOut() {
  await supabase.auth.signOut()
}

async function updateProfile({ email, password, nama_keluarga }) {
  const updates = {}
  if (email) updates.email = email
  if (password) updates.password = password
  if (nama_keluarga) updates.data = { nama_keluarga }

  const { data, error } = await supabase.auth.updateUser(updates)
  return { data, error }
}

export function useAuth() {
  return { user, isReady, init, signUp, signIn, signOut, updateProfile }
}
