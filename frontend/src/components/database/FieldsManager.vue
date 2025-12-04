<template>
  <div class="fields-manager">
    <div class="fields-header">
      <div class="header-left">
        <h3>{{ t('fields.title') }}</h3>
        <p>{{ t('fields.subtitle') }}</p>
      </div>
      <v-btn color="primary" @click="openAddField">
        <v-icon left>mdi-plus</v-icon>
        {{ t('fields.add') }}
      </v-btn>
    </div>

    <div v-if="fields.length === 0" class="empty-state">
      <v-icon size="64" color="grey-lighten-2">mdi-format-list-bulleted-square</v-icon>
      <h3>{{ t('fields.emptyTitle') }}</h3>
      <p>{{ t('fields.emptyText') }}</p>
      <v-btn color="primary" @click="openAddField">
        <v-icon left>mdi-plus</v-icon>
        {{ t('fields.addFirst') }}
      </v-btn>
    </div>

    <div v-else class="fields-list">
      <v-card
        v-for="field in fields"
        :key="field.id"
        class="field-card"
      >
        <v-card-text>
          <div class="field-header">
            <div class="field-info">
              <div class="field-icon">
                <v-icon :color="getFieldColor(field.type)">
                  {{ getFieldIcon(field.type) }}
                </v-icon>
              </div>
              <div class="field-details">
                <h4 class="field-name">
                  {{ field.name }}
                  <v-chip v-if="field.required" size="small" color="error" variant="outlined">
                    {{ t('fields.required') }}
                  </v-chip>
                </h4>
                <p class="field-type">{{ getFieldTypeLabel(field.type) }}</p>
                <p v-if="field.description" class="field-description">
                  {{ field.description }}
                </p>
              </div>
            </div>
            <div class="field-actions">
              <v-btn
                icon
                size="small"
                variant="text"
                @click="editField(field)"
              >
                <v-icon>mdi-pencil</v-icon>
              </v-btn>
              <v-menu>
                <template v-slot:activator="{ props }">
                  <v-btn
                    icon
                    size="small"
                    variant="text"
                    v-bind="props"
                  >
                    <v-icon>mdi-dots-vertical</v-icon>
                  </v-btn>
                </template>
                <v-list>
                  <v-list-item @click="duplicateField(field)">
                    <v-list-item-title>
                      <v-icon left size="16">mdi-content-copy</v-icon>
                      {{ t('fields.duplicate') }}
                    </v-list-item-title>
                  </v-list-item>
                  <v-list-item @click="toggleRequired(field)">
                    <v-list-item-title>
                      <v-icon left size="16">
                        {{ field.required ? 'mdi-checkbox-marked' : 'mdi-checkbox-blank-outline' }}
                      </v-icon>
                      {{ field.required ? t('fields.notRequired') : t('fields.required') }}
                    </v-list-item-title>
                  </v-list-item>
                  <v-divider />
                  <v-list-item @click="deleteField(field)" class="delete-item">
                    <v-list-item-title>
                      <v-icon left size="16">mdi-delete</v-icon>
                      {{ t('fields.delete') }}
                    </v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-menu>
            </div>
          </div>

          <div v-if="field.options?.length" class="field-options">
            <h5>{{ t('fields.options') }}</h5>
            <div class="options-list">
              <v-chip
                v-for="option in field.options"
                :key="option"
                size="small"
                variant="outlined"
                class="mr-1 mb-1"
              >
                {{ option }}
              </v-chip>
            </div>
          </div>

          <div class="field-meta">
            <span class="usage-count">
              <v-icon size="16">mdi-chart-bar</v-icon>
              {{ t('fields.usedInContacts', { count: field.usageCount || 0 }) }}
            </span>
            <span class="created-date">
              <v-icon size="16">mdi-calendar</v-icon>
              {{ formatDate(field.createdAt) }}
            </span>
          </div>
        </v-card-text>
      </v-card>
    </div>

    <!-- Field Dialog -->
    <v-dialog v-model="showFieldDialog" max-width="600px" persistent>
      <v-card class="field-dialog">
        <v-card-title class="dialog-header">
          <h2>{{ isEditing ? t('fields.editTitle') : t('fields.newTitle') }}</h2>
          <v-btn icon variant="text" @click="closeFieldDialog">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-card-text class="dialog-content">
          <v-form ref="fieldForm" v-model="fieldFormValid">
            <div class="form-section">
              <v-text-field
                v-model="fieldData.name"
                :label="t('fields.fieldName')"
                :rules="[rules.required]"
                variant="outlined"
                required
              />

              <v-textarea
                v-model="fieldData.description"
                :label="t('fields.fieldDescription')"
                variant="outlined"
                rows="2"
              />

              <v-select
                v-model="fieldData.type"
                :items="fieldTypeOptions"
                :label="t('fields.fieldType')"
                :rules="[rules.required]"
                variant="outlined"
                required
              >
                <template v-slot:item="{ props, item }">
                  <v-list-item v-bind="props">
                    <template v-slot:prepend>
                      <v-icon>{{ getFieldIcon(item.value) }}</v-icon>
                    </template>
                  </v-list-item>
                </template>
                <template v-slot:selection="{ item }">
                  <v-icon class="mr-2">{{ getFieldIcon(item.value) }}</v-icon>
                  {{ item.title }}
                </template>
              </v-select>

              <div class="field-settings">
                <v-switch
                  v-model="fieldData.required"
                  :label="t('fields.required')"
                  color="primary"
                  inset
                />

                <v-switch
                  v-model="fieldData.searchable"
                  :label="t('fields.searchable')"
                  color="primary"
                  inset
                />
              </div>
            </div>

            <!-- Options for select type -->
            <div v-if="fieldData.type === 'select'" class="form-section">
              <h3>{{ t('fields.selectOptionsTitle') }}</h3>
              <div class="options-editor">
                <div
                  v-for="(option, index) in fieldData.options"
                  :key="index"
                  class="option-item"
                >
                  <v-text-field
                    v-model="fieldData.options[index]"
                    :label="t('fields.option', { index: index + 1 })"
                    variant="outlined"
                    density="comfortable"
                  />
                  <v-btn
                    icon
                    size="small"
                    variant="text"
                    color="error"
                    @click="removeOption(index)"
                  >
                    <v-icon>mdi-delete</v-icon>
                  </v-btn>
                </div>
                <v-btn
                  variant="outlined"
                  @click="addOption"
                  prepend-icon="mdi-plus"
                  block
                >
                  {{ t('fields.addOption') }}
                </v-btn>
              </div>
            </div>

            <!-- Validation for number/text fields -->
            <div v-if="['text', 'number'].includes(fieldData.type)" class="form-section">
              <h3>{{ t('fields.validation') }}</h3>
              <div class="validation-settings">
                <v-text-field
                  v-if="fieldData.type === 'text'"
                  v-model.number="fieldData.validation.minLength"
                  :label="t('fields.minLength')"
                  type="number"
                  variant="outlined"
                  density="comfortable"
                />
                <v-text-field
                  v-if="fieldData.type === 'text'"
                  v-model.number="fieldData.validation.maxLength"
                  :label="t('fields.maxLength')"
                  type="number"
                  variant="outlined"
                  density="comfortable"
                />
                <v-text-field
                  v-if="fieldData.type === 'number'"
                  v-model.number="fieldData.validation.min"
                  :label="t('fields.minValue')"
                  type="number"
                  variant="outlined"
                  density="comfortable"
                />
                <v-text-field
                  v-if="fieldData.type === 'number'"
                  v-model.number="fieldData.validation.max"
                  :label="t('fields.maxValue')"
                  type="number"
                  variant="outlined"
                  density="comfortable"
                />
              </div>
            </div>
          </v-form>
        </v-card-text>

        <v-card-actions class="dialog-actions">
          <v-spacer />
          <v-btn variant="text" @click="closeFieldDialog">
            {{ t('common.cancel') }}
          </v-btn>
          <v-btn
            color="primary"
            :loading="saving"
            :disabled="!fieldFormValid"
            @click="saveField"
          >
            {{ isEditing ? t('common.saveChanges') : t('fields.create') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed, defineProps, defineEmits } from 'vue'
import { useI18n } from 'vue-i18n'

const { t, locale } = useI18n()

const props = defineProps({
  database: Object,
  fields: Array
})

const emit = defineEmits(['add-field', 'edit-field'])

// Reactive data
const showFieldDialog = ref(false)
const fieldFormValid = ref(false)
const saving = ref(false)
const editingField = ref(null)

// Field form data
const fieldData = ref({
  name: '',
  description: '',
  type: 'text',
  required: false,
  searchable: true,
  options: [],
  validation: {
    minLength: null,
    maxLength: null,
    min: null,
    max: null
  }
})

// Field type options
const fieldTypeOptions = [
  { title: t('fields.typeOptions.text'), value: 'text' },
  { title: t('fields.typeOptions.number'), value: 'number' },
  { title: t('fields.typeOptions.email'), value: 'email' },
  { title: t('fields.typeOptions.date'), value: 'date' },
  { title: t('fields.typeOptions.boolean'), value: 'boolean' },
  { title: t('fields.typeOptions.select'), value: 'select' },
  { title: t('fields.typeOptions.textarea'), value: 'textarea' },
  { title: t('fields.typeOptions.url'), value: 'url' },
  { title: t('fields.typeOptions.phone'), value: 'phone' }
]

const rules = {
  required: value => !!value || t('validation.required')
}

// Computed
const isEditing = computed(() => !!editingField.value)

// Methods
function getFieldIcon(type) {
  const icons = {
    text: 'mdi-format-text',
    number: 'mdi-numeric',
    email: 'mdi-email',
    date: 'mdi-calendar',
    boolean: 'mdi-checkbox-marked',
    select: 'mdi-format-list-bulleted',
    textarea: 'mdi-text',
    url: 'mdi-web',
    phone: 'mdi-phone'
  }
  return icons[type] || 'mdi-help'
}

function getFieldColor(type) {
  const colors = {
    text: 'blue',
    number: 'green',
    email: 'orange',
    date: 'purple',
    boolean: 'teal',
    select: 'indigo',
    textarea: 'blue-grey',
    url: 'cyan',
    phone: 'pink'
  }
  return colors[type] || 'grey'
}

function getFieldTypeLabel(type) {
  const option = fieldTypeOptions.find(opt => opt.value === type)
  return option ? option.title : type
}

function formatDate(date) {
  if (!date) return '-'
  const tag = locale.value === 'pl' ? 'pl-PL' : 'en-US'
  try {
    return new Date(date).toLocaleDateString(tag)
  } catch (e) {
    return new Date(date).toLocaleDateString()
  }
}

function openAddField() {
  editingField.value = null
  resetFieldForm()
  showFieldDialog.value = true
}

function editField(field) {
  editingField.value = field
  fieldData.value = {
    name: field.name,
    description: field.description || '',
    type: field.type,
    required: field.required || false,
    searchable: field.searchable !== false,
    options: [...(field.options || [])],
    validation: { ...(field.validation || {}) }
  }
  showFieldDialog.value = true
}

function closeFieldDialog() {
  showFieldDialog.value = false
  editingField.value = null
  resetFieldForm()
}

function resetFieldForm() {
  fieldData.value = {
    name: '',
    description: '',
    type: 'text',
    required: false,
    searchable: true,
    options: [],
    validation: {
      minLength: null,
      maxLength: null,
      min: null,
      max: null
    }
  }
}

function addOption() {
  fieldData.value.options.push('')
}

function removeOption(index) {
  fieldData.value.options.splice(index, 1)
}

function duplicateField(field) {
  const duplicate = {
    ...field,
    id: Date.now(),
    name: `${field.name}${t('fields.copySuffix')}`,
    usageCount: 0
  }
  emit('add-field', duplicate)
}

function toggleRequired(field) {
  emit('edit-field', { ...field, required: !field.required })
}

function deleteField(field) {
  if (confirm(t('fields.deleteConfirm', { name: field.name }))) {
    emit('delete-field', field)
  }
}

function saveField() {
  if (!fieldFormValid.value) return
  
  saving.value = true
  
  setTimeout(() => {
    const fieldToSave = {
      ...fieldData.value,
      id: editingField.value?.id || Date.now(),
      createdAt: editingField.value?.createdAt || new Date(),
      usageCount: editingField.value?.usageCount || 0
    }
    
    emit('add-field', fieldToSave)
    closeFieldDialog()
    saving.value = false
  }, 500)
}
</script>

<style scoped>
.fields-manager {
  width: 100%;
}

.fields-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
}

