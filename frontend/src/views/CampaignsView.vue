<template>
  <PageContent title="Kampanie Marketingowe" subtitle="Twórz, zarządzaj i monitoruj swoje kampanie email marketingowe">
    <template #left-panel>
      <v-card class="campaign-list-card">
        <v-card-title class="card-header">
          <div class="header-content">
            <div class="header-info">
              <h3>Kampanie</h3>
              <span class="campaign-count">{{ campaigns.length }} kampanii</span>
            </div>
            <v-btn color="primary" class="add-btn" @click="openCreateDialog">
              <v-icon left>mdi-plus</v-icon>
              Nowa kampania
            </v-btn>
          </div>
        </v-card-title>

        <v-card-text class="pa-0 campaign-list-content">
          <!-- Search & Filters -->
          <div class="search-section">
            <v-text-field v-model="searchQuery" placeholder="Wyszukaj kampanię..." prepend-inner-icon="mdi-magnify"
              variant="outlined" density="comfortable" hide-details />
            <div class="filter-chips">
              <v-chip v-for="status in statusFilters" :key="status.value"
                :variant="statusFilter === status.value ? 'elevated' : 'outlined'"
                :color="statusFilter === status.value ? 'primary' : 'default'" size="small"
                @click="statusFilter = statusFilter === status.value ? '' : status.value">
                {{ status.title }}
              </v-chip>
            </div>
          </div>

          <!-- Campaign List -->
          <div class="campaign-list">
            <div v-for="campaign in filteredCampaigns" :key="campaign.id" class="campaign-item"
              :class="{ 'selected': selectedCampaign?.id === campaign.id }" @click="selectCampaign(campaign)">
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
                  <v-chip :color="getStatusColor(campaign.status)" size="small" variant="elevated">
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
                    <v-btn icon size="small" variant="text" v-bind="props" >
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
                    <v-list-item @click="confirmDelete(campaign)" class="delete-item" v-if="campaign.status !== 'sent'">
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
    </template>
    <template #right-panel>
      <!-- Loading State -->
      <div v-if="loadingCampaignDetails" class="loading-state">
        <div class="loading-content">
          <v-progress-circular 
            indeterminate 
            color="primary" 
            size="48"
          ></v-progress-circular>
          <h3>Ładowanie szczegółów kampanii...</h3>
          <p>Pobieranie pełnych informacji o kampanii</p>
        </div>
      </div>

      <div v-else-if="selectedCampaign" class="campaign-details">
        <!-- Campaign Stats Cards -->
         <StatGrid :statElements="[
           { icon: 'mdi-account-group', title: 'Odbiorców', value: selectedCampaign.recipientsCount || 0, class: 'recipients' },
           { icon: 'mdi-email-send', title: 'Wysłanych', value: selectedCampaign.sentCount || 0, class: 'sent' },
           { icon: 'mdi-email-open', title: 'Otwartych', value: selectedCampaign.openRate || 0, class: 'opened' },
           { icon: 'mdi-cursor-pointer', title: 'Kliknięć', value: selectedCampaign.clickRate || 0, class: 'clicks' }
         ]" />

        <!-- Tabs Section -->
        <v-card class="details-card">
          <v-tabs v-model="activeTab" bg-color="transparent">
            <v-tab value="content">
              <v-icon left>mdi-email</v-icon>
              Treść
            </v-tab>
            <v-tab value="recipients">
              <v-icon left>mdi-account-multiple</v-icon>
              Odbiorcy
            </v-tab>
            <v-tab value="scheduling">
              <v-icon left>mdi-calendar-clock</v-icon>
              Planowanie
            </v-tab>
          </v-tabs>

          <v-card-text>
            <v-window v-model="activeTab">
              <!-- Content Tab -->
              <v-window-item value="content">
                <CampaignContent :campaign="selectedCampaign" @edit-template="editTemplate" @edit-content="editHtmlContent" />
              </v-window-item>

              <!-- Recipients Tab -->
              <v-window-item value="recipients">
                <div class="recipients-management">
                  <div class="recipients-header">
                    <h3>Zarządzanie odbiorcami</h3>
                    <v-btn color="primary" variant="outlined" @click="editCampaignDatabase">
                      <v-icon left>mdi-database-edit</v-icon>
                      Zmień bazę odbiorców
                    </v-btn>
                  </div>

                  <v-card v-if="selectedCampaign.database" class="database-info mb-4">
                    <v-card-title class="pb-2">
                      <v-icon left color="primary">mdi-database</v-icon>
                      Aktualna baza odbiorców
                    </v-card-title>
                    <v-card-text>
                      <div class="database-details">
                        <div class="detail-item">
                          <span class="label">Nazwa bazy:</span>
                          <span class="value">{{ selectedCampaign.database.name || selectedCampaign.database }}</span>
                        </div>
                        <div class="detail-item">
                          <span class="label">Liczba kontaktów:</span>
                          <span class="value">{{ selectedCampaign.recipientsCount || 0 }}</span>
                        </div>
                        <div class="detail-item" v-if="selectedCampaign.segments && selectedCampaign.segments.length">
                          <span class="label">Segmenty:</span>
                          <div class="segments">
                            <v-chip 
                              v-for="segment in selectedCampaign.segments" 
                              :key="segment.id || segment"
                              size="small"
                              color="primary"
                              variant="outlined"
                              class="mr-1 mb-1"
                            >
                              {{ segment.name || segment }}
                            </v-chip>
                          </div>
                        </div>
                      </div>
                    </v-card-text>
                  </v-card>

                  <v-alert v-else type="warning" variant="tonal">
                    <v-icon>mdi-alert</v-icon>
                    Nie wybrano bazy odbiorców dla tej kampanii. Kliknij "Zmień bazę odbiorców" aby wybrać bazę.
                  </v-alert>
                            <!-- Test Sending -->
          <div class="test-section">
            <v-divider class="my-4"></v-divider>
            <h4>Wysyłka testowa</h4>
            <v-text-field
              v-model="testEmail"
              label="Email testowy"
              placeholder="test@example.com"
              variant="outlined"
              density="compact"
              :rules="emailRules"
            ></v-text-field>
            <v-btn 
              color="info" 
              variant="outlined" 
              size="small"
              @click="sendTest"
              :disabled="!isValidEmail(testEmail)"
            >
              <v-icon left>mdi-email-send</v-icon>
              Wyślij test
            </v-btn>
          </div>
                  <CampaignRecipients v-if="false":campaign="selectedCampaign" @edit-recipients="editRecipients" />
                </div>
              </v-window-item>

              <!-- Scheduling Tab -->
              <v-window-item value="scheduling">
                <div class="scheduling-management">
                  <div class="scheduling-header">
                    <h3>Planowanie wysyłki kampanii</h3>
                    <p class="text-medium-emphasis">Ustaw kiedy kampania ma zostać wysłana</p>
                  </div>

                  <v-row>
                    <v-col cols="12" md="6">
                      <v-card class="scheduling-options">
                        <v-card-title>
                          <v-icon left color="primary">mdi-send-clock</v-icon>
                          Opcje wysyłki
                        </v-card-title>
                        <v-card-text>
                          <v-radio-group v-model="selectedCampaign.sendMode" @update:model-value="updateSendMode">
                            <v-radio 
                              label="Wyślij natychmiast" 
                              value="immediate"
                              :disabled="selectedCampaign.status === 'sent'"
                            />
                            <v-radio 
                              label="Zapisz jako szkic" 
                              value="draft"
                              :disabled="selectedCampaign.status === 'sent'"
                            />
                            <v-radio 
                              label="Zaplanuj na później" 
                              value="scheduled"
                              :disabled="selectedCampaign.status === 'sent'"
                            />
                          </v-radio-group>

                          <div v-if="selectedCampaign.sendMode === 'scheduled'" class="mt-4">
                            <v-text-field
                              v-model="scheduledDateTime"
                              label="Data i godzina wysyłki"
                              type="datetime-local"
                              variant="outlined"
                              density="comfortable"
                              :min="minDateTime"
                              @update:model-value="updateScheduledDate"
                            />
                          </div>
                        </v-card-text>
                      </v-card>
                    </v-col>

                    <v-col cols="12" md="6">
                      <v-card class="campaign-status-card">
                        <v-card-title>
                          <v-icon left :color="getStatusColor(selectedCampaign.status)">
                            {{ getStatusIcon(selectedCampaign.status) }}
                          </v-icon>
                          Status kampanii
                        </v-card-title>
                        <v-card-text>
                          <v-chip 
                            :color="getStatusColor(selectedCampaign.status)" 
                            size="large" 
                            variant="elevated"
                            class="mb-3"
                          >
                            {{ getStatusLabel(selectedCampaign.status) }}
                          </v-chip>

                          <div v-if="selectedCampaign.scheduledAt" class="scheduled-info">
                            <div class="detail-item">
                              <span class="label">Zaplanowana wysyłka:</span>
                              <span class="value">{{ formatDateTime(selectedCampaign.scheduledAt) }}</span>
                            </div>
                          </div>

                          <div v-if="selectedCampaign.sentAt" class="sent-info">
                            <div class="detail-item">
                              <span class="label">Data wysłania:</span>
                              <span class="value">{{ formatDateTime(selectedCampaign.sentAt) }}</span>
                            </div>
                          </div>

                          <div class="action-buttons mt-4">
                            <v-btn 
                              v-if="selectedCampaign.status === 'draft'" 
                              color="success" 
                              variant="elevated"
                              @click="sendCampaignNow"
                              :disabled="!selectedCampaign.database"
                            >
                              <v-icon left>mdi-send</v-icon>
                              Wyślij teraz
                            </v-btn>

                            <v-btn 
                              v-if="selectedCampaign.status === 'scheduled'" 
                              color="warning" 
                              variant="outlined"
                              @click="cancelScheduled"
                            >
                              <v-icon left>mdi-calendar-remove</v-icon>
                              Anuluj planowanie
                            </v-btn>
                          </div>
                        </v-card-text>
                      </v-card>
                    </v-col>
                  </v-row>
                </div>
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
    </template>
  </PageContent>


  <div class="campaigns-container">


    <!-- Create/Edit Campaign Dialog -->
    <CampaignDialog v-model="showCampaignDialog" :campaign="editingCampaign" @save="saveCampaign"
      @close="closeCampaignDialog" />

    <!-- Schedule Dialog -->
    <ScheduleDialog v-model="scheduleDialog" :campaign="selectedCampaign" @scheduled="handleScheduled" />

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

    <!-- Database Selection Dialog -->
    <DatabaseSelectionDialog 
      v-model="showDatabaseDialog" 
      :campaign="selectedCampaign"
      @database-changed="updateCampaignDatabase"
    />

    <!-- HTML Content Editor Dialog -->
    <v-dialog v-model="showHtmlEditor" max-width="1200px" persistent>
      <v-card class="html-editor-dialog">
        <v-card-title class="dialog-header">
          <h2>Edycja treści HTML</h2>
          <div class="dialog-actions">
            <v-btn icon @click="cancelHtmlEdit">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </div>
        </v-card-title>
        
        <v-card-text class="pa-0">
          <div class="editor-container">
            <!-- QuillEditor zgodnie z oficjalną dokumentacją -->
            <QuillEditor
              :key="editorKey"
              v-model:content="htmlEditorContent"
              contentType="html"
              :toolbar="toolbarOptions"
              placeholder="Wprowadź treść kampanii email..."
              theme="snow"
              @ready="onEditorReady"
              @update:content="onContentUpdate"
              style="height: 500px;"
            />
          </div>
        </v-card-text>
        
        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn 
            variant="text" 
            @click="cancelHtmlEdit"
          >
            Anuluj
          </v-btn>
          <v-btn 
            color="primary" 
            variant="elevated"
            @click="saveHtmlContent"
          >
            <v-icon left>mdi-content-save</v-icon>
            Zapisz treść
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Snackbar for notifications -->
    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      timeout="3000"
      top
    >
      {{ snackbar.message }}
      <template v-slot:actions>
        <v-btn
          variant="text"
          @click="snackbar.show = false"
        >
          Zamknij
        </v-btn>
      </template>
    </v-snackbar>
  </div>
