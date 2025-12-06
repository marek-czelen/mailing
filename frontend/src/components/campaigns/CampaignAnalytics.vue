<template>
  <div class="campaign-analytics">
    <div class="analytics-header">
      <div class="header-info">
        <h3>{{ t('campaigns.analytics') }}</h3>
        <p>{{ t('campaigns.analyticsDesc') }}</p>
      </div>
      <div class="header-actions">
        <v-btn color="info" variant="outlined" @click="exportReport">
          <v-icon left>mdi-download</v-icon>
          {{ t('campaigns.exportReport') }}
        </v-btn>
        <v-btn color="primary" @click="refreshData">
          <v-icon left>mdi-refresh</v-icon>
          {{ t('campaigns.refreshData') }}
        </v-btn>
      </div>
    </div>

    <div class="analytics-grid">
      <!-- Performance Overview -->
      <v-card class="performance-card">
        <v-card-title class="card-title">
          <v-icon color="success">mdi-chart-line</v-icon>
          {{ t('campaigns.performanceOverview') }}
        </v-card-title>
        <v-card-text>
          <div class="performance-stats">
            <div class="performance-item">
              <div class="perf-icon">
                <v-icon color="primary" size="32">mdi-send</v-icon>
              </div>
              <div class="perf-details">
                <div class="perf-value">{{ analytics.sent.toLocaleString() }}</div>
                <div class="perf-label">{{ t('campaigns.sent') }}</div>
                <div class="perf-change positive">
                  <v-icon size="14">mdi-trending-up</v-icon>
                  +{{ analytics.sentGrowth }}%
                </div>
              </div>
            </div>

            <div class="performance-item">
              <div class="perf-icon">
                <v-icon color="success" size="32">mdi-email-open</v-icon>
              </div>
              <div class="perf-details">
                <div class="perf-value">{{ analytics.opens.toLocaleString() }}</div>
                <div class="perf-label">{{ t('campaigns.opens') }}</div>
                <div class="perf-rate">{{ analytics.openRate }}%</div>
              </div>
            </div>

            <div class="performance-item">
              <div class="perf-icon">
                <v-icon color="info" size="32">mdi-cursor-default-click</v-icon>
              </div>
              <div class="perf-details">
                <div class="perf-value">{{ analytics.clicks.toLocaleString() }}</div>
                <div class="perf-label">{{ t('campaigns.clicks') }}</div>
                <div class="perf-rate">{{ analytics.clickRate }}%</div>
              </div>
            </div>

            <div class="performance-item">
              <div class="perf-icon">
                <v-icon color="warning" size="32">mdi-bounce</v-icon>
              </div>
              <div class="perf-details">
                <div class="perf-value">{{ analytics.bounces.toLocaleString() }}</div>
                <div class="perf-label">{{ t('campaigns.rejections') }}</div>
                <div class="perf-rate">{{ analytics.bounceRate }}%</div>
              </div>
            </div>

            <div class="performance-item">
              <div class="perf-icon">
                <v-icon color="error" size="32">mdi-account-minus</v-icon>
              </div>
              <div class="perf-details">
                <div class="perf-value">{{ analytics.unsubscribes.toLocaleString() }}</div>
                <div class="perf-label">{{ t('campaigns.unsubscribes') }}</div>
                <div class="perf-rate">{{ analytics.unsubscribeRate }}%</div>
              </div>
            </div>

            <div class="performance-item">
              <div class="perf-icon">
                <v-icon color="purple" size="32">mdi-share</v-icon>
              </div>
              <div class="perf-details">
                <div class="perf-value">{{ analytics.shares.toLocaleString() }}</div>
                <div class="perf-label">Udostępnienia</div>
                <div class="perf-rate">{{ analytics.shareRate }}%</div>
              </div>
            </div>
          </div>
        </v-card-text>
      </v-card>

      <!-- Engagement Timeline -->
      <v-card class="timeline-card">
        <v-card-title class="card-title">
          <v-icon color="info">mdi-timeline</v-icon>
          Oś czasu zaangażowania
        </v-card-title>
        <v-card-text>
          <div class="timeline-controls">
            <v-btn-toggle v-model="timelineRange" mandatory>
              <v-btn value="24h" size="small">24h</v-btn>
              <v-btn value="7d" size="small">7 dni</v-btn>
              <v-btn value="30d" size="small">30 dni</v-btn>
            </v-btn-toggle>
          </div>
          
          <div class="timeline-chart">
            <div class="chart-area">
              <div 
                v-for="(point, index) in timelineData" 
                :key="index"
                class="chart-point"
                :style="{ 
                  left: (index / (timelineData.length - 1)) * 100 + '%',
                  bottom: (point.opens / maxOpens) * 100 + '%'
                }"
                @mouseenter="showTooltip(point, $event)"
                @mouseleave="hideTooltip"
              >
                <div class="point-marker opens"></div>
              </div>
              
              <div 
                v-for="(point, index) in timelineData" 
                :key="`clicks-${index}`"
                class="chart-point"
                :style="{ 
                  left: (index / (timelineData.length - 1)) * 100 + '%',
                  bottom: (point.clicks / maxClicks) * 100 + '%'
                }"
              >
                <div class="point-marker clicks"></div>
              </div>
            </div>
            
            <div class="chart-legend">
              <div class="legend-item">
                <div class="legend-marker opens"></div>
                <span>Otwarcia</span>
              </div>
              <div class="legend-item">
                <div class="legend-marker clicks"></div>
                <span>Kliknięcia</span>
              </div>
            </div>
          </div>
          
          <!-- Tooltip -->
          <div v-if="tooltip.show" class="chart-tooltip" :style="tooltip.style">
            <div><strong>{{ tooltip.time }}</strong></div>
            <div>Otwarcia: {{ tooltip.opens }}</div>
            <div>Kliknięcia: {{ tooltip.clicks }}</div>
          </div>
        </v-card-text>
      </v-card>

      <!-- Geographic Distribution -->
      <v-card class="geographic-card">
        <v-card-title class="card-title">
          <v-icon color="warning">mdi-earth</v-icon>
          Rozkład geograficzny
        </v-card-title>
        <v-card-text>
          <div class="geographic-list">
            <div 
              v-for="location in geographicData" 
              :key="location.country"
              class="location-item"
            >
              <div class="location-info">
                <div class="country-flag">
                  <span class="fi" :class="`fi-${location.code}`"></span>
                </div>
                <div class="country-details">
                  <div class="country-name">{{ location.country }}</div>
                  <div class="country-stats">
                    {{ location.opens }} otwarć • {{ location.clicks }} kliknięć
                  </div>
                </div>
              </div>
              <div class="location-percentage">
                <div class="percentage-bar">
                  <div 
                    class="percentage-fill" 
                    :style="{ width: location.percentage + '%' }"
                  ></div>
                </div>
                <span>{{ location.percentage }}%</span>
              </div>
            </div>
          </div>
        </v-card-text>
      </v-card>

      <!-- Device & Client Stats -->
      <v-card class="devices-card">
        <v-card-title class="card-title">
          <v-icon color="purple">mdi-devices</v-icon>
          Urządzenia i klienci email
        </v-card-title>
        <v-card-text>
          <div class="device-tabs">
            <v-btn-toggle v-model="deviceTab" mandatory>
              <v-btn value="devices" size="small">Urządzenia</v-btn>
              <v-btn value="clients" size="small">Klienci</v-btn>
            </v-btn-toggle>
          </div>
          
          <div v-if="deviceTab === 'devices'" class="device-stats">
            <div 
              v-for="device in deviceData" 
              :key="device.type"
              class="device-item"
            >
              <div class="device-icon">
                <v-icon :color="getDeviceColor(device.type)">
                  {{ getDeviceIcon(device.type) }}
                </v-icon>
              </div>
              <div class="device-info">
                <div class="device-name">{{ device.name }}</div>
                <div class="device-percentage">{{ device.percentage }}%</div>
              </div>
              <div class="device-bar">
                <div 
                  class="device-fill" 
                  :style="{ 
                    width: device.percentage + '%',
                    backgroundColor: getDeviceColor(device.type)
                  }"
                ></div>
              </div>
            </div>
          </div>
          
          <div v-else class="client-stats">
            <div 
              v-for="client in clientData" 
              :key="client.name"
              class="client-item"
            >
              <div class="client-info">
                <div class="client-name">{{ client.name }}</div>
                <div class="client-count">{{ client.opens }} otwarć</div>
              </div>
              <div class="client-percentage">{{ client.percentage }}%</div>
            </div>
          </div>
        </v-card-text>
      </v-card>

      <!-- Link Performance -->
      <v-card class="links-card">
        <v-card-title class="card-title">
          <v-icon color="indigo">mdi-link</v-icon>
          Wydajność linków
        </v-card-title>
        <v-card-text>
          <div class="links-list">
            <div 
              v-for="link in linkData" 
              :key="link.id"
              class="link-item"
            >
              <div class="link-info">
                <div class="link-url">{{ link.url }}</div>
                <div class="link-label">{{ link.label }}</div>
              </div>
              <div class="link-stats">
                <div class="link-clicks">
                  <v-icon size="16" color="info">mdi-cursor-default-click</v-icon>
                  {{ link.clicks }}
                </div>
                <div class="link-rate">{{ link.clickRate }}%</div>
              </div>
            </div>
          </div>
          
          <div v-if="linkData.length === 0" class="no-links">
            <v-icon size="48" color="grey-lighten-2">mdi-link-off</v-icon>
            <h4>Brak śledzonych linków</h4>
            <p>W tej kampanii nie ma linków do śledzenia</p>
          </div>
        </v-card-text>
      </v-card>

      <!-- Comparison -->
      <v-card class="comparison-card">
        <v-card-title class="card-title">
          <v-icon color="teal">mdi-compare</v-icon>
          Porównanie z poprzednimi kampaniami
        </v-card-title>
        <v-card-text>
          <div class="comparison-metrics">
            <div class="metric-comparison">
              <div class="metric-label">Współczynnik otwarć</div>
              <div class="metric-values">
                <div class="current-value">{{ analytics.openRate }}%</div>
                <div class="comparison-indicator" :class="getComparisonClass(analytics.openRate, 22.5)">
                  <v-icon size="14">{{ getComparisonIcon(analytics.openRate, 22.5) }}</v-icon>
                  {{ getComparisonText(analytics.openRate, 22.5) }}%
                </div>
                <div class="average-value">Średnia: 22.5%</div>
              </div>
            </div>

            <div class="metric-comparison">
              <div class="metric-label">Współczynnik kliknięć</div>
              <div class="metric-values">
                <div class="current-value">{{ analytics.clickRate }}%</div>
                <div class="comparison-indicator" :class="getComparisonClass(analytics.clickRate, 6.8)">
                  <v-icon size="14">{{ getComparisonIcon(analytics.clickRate, 6.8) }}</v-icon>
                  {{ getComparisonText(analytics.clickRate, 6.8) }}%
                </div>
                <div class="average-value">Średnia: 6.8%</div>
              </div>
            </div>

            <div class="metric-comparison">
              <div class="metric-label">Współczynnik wypisań</div>
              <div class="metric-values">
                <div class="current-value">{{ analytics.unsubscribeRate }}%</div>
                <div class="comparison-indicator" :class="getComparisonClass(2.1, analytics.unsubscribeRate, true)">
                  <v-icon size="14">{{ getComparisonIcon(2.1, analytics.unsubscribeRate, true) }}</v-icon>
                  {{ getComparisonText(2.1, analytics.unsubscribeRate, true) }}%
                </div>
                <div class="average-value">Średnia: 2.1%</div>
              </div>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, defineProps, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

