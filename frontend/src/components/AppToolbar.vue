<template>
<div class="modern-toolbar">
  <div class="toolbar-content">
    <!-- Left side - Brand -->
    <div class="toolbar-brand">
      <div class="brand-icon">
        <svg viewBox="0 0 24 24" width="28" height="28">
          <path fill="white" d="M20,8L12,13L4,8V6L12,11L20,6M20,4H4C2.89,4 2,4.89 2,6V18A2,2 0 0,0 4,20H20A2,2 0 0,0 22,18V6C22,4.89 21.1,4 20,4Z"/>
        </svg>
      </div>
      <span class="brand-text">{{ $t('drawer.brand') }}</span>
    </div>

    <!-- Center - Navigation -->
    <nav class="toolbar-nav">
      <router-link to="/dashboard" class="nav-item">
        <svg viewBox="0 0 24 24" width="20" height="20">
          <path fill="currentColor" d="M13,3V9H21V3M13,21H21V11H13M3,21H11V15H3M3,13H11V3H3V13Z"/>
        </svg>
        {{ $t('nav.dashboard') }}
      </router-link>
      <router-link to="/campaigns" class="nav-item">
        <svg viewBox="0 0 24 24" width="20" height="20">
          <path fill="currentColor" d="M22,6C22,4.89 21.1,4 20,4H4A2,2 0 0,0 2,6V18A2,2 0 0,0 4,20H20A2,2 0 0,0 22,18V6M20,6L12,11L4,6H20M20,18H4V8L12,13L20,8V18Z"/>
        </svg>
        {{ $t('nav.campaigns') }}
      </router-link>
      <router-link to="/databases" class="nav-item">
        <svg viewBox="0 0 24 24" width="20" height="20">
          <path fill="currentColor" d="M12,3C7.58,3 4,4.79 4,7C4,9.21 7.58,11 12,11C16.42,11 20,9.21 20,7C20,4.79 16.42,3 12,3M4,9V12C4,14.21 7.58,16 12,16C16.42,16 20,14.21 20,12V9C20,11.21 16.42,13 12,13C7.58,13 4,11.21 4,9M4,14V17C4,19.21 7.58,21 12,21C16.42,21 20,19.21 20,17V14C20,16.21 16.42,18 12,18C7.58,18 4,16.21 4,14Z"/>
        </svg>
        {{ $t('nav.databases') }}
      </router-link>
      <router-link v-if="isAdmin" to="/admin" class="nav-item">
        <svg viewBox="0 0 24 24" width="20" height="20">
          <path fill="currentColor" d="M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1M12,5A3,3 0 0,1 15,8A3,3 0 0,1 12,11A3,3 0 0,1 9,8A3,3 0 0,1 12,5M17.13,17C15.92,18.85 14.11,20.24 12,20.92C9.89,20.24 8.08,18.85 6.87,17C6.53,16.5 6.24,16 6,15.47C6,13.82 8.71,12.47 12,12.47C15.29,12.47 18,13.79 18,15.47C17.76,16 17.47,16.5 17.13,17Z"/>
        </svg>
        {{ $t('nav.admin') }}
      </router-link>
      <router-link to="/block-email-editor" class="nav-item">
        <svg viewBox="0 0 24 24" width="20" height="20">
          <path fill="currentColor" d="M8,12H16V14H8V12M10,20H6V4H13V9H18V12.1L20,10.1V8L14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H10V20M20.2,13C20.3,13 20.5,13.1 20.6,13.2L21.9,14.5C22.1,14.7 22.1,15.1 21.9,15.3L20.9,16.3L18.8,14.2L19.8,13.2C19.9,13.1 20,13 20.2,13M20.2,16.9L14.1,23H12V20.9L18.1,14.8L20.2,16.9Z"/>
        </svg>
        {{ $t('nav.editor') }}
      </router-link>
    </nav>

    <!-- Mobile menu toggle -->
    <button 
      class="mobile-nav-toggle" 
      @click="$emit('toggle-drawer')"
      v-if="isMobile"
    >
      <svg viewBox="0 0 24 24" width="24" height="24">
        <path fill="currentColor" d="M3,6H21V8H3V6M3,11H21V13H3V11M3,16H21V18H3V16Z"/>
      </svg>
    </button>

    <!-- Right side - User menu -->
    <div class="toolbar-actions">
      <div style="margin-right:12px; display:flex; align-items:center; gap:8px; color:white">
        <label style="font-size:0.9rem">{{$t('toolbar.language')}}</label>
        <select v-model="currentLocale" @change="changeLocale" style="padding:6px; border-radius:6px">
          <option value="pl">PL</option>
          <option value="en">EN</option>
        </select>
      </div>
      <v-menu>
        <template #activator="{ props }">
          <button class="user-menu-btn" v-bind="props">
            <div class="user-avatar">
              <svg viewBox="0 0 24 24" width="20" height="20">
                <path fill="currentColor" d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z"/>
              </svg>
            </div>
            <svg class="chevron" viewBox="0 0 24 24" width="16" height="16">
              <path fill="currentColor" d="M7,10L12,15L17,10H7Z"/>
            </svg>
          </button>
        </template>
        <v-list class="user-dropdown">
            <v-list-item v-if="isAdmin" @click="goToAdmin" class="menu-item">
            <template v-slot:prepend>
              <svg viewBox="0 0 24 24" width="20" height="20">
                <path fill="currentColor" d="M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1M12,5A3,3 0 0,1 15,8A3,3 0 0,1 12,11A3,3 0 0,1 9,8A3,3 0 0,1 12,5M17.13,17C15.92,18.85 14.11,20.24 12,20.92C9.89,20.24 8.08,18.85 6.87,17C6.53,16.5 6.24,16 6,15.47C6,13.82 8.71,12.47 12,12.47C15.29,12.47 18,13.79 18,15.47C17.76,16 17.47,16.5 17.13,17Z"/>
              </svg>
            </template>
            <v-list-item-title>{{ $t('nav.admin') }}</v-list-item-title>
          </v-list-item>
          <v-divider v-if="isAdmin" style="opacity: 0.2; margin: 4px 0;"></v-divider>
            <v-list-item @click="settings" class="menu-item">
            <template v-slot:prepend>
              <svg viewBox="0 0 24 24" width="20" height="20">
                <path fill="currentColor" d="M19.14 12.94c.04-.31.06-.63.06-.94s-.02-.63-.06-.94l2.03-1.58a.5.5 0 0 0 .12-.63l-1.92-3.32a.5.5 0 0 0-.6-.22l-2.39.96a7.36 7.36 0 0 0-1.66-.96l-.36-2.57A.5.5 0 0 0 13.6 2h-3.2a.5.5 0 0 0-.49.42L9.55 5a7.36 7.36 0 0 0-1.66.96l-2.39-.96a.5.5 0 0 0-.6.22L2.98 9.5a.5.5 0 0 0 .12.63l2.03 1.58c-.04.31-.06.63-.06.94s.02.63.06.94L3.1 15.2a.5.5 0 0 0-.12.63l1.92 3.32c.14.24.43.34.68.25l2.39-.96c.5.29 1.02.52 1.66.7l.36 2.57c.05.27.28.42.49.42h3.2c.25 0 .45-.15.49-.42l.36-2.57c.64-.18 1.16-.41 1.66-.7l2.39.96c.25.09.54-.01.68-.25l1.92-3.32a.5.5 0 0 0-.12-.63l-2.03-1.58zM12 15.5A3.5 3.5 0 1 1 12 8.5a3.5 3.5 0 0 1 0 7z"/>
              </svg>
            </template>
            <v-list-item-title>{{ $t('toolbar.settings') }}</v-list-item-title>
          </v-list-item>
          <v-divider style="opacity: 0.2; margin: 4px 0;"></v-divider>
            <v-list-item @click="logout" class="logout-item">
            <template v-slot:prepend>
              <svg viewBox="0 0 24 24" width="20" height="20">
                <path fill="currentColor" d="M16,17V14H9V10H16V7L21,12L16,17M14,2A2,2 0 0,1 16,4V6H14V4H5V20H14V18H16V20A2,2 0 0,1 14,22H5A2,2 0 0,1 3,20V4A2,2 0 0,1 5,2H14Z"/>
              </svg>
            </template>
            <v-list-item-title>{{ $t('toolbar.logout') }}</v-list-item-title>
          </v-list-item>          
        </v-list>
        
      </v-menu>
    </div>
  </div>
