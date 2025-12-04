<template>
  <div class="database-history">
    <div class="history-header">
      <h3>{{ t('history.title') }}</h3>
      <p>{{ t('history.subtitle') }}</p>
    </div>

    <div v-if="history.length === 0" class="empty-state">
      <v-icon size="48" color="grey-lighten-2">mdi-history</v-icon>
      <h3>{{ t('history.emptyTitle') }}</h3>
      <p>{{ t('history.emptyText') }}</p>
    </div>

    <div v-else class="history-timeline">
      <div
        v-for="item in history"
        :key="item.id"
        class="history-item"
      >
        <div class="history-icon">
          <v-icon :color="getActionColor(item.action)">
            {{ getActionIcon(item.action) }}
          </v-icon>
        </div>
        <div class="history-content">
          <div class="history-header-item">
            <h4>{{ getActionTitle(item.action) }}</h4>
            <span class="history-date">{{ formatDate(item.timestamp) }}</span>
          </div>
          <p class="history-description">{{ item.description }}</p>
          <div v-if="item.details" class="history-details">
            <v-chip
              v-for="detail in item.details"
              :key="detail"
              size="small"
              variant="outlined"
              class="mr-1"
            >
              {{ detail }}
            </v-chip>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue'
import { useI18n } from 'vue-i18n'

const { t, locale } = useI18n()

defineProps({
  database: Object,
  history: Array
})

// Methods
function getActionIcon(action) {
  const icons = {
    created: 'mdi-plus-circle',
    updated: 'mdi-pencil-circle',
    imported: 'mdi-upload-circle',
    exported: 'mdi-download-circle',
    deleted: 'mdi-delete-circle',
    contact_added: 'mdi-account-plus',
    contact_removed: 'mdi-account-minus',
    segment_created: 'mdi-filter-plus',
    campaign_sent: 'mdi-email-send'
  }
  return icons[action] || 'mdi-circle'
}

function getActionColor(action) {
  const colors = {
    created: 'success',
    updated: 'primary',
    imported: 'info',
    exported: 'warning',
    deleted: 'error',
    contact_added: 'success',
    contact_removed: 'warning',
    segment_created: 'purple',
    campaign_sent: 'indigo'
  }
  return colors[action] || 'grey'
}

function getActionTitle(action) {
  const titles = {
    created: t('history.actions.created'),
    updated: t('history.actions.updated'),
    imported: t('history.actions.imported'),
    exported: t('history.actions.exported'),
    deleted: t('history.actions.deleted'),
    contact_added: t('history.actions.contact_added'),
    contact_removed: t('history.actions.contact_removed'),
    segment_created: t('history.actions.segment_created'),
    campaign_sent: t('history.actions.campaign_sent')
  }
  return titles[action] || action
}

function formatDate(timestamp) {
  if (!timestamp) return '-'
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now - date
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  
  const localeTag = locale.value === 'pl' ? 'pl-PL' : 'en-US'
  if (diffDays === 0) {
    return t('history.todayAt', { time: date.toLocaleTimeString(localeTag, { hour: '2-digit', minute: '2-digit' }) })
  } else if (diffDays === 1) {
    return t('history.yesterdayAt', { time: date.toLocaleTimeString(localeTag, { hour: '2-digit', minute: '2-digit' }) })
  } else if (diffDays < 7) {
    return t('history.daysAgo', { count: diffDays })
  } else {
    return date.toLocaleDateString(localeTag)
  }
}
</script>

<style scoped>
.database-history {
  width: 100%;
}

.history-header h3 {
  margin: 0 0 8px 0;
  font-size: 1.3rem;
  font-weight: 600;
}

.history-header p {
  margin: 0 0 24px 0;
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
}

.history-timeline {
  position: relative;
  padding-left: 32px;
}

.history-timeline::before {
  content: '';
  position: absolute;
  left: 20px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: linear-gradient(to bottom, #515bad, #9395fa);
}

.history-item {
  position: relative;
  display: flex;
  margin-bottom: 24px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.history-icon {
  position: absolute;
  left: -32px;
  top: 16px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 1;
}

.history-content {
  flex: 1;
}

.history-header-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.history-header-item h4 {
  margin: 0;
  font-weight: 600;
  color: #333;
}

.history-date {
  font-size: 0.85rem;
  color: #666;
}

.history-description {
  margin: 0 0 12px 0;
  color: #666;
  line-height: 1.5;
}

.history-details {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

@media (max-width: 768px) {
  .history-timeline {
    padding-left: 20px;
  }
  
  .history-timeline::before {
    left: 10px;
  }
  
  .history-icon {
    left: -6px;
    width: 24px;
    height: 24px;
  }
  
  .history-header-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
}
</style>