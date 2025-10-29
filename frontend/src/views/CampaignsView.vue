<template>
  <div class="campaigns-container">
    <!-- Header Section -->
    <div class="campaigns-header">
      <h1 class="page-title">Kampanie Marketingowe</h1>
      <p class="page-subtitle">Twórz, zarządzaj i monitoruj swoje kampanie email marketingowe</p>
    </div>

    <v-container fluid class="campaigns-content">
      <v-row>
        <!-- Left Panel - Campaigns List -->
        <v-col cols="12" md="4">
          <v-card class="campaign-list-card">
            <v-card-title class="card-header">
              <div class="header-content">
                <div class="header-info">
                  <h3>Kampanie</h3>
                  <span class="campaign-count">{{ campaigns.length }} kampanii</span>
                </div>
                <v-btn 
                  color="primary" 
                  class="add-btn"
                  @click="openCreateDialog"
                >
                  <v-icon left>mdi-plus</v-icon>
                  Nowa kampania
                </v-btn>
              </div>
            </v-card-title>
            
            <v-card-text class="pa-0">
              <!-- Search & Filters -->
              <div class="search-section">
                <v-text-field
                  v-model="searchQuery"
                  placeholder="Wyszukaj kampanię..."
                  prepend-inner-icon="mdi-magnify"
                  variant="outlined"
                  density="comfortable"
                  hide-details
                />
                <div class="filter-chips">
                  <v-chip
                    v-for="status in statusFilters"
                    :key="status.value"
                    :variant="statusFilter === status.value ? 'elevated' : 'outlined'"
                    :color="statusFilter === status.value ? 'primary' : 'default'"
                    size="small"
                    @click="statusFilter = statusFilter === status.value ? '' : status.value"
                  >
                    {{ status.title }}
                  </v-chip>
                </div>
              </div>

              <!-- Campaign List -->
              <div class="campaign-list">
                <div 
                  v-for="campaign in filteredCampaigns"
                  :key="campaign.id"
                  class="campaign-item"
                  :class="{ 'selected': selectedCampaign?.id === campaign.id }"
                  @click="selectCampaign(campaign)"
                >
                  <div class="campaign-icon">
                    <v-icon size="24" :color="getStatusColor(campaign.status)">
                      {{ getStatusIcon(campaign.status) }}
                    </v-icon>
                  </div>
                  <div class="campaign-info">
                    <h4 class="campaign-name">{{ campaign.name }}</h4>
                    <div class="campaign-meta">
                      <span class="recipients-count">
                        <v-icon size="16">mdi-account-group</v-icon>
                        {{ campaign.recipientsCount || 0 }} odbiorców
                      </span>
                      <span class="campaign-date">{{ formatDate(campaign.createdAt) }}</span>
                    </div>
                    <div class="campaign-status">
                      <v-chip
                        :color="getStatusColor(campaign.status)"
                        size="small"
                        variant="elevated"
                      >
                        {{ getStatusLabel(campaign.status) }}
                      </v-chip>
                      <span v-if="campaign.openRate" class="open-rate">
                        {{ campaign.openRate }}% otwarć
                      </span>
                    </div>
                  </div>
                  <div class="campaign-actions">
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
                        <v-list-item @click="editCampaign(campaign)">
                          <v-list-item-title>
                            <v-icon left size="16">mdi-pencil</v-icon>
                            Edytuj
                          </v-list-item-title>
                        </v-list-item>
                        <v-list-item @click="duplicateCampaign(campaign)">
                          <v-list-item-title>
                            <v-icon left size="16">mdi-content-copy</v-icon>
                            Duplikuj
                          </v-list-item-title>
                        </v-list-item>
                        <v-list-item @click="previewCampaign(campaign)">
                          <v-list-item-title>
                            <v-icon left size="16">mdi-eye</v-icon>
                            Podgląd
                          </v-list-item-title>
                        </v-list-item>
                        <v-divider />
                        <v-list-item 
                          @click="confirmDelete(campaign)" 
                          class="delete-item"
                          v-if="campaign.status !== 'sent'"
                        >
                          <v-list-item-title>
                            <v-icon left size="16">mdi-delete</v-icon>
                            Usuń
                          </v-list-item-title>
                        </v-list-item>
                      </v-list>
                    </v-menu>
                  </div>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Right Panel - Campaign Details -->
        <v-col cols="12" md="8">
          <div v-if="selectedCampaign" class="campaign-details">
            <!-- Campaign Stats Cards -->
            <div class="stats-grid">
              <v-card class="stat-card">
                <div class="stat-content">
                  <div class="stat-icon recipients">
                    <v-icon>mdi-account-group</v-icon>
                  </div>
                  <div class="stat-info">
                    <h3>{{ selectedCampaign.recipientsCount || 0 }}</h3>
                    <p>Odbiorców</p>
                  </div>
                </div>
              </v-card>
              
              <v-card class="stat-card">
                <div class="stat-content">
                  <div class="stat-icon sent">
                    <v-icon>mdi-email-send</v-icon>
                  </div>
                  <div class="stat-info">
                    <h3>{{ selectedCampaign.sentCount || 0 }}</h3>
                    <p>Wysłanych</p>
                  </div>
                </div>
              </v-card>
              
              <v-card class="stat-card">
                <div class="stat-content">
                  <div class="stat-icon opened">
                    <v-icon>mdi-email-open</v-icon>
                  </div>
                  <div class="stat-info">
                    <h3>{{ selectedCampaign.openRate || 0 }}%</h3>
                    <p>Otwartych</p>
                  </div>
                </div>
              </v-card>
              
              <v-card class="stat-card">
                <div class="stat-content">
                  <div class="stat-icon clicks">
                    <v-icon>mdi-cursor-pointer</v-icon>
                  </div>
                  <div class="stat-info">
                    <h3>{{ selectedCampaign.clickRate || 0 }}%</h3>
                    <p>Kliknięć</p>
                  </div>
                </div>
              </v-card>
            </div>

            <!-- Action Buttons -->
            <div class="action-buttons">
              <v-btn 
                v-if="selectedCampaign.status === 'draft'"
                color="success" 
                variant="elevated" 
                @click="sendCampaign"
              >
                <v-icon left>mdi-send</v-icon>
                Wyślij kampanię
              </v-btn>
              <v-btn 
                v-if="selectedCampaign.status === 'draft'"
                color="primary"
                variant="outlined" 
                @click="scheduleDialog = true"
              >
                <v-icon left>mdi-calendar-clock</v-icon>
                Zaplanuj wysyłkę
              </v-btn>
              <v-btn variant="outlined" @click="previewCampaign(selectedCampaign)">
                <v-icon left>mdi-eye</v-icon>
                Podgląd
              </v-btn>
              <v-btn variant="outlined" @click="viewReport">
                <v-icon left>mdi-chart-line</v-icon>
                Raport
              </v-btn>
            </div>

            <!-- Tabs Section -->
            <v-card class="details-card">
              <v-tabs v-model="activeTab" bg-color="transparent">
                <v-tab value="overview">
                  <v-icon left>mdi-information</v-icon>
                  Przegląd
                </v-tab>
                <v-tab value="content">
                  <v-icon left>mdi-email</v-icon>
                  Treść
                </v-tab>
                <v-tab value="recipients">
                  <v-icon left>mdi-account-multiple</v-icon>
                  Odbiorcy
                </v-tab>
                <v-tab value="analytics">
                  <v-icon left>mdi-chart-bar</v-icon>
                  Analityka
                </v-tab>
              </v-tabs>

              <v-card-text>
                <v-window v-model="activeTab">
                  <!-- Overview Tab -->
                  <v-window-item value="overview">
                    <CampaignOverview 
                      :campaign="selectedCampaign"
                      @edit="editCampaign"
                    />
                  </v-window-item>

                  <!-- Content Tab -->
                  <v-window-item value="content">
                    <CampaignContent 
                      :campaign="selectedCampaign"
                      @edit-template="editTemplate"
                    />
                  </v-window-item>

                  <!-- Recipients Tab -->
                  <v-window-item value="recipients">
                    <CampaignRecipients 
                      :campaign="selectedCampaign"
                      @edit-recipients="editRecipients"
                    />
                  </v-window-item>

                  <!-- Analytics Tab -->
                  <v-window-item value="analytics">
                    <CampaignAnalytics 
                      :campaign="selectedCampaign"
                    />
                  </v-window-item>
                </v-window>
              </v-card-text>
            </v-card>
          </div>

          <!-- Empty State -->
          <div v-else class="empty-state">
            <div class="empty-icon">
              <v-icon size="80" color="grey-lighten-2">mdi-email-outline</v-icon>
            </div>
            <h3>Wybierz kampanię</h3>
            <p>Wybierz kampanię z listy po lewej stronie, aby zobaczyć szczegóły i zarządzać nią.</p>
            <v-btn color="primary" @click="openCreateDialog">
              <v-icon left>mdi-plus</v-icon>
              Utwórz pierwszą kampanię
            </v-btn>
          </div>
        </v-col>
      </v-row>
    </v-container>

    <!-- Create/Edit Campaign Dialog -->
    <CampaignDialog
      v-model="showCampaignDialog"
      :campaign="editingCampaign"
      @save="saveCampaign"
      @close="closeCampaignDialog"
    />

    <!-- Schedule Dialog -->
    <ScheduleDialog
      v-model="scheduleDialog"
      :campaign="selectedCampaign"
      @scheduled="handleScheduled"
    />

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="deleteDialog" max-width="500px">
      <v-card class="delete-dialog">
        <v-card-title class="dialog-header delete-header">
          <h2>Potwierdź usunięcie</h2>
        </v-card-title>
        <v-card-text class="pa-6">
          <p>Czy na pewno chcesz usunąć kampanię <strong>"{{ campaignToDelete?.name }}"</strong>?</p>
          <p class="text-caption text-error">Ta akcja jest nieodwracalna.</p>
        </v-card-text>
        <v-card-actions class="pa-6">
          <v-spacer />
          <v-btn variant="text" @click="deleteDialog = false">
            Anuluj
          </v-btn>
          <v-btn color="error" variant="elevated" @click="deleteCampaign">
            Usuń kampanię
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>