defineProps({
  campaign: {
    type: Object,
    required: true
  }
})

// Reactive data
const timelineRange = ref('24h')
const deviceTab = ref('devices')
const tooltip = ref({
  show: false,
  style: {},
  time: '',
  opens: 0,
  clicks: 0
})

// Analytics data
const analytics = ref({
  sent: 15420,
  opens: 3785,
  clicks: 1247,
  bounces: 89,
  unsubscribes: 23,
  shares: 156,
  openRate: 24.5,
  clickRate: 8.1,
  bounceRate: 0.6,
  unsubscribeRate: 0.15,
  shareRate: 1.0,
  sentGrowth: 12.3
})

// Timeline data
const timelineData = ref([
  { time: '00:00', opens: 45, clicks: 12 },
  { time: '03:00', opens: 23, clicks: 6 },
  { time: '06:00', opens: 89, clicks: 28 },
  { time: '09:00', opens: 234, clicks: 89 },
  { time: '12:00', opens: 456, clicks: 178 },
  { time: '15:00', opens: 321, clicks: 134 },
  { time: '18:00', opens: 567, clicks: 201 },
  { time: '21:00', opens: 398, clicks: 156 }
])

// Geographic data
const geographicData = ref([
  { country: 'Polska', code: 'pl', opens: 2145, clicks: 789, percentage: 65.2 },
  { country: 'Niemcy', code: 'de', opens: 456, clicks: 167, percentage: 13.8 },
  { country: 'Czechy', code: 'cz', opens: 234, clicks: 89, percentage: 7.1 },
  { country: 'Słowacja', code: 'sk', opens: 189, clicks: 67, percentage: 5.7 },
  { country: 'Inne', code: 'xx', opens: 267, clicks: 98, percentage: 8.2 }
])

