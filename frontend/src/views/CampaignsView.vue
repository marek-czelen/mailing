<template>
  <v-container fluid>
    <v-row>
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
              label="Szukaj kampanii"
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
                <v-list-item-content>
                  <v-list-item-title>{{ campaign.name }}</v-list-item-title>
                  <v-list-item-subtitle>{{ new Date(campaign.date).toLocaleDateString() }}</v-list-item-subtitle>
                </v-list-item-content>
                <v-list-item-action>
                  <v-btn icon @click.stop="openEditDialog(campaign)">
                    <v-icon>mdi-pencil</v-icon>
                  </v-btn>
                  <v-btn icon @click.stop="confirmDelete(campaign)">
                    <v-icon color="red">mdi-delete</v-icon>
                  </v-btn>
                </v-list-item-action>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="8">
        <CampaignDetails v-if="selectedCampaign" :campaign="selectedCampaign" />
        <div v-else class="text-center mt-10">
          Wybierz kampanię z listy po lewej stronie.
        </div>
      </v-col>
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

<script setup>
import { ref, computed, onMounted } from 'vue';
import CampaignDetails from '../components/CampaignSummary.vue';
import CampaignDialog from '../components/CampaignDialog.vue';
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

onMounted(async () => {
  campaigns.value = await Campaigns.fetchAll();
});

const filteredCampaigns = computed(() => {
  if (!search.value) return campaigns.value;
  return campaigns.value.filter(c =>
    c.name.toLowerCase().includes(search.value.toLowerCase())
  );
});

function selectCampaign(campaign) {
  selectedCampaign.value = campaign;
}

function addCampaign() {
  dialog.value = true;
}

function submitCampaign() {
  // Wyślij kampanię do backendu jako JSON (plik = ścieżka)
  console.log('Submitting campaign:', newCampaign.value);
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
    })
    .catch(err => {
      alert('Błąd dodawania kampanii: ' + (err?.response?.data?.message || err.message));
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

function openEditDialog(campaign) {
  newCampaign.value = {
    name: campaign.name || '',
    date: campaign.date || '',
    address: campaign.address || '',
    mailContent: campaign.mailContent || '',
    file: campaign.file || null
  };
  dialog.value = true;
}
</script>