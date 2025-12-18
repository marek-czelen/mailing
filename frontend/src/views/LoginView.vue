<template>
<div class="login-view">
  <!-- Language selector fixed top-right -->
  <div class="language-toggle-top">
    <label style="font-size:0.9rem; color: #eadcf6; margin-right:8px">{{ $t('toolbar.language') }}</label>
    <select v-model="currentLocale" @change="changeLocale" class="language-select">
      <option value="pl">PL</option>
      <option value="en">EN</option>
    </select>
  </div>
  <!-- Animated background elements -->
  <div class="bg-shapes">
    <div class="shape shape-1"></div>
    <div class="shape shape-2"></div>
    <div class="shape shape-3"></div>
  </div>
  
  <div class="login-container">
    <!-- Left side with branding -->
    <div class="login-branding">
      <div class="brand-icon">
        <svg viewBox="0 0 24 24" width="64" height="64">
          <path fill="url(#gradient1)" d="M20,8L12,13L4,8V6L12,11L20,6M20,4H4C2.89,4 2,4.89 2,6V18A2,2 0 0,0 4,20H20A2,2 0 0,0 22,18V6C22,4.89 21.1,4 20,4Z"/>
          <defs>
            <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
              <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <h1 class="brand-title">{{ $t('login.brandTitle') }}</h1>
      <p class="brand-subtitle">{{ $t('login.brandSubtitle') }}</p>
    </div>
    
    <!-- Right side with login form -->
      <div class="login-card">
        <div class="card-header">
          <div style="display:flex; align-items:center; justify-content:space-between; gap:12px">
            <div>
              <h2 class="login-title">{{ $t('login.welcomeTitle') }}</h2>
              <p class="login-subtitle">{{ $t('login.loginSubtitle') }}</p>
            </div>
          </div>
        </div>
      
      <form class="login-form" @submit="handleLogin">
        <div class="input-group">
          <div class="input-wrapper">
            <svg class="input-icon" viewBox="0 0 24 24" width="20" height="20">
              <path fill="currentColor" d="M12,15C12.81,15 13.5,14.7 14.11,14.11C14.7,13.5 15,12.81 15,12C15,11.19 14.7,10.5 14.11,9.89C13.5,9.3 12.81,9 12,9C11.19,9 10.5,9.3 9.89,9.89C9.3,10.5 9,11.19 9,12C9,12.81 9.3,13.5 9.89,14.11C10.5,14.7 11.19,15 12,15M12,2C14.75,2 17.1,3 19.05,4.95C21,6.9 22,9.25 22,12V13.45C22,14.45 21.65,15.3 21,16C20.3,16.67 19.5,17 18.5,17C17.3,17 16.31,16.5 15.56,15.5C14.56,16.5 13.38,17 12,17C10.63,17 9.45,16.5 8.46,15.54C7.5,14.55 7,13.38 7,12C7,10.63 7.5,9.45 8.46,8.46C9.45,7.5 10.63,7 12,7C13.38,7 14.55,7.5 15.54,8.46C16.5,9.45 17,10.63 17,12V13.45C17,13.86 17.16,14.22 17.46,14.53C17.76,14.83 18.11,15 18.5,15C18.92,15 19.27,14.84 19.57,14.53C19.87,14.22 20,13.86 20,13.45V12C20,9.81 19.23,7.93 17.65,6.35C16.07,4.77 14.19,4 12,4C9.81,4 7.93,4.77 6.35,6.35C4.77,7.93 4,9.81 4,12C4,14.19 4.77,16.07 6.35,17.65C7.93,19.23 9.81,20 12,20H16V22H12C9.25,22 6.9,21 4.95,19.05C3,17.1 2,14.75 2,12C2,9.25 3,6.9 4.95,4.95C6.9,3 9.25,2 12,2Z"/>
            </svg>
            <input type="email" v-model="email" :placeholder="$t('login.emailPlaceholder')" class="login-input" required />
          </div>
        </div>
        
        <div class="input-group">
          <div class="input-wrapper">
            <svg class="input-icon" viewBox="0 0 24 24" width="20" height="20">
              <path fill="currentColor" d="M12,17A2,2 0 0,0 14,15C14,13.89 13.1,13 12,13A2,2 0 0,0 10,15A2,2 0 0,0 12,17M18,8A2,2 0 0,1 20,10V20A2,2 0 0,1 18,22H6A2,2 0 0,1 4,20V10C4,8.89 4.9,8 6,8H7V6A5,5 0 0,1 12,1A5,5 0 0,1 17,6V8H18M12,3A3,3 0 0,0 9,6V8H15V6A3,3 0 0,0 12,3Z"/>
            </svg>
            <input type="password" v-model="password" :placeholder="$t('login.passwordPlaceholder')" class="login-input" required />
          </div>
        </div>
        
        <button type="submit" class="login-btn">
          <span>{{ $t('login.loginButton') }}</span>
          <svg class="btn-arrow" viewBox="0 0 24 24" width="20" height="20">
            <path fill="currentColor" d="M4,11V13H16L10.5,18.5L11.92,19.92L19.84,12L11.92,4.08L10.5,5.5L16,11H4Z"/>
          </svg>
        </button>
        
        <div v-if="error" class="error-message">
          <svg viewBox="0 0 24 24" width="16" height="16">
            <path fill="currentColor" d="M13,13H11V7H13M13,17H11V15H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z"/>
          </svg>
          {{ error }}
        </div>
        <div v-if="false">
        <!-- OAuth providers separator -->
        <div class="oauth-separator">
          <span>{{ $t('login.orContinueWith') }}</span>
        </div>

        <!-- OAuth buttons -->
        <div class="oauth-buttons">
          <button type="button" class="oauth-btn oauth-google" @click="loginWithGoogle">
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path fill="currentColor" d="M21.35,11.1H12.18V13.83H18.69C18.36,17.64 15.19,19.27 12.19,19.27C8.36,19.27 5,16.25 5,12C5,7.9 8.2,4.73 12.2,4.73C15.29,4.73 17.1,6.7 17.1,6.7L19,4.72C19,4.72 16.56,2 12.1,2C6.42,2 2.03,6.8 2.03,12C2.03,17.05 6.16,22 12.25,22C17.6,22 21.5,18.33 21.5,12.91C21.5,11.76 21.35,11.1 21.35,11.1Z"/>
            </svg>
            <span>{{ $t('login.continueWithGoogle') }}</span>
          </button>

          <button type="button" class="oauth-btn oauth-github" @click="loginWithGitHub">
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path fill="currentColor" d="M12,2A10,10 0 0,0 2,12C2,16.42 4.87,20.17 8.84,21.5C9.34,21.58 9.5,21.27 9.5,21C9.5,20.77 9.5,20.14 9.5,19.31C6.73,19.91 6.14,17.97 6.14,17.97C5.68,16.81 5.03,16.5 5.03,16.5C4.12,15.88 5.1,15.9 5.1,15.9C6.1,15.97 6.63,16.93 6.63,16.93C7.5,18.45 8.97,18 9.54,17.76C9.63,17.11 9.89,16.67 10.17,16.42C7.95,16.17 5.62,15.31 5.62,11.5C5.62,10.39 6,9.5 6.65,8.79C6.55,8.54 6.2,7.5 6.75,6.15C6.75,6.15 7.59,5.88 9.5,7.17C10.29,6.95 11.15,6.84 12,6.84C12.85,6.84 13.71,6.95 14.5,7.17C16.41,5.88 17.25,6.15 17.25,6.15C17.8,7.5 17.45,8.54 17.35,8.79C18,9.5 18.38,10.39 18.38,11.5C18.38,15.32 16.04,16.16 13.81,16.41C14.17,16.72 14.5,17.33 14.5,18.26C14.5,19.6 14.5,20.68 14.5,21C14.5,21.27 14.66,21.59 15.17,21.5C19.14,20.16 22,16.42 22,12A10,10 0 0,0 12,2Z"/>
            </svg>
            <span>{{ $t('login.continueWithGitHub') }}</span>
          </button>
        </div>
        </div>
      </form>
    </div>
  </div>