</div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router';
import { Account } from '../services/account';
import { UsersService } from '../services/users';

const router = useRouter();
const isMobile = ref(false);
const { locale } = useI18n()

// Dialog state
const currentLocale = ref(locale.value)
const isAdmin = ref(false)

// Define emits
const emit = defineEmits(['toggle-drawer']);

// Check if device is mobile
function checkMobile() {
  isMobile.value = window.innerWidth < 768;
}

onMounted(async () => {
  checkMobile();
  window.addEventListener('resize', checkMobile);
  
    try {
      // Sprawdź czy użytkownik jest administratorem
      isAdmin.value = await UsersService.isCurrentUserAdmin();
    } catch (error) {
      console.warn('Nie udało się sprawdzić uprawnień admina:', error);
    }
});

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile);
});

function logout() {
  Account.logout();
  router.push('/login');
}

function changeLocale() {
  locale.value = currentLocale.value
  try {
    localStorage.setItem('app_locale', currentLocale.value)
  } catch (e) {
    console.warn('Could not persist locale', e)
  }
}

function settings() {
  router.push('/settings');
}

function goToAdmin() {
  router.push('/admin');
}
</script>

<style scoped>
.modern-toolbar {
  background: #18212f;
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(234, 220, 246, 0.3);
  box-shadow: 0 4px 30px rgba(20, 15, 7, 0.15);
  position: sticky;
  top: 0;
  left: 0;
  z-index: 1000;
  transition: all 0.3s ease;
  width: 100vw;
  min-width: 100vw;
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.toolbar-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  width: 100%;
  min-width: 100%;
  height: 64px;
  margin: 0;
  box-sizing: border-box;
}

