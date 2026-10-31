<template>
  <div class="campaign-replies-container">
    <!-- Stats Summary -->
    <v-row class="mb-4">
      <v-col cols="12" md="3">
        <v-card class="stat-card">
          <v-card-text class="d-flex align-center">
            <v-icon size="40" color="primary" class="mr-3">mdi-email-multiple</v-icon>
            <div>
              <div class="text-h6">{{ stats.totalReplies || 0 }}</div>
              <div class="text-caption text-medium-emphasis">{{ t('campaigns.allReplies') }}</div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="3">
        <v-card class="stat-card">
          <v-card-text class="d-flex align-center">
            <v-icon size="40" color="success" class="mr-3">mdi-account-check</v-icon>
            <div>
              <div class="text-h6">{{ stats.identifiedReplies || 0 }}</div>
              <div class="text-caption text-medium-emphasis">{{ t('campaigns.identified') }}</div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="3">
        <v-card class="stat-card">
          <v-card-text class="d-flex align-center">
            <v-icon size="40" color="warning" class="mr-3">mdi-account-question</v-icon>
            <div>
              <div class="text-h6">{{ stats.unidentifiedReplies || 0 }}</div>
              <div class="text-caption text-medium-emphasis">{{ t('campaigns.unidentified') }}</div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="3">
        <v-card class="stat-card">
          <v-card-text class="d-flex align-center">
            <v-icon size="40" color="info" class="mr-3">mdi-percent</v-icon>
            <div>
              <div class="text-h6">{{ replyRate }}%</div>
              <div class="text-caption text-medium-emphasis">{{ t('campaigns.replyRate') }}</div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Filters -->
    <div class="filters-section mb-4">
      <v-text-field
        v-model="searchQuery"
        :placeholder="t('campaigns.searchInReplies')"
        prepend-inner-icon="mdi-magnify"
        variant="outlined"
        density="comfortable"
        hide-details
        style="max-width: 400px;"
        class="mr-2"
      />
      <v-select
        v-model="statusFilter"
        :items="statusOptions"
        :placeholder="t('campaigns.status')"
        variant="outlined"
        density="comfortable"
        hide-details
        style="max-width: 200px;"
      />
      <v-select
        v-model="handledFilter"
        :items="handledOptions"
        :label="t('campaigns.reply.handlingFilter')"
        variant="outlined"
        density="comfortable"
        hide-details
        style="max-width: 220px;"
      />
    </div>

    <!-- Replies Table -->
    <v-data-table-server
      :headers="headers"
      :items="replies"
      :items-length="totalReplies"
      :loading="loading"
      item-value="id"
      class="replies-table"
      @update:options="onUpdateOptions"
      @click:row="onReplyRowClick"
    >
      <!-- From Column -->
      <template v-slot:item.fromEmail="{ item }">
        <div class="from-cell">
          <div class="email">{{ item.fromEmail }}</div>
          <div class="contact-info" v-if="item.hasContact && item.mailAddress">
            <v-chip size="x-small" color="success" variant="tonal" class="mt-1">
              <v-icon size="12" class="mr-1">mdi-account-check</v-icon>
              {{ t('campaigns.identified') }}
            </v-chip>
          </div>
        </div>
      </template>

      <!-- Subject Column -->
      <template v-slot:item.subject="{ item }">
        <div class="subject-cell">
          <v-icon color="primary" size="16" class="mr-1">mdi-email</v-icon>
          {{ item.subject || t('campaigns.noSubject') }}
        </div>
      </template>

      <!-- Date Column -->
      <template v-slot:item.receivedAt="{ item }">
        <div class="date-cell">
          {{ formatDateTime(item.receivedAt) }}
        </div>
      </template>

      <template v-slot:item.isHandled="{ item }">
        <v-chip size="small" :color="item.isHandled ? 'success' : 'warning'" variant="tonal">
          {{ item.isHandled ? t('campaigns.reply.handled') : t('campaigns.reply.unhandled') }}
        </v-chip>
      </template>

      <!-- Miasto Column -->
      <template v-slot:item.miasto="{ item }">
        <span v-if="item.mailAddress">{{ item.mailAddress.miasto || t('campaigns.reply.identifiedContact') }}</span>
        <span v-else class="text-grey">-</span>
      </template>

      <!-- Rodzaj Column -->
      <template v-slot:item.rodzaj="{ item }">
        <span v-if="item.mailAddress">{{ item.mailAddress.rodzaj || t('campaigns.reply.identifiedContact') }}</span>
        <span v-else class="text-grey">-</span>
      </template>

      <!-- Actions Column -->
      <template v-slot:item.actions="{ item }">
        <div class="action-buttons">
          <v-btn
            icon
            size="small"
            variant="text"
            @click.stop="viewReply(item)"
          >
            <v-icon>mdi-eye</v-icon>
          </v-btn>
        </div>
      </template>

      <!-- No Data -->
      <template v-slot:no-data>
        <div class="no-data">
          <v-icon size="48" color="grey-lighten-2">mdi-email-off</v-icon>
          <p>{{ t('campaigns.reply.noData') }}</p>
        </div>
      </template>
    </v-data-table-server>

    <!-- Reply Details Dialog -->
     <GeneralDialog
      v-model="showReplyDialog"
      :persistent="false"
      :title="t('campaigns.reply.detailsTitle')"
    >
    <template #default>
      <v-card v-if="selectedReply">
     
         
          <div class="reply-details">
            <div class="detail-item" v-if="selectedReply.mailAddress">
              <span class="label">{{ t('campaigns.reply.contact') }}:</span>
              <div class="contact-details">
                <v-text-field
                  v-model="contactEmailDraft"
                  :label="t('campaigns.reply.email')"
                  type="email"
                  variant="outlined"
                  density="compact"
                  hide-details
                  class="contact-email-input"
                  :disabled="savingContact"
                />
                <v-btn
                  size="small"
                  variant="outlined"
                  prepend-icon="mdi-content-save-outline"
                  :loading="savingContact"
                  :disabled="savingContact || contactEmailDraft.trim() === selectedReply.mailAddress.email"
                  @click="saveContactEmail"
                >
                  {{ t('campaigns.reply.saveEmail') }}
                </v-btn>
                <div class="contact-status-row">
                  <v-chip size="small" :color="selectedReply.mailAddress.unsubscribed ? 'error' : selectedReply.mailAddress.active ? 'success' : 'warning'" variant="tonal">
                    {{ selectedReply.mailAddress.unsubscribed ? t('campaigns.reply.unsubscribed') : selectedReply.mailAddress.active ? t('campaigns.reply.active') : t('campaigns.reply.inactive') }}
                  </v-chip>
                  <v-btn
                    v-if="!selectedReply.mailAddress.unsubscribed"
                    size="small"
                    color="error"
                    variant="outlined"
                    prepend-icon="mdi-email-off-outline"
                    :loading="savingContact"
                    :disabled="savingContact"
                    @click="unsubscribeContact"
                  >
                    {{ t('campaigns.reply.unsubscribe') }}
                  </v-btn>
                </div>
                <div v-if="selectedReply.mailAddress.miasto">
                  <strong>{{ t('campaigns.reply.city') }}:</strong> {{ selectedReply.mailAddress.miasto }}
                </div>
                <div v-if="selectedReply.mailAddress.rodzaj">
                  <strong>{{ t('campaigns.reply.type') }}:</strong> {{ selectedReply.mailAddress.rodzaj }}
                </div>
              </div>
            </div>
            <v-alert v-if="contactActionMessage" :type="contactActionError ? 'error' : 'success'" density="compact" variant="tonal">
              {{ contactActionMessage }}
            </v-alert>
            <div class="detail-item" v-if="selectedReply.mailAddress">
              <span class="label">{{ t('campaigns.reply.historyTitle') }}:</span>
              <div class="contact-history">
                <v-progress-linear v-if="loadingHistory" indeterminate color="primary" />
                <div v-else-if="!contactHistory.length" class="text-medium-emphasis">
                  {{ t('campaigns.reply.historyEmpty') }}
                </div>
                <v-list v-else density="compact" class="history-list">
                  <v-list-item v-for="entry in contactHistory" :key="entry.id" class="history-item">
                    <v-list-item-title>
                      {{ t(`campaigns.reply.historyFields.${entry.fieldName}`, entry.fieldName) }}
                      <v-chip size="x-small" variant="tonal" class="ml-2">
                        {{ t(`campaigns.reply.historyActions.${entry.action}`, entry.action) }}
                      </v-chip>
                    </v-list-item-title>
                    <v-list-item-subtitle>
                      {{ entry.oldValue || '—' }} -> {{ entry.newValue || '—' }}
                      · {{ formatDateTime(entry.createdAt) }}
                      <span v-if="entry.changedBy"> · {{ entry.changedBy }}</span>
                    </v-list-item-subtitle>
                  </v-list-item>
                </v-list>
              </div>
            </div>
            <div class="detail-item">
              <span class="label">{{ t('campaigns.reply.receivedAt') }}:</span>
              <span class="value">{{ formatDateTime(selectedReply.receivedAt) }}</span>
            </div>
            <div class="detail-item">
              <span class="label">{{ t('campaigns.reply.subject') }}:</span>
              <span class="value">{{ selectedReply.subject || t('campaigns.noSubject') }}</span>
            </div>

            <div class="detail-item">
              <span class="label">{{ t('campaigns.reply.status') }}:</span>
              <v-chip 
                :color="selectedReply.wasUnread ? 'warning' : 'success'" 
                size="small"
              >
                {{ selectedReply.wasUnread ? t('campaigns.reply.unread') : t('campaigns.reply.read') }}
              </v-chip>
              <span v-if="selectedReply.readAt" class="ml-2 text-caption">
                ({{ t('campaigns.reply.readAt') }}: {{ formatDateTime(selectedReply.readAt) }})
              </span>
            </div>
            <div class="detail-item">
              <span class="label">{{ t('campaigns.reply.handlingStatus') }}:</span>
              <div class="handling-status-row">
                <v-chip size="small" :color="selectedReply.isHandled ? 'success' : 'warning'" variant="tonal">
                  {{ selectedReply.isHandled ? t('campaigns.reply.handled') : t('campaigns.reply.unhandled') }}
                </v-chip>
                <v-btn
                  v-if="!selectedReply.isHandled"
                  size="small"
                  color="success"
                  variant="outlined"
                  prepend-icon="mdi-check-circle-outline"
                  :loading="handlingReply"
                  :disabled="handlingReply"
                  @click="markHandled"
                >
                  {{ t('campaigns.reply.markHandled') }}
                </v-btn>
              </div>
            </div>
            <v-divider class="my-4" />
            <div class="reply-body">
              <h4 class="mb-2">{{ t('campaigns.reply.bodyTitle') }}</h4>
              <div class="body-content" v-if="selectedReply.bodyFullParsedHtml" v-html="selectedReply.bodyFullParsedHtml"></div>
              <div v-else class="no-content">{{ t('campaigns.reply.noBody') }}</div>
            </div>
          </div>
       

      </v-card>
    </template>
    <template #actions>
      <v-spacer />
      <v-btn variant="text" @click="showReplyDialog = false">
        {{ t('campaigns.close') }}
      </v-btn>
      </template>
    </GeneralDialog>    
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { Campaigns } from '../../services/campaigns'
import GeneralDialog from '../GeneralDialog.vue'

