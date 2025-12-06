<template>
  <div class="campaign-bounces-container">
    <!-- Stats Cards -->
    <v-row class="mb-4">
      <v-col cols="12" sm="6" md="3">
        <v-card class="stat-card">
          <v-card-text>
            <div class="d-flex align-center justify-space-between">
              <div>
                <div class="text-caption text-medium-emphasis">{{ t('campaigns.allBounces') }}</div>
                <div class="text-h5 font-weight-bold">{{ stats.totalBounces }}</div>
              </div>
              <v-icon size="40" color="error">mdi-email-alert</v-icon>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card class="stat-card">
          <v-card-text>
            <div class="d-flex align-center justify-space-between">
              <div>
                <div class="text-caption text-medium-emphasis">{{ t('campaigns.hardBounces') }}</div>
                <div class="text-h5 font-weight-bold">{{ stats.hardBounces }}</div>
              </div>
              <v-icon size="40" color="error">mdi-close-circle</v-icon>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card class="stat-card">
          <v-card-text>
            <div class="d-flex align-center justify-space-between">
              <div>
                <div class="text-caption text-medium-emphasis">{{ t('campaigns.softBounces') }}</div>
                <div class="text-h5 font-weight-bold">{{ stats.softBounces }}</div>
              </div>
              <v-icon size="40" color="warning">mdi-alert-circle</v-icon>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card class="stat-card">
          <v-card-text>
            <div class="d-flex align-center justify-space-between">
              <div>
                <div class="text-caption text-medium-emphasis">{{ t('campaigns.bounceRate') }}</div>
                <div class="text-h5 font-weight-bold">{{ bounceRate }}%</div>
              </div>
              <v-icon size="40" color="info">mdi-chart-line</v-icon>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Filters -->
    <v-card class="mb-4">
      <v-card-text>
        <div class="filters-section">
          <v-text-field
            v-model="searchQuery"
            :placeholder="t('campaigns.searchByEmail')"
            prepend-inner-icon="mdi-magnify"
            variant="outlined"
            density="comfortable"
            hide-details
            clearable
            style="max-width: 400px;"
          />
          <v-select
            v-model="bounceTypeFilter"
            :items="bounceTypeOptions"
            variant="outlined"
            density="comfortable"
            hide-details
            style="max-width: 200px;"
          />
        </div>
      </v-card-text>
    </v-card>

    <!-- Bounces Table -->
    <v-data-table-server
      :headers="headers"
      :items="bounces"
      :items-length="totalBounces"
      :loading="loading"
      class="bounces-table"
      @update:options="onUpdateOptions"
    >
      <!-- Email Column -->
      <template v-slot:item.toEmail="{ item }">
        <div class="email-cell">
          <div class="email">{{ item.toEmail }}</div>
        </div>
      </template>

      <!-- Bounce Type Column -->
      <template v-slot:item.bounceType="{ item }">
        <v-chip
          :color="item.bounceType === 'hard' ? 'error' : 'warning'"
          size="small"
          variant="flat"
        >
          {{ item.bounceType === 'hard' ? t('campaigns.hard') : t('campaigns.soft') }}
        </v-chip>
      </template>

      <!-- Bounce Date Column -->
      <template v-slot:item.bounceDate="{ item }">
        <div class="date-cell">
          {{ formatDateTime(item.bounceDate) }}
        </div>
      </template>

      <!-- Reason Column -->
      <template v-slot:item.reason="{ item }">
        <div class="reason-cell">
          {{ item.reason || '-' }}
        </div>
      </template>

      <!-- Contact Info Column -->
      <template v-slot:item.contact="{ item }">
        <div v-if="item.hasContact && item.mailAddress">
          <v-chip size="small" color="success" variant="tonal">
            <v-icon left size="16">mdi-account-check</v-icon>
            {{ item.mailAddress.miasto || t('campaigns.bounce.identifiedContact') }}
          </v-chip>
        </div>
        <div v-else>
          <v-chip size="small" color="default" variant="tonal">
            <v-icon left size="16">mdi-account-question</v-icon>
            {{ t('campaigns.bounce.unknownContact') }}
          </v-chip>
        </div>
      </template>

      <!-- Empty State -->
      <template v-slot:no-data>
        <div class="no-data">
          <v-icon size="48" color="grey-lighten-2">mdi-email-check</v-icon>
          <p>{{ t('campaigns.bounce.noData') }}</p>
        </div>
      </template>
    </v-data-table-server>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { Campaigns } from '../../services/campaigns'

