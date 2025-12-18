<template>
  <v-card>
    <v-card-title>
      <v-row align="center">
        <v-col>
          <span class="text-h5">{{ $t('admin.users.title') }}</span>
        </v-col>
        <v-col cols="auto">
          <v-btn
            color="primary"
            prepend-icon="mdi-plus"
            @click="openCreateDialog"
          >
            {{ $t('admin.users.create') }}
          </v-btn>
        </v-col>
      </v-row>
    </v-card-title>

    <v-card-text>
      <!-- Tabela użytkowników -->
      <v-data-table
        :headers="headers"
        :items="users"
        :loading="loading"
        :items-per-page="10"
        class="elevation-1"
      >
        <!-- Kolumna z nazwą -->
        <template v-slot:item.name="{ item }">
          <div class="d-flex align-center">
            <v-avatar color="primary" size="32" class="mr-2">
              <span class="text-white text-caption">
                {{ getInitials(item.name) }}
              </span>
            </v-avatar>
            <div>
              <div class="font-weight-medium">{{ item.name }}</div>
              <div class="text-caption text-grey">{{ item.email }}</div>
            </div>
          </div>
        </template>

        <!-- Kolumna z rolami -->
        <template v-slot:item.roles="{ item }">
          <v-chip
            v-for="role in item.roles"
            :key="role"
            :color="getRoleColor(role)"
            size="small"
            class="mr-1"
          >
            {{ $t(`admin.roles.${role}`) }}
          </v-chip>
        </template>

        <!-- Kolumna ze statusem -->
        <template v-slot:item.active="{ item }">
          <v-chip
            :color="item.active ? 'success' : 'grey'"
            size="small"
          >
            {{ item.active ? $t('admin.users.table.active') : $t('admin.users.table.inactive') }}
          </v-chip>
        </template>

        <!-- Kolumna z akcjami -->
        <template v-slot:item.actions="{ item }">
          <v-menu>
            <template v-slot:activator="{ props }">
              <v-btn
                icon="mdi-dots-vertical"
                variant="text"
                size="small"
                v-bind="props"
              ></v-btn>
            </template>
            <v-list>
              <v-list-item @click="openEditDialog(item)">
                <template v-slot:prepend>
                  <v-icon>mdi-pencil</v-icon>
                </template>
                <v-list-item-title>{{ $t('admin.users.actions.edit') }}</v-list-item-title>
              </v-list-item>
              <v-list-item @click="toggleUserActive(item)">
                <template v-slot:prepend>
                  <v-icon>{{ item.active ? 'mdi-account-off' : 'mdi-account-check' }}</v-icon>
                </template>
                <v-list-item-title>
                  {{ item.active ? $t('admin.users.actions.deactivate') : $t('admin.users.actions.activate') }}
                </v-list-item-title>
              </v-list-item>
              <v-divider></v-divider>
              <v-list-item @click="openDeleteDialog(item)" class="text-error">
                <template v-slot:prepend>
                  <v-icon color="error">mdi-delete</v-icon>
                </template>
                <v-list-item-title>{{ $t('admin.users.actions.delete') }}</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </template>

        <!-- Pusta lista -->
        <template v-slot:no-data>
          <div class="text-center py-8">
            <v-icon size="64" color="grey-lighten-1">mdi-account-group</v-icon>
            <p class="text-h6 mt-4 text-grey">{{ $t('admin.users.noUsers') }}</p>
          </div>
        </template>
      </v-data-table>
    </v-card-text>

    <!-- Dialog tworzenia/edycji użytkownika -->
    <UserDialog
      v-model="dialogOpen"
      :user="selectedUser"
      :is-edit="isEdit"
      @save="handleSaveUser"
    />

    <!-- Dialog potwierdzenia usunięcia -->
    <v-dialog v-model="deleteDialogOpen" max-width="500">
      <v-card>
        <v-card-title class="text-h5">
          {{ $t('admin.users.delete') }}
        </v-card-title>
        <v-card-text>
          {{ $t('admin.users.deleteConfirm', { name: userToDelete?.name || '' }) }}
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            variant="text"
            @click="deleteDialogOpen = false"
          >
            {{ $t('admin.users.dialog.cancel') }}
          </v-btn>
          <v-btn
            color="error"
            variant="flat"
            @click="confirmDelete"
          >
            {{ $t('admin.users.delete') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Snackbar z powiadomieniami -->
    <v-snackbar
      v-model="snackbar"
      :color="snackbarColor"
      :timeout="3000"
    >
      {{ snackbarMessage }}
    </v-snackbar>
  </v-card>
</template>

<script>
import { UsersService } from '../../services/users';
import UserDialog from './UserDialog.vue';

export default {
  name: 'UsersTable',
  components: {
    UserDialog
  },
  data() {
    return {
      users: [],
      loading: false,
      dialogOpen: false,
      deleteDialogOpen: false,
      selectedUser: null,
      userToDelete: null,
      isEdit: false,
      snackbar: false,
      snackbarMessage: '',
      snackbarColor: 'success'
    };
  },
  computed: {
    headers() {
      return [
        { 
          title: this.$t('admin.users.table.name'),
          key: 'name',
          sortable: true
        },
        { 
          title: this.$t('admin.users.table.roles'),
          key: 'roles',
          sortable: false
        },
        { 
          title: this.$t('admin.users.table.status'),
          key: 'active',
          sortable: true
        },
        { 
          title: this.$t('admin.users.table.actions'),
          key: 'actions',
          sortable: false,
          align: 'end'
        }
      ];
    }
  },
  mounted() {
    this.loadUsers();
  },
  methods: {
    async loadUsers() {
      this.loading = true;
      try {
        this.users = await UsersService.getUsers();
      } catch (error) {
        this.showSnackbar(this.$t('admin.users.errors.loadFailed'), 'error');
      } finally {
        this.loading = false;
      }
    },
    openCreateDialog() {
      this.selectedUser = null;
      this.isEdit = false;
      this.dialogOpen = true;
    },
    openEditDialog(user) {
      this.selectedUser = { ...user };
      this.isEdit = true;
      this.dialogOpen = true;
    },
    openDeleteDialog(user) {
      this.userToDelete = user;
      this.deleteDialogOpen = true;
    },
    async handleSaveUser(userData) {
      try {
        if (this.isEdit) {
          await UsersService.updateUser(userData.id, userData);
          this.showSnackbar(this.$t('admin.users.updateSuccess'), 'success');
        } else {
          await UsersService.createUser(userData);
          this.showSnackbar(this.$t('admin.users.createSuccess'), 'success');
        }
        this.dialogOpen = false;
        await this.loadUsers();
      } catch (error) {
        const errorMsg = this.isEdit 
          ? this.$t('admin.users.errors.updateFailed')
          : this.$t('admin.users.errors.createFailed');
        this.showSnackbar(errorMsg, 'error');
      }
    },
    async confirmDelete() {
      if (!this.userToDelete) return;
      
      try {
        await UsersService.deleteUser(this.userToDelete.id);
        this.showSnackbar(this.$t('admin.users.deleteSuccess'), 'success');
        this.deleteDialogOpen = false;
        await this.loadUsers();
      } catch (error) {
        this.showSnackbar(this.$t('admin.users.errors.deleteFailed'), 'error');
      }
    },
    async toggleUserActive(user) {
      try {
        await UsersService.setUserActive(user.id, !user.active);
        await this.loadUsers();
        this.showSnackbar(this.$t('admin.users.updateSuccess'), 'success');
      } catch (error) {
        this.showSnackbar(this.$t('admin.users.errors.updateFailed'), 'error');
      }
    },
    getInitials(name) {
      if (!name) return '?';
      return name
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
    },
    getRoleColor(role) {
      const colors = {
        administrator: 'red',
        marketer: 'blue',
        data_administrator: 'green'
      };
      return colors[role] || 'grey';
    },
    showSnackbar(message, color = 'success') {
      this.snackbarMessage = message;
      this.snackbarColor = color;
      this.snackbar = true;
    }
  }
};
</script>

<style scoped>
.v-data-table {
  background: transparent;
}
</style>
