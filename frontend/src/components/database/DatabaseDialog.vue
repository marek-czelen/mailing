<template>
  <GeneralDialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    :title="isEditing ? 'Edytuj bazę danych' : 'Nowa baza danych'"
  >
    <template #default>
      <v-form ref="form" v-model="valid" @submit.prevent="save">
        <!-- Podstawowe informacje -->
        <div class="section">
          <h3 class="section-title">Podstawowe informacje</h3>

          <v-text-field
            v-model="formData.name"
            label="Nazwa bazy danych"
            :rules="[rules.required]"
            variant="outlined"
            prepend-inner-icon="mdi-database"
            required
          />

          <v-textarea
            v-model="formData.description"
            label="Opis (opcjonalny)"
            variant="outlined"
            prepend-inner-icon="mdi-text"
            rows="3"
            auto-grow
            counter="500"
          />
        </div>

        <!-- Tagi -->
        <div class="section">
          <h3 class="section-title">Tagi</h3>
          <v-combobox
            v-model="formData.tags"
            label="Dodaj tagi"
            variant="outlined"
            prepend-inner-icon="mdi-tag-multiple"
            multiple
            chips
            closable-chips
            hint="Naciśnij Enter, aby dodać nowy tag"
            persistent-hint
          >
            <template v-slot:chip="{ props, item }">
              <v-chip
                v-bind="props"
                :text="item"
                size="small"
                color="primary"
                variant="elevated"
              />
            </template>
          </v-combobox>
        </div>

        <!-- Ustawienia prywatności -->
        <div class="section">
          <h3 class="section-title">Ustawienia prywatności</h3>

          <v-switch
            v-model="formData.gdprCompliant"
            label="Zgodność z RODO"
            color="primary"
            inset
            hide-details
          />

          <v-switch
            v-model="formData.allowExport"
            label="Zezwól na eksport danych"
            color="primary"
            inset
            hide-details
          />
        </div>
      </v-form>
    </template>

    <template #actions>
      <v-spacer />
      <v-btn variant="text" @click="close">Anuluj</v-btn>
      <v-btn
        color="primary"
        :loading="saving"
        :disabled="!valid"
        @click="save"
      >
        {{ isEditing ? 'Zapisz zmiany' : 'Utwórz bazę' }}
      </v-btn>
    </template>
  </GeneralDialog>
</template>

<script setup>
import { ref, computed, watch, defineProps, defineEmits } from 'vue'
import GeneralDialog from '../../components/GeneralDialog.vue'

const props = defineProps({
  modelValue: Boolean,
  database: Object
})

const emit = defineEmits(['update:modelValue', 'save', 'close'])

const valid = ref(false)
const saving = ref(false)
const form = ref(null)

const formData = ref({
  name: '',
  description: '',
  tags: [],
  gdprCompliant: true,
  allowExport: true,
  autoCleanup: false,
  notifications: {
    newContacts: true,
    bounces: true,
    unsubscribes: true
  },
  customFieldsTemplate: []
})

const rules = {
  required: value => !!value || 'To pole jest wymagane'
}

const isEditing = computed(() => !!props.database)

watch(() => props.database, (newDatabase) => {
  if (newDatabase) {
    formData.value = {
      name: newDatabase.name || '',
      description: newDatabase.description || '',
      tags: [...(newDatabase.tags || [])],
      gdprCompliant: newDatabase.rodo_flag !== false,
      allowExport: newDatabase.export_enabled !== false,
      autoCleanup: newDatabase.autoCleanup || false,
      notifications: {
        newContacts: newDatabase.notifications?.newContacts !== false,
        bounces: newDatabase.notifications?.bounces !== false,
        unsubscribes: newDatabase.notifications?.unsubscribes !== false
      },
      customFieldsTemplate: [...(newDatabase.customFieldsTemplate || [])]
    }
  } else {
    resetForm()
  }
}, { immediate: true })

function resetForm() {
  formData.value = {
    name: '',
    description: '',
    tags: [],
    gdprCompliant: true,
    allowExport: true,
    autoCleanup: false,
    notifications: {
      newContacts: true,
      bounces: true,
      unsubscribes: true
    },
    customFieldsTemplate: []
  }
}

async function save() {
  if (!valid.value) return

  saving.value = true
  try {
    await form.value.validate()
    emit('save', { ...formData.value })
  } catch (error) {
    console.error('Błąd podczas zapisywania:', error)
  } finally {
    saving.value = false
  }
}

function close() {
  emit('close')
  emit('update:modelValue', false)
}
</script>

<style scoped>
.section {
  margin-bottom: 32px;
}

.section-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.section-title::before {
  content: '';
  width: 4px;
  height: 20px;
  background: linear-gradient(135deg, #515bad 0%, #9395fa 100%);
  border-radius: 2px;
}

.v-switch {
  margin-bottom: 16px;
}
</style>