<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import CampaignOverview from '../components/campaigns/CampaignOverview.vue'
import CampaignContent from '../components/campaigns/CampaignContent.vue'
import CampaignRecipients from '../components/campaigns/CampaignRecipients.vue'
import CampaignAnalytics from '../components/campaigns/CampaignAnalytics.vue'
import CampaignDialog from '../components/campaigns/CampaignDialog.vue'
import ScheduleDialog from '../components/campaigns/ScheduleDialog.vue'
import { Campaigns } from '../services/campaigns.js'

const router = useRouter()

// Reactive data
const campaigns = ref([])
const selectedCampaign = ref(null)
const searchQuery = ref('')
const statusFilter = ref('')
const activeTab = ref('overview')
const showCampaignDialog = ref(false)
const scheduleDialog = ref(false)
const deleteDialog = ref(false)
const editingCampaign = ref(null)
const campaignToDelete = ref(null)

// Status filters
const statusFilters = [
  { title: 'Szkice', value: 'draft' },
  { title: 'Zaplanowane', value: 'scheduled' },
  { title: 'Wysłane', value: 'sent' },
  { title: 'Aktywne', value: 'active' }
]

// Computed
const filteredCampaigns = computed(() => {
  let filtered = campaigns.value

  // Filter by search query
  if (searchQuery.value) {
    filtered = filtered.filter(campaign => 
      campaign.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      campaign.subject?.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }

  // Filter by status
  if (statusFilter.value) {
    filtered = filtered.filter(campaign => campaign.status === statusFilter.value)
  }

  return filtered
})

// Methods
function selectCampaign(campaign) {
  selectedCampaign.value = campaign
  activeTab.value = 'overview'
}

function openCreateDialog() {
  editingCampaign.value = null
  showCampaignDialog.value = true
}

function editCampaign(campaign) {
  editingCampaign.value = { ...campaign }
  showCampaignDialog.value = true
}

function saveCampaign(campaignData) {
  if (editingCampaign.value) {
    // Update existing
    const index = campaigns.value.findIndex(c => c.id === editingCampaign.value.id)
    if (index !== -1) {
      campaigns.value[index] = { ...campaigns.value[index], ...campaignData }
      if (selectedCampaign.value?.id === editingCampaign.value.id) {
        selectedCampaign.value = campaigns.value[index]
      }
    }
  } else {
    // Create new
    const newCampaign = {
      id: Date.now(),
      ...campaignData,
      createdAt: new Date(),
      status: 'draft',
      recipientsCount: 0,
      sentCount: 0,
      openRate: 0,
      clickRate: 0
    }
    campaigns.value.unshift(newCampaign)
    selectedCampaign.value = newCampaign
  }
  closeCampaignDialog()
}

function closeCampaignDialog() {
  showCampaignDialog.value = false
  editingCampaign.value = null
}

function duplicateCampaign(campaign) {
  const duplicate = {
    ...campaign,
    id: Date.now(),
    name: `${campaign.name} (kopia)`,
    status: 'draft',
    createdAt: new Date(),
    sentCount: 0,
    openRate: 0,
    clickRate: 0
  }
  campaigns.value.unshift(duplicate)
  selectedCampaign.value = duplicate
}

function previewCampaign(campaign) {
  // Open email editor in preview mode
  router.push({ 
    name: 'BlockEmailEditor', 
    query: { 
      preview: true, 
      campaignId: campaign.id 
    }
  })
}

function confirmDelete(campaign) {
  campaignToDelete.value = campaign
  deleteDialog.value = true
}

async function deleteCampaign() {
  if (!campaignToDelete.value) return
  
  try {
    await Campaigns.delete(campaignToDelete.value.id)
    campaigns.value = campaigns.value.filter(c => c.id !== campaignToDelete.value.id)
    if (selectedCampaign.value?.id === campaignToDelete.value.id) {
      selectedCampaign.value = null
    }
  } catch (err) {
    console.error('Błąd usuwania kampanii:', err)
  }
  
  deleteDialog.value = false
  campaignToDelete.value = null
}

function sendCampaign() {
  if (selectedCampaign.value) {
    selectedCampaign.value.status = 'sent'
    selectedCampaign.value.sentAt = new Date()
    selectedCampaign.value.sentCount = selectedCampaign.value.recipientsCount
    console.log('Wysyłanie kampanii:', selectedCampaign.value.name)
  }
}

function handleScheduled(scheduleData) {
  if (selectedCampaign.value) {
    selectedCampaign.value.status = 'scheduled'
    selectedCampaign.value.scheduledAt = scheduleData.sendAt
    console.log('Kampania zaplanowana:', scheduleData)
  }
  scheduleDialog.value = false
}

function editTemplate() {
  if (selectedCampaign.value) {
    router.push({ 
      name: 'BlockEmailEditor', 
      query: { 
        campaignId: selectedCampaign.value.id 
      }
    })
  }
}

function editRecipients() {
  activeTab.value = 'recipients'
}

function viewReport() {
  activeTab.value = 'analytics'
}

function getStatusColor(status) {
  const colors = {
    draft: 'grey',
    scheduled: 'warning',
    sent: 'success',
    active: 'primary'
  }
  return colors[status] || 'grey'
}

function getStatusIcon(status) {
  const icons = {
    draft: 'mdi-file-document-edit',
    scheduled: 'mdi-calendar-clock',
    sent: 'mdi-email-check',
    active: 'mdi-email-send'
  }
  return icons[status] || 'mdi-email'
}

function getStatusLabel(status) {
  const labels = {
    draft: 'Szkic',
    scheduled: 'Zaplanowana',
    sent: 'Wysłana',
    active: 'Aktywna'
  }
  return labels[status] || 'Nieznany'
}

function formatDate(date) {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('pl-PL')
}

// Sample data
onMounted(async () => {
  try {
    campaigns.value = await Campaigns.getList()
  } catch (err) {
    // Fallback to sample data
    campaigns.value = [
      {
        id: 1,
        name: 'Newsletter Styczeń 2025',
        subject: 'Nowości w naszej ofercie!',
        status: 'sent',
        createdAt: new Date('2025-01-15'),
        sentAt: new Date('2025-01-20'),
        recipientsCount: 1500,
        sentCount: 1500,
        openRate: 24.5,
        clickRate: 3.2,
        database: 'Newsletter Subskrybenci',
        template: 'Szablon promocyjny'
      },
      {
        id: 2,
        name: 'Promocja Walentynkowa',
        subject: 'Specjalne oferty na Walentynki ❤️',
        status: 'scheduled',
        createdAt: new Date('2025-01-25'),
        scheduledAt: new Date('2025-02-10'),
        recipientsCount: 850,
        sentCount: 0,
        openRate: 0,
        clickRate: 0,
        database: 'Klienci Premium',
        template: 'Szablon walentynkowy'
      },
      {
        id: 3,
        name: 'Powitalny email',
        subject: 'Witaj w naszej społeczności!',
        status: 'draft',
        createdAt: new Date('2025-01-28'),
        recipientsCount: 0,
        sentCount: 0,
        openRate: 0,
        clickRate: 0,
        database: null,
        template: 'Szablon powitalny'
      }
    ]
  }
  
  if (campaigns.value.length > 0) {
    selectedCampaign.value = campaigns.value[0]
  }
})

// Additional methods for new components
function editCampaignTemplate(campaign) {
  router.push({ 
    name: 'BlockEmailEditor', 
    query: { 
      campaignId: campaign.id 
    }
  })
}

function updateCampaignSegments(segments) {
  if (selectedCampaign.value) {
    selectedCampaign.value.segments = segments
    // Recalculate recipient count based on segments
    const totalRecipients = segments.reduce((sum, segment) => sum + segment.contactCount, 0)
    selectedCampaign.value.recipientsCount = totalRecipients
  }
}

function manageRecipients() {
  console.log('Otwieranie zarządzania odbiorcami')
  // Could navigate to dedicated recipients management page
}
</script>

<style scoped>
.campaigns-container {
  width: 100vw;
  height: 100%;
  background: linear-gradient(135deg, #eadcf6 0%, #9395fa 100%);
  margin: 0;
  padding: 0;
}

.campaigns-header {
  background: linear-gradient(135deg, #202950 0%, #515bad 100%);
  padding: 10px 0;
  text-align: center;
  color: #eadcf6;
  margin: 0;
  width: 100%;
}

.page-title {
  font-size: 1.8rem;
  font-weight: 800;
  margin-bottom: 8px;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

.page-subtitle {
  font-size: 0.9rem;
  opacity: 0.9;
}

.campaigns-content {
  padding: 20px !important;
  margin: 0 !important;
  width: 100% !important;
}

/* Campaign List Card */
.campaign-list-card {
  border-radius: 16px !important;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1) !important;
  border: 1px solid rgba(255, 255, 255, 0.2) !important;
  background: rgba(255, 255, 255, 0.95) !important;
  backdrop-filter: blur(20px) !important;
  height: calc(100vh - 200px);
  display: flex;
  flex-direction: column;
}

.card-header {
  background: linear-gradient(135deg, #202950 0%, #515bad 100%) !important;
  color: #eadcf6 !important;
  border-radius: 16px 16px 0 0 !important;
  padding: 20px 24px !important;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.header-info h3 {
  margin: 0;
  font-weight: 600;
}

.campaign-count {
  font-size: 0.9rem;
  opacity: 0.8;
}

.add-btn {
  background: rgba(234, 220, 246, 0.2) !important;
  color: #eadcf6 !important;
  border: 1px solid rgba(234, 220, 246, 0.3) !important;
}

.search-section {
  padding: 16px;
  border-bottom: 1px solid #eee;
}

.filter-chips {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 12px;
}

.campaign-list {
  flex: 1;
  overflow-y: auto;
}

.campaign-item {
  display: flex;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: all 0.3s ease;
}

.campaign-item:hover {
  background: rgba(81, 91, 173, 0.05);
}

.campaign-item.selected {
  background: linear-gradient(135deg, rgba(32, 41, 80, 0.1) 0%, rgba(81, 91, 173, 0.1) 100%);
  border-left: 4px solid #515bad;
}

.campaign-icon {
  margin-right: 12px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(81, 91, 173, 0.1) 0%, rgba(147, 149, 250, 0.1) 100%);
  border-radius: 8px;
}

.campaign-info {
  flex: 1;
  min-width: 0;
}

.campaign-name {
  font-weight: 600;
  margin: 0 0 4px 0;
  font-size: 1rem;
}

.campaign-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.recipients-count {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.8rem;
  color: #666;
}

.campaign-date {
  font-size: 0.8rem;
  color: #999;
}

.campaign-status {
  display: flex;
  align-items: center;
  gap: 8px;
}

.open-rate {
  font-size: 0.8rem;
  color: #666;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  border-radius: 12px !important;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08) !important;
  border: 1px solid rgba(255, 255, 255, 0.2) !important;
  background: rgba(255, 255, 255, 0.9) !important;
  backdrop-filter: blur(10px) !important;
}

.stat-content {
  display: flex;
  align-items: center;
  padding: 5px 5px 5px 10px;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  color: white;
}

.stat-icon.recipients {
  background: linear-gradient(135deg, #202950 0%, #515bad 100%);
}

.stat-icon.sent {
  background: linear-gradient(135deg, #10b981 0%, #34d399 100%);
}

.stat-icon.opened {
  background: linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%);
}

.stat-icon.clicks {
  background: linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%);
}

.stat-info h3 {
  font-size: 1.8rem;
  font-weight: 700;
  margin: 0;
  color: #333;
}

.stat-info p {
  margin: 0;
  color: #666;
  font-size: 0.9rem;
}

/* Action Buttons */
.action-buttons {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.action-buttons .v-btn {
  border-radius: 8px !important;
}

/* Details Card */
.details-card {
  border-radius: 16px !important;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1) !important;
  border: 1px solid rgba(255, 255, 255, 0.2) !important;
  background: rgba(255, 255, 255, 0.95) !important;
  backdrop-filter: blur(20px) !important;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 60px 20px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 16px;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.empty-icon {
  margin-bottom: 24px;
}

.empty-state h3 {
  font-size: 1.5rem;
  margin-bottom: 8px;
  color: #333;
}

.empty-state p {
  color: #666;
  margin-bottom: 24px;
}

/* Delete Dialog */
.delete-dialog {
  border-radius: 16px !important;
}

.delete-header {
  background: linear-gradient(135deg, #e53e3e 0%, #f56565 100%) !important;
  color: white !important;
  border-radius: 16px 16px 0 0 !important;
}

/* Delete item styling */
.delete-item {
  color: #e53e3e !important;
}

/* Responsive */
@media (max-width: 768px) {
  .campaigns-content {
    padding: 10px !important;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .action-buttons {
    justify-content: center;
  }
  
  .filter-chips {
    justify-content: center;
  }
}
</style>