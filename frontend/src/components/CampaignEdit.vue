<template>
  <v-container fluid>
    <v-row>
      <div class="edit-header">
        <div class ="title">
        <h2>{{ props.campaign ? "Edycja kampanii" : "Nowa kampania" }}</h2>
        </div>
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
  <v-col cols="12" md="3">
        <div class="campaign-edit">
          <h3>Informacje o kampanii</h3>
          <v-text-field
            v-model="editedCampaign.name"
            label="Nazwa kampanii"
            :rules="[(v) => !!v || 'Nazwa jest wymagana']"
            required
            small
            hide-details
          />
          <v-text-field
            v-model="editedCampaign.dateStart"
            label="Data rozpoczęcia"
            type="date"
            :rules="[(v) => !!v || 'Data jest wymagana']"
            required
            dense
            hide-details
          />
          <v-text-field
            v-model="editedCampaign.dateEnd"
            label="Data zakończenia"
            type="date"
            :rules="[(v) => !!v || 'Data jest wymagana']"
            required
            dense
            hide-details
          />
          <v-text-field
            v-model="editedCampaign.from"
            label="adres nadawcy"
            type="email"
            readonly
            dense
            hide-details
          />
          <v-text-field
            v-model="editedCampaign.mailsCount"
            label="Ilość maili w puli"
            type="number"
            readonly
            dense
            hide-details
          />
          <v-progress-linear
            :value="editedCampaign.progress || 0"
            color="primary"
            height="20"
            striped
            dense
            hide-details
          >
            <template #default>
              {{ editedCampaign.progress || 0 }}%
            </template>
          </v-progress-linear>
          <v-textarea
            v-model="editedCampaign.feedback"
            label="Informacje zwrotne do kampanii"
            readonly
            dense
            hide-details
          />
          <div :style="spamRatingStyle" class="spam-rating-box">
            <v-text-field
              v-model="spamScore"
              label="Spam scoring (0-100)"
              type="number"
              readonly
              dense
              hide-details
            />
            <div class="spam-rating-label">
              Ocena: <b>{{ spamRatingLabel }}</b>
            </div>
          </div>
          <div v-if="spamSuggestions.length || spamPositives.length" class="spam-suggestions">
            <template v-if="spamSuggestions.length">
              <div class="suggestion-group">
                <div class="suggestion-group-header" @click="showNeg = !showNeg">
                  <span class="group-toggle">{{ showNeg ? '▼' : '►' }}</span>
                  Negatywne sugestie ({{ negativeSuggestions.length }})
                </div>
                <transition name="fade">
                  <ul v-if="showNeg" class="suggestion-list">
                    <li v-for="(s, i) in negativeSuggestions" :key="'neg'+i" class="suggestion-item">
                      <div class="suggestion-frame">
                        <div class="suggestion-row1" :style="{
                          color: '#c62828',
                          background: 'rgba(198,40,40,0.10)'
                        }">
                          <span class="suggestion-problem">{{ s.problem }}</span>
                          <span class="suggestion-score-circle">{{ s.scoreValue }}</span>
                        </div>
                        <div class="suggestion-row2">{{ s.fix }}</div>
                      </div>
                    </li>
                  </ul>
                </transition>
              </div>
              <div class="suggestion-group">
                <div class="suggestion-group-header" @click="showPos = !showPos">
                  <span class="group-toggle">{{ showPos ? '▼' : '►' }}</span>
                  Pozytywne sugestie ({{ positiveSuggestions.length }})
                </div>
                <transition name="fade">
                  <ul v-if="showPos" class="suggestion-list">
                    <li v-for="(s, i) in positiveSuggestions" :key="'pos'+i" class="suggestion-item">
                      <div class="suggestion-frame">
                        <div class="suggestion-row1" :style="{
                          color: '#2e7d32',
                          background: 'rgba(46,125,50,0.10)'
                        }">
                          <span class="suggestion-problem">{{ s.problem }}</span>
                          <span class="suggestion-score-circle">{{ s.scoreValue }}</span>
                        </div>
                        <div class="suggestion-row2">{{ s.fix }}</div>
                      </div>
                    </li>
                  </ul>
                </transition>
              </div>
            </template>
            <template v-if="spamPositives.length">
              <h4>Pozytywne cechy:</h4>
              <ul>
                <li v-for="(p, i) in spamPositives" :key="'pos'+i" style="color:#2e7d32;">
                  <b>{{ p.feature }}</b>: {{ p.impact }}<br/>
                  <span>{{ p.details }}</span>
                </li>
              </ul>
            </template>
          </div>
        </div>
      </v-col>
  <v-col cols="12" md="9">
        <div class="campaign-edit">
          <v-text-field
            v-model="editedCampaign.subject"
            label="Temat"
            readonly
            dense
            hide-details
          />
          <div style="height:10px;"></div>
          <div class="wysiwyg-preview">
            <div class="wysiwyg-preview-box" @dblclick="showHtmlEditor = true">
              <div style="display: flex; align-items: center; justify-content: space-between;">
                <div class="wysiwyg-label-inside">Treść maila</div>
                <v-btn x-small color="primary" variant="text" style="margin-right:2px;" @click.stop="openEditor()">
                  <v-icon left small>mdi-pencil</v-icon> Edycja
                </v-btn>
              </div>
              <div v-html="mailContent" />
            </div>
            <div v-if="showHtmlEditor" class="wysiwyg-editor-dialog">
              <div class="wysiwyg-editor-overlay" @click="closeEditor()"></div>
              <div class="wysiwyg-editor-content">
                <div id="email-builder-modal" style="min-width:600px; min-height:400px;">
                  <email-builder-js
                    ref="emailBuilderRef"
                  ></email-builder-js>
                  <div style="text-align:right; margin-top:10px;">
                    <v-btn color="primary" @click="saveEmailBuilderContent">Zamknij edytor</v-btn>
                  </div>
                </div>
              </div>
            </div>
          </div>


        </div>
      </v-col>
    </v-row>
    <email-editor />
  </v-container>
