<style>
body, .v-application, .v-app, * {
  font-family: 'Roboto', Arial, sans-serif !important;
}
#app{
  min-width: 99vw ;
  position: absolute;
  left:0;
  top:0;
  padding: 0;
}
a {
  text-decoration: none;
  color: inherit;
}
</style>

<template>
  <v-app>
    <!-- Widok logowania bez layoutu -->
    <template v-if="route.path === '/login'">
      <router-view />
    </template>

    <!-- Widok główny z layoutem -->
    <template v-else>
      <!-- Menu boczne -->

  <v-layout class="rounded rounded-md border">
            <v-app-bar app color="primary" dark>
          <v-btn icon @click="drawer = !drawer">
            <v-icon>mdi-menu</v-icon>
          </v-btn>
          <v-toolbar-title>Mailing Admin</v-toolbar-title>
          <v-spacer />
          <v-btn icon>
            <v-icon>mdi-bell</v-icon>
          </v-btn>
          <v-btn icon>
            <v-icon>mdi-account-circle</v-icon>
          </v-btn>
        </v-app-bar>

      <v-navigation-drawer app v-model="drawer" :permanent="false" :temporary="true">
        <v-list nav>
          <v-list-item>
            <v-avatar size="40" class="mr-3">
              <img src="/src/assets/images/logos/logo.svg" alt="Logo" />
            </v-avatar>
            <v-list-item-title class="text-h6 font-weight-bold">Mailing Admin</v-list-item-title>
          </v-list-item>

          <v-divider class="my-2"></v-divider>

          <v-list-item prepend-icon="mdi-view-dashboard" title="Dashboard" :to="{ path: '/dashboard' }" link router />
          <v-list-item prepend-icon="mdi-email" title="Kampanie" :to="{ path: '/campaigns' }" link router />
        </v-list>
      </v-navigation-drawer>

    <v-main class="d-flex align-center justify-center" height="300">
      <v-container>
        <router-view />
      </v-container>
    </v-main>
  </v-layout>

    </template>
  </v-app>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'

axios.defaults.baseURL = 'http://localhost:3000'

const route = useRoute()
const showToolbar = computed(() => route.path !== '/login')
const drawer = ref(true)
</script>
