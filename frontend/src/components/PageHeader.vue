<template>
    <div class="page-header">
      <div class="header-inner">
        <h1 class="page-title">{{props.title}}</h1>
        <p class="page-subtitle" v-if="props.subtitle">{{props.subtitle}}</p>
      </div>
    </div>
</template>

<script setup>
const props = defineProps({
    title: {
        type: String,
        default: ''
    },
    subtitle: {
        type: String,
        default: ''
    }
});
</script>

<style scoped>
.page-header {
  background: #ffffff;
  border-bottom: 1px solid #e0e0e0;
  padding: 0;
  margin: 0;
  width: 100%;
  flex-shrink: 0;
}

.header-inner {
  padding: 8px 18px;
}

.page-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: #1a1a2e;
  margin: 0;
  line-height: 1.3;
}

.page-subtitle {
  font-size: 0.75rem;
  color: #718096;
  margin: 1px 0 0 0;
}
</style>