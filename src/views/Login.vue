<script setup>
import { ref } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { useAuth } from '../composables/useAuth'

const router = useRouter()
const { signIn } = useAuth()

const email = ref('')
const password = ref('')
const showPassword = ref(false)
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
  <div class="auth-page">
    <!-- Gradient Top Section -->
    <div class="auth-gradient">
      <!-- Decorative circles -->
      <div class="deco-circle deco-1"></div>
      <div class="deco-circle deco-2"></div>
      <div class="deco-circle deco-3"></div>

      <!-- Back button -->
      <button @click="router.push('/selamat-datang')" class="auth-back">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
        Kembali
      </button>

      <!-- Logo & Welcome -->
      <div class="auth-hero">
        <div class="auth-logo">
          <span>A</span>
        </div>
        <h1 class="auth-title">Selamat Datang!</h1>
        <p class="auth-subtitle">Masuk dan kelola catatan<br/>amplop keluargamu.</p>
      </div>
    </div>

    <!-- White Form Panel -->
    <div class="auth-panel">

      <h2 class="auth-form-title">Masuk</h2>
      <p class="auth-form-subtitle">Halo! Senang bertemu kembali</p>

      <form class="auth-form" @submit.prevent="handleSubmit">
        <!-- Error -->
        <div v-if="errorMsg" class="auth-error">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z"/></svg>
          {{ errorMsg }}
        </div>

        <!-- Email -->
        <div class="auth-input-group">
          <svg xmlns="http://www.w3.org/2000/svg" class="auth-input-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
          <input v-model="email" type="email" required placeholder="Masukkan email" class="auth-input" />
        </div>

        <!-- Password -->
        <div class="auth-input-group">
          <svg xmlns="http://www.w3.org/2000/svg" class="auth-input-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
          <input v-model="password" :type="showPassword ? 'text' : 'password'" required placeholder="Kata sandi" class="auth-input" />
          <button type="button" @click="showPassword = !showPassword" class="auth-input-toggle">
            <svg v-if="!showPassword" xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/></svg>
          </button>
        </div>

        <!-- Submit -->
        <button type="submit" class="auth-submit" :disabled="loading">
          <span v-if="loading" class="auth-spinner"></span>
          <span>{{ loading ? 'Memproses...' : 'Masuk' }}</span>
        </button>
      </form>

      <p class="auth-switch">
        Belum punya akun?
        <RouterLink to="/daftar" class="auth-switch-link">Daftar sekarang</RouterLink>
      </p>
    </div>
  </div>
</template>

<style scoped>
.auth-page {
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  border-radius: inherit;
}

/* ─── Gradient Top ─── */
.auth-gradient {
  position: relative;
  flex-shrink: 0;
  height: 42%;
  min-height: 260px;
  background: linear-gradient(155deg,
    #bac8ed 0%,
    #92a8d1 30%,
    #bac8ed 55%,
    #f5c6c6 78%,
    #f7cac9 100%
  );
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.deco-circle {
  position: absolute;
  border-radius: 50%;
  background: rgba(255,255,255,0.15);
}
.deco-1 { width: 280px; height: 280px; top: -80px; right: -80px; }
.deco-2 { width: 180px; height: 180px; bottom: -60px; left: -50px; background: rgba(255,255,255,0.10); }
.deco-3 { width: 100px; height: 100px; top: 30px; left: 30px; background: rgba(255,255,255,0.08); }

.auth-hero {
  text-align: center;
  position: relative;
  z-index: 1;
  padding: 0 24px;
}

.auth-logo {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: rgba(255,255,255,0.3);
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255,255,255,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  font-weight: 800;
  color: white;
  margin: 0 auto 16px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.15);
}

.auth-title {
  font-family: 'Nunito', sans-serif;
  font-size: 28px;
  font-weight: 800;
  color: white;
  margin: 0 0 6px;
  text-shadow: 0 2px 12px rgba(0,0,0,0.1);
}

.auth-subtitle {
  font-size: 13px;
  color: rgba(255,255,255,0.85);
  line-height: 1.5;
  margin: 0;
}

/* ─── White Panel ─── */
.auth-panel {
  flex: 1;
  background: white;
  border-radius: 28px 28px 0 0;
  margin-top: -28px;
  position: relative;
  z-index: 10;
  padding: 12px 28px 40px;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  box-shadow: 0 -8px 32px rgba(0,0,0,0.08);
}

.auth-panel-handle {
  width: 40px;
  height: 4px;
  background: #e2e8f0;
  border-radius: 2px;
  margin: 0 auto 24px;
}

.auth-form-title {
  font-family: 'Nunito', sans-serif;
  font-size: 22px;
  font-weight: 800;
  color: #1e293b;
  margin: 0 0 4px;
}

.auth-form-subtitle {
  font-size: 13px;
  color: #94a3b8;
  margin: 0 0 24px;
}

/* ─── Form Elements ─── */
.auth-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-bottom: 20px;
}

.auth-error {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 14px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 14px;
  color: #dc2626;
  font-size: 13px;
  font-weight: 500;
}

.auth-input-group {
  position: relative;
  display: flex;
  align-items: center;
}

