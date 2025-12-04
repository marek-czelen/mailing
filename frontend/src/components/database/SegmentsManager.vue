<template>
  <div class="segments-manager">
    <!-- Header -->
    <div class="segments-header">
      <div class="header-left">
        <h3>{{ t('segments.headerTitle') }}</h3>
        <p>{{ t('segments.headerSubtitle') }}</p>
      </div>
      <v-btn color="primary" @click="openCreateSegment">
        <v-icon left>mdi-plus</v-icon>
        {{ t('segments.newSegment') }}
      </v-btn>
    </div>

    <!-- Segments List -->
    <div class="segments-grid">
      <v-card
        v-for="segment in segments"
        :key="segment.id"
        class="segment-card"
        @click="selectSegment(segment)"
      >
        <v-card-text>
          <div class="segment-header">
            <div class="segment-icon">
              <v-icon :color="segment.color || 'primary'">{{ segment.icon || 'mdi-filter' }}</v-icon>
            </div>
            <div class="segment-actions">
              <v-menu>
                <template v-slot:activator="{ props }">
                  <v-btn
                    icon
                    size="small"
                    variant="text"
                    v-bind="props"
                    @click.stop
                  >
                    <v-icon>mdi-dots-vertical</v-icon>
                  </v-btn>
                </template>
                <v-list>
                  <v-list-item @click="editSegment(segment)">
                    <v-list-item-title>
                      <v-icon left size="16">mdi-pencil</v-icon>
                      {{ t('segments.actions.edit') }}
                    </v-list-item-title>
                  </v-list-item>
                  <v-list-item @click="duplicateSegment(segment)">
                    <v-list-item-title>
                      <v-icon left size="16">mdi-content-copy</v-icon>
                      {{ t('segments.actions.duplicate') }}
                    </v-list-item-title>
                  </v-list-item>
                  <v-list-item @click="exportSegment(segment)">
                    <v-list-item-title>
                      <v-icon left size="16">mdi-download</v-icon>
                      {{ t('segments.actions.export') }}
                    </v-list-item-title>
                  </v-list-item>
                  <v-divider />
                  <v-list-item @click="deleteSegment(segment)" class="delete-item">
                    <v-list-item-title>
                      <v-icon left size="16">mdi-delete</v-icon>
                      {{ t('segments.actions.delete') }}
                    </v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-menu>
            </div>
          </div>

          <h4 class="segment-name">{{ segment.name }}</h4>
          <p class="segment-description">{{ segment.description }}</p>

              <div class="segment-stats">
            <div class="stat">
              <v-icon size="16" color="grey">mdi-account-group</v-icon>
              <span>{{ t('segments.contactsCount', { count: segment.count || 0 }) }}</span>
            </div>
            <div class="stat">
              <v-icon size="16" color="grey">mdi-calendar</v-icon>
              <span>{{ formatDate(segment.updatedAt) }}</span>
            </div>
          </div>

          <div class="segment-rules" v-if="segment.rules?.length">
            <v-chip
              v-for="rule in segment.rules.slice(0, 2)"
              :key="rule.id"
              size="small"
              variant="outlined"
              class="rule-chip"
            >
              {{ formatRule(rule) }}
            </v-chip>
            <span v-if="segment.rules.length > 2" class="more-rules">
              +{{ segment.rules.length - 2 }} {{ t('segments.more') }}
            </span>
          </div>
        </v-card-text>
      </v-card>

      <!-- Empty State -->
      <v-card v-if="segments.length === 0" class="empty-segment-card">
          <v-card-text class="text-center">
          <v-icon size="48" color="grey-lighten-2">mdi-filter-outline</v-icon>
          <h3>{{ t('segments.emptyTitle') }}</h3>
          <p>{{ t('segments.emptyDescription') }}</p>
          <v-btn color="primary" @click="openCreateSegment">
            <v-icon left>mdi-plus</v-icon>
            {{ t('segments.createSegment') }}
          </v-btn>
        </v-card-text>
      </v-card>
    </div>

    <!-- Segment Builder Dialog -->
    <v-dialog v-model="showSegmentDialog" max-width="800px" persistent>
      <v-card class="segment-dialog">
          <v-card-title class="dialog-header">
          <h2>{{ isEditing ? t('segments.editTitle') : t('segments.newTitle') }}</h2>
          <v-btn icon variant="text" @click="closeSegmentDialog">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-card-text class="dialog-content">
          <v-form ref="segmentForm" v-model="segmentFormValid">
            <!-- Basic Info -->
            <div class="form-section">
              <h3>{{ t('segments.basicInfo') }}</h3>
              <v-text-field
                v-model="segmentData.name"
                :label="t('segments.name')"
                :rules="[rules.required]"
                variant="outlined"
                required
              />
              <v-textarea
                v-model="segmentData.description"
                :label="t('segments.description')"
                variant="outlined"
                rows="2"
              />
              <div class="icon-color-row">
                  <v-select
                  v-model="segmentData.icon"
                  :items="iconOptions"
                  :label="t('segments.icon')"
                  variant="outlined"
                >
                  <template v-slot:item="{ props, item }">
                    <v-list-item v-bind="props">
                      <template v-slot:prepend>
                        <v-icon>{{ item.value }}</v-icon>
                      </template>
                    </v-list-item>
                  </template>
                  <template v-slot:selection="{ item }">
                    <v-icon class="mr-2">{{ item.value }}</v-icon>
                    {{ item.title }}
                  </template>
                </v-select>
                <v-select
                  v-model="segmentData.color"
                  :items="colorOptions"
                  :label="t('segments.color')"
                  variant="outlined"
                >
                  <template v-slot:item="{ props, item }">
                    <v-list-item v-bind="props">
                      <template v-slot:prepend>
                        <div class="color-dot" :style="{ backgroundColor: item.value }"></div>
                      </template>
                    </v-list-item>
                  </template>
                  <template v-slot:selection="{ item }">
                    <div class="color-dot mr-2" :style="{ backgroundColor: item.value }"></div>
                    {{ item.title }}
                  </template>
                </v-select>
              </div>
            </div>

            <!-- Segment Rules -->
            <div class="form-section">
              <div class="section-header">
                <h3>{{ t('segments.rulesTitle') }}</h3>
                <v-btn size="small" variant="outlined" @click="addRule">
                  <v-icon left>mdi-plus</v-icon>
                  {{ t('segments.addRule') }}
                </v-btn>
              </div>

              <div v-if="segmentData.rules.length === 0" class="no-rules">
                <p>{{ t('segments.noRules') }}</p>
              </div>

              <div v-else class="rules-builder">
                <div
                  v-for="(rule, index) in segmentData.rules"
                  :key="rule.id"
                  class="rule-row"
                >
                  <div v-if="index > 0" class="rule-operator">
                    <v-select
                      v-model="rule.operator"
                      :items="operatorOptions"
                      variant="outlined"
                      density="comfortable"
                      hide-details
                    />
                  </div>

                  <div class="rule-content">
                    <v-select
                      v-model="rule.field"
                      :items="fieldOptions"
                      :label="t('segments.fieldLabel')"
                      variant="outlined"
                      density="comfortable"
                    />
                    <v-select
                      v-model="rule.condition"
                      :items="getConditionOptions(rule.field)"
                      :label="t('segments.conditionLabel')"
                      variant="outlined"
                      density="comfortable"
                    />
                    <v-text-field
                      v-model="rule.value"
                      :label="t('segments.valueLabel')"
                      variant="outlined"
                      density="comfortable"
                    />
                    <v-btn
                      icon
                      size="small"
                      variant="text"
                      color="error"
                      @click="removeRule(index)"
                    >
                      <v-icon>mdi-delete</v-icon>
                    </v-btn>
                  </div>
                </div>
              </div>
            </div>

            <!-- Preview -->
            <div class="form-section">
              <h3>{{ t('segments.previewTitle') }}</h3>
              <div class="preview-card">
                <div class="preview-stats">
                  <v-icon>mdi-account-group</v-icon>
                  <span>{{ t('segments.estimatedContacts', { count: estimatedCount }) }}</span>
                </div>
                <v-btn variant="outlined" size="small" @click="previewSegment">
                  <v-icon left>mdi-eye</v-icon>
                  {{ t('segments.previewContacts') }}
                </v-btn>
              </div>
            </div>
          </v-form>
        </v-card-text>

        <v-card-actions class="dialog-actions">
          <v-spacer />
          <v-btn variant="text" @click="closeSegmentDialog">
            {{ t('common.cancel') }}
          </v-btn>
          <v-btn
            color="primary"
            :loading="saving"
            :disabled="!segmentFormValid"
            @click="saveSegment"
          >
            {{ isEditing ? t('common.save') : t('segments.createSegment') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed, defineProps, defineEmits } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  database: Object,
  segments: Array
})

