<script setup>
import { useRouter } from 'vue-router'
const router = useRouter()
</script>

<template>
  <div class="welcome-page">
    <!-- Animated background blobs -->
    <div class="blob blob-1"></div>
    <div class="blob blob-2"></div>
    <div class="blob blob-3"></div>

    <!-- Wavy lines decoration -->
    <div class="wave-lines">
      <svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" class="wave-svg">
        <path d="M 0,200 C 50,180 100,220 150,200 C 200,180 250,220 300,200 C 350,180 375,210 400,200" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="1.5"/>
        <path d="M 0,220 C 50,200 100,240 150,220 C 200,200 250,240 300,220 C 350,200 375,230 400,220" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="1.5"/>
        <path d="M 0,240 C 50,220 100,260 150,240 C 200,220 250,260 300,240 C 350,220 375,250 400,240" fill="none" stroke="rgba(255,255,255,0.07)" stroke-width="1.5"/>
        <path d="M 0,180 C 50,160 100,200 150,180 C 200,160 250,200 300,180 C 350,160 375,190 400,180" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="1.5"/>
        <path d="M 0,160 C 50,140 100,180 150,160 C 200,140 250,180 300,160 C 350,140 375,170 400,160" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="1"/>
        <path d="M 0,140 C 50,120 100,160 150,140 C 200,120 250,160 300,140 C 350,120 375,150 400,140" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="1"/>
      </svg>
    </div>

    <!-- Main content -->
    <div class="welcome-content">
      <!-- Logo -->
      <div class="welcome-logo">
        <span>A</span>
      </div>

      <!-- Title -->
      <h1 class="welcome-title">Amplopin</h1>
      <p class="welcome-desc">
        Catat amplop dengan mudah.<br/>
        Kelola catatan amplop keluargamu<br/>
        secara digital, privat, dan terorganisir.
      </p>

      <!-- Illustration -->
      <div class="welcome-illustration">
        <svg viewBox="0 0 200 160" xmlns="http://www.w3.org/2000/svg" fill="none">
          <!-- Envelope body -->
          <rect x="20" y="50" width="160" height="100" rx="12" fill="rgba(255,255,255,0.25)" stroke="rgba(255,255,255,0.5)" stroke-width="1.5"/>
          <!-- Envelope flap -->
          <path d="M20 62 L100 110 L180 62" stroke="rgba(255,255,255,0.6)" stroke-width="1.5" fill="rgba(255,255,255,0.1)"/>
          <!-- Lines in envelope -->
          <line x1="45" y1="120" x2="100" y2="120" stroke="rgba(255,255,255,0.35)" stroke-width="2" stroke-linecap="round"/>
          <line x1="45" y1="132" x2="130" y2="132" stroke="rgba(255,255,255,0.25)" stroke-width="2" stroke-linecap="round"/>
          <!-- Money symbol -->
          <circle cx="148" cy="40" r="22" fill="rgba(255,255,255,0.2)" stroke="rgba(255,255,255,0.4)" stroke-width="1.5"/>
          <text x="148" y="46" text-anchor="middle" fill="white" font-size="18" font-weight="bold" opacity="0.8">Rp</text>
          <!-- Stars/sparkles -->
          <circle cx="30" cy="30" r="3" fill="rgba(255,255,255,0.6)"/>
          <circle cx="170" cy="25" r="2" fill="rgba(255,255,255,0.5)"/>
          <circle cx="185" cy="55" r="2.5" fill="rgba(255,255,255,0.4)"/>
          <circle cx="15" cy="80" r="2" fill="rgba(255,255,255,0.4)"/>
        </svg>
      </div>
    </div>

    <!-- Bottom buttons -->
    <div class="welcome-actions">
      <button class="btn-register" @click="router.push('/daftar')">
        Buat Akun
      </button>
      <button class="btn-login" @click="router.push('/masuk')">
        Masuk
      </button>
    </div>
  </div>
</template>

<style scoped>
.welcome-page {
  width: 100%;
  height: 100%;
  min-height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  position: relative;
  overflow: hidden;
  padding: 36px 28px 32px;
  /* Amplopin theme gradient: Serenity → Quartz */
  background: linear-gradient(155deg,
    #bac8ed 0%,       /* serenity-300 */
    #92a8d1 30%,      /* serenity-500 */
    #bac8ed 55%,      /* serenity-300 */
    #f5c6c6 78%,      /* quartz-300 */
    #f7cac9 100%      /* quartz-500 */
  );
}

/* ─── Background Blobs ─── */
.blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(60px);
  opacity: 0.4;
}
.blob-1 {
  width: 280px; height: 280px;
  background: #465b82; /* serenity-900 */
  top: -80px; left: -80px;
  animation: blobMove 9s ease-in-out infinite;
}
.blob-2 {
  width: 220px; height: 220px;
  background: #d99a99; /* quartz-700 */
  top: 20%; right: -60px;
  animation: blobMove 11s ease-in-out infinite reverse;
}
.blob-3 {
  width: 180px; height: 180px;
  background: #6981ad; /* serenity-700 */
  bottom: 25%; left: -40px;
  animation: blobMove 8s ease-in-out infinite;
  animation-delay: 2s;
}

@keyframes blobMove {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(20px, -30px) scale(1.08); }
  66% { transform: translate(-15px, 15px) scale(0.94); }
}

/* ─── Wave Lines ─── */
.wave-lines {
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0.6;
}
.wave-svg {
  width: 100%;
  height: 100%;
}

/* ─── Main Content ─── */
.welcome-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  position: relative;
  z-index: 1;
  flex: 1;
  justify-content: center;
  gap: 6px;
}

.welcome-logo {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: rgba(255,255,255,0.3);
  backdrop-filter: blur(12px);
  border: 2px solid rgba(255,255,255,0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 30px;
  font-weight: 800;
  color: white;
  margin-bottom: 8px;
  box-shadow: 0 8px 32px rgba(70, 91, 130, 0.25);
}

.welcome-title {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 36px;
  font-weight: 800;
  color: white;
  margin: 0;
  letter-spacing: -0.5px;
  text-shadow: 0 2px 16px rgba(70, 91, 130, 0.3);
}

.welcome-desc {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.85);
  line-height: 1.65;
  margin: 6px 0 0;
  max-width: 260px;
}

.welcome-illustration {
  margin-top: 12px;
  width: 160px;
  height: 130px;
  filter: drop-shadow(0 8px 24px rgba(70, 91, 130, 0.2));
  animation: float 4s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

/* ─── Action Buttons ─── */
.welcome-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
  max-width: 320px;
  position: relative;
  z-index: 1;
}

.btn-register {
  width: 100%;
  padding: 16px;
  border: none;
  border-radius: 50px;
  background: white;
  color: #6981ad; /* serenity-700 */
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.25s;
  box-shadow: 0 4px 20px rgba(0,0,0,0.12);
}
.btn-register:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 28px rgba(0,0,0,0.18);
}

.btn-login {
  width: 100%;
  padding: 16px;
  border: 2px solid rgba(255,255,255,0.6);
  border-radius: 50px;
  background: rgba(255,255,255,0.2);
  backdrop-filter: blur(10px);
  color: white;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.25s;
}
.btn-login:hover {
  background: rgba(255,255,255,0.3);
  transform: translateY(-2px);
}
</style>