</template>



<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'
import CampaignContent from '../components/campaigns/CampaignContent.vue'
import CampaignRecipients from '../components/campaigns/CampaignRecipients.vue'
import CampaignDialog from '../components/campaigns/CampaignDialog.vue'
import ScheduleDialog from '../components/campaigns/ScheduleDialog.vue'
import DatabaseSelectionDialog from '../components/campaigns/DatabaseSelectionDialog.vue'
import { Campaigns } from '../services/campaigns.js'
import StatCard from '../components/StatCard.vue'
import PageContent from '../components/PageContent.vue'
import StatGrid from '../components/StatGrid.vue'

const router = useRouter()
const route = useRoute()

// Reactive data
const campaigns = ref([])
const selectedCampaign = ref(null)
const searchQuery = ref('')
const statusFilter = ref('')
const activeTab = ref('content')
const showCampaignDialog = ref(false)
const scheduleDialog = ref(false)
const deleteDialog = ref(false)
const editingCampaign = ref(null)
const campaignToDelete = ref(null)
const scheduledDateTime = ref('')
const showDatabaseDialog = ref(false)
const testEmail = ref('')
const loadingCampaignDetails = ref(false)
const showHtmlEditor = ref(false)
const htmlEditorContent = ref('')
const editorKey = ref(0)
const snackbar = ref({
  show: false,
  message: '',
  color: 'success'
})

