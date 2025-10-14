<template>
  <div class="campaign-details">
    <template v-if="campaign">
      <div class="details-header">
  <v-btn color="success" class="mr-2" @click="activateCampaign">
          <v-icon left>mdi-play-circle</v-icon>
          Aktywuj teraz
        </v-btn>
  <v-btn color="warning" class="mr-2" @click="stopCampaign">
          <v-icon left>mdi-pause-circle</v-icon>
          Zatrzymaj
        </v-btn>
  <v-btn color="primary" class="mr-2" @click="editCampaign">
          <v-icon left>mdi-pencil</v-icon>
          Modyfikuj
        </v-btn>
  <v-btn color="error" @click="deleteCampaign">
          <v-icon left>mdi-delete</v-icon>
          Usuń
        </v-btn>
      </div>
      <div class="info-row">
        <v-text-field
          label="Nazwa kampanii"
          :model-value="campaign.name"
          readonly
          solo
          hide-details
          class="mr-2 info-field"
        />
        <v-text-field
          label="Status"
          :model-value="campaign.status"
          readonly
          solo
          hide-details
          class="mr-2 info-field"
        />
        <v-text-field
          label="Data rozpoczęcia"
          :model-value="campaign.startDate"
          readonly
          solo
          hide-details
          class="mr-2 info-field"
        />
        <v-text-field
          label="Ilość maili na liście"
          :model-value="campaign.mailCount"
          readonly
          solo
          hide-details
          class="info-field"
        />
      </div>
      <div class="inbox-preview">
        <h3>Podgląd wiadomości</h3>
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
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(60,60,120,0.08);
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
  margin-bottom: 8px;
}

.info-row {
  display: flex;
  flex-wrap: wrap;
  gap: 32px;
  align-items: center;
  margin-bottom: 16px;
}
.info-field {
  max-width: 220px;
}

.inbox-preview {
  margin-top: 24px;
  border: 1px solid #eee;
  border-radius: 8px;
  background: #fafafa;
  padding: 16px;
}
.inbox-header {
  margin-bottom: 12px;
}
.inbox-content {
  border-top: 1px solid #ddd;
  padding-top: 12px;
  font-size: 1rem;
  color: #222;
}
</style>