const emit = defineEmits(['create-segment', 'edit-segment'])

const { t, locale } = useI18n()

// Reactive data
const showSegmentDialog = ref(false)
const segmentFormValid = ref(false)
const saving = ref(false)
const editingSegment = ref(null)
const estimatedCount = ref(0)

// Segment form data
const segmentData = ref({
  name: '',
  description: '',
  icon: 'mdi-filter',
  color: 'primary',
  rules: []
})

// Options
const iconOptions = [
  { title: t('segments.iconOptions.filter'), value: 'mdi-filter' },
  { title: t('segments.iconOptions.star'), value: 'mdi-star' },
  { title: t('segments.iconOptions.heart'), value: 'mdi-heart' },
  { title: t('segments.iconOptions.shield'), value: 'mdi-shield' },
  { title: t('segments.iconOptions.crown'), value: 'mdi-crown' },
  { title: t('segments.iconOptions.target'), value: 'mdi-target' },
  { title: t('segments.iconOptions.flash'), value: 'mdi-lightning-bolt' },
  { title: t('segments.iconOptions.diamond'), value: 'mdi-diamond' }
]

const colorOptions = [
  { title: t('segments.colorOptions.blue'), value: 'primary' },
  { title: t('segments.colorOptions.green'), value: 'success' },
  { title: t('segments.colorOptions.orange'), value: 'warning' },
  { title: t('segments.colorOptions.red'), value: 'error' },
  { title: t('segments.colorOptions.purple'), value: 'purple' },
  { title: t('segments.colorOptions.pink'), value: 'pink' },
  { title: t('segments.colorOptions.cyan'), value: 'cyan' },
  { title: t('segments.colorOptions.grey'), value: 'grey' }
]