const emailRules = [
  v => !!v || 'Email jest wymagany',
  v => /.+@.+\..+/.test(v) || 'Email musi być poprawny'
]

// Konfiguracja toolbar dla VueQuill
const toolbarOptions = [
  [{ 'header': [1, 2, 3, false] }],
  ['bold', 'italic', 'underline', 'strike'],
  [{ 'color': [] }, { 'background': [] }],
  [{ 'align': [] }],
  [{ 'list': 'ordered' }, { 'list': 'bullet' }],
  ['blockquote', 'code-block'],
  ['link', 'image'],
  ['clean']
]







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

const minDateTime = computed(() => {
  const now = new Date()
  now.setMinutes(now.getMinutes() + 5) // Minimum 5 minutes from now
  return now.toISOString().slice(0, 16)
})

// Methods
function showNotification(message, color = 'success') {
  snackbar.value = {
    show: true,
    message,
    color
  }
}

function isValidEmail(email) {
  return email && /.+@.+\..+/.test(email)
}

async function selectCampaign(campaign) {
  loadingCampaignDetails.value = true
  try {
    // Pobierz pełne informacje o kampanii z API
    const fullCampaignData = await Campaigns.getCampaignById(campaign.id)
    selectedCampaign.value = fullCampaignData
    activeTab.value = 'content'
  } catch (error) {
    console.error('Błąd pobierania szczegółów kampanii:', error)
    showNotification('Nie udało się pobrać pełnych szczegółów kampanii. Pokazano podstawowe informacje.', 'warning')
    // Fallback do danych z listy
    selectedCampaign.value = campaign
    activeTab.value = 'content'
  } finally {
    loadingCampaignDetails.value = false
  }
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
    // Update existing campaign in local list
    const index = campaigns.value.findIndex(c => c.id === editingCampaign.value.id)
    if (index !== -1) {
      campaigns.value[index] = { 
        ...campaigns.value[index], 
        ...campaignData,
        updatedAt: new Date()
      }
      if (selectedCampaign.value?.id === editingCampaign.value.id) {
        selectedCampaign.value = campaigns.value[index]
      }
    }
  } else {
    // Add new campaign to local list
    const newCampaign = {
      ...campaignData,
      id: campaignData.id || Date.now(), // Use API ID if available, fallback to timestamp
      createdAt: campaignData.createdAt || new Date(),
      status: campaignData.status || 'draft',
      sentCount: 0,
      openRate: 0,
      clickRate: 0
    }
    campaigns.value.unshift(newCampaign)
    selectedCampaign.value = newCampaign
  }
  // Dialog is closed automatically by the API call in CampaignDialog
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

