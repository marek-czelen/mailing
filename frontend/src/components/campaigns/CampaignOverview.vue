<template>
  <div class="campaign-overview">
    <!-- Campaign Header -->
    <div class="overview-header">
      <div class="campaign-info">
        <h2>{{ campaign.name }}</h2>
        <p class="campaign-subject">{{ campaign.subject }}</p>
        <div class="campaign-meta">
          <div class="meta-item">
            <v-icon size="16" color="grey">mdi-calendar</v-icon>
            <span>Utworzona: {{ formatDate(campaign.createdAt) }}</span>
          </div>
          <div class="meta-item" v-if="campaign.sentAt">
            <v-icon size="16" color="success">mdi-email-send</v-icon>
            <span>Wysłana: {{ formatDate(campaign.sentAt) }}</span>
          </div>
          <div class="meta-item" v-if="campaign.scheduledAt && campaign.status === 'scheduled'">
            <v-icon size="16" color="warning">mdi-calendar-clock</v-icon>
            <span>Zaplanowana: {{ formatDate(campaign.scheduledAt) }}</span>
          </div>
        </div>
      </div>
      <div class="campaign-actions">
        <v-btn 
          variant="outlined" 
          size="small"
          @click="$emit('edit', campaign)"
        >
          <v-icon left>mdi-pencil</v-icon>
          Edytuj
        </v-btn>
      </div>
    </div>

    <!-- Campaign Details Grid -->
    <div class="details-grid">
      <!-- Basic Information Card -->
      <v-card class="detail-card">
        <v-card-title class="card-title">
          <v-icon color="primary">mdi-information</v-icon>
          Podstawowe informacje
        </v-card-title>
        <v-card-text>
          <div class="detail-row">
            <span class="detail-label">Typ kampanii:</span>
            <v-chip size="small" :color="getTypeColor(campaign.type)" variant="elevated">
              {{ getTypeLabel(campaign.type) }}
            </v-chip>
          </div>
          <div class="detail-row">
            <span class="detail-label">Priorytet:</span>
            <v-chip size="small" :color="getPriorityColor(campaign.priority)" variant="outlined">
              {{ getPriorityLabel(campaign.priority) }}
            </v-chip>
          </div>
          <div class="detail-row">
            <span class="detail-label">Status:</span>
            <v-chip size="small" :color="getStatusColor(campaign.status)" variant="elevated">
              {{ getStatusLabel(campaign.status) }}
            </v-chip>
          </div>
          <div v-if="campaign.description" class="detail-row">
            <span class="detail-label">Opis:</span>
            <span class="detail-value">{{ campaign.description }}</span>
          </div>
        </v-card-text>
      </v-card>

      <!-- Sender Information Card -->
      <v-card class="detail-card">
        <v-card-title class="card-title">
          <v-icon color="info">mdi-account-circle</v-icon>
          Nadawca
        </v-card-title>
        <v-card-text>
          <div class="detail-row">
            <span class="detail-label">Nazwa:</span>
            <span class="detail-value">{{ campaign.senderName || 'Nie ustawiono' }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Email:</span>
            <span class="detail-value">{{ campaign.senderEmail || 'Nie ustawiono' }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Odpowiedz do:</span>
            <span class="detail-value">{{ campaign.replyTo || 'Nie ustawiono' }}</span>
          </div>
        </v-card-text>
      </v-card>

      <!-- Recipients Information Card -->
      <v-card class="detail-card">
        <v-card-title class="card-title">
          <v-icon color="success">mdi-account-group</v-icon>
          Odbiorcy
        </v-card-title>
        <v-card-text>
          <div class="detail-row">
            <span class="detail-label">Baza danych:</span>
            <span class="detail-value">{{ campaign.database || 'Nie wybrano' }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Segmenty:</span>
            <div v-if="campaign.segments?.length" class="segments-chips">
              <v-chip
                v-for="segment in campaign.segments"
                :key="segment"
                size="small"
                variant="outlined"
                class="mr-1 mb-1"
              >
                {{ segment }}
              </v-chip>
            </div>
            <span v-else class="detail-value">Cała baza danych</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Liczba odbiorców:</span>
            <span class="detail-value highlight">{{ campaign.recipientsCount?.toLocaleString('pl-PL') || 0 }}</span>
          </div>
        </v-card-text>
      </v-card>

      <!-- Content Information Card -->
      <v-card class="detail-card">
        <v-card-title class="card-title">
          <v-icon color="warning">mdi-email-variant</v-icon>
          Treść
        </v-card-title>
        <v-card-text>
          <div class="detail-row">
            <span class="detail-label">Szablon:</span>
            <span class="detail-value">{{ campaign.template || 'Niestandardowy' }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Temat:</span>
            <span class="detail-value font-weight-medium">"{{ campaign.subject }}"</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Śledzenie otwarć:</span>
            <v-icon 
              :color="campaign.trackOpens ? 'success' : 'grey'" 
              size="20"
            >
              {{ campaign.trackOpens ? 'mdi-check-circle' : 'mdi-close-circle' }}
            </v-icon>
          </div>
          <div class="detail-row">
            <span class="detail-label">Śledzenie kliknięć:</span>
            <v-icon 
              :color="campaign.trackClicks ? 'success' : 'grey'" 
              size="20"
            >
              {{ campaign.trackClicks ? 'mdi-check-circle' : 'mdi-close-circle' }}
            </v-icon>
          </div>
        </v-card-text>
      </v-card>
    </div>

    <!-- Performance Summary (tylko dla wysłanych kampanii) -->
    <div v-if="campaign.status === 'sent'" class="performance-summary">
      <v-card class="summary-card">
        <v-card-title class="card-title">
          <v-icon color="primary">mdi-chart-line</v-icon>
          Podsumowanie wyników
        </v-card-title>
        <v-card-text>
          <div class="performance-grid">
            <div class="performance-item">
              <div class="performance-value">{{ campaign.sentCount?.toLocaleString('pl-PL') || 0 }}</div>
              <div class="performance-label">Wysłanych</div>
              <div class="performance-percentage">100%</div>
            </div>
            
            <div class="performance-item">
              <div class="performance-value">
                {{ Math.floor((campaign.sentCount * campaign.openRate / 100) || 0).toLocaleString('pl-PL') }}
              </div>
              <div class="performance-label">Otwartych</div>
              <div class="performance-percentage success">{{ campaign.openRate || 0 }}%</div>
            </div>
            
            <div class="performance-item">
              <div class="performance-value">
                {{ Math.floor((campaign.sentCount * campaign.clickRate / 100) || 0).toLocaleString('pl-PL') }}
              </div>
              <div class="performance-label">Kliknięć</div>
              <div class="performance-percentage info">{{ campaign.clickRate || 0 }}%</div>
            </div>
            
            <div class="performance-item">
              <div class="performance-value">
                {{ Math.floor((campaign.sentCount * 0.02) || 0).toLocaleString('pl-PL') }}
              </div>
              <div class="performance-label">Odbić</div>
              <div class="performance-percentage warning">2%</div>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </div>

    <!-- Campaign Timeline -->
    <div class="campaign-timeline">
      <v-card class="timeline-card">
        <v-card-title class="card-title">
          <v-icon color="info">mdi-timeline</v-icon>
          Historia kampanii
        </v-card-title>
        <v-card-text>
          <div class="timeline">
            <div class="timeline-item">
              <div class="timeline-icon created">
                <v-icon size="16" color="white">mdi-plus</v-icon>
              </div>
              <div class="timeline-content">
                <div class="timeline-title">Kampania utworzona</div>
                <div class="timeline-date">{{ formatDateTime(campaign.createdAt) }}</div>
              </div>
            </div>
            
            <div v-if="campaign.updatedAt && campaign.updatedAt !== campaign.createdAt" class="timeline-item">
              <div class="timeline-icon updated">
                <v-icon size="16" color="white">mdi-pencil</v-icon>
              </div>
              <div class="timeline-content">
                <div class="timeline-title">Ostatnia modyfikacja</div>
                <div class="timeline-date">{{ formatDateTime(campaign.updatedAt) }}</div>
              </div>
            </div>
            
            <div v-if="campaign.scheduledAt && campaign.status === 'scheduled'" class="timeline-item">
              <div class="timeline-icon scheduled">
                <v-icon size="16" color="white">mdi-calendar-clock</v-icon>
              </div>
              <div class="timeline-content">
                <div class="timeline-title">Zaplanowana wysyłka</div>
                <div class="timeline-date">{{ formatDateTime(campaign.scheduledAt) }}</div>
              </div>
            </div>
            
            <div v-if="campaign.sentAt" class="timeline-item">
              <div class="timeline-icon sent">
                <v-icon size="16" color="white">mdi-send</v-icon>
              </div>
              <div class="timeline-content">
                <div class="timeline-title">Kampania wysłana</div>
                <div class="timeline-date">{{ formatDateTime(campaign.sentAt) }}</div>
              </div>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'

defineProps({
  campaign: {
    type: Object,
    required: true
  }
})

defineEmits(['edit'])

// Methods
function formatDate(date) {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('pl-PL')
}

function formatDateTime(date) {
  if (!date) return '-'
  return new Date(date).toLocaleString('pl-PL')
}

function getTypeColor(type) {
  const colors = {
    newsletter: 'primary',
    promotion: 'warning',
    welcome: 'success',
    transactional: 'info',
    notification: 'purple',
    survey: 'teal',
    other: 'grey'
  }
  return colors[type] || 'grey'
}

function getTypeLabel(type) {
  const labels = {
    newsletter: 'Newsletter',
    promotion: 'Promocja',
    welcome: 'Powitalny',
    transactional: 'Transakcyjny',
    notification: 'Powiadomienie',
    survey: 'Ankieta',
    other: 'Inne'
  }
  return labels[type] || type
}

function getPriorityColor(priority) {
  const colors = {
    low: 'success',
    normal: 'info',
    high: 'warning',
    urgent: 'error'
  }
  return colors[priority] || 'info'
}

function getPriorityLabel(priority) {
  const labels = {
    low: 'Niska',
    normal: 'Normalna',
    high: 'Wysoka',
    urgent: 'Pilna'
  }
  return labels[priority] || priority
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

function getStatusLabel(status) {
  const labels = {
    draft: 'Szkic',
    scheduled: 'Zaplanowana',
    sent: 'Wysłana',
    active: 'Aktywna'
  }
  return labels[status] || status
}
</script>

<style scoped>
.campaign-overview {
  width: 100%;
}

.overview-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 12px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.campaign-info h2 {
  margin: 0 0 8px 0;
  font-weight: 600;
  color: #333;
}

.campaign-subject {
  font-size: 1.1rem;
  color: #666;
  font-style: italic;
  margin: 0 0 12px 0;
}

.campaign-meta {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.9rem;
  color: #666;
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.detail-card {
  border-radius: 12px !important;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08) !important;
  border: 1px solid rgba(255, 255, 255, 0.2) !important;
  background: rgba(255, 255, 255, 0.9) !important;
  backdrop-filter: blur(10px) !important;
}

.card-title {
  background: linear-gradient(135deg, rgba(32, 41, 80, 0.05) 0%, rgba(81, 91, 173, 0.05) 100%);
  font-weight: 600 !important;
  font-size: 1rem !important;
  padding: 16px 20px !important;
  display: flex !important;
  align-items: center !important;
  gap: 8px !important;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-label {
  font-weight: 500;
  color: #666;
  flex-shrink: 0;
  margin-right: 16px;
}

.detail-value {
  color: #333;
  text-align: right;
  flex: 1;
}

.detail-value.highlight {
  font-weight: 600;
  color: #202950;
}

.segments-chips {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 4px;
}

.performance-summary {
  margin-bottom: 24px;
}

.summary-card {
  border-radius: 12px !important;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08) !important;
  border: 1px solid rgba(255, 255, 255, 0.2) !important;
  background: rgba(255, 255, 255, 0.9) !important;
  backdrop-filter: blur(10px) !important;
}

.performance-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 20px;
}

.performance-item {
  text-align: center;
  padding: 16px;
  background: #f8f9ff;
  border-radius: 8px;
}

.performance-value {
  font-size: 2rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 4px;
}

.performance-label {
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 8px;
}

.performance-percentage {
  font-size: 1.1rem;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 4px;
  background: #e0e0e0;
  color: #666;
}

.performance-percentage.success {
  background: #e8f5e8;
  color: #2e7d32;
}

.performance-percentage.info {
  background: #e3f2fd;
  color: #1976d2;
}

.performance-percentage.warning {
  background: #fff3e0;
  color: #f57c00;
}

.campaign-timeline {
  margin-bottom: 24px;
}

.timeline-card {
  border-radius: 12px !important;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08) !important;
  border: 1px solid rgba(255, 255, 255, 0.2) !important;
  background: rgba(255, 255, 255, 0.9) !important;
  backdrop-filter: blur(10px) !important;
}

.timeline {
  position: relative;
  padding-left: 32px;
}

.timeline::before {
  content: '';
  position: absolute;
  left: 20px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: linear-gradient(to bottom, #515bad, #9395fa);
}

.timeline-item {
  position: relative;
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.timeline-item:last-child {
  margin-bottom: 0;
}

.timeline-icon {
  position: absolute;
  left: -32px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.timeline-icon.created {
  background: linear-gradient(135deg, #4caf50 0%, #66bb6a 100%);
}

.timeline-icon.updated {
  background: linear-gradient(135deg, #2196f3 0%, #42a5f5 100%);
}

.timeline-icon.scheduled {
  background: linear-gradient(135deg, #ff9800 0%, #ffb74d 100%);
}

.timeline-icon.sent {
  background: linear-gradient(135deg, #202950 0%, #515bad 100%);
}

.timeline-content {
  background: white;
  padding: 12px 16px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  border: 1px solid #f0f0f0;
  width: 100%;
}

.timeline-title {
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

.timeline-date {
  font-size: 0.85rem;
  color: #666;
}

@media (max-width: 768px) {
  .overview-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  
  .campaign-meta {
    flex-direction: column;
    gap: 8px;
  }
  
  .details-grid {
    grid-template-columns: 1fr;
  }
  
  .performance-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>