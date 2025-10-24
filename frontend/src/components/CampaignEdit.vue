<template>
  <v-container fluid>
    <v-row>
      <div class="edit-header">
        <h2>{{ props.campaign ? "Edycja kampanii" : "Nowa kampania" }}</h2>
        <div class="actions">
          <v-btn color="primary" class="mr-2" @click="saveCampaign">
            <v-icon left>mdi-content-save</v-icon>
            Zapisz
          </v-btn>
          <v-btn color="error" @click="cancelEdit">
            <v-icon left>mdi-close</v-icon>
            Anuluj
          </v-btn>
        </div>
      </div>
    </v-row>
    <v-row>
      <v-col cols="2"></v-col>
      <v-col>
        <div class="campaign-edit">
          <v-form ref="form" v-model="isValid" @submit.prevent="saveCampaign">
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="editedCampaign.name"
                  label="Nazwa kampanii"
                  :rules="[(v) => !!v || 'Nazwa jest wymagana']"
                  required
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="editedCampaign.date"
                  label="Data rozpoczęcia"
                  type="date"
                  :rules="[(v) => !!v || 'Data jest wymagana']"
                  required
                />
              </v-col>
              <v-col cols="12">
                <v-autocomplete
                  v-model="editedCampaign.address"
                  :items="addressList"
                  label="Adres zwrotny"
                  :rules="[
                    (v) => !!v || 'Adres email jest wymagany',
                    (v) =>
                      /.+@.+\..+/.test(v) || 'Adres email musi być poprawny',
                  ]"
                  required
                  clearable
                />
              </v-col>
              <v-col cols="12">
                <!-- QuillEditor dla bogatego formatowania treści -->
                <QuillEditor
                  ref="quillRef"
                  @blur="onBlur"
                  v-model:html="mailContent"
                  theme="snow"
                  toolbar="full"
                  style="height: 250px; margin-bottom: 16px"
                />

                <!-- Podgląd HTML -->
                <div class="wysiwyg-preview">
                  <div class="wysiwyg-label">Podgląd:</div>
                  <div v-html="mailContent" class="wysiwyg-preview-box" />
                </div>
              </v-col>
              <v-col cols="12">
                <FileDrop ref="fileDropRef" @file-uploaded="onFileUploaded" />
                <v-btn
                  v-if="editedCampaign.file"
                  color="error"
                  class="mt-2"
                  @click="removeFile"
                >
                  Usuń plik
                </v-btn>
              </v-col>
            </v-row>
          </v-form>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, computed, defineProps, defineEmits } from "vue";
import FileDrop from "./FileDrop.vue";
import { QuillEditor } from "@vueup/vue-quill";
import "@vueup/vue-quill/dist/vue-quill.snow.css";
import axios from "axios";

const props = defineProps({
  campaign: {
    type: Object,
    default: () => ({
      name: "",
      date: "",
      address: "",
      mailContent: "",
      file: null,
    }),
  },
});

const emit = defineEmits(["save", "cancel"]);

const form = ref(null);
const isValid = ref(false);
const editedCampaign = ref({ ...props.campaign });
const chatGptDialog = ref(false);
const chatGptProducts = ref("");
const chatGptTarget = ref("");
const quillRef = ref(null);
const fileDropRef = ref(null);
const addressList = ref(["test@test.pl"]);

const mailContent = computed({
  get: () => editedCampaign.value.mailContent || "",
  set: (val) => {
    editedCampaign.value = { ...editedCampaign.value, mailContent: val };
  },
});

function onBlur() {
  if (!quillRef.value) return;
  const quill = quillRef.value.getQuill();
  const html = quill.root.innerHTML;
  editedCampaign.value = { ...editedCampaign.value, mailContent: html };
}

function onFileUploaded(path) {
  console.log("Plik załadowany:", path);
  editedCampaign.value = { ...editedCampaign.value, file: path };
}

async function removeFile() {
  const filePath = editedCampaign.value.file;
  if (!filePath) return;
  try {
    await axios.post("/mailing/deleteFile", { path: filePath });
  } catch (err) {
    alert(
      "Błąd usuwania pliku: " + (err?.response?.data?.message || err.message)
    );
  }
  editedCampaign.value = { ...editedCampaign.value, file: null };
  if (fileDropRef?.value?.reset) fileDropRef.value.reset();
}

function saveCampaign() {
  if (!isValid.value) return;
  emit("save", editedCampaign.value);
}

function cancelEdit() {
  emit("cancel");
}
</script>

<style scoped>
.campaign-edit {
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(60, 60, 120, 0.08);
  padding: 24px;
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