</template>

<script setup>
import { ref, computed, defineProps, defineEmits, watch } from "vue";
import { onMounted, nextTick } from 'vue';
const emailBuilderRef = ref(null);
import FileDrop from "./FileDrop.vue";
import axios from "axios";
import { Campaigns } from '../services/campaigns.js';

import EmailEditor from "../components/EmailEditor.vue";

const props = defineProps({
  campaignId: {
    type: [String, Number],
    required: true
  }
});

const emit = defineEmits(["save", "cancel"]);
const showHtmlEditor = ref(false);
const form = ref(null);
const isValid = ref(false);
const editedCampaign = ref({
  id: null,
  customer: null,
  name: '',
  dateEnd: '',
  dateStart: '',
  from: '',
  address: '',
  mailContent: '',
  file: null,
  mailsCount: 0,
  htmlContent: '',
  textContent: '',
  suggestions: [],
  progress: 0,
  feedback: '',
  spamRating: 0,
  subject: '',
  scoring: 0,
  active: false,
});


async function loadCampaign() {
  if (!props.campaignId) return;
  const data = await Campaigns.getCampaignById(props.campaignId);
  let suggestions = [];
  if (Array.isArray(data.suggestions)) {
    suggestions = data.suggestions.map(s => ({
      problem: s.problem || '',
      impact: s.impact || '',
      fix: s.fix || '',
      scoreValue: s.scoreValue || '0'
    }));
  }
  editedCampaign.value = {
    ...data,
    suggestions,
    mailsCount: data.mailsCount || 0,
    progress: data.progress || 0,
    feedback: data.feedback || '',
    spamRating: data.spamRating || 0,
    subject: data.subject || '',
  };
}

watch(() => props.campaignId, () => {
  loadCampaign();
}, { immediate: true });
const chatGptDialog = ref(false);
const chatGptProducts = ref("");
const chatGptTarget = ref("");
const fileDropRef = ref(null);
const addressList = ref(["test@test.pl"]);

const mailContent = computed({
  get: () => editedCampaign.value.htmlContent || editedCampaign.value.mailContent || "",
  set: (val) => {
    editedCampaign.value = { ...editedCampaign.value, mailContent: val, htmlContent: val };
  },
});

const spamScore = computed({
  get: () => Number(editedCampaign.value.scoring) || 0,
  set: v => { editedCampaign.value.scoring = Number(v) || 0; }
});
const spamRatingLabel = ref('');
const spamSuggestions = computed(() => editedCampaign.value.suggestions || []);
const negativeSuggestions = computed(() => spamSuggestions.value.filter(s => parseFloat(s.scoreValue) > 0));
const positiveSuggestions = computed(() => spamSuggestions.value.filter(s => parseFloat(s.scoreValue) < 0));
const showNeg = ref(true);
const showPos = ref(false);