const { t } = useI18n()

const props = defineProps({
  campaign: {
    type: Object,
    required: true
  }
})

// Reactive data
const bounces = ref([])
const totalBounces = ref(0)
const loading = ref(false)
const stats = ref({
  totalBounces: 0,
  hardBounces: 0,
  softBounces: 0,
  bounceRate: 0
})
const searchQuery = ref('')
const bounceTypeFilter = ref(null)
const options = ref({ page: 1, itemsPerPage: 50, sortBy: [{ key: 'bounceDate', order: 'desc' }] })
let searchDebounce = null
let fetchInProgress = false

// Table headers
const headers = computed(() => ([
  { title: t('campaigns.bounce.headers.email'), key: 'toEmail', sortable: true },
  { title: t('campaigns.bounce.headers.type'), key: 'bounceType', sortable: true },
  { title: t('campaigns.bounce.headers.date'), key: 'bounceDate', sortable: true },
  { title: t('campaigns.bounce.headers.reason'), key: 'reason', sortable: false },
  { title: t('campaigns.bounce.headers.contact'), key: 'contact', sortable: false }
]))

// Bounce type options
const bounceTypeOptions = computed(() => ([
  { title: t('campaigns.bounce.all'), value: null },
  { title: t('campaigns.bounce.hard'), value: 'hard' },
  { title: t('campaigns.bounce.soft'), value: 'soft' }
]))

// Computed
const bounceRate = computed(() => {
  if (!stats.value.bounceRate) return '0.0'
  return stats.value.bounceRate.toFixed(1)
})

// Methods
async function fetchBounces() {
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
    
    // Filtr typu odbicia
    if (bounceTypeFilter.value !== null) {
      params.bounceType = bounceTypeFilter.value
    }
    
    const data = await Campaigns.getCampaignBounces(props.campaign.id, params)
    bounces.value = data.bounces || []
    totalBounces.value = data.total || 0
    
    // Aktualizuj statystyki jeśli są w odpowiedzi
    if (data.summary) {
      stats.value = {
        totalBounces: data.summary.totalBounces || 0,
        hardBounces: data.summary.hardBounces || 0,
        softBounces: data.summary.softBounces || 0,
        bounceRate: data.summary.bounceRate || 0
      }
    }
  } catch (e) {
    console.error('Błąd pobierania odbić:', e)
    bounces.value = []
    totalBounces.value = 0
  } finally {
    loading.value = false
    fetchInProgress = false
  }
}

async function fetchStats() {
  if (!props.campaign?.id) return
  
  try {
    const data = await Campaigns.getCampaignBouncesStats(props.campaign.id)
    stats.value = data
  } catch (e) {
    console.error('Błąd pobierania statystyk odbić:', e)
  }
}

function onUpdateOptions(newOptions) {
  const changed = newOptions.page !== options.value.page ||
                  newOptions.itemsPerPage !== options.value.itemsPerPage ||
                  JSON.stringify(newOptions.sortBy) !== JSON.stringify(options.value.sortBy)
  
  options.value = { ...options.value, ...newOptions }
  
  if (changed) {
    fetchBounces()
  }
}

function formatDateTime(date) {
  if (!date) return '-'
  return new Date(date).toLocaleString('pl-PL')
}

// Watchers
watch(() => props.campaign?.id, () => {
  options.value.page = 1
  fetchBounces()
  fetchStats()
}, { immediate: true })

watch(bounceTypeFilter, () => {
  options.value.page = 1
  fetchBounces()
})

watch(searchQuery, () => {
  options.value.page = 1
  if (searchDebounce) clearTimeout(searchDebounce)
  searchDebounce = setTimeout(() => {
    fetchBounces()
  }, 300)
})

onMounted(() => {
  fetchBounces()
  fetchStats()
})
</script>

<style scoped>
.campaign-bounces-container {
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

.bounces-table {
  border-radius: 12px !important;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08) !important;
}

.email-cell .email {
  font-weight: 600;
  margin-bottom: 2px;
}

.date-cell {
  color: #666;
  font-size: 0.9rem;
}

.reason-cell {
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.no-data {
  text-align: center;
  padding: 40px;
}

.no-data p {
  margin: 16px 0;
  color: #666;
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
