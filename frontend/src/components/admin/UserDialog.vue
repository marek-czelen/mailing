<template>
  <GeneralDialog 
    v-model="internalDialog" 
    max-width="600" 
    persistent
    @update:model-value="val => internalDialog = val"
    :title="t(`${isEdit ? 'admin.users.dialog.editTitle' : 'admin.users.dialog.createTitle'}`)"
    >
      <template #default>
                <v-form ref="form" v-model="valid">
          <!-- Imię i nazwisko -->
          <v-text-field
            v-model="formData.name"
            :label="$t('admin.users.fields.name')"
            :rules="[rules.required]"
            prepend-icon="mdi-account"
            variant="outlined"
            density="comfortable"
            class="mb-3"
          ></v-text-field>

          <!-- Email -->
          <v-text-field
            v-model="formData.email"
            :label="$t('admin.users.fields.email')"
            :rules="[rules.required, rules.email]"
            prepend-icon="mdi-email"
            variant="outlined"
            density="comfortable"
            type="email"
            class="mb-3"
          ></v-text-field>

          <!-- Hasło (tylko przy tworzeniu lub zmianie) -->
          <v-text-field
            v-if="!isEdit || showPasswordFields"
            v-model="formData.password"
            :label="$t('admin.users.fields.password')"
            :rules="!isEdit ? [rules.required, rules.minLength] : [rules.minLength]"
            prepend-icon="mdi-lock"
            :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
            :type="showPassword ? 'text' : 'password'"
            @click:append-inner="showPassword = !showPassword"
            variant="outlined"
            density="comfortable"
            class="mb-3"
          ></v-text-field>

          <!-- Potwierdzenie hasła -->
          <v-text-field
            v-if="!isEdit || showPasswordFields"
            v-model="formData.confirmPassword"
            :label="$t('admin.users.fields.confirmPassword')"
            :rules="!isEdit ? [rules.required, rules.passwordMatch] : [rules.passwordMatch]"
            prepend-icon="mdi-lock-check"
            :type="showPassword ? 'text' : 'password'"
            variant="outlined"
            density="comfortable"
            class="mb-3"
          ></v-text-field>

          <!-- Przycisk zmiany hasła (tylko przy edycji) -->
          <div v-if="isEdit && !showPasswordFields" class="mb-4">
            <v-btn
              variant="text"
              color="primary"
              size="small"
              prepend-icon="mdi-lock-reset"
              @click="showPasswordFields = true"
            >
              {{ $t('admin.users.actions.changePassword') }}
            </v-btn>
          </div>

          <!-- Role -->
          <v-card variant="outlined" class="mb-3">
            <v-card-subtitle class="font-weight-bold">
              {{ $t('admin.users.fields.roles') }}
            </v-card-subtitle>
            <v-card-text>
              <v-checkbox
                v-for="role in availableRoles"
                :key="role.value"
                v-model="formData.roles"
                :value="role.value"
                :label="role.label"
                :rules="[rules.atLeastOneRole]"
                hide-details
                density="compact"
              >
                <template v-slot:label>
                  <div>
                    <div class="font-weight-medium">{{ role.label }}</div>
                    <div class="text-caption text-grey">{{ role.description }}</div>
                  </div>
                </template>
              </v-checkbox>
            </v-card-text>
          </v-card>

          <!-- Status aktywny -->
          <v-switch
            v-model="formData.active"
            :label="$t('admin.users.fields.active')"
            color="success"
            hide-details
          ></v-switch>
        </v-form>
      </template>
      <template #actions>
                <v-btn
          variant="text"
          @click="closeDialog"
        >
          {{ $t('admin.users.dialog.cancel') }}
        </v-btn>
        <v-btn
          color="primary"
          variant="flat"
          :disabled="!valid"
          @click="saveUser"
        >
          {{ $t('admin.users.dialog.save') }}
        </v-btn>
      </template>


  </GeneralDialog>
</template>

<script setup>
import { watch, ref, computed } from 'vue';
import { UsersService } from '../../services/users';
import GeneralDialog from '../GeneralDialog.vue';
import { useI18n } from 'vue-i18n';
const { t } = useI18n();

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  user: {
    type: Object,
    default: null
  },
  isEdit: {
    type: Boolean,
    default: false
  }
});
const emit = defineEmits(['update:modelValue', 'save']);
const valid = ref(false);
const showPassword = ref(false);
const showPasswordFields = ref(false);
const formData = ref({
  name: '',
  email: '',
  password: '',
  confirmPassword: ''});

const roles =ref([]);
const active = ref(true);
      
const rules = {
        required: value => !!value || this.$t('validation.required'),
        email: value => {
          const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          return pattern.test(value) || this.$t('validation.email');
        },
        minLength: value => {
          if (!value) return true; // Opcjonalne przy edycji
          return value.length >= 6 || 'Hasło musi mieć co najmniej 6 znaków';
        },
        passwordMatch: value => {
          if (!value && !this.formData.password) return true; // Opcjonalne przy edycji
          return value === this.formData.password || this.$t('admin.users.errors.passwordMismatch');
        },
        atLeastOneRole: () => {
          return this.formData.roles.length > 0 || this.$t('admin.users.errors.selectAtLeastOneRole');
        }
      }

const internalDialog = computed({
  get() {
    return props.modelValue;
  },
  set(value) {
    emit('update:modelValue', value);
  }
});

const availableRoles = computed(() => {
  return [
    {
      value: UsersService.ROLES.ADMINISTRATOR,
      label: t('admin.roles.administrator'),
      description: t('admin.roles.descriptions.administrator')
    },
    {
      value: UsersService.ROLES.MARKETER,
      label: t('admin.roles.marketer'),
      description: t('admin.roles.descriptions.marketer')
    },
    {
      value: UsersService.ROLES.DATA_ADMINISTRATOR,
      label: t('admin.roles.data_administrator'),
      description: t('admin.roles.descriptions.data_administrator')
    }
  ];
});

watch(props.user, (newUser) => {
  if (newUser) {
    formData.value = {
      ...newUser,
      password: '',
      confirmPassword: '',
      roles: newUser.roles || []
    };
  } else {
    resetForm();
  }
});
watch(() => props.modelValue, (newVal) => {
  if (!newVal) {
    showPasswordFields.value = false;
    showPassword.value = false;
  }
});

function resetForm() {
      formData.value = {
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        roles: [],
        active: true
      };
      this.$refs.form?.resetValidation();
    }
function closeDialog() {
      internalDialog.value = false;
      resetForm();
    }
async function saveUser() {
      const { valid } = await this.$refs.form.validate();
      
      if (valid) {
        const userData = { ...this.formData };
        
        // Usuń pola hasła jeśli nie są wypełnione (przy edycji)
        if (this.isEdit && !this.showPasswordFields) {
          delete userData.password;
          delete userData.confirmPassword;
        } else {
          delete userData.confirmPassword; // Backend nie potrzebuje potwierdzenia
        }
        
        this.$emit('save', userData);
      }
    }

</script>

<style scoped>
.v-card-subtitle {
  padding-top: 8px;
  padding-bottom: 0;
}
</style>
