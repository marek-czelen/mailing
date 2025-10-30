<template>
    <div class="page-header">
      <h1 class="page-title">{{props.title}}</h1>
      <p class="page-subtitle">{{props.subtitle}}</p>
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
  background: linear-gradient(135deg, #202950 0%, #515bad 100%);
  padding: 10px 0;
  text-align: center;
  color: #eadcf6;
  margin: 0;
  width: 100%;
}

.page-title {
  font-size: 1.8rem;
  font-weight: 800;
  margin-bottom: 8px;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

.page-subtitle {
  font-size: 0.9rem;
  opacity: 0.9;
}
</style>