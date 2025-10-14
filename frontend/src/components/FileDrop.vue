<template>
  <div class="file-drop" @dragover.prevent @drop.prevent="onDrop">
    <v-file-input
      v-model="file"
      label="Upuść plik lub wybierz z dysku"
      accept=".csv,.txt"
      @change="onFileChange"
      hide-details
    />
    <div v-if="uploading">
      Wysyłanie pliku...
      <v-progress-linear :value="progress" height="6" color="primary" :indeterminate="false" />
    </div>
    <div v-if="filePath">Załadowano: {{ filePath }}</div>
  </div>
</template>

<script setup>
import { ref, defineEmits, defineExpose } from 'vue';
import axios from 'axios';

const file = ref(null);
const filePath = ref('');
const uploading = ref(false);
const progress = ref(0);
const emit = defineEmits(['file-uploaded']);

defineExpose({
  reset
});

function reset() {
  file.value = null;
  filePath.value = '';
  progress.value = 0;
}

function onDrop(e) {
  if (e.dataTransfer.files.length) {
    file.value = e.dataTransfer.files[0];
    onFileChange();
  }
}

async function onFileChange() {
  if (!file.value) return;
  uploading.value = true;
  progress.value = 0;
  const formData = new FormData();
  formData.append('file', file.value);
  try {
    const res = await axios.post('/mailing/uploadFile', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (e) => {
        if (e.lengthComputable) {
          progress.value = Math.round((e.loaded * 100) / e.total);
        }
      }
    });
    filePath.value = res.data.path;
    emit('file-uploaded', filePath.value);
  } catch (err) {
    alert('Błąd wysyłania pliku: ' + (err?.response?.data?.message || err.message));
    filePath.value = '';
  } finally {
    uploading.value = false;
    progress.value = 0;
  }
}
</script>

<style scoped>
.file-drop {
  margin-bottom: 16px;
}
</style>