async function editHtmlContent() {
  if (selectedCampaign.value) {
    console.log('Otwieranie edytora HTML dla kampanii:', selectedCampaign.value.name)
    console.log('Aktualna zawartość HTML:', selectedCampaign.value.htmlContent)
    
    // Ustaw zawartość przed pokazaniem dialogu
    const content = selectedCampaign.value.htmlContent || '<p>Wprowadź treść kampanii...</p>'
    htmlEditorContent.value = content
    
    // Zwiększ klucz edytora żeby go przeładować
    editorKey.value++
    
    // Pokaż dialog
    showHtmlEditor.value = true
    
    console.log('Ustawiono zawartość edytora:', content)
  }
}

async function saveHtmlContent() {
  if (!selectedCampaign.value) return
  
  try {
    // VueQuill automatycznie synchronizuje z v-model:content
    const htmlContent = htmlEditorContent.value
    
    // Aktualizuj kampanię z nową zawartością HTML
    const updatedCampaign = await Campaigns.update(selectedCampaign.value.id, {
      htmlContent: htmlContent
    })
    
    // Aktualizuj lokalną kopię kampanii
    selectedCampaign.value.htmlContent = htmlContent
    
    // Aktualizuj kampanię w liście
    const index = campaigns.value.findIndex(c => c.id === selectedCampaign.value.id)
    if (index !== -1) {
      campaigns.value[index] = { ...campaigns.value[index], ...updatedCampaign }
    }
    
    showHtmlEditor.value = false
    showNotification('Treść kampanii została zaktualizowana', 'success')
  } catch (error) {
    console.error('Błąd zapisywania treści HTML:', error)
    showNotification('Nie udało się zapisać treści kampanii', 'error')
  }
}

