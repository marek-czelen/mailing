<template>
        <div class="page-container">
        <!-- Header Section -->
         <PageHeader
             :title="titleComputed"
             :subtitle="subtitleComputed"
         />
        <!-- Optional Stats bar -->
        <div v-if="hasStats" class="stats-bar">
            <slot name="stats"></slot>
        </div>
    <div class="page-content">
        <v-row class="fill-height ma-0">
            <!-- Left Panel -->
            <v-col cols="12" md="4" class="left-col pa-2">
                <slot name="left-panel"></slot>
            </v-col>
            <!-- Right Panel - scrollable -->
            <v-col cols="12" md="8" class="right-col pa-2">
                <div class="right-panel-scroll">
                    <slot name="right-panel"></slot>
                </div>
            </v-col>
        </v-row>
    </div>
    </div>
</template>

<script setup>
import PageHeader from './PageHeader.vue';

import { computed, useSlots } from 'vue';
import { useI18n } from 'vue-i18n';

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

const { t } = useI18n();
const slots = useSlots();

const titleComputed = computed(() => props.title || t('page.title'));
const subtitleComputed = computed(() => props.subtitle || t('page.subtitle'));
const hasStats = computed(() => !!slots.stats);
</script>

<style scoped>
.page-container {
  width: 100%;
  height: 100%;
  background: #f6f7f9;
  margin: 0;
  padding: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.stats-bar {
  flex-shrink: 0;
  padding: 8px 14px;
  background: #ffffff;
  border-bottom: 1px solid #e0e0e0;
}

.page-content {
  flex: 1;
  overflow: hidden;
  min-height: 0;
}

.fill-height {
  height: 100%;
}

.left-col,
.right-col {
  height: 100%;
  overflow: hidden;
}

.right-panel-scroll {
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  scrollbar-width: thin;
  scrollbar-color: rgba(99, 102, 241, 0.3) transparent;
}

.right-panel-scroll::-webkit-scrollbar {
  width: 6px;
}

.right-panel-scroll::-webkit-scrollbar-track {
  background: transparent;
}

.right-panel-scroll::-webkit-scrollbar-thumb {
  background: rgba(99, 102, 241, 0.3);
  border-radius: 3px;
}
</style>