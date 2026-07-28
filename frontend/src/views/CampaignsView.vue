<template>
  <PageContent :title="t('campaigns.pageTitle')" :subtitle="t('campaigns.pageSubtitle')">
    <template #left-panel>
      <v-card class="campaign-list-card">
        <v-card-title class="card-header">
          <div class="header-content">
            <div class="header-info">
              <h3>{{ t('campaigns.title') }}</h3>
              <span class="campaign-count">{{ campaigns.length }} {{ t('campaigns.newCampaign') /* fallback label */ }}</span>
            </div>
              <v-btn color="primary" class="add-btn" @click="openCreateDialog">
              <v-icon left>mdi-plus</v-icon>
              {{ t('campaigns.newCampaign') }}
            </v-btn>
          </div>
        </v-card-title>

        <v-card-text class="pa-0 campaign-list-content">
          <!-- Search & Filters -->
          <div class="search-section">
            <v-text-field v-model="searchQuery" :placeholder="t('campaigns.searchPlaceholder')" prepend-inner-icon="mdi-magnify"
              variant="outlined" density="comfortable" hide-details />
            <div class="filter-chips">
              <v-chip
                disabled 
                v-for="status in statusFilters" :key="status.value"
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
                    {{ campaign.subject || '' }}
                  </span>
                  <span class="campaign-date">{{ formatDate(campaign.dateStart) }}</span>
                </div>
              </div>
              <div class="campaign-actions">
                <v-menu>
                  <template v-slot:activator="{ props }">
                    <v-btn icon size="small" variant="text" v-bind="props">
                      <v-icon>mdi-dots-vertical</v-icon>
                    </v-btn>
                  </template>
                  <v-list>
                    <v-list-item @click="editCampaign(campaign)">
                      <v-list-item-title>
                        <v-icon left size="16">mdi-pencil</v-icon>
                        {{ t('campaigns.editCampaign') }}
                      </v-list-item-title>
                    </v-list-item>
                    <v-list-item disabled
                      @click="duplicateCampaign(campaign)">
                      <v-list-item-title>
                        <v-icon left size="16">mdi-content-copy</v-icon>
                        {{ t('campaigns.duplicateCampaign') }}
                      </v-list-item-title>
                    </v-list-item>
                    <v-divider />
                    <v-list-item @click="confirmDelete(campaign)" class="delete-item" v-if="campaign.status !== 'sent'">
                      <v-list-item-title>
                        <v-icon left size="16">mdi-delete</v-icon>
                        {{ t('campaigns.deleteCampaign') }}
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

    <!-- Stats bar - pokazuje się gdy kampania jest wybrana -->
    <template #stats v-if="selectedCampaign">
      <StatGrid :statElements="[
        { icon: 'mdi-account-group', title: t('campaigns.recipientsCount'), value: selectedCampaign.databaseInfo?.emailCount || 0, class: 'recipients' },
        { icon: 'mdi-email-send', title: t('campaigns.unsubscribedCount'), value: selectedCampaign.databaseInfo?.unsubscribedEmailCount || 0, class: 'sent' },
      ]" />
    </template>

    <template #right-panel>
      <!-- Loading State -->
      <div v-if="loadingCampaignDetails" class="loading-state">
        <div class="loading-content">
          <v-progress-circular indeterminate color="primary" size="48"></v-progress-circular>
          <h3>{{ t('campaigns.loadingDetails') }}</h3>
          <p>{{ t('campaigns.loadingDetailsSub') }}</p>
        </div>
      </div>

      <div v-else-if="selectedCampaign" class="campaign-details">

        <!-- Tabs Section -->
        <v-card class="details-card">
          <v-tabs v-model="activeTab" bg-color="transparent">
            <v-tab value="content">
              <v-icon left>mdi-email</v-icon>
              {{ t('campaigns.tabs.content') }}
            </v-tab>
            <v-tab value="recipients">
              <v-icon left>mdi-account-multiple</v-icon>
              {{ t('campaigns.tabs.recipients') }}
            </v-tab>
            <v-tab value="replies">
              <v-icon left>mdi-reply</v-icon>
              {{ t('campaigns.tabs.replies') }}
            </v-tab>
            <v-tab value="bounces">
              <v-icon left>mdi-email-alert</v-icon>
              {{ t('campaigns.tabs.bounces') }}
            </v-tab>
            <v-tab value="scheduling" v-if="false">
              <v-icon left>mdi-calendar-clock</v-icon>
              {{ t('campaigns.tabs.scheduling') }}
            </v-tab>
          </v-tabs>

          <v-card-text>
            <v-window v-model="activeTab">
              <!-- Content Tab -->
              <v-window-item value="content">
                <CampaignContent :campaign="selectedCampaign" 
                  @edit-template="editTemplate"
                  @edit-content="editHtmlContent"
                  @update:campaign="updateCampaign" />
              </v-window-item>

              <!-- Recipients Tab -->
              <v-window-item value="recipients">
                <div class="recipients-management">
                  <div class="recipients-header">
                    <h3>{{ t('campaigns.manageRecipients') }}</h3>
                    <v-btn color="primary" variant="outlined" @click="editCampaignDatabase">
                      <v-icon left>mdi-database-edit</v-icon>
                      {{ t('campaigns.changeDatabase') }}
                    </v-btn>
                  </div>

                  <v-card v-if="selectedCampaign.databaseInfo?.database" class="database-info mb-4">
                    <v-card-title class="pb-2">
                      <v-icon left color="primary">mdi-database</v-icon>
                      {{ t('campaigns.currentDatabase') }}
                    </v-card-title>
                    <v-card-text>
                      <div class="database-details">
                        <div class="detail-item">
                          <span class="label">{{ t('campaigns.currentDatabase') }}:</span>
                          <span class="value">{{ selectedCampaign?.databaseInfo?.database?.name }}</span>
                        </div>
                        <div class="detail-item">
                          <span class="label">{{ t('campaigns.recipientsCount') }}:</span>
                          <span class="value">{{ selectedCampaign.databaseInfo?.emailCount || 0 }}</span>
                        </div>
                        <div class="detail-item" v-if="selectedCampaign.segments && selectedCampaign.segments.length">
                          <span class="label">{{ t('campaigns.segments') }}:</span>
                          <div class="segments">
                            <v-chip v-for="segment in selectedCampaign.segments" :key="segment.id || segment"
                              size="small" color="primary" variant="outlined" class="mr-1 mb-1">
                              {{ segment.name || segment }}
                            </v-chip>
                          </div>
                        </div>
                      </div>
                    </v-card-text>
                  </v-card>

                  <v-alert v-else type="warning" variant="tonal">
                    <v-icon>mdi-alert</v-icon>
                    {{ t('campaigns.noDatabaseSelected') }}
                  </v-alert>

                  <CampaignRecipients v-if="false" :campaign="selectedCampaign" @edit-recipients="editRecipients" />
                </div>
              </v-window-item>

              <!-- Replies Tab -->
              <v-window-item value="replies">
                <CampaignReplies :campaign="selectedCampaign" />
              </v-window-item>

              <!-- Bounces Tab -->
              <v-window-item value="bounces">
                <CampaignBounces :campaign="selectedCampaign" />
              </v-window-item>

              <!-- Scheduling Tab -->
              <v-window-item value="scheduling">
                <div class="scheduling-management">
                  <div class="scheduling-header">
                    <h3>{{ t('campaigns.sendScheduling') }}</h3>
                    <p class="text-medium-emphasis">{{ t('campaigns.scheduleDesc') }}</p>
                  </div>

                  <v-row>
                    <v-col cols="12" md="6">
                      <v-card class="scheduling-options">
                        <v-card-title>
                          <v-icon left color="primary">mdi-send-clock</v-icon>
                          {{ t('campaigns.sendOptions') }}
                        </v-card-title>
                        <v-card-text>
                          <v-radio-group v-model="selectedCampaign.sendMode" @update:model-value="updateSendMode">
                            <v-radio disabled :label="t('campaigns.sendImmediate')" value="immediate"
                              :disabled="selectedCampaign.status === 'sent'" />
                            <v-radio disabled :label="t('campaigns.saveDraft')" value="draft"
                              :disabled="selectedCampaign.status === 'sent'" />
                            <v-radio :label="t('campaigns.sendScheduled')" value="scheduled"
                              :disabled="selectedCampaign.status === 'sent'" />
                          </v-radio-group>

                          <div v-if="selectedCampaign.sendMode === 'scheduled'" class="mt-4">
                            <v-text-field v-model="scheduledDateTime" :label="t('campaigns.sendDateTime')"
                              type="datetime-local" variant="outlined" density="comfortable" :min="minDateTime"
                              @update:model-value="updateScheduledDate" />
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
                          {{ t('campaigns.campaignStatus') }}
                        </v-card-title>
                        <v-card-text>
                          <v-chip :color="getStatusColor(selectedCampaign.status)" size="large" variant="elevated"
                            class="mb-3">
                            {{ getStatusLabel(selectedCampaign.status) }}
                          </v-chip>

                          <div v-if="selectedCampaign.dateStart" class="scheduled-info">
                            <div class="detail-item">
                              <span class="label">{{ t('campaigns.scheduledSend') }}</span>
                              <span class="value">{{ formatDateTime(selectedCampaign.dateStart) }}</span>
                            </div>
                          </div>

                          <div v-if="selectedCampaign.sentAt" class="sent-info">
                            <div class="detail-item">
                              <span class="label">{{ t('campaigns.sentAt') }}</span>
                              <span class="value">{{ formatDateTime(selectedCampaign.sentAt) }}</span>
                            </div>
                          </div>

                          <div class="action-buttons mt-4">
                            <v-btn v-if="selectedCampaign.status === 'draft'" color="success" variant="elevated"
                              @click="sendCampaignNow" :disabled="!selectedCampaign.database">
                              <v-icon left>mdi-send</v-icon>
                              {{ t('campaigns.sendNow') }}
                            </v-btn>

                            <v-btn v-if="selectedCampaign.status === 'scheduled'" color="warning" variant="outlined"
                              @click="cancelScheduled">
                              <v-icon left>mdi-calendar-remove</v-icon>
                              {{ t('campaigns.cancelScheduling') }}
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
        <h3>{{ t('campaigns.emptyTitle') }}</h3>
        <p>{{ t('campaigns.emptyDescription') }}</p>
        <v-btn color="primary" @click="openCreateDialog">
          <v-icon left>mdi-plus</v-icon>
          {{ t('campaigns.createFirst') }}
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
          <h2>{{ t('campaigns.confirmDelete') }}</h2>
        </v-card-title>
        <v-card-text class="pa-6">
          <p>{{ t('campaigns.deleteConfirmQuestion', {name: campaignToDelete?.name}) }}</p>
          <p class="text-caption text-error">{{ t('campaigns.deleteIrreversible') }}</p>
        </v-card-text>
        <v-card-actions class="pa-6">
          <v-spacer />
          <v-btn variant="text" @click="deleteDialog = false">
            {{ t('campaigns.cancel') }}
          </v-btn>
          <v-btn color="error" variant="elevated" @click="deleteCampaign">
            {{ t('campaigns.deleteCampaign') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Database Selection Dialog -->
    <DatabaseSelectionDialog v-model="showDatabaseDialog" :campaign="selectedCampaign"
      @database-changed="updateCampaignDatabase" />

    <GeneralDialog 
      style="z-index: 0;"
      v-model="showHtmlEditor" 
      @update:model-value="val => showHtmlEditor = val"
      :title="t('campaigns.editHtmlContent')"
      :max-width="'1200px'"
      persistent 
      >
      <template #default>
            <editor
              :key="editorKey"
              api-key="2p3hkyrffhcego8910cy6tydhz46fsjjz1jst5bidxga9e58"
              v-model="htmlEditorContent"
              :init="editorConfig"
              :inline="false"
              style="height: 100%; margin: 0;"
            />
        </template>

            <template #actions>
      <v-spacer />
      <v-btn
        color="grey darken-1"
        variant="text"
        @click="cancelHtmlEdit"
      >
        Anuluj
      </v-btn>
      <v-btn
        color="primary"
        variant="elevated"
        @click="saveHtmlContent"
        :loading="loading"
      >
        Zapisz
      </v-btn>
    </template>
      </GeneralDialog>

    <!-- Snackbar for notifications -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="3000" top>
      {{ snackbar.message }}
      <template v-slot:actions>
        <v-btn variant="text" @click="snackbar.show = false">
            {{ t('campaigns.close') }}
          </v-btn>
      </template>
    </v-snackbar>
  </div>
</template>



<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import CampaignContent from '../components/campaigns/CampaignContent.vue'
import CampaignRecipients from '../components/campaigns/CampaignRecipients.vue'
import CampaignReplies from '../components/campaigns/CampaignReplies.vue'
import CampaignBounces from '../components/campaigns/CampaignBounces.vue'
import CampaignDialog from '../components/campaigns/CampaignDialog.vue'
import ScheduleDialog from '../components/campaigns/ScheduleDialog.vue'
import DatabaseSelectionDialog from '../components/campaigns/DatabaseSelectionDialog.vue'
import { Campaigns } from '../services/campaigns.js'
import { Databases } from '../services/databases.js'
import StatCard from '../components/StatCard.vue'
import PageContent from '../components/PageContent.vue'
import StatGrid from '../components/StatGrid.vue'
import Editor  from '@tinymce/tinymce-vue'
import GeneralDialog from '../components/GeneralDialog.vue'

const { t, locale } = useI18n()
const router = useRouter()
const route = useRoute()

// Get TinyMCE language code from current locale
const getTinyMCELanguage = () => {
  const languageMap = {
    'pl': 'pl',
    'en': 'en'
  }
  return languageMap[locale.value] || 'en'
}

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
const htmlEditorContent = ref('<p>Wprowadź treść kampanii...</p>')
const editorKey = ref(0)
const snackbar = ref({
  show: false,
  message: '',
  color: 'success'
})
const editorConfig = {
  height: 600,
  menubar: true, // Włączamy menubar dla większej funkcjonalności
  readonly: false,
  language: getTinyMCELanguage(),
  language_url: `/tinymce/langs/${getTinyMCELanguage()}.js`,
  
  // Rozszerzona lista pluginów
  plugins: [
    'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
    'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
    'insertdatetime', 'media', 'table', 'help', 'wordcount', 'emoticons',
    'template', 'textcolor', 'colorpicker', 'textpattern',
    'codesample', 'hr', 'pagebreak', 'nonbreaking', 'toc', 'imagetools',
    'quickbars', 'powerpaste', 'importcss'
  ],
  
  // Zaawansowany toolbar w wielu liniach
  toolbar1: 'undo redo | bold italic underline strikethrough | subscript superscript | removeformat |bullist numlist | blockquote hr nonbreaking pagebreak | link unlink anchor | image media table | insertdatetime charmap emoticons',
  toolbar2: 'fontselect fontsizeselect | forecolor backcolor | alignleft aligncenter alignright alignjustify | outdent indent | placeholder',
  
  // Konfiguracja menu
  menu: {
    file: { title: t('campaigns.menu.file'), items: 'newdocument restoredraft | preview | export print | deleteallconversations' },
    edit: { title: t('campaigns.menu.edit'), items: 'undo redo | cut copy paste pastetext | selectall | searchreplace' },
    view: { title: t('campaigns.menu.view'), items: 'code | visualaid visualchars visualblocks | spellchecker | preview fullscreen | showcomments' },
    insert: { title: t('campaigns.menu.insert'), items: 'image link media addcomment pageembed template codesample inserttable | charmap emoticons hr | pagebreak nonbreaking anchor tableofcontents | insertdatetime' },
    format: { title: t('campaigns.menu.format'), items: 'bold italic underline strikethrough superscript subscript codeformat | styles blocks fontfamily fontsize align lineheight | forecolor backcolor | language | removeformat' },
    tools: { title: t('campaigns.menu.tools'), items: 'spellchecker spellcheckerlanguage | a11ycheck code wordcount' },
    table: { title: t('campaigns.menu.table'), items: 'inserttable | cell row column | advtablesort | tableprops deletetable' }
  },
  
  // Konfiguracja obrazków
  image_advtab: true,
  image_caption: true,
  image_list: false,
  
  // Konfiguracja linków
  link_list: false,
  link_context_toolbar: true,
  
  // Konfiguracja tabel
  table_toolbar: 'tableprops tabledelete | tableinsertrowbefore tableinsertrowafter tabledeleterow | tableinsertcolbefore tableinsertcolafter tabledeletecol',
  table_appearance_options: true,
  table_grid: true,
  table_resize_bars: true,
  
  // Szybkie paski narzędzi
  quickbars_selection_toolbar: 'bold italic | quicklink h2 h3 blockquote quickimage quicktable',
  quickbars_insert_toolbar: 'quickimage quicktable | hr pagebreak',
  
  // Ustawienia czcionek
  font_formats: 'Arial=arial,helvetica,sans-serif; Courier New=courier new,courier,monospace; AkrutiKndPadmini=Akpdmi-n; Times New Roman=times new roman,times,serif; Verdana=verdana,geneva,sans-serif;',
  fontsize_formats: '8pt 10pt 12pt 14pt 16pt 18pt 24pt 36pt 48pt',
  
  // Szablony dla emaili marketingowych
  templates: [],
  
  // Konfiguracja wklejania
  paste_data_images: true,
  paste_as_text: false,
  paste_retain_style_properties: "color font-size font-family background-color text-decoration text-align",
  
  // Automatyczne wzorce tekstu
  textpattern_patterns: [
    {start: '*', end: '*', format: 'italic'},
    {start: '**', end: '**', format: 'bold'},
    {start: '#', format: 'h1'},
    {start: '##', format: 'h2'},
    {start: '###', format: 'h3'},
    {start: '1. ', cmd: 'InsertOrderedList'},
    {start: '* ', cmd: 'InsertUnorderedList'},
    {start: '- ', cmd: 'InsertUnorderedList'}
  ],
  
  // Sprawdzanie pisowni
  browser_spellcheck: true,
  
  setup: (editor) => {
    editor.on('init', () => {
      // TinyMCE 6+ udostępnia API przez editor.mode.set('design') zamiast legacy editor.setMode
      // Dodajemy zachowanie defensywne aby uniknąć błędu TypeError: editor.setMode is not a function
      try {
        if (editor.mode && typeof editor.mode.set === 'function') {
          editor.mode.set('design') // Wymuszenie trybu edycji (tryb edycji / design)
        } else if (typeof editor.setMode === 'function') {
          editor.setMode('design') // Kompatybilność ze starszym API
        } // Jeśli żaden nie istnieje, domyślny tryb już jest edycyjny przy readonly:false
      } catch (e) {
        console.warn('Nie udało się ustawić trybu edycji TinyMCE:', e)
      }
    })
    
    // Dodatkowe przyciski w toolbar
    editor.ui.registry.addButton('placeholder', {
      text: 'Placeholder',
      tooltip: 'Wstaw placeholder',
      onAction: () => {
        const placeholders = [
          '{{CONTACT_FIRST_NAME}}',
          '{{CONTACT_LAST_NAME}}', 
          '{{CONTACT_EMAIL}}',
          '{{COMPANY_NAME}}',
          '{{COMPANY_ADDRESS}}',
          '{{UNSUBSCRIBE_LINK}}',
          '{{CAMPAIGN_NAME}}'
        ]
        
        editor.windowManager.open({
          title: 'Wybierz placeholder',
          body: {
            type: 'panel',
            items: [{
              type: 'selectbox',
              name: 'placeholder',
              label: 'Placeholder:',
              items: placeholders.map(p => ({ text: p, value: p }))
            }]
          },
          buttons: [
            {
              type: 'cancel',
              text: 'Anuluj'
            },
            {
              type: 'submit',
              text: 'Wstaw',
              primary: true
            }
          ],
          onSubmit: (api) => {
            const data = api.getData()
            editor.insertContent(data.placeholder)
            api.close()
          }
        })
      }
    })
  },
  
  // Style CSS dla treści
  content_style: `
    body { 
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
      font-size: 14px; 
      line-height: 1.6;
      color: #333;
      margin: 20px;
    }
    .email-container { 
      max-width: 600px; 
      margin: 0 auto; 
      border: 1px solid #ddd;
      border-radius: 8px;
      overflow: hidden;
    }
    h1, h2, h3 { 
      color: #2c3e50; 
      margin-top: 0;
    }
    p { 
      margin-bottom: 16px; 
    }
    a { 
      color: #007bff; 
      text-decoration: underline;
    }
    table { 
      border-collapse: collapse; 
      width: 100%; 
    }
    td, th { 
      border: 1px solid #ddd; 
      padding: 8px; 
      text-align: left;
    }
    th { 
      background-color: #f2f2f2; 
      font-weight: bold;
    }
    blockquote { 
      border-left: 4px solid #007bff; 
      padding-left: 16px; 
      margin: 16px 0;
      font-style: italic;
    }
    code { 
      background-color: #f4f4f4; 
      padding: 2px 4px; 
      border-radius: 3px;
      font-family: 'Courier New', monospace;
    }
  `,
  
  // Ustawienia dodatkowe
  resize: true,
  statusbar: true,
  elementpath: true,
  branding: false,
  promotion: false
}

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
    const databaseInfo = await Databases.getDatabaseInfoById(campaign.databaseId)
    selectedCampaign.value = { ...fullCampaignData, databaseInfo, sendMode: "scheduled" }
    activeTab.value = 'content'
  } catch (error) {
    console.error('Błąd pobierania szczegółów kampanii:', error)
    showNotification('Nie udało się pobrać pełnych szczegółów kampanii. Pokazano podstawowe informacje.', 'warning')
    // Fallback do danych z listy
    selectedCampaign.value = {...campaign, sendMode: "scheduled" }
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
    selectedCampaign.value.dateStart = scheduleData.sendAt
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

async function updateCampaign(updatedData) {
  if (!selectedCampaign.value) return

  try {
    const updatedCampaign = await Campaigns.update(selectedCampaign.value.id, updatedData)

    // Update local copy
    selectedCampaign.value = { ...selectedCampaign.value, ...updatedCampaign }

    // Update campaign in the list
    const index = campaigns.value.findIndex(c => c.id === selectedCampaign.value.id)
    if (index !== -1) {
      campaigns.value[index] = { ...campaigns.value[index], ...updatedCampaign }
    }

    showNotification('Kampania została zaktualizowana', 'success')
  } catch (error) {
    console.error('Błąd aktualizacji kampanii:', error)
    showNotification('Nie udało się zaktualizować kampanii', 'error')
  }
}

async function editHtmlContent() {
  if (selectedCampaign.value) {
    console.log('Otwieranie edytora HTML dla kampanii:', selectedCampaign.value.name)
    
    // Wyciągnij treść <body> lub użyj całej zawartości, jeśli nie ma <body>
    htmlEditorContent.value = selectedCampaign.value.htmlContent || '<p>Wprowadź treść kampanii...</p>'
    
    // Zwiększ klucz edytora, aby wymusić ponowne renderowanie
    editorKey.value++
    await nextTick()
    // Pokaż dialog/modal (jeśli używasz)
    showHtmlEditor.value = true


    console.log('Ustawiono zawartość edytora:', htmlEditorContent.value)
  }
}

async function saveHtmlContent() {
  if (!selectedCampaign.value) return

  try {

    const htmlContent = htmlEditorContent.value

    // Aktualizuj kampanię z nową zawartością HTML
    const updatedCampaign = await Campaigns.update(selectedCampaign.value.id, {
      htmlContent: htmlContent
    })

    selectCampaign(updatedCampaign)

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
      selectedCampaign.value.dateStart = null
      scheduledDateTime.value = ''
    }
    // Update campaign via API
    updateCampaignScheduling()
  }
}

function updateScheduledDate(dateTime) {
  if (selectedCampaign.value && dateTime) {
    selectedCampaign.value.dateStart = new Date(dateTime)
    updateCampaignScheduling()
  }
}

async function updateCampaignScheduling() {
  if (!selectedCampaign.value) return

  try {
    // Update campaign scheduling via API
    await Campaigns.update(selectedCampaign.value.id, {
      sendMode: selectedCampaign.value.sendMode,
      dateStart: selectedCampaign.value.dateStart
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

  selectedCampaign.value.sendMode = 'scheduled'
  selectedCampaign.value.status = 'draft'
  selectedCampaign.value.dateStart = null
  scheduledDateTime.value = ''

  updateCampaignScheduling()
}

function formatDateTime(date) {
  if (!date) return '-'
  return new Date(date).toLocaleString('pl-PL')
}

function updateCampaignDatabase(updatedCampaign) {
  // Update selected campaign with new database
  console.log('Aktualizacja bazy danych kampanii:', updatedCampaign)
  Databases.getDatabaseInfoById(updatedCampaign.databaseId)
  .then(databaseInfo => {
    selectedCampaign.value = { ...updatedCampaign, databaseInfo, sendMode: 'scheduled' }
      // Update campaign in local list
  const index = campaigns.value.findIndex(c => c.id === updatedCampaign.id)
  if (index !== -1) {
    campaigns.value[index] = { ...campaigns.value[index], ...selectedCampaign.value }
  }

  // Show success message
  showNotification(`Baza danych została zaktualizowana na: ${updatedCampaign.database?.name || 'Nowa baza'}`, 'success')

  })
  

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
watch(() => selectedCampaign.value?.dateStart, (newScheduledAt) => {
  if (newScheduledAt) {
    const date = new Date(newScheduledAt)
    scheduledDateTime.value = date.toISOString().slice(0, 16)
  } else {
    scheduledDateTime.value = ''
  }
}, { immediate: true })

// Watch for language changes and update editor configuration
watch(() => locale.value, (newLocale) => {
  // Update editor language configuration when app language changes
  editorConfig.language = getTinyMCELanguage()
  editorConfig.language_url = `/tinymce/langs/${getTinyMCELanguage()}.js`
  
  // Force editor re-render if editor is open
  if (showHtmlEditor.value) {
    editorKey.value++
  }
})

// Sample data
onMounted(async () => {
  try {
    campaigns.value = await Campaigns.getList()
  } catch (err) {
    // Fallback to sample data
    campaigns.value = []
  }

  // Sprawdź czy jest parametr selectedCampaign z query
  let selectedCampaignId = route.query.selectedCampaign;
  if (!selectedCampaignId && campaigns.value.length > 0) {
    selectedCampaignId = campaigns.value[0].id;
  }
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
  border-radius: 8px !important;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08) !important;
  border: 1px solid #e0e0e0 !important;
  background: #ffffff !important;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.card-header {
  background: #fafafa !important;
  color: #1a1a2e !important;
  border-bottom: 1px solid #e0e0e0 !important;
  border-radius: 8px 8px 0 0 !important;
  padding: 10px 14px !important;
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
  background: #6366f1 !important;
  color: #ffffff !important;
  border: none !important;
  box-shadow: 0 1px 2px rgba(99, 102, 241, 0.3) !important;
}

.campaign-list-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.search-section {
  padding: 10px 12px;
  border-bottom: 1px solid #eee;
  flex-shrink: 0;
}

.filter-chips {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-top: 8px;
}

.campaign-list {
  flex: 1;
  overflow-y: auto;
  min-height: 0;
  /* Important for flex scrolling */
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
  padding: 10px 12px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: all 0.15s ease;
}

.campaign-item:hover {
  background: rgba(81, 91, 173, 0.05);
}

.campaign-item.selected {
  background: #e8eaf6;
  border-left: 3px solid #6366f1;
}

.campaign-icon {
  margin-right: 10px;
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #eef2ff;
  border-radius: 6px;
}

.campaign-info {
  flex: 1;
  min-width: 0;
}

.campaign-name {
  font-weight: 600;
  margin: 0;
  font-size: 0.9rem;
}

.campaign-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 2px;
  font-size: 0.78rem;
  color: #718096;
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
  border-radius: 8px !important;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08) !important;
  border: 1px solid #e0e0e0 !important;
  background: #ffffff !important;
}

/* Loading State */
.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 50vh;
  background: #ffffff;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
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
  background: #ffffff;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
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
  border-radius: 8px !important;
}

.delete-header {
  background: #fef2f2 !important;
  color: #991b1b !important;
  border-radius: 8px 8px 0 0 !important;
  border-bottom: 1px solid #fecaca !important;
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