const fieldOptions = [
  { title: t('segments.fieldOptions.email'), value: 'email' },
  { title: t('segments.fieldOptions.firstName'), value: 'firstName' },
  { title: t('segments.fieldOptions.lastName'), value: 'lastName' },
  { title: t('segments.fieldOptions.phone'), value: 'phone' },
  { title: t('segments.fieldOptions.status'), value: 'status' },
  { title: t('segments.fieldOptions.createdAt'), value: 'createdAt' },
  { title: t('segments.fieldOptions.lastActivity'), value: 'lastActivity' },
  { title: t('segments.fieldOptions.tags'), value: 'tags' },
  { title: t('segments.fieldOptions.city'), value: 'city' },
  { title: t('segments.fieldOptions.country'), value: 'country' }
]

const operatorOptions = [
  { title: t('segments.operator.and'), value: 'AND' },
  { title: t('segments.operator.or'), value: 'OR' }
]

const rules = {
  required: value => !!value || t('validation.required')
}

// Computed
const isEditing = computed(() => !!editingSegment.value)

// Methods
function openCreateSegment() {
  editingSegment.value = null
  resetSegmentForm()
  showSegmentDialog.value = true
}

function editSegment(segment) {
  editingSegment.value = segment
  segmentData.value = {
    name: segment.name,
    description: segment.description || '',
    icon: segment.icon || 'mdi-filter',
    color: segment.color || 'primary',
    rules: [...(segment.rules || [])]
  }
  showSegmentDialog.value = true
}

function closeSegmentDialog() {
  showSegmentDialog.value = false
  editingSegment.value = null
  resetSegmentForm()
}

function resetSegmentForm() {
  segmentData.value = {
    name: '',
    description: '',
    icon: 'mdi-filter',
    color: 'primary',
    rules: []
  }
}

function addRule() {
  segmentData.value.rules.push({
    id: Date.now(),
    field: 'email',
    condition: 'contains',
    value: '',
    operator: segmentData.value.rules.length > 0 ? 'AND' : null
  })
}

function removeRule(index) {
  segmentData.value.rules.splice(index, 1)
}