/* Brand section */
.toolbar-brand {
  display: flex;
  align-items: center;
  gap: 12px;
  font-weight: 700;
  font-size: 1.3rem;
  color: white;
}

.brand-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.brand-text {
  color: white;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  font-weight: 800;
}

/* Navigation */
.toolbar-nav {
  display: flex;
  align-items: center;
  gap: 8px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border-radius: 12px;
  text-decoration: none;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 500;
  font-size: 0.95rem;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.nav-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.2);
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: -1;
  border-radius: 12px;
}

.nav-item:hover {
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}

.nav-item:hover::before {
  opacity: 1;
}

.nav-item.router-link-active {
  color: white;
  background: rgba(255, 255, 255, 0.25);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

/* User actions */
.toolbar-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.toolbar-actions label {
  font-weight: 500;
  font-size: 0.9rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.toolbar-actions select {
  padding: 6px 10px;
  border-radius: 8px;
  border: 1px solid rgba(234, 220, 246, 0.3);
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.08) 100%);
  color: white;
  font-weight: 500;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(20, 15, 7, 0.1);
}

.toolbar-actions select:hover {
  border-color: rgba(234, 220, 246, 0.5);
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.12) 100%);
  box-shadow: 0 4px 12px rgba(20, 15, 7, 0.15);
}

.toolbar-actions select:focus {
  outline: none;
  border-color: rgba(234, 220, 246, 0.6);
  box-shadow: 0 0 12px rgba(147, 149, 250, 0.3);
}

.toolbar-actions select option {
  background: #202950;
  color: white;
  padding: 8px;
}

.user-menu-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.06) 100%);
  border: 1.5px solid rgba(234, 220, 246, 0.25);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  color: white;
  box-shadow: 0 4px 12px rgba(20, 15, 7, 0.1), inset 0 1px 1px rgba(255, 255, 255, 0.15);
}

.user-menu-btn:hover {
  border-color: rgba(234, 220, 246, 0.5);
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.12) 100%);
  box-shadow: 0 6px 16px rgba(20, 15, 7, 0.15), inset 0 1px 1px rgba(255, 255, 255, 0.2), 0 0 20px rgba(147, 149, 250, 0.2);
  transform: translateY(-2px);
}

.user-avatar {
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, rgba(147, 149, 250, 0.3) 0%, rgba(81, 91, 173, 0.2) 100%);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  border: 1px solid rgba(234, 220, 246, 0.3);
  transition: all 0.3s ease;
}

