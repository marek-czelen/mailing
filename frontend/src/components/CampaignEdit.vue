<template>
  <div class="campaign-edit">
    <div class="edit-header">
      <h2>Edycja kampanii</h2>
      <div class="actions">
        <v-btn color="primary" class="mr-2" @click="saveCampaign">
          <v-icon left>mdi-content-save</v-icon>
          Zapisz zmiany
        </v-btn>
        <v-btn color="error" @click="cancelEdit">
          <v-icon left>mdi-close</v-icon>
          Anuluj
        </v-btn>
      </div>
    </div>

    <v-form ref="form" v-model="isValid" @submit.prevent="saveCampaign">
      <v-row>
        <v-col cols="12" md="6">
          <v-text-field
            v-model="editedCampaign.name"
            label="Nazwa kampanii"
            :rules="[v => !!v || 'Nazwa jest wymagana']"
            required
          />
        </v-col>
        <v-col cols="12" md="6">
          <v-text-field
            v-model="editedCampaign.date"
            label="Data rozpoczęcia"
            type="date"
            :rules="[v => !!v || 'Data jest wymagana']"
            required
          />
        </v-col>
        <v-col cols="12">
          <v-text-field
            v-model="editedCampaign.address"
            label="Adres email nadawcy"
            :rules="[
              v => !!v || 'Adres email jest wymagany',
              v => /.+@.+\..+/.test(v) || 'Adres email musi być poprawny'
            ]"
            required
          />
        </v-col>
        <v-col cols="12">
          <v-textarea
            v-model="editedCampaign.mailContent"
            label="Treść wiadomości"
            :rules="[v => !!v || 'Treść wiadomości jest wymagana']"
            required
            rows="10"
          />
        </v-col>
        <v-col cols="12">
          <v-file-input
            v-model="editedCampaign.file"
            label="Lista adresów email"
            accept=".csv,.txt"
            :rules="[v => !!v || 'Lista adresów jest wymagana']"
            show-size
            truncate-length="30"
          />
        </v-col>
      </v-row>
    </v-form>
  </div>
</template>

<script setup>
import { ref, defineProps, defineEmits } from 'vue';

const props = defineProps({
  campaign: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['save', 'cancel']);

const form = ref(null);
const isValid = ref(false);
const editedCampaign = ref({ ...props.campaign });

function saveCampaign() {
  if (!isValid.value) return;
  emit('save', editedCampaign.value);
}

function cancelEdit() {
  emit('cancel');
}
</script>

<style scoped>
.campaign-edit {
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(60,60,120,0.08);
  padding: 24px;
  height: 100vh;
  overflow-y: auto;
}

.edit-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.actions {
  display: flex;
  gap: 8px;
}

.v-form {
  margin-top: 16px;
}
</style>