const spamPositives = ref([]);
const spamRatingStyle = computed(() => {
  let bg = '#e0f7fa';
  if (spamScore.value >= 61) bg = '#ffebee';
  else if (spamScore.value >= 31) bg = '#fffde7';
  else bg = '#e8f5e9';
  return {
    background: bg,
    borderRadius: '8px',
    padding: '12px',
    marginBottom: '8px',
  };
});





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

function openEditor() {
  showHtmlEditor.value = true;
  nextTick(() => {
    if (emailBuilderRef.value) {
      emailBuilderRef.value.setAttribute('content', mailContent.value);
    }
  });
}


function closeEditor() {
  showHtmlEditor.value = false;
}

function saveEmailBuilderContent() {
  // Pobierz HTML z web componentu i zapisz do modelu
  if (emailBuilderRef.value) {
    // email-builder-js web component exposes .getHtml() or .innerHTML
    let html = '';
    if (typeof emailBuilderRef.value.getHtml === 'function') {
      html = emailBuilderRef.value.getHtml();
    } else {
      html = emailBuilderRef.value.innerHTML;
    }
    mailContent.value = html;
  }
  closeEditor();
}

</script>

<style scoped>
.campaign-edit {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 24px;
  overflow-y: auto;
}
.spam-rating-box {
  margin-top: 16px;
  margin-bottom: 8px;
}
.spam-rating-label {
  font-size: 1.1em;
  margin-top: 4px;
}
.spam-suggestions {
  margin-top: 8px;
  font-size: 0.98em;
}

.suggestion-list {
  list-style: none;
  padding: 0;
  margin: 0;
}
.suggestion-item {
  margin-bottom: 16px;
  text-align: left;
}
.suggestion-frame {
  border: 1px solid rgba(102, 126, 234, 0.2);
  border-radius: 12px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}
.suggestion-row1 {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  font-size: 1em;
  font-weight: 500;
  padding: 6px 12px 6px 12px;
}
.suggestion-row2 {
  font-size: 0.92em;
  color: #888;
  margin-top: 2px;
  text-align: left;
  padding: 6px 12px 10px 12px;
}
.suggestion-group {
  margin-bottom: 18px;
}
.suggestion-group-header {
  font-weight: 600;
  font-size: 1.08em;
  cursor: pointer;
  user-select: none;
  margin-bottom: 6px;
  display: flex;
  align-items: center;
}
.group-toggle {
  font-size: 1.1em;
  margin-right: 6px;
}
.fade-enter-active, .fade-leave-active {
  transition: all 0.2s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
  max-height: 0;
}
.suggestion-row1 {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  font-size: 1em;
  font-weight: 500;
}
.suggestion-problem {
  flex: 1;
  text-align: left;
}
.suggestion-score-circle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #f5f5f5;
  border: 1.5px solid #bbb;
  font-size: 0.98em;
  font-weight: 600;
  margin-left: 10px;
}
.suggestion-row2 {
  font-size: 0.92em;
  color: #888;
  margin-top: 2px;
  text-align: left;
}

.edit-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  width: 100%;
  padding: 16px;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
  border-radius: 12px;
  border: 1px solid rgba(102, 126, 234, 0.1);
}

.edit-header h2 {
  color: #333;
  margin: 0;
  font-weight: 600;
}

.actions {
  display: flex;
  gap: 8px;
  justify-content: flex-start;
  flex: 1;
}

.actions .v-btn {
  border-radius: 8px !important;
  transition: all 0.3s ease !important;
}

.actions .v-btn:hover {
  transform: translateY(-2px) !important;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15) !important;
}

.title {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  flex: 1;
}

.v-form {
  margin-top: 16px;
}
  .v-form {
    margin-top: 16px;
  }
  .wysiwyg-label-inside {
    font-size: 0.75em;
    color: #757575;
    margin-bottom: 2px;
    margin-left: 2px;
    font-weight: 500;
    text-align: left;
  }

.wysiwyg-label-inside {
  font-size: 0.85em;
  color: #757575;
  margin-bottom: 2px;
  margin-left: 2px;
  font-weight: 500;
  text-align: left;
}

.wysiwyg-preview-box {
  border: 1px solid #eee;
  border-radius: 6px;
  padding: 12px;
  background: #fafafa;
  min-height: 60px;
}

.wysiwyg-editor-dialog {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
}
.wysiwyg-editor-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0,0,0,0.25);
  z-index: 1;
}
.wysiwyg-editor-content {
  position: relative;
  z-index: 2;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 2px 16px rgba(60,60,120,0.18);
  padding: 24px 18px 12px 18px;
  min-width: 420px;
  max-width: 90vw;
}
</style>