// Device data
const deviceData = ref([
  { type: 'mobile', name: 'Urządzenia mobilne', percentage: 68.5 },
  { type: 'desktop', name: 'Komputery stacjonarne', percentage: 24.8 },
  { type: 'tablet', name: 'Tablety', percentage: 6.7 }
])

// Client data
const clientData = ref([
  { name: 'Gmail', opens: 1456, percentage: 38.5 },
  { name: 'Outlook', opens: 987, percentage: 26.1 },
  { name: 'Apple Mail', opens: 654, percentage: 17.3 },
  { name: 'Yahoo Mail', opens: 345, percentage: 9.1 },
  { name: 'Inne', opens: 343, percentage: 9.0 }
])

// Link data
const linkData = ref([
  { 
    id: 1, 
    url: 'https://example.com/promo', 
    label: 'Główny CTA', 
    clicks: 456, 
    clickRate: 36.6 
  },
  { 
    id: 2, 
    url: 'https://example.com/products', 
    label: 'Zobacz produkty', 
    clicks: 234, 
    clickRate: 18.8 
  },
  { 
    id: 3, 
    url: 'https://example.com/contact', 
    label: 'Kontakt', 
    clicks: 123, 
    clickRate: 9.9 
  },
  { 
    id: 4, 
    url: 'https://example.com/social', 
    label: 'Social media', 
    clicks: 89, 
    clickRate: 7.1 
  }
])

