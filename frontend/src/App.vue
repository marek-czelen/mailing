<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  overflow-x: hidden;
}

body, .v-application, .v-app, * {
  font-family: 'Manrope', 'Segoe UI', sans-serif !important;
}

#app {
  width: 100vw;
  height: 100vh;
  margin: 0;
  padding: 0;
  position: fixed;
  top: 0;
  left: 0;
  overflow: hidden;
}

.v-app {
  background: #f6f7f9 !important;
  width: 100vw !important;
  height: 100vh !important;
  margin: 0 !important;
  padding: 0 !important;
}

a {
  text-decoration: none;
  color: inherit;
}

.app-layout {
  display: flex;
  flex-direction: column;
  width: 100vw;
  min-width: 100vw;
  height: 100vh;
  margin: 0;
  padding: 0;
  overflow: hidden;
  box-sizing: border-box;
}

.main-content {
  flex: 1;
  width: 100vw;
  min-width: 100vw;
  height: calc(100vh - 64px);
  margin: 0;
  padding: 0;
  overflow: auto;
  box-sizing: border-box;
}

/* Mobile drawer styles */
.mobile-drawer {
  background: rgba(255, 255, 255, 0.98) !important;
  backdrop-filter: blur(20px) !important;
  border-right: 1px solid rgba(255, 255, 255, 0.2) !important;
}

.drawer-content {
  padding: 20px 0;
}

.drawer-header {
  padding: 0 20px 16px;
}

.drawer-brand {
  display: flex;
  align-items: center;
  gap: 12px;
}

.drawer-brand-text {
  font-size: 1.2rem;
  font-weight: 700;
  background: linear-gradient(135deg, #202950 0%, #515bad 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.drawer-divider {
  margin: 16px 20px !important;
  border-color: rgba(81, 91, 173, 0.2) !important;
}

.drawer-nav {
  padding: 0 12px;
}

.drawer-nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  margin: 4px 0;
  border-radius: 12px;
  color: #718096;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.3s ease;
}

.drawer-nav-item:hover {
  background: rgba(81, 91, 173, 0.1);
  color: #515bad;
  transform: translateX(4px);
}

.drawer-nav-item.router-link-active {
  background: linear-gradient(135deg, #202950 0%, #515bad 100%);
  color: #eadcf6;
  box-shadow: 0 4px 15px rgba(81, 91, 173, 0.3);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .main-content {
    height: calc(100vh - 56px);
  }
}

/* Ensure full width for all containers - remove ALL margins and paddings */
.v-container,
.v-container-fluid {
  max-width: none !important;
  width: 100vw !important;
  min-width: 100vw !important;
  margin: 0 !important;
  padding: 0 !important;
  box-sizing: border-box !important;
}

.v-row {
  margin: 0 !important;
  box-sizing: border-box !important;
}

.v-col {
  padding: 8px !important;
  margin: 0 !important;
  box-sizing: border-box !important;
}

/* Remove all default Vuetify spacings */
.v-main {
  padding: 0 !important;
  margin: 0 !important;
  width: 100% !important;
}

.v-main > .v-main__wrap {
  padding: 0 !important;
  margin: 0 !important;
  width: 100% !important;
}

/* Force full width on all layouts */
.v-layout {
  width: 100vw !important;
  height: 100vh !important;
  margin: 0 !important;
  padding: 0 !important;
}

/* Remove any default margins from views */
.v-view {
  margin: 0 !important;
  padding: 0 !important;
  width: 100% !important;
}

/* Ensure router view takes full space */
#app > .v-app > .app-layout > .main-content > * {
  width: 100% !important;
  margin: 0 !important;
}
</style>