.user-menu-btn:hover .user-avatar {
  background: linear-gradient(135deg, rgba(147, 149, 250, 0.5) 0%, rgba(81, 91, 173, 0.35) 100%);
  border-color: rgba(234, 220, 246, 0.5);
}

.chevron {
  transition: transform 0.3s ease;
}

.user-menu-btn:hover .chevron {
  transform: rotate(180deg);
}

/* Dropdown styles */
.user-dropdown {
  min-width: 220px;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.12);
  background: #ffffff;
  overflow: hidden;
  padding: 4px 0;
}

.user-dropdown :deep(.v-divider) {
  border-color: #e0e0e0 !important;
  margin: 4px 0 !important;
}

/* Wszystkie list items */
.user-dropdown :deep(.v-list-item) {
  background: transparent !important;
  transition: background 0.15s ease !important;
  padding: 8px 16px !important;
  min-height: 36px;
  margin: 0 !important;
  border-radius: 0 !important;
}

.user-dropdown :deep(.v-list-item:hover) {
  background: #e8eaf6 !important;
}

/* Ikonki */
.user-dropdown :deep(.v-list-item__prepend) {
  color: #718096 !important;
  margin-right: 10px !important;
  display: flex !important;
  align-items: center !important;
  transition: color 0.15s ease !important;
}

.user-dropdown :deep(.v-list-item:hover .v-list-item__prepend) {
  color: #6366f1 !important;
}

/* Tekst w menu items */
.user-dropdown :deep(.v-list-item-title) {
  color: #1a1a2e !important;
  font-weight: 500 !important;
  font-size: 0.9rem !important;
  letter-spacing: normal !important;
  line-height: 1.3 !important;
}

.user-dropdown :deep(.v-list-item:hover .v-list-item-title) {
  color: #6366f1 !important;
}

/* Admin i Settings items */
.menu-item :deep(.v-list-item) {
  color: #1a1a2e !important;
}

.menu-item :deep(.v-list-item-title) {
  color: #1a1a2e !important;
}

/* Logout item */
.logout-item :deep(.v-list-item) {
  background: transparent !important;
}

.logout-item :deep(.v-list-item-title) {
  color: #e53e3e !important;
  font-weight: 500 !important;
  text-shadow: none !important;
}

.logout-item:hover :deep(.v-list-item-title) {
  color: #e53e3e !important;
  text-shadow: none !important;
}

.logout-item:hover {
  background: #fef2f2 !important;
}

.logout-item :deep(.v-list-item__prepend) {
  color: #e53e3e !important;
}

.logout-item:hover :deep(.v-list-item__prepend) {
  color: #e53e3e !important;
  transform: none !important;
  text-shadow: none !important;
}

/* Responsive design */
@media (max-width: 1100px) and (min-width: 769px) {
  .toolbar-content {
    padding: 0 14px;
  }

  .toolbar-brand {
    gap: 7px;
    font-size: 1.05rem;
  }

  .brand-icon {
    width: 36px;
    height: 36px;
  }

  .toolbar-nav {
    gap: 2px;
  }

  .nav-item {
    gap: 5px;
    padding: 10px 9px;
    font-size: 0.82rem;
  }

  .toolbar-actions {
    gap: 8px;
  }

  .toolbar-actions label {
    display: none;
  }

  .user-menu-btn {
    padding: 6px 8px;
  }
}

@media (max-width: 768px) {
  .toolbar-content {
    padding: 0 16px;
  }
  
  .toolbar-nav {
    display: none;
  }
  
  .brand-text {
    font-size: 1.1rem;
  }
}

@media (max-width: 480px) {
  .toolbar-content {
    padding: 0 12px;
    height: 56px;
  }
  
  .brand-icon {
    width: 36px;
    height: 36px;
  }
  
  .brand-text {
    font-size: 1rem;
  }
}

/* Mobile navigation toggle */
.mobile-nav-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  cursor: pointer;
  color: white;
  transition: all 0.3s ease;
  margin-right: 12px;
}

.mobile-nav-toggle:hover {
  border-color: rgba(255, 255, 255, 0.4);
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

@media (min-width: 769px) {
  .mobile-nav-toggle {
    display: none;
  }
}
</style>
