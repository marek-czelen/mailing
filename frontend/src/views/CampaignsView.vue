
<template>
  <v-container fluid>
    <v-row>
      <template v-if="isEditing">
        <v-col cols="12">
          <CampaignEdit 
            :campaign="selectedCampaign"
            @save="handleEditSave"
            @cancel="isEditing = false"
          />
        </v-col>
      </template>
      <template v-else>
        <v-col cols="12" md="4">
          <v-card>
            <v-card-title>
              Kampanie
              <v-spacer></v-spacer>
              <v-btn color="primary" @click="addCampaign">Nowa kampania</v-btn>
            </v-card-title>
            <v-card-text>
              <v-text-field
                v-model="search"
                label="Wyszukaj kampanię..."
                clearable
                class="mb-4"
              />
              <v-list>
                <v-list-item
                  v-for="campaign in filteredCampaigns"
                  :key="campaign.id"
                  @click="selectCampaign(campaign)"
                  :class="{ 'selected-campaign': selectedCampaign && selectedCampaign.id === campaign.id }"
                >
                  <div class="d-flex align-center" style="width: 100%">
                    <div>
                      <div class="text-subtitle-1">{{ campaign.name }}</div>
                      <div class="text-caption">{{ new Date(campaign.date).toLocaleDateString() }}</div>
                    </div>
                    <v-spacer></v-spacer>
                  </div>
                </v-list-item>
              </v-list>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" md="8">
          <template v-if="selectedCampaign">
            <CampaignDetails 
              :campaign="selectedCampaign"
              :campaigns="campaigns"
              @delete="confirmDelete"
              @edit="startEditing"
            />
          </template>
          <template v-else>
            <div class="text-center mt-10">
              Wybierz kampanię z listy, aby zobaczyć szczegóły.
            </div>
          </template>
        </v-col>
      </template>
    </v-row>

    <!-- Dialog do dodawania/edycji kampanii -->
    <CampaignDialog
      v-model:dialog="dialog"
      :campaign-data="newCampaign"
      @update:campaign-data="handleNewCampaignUpdate"
      @submit="submitCampaign"
    />

    <!-- Dialog potwierdzenia usunięcia -->
    <v-dialog v-model="deleteDialog" max-width="500">
      <v-card>
        <v-card-title class="text-h5">Potwierdzenie usunięcia</v-card-title>
        <v-card-text>Czy na pewno chcesz usunąć kampanię "{{ campaignToDelete?.name }}"?</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="red" @click="deleteCampaign">Usuń</v-btn>
          <v-btn text @click="deleteDialog = false">Anuluj</v-btn>  
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

  <style>
  .selected-campaign {
    background-color: #e0e0e0 !important; /* jasnoszare tło */
    color: #222 !important; /* ciemny tekst dla kontrastu */
  }

  .selected-campaign .text-subtitle-1 {
    color: #222 !important;
  }

  .selected-campaign .text-caption {
    color: #555 !important; /* ciemniejsza szarość dla daty */
  }
  </style>
<script setup>
import { ref, computed, onMounted } from 'vue';
import CampaignDetails from '../components/CampaignSummary.vue';
import CampaignDialog from '../components/CampaignDialog.vue';
import CampaignEdit from '../components/CampaignEdit.vue';
import { Campaigns } from '../services/campaigns.js';

const dialog = ref(false);
const newCampaign = ref({
  name: '',
  date: '',
  address: '',
  mailContent: '',
  file: null
});

function handleNewCampaignUpdate(val) {
  console.log('Aktualizacja kampanii:', val);
  newCampaign.value = {
    name: val.name || '',
    date: val.date || '',
    address: val.address || '',
    mailContent: val.mailContent || '',
    file: val.file || null
  };
}

const campaigns = ref([]);
const search = ref('');
const selectedCampaign = ref(null);

const deleteDialog = ref(false);
const campaignToDelete = ref(null);
const isEditing = ref(false);

onMounted(async () => {
  campaigns.value = await Campaigns.fetchAll();
  if (campaigns.value.length > 0) {
    selectedCampaign.value = campaigns.value[0];
  }
});

const filteredCampaigns = computed(() => {
  const filtered = search.value
    ? campaigns.value.filter(c => c.name.toLowerCase().includes(search.value.toLowerCase()))
    : campaigns.value;
    
  // Jeśli po filtrowaniu nie ma wybranej kampanii, wybierz pierwszą z przefiltrowanej listy
  if (filtered.length > 0 && (!selectedCampaign.value || !filtered.find(c => c.id === selectedCampaign.value.id))) {
    selectedCampaign.value = filtered[0];
  }
  
  return filtered;
});

function selectCampaign(campaign) {
  selectedCampaign.value = campaign;
}

function addCampaign() {
  dialog.value = true;
}

function submitCampaign(campaignData) {
  newCampaign.value = campaignData;
  // Wyślij kampanię do backendu jako JSON (plik = ścieżka)
  const payload = {
    name: newCampaign.value.name,
    date: newCampaign.value.date,
    address: newCampaign.value.address,
    mailContent: newCampaign.value.mailContent,
    file: newCampaign.value.file
  };
  Campaigns.create(payload)
    .then(async () => {
      campaigns.value = await Campaigns.fetchAll();
      dialog.value = false;
      newCampaign.value = { name: '', date: '', file: null };
      // Wybierz nowo dodaną kampanię
      if (campaigns.value.length > 0) {
        selectedCampaign.value = campaigns.value[0];
      }
    })
    .catch(err => {
      alert('Wystąpił błąd podczas dodawania kampanii: ' + (err?.response?.data?.message || err.message));
    });
}

function confirmDelete(campaign) {
  campaignToDelete.value = campaign;
  deleteDialog.value = true;
}

async function deleteCampaign() {
  if (!campaignToDelete.value) return;
  try {
    await Campaigns.delete(campaignToDelete.value.id);
    campaigns.value = await Campaigns.fetchAll();
    if (selectedCampaign.value?.id === campaignToDelete.value.id) {
      selectedCampaign.value = null;
    }
  } catch (err) {
    alert('Błąd usuwania kampanii: ' + (err?.response?.data?.message || err.message));
  }
  deleteDialog.value = false;
  campaignToDelete.value = null;
}

function startEditing() {
  isEditing.value = true;
}

async function handleEditSave(updatedCampaign) {
  try {
    await Campaigns.update(updatedCampaign.id, updatedCampaign);
    campaigns.value = await Campaigns.fetchAll();
    selectedCampaign.value = updatedCampaign;
    isEditing.value = false;
  } catch (err) {
    alert('Wystąpił błąd podczas zapisywania zmian: ' + (err?.response?.data?.message || err.message));
  }
}
</script>