</div>
</template>

<script setup>
import { ref } from 'vue';
import { Account } from '../services/account';
import { AuthService } from '../services/auth';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n'

const router = useRouter();
const email = ref('');
const password = ref('');
const error = ref('');
const { locale, t } = useI18n()
const currentLocale = ref(locale.value)

function changeLocale() {
  locale.value = currentLocale.value
  try {
    localStorage.setItem('app_locale', currentLocale.value)
  } catch (e) {
    console.warn('Could not persist locale', e)
  }
}

async function handleLogin(event) {
  event.preventDefault();
  error.value = '';
  const result = await Account.login(email.value, password.value);
  if (result) {
    router.push('/campaigns');
  } else {
    error.value = t('login.authError');
    email.value = '';
    password.value = '';
  }
}

function loginWithGoogle() {
  AuthService.initiateOAuth('google');
}

function loginWithGitHub() {
  AuthService.initiateOAuth('github');
}
</script>

<style scoped>
.login-view {
  min-height: 100vh;
  width: 100vw;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, #140f07 0%, #202950 50%, #515bad 100%);
  padding: 20px;
}

.language-toggle-top {
  position: fixed;
  top: 16px;
  right: 16px;
  z-index: 2000;
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(16, 13, 30, 0.6);
  padding: 6px 10px;
  border-radius: 8px;
  backdrop-filter: blur(6px);
}

.language-select {
  padding: 6px 8px;
  border-radius: 6px;
  border: none;
  background: white;
  color: #111827;
}

