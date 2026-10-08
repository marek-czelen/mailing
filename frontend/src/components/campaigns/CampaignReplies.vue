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
                <div><strong>{{ t('campaigns.reply.email') }}:</strong> {{ selectedReply.mailAddress.email }}</div>
                <div v-if="selectedReply.mailAddress.miasto">
                  <strong>{{ t('campaigns.reply.city') }}:</strong> {{ selectedReply.mailAddress.miasto }}
                </div>
                <div v-if="selectedReply.mailAddress.rodzaj">
                  <strong>{{ t('campaigns.reply.type') }}:</strong> {{ selectedReply.mailAddress.rodzaj }}
                </div>
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
const options = ref({ page: 1, itemsPerPage: 50, sortBy: [{ key: 'receivedAt', order: 'desc' }] })
const showReplyDialog = ref(false)
const selectedReply = ref(null)
let searchDebounce = null
let fetchInProgress = false

// Table headers
const headers = computed(() => ([
  { title: t('campaigns.reply.headers.from'), key: 'fromEmail', sortable: true },
  { title: t('campaigns.reply.headers.subject'), key: 'subject', sortable: true },
  { title: t('campaigns.reply.headers.receivedAt'), key: 'receivedAt', sortable: true },
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

// Computed
const replyRate = computed(() => {
  if (!stats.value.replyRate) return '0.0'
  return stats.value.replyRate.toFixed(1)
})

// Methods
async function fetchReplies() {
  if (fetchInProgress || !props.campaign?.id) return
  fetchInProgress = true
  
  try {
    loading.value = true
    const params = {
      page: options.value.page,
      limit: options.value.itemsPerPage || 50,
      search: searchQuery.value || ''
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
    showReplyDialog.value = true
  } catch (e) {
    console.error('Błąd pobierania szczegółów odpowiedzi:', e)
  }
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