// Computed properties
const maxOpens = computed(() => {
  return Math.max(...timelineData.value.map(d => d.opens))
})

const maxClicks = computed(() => {
  return Math.max(...timelineData.value.map(d => d.clicks))
})

// Methods
function getDeviceIcon(type) {
  const icons = {
    mobile: 'mdi-cellphone',
    desktop: 'mdi-monitor',
    tablet: 'mdi-tablet'
  }
  return icons[type] || 'mdi-devices'
}

function getDeviceColor(type) {
  const colors = {
    mobile: '#4CAF50',
    desktop: '#2196F3',
    tablet: '#FF9800'
  }
  return colors[type] || '#757575'
}

function getComparisonClass(current, average, inverse = false) {
  const isPositive = inverse ? current < average : current > average
  return isPositive ? 'positive' : 'negative'
}

function getComparisonIcon(current, average, inverse = false) {
  const isPositive = inverse ? current < average : current > average
  return isPositive ? 'mdi-trending-up' : 'mdi-trending-down'
}

function getComparisonText(current, average, inverse = false) {
  const diff = Math.abs(current - average)
  const sign = inverse ? 
    (current < average ? '-' : '+') : 
    (current > average ? '+' : '-')
  return sign + diff.toFixed(1)
}

function showTooltip(point, event) {
  tooltip.value = {
    show: true,
    style: {
      left: event.target.offsetLeft + 'px',
      top: (event.target.offsetTop - 60) + 'px'
    },
    time: point.time,
    opens: point.opens,
    clicks: point.clicks
  }
}

function hideTooltip() {
  tooltip.value.show = false
}

function exportReport() {
  console.log('Eksportowanie raportu analityki')
  // Implement report export
}

function refreshData() {
  console.log('Odświeżanie danych analitycznych')
  // Implement data refresh
}

onMounted(() => {
  console.log('Komponent analityki załadowany dla kampanii:', campaign.name)
})
</script>

<style scoped>
.campaign-analytics {
  width: 100%;
}

.analytics-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
}

.header-info h3 {
  margin: 0 0 8px 0;
  font-size: 1.3rem;
  font-weight: 600;
}

.header-info p {
  margin: 0;
  color: #666;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.analytics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 24px;
}

.performance-card {
  grid-column: 1 / -1;
}

.performance-card,
.timeline-card,
.geographic-card,
.devices-card,
.links-card,
.comparison-card {
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

/* Performance Stats */
.performance-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.performance-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 12px;
  border: 1px solid #f0f0f0;
}

.perf-details {
  flex: 1;
}

.perf-value {
  font-size: 1.8rem;
  font-weight: 700;
  line-height: 1.2;
  margin-bottom: 4px;
}

.perf-label {
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 4px;
}

.perf-rate {
  font-size: 1.1rem;
  font-weight: 600;
  color: #515bad;
}