/* Animated background shapes */
.bg-shapes {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: 0;
}

.shape {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.08);
  animation: float 8s ease-in-out infinite;
  backdrop-filter: blur(2px);
}

.shape-1 {
  width: 250px;
  height: 250px;
  top: 5%;
  left: 5%;
  animation-delay: 0s;
}

.shape-2 {
  width: 180px;
  height: 180px;
  bottom: 10%;
  right: 5%;
  animation-delay: 2.5s;
}

.shape-3 {
  width: 120px;
  height: 120px;
  top: 60%;
  left: 85%;
  animation-delay: 5s;
}

@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(180deg); }
}

.login-container {
  display: flex;
  max-width: 1000px;
  width: 100%;
  max-height: 650px;
  min-height: 500px;
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(25px);
  border-radius: 20px;
  box-shadow: 0 25px 80px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  z-index: 1;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

/* Left branding side */
.login-branding {
  flex: 1;
  background: linear-gradient(135deg, #202950 0%, #515bad 100%);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 60px 40px;
  text-align: center;
  color: #eadcf6;
  position: relative;
}

.login-branding::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E") repeat;
  opacity: 0.1;
}

.brand-icon {
  margin-bottom: 24px;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.brand-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 16px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.brand-subtitle {
  font-size: 1.1rem;
  opacity: 0.9;
  line-height: 1.5;
}

/* Right form side */
.login-card {
  flex: 1;
  padding: 60px 50px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.card-header {
  margin-bottom: 40px;
  text-align: center;
}

.login-title {
  font-size: 2rem;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 8px;
}

.login-subtitle {
  color: #718096;
  font-size: 1rem;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.input-group {
  position: relative;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 16px;
  color: #a0aec0;
  z-index: 2;
}

.login-input {
  width: 100%;
  padding: 16px 16px 16px 50px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 1rem;
  background: #f7fafc;
  outline: none;
  transition: all 0.3s ease;
}

.login-input:focus {
  border-color: #515bad;
  background: white;
  box-shadow: 0 0 0 3px rgba(81, 91, 173, 0.1);
}

.login-btn {
  background: linear-gradient(135deg, #515bad 0%, #9395fa 100%);
  color: #eadcf6;
  border: none;
  border-radius: 12px;
  padding: 16px 24px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  position: relative;
  overflow: hidden;
}

.login-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
}

.login-btn:hover::before {
  left: 100%;
}

.login-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(81, 91, 173, 0.3);
}

.btn-arrow {
  transition: transform 0.3s ease;
}

.login-btn:hover .btn-arrow {
  transform: translateX(4px);
}

.error-message {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #e53e3e;
  font-size: 0.9rem;
  background: #fed7d7;
  padding: 12px 16px;
  border-radius: 8px;
  border-left: 4px solid #e53e3e;
}

/* OAuth section */
.oauth-separator {
  position: relative;
  text-align: center;
  margin: 24px 0;
}

.oauth-separator::before,
.oauth-separator::after {
  content: '';
  position: absolute;
  top: 50%;
  width: 40%;
  height: 1px;
  background: linear-gradient(to right, transparent, #e2e8f0, transparent);
}

.oauth-separator::before {
  left: 0;
}

.oauth-separator::after {
  right: 0;
}

.oauth-separator span {
  background: white;
  padding: 0 16px;
  color: #718096;
  font-size: 0.9rem;
}

.oauth-buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.oauth-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 14px 20px;
  border-radius: 10px;
  border: 2px solid #e2e8f0;
  background: white;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.oauth-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.oauth-google {
  color: #4285f4;
  border-color: #4285f4;
}

.oauth-google:hover {
  background: linear-gradient(135deg, #4285f4 0%, #357ae8 100%);
  color: white;
  border-color: #4285f4;
}

.oauth-google:hover svg path {
  fill: white;
}

.oauth-github {
  color: #333;
  border-color: #333;
}

.oauth-github:hover {
  background: linear-gradient(135deg, #333 0%, #24292e 100%);
  color: white;
  border-color: #333;
}

.oauth-github:hover svg path {
  fill: white;
}

/* Responsive design */
@media (max-width: 768px) {
  .login-view {
    padding: 10px;
  }
  
  .login-container {
    flex-direction: column;
    max-width: 500px;
    min-height: auto;
  }
  
  .login-branding {
    padding: 30px 20px;
    min-height: 150px;
  }
  
  .brand-title {
    font-size: 1.8rem;
  }
  
  .brand-subtitle {
    font-size: 1rem;
  }
  
  .login-card {
    padding: 30px 25px;
  }
}

@media (max-width: 480px) {
  .login-container {
    max-width: 400px;
  }
  
  .login-card {
    padding: 25px 20px;
  }
  
  .login-title {
    font-size: 1.4rem;
  }
  
  .brand-title {
    font-size: 1.6rem;
  }
}
</style>