.auth-input-icon {
  position: absolute;
  left: 14px;
  width: 18px;
  height: 18px;
  color: #94a3b8;
  pointer-events: none;
  flex-shrink: 0;
}

.auth-input {
  width: 100%;
  padding: 14px 14px 14px 42px;
  background: #f8fafc;
  border: 1.5px solid #e2e8f0;
  border-radius: 14px;
  font-size: 14px;
  color: #334155;
  outline: none;
  transition: all 0.2s;
  font-family: inherit;
}

.auth-input:focus {
  border-color: #c97ee8;
  background: white;
  box-shadow: 0 0 0 3px rgba(201, 126, 232, 0.1);
}

.auth-input::placeholder {
  color: #cbd5e1;
}

.auth-input-toggle {
  position: absolute;
  right: 14px;
  color: #94a3b8;
  background: none;
  border: none;
  cursor: pointer;
  padding: 2px;
  display: flex;
  align-items: center;
  transition: color 0.2s;
}
.auth-input-toggle:hover { color: #64748b; }

.auth-submit {
  width: 100%;
  padding: 15px;
  border: none;
  border-radius: 14px;
  background: linear-gradient(135deg, #bac8ed, #92a8d1, #6981ad);
  color: white;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.25s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  box-shadow: 0 4px 16px rgba(105, 129, 173, 0.4);
  margin-top: 4px;
  font-family: inherit;
}
.auth-submit:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(105, 129, 173, 0.5);
}
.auth-submit:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.auth-back {
  position: absolute;
  top: 16px;
  left: 16px;
  display: flex;
  align-items: center;
  gap: 4px;
  color: rgba(255,255,255,0.9);
  background: rgba(255,255,255,0.2);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255,255,255,0.35);
  border-radius: 50px;
  padding: 6px 14px 6px 10px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
}
.auth-back:hover {
  background: rgba(255,255,255,0.3);
  transform: translateX(-2px);
}

.auth-input:focus {
  border-color: #92a8d1;
  background: white;
  box-shadow: 0 0 0 3px rgba(146, 168, 209, 0.15);
}

.auth-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255,255,255,0.4);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  flex-shrink: 0;
}

@keyframes spin { to { transform: rotate(360deg); } }

.auth-switch {
  text-align: center;
  font-size: 13px;
  color: #94a3b8;
  margin-top: auto;
}

.auth-switch-link {
  color: #6981ad;
  font-weight: 700;
  text-decoration: none;
  margin-left: 4px;
  transition: color 0.2s;
}
.auth-switch-link:hover { color: #465b82; }

/* ═══════════════════════════════════════
   DESKTOP LAYOUT — 2 Columns (left + right)
   Mobile styles above are untouched
   ═══════════════════════════════════════ */
@media (min-width: 768px) {
  .auth-page {
    flex-direction: row;
    min-height: 100%;
    height: 100%;
  }

  /* Left panel: gradient with shapes */
  .auth-gradient {
    width: 50%;
    height: 100%;
    min-height: unset;
    flex-shrink: 0;
    flex-direction: column;
    border-radius: 0;
    justify-content: center;
    padding: 48px 40px;
  }

  /* Decorative geometric shapes for desktop left panel */
  .deco-1 {
    width: 350px; height: 350px;
    top: -60px; left: -100px;
    background: rgba(255,255,255,0.12);
  }
  .deco-2 {
    width: 280px; height: 280px;
    bottom: -80px; right: -80px;
    background: rgba(255,255,255,0.08);
  }
  .deco-3 {
    width: 200px; height: 200px;
    top: 40%; left: -60px;
    background: rgba(255,255,255,0.07);
  }

  /* Desktop: logo bigger on left panel */
  .auth-logo {
    width: 88px;
    height: 88px;
    font-size: 36px;
    margin: 0 auto 24px;
    box-shadow: 0 12px 40px rgba(70,91,130,0.3);
  }

  .auth-title {
    font-size: 36px;
    margin-bottom: 10px;
  }

  .auth-subtitle {
    font-size: 15px;
    max-width: 240px;
    margin: 0 auto;
  }

  .auth-back {
    top: 20px;
    left: 20px;
  }

  /* Right panel: white, full height, no rounded top */
  .auth-panel {
    flex: 1;
    border-radius: 0;
    margin-top: 0;
    padding: 0 60px;
    box-shadow: none;
    justify-content: center;
    border-left: 1px solid #f1f5f9;
  }

  /* Hide the mobile handle on desktop */
  .auth-panel-handle {
    display: none;
  }

  /* Bigger title on desktop */
  .auth-form-title {
    font-size: 28px;
    margin-bottom: 6px;
  }

  .auth-form-subtitle {
    font-size: 14px;
    margin-bottom: 32px;
  }

  /* Wider, more spacious inputs on desktop */
  .auth-input {
    padding: 16px 16px 16px 46px;
    font-size: 15px;
    border-radius: 16px;
  }

  .auth-input-icon {
    width: 20px;
    height: 20px;
  }

  .auth-submit {
    padding: 16px;
    font-size: 16px;
    border-radius: 16px;
  }

  .auth-switch {
    margin-top: 24px;
    font-size: 14px;
  }
}
</style>