const { t } = useI18n()

const props = defineProps({
  campaign: {
    type: Object,
    required: true
  }
})

// Reactive data
const replies = ref([])
const totalReplies = ref(0)
const loading = ref(false)
const stats = ref({
  totalReplies: 0,
  identifiedReplies: 0,
  unidentifiedReplies: 0,
  replyRate: 0
})
const searchQuery = ref('')
const statusFilter = ref(null)
const handledFilter = ref(null)
const options = ref({ page: 1, itemsPerPage: 50, sortBy: [{ key: 'receivedAt', order: 'desc' }] })
const showReplyDialog = ref(false)
const selectedReply = ref(null)
const contactEmailDraft = ref('')
const contactHistory = ref([])
const loadingHistory = ref(false)
const savingContact = ref(false)
const handlingReply = ref(false)
const contactActionMessage = ref('')
const contactActionError = ref(false)
let searchDebounce = null
let fetchInProgress = false
let fetchPending = false

// Table headers
const headers = computed(() => ([
  { title: t('campaigns.reply.headers.from'), key: 'fromEmail', sortable: true },
  { title: t('campaigns.reply.headers.subject'), key: 'subject', sortable: true },
  { title: t('campaigns.reply.headers.receivedAt'), key: 'receivedAt', sortable: true },
  { title: t('campaigns.reply.headers.handling'), key: 'isHandled', sortable: false },
  { title: t('campaigns.reply.headers.city'), key: 'miasto', sortable: false },
  { title: t('campaigns.reply.headers.type'), key: 'rodzaj', sortable: false },
  { title: t('campaigns.reply.headers.actions'), key: 'actions', sortable: false, width: 120 }
]))

