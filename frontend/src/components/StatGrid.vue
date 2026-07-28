<template>
    <div class="stats-bar-inner">
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
.stats-bar-inner {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  align-items: stretch;
}
</style>