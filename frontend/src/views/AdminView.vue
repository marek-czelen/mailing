<template>
  <PageContent :title="t('admin.pageTitle')" :subtitle="t('admin.pageSubtitle')">
    <template #left-panel>
      <v-card class="admin-menu-card">
        <v-card-title class="card-header">
          <div class="header-content">
            <h3>{{ t('admin.menu.title') }}</h3>
          </div>
        </v-card-title>

        <v-card-text class="pa-0">
          <v-list>
            <v-list-item
              :class="{ 'selected': tab === 'users' }"
              @click="tab = 'users'"
              prepend-icon="mdi-account-multiple"
            >
              <v-list-item-title>{{ $t('admin.users.title') }}</v-list-item-title>
            </v-list-item>

            <v-list-item
              
              :class="{ 'selected': tab === 'roles' }"
              @click="tab = 'roles'"
              prepend-icon="mdi-shield-account"
            >
              <v-list-item-title>{{ $t('admin.permissions.title') }}</v-list-item-title>
            </v-list-item>

            <v-list-item
              
              :class="{ 'selected': tab === 'settings' }"
              @click="tab = 'settings'"
              prepend-icon="mdi-cog"
            >
              <v-list-item-title>{{ t('admin.menu.settings') }}</v-list-item-title>
            </v-list-item>

            <v-list-item
              
              :class="{ 'selected': tab === 'logs' }"
              @click="tab = 'logs'"
              prepend-icon="mdi-file-document-outline"
            >
              <v-list-item-title>{{ t('admin.menu.logs') }}</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-card-text>
      </v-card>
    </template>

    <template #right-panel>
      <!-- Sprawdzenie uprawnień -->
      <v-alert
        v-if="!isAdmin"
        type="error"
        prominent
        border="start"
        class="mb-4"
      >
        <v-row align="center">
          <v-col class="grow">
            <div class="text-h6">{{ $t('admin.permissions.noAccess') }}</div>
            <div>{{ $t('admin.permissions.requiresAdmin') }}</div>
          </v-col>
          <v-col class="shrink">
            <v-icon size="64">mdi-shield-alert</v-icon>
          </v-col>
        </v-row>
      </v-alert>

      <!-- Zawartość panelu administracyjnego -->
      <template v-else>
        <v-window v-model="tab">
          <!-- Tab z zarządzaniem użytkownikami -->
          <v-window-item value="users">
            <UsersTable />
          </v-window-item>

          <!-- Tab z uprawnieniami (na przyszłość) -->
          <v-window-item value="roles">
            <v-card>
              <v-card-text>
                <v-alert type="info" variant="tonal">
                  Zarządzanie szczegółowymi uprawnieniami będzie dostępne w przyszłych wersjach.
                </v-alert>
              </v-card-text>
            </v-card>
          </v-window-item>

          <!-- Tab z ustawieniami -->
          <v-window-item value="settings">
            <v-card>
              <v-card-text>
                <v-alert type="info" variant="tonal">
                  Ustawienia systemowe będą dostępne w przyszłych wersjach.
                </v-alert>
              </v-card-text>
            </v-card>
          </v-window-item>

          <!-- Tab z logami -->
          <v-window-item value="logs">
            <v-card>
              <v-card-text>
                <v-alert type="info" variant="tonal">
                  Logi systemowe będą dostępne w przyszłych wersjach.
                </v-alert>
              </v-card-text>
            </v-card>
          </v-window-item>
        </v-window>
      </template>
    </template>
  </PageContent>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n'
import PageContent from '../components/PageContent.vue';
import UsersTable from '../components/admin/UsersTable.vue';
import { UsersService } from '../services/users';

const { t } = useI18n();
const tab = ref('users');
const isAdmin = ref(false);
const loading = ref(true);

onMounted( async () => {
  await checkAdminPermissions();
});

async function checkAdminPermissions() {
  loading.value = true;
  try {
    isAdmin.value = await UsersService.isCurrentUserAdmin();
  } catch (error) {
    console.error('Błąd podczas sprawdzania uprawnień:', error);
    isAdmin.value = false;
  } finally {
    loading.value = false;
  }
}

</script>

<style scoped>
.admin-menu-card {
  border-radius: 8px !important;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08) !important;
  border: 1px solid #e0e0e0 !important;
  background: #ffffff !important;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.card-header {
  background: #fafafa !important;
  color: #1a1a2e !important;
  border-bottom: 1px solid #e0e0e0 !important;
  border-radius: 8px 8px 0 0 !important;
  padding: 10px 14px !important;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.header-content h3 {
  font-size: 0.95rem;
  font-weight: 600;
  margin: 0;
}

.v-list-item {
  cursor: pointer;
  border-left: 3px solid transparent;
  padding: 10px 14px;
}

.v-list-item:hover:not([disabled]) {
  background-color: #e8eaf6;
}

.v-list-item.selected {
  background-color: #e8eaf6;
  border-left-color: #6366f1;
}

.v-list-item[disabled] {
  opacity: 0.5;
  cursor: not-allowed;
}

.v-window {
  overflow: visible;
}
</style>