.header-left h3 {
  margin: 0 0 8px 0;
  font-size: 1.3rem;
  font-weight: 600;
}

.header-left p {
  margin: 0;
  color: #666;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 16px;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.empty-state h3 {
  font-size: 1.5rem;
  margin: 16px 0 8px 0;
  color: #333;
}

.empty-state p {
  color: #666;
  margin-bottom: 24px;
}

.fields-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 16px;
}

.field-card {
  border-radius: 12px !important;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08) !important;
  border: 1px solid rgba(255, 255, 255, 0.2) !important;
  background: rgba(255, 255, 255, 0.9) !important;
  backdrop-filter: blur(10px) !important;
  transition: all 0.3s ease;
}

.field-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12) !important;
}

.field-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.field-info {
  display: flex;
  flex: 1;
}

.field-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: rgba(81, 91, 173, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
}

.field-details {
  flex: 1;
}

.field-name {
  font-weight: 600;
  margin: 0 0 4px 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.field-type {
  color: #666;
  font-size: 0.9rem;
  margin: 0 0 4px 0;
}

.field-description {
  color: #666;
  font-size: 0.85rem;
  margin: 0;
  line-height: 1.4;
}

.field-actions {
  display: flex;
  gap: 4px;
}

.field-options {
  margin-bottom: 16px;
}

.field-options h5 {
  margin: 0 0 8px 0;
  font-weight: 600;
  color: #333;
}

.options-list {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.field-meta {
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
  color: #666;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
}

.usage-count,
.created-date {
  display: flex;
  align-items: center;
  gap: 4px;
}

/* Dialog Styles */
.field-dialog {
  border-radius: 16px !important;
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.15) !important;
}

.dialog-header {
  background: linear-gradient(135deg, #202950 0%, #515bad 100%) !important;
  color: #eadcf6 !important;
  padding: 24px !important;
  display: flex !important;
  justify-content: space-between !important;
  align-items: center !important;
}

.dialog-header h2 {
  margin: 0;
  font-weight: 600;
}

.dialog-content {
  padding: 32px !important;
  max-height: 70vh;
  overflow-y: auto;
}

.form-section {
  margin-bottom: 32px;
}

.form-section h3 {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 16px;
  color: #333;
}

.field-settings {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.options-editor {
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  padding: 16px;
  background: #fafafa;
}

.option-item {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  margin-bottom: 12px;
}

.option-item .v-text-field {
  flex: 1;
}

.validation-settings {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.dialog-actions {
  padding: 16px 24px 24px 24px !important;
  background: #f8f9fa;
}

.delete-item {
  color: #e53e3e !important;
}

@media (max-width: 768px) {
  .fields-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  
  .fields-list {
    grid-template-columns: 1fr;
  }
  
  .field-settings,
  .validation-settings {
    grid-template-columns: 1fr;
  }
}
</style>