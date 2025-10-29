<template>
    <v-card class="stat-card">
        <div class="stat-content">
            <div :class="className">
                <v-icon>{{ icon }}</v-icon>
            </div>
            <div class="stat-info">
                <h3>{{ value }}</h3>
                <p>{{ title }}</p>
            </div>
        </div>
    </v-card>
</template>
<script setup>
import { computed } from 'vue';


const props = defineProps({
    selectedCampaign: Object,
    icon: {
        type: String,
        default: 'mdi-email-send'
    },
    title: {
        type: String,
        default: 'Wysłanych'
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

const className = computed(() => {
    return `stat-icon ${props.class}`;
});
</script>
<style scoped>
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

</style>