function getConditionOptions(field) {
  const baseConditions = [
    { title: t('segments.conditions.contains'), value: 'contains' },
    { title: t('segments.conditions.not_contains'), value: 'not_contains' },
    { title: t('segments.conditions.equals'), value: 'equals' },
    { title: t('segments.conditions.not_equals'), value: 'not_equals' }
  ]

  if (field === 'createdAt' || field === 'lastActivity') {
    return [
      { title: t('segments.conditions.after'), value: 'after' },
      { title: t('segments.conditions.before'), value: 'before' },
      { title: t('segments.conditions.last_days'), value: 'last_days' }
    ]
  }

  if (field === 'status') {
    return [
      { title: t('segments.conditions.equals'), value: 'equals' },
      { title: t('segments.conditions.not_equals'), value: 'not_equals' }
    ]
  }

  return baseConditions
}

function formatRule(rule) {
  return `${rule.field} ${rule.condition} ${rule.value}`
}

function formatDate(date) {
  if (!date) return '-'
  const localeTag = locale.value === 'pl' ? 'pl-PL' : 'en-US'
  return new Date(date).toLocaleDateString(localeTag)
}

function selectSegment(segment) {
  console.log('Wybrano segment:', segment)
}

function duplicateSegment(segment) {
  const duplicate = {
    ...segment,
    id: Date.now(),
    name: `${segment.name} (${t('segments.copySuffix')})`,
    count: 0
  }
  emit('create-segment', duplicate)
}

function deleteSegment(segment) {
  if (confirm(t('segments.deleteConfirm', { name: segment.name }))) {
    emit('delete-segment', segment)
  }
}

function exportSegment(segment) {
  console.log('Eksportowanie segmentu:', segment)
}

function previewSegment() {
  // Calculate estimated count based on rules
  estimatedCount.value = Math.floor(Math.random() * 500) + 50
}

function saveSegment() {
  if (!segmentFormValid.value) return
  
  saving.value = true
  
  setTimeout(() => {
    const segmentToSave = {
      ...segmentData.value,
      id: editingSegment.value?.id || Date.now(),
      count: estimatedCount.value,
      updatedAt: new Date()
    }
    
    emit('create-segment', segmentToSave)
    closeSegmentDialog()
    saving.value = false
  }, 1000)
}
</script>

<style scoped>
.segments-manager {
  width: 100%;
}

.segments-header {
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

.segments-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

.segment-card,
.empty-segment-card {
  border-radius: 12px !important;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08) !important;
  border: 1px solid rgba(255, 255, 255, 0.2) !important;
  background: rgba(255, 255, 255, 0.9) !important;
  backdrop-filter: blur(10px) !important;
  cursor: pointer;
  transition: all 0.3s ease;
}

.segment-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12) !important;
}

.segment-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.segment-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: rgba(81, 91, 173, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
}

.segment-name {
  font-weight: 600;
  margin: 0 0 8px 0;
  font-size: 1.1rem;
}

.segment-description {
  color: #666;
  font-size: 0.9rem;
  margin: 0 0 16px 0;
  line-height: 1.4;
}

.segment-stats {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
}

.stat {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.85rem;
  color: #666;
}

.segment-rules {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  align-items: center;
}

.rule-chip {
  font-size: 0.75rem !important;
  height: 24px !important;
}

.more-rules {
  font-size: 0.75rem;
  color: #666;
}

/* Dialog Styles */
.segment-dialog {
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

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.icon-color-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.color-dot {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: inline-block;
}

.rules-builder {
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  padding: 16px;
  background: #fafafa;
}

.rule-row {
  margin-bottom: 16px;
}

.rule-operator {
  text-align: center;
  margin-bottom: 8px;
}

.rule-content {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr auto;
  gap: 12px;
  align-items: start;
}

.no-rules {
  text-align: center;
  padding: 40px;
  color: #666;
}

.preview-card {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.preview-stats {
  display: flex;
  align-items: center;
  gap: 8px;
}

.dialog-actions {
  padding: 16px 24px 24px 24px !important;
  background: #f8f9fa;
}

.delete-item {
  color: #e53e3e !important;
}

@media (max-width: 768px) {
  .segments-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  
  .segments-grid {
    grid-template-columns: 1fr;
  }
  
  .rule-content {
    grid-template-columns: 1fr;
  }
}
</style>