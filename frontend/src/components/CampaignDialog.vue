<template>
  <v-dialog v-model="dialogModel" max-width="80vw" style="width: 80vw;">
    <v-card>
      <v-card-title>Dodaj kampanię</v-card-title>
      <v-card-text>
        <v-form @submit.prevent="submitCampaign">
          <v-btn color="secondary" class="mb-4" @click="chatGptDialog = true">
            <v-icon left>mdi-robot</v-icon>
            Wygeneruj treść z ChatGPT
          </v-btn>
    <v-dialog v-model="chatGptDialog" max-width="500">
      <v-card>
        <v-card-title>Generuj treść maila</v-card-title>
        <v-card-text>
          <v-text-field v-model="chatGptProducts" label="Lista produktów (przecinki)" />
          <v-text-field v-model="chatGptTarget" label="Rodzaj docelowych klientów" />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="primary" @click="generateWithChatGPT">Generuj</v-btn>
          <v-btn text @click="chatGptDialog = false">Anuluj</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
          <v-text-field v-model="newCampaignModel.name" label="Nazwa kampanii" required />
          <v-text-field v-model="newCampaignModel.date" label="Data wysyłki" type="date" required />
          <v-autocomplete
            v-model="newCampaignModel.address"
            :items="addressList"
            label="Adres zwrotny"
            required
            clearable
          />

          <!-- 🔹 Edytor Quill zapisuje zawartość jako HTML -->
          <QuillEditor
           ref="quillRef"
           @blur="onBlur"
            v-model:html="mailContent"
            theme="snow"
            toolbar="full"
            style="height: 250px; margin-bottom: 16px;"
          />

          <!-- 🔹 Podgląd HTML -->
          <div class="wysiwyg-preview">
            <div class="wysiwyg-label">Podgląd:</div>
            <div v-html="mailContent" class="wysiwyg-preview-box" />
          </div>

          <FileDrop ref="fileDropRef" @file-uploaded="onFileUploaded" />
          <v-btn
            v-if="newCampaignModel.value && newCampaignModel.value.file"
            color="error"
            @click="removeFile"
          >
            Usuń plik
          </v-btn>
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn color="primary" @click="submitCampaign">Zapisz</v-btn>
        <v-btn text @click="dialogModel = false">Anuluj</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
const chatGptDialog = ref(false);
const chatGptProducts = ref('');
const chatGptTarget = ref('');

async function generateWithChatGPT() {
  const products = chatGptProducts.value.split(',').map(p => p.trim()).filter(Boolean);
  const target = chatGptTarget.value;
  const prompt = `Napisz profesjonalny mail marketingowy promujący produkty: ${products.join(', ')} dla klientów typu: ${target}.`;
  try {
    const response = await axios.post('/mailing/generateMailContent', { prompt });
    const generated = response.data?.content || '';
    const updated = { ...newCampaignModel.value, mailContent: generated };
    emit('update:newCampaign', updated);
    chatGptDialog.value = false;
  } catch (err) {
    alert('Błąd generowania treści: ' + (err?.response?.data?.message || err.message));
  }
}
import { computed, defineProps, defineEmits, ref } from 'vue';
import FileDrop from './FileDrop.vue';
import { QuillEditor } from '@vueup/vue-quill';
import '@vueup/vue-quill/dist/vue-quill.snow.css';
import axios from 'axios';

const props = defineProps({
  dialog: Boolean,
  newCampaign: Object
});
const emit = defineEmits(['update:dialog', 'update:newCampaign', 'submit']);

const dialogModel = computed({
  get: () => props.dialog,
  set: val => emit('update:dialog', val)
});
const newCampaignModel = computed({
  get: () => props.newCampaign,
  set: val => emit('update:newCampaign', val)
});

const mailContent = ref("");
const quillRef = ref(null);
const fileDropRef = ref(null);
const addressList = ref(['test@test.pl']);

function onFileUploaded(path) {
  const updated = { ...newCampaignModel.value, file: path };
  emit('update:newCampaign', updated);
}

function onBlur() {
  // quillRef.value to instancja QuillEditor
  if (!quillRef.value) return;

  // pobranie instancji Quill
  const quill = quillRef.value.getQuill();

  // pobranie HTML z edytora
  const html = quill.root.innerHTML;

  // aktualizacja kampanii
  const updated = { ...newCampaignModel.value, mailContent: html };
  emit('update:newCampaign', updated);
}

async function removeFile() {
  const filePath = newCampaignModel.value.file;
  if (!filePath) return;
  try {
    await axios.post('/mailing/deleteFile', { path: filePath });
  } catch (err) {
    alert('Błąd usuwania pliku: ' + (err?.response?.data?.message || err.message));
  }
  const updated = { ...newCampaignModel.value, file: null };
  emit('update:newCampaign', updated);
  if (fileDropRef?.value?.reset) fileDropRef.value.reset();
}

function submitCampaign() {
  emit('submit', newCampaignModel.value);
}
</script>

<style scoped>
.wysiwyg-label {
  margin-top: 16px;
  margin-bottom: 4px;
}
.wysiwyg-preview-box {
  border: 1px solid #eee;
  border-radius: 6px;
  padding: 12px;
  background: #fafafa;
  min-height: 60px;
}
</style>