<template>
  <v-app>
    <!-- Widoki publiczne bez layoutu (login, unsubscribe) -->
    <template v-if="isPublicRoute">
      <router-view />
    </template>

    <!-- Widok główny z nowoczesnym layoutem -->
    <template v-else>
      <div class="app-layout">
        <!-- Nowoczesny toolbar -->
        <AppToolbar @toggle-drawer="drawer = !drawer" />
        
        <!-- Mobile navigation drawer -->
        <v-navigation-drawer 
          v-model="drawer" 
          :temporary="true" 
          app 
          class="mobile-drawer"
          v-if="isMobile"
        >
          <div class="drawer-content">
            <div class="drawer-header">
              <div class="drawer-brand">
                <svg viewBox="0 0 24 24" width="32" height="32">
                  <path fill="url(#drawerGradient)" d="M20,8L12,13L4,8V6L12,11L20,6M20,4H4C2.89,4 2,4.89 2,6V18A2,2 0 0,0 4,20H20A2,2 0 0,0 22,18V6C22,4.89 21.1,4 20,4Z"/>
                  <defs>
                    <linearGradient id="drawerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
                      <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
                    </linearGradient>
                  </defs>
                </svg>
                <span class="drawer-brand-text">{{ $t('drawer.brand') }}</span>
              </div>
            </div>
            
            <v-divider class="drawer-divider"></v-divider>
            
            <nav class="drawer-nav">
              <router-link to="/dashboard" class="drawer-nav-item" @click="drawer = false">
                <svg viewBox="0 0 24 24" width="20" height="20">
                  <path fill="currentColor" d="M13,3V9H21V3M13,21H21V11H13M3,21H11V15H3M3,13H11V3H3V13Z"/>
                </svg>
                {{ $t('nav.dashboard') }}
              </router-link>
              <router-link to="/campaigns" class="drawer-nav-item" @click="drawer = false">
                <svg viewBox="0 0 24 24" width="20" height="20">
                  <path fill="currentColor" d="M22,6C22,4.89 21.1,4 20,4H4A2,2 0 0,0 2,6V18A2,2 0 0,0 4,20H20A2,2 0 0,0 22,18V6M20,6L12,11L4,6H20M20,18H4V8L12,13L20,8V18Z"/>
                </svg>
                {{ $t('nav.campaigns') }}
              </router-link>
              <router-link to="/databases" class="drawer-nav-item" @click="drawer = false">
                <svg viewBox="0 0 24 24" width="20" height="20">
                  <path fill="currentColor" d="M12,3C7.58,3 4,4.79 4,7C4,9.21 7.58,11 12,11C16.42,11 20,9.21 20,7C20,4.79 16.42,3 12,3M4,9V12C4,14.21 7.58,16 12,16C16.42,16 20,14.21 20,12V9C20,11.21 16.42,13 12,13C7.58,13 4,11.21 4,9M4,14V17C4,19.21 7.58,21 12,21C16.42,21 20,19.21 20,17V14C20,16.21 16.42,18 12,18C7.58,18 4,16.21 4,14Z"/>
                </svg>
                {{ $t('nav.databases') }}
              </router-link>
              <router-link to="/block-email-editor" class="drawer-nav-item" @click="drawer = false">
                <svg viewBox="0 0 24 24" width="20" height="20">
                  <path fill="currentColor" d="M8,12H16V14H8V12M10,20H6V4H13V9H18V12.1L20,10.1V8L14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H10V20M20.2,13C20.3,13 20.5,13.1 20.6,13.2L21.9,14.5C22.1,14.7 22.1,15.1 21.9,15.3L20.9,16.3L18.8,14.2L19.8,13.2C19.9,13.1 20,13 20.2,13M20.2,16.9L14.1,23H12V20.9L18.1,14.8L20.2,16.9Z"/>
                </svg>
                {{ $t('nav.editor') }}
              </router-link>
              <router-link v-if="isAdmin" to="/admin" class="drawer-nav-item" @click="drawer = false">
                <svg viewBox="0 0 24 24" width="20" height="20">
                  <path fill="currentColor" d="M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1M12,5A3,3 0 0,1 15,8A3,3 0 0,1 12,11A3,3 0 0,1 9,8A3,3 0 0,1 12,5M17.13,17C15.92,18.85 14.11,20.24 12,20.92C9.89,20.24 8.08,18.85 6.87,17C6.53,16.5 6.24,16 6,15.47C6,13.82 8.71,12.47 12,12.47C15.29,12.47 18,13.79 18,15.47C17.76,16 17.47,16.5 17.13,17Z"/>
                </svg>
                {{ $t('nav.admin') }}
              </router-link>
            </nav>
          </div>
        </v-navigation-drawer>

        <!-- Main content area -->
        <main class="main-content">
          <router-view />
        </main>
      </div>
    </template>
  </v-app>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import AppToolbar from './components/AppToolbar.vue'
import { UsersService } from './services/users'

// Ustaw bazowy URL API z zmiennej środowiskowej Vite
// W development fallback do localhost:3000
const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'
axios.defaults.baseURL = baseURL

const route = useRoute()
const router = useRouter()
const drawer = ref(false)
const isMobile = ref(false)
const isAdmin = ref(false)

// Check if current route is public (no layout needed)
const isPublicRoute = computed(() => {
  const currentPath = route.path
  const currentName = route.name
  
  // Check by path
  if (currentPath === '/login' || currentPath.startsWith('/unsubscribe/')) {
    return true
  }
  
  // Check by route name
  if (currentName === 'Login' || currentName === 'Unsubscribe') {
    return true
  }
  
  return false
})

// Check if device is mobile
function checkMobile() {
  isMobile.value = window.innerWidth < 768
}

onMounted(async () => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
  // Sprawdź czy użytkownik jest adminem
  try { isAdmin.value = await UsersService.isCurrentUserAdmin() } catch {}
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
})

function goToSettings() {
  router.push('/settings')
}

function logout() {
  localStorage.removeItem('token')
  router.push('/login')
}
</script>
