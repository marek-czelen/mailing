<template>
    <div class="page-container">
    <!-- Header Section -->
     <PageHeader
       :title="props.title"
       :subtitle="props.subtitle"
     />
    <v-container fluid class="page-content">
        <v-row>
            <!-- Left Panel - Campaigns List -->
            <v-col cols="12" md="4">
                <slot name="left-panel"></slot>
            </v-col>
            <!-- Right Panel - Campaign Details -->
            <v-col cols="12" md="8">
                <slot name="right-panel"></slot>
            </v-col>
        </v-row>
    </v-container>
    </div>
</template>

<script setup>
import PageHeader from './PageHeader.vue';

const props = defineProps({
    title: {
        type: String,
        default: 'Page Title'
    },
    subtitle: {
        type: String,
        default: 'Page Subtitle'
    }
});
</script>

<style scoped>
.page-container {
  width: 100vw;
  background: linear-gradient(135deg, #eadcf6 0%, #9395fa 100%);
  margin: 0;
  padding: 0;
  overflow: hidden;
}

.page-content {
  padding: 20px !important;
  margin: 0 !important;
  width: 100% !important;
}
</style>