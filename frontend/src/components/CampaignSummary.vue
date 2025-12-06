<template>
  <div class="campaign-details">
    <template v-if="campaign">
      <div class="details-header">
  <v-btn color="success" class="mr-2" @click="activateCampaign">
          <v-icon left>mdi-play-circle</v-icon>
          {{ t('campaigns.activateNow') }}
        </v-btn>
  <v-btn color="warning" class="mr-2" @click="stopCampaign">
          <v-icon left>mdi-pause-circle</v-icon>
          {{ t('campaigns.stop') }}
        </v-btn>
  <v-btn color="primary" class="mr-2" @click="editCampaign">
          <v-icon left>mdi-pencil</v-icon>
          {{ t('common.edit') }}
        </v-btn>
  <v-btn color="error" @click="deleteCampaign">
          <v-icon left>mdi-delete</v-icon>
          {{ t('common.delete') }}
        </v-btn>
      </div>
      <div class="info-row">
        <v-text-field
          :label="t('campaigns.name')"
          :model-value="campaign.name"
          readonly
          solo
          hide-details
          class="mr-2 info-field"
        />
        <v-text-field
          :label="t('campaigns.status')"
          :model-value="campaign.status"
          readonly
          solo
          hide-details
          class="mr-2 info-field"
        />
        <v-text-field
          :label="t('campaigns.dateStart')"
          :model-value="campaign.startDate"
          readonly
          solo
          hide-details
          class="mr-2 info-field"
        />
        <v-text-field
          :label="t('campaigns.mailCount')"
          :model-value="campaign.mailCount"
          readonly
          solo
          hide-details
          class="info-field"
        />
      </div>
      <div class="inbox-preview">
        <h3>{{ t('campaigns.emailPreview') }}</h3>
        <div class="inbox-header">
          <span class="subject"><strong>Temat:</strong> {{ campaign.subject }}</span><br>
          <span class="address"><strong>Adres:</strong> {{ campaign.address }}</span>
        </div>
        <div class="inbox-content" v-html="campaign.mailContent" />
      </div>
    </template>
    <template v-else>
      <h2>Statystyka wszystkich kampanii</h2>
      <p><strong>Liczba kampanii:</strong> {{ campaigns.length }}</p>
      <p><strong>Aktywne:</strong> {{ campaigns.filter(c => c.status === 'Aktywna').length }}</p>
      <p><strong>Zakończone:</strong> {{ campaigns.filter(c => c.status === 'Zakończona').length }}</p>
      <p><strong>Planowane:</strong> {{ campaigns.filter(c => c.status === 'Planowana').length }}</p>
    </template>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
const props = defineProps({
  campaign: Object,
  campaigns: Array
});
const emit = defineEmits(['edit', 'activate', 'stop', 'delete']);

function editCampaign() {
  emit('edit', props.campaign);
}
function activateCampaign() {
  emit('activate', props.campaign);
}
function stopCampaign() {
  emit('stop', props.campaign);
}
function deleteCampaign() {
  emit('delete', props.campaign);
}
</script>

<style scoped>
.campaign-details {
  flex: 1;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 24px;
  min-width: 0;
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow-y: auto;
}

.details-header {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 20px;
  padding: 16px;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
  border-radius: 12px;
  border: 1px solid rgba(102, 126, 234, 0.1);
}

.details-header .v-btn {
  border-radius: 8px !important;
  transition: all 0.3s ease !important;
  margin: 0 4px !important;
}

.details-header .v-btn:hover {
  transform: translateY(-2px) !important;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15) !important;
}

.info-row {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: center;
  margin-bottom: 20px;
}

.info-field {
  max-width: 220px;
}

.info-field :deep(.v-field) {
  background: rgba(255, 255, 255, 0.8) !important;
  border-radius: 8px !important;
  border: 1px solid rgba(102, 126, 234, 0.2) !important;
}

.inbox-preview {
  margin-top: 24px;
  border: 1px solid rgba(102, 126, 234, 0.2);
  border-radius: 12px;
  background: linear-gradient(135deg, rgba(245, 247, 250, 0.9) 0%, rgba(195, 207, 226, 0.5) 100%);
  backdrop-filter: blur(10px);
  padding: 20px;
}

.inbox-header {
  margin-bottom: 16px;
  font-weight: 600;
  color: #333;
}

.inbox-content {
  border-top: 1px solid rgba(102, 126, 234, 0.2);
  padding-top: 16px;
  font-size: 1rem;
  color: #444;
  line-height: 1.6;
}
</style>