.perf-change {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.85rem;
  font-weight: 500;
}

.perf-change.positive {
  color: #4CAF50;
}

.perf-change.negative {
  color: #f44336;
}

/* Timeline */
.timeline-controls {
  display: flex;
  justify-content: center;
  margin-bottom: 24px;
}

.timeline-chart {
  position: relative;
  height: 200px;
  margin-bottom: 16px;
}

.chart-area {
  position: relative;
  width: 100%;
  height: 160px;
  background: linear-gradient(to top, #f8f9fa 0%, transparent 100%);
  border-bottom: 2px solid #e0e0e0;
  border-left: 2px solid #e0e0e0;
}

.chart-point {
  position: absolute;
}

.point-marker {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s ease;
}

.point-marker:hover {
  transform: scale(1.5);
}

.point-marker.opens {
  background: #4CAF50;
}

.point-marker.clicks {
  background: #2196F3;
}

.chart-legend {
  display: flex;
  justify-content: center;
  gap: 24px;
  margin-top: 16px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.legend-marker {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.legend-marker.opens {
  background: #4CAF50;
}

.legend-marker.clicks {
  background: #2196F3;
}

.chart-tooltip {
  position: absolute;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 0.85rem;
  z-index: 10;
  pointer-events: none;
}

/* Geographic */
.geographic-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.location-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 8px;
}

.location-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.country-flag {
  width: 24px;
  height: 18px;
  border-radius: 2px;
  overflow: hidden;
}

.country-details {
  display: flex;
  flex-direction: column;
}

.country-name {
  font-weight: 500;
  margin-bottom: 2px;
}

.country-stats {
  font-size: 0.85rem;
  color: #666;
}

.location-percentage {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 80px;
}

.percentage-bar {
  width: 40px;
  height: 6px;
  background: #f0f0f0;
  border-radius: 3px;
  overflow: hidden;
}

.percentage-fill {
  height: 100%;
  background: linear-gradient(90deg, #515bad, #9395fa);
  border-radius: 3px;
}

/* Devices */
.device-tabs {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.device-stats,
.client-stats {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.device-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 8px;
}

.device-info {
  flex: 1;
}

.device-name {
  font-weight: 500;
  margin-bottom: 2px;
}

.device-percentage {
  font-size: 0.85rem;
  color: #666;
}

.device-bar {
  width: 60px;
  height: 6px;
  background: #f0f0f0;
  border-radius: 3px;
  overflow: hidden;
}

.device-fill {
  height: 100%;
  border-radius: 3px;
}

.client-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 8px;
}

.client-info {
  display: flex;
  flex-direction: column;
}

.client-name {
  font-weight: 500;
  margin-bottom: 2px;
}

.client-count {
  font-size: 0.85rem;
  color: #666;
}

.client-percentage {
  font-weight: 600;
  color: #515bad;
}

/* Links */
.links-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.link-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  border-left: 4px solid #515bad;
}

.link-info {
  flex: 1;
}

.link-url {
  font-family: monospace;
  font-size: 0.85rem;
  color: #666;
  margin-bottom: 4px;
}

.link-label {
  font-weight: 500;
}

.link-stats {
  display: flex;
  align-items: center;
  gap: 16px;
}

.link-clicks {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.9rem;
}

.link-rate {
  font-weight: 600;
  color: #515bad;
}

.no-links {
  text-align: center;
  padding: 40px 20px;
  color: #666;
}

.no-links h4 {
  margin: 16px 0 8px 0;
}

/* Comparison */
.comparison-metrics {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.metric-comparison {
  padding: 16px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 8px;
}

.metric-label {
  font-weight: 500;
  margin-bottom: 8px;
}

.metric-values {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.current-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #515bad;
}

.comparison-indicator {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.9rem;
  font-weight: 500;
}

.comparison-indicator.positive {
  color: #4CAF50;
}

.comparison-indicator.negative {
  color: #f44336;
}

.average-value {
  font-size: 0.85rem;
  color: #666;
}

@media (max-width: 1200px) {
  .analytics-grid {
    grid-template-columns: 1fr;
  }
  
  .performance-stats {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  }
}

@media (max-width: 768px) {
  .analytics-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  
  .header-actions {
    justify-content: center;
  }
  
  .performance-stats {
    grid-template-columns: 1fr;
  }
  
  .performance-item {
    flex-direction: column;
    text-align: center;
  }
  
  .metric-values {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}
</style>