function cancelHtmlEdit() {
  showHtmlEditor.value = false
  htmlEditorContent.value = ''
}

function onEditorReady(quill) {
  console.log('VueQuill editor ready')
  // Jeśli jest zawartość do ustawienia, ustaw ją teraz gdy edytor jest gotowy
  if (htmlEditorContent.value && htmlEditorContent.value !== '<p>Wprowadź treść kampanii...</p>') {
    quill.root.innerHTML = htmlEditorContent.value
  }
}

function onContentUpdate(content) {
  console.log('Content updated:', content.length, 'characters')
}







function editRecipients() {
  activeTab.value = 'recipients'
}

// New functions for database and scheduling management
function editCampaignDatabase() {
  // Open dedicated database selection dialog
  showDatabaseDialog.value = true
}

function updateSendMode(newMode) {
  if (selectedCampaign.value) {
    selectedCampaign.value.sendMode = newMode
    if (newMode !== 'scheduled') {
      selectedCampaign.value.scheduledAt = null
      scheduledDateTime.value = ''
    }
    // Update campaign via API
    updateCampaignScheduling()
  }
}

function updateScheduledDate(dateTime) {
  if (selectedCampaign.value && dateTime) {
    selectedCampaign.value.scheduledAt = new Date(dateTime)
    updateCampaignScheduling()
  }
}

async function updateCampaignScheduling() {
  if (!selectedCampaign.value) return
  
  try {
    // Update campaign scheduling via API
    await Campaigns.update(selectedCampaign.value.id, {
      sendMode: selectedCampaign.value.sendMode,
      scheduledAt: selectedCampaign.value.scheduledAt
    })
    
    // Update local campaign list
    const index = campaigns.value.findIndex(c => c.id === selectedCampaign.value.id)
    if (index !== -1) {
      campaigns.value[index] = { ...campaigns.value[index], ...selectedCampaign.value }
    }
  } catch (error) {
    console.error('Błąd aktualizacji planowania:', error)
    showNotification('Nie udało się zaktualizować planowania kampanii', 'error')
  }
}

async function sendCampaignNow() {
  if (!selectedCampaign.value) return
  
  const confirmed = confirm(`Czy na pewno chcesz wysłać kampanię "${selectedCampaign.value.name}" teraz?`)
  if (!confirmed) return
  
  try {
    // Send campaign immediately via API
    await Campaigns.send(selectedCampaign.value.id)
    
    // Update campaign status
    selectedCampaign.value.status = 'sent'
    selectedCampaign.value.sentAt = new Date()
    
    // Update local campaign list
    const index = campaigns.value.findIndex(c => c.id === selectedCampaign.value.id)
    if (index !== -1) {
      campaigns.value[index] = { ...campaigns.value[index], ...selectedCampaign.value }
    }
    
    showNotification('Kampania została wysłana!', 'success')
  } catch (error) {
    console.error('Błąd wysyłania kampanii:', error)
    showNotification('Nie udało się wysłać kampanii: ' + (error.response?.data?.message || error.message), 'error')
  }
}

