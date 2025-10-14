<template>
<v-app-bar color="primary" dark flat fixed density="compact">
  <span class="toolbar-title ml-2">
    <v-icon class="mr-2">mdi-email-send</v-icon>
    MailingApp
  </span>
  <v-spacer />
  <v-menu>
    <template #activator="{ props }">
      <v-btn icon v-bind="props">
        <v-avatar size="32" icon="mdi-account-circle">

        </v-avatar>
      </v-btn>
    </template>
    <v-list>
      <v-list-item @click="logout">
        <v-icon left>mdi-logout</v-icon>
        <v-list-item-title>Wyloguj</v-list-item-title>
      </v-list-item>
    </v-list>
  </v-menu>
</v-app-bar>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { Account } from '../services/account';

const router = useRouter();

function logout() {
  Account.logout();
  router.push('/login');
}
</script>

<style scoped>
.v-app-bar {
  border-radius: 0;
  min-height: 56px;
  background: #e0e0e0 !important;
  color: #111 !important;
}
.toolbar-title {
  font-weight: 600;
  font-size: 1.2rem;
  letter-spacing: 1px;
  display: flex;
  align-items: center;
  color: #111 !important;
}
 .v-icon {
   color: #111 !important;
 }
</style>
