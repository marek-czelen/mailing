<template>
  <v-card class="stat-card">
    <div class="stat-content">
      <div :class="className">
        <v-icon>{{ icon }}</v-icon>
      </div>
      <div class="stat-info">
        <h3>{{ value }}</h3>
        <p>{{ titleComputed }}</p>
      </div>
    </div>
  </v-card>
</template>
<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';


const props = defineProps({
  selectedCampaign: Object,
  icon: {
    type: String,
    default: 'mdi-email-send'
  },
  title: {
    type: String,
    default: ''
  },
  class: {
    type: String,
    default: 'sent'
  },
  value: {
    type: Number,
    default: 0
  }
});

const { t } = useI18n();

const titleComputed = computed(() => props.title || t('stats.sent'));

const className = computed(() => {
  return `stat-icon ${props.class}`;
});
</script>
<style scoped>
.stat-card {
  border-radius: 6px !important;
  box-shadow: none !important;
  border: 1px solid #e8eaed !important;
  background: #fafbfc !important;
  flex: 1;
  min-width: 140px;
}

.stat-content {
  display: flex;
  align-items: center;
  padding: 8px 14px;
  gap: 10px;
}

.stat-icon {
  width: 34px;
  height: 34px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.stat-icon-1 {
  background: #6366f1;
}

.stat-icon-2 {
  background: #10b981;
}

.stat-icon-3 {
  background: #f59e0b;
}

.stat-icon-4 {
  background: #8b5cf6;
}

.stat-info h3 {
  font-size: 1.2rem;
  font-weight: 700;
  margin: 0;
  color: #1a1a2e;
  line-height: 1.1;
}

.stat-info p {
  margin: 1px 0 0 0;
  color: #718096;
  font-size: 0.72rem;
  white-space: nowrap;
}

</style>