function cancelScheduled() {
  if (!selectedCampaign.value) return
  
  const confirmed = confirm('Czy na pewno chcesz anulować zaplanowaną wysyłkę?')
  if (!confirmed) return
  
  selectedCampaign.value.sendMode = 'draft'
  selectedCampaign.value.status = 'draft'
  selectedCampaign.value.scheduledAt = null
  scheduledDateTime.value = ''
  
  updateCampaignScheduling()
}

function formatDateTime(date) {
  if (!date) return '-'
  return new Date(date).toLocaleString('pl-PL')
}

function updateCampaignDatabase(updatedCampaign) {
  // Update selected campaign with new database
  selectedCampaign.value = updatedCampaign
  
  // Update campaign in local list
  const index = campaigns.value.findIndex(c => c.id === updatedCampaign.id)
  if (index !== -1) {
    campaigns.value[index] = updatedCampaign
  }
  
  // Show success message
  showNotification(`Baza danych została zaktualizowana na: ${updatedCampaign.database?.name || 'Nowa baza'}`, 'success')
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

// Watch for selected campaign changes to sync scheduledDateTime
watch(() => selectedCampaign.value?.scheduledAt, (newScheduledAt) => {
  if (newScheduledAt) {
    const date = new Date(newScheduledAt)
    scheduledDateTime.value = date.toISOString().slice(0, 16)
  } else {
    scheduledDateTime.value = ''
  }
}, { immediate: true })

// Sample data
onMounted(async () => {
  try {
    campaigns.value = await Campaigns.getList()
  } catch (err) {
    // Fallback to sample data
    campaigns.value = [ ]
  }

  // Sprawdź czy jest parametr selectedCampaign z query
  const selectedCampaignId = route.query.selectedCampaign;
  if (selectedCampaignId && campaigns.value.length > 0) {
    // Znajdź i wybierz kampanię o danym ID
    const campaignToSelect = campaigns.value.find(c => c.id.toString() === selectedCampaignId.toString());
    if (campaignToSelect) {
      await selectCampaign(campaignToSelect);
      
      // Pokaż komunikat o aktualizacji treści jeśli jest parametr contentUpdated
      if (route.query.contentUpdated) {
        console.log('Treść kampanii została zaktualizowana pomyślnie');
        // Możesz dodać toast/snackbar notification tutaj
      }
    }
  } else if (campaigns.value.length > 0) {
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

async function sendTest() {
  if (!isValidEmail(testEmail.value)) {
    showNotification('Podaj prawidłowy adres email', 'warning')
    return
  }
  
  if (!selectedCampaign.value) {
    showNotification('Brak wybranej kampanii', 'error')
    return
  }
  
  try {
    // Wywołaj API do wysyłki testowej
    // await Campaigns.sendTest(selectedCampaign.value.id, testEmail.value)
    console.log('Wysyłanie test email dla kampanii:', selectedCampaign.value.name, 'na adres:', testEmail.value)
    showNotification(`Test email wysłany na adres: ${testEmail.value}`, 'success')
    testEmail.value = '' // Wyczyść pole po wysłaniu
  } catch (error) {
    console.error('Błąd wysyłania test email:', error)
    showNotification('Nie udało się wysłać test email: ' + (error.response?.data?.message || error.message), 'error')
  }
}
</script>

<style scoped>
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

.campaign-list-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.search-section {
  padding: 16px;
  border-bottom: 1px solid #eee;
  flex-shrink: 0;
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
  min-height: 0; /* Important for flex scrolling */
  scrollbar-width: thin;
  scrollbar-color: rgba(81, 91, 173, 0.3) transparent;
}

.campaign-list::-webkit-scrollbar {
  width: 6px;
}

.campaign-list::-webkit-scrollbar-track {
  background: transparent;
}

.campaign-list::-webkit-scrollbar-thumb {
  background: rgba(81, 91, 173, 0.3);
  border-radius: 3px;
}

.campaign-list::-webkit-scrollbar-thumb:hover {
  background: rgba(81, 91, 173, 0.5);
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

/* Loading State */
.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 50vh;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 16px;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.loading-content {
  text-align: center;
}

.loading-content h3 {
  font-size: 1.2rem;
  margin: 16px 0 8px 0;
  color: #333;
}

.loading-content p {
  color: #666;
  margin: 0;
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

/* Recipients Management */
.recipients-management {
  padding: 0;
}

.recipients-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.recipients-header h3 {
  margin: 0;
  color: #333;
}

.database-info {
  border: 1px solid #e0e0e0;
}

.database-details {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.detail-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.detail-item .label {
  font-weight: 600;
  min-width: 120px;
  color: #666;
}

.detail-item .value {
  flex: 1;
  color: #333;
}

.segments {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

/* Scheduling Management */
.scheduling-management {
  padding: 0;
}

.scheduling-header {
  margin-bottom: 24px;
}

.scheduling-header h3 {
  margin: 0 0 8px 0;
  color: #333;
}

.scheduling-options {
  height: fit-content;
}

.campaign-status-card {
  height: fit-content;
}

.scheduled-info,
.sent-info {
  margin-top: 16px;
  padding: 12px;
  background: #f5f5f5;
  border-radius: 8px;
}

.action-buttons {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

/* HTML Editor Dialog */
.html-editor-dialog {
  border-radius: 16px !important;
}

.dialog-header {
  background: linear-gradient(135deg, #202950 0%, #515bad 100%) !important;
  color: white !important;
  border-radius: 16px 16px 0 0 !important;
  display: flex !important;
  justify-content: space-between !important;
  align-items: center !important;
  padding: 20px 24px !important;
}

.dialog-header h2 {
  margin: 0;
  font-weight: 600;
}

.dialog-actions {
  display: flex;
  align-items: center;
}

.editor-container {
  background: white;
  min-height: 500px;
}

/* QuillEditor Custom Styles */
.editor-container :deep(.ql-toolbar) {
  border-top: none;
  border-left: none;
  border-right: none;
  border-bottom: 1px solid #e0e0e0;
  background: #f8f9fa;
  padding: 12px;
}

.editor-container :deep(.ql-container) {
  border: 1px solid #e0e0e0;
  border-radius: 0 0 8px 8px;
  font-size: 14px;
}

.editor-container :deep(.ql-editor) {
  min-height: 450px;
  padding: 20px;
  font-family: Arial, sans-serif;
  line-height: 1.6;
}

.editor-container :deep(.ql-editor.ql-blank::before) {
  color: #999;
  font-style: italic;
}

.editor-container :deep(.ql-editor h1) {
  font-size: 2em;
  margin: 0.67em 0;
  font-weight: bold;
  color: #2c3e50;
}

.editor-container :deep(.ql-editor h2) {
  font-size: 1.5em;
  margin: 0.75em 0;
  font-weight: bold;
  color: #34495e;
}

.editor-container :deep(.ql-editor h3) {
  font-size: 1.17em;
  margin: 0.83em 0;
  font-weight: bold;
  color: #34495e;
}

.editor-container :deep(.ql-editor p) {
  margin-bottom: 12px;
}

.editor-container :deep(.ql-editor ul),
.editor-container :deep(.ql-editor ol) {
  margin: 12px 0;
  padding-left: 2em;
}

.editor-container :deep(.ql-editor li) {
  margin: 4px 0;
}

.editor-container :deep(.ql-editor img) {
  max-width: 100%;
  height: auto;
}

.editor-container :deep(.ql-editor a) {
  color: #1976d2;
  text-decoration: none;
}

.editor-container :deep(.ql-editor a:hover) {
  text-decoration: underline;
}

.editor-container :deep(.ql-editor blockquote) {
  border-left: 4px solid #ccc;
  margin: 16px 0;
  padding-left: 16px;
  color: #666;
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

  .html-editor-dialog {
    margin: 10px;
    max-width: calc(100vw - 20px) !important;
  }

  .editor-container :deep(.ql-toolbar) {
    flex-wrap: wrap;
  }
}
</style>