// Status options
const statusOptions = computed(() => ([
  { title: t('campaigns.reply.statusAll'), value: null },
  { title: t('campaigns.reply.statusIdentified'), value: true },
  { title: t('campaigns.reply.statusUnidentified'), value: false }
]))

const handledOptions = computed(() => ([
  { title: t('campaigns.reply.handlingAll'), value: null },
  { title: t('campaigns.reply.unhandled'), value: false },
  { title: t('campaigns.reply.handled'), value: true }
]))

// Computed
const replyRate = computed(() => {
  if (!stats.value.replyRate) return '0.0'
  return stats.value.replyRate.toFixed(1)
})

// Methods
async function fetchReplies() {
  if (!props.campaign?.id) return
  if (fetchInProgress) {
    fetchPending = true
    return
  }
  fetchInProgress = true
  
  try {
    loading.value = true
    const params = {
      page: options.value.page,
      limit: options.value.itemsPerPage || 50,
      search: searchQuery.value || '',
      handled: handledFilter.value
    }
    
    // Sortowanie
    const firstSort = (options.value.sortBy && options.value.sortBy[0]) || null
    if (firstSort && firstSort.key) {
      params.sortBy = firstSort.key
      params.sortOrder = firstSort.order || 'desc'
    }
    
    // Filtr hasContact (null = wszystkie, true = zidentyfikowane, false = niezidentyfikowane)
    if (statusFilter.value !== null) {
      params.hasContact = statusFilter.value
    }
    
    const data = await Campaigns.getCampaignReplies(props.campaign.id, params)
    replies.value = data.replies || []
    totalReplies.value = data.total || 0
    
    // Aktualizuj statystyki jeśli są w odpowiedzi
    if (data.summary) {
      stats.value = {
        totalReplies: data.summary.totalReplies || 0,
        identifiedReplies: data.summary.identifiedReplies || 0,
        unidentifiedReplies: data.summary.unidentifiedReplies || 0,
        replyRate: data.summary.replyRate || 0
      }
    }
  } catch (e) {
    console.error('Błąd pobierania odpowiedzi:', e)
    replies.value = []
    totalReplies.value = 0
  } finally {
    loading.value = false
    fetchInProgress = false
    if (fetchPending) {
      fetchPending = false
      fetchReplies()
    }
  }
}

async function fetchStats() {
  if (!props.campaign?.id) return
  
  try {
    const data = await Campaigns.getCampaignRepliesStats(props.campaign.id)
    stats.value = data
  } catch (e) {
    console.error('Błąd pobierania statystyk odpowiedzi:', e)
  }
}

function onUpdateOptions(newOptions) {
  const changed = newOptions.page !== options.value.page ||
                  newOptions.itemsPerPage !== options.value.itemsPerPage ||
                  JSON.stringify(newOptions.sortBy) !== JSON.stringify(options.value.sortBy)
  
  options.value = { ...options.value, ...newOptions }
  
  if (changed) {
    fetchReplies()
  }
}

function onReplyRowClick(_event, { item }) {
  viewReply(item)
}

async function viewReply(reply) {
  try {
    // Pobierz pełne szczegóły odpowiedzi
    const fullReply = await Campaigns.getReplyById(reply.id)
    selectedReply.value = fullReply
    contactEmailDraft.value = fullReply.mailAddress?.email || ''
    contactHistory.value = []
    contactActionMessage.value = ''
    showReplyDialog.value = true
    if (fullReply.mailAddress) await fetchContactHistory(fullReply.id)
  } catch (e) {
    console.error('Błąd pobierania szczegółów odpowiedzi:', e)
  }
}

async function fetchContactHistory(replyId) {
  loadingHistory.value = true
  try {
    contactHistory.value = await Campaigns.getReplyContactHistory(replyId)
  } catch (e) {
    contactHistory.value = []
    showContactActionError(e)
  } finally {
    loadingHistory.value = false
  }
}

async function saveContactEmail() {
  if (!selectedReply.value?.mailAddress || savingContact.value) return
  savingContact.value = true
  contactActionMessage.value = ''
  try {
    const result = await Campaigns.updateReplyContactEmail(selectedReply.value.id, contactEmailDraft.value)
    selectedReply.value.mailAddress.email = result.contact.email
    selectedReply.value.isHandled = result.isHandled
    syncHandledReplyInList(selectedReply.value.id)
    contactEmailDraft.value = result.contact.email
    contactActionError.value = false
    contactActionMessage.value = t('campaigns.reply.emailUpdated')
    await fetchReplies()
    await fetchContactHistory(selectedReply.value.id)
  } catch (e) {
    showContactActionError(e)
  } finally {
    savingContact.value = false
  }
}

async function unsubscribeContact() {
  if (!selectedReply.value?.mailAddress || savingContact.value) return
  if (!window.confirm(t('campaigns.reply.confirmUnsubscribe'))) return
  savingContact.value = true
  contactActionMessage.value = ''
  try {
    const result = await Campaigns.unsubscribeReplyContact(selectedReply.value.id)
    selectedReply.value.mailAddress.unsubscribed = true
    selectedReply.value.mailAddress.active = 0
    selectedReply.value.isHandled = result.isHandled
    syncHandledReplyInList(selectedReply.value.id)
    contactEmailDraft.value = selectedReply.value.mailAddress.email
    contactActionError.value = false
    contactActionMessage.value = t('campaigns.reply.contactUnsubscribed')
    await fetchReplies()
    await fetchContactHistory(selectedReply.value.id)
  } catch (e) {
    showContactActionError(e)
  } finally {
    savingContact.value = false
  }
}

async function markHandled() {
  if (!selectedReply.value || handlingReply.value || selectedReply.value.isHandled) return
  handlingReply.value = true
  contactActionMessage.value = ''
  try {
    const result = await Campaigns.markReplyHandled(selectedReply.value.id)
    selectedReply.value.isHandled = result.isHandled
    syncHandledReplyInList(selectedReply.value.id)
    contactActionError.value = false
    contactActionMessage.value = t('campaigns.reply.handledSuccess')
    await fetchReplies()
  } catch (e) {
    showContactActionError(e)
  } finally {
    handlingReply.value = false
  }
}

function syncHandledReplyInList(replyId) {
  const index = replies.value.findIndex(reply => reply.id === replyId)
  if (index === -1) return

  if (handledFilter.value === false) {
    replies.value.splice(index, 1)
    totalReplies.value = Math.max(0, totalReplies.value - 1)
    const pageSize = options.value.itemsPerPage || 50
    options.value.page = Math.max(1, Math.min(options.value.page, Math.ceil(totalReplies.value / pageSize) || 1))
    return
  }

  replies.value[index].isHandled = true
}

function showContactActionError(error) {
  contactActionError.value = true
  contactActionMessage.value = error.response?.data?.response?.message || error.response?.data?.message || error.message || t('campaigns.reply.contactActionError')
}

function formatDateTime(date) {
  if (!date) return '-'
  return new Date(date).toLocaleString('pl-PL')
}

// Watchers
watch(() => props.campaign?.id, () => {
  options.value.page = 1
  fetchReplies()
  fetchStats()
}, { immediate: true })

watch(statusFilter, () => {
  options.value.page = 1
  fetchReplies()
})

watch(handledFilter, () => {
  options.value.page = 1
  fetchReplies()
})

watch(showReplyDialog, (isOpen, wasOpen) => {
  if (wasOpen && !isOpen) fetchReplies()
})

watch(searchQuery, () => {
  options.value.page = 1
  if (searchDebounce) clearTimeout(searchDebounce)
  searchDebounce = setTimeout(() => {
    fetchReplies()
  }, 300)
})

onMounted(() => {
  fetchReplies()
  fetchStats()
})
</script>

<style scoped>
.campaign-replies-container {
  width: 100%;
}

.stat-card {
  border-radius: 12px !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08) !important;
}

.filters-section {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
}

.replies-table {
  border-radius: 12px !important;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08) !important;
}

.from-cell .email {
  font-weight: 600;
  margin-bottom: 2px;
}

.from-cell .name {
  font-size: 0.85rem;
  color: #666;
}

.subject-cell {
  display: flex;
  align-items: center;
}

.date-cell {
  color: #666;
  font-size: 0.9rem;
}

.handling-status-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.action-buttons {
  display: flex;
  gap: 2px;
}

.no-data {
  text-align: center;
  padding: 40px;
}

.no-data p {
  margin: 16px 0;
  color: #666;
}

.dialog-header {
  background: linear-gradient(135deg, #202950 0%, #515bad 100%) !important;
  color: white !important;
  padding: 20px 24px !important;
}

.reply-details {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.detail-item {
  display: flex;
  gap: 12px;
}

.detail-item .label {
  font-weight: 600;
  min-width: 140px;
  color: #666;
}

.detail-item .value {
  flex: 1;
  color: #333;
}

.email-secondary {
  color: #666;
  font-size: 0.9rem;
}

.reply-body {
  margin-top: 16px;
}

.body-content {
  padding: 16px;
  background: #ffffff;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  overflow-y: auto;
  line-height: 1.6;
}

.body-content :deep(pre) {
  white-space: pre-wrap;
  word-wrap: break-word;
  font-family: inherit;
  margin: 0;
}

.body-content :deep(table) {
  border-collapse: collapse;
  width: 100%;
}

.body-content :deep(img) {
  max-width: 100%;
  height: auto;
}

.contact-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 100%;
}

.contact-email-input {
  max-width: 420px;
}

.contact-status-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.contact-history {
  flex: 1;
  min-width: 0;
}

.history-list {
  padding: 0;
}

.history-item {
  padding-inline: 0;
}

.no-content {
  padding: 16px;
  text-align: center;
  color: #999;
  font-style: italic;
}

@media (max-width: 768px) {
  .filters-section {
    flex-direction: column;
    align-items: stretch;
  }
  
  .filters-section > * {
    max-width: 100% !important;
  }
}
</style>
