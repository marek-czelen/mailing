<template>
    <div class="stats-grid">
        <StatCard v-for="item, index of props.statElements" 
          :icon="item.icon" 
          :title="item.title" 
          :value="item.value"
          :class="`stat-icon-${index + 1}`" />


    </div>
</template>

<script setup>
import StatCard from './StatCard.vue';

const props = defineProps({
  statElements: {
    type: Array,
    required: true,
    default: () => []
  }
});
</script>

<style scoped>

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 10px;
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

.stat-icon.contacts {
  background: linear-gradient(135deg, #202950 0%, #515bad 100%);
}

.stat-icon.active {
  background: linear-gradient(135deg, #10b981 0%, #34d399 100%);
}

.stat-icon.campaigns {
  background: linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%);
}

.stat-icon.segments {
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