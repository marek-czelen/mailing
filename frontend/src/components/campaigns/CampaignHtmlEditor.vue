<template>
  <div class="campaign-html-editor">
    <TinyMCEEditor v-model="content" :init="editorConfig" />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import TinyMCEEditor from '@tinymce/tinymce-vue'
import 'tinymce/tinymce'
import 'tinymce/icons/default'
import 'tinymce/themes/silver'
import 'tinymce/models/dom'
import 'tinymce/plugins/advlist'
import 'tinymce/plugins/autolink'
import 'tinymce/plugins/anchor'
import 'tinymce/plugins/charmap'
import 'tinymce/plugins/code'
import 'tinymce/plugins/fullscreen'
import 'tinymce/plugins/image'
import 'tinymce/plugins/insertdatetime'
import 'tinymce/plugins/link'
import 'tinymce/plugins/lists'
import 'tinymce/plugins/media'
import 'tinymce/plugins/preview'
import 'tinymce/plugins/searchreplace'
import 'tinymce/plugins/table'
import 'tinymce/plugins/visualblocks'
import 'tinymce/plugins/wordcount'
import 'tinymce/skins/ui/oxide/skin.min.css'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue'])

const content = computed({
  get: () => props.modelValue,
  set: value => emit('update:modelValue', value)
})

const editorConfig = {
  height: 520,
  menubar: false,
  plugins: 'advlist anchor autolink charmap code fullscreen image insertdatetime link lists media preview searchreplace table visualblocks wordcount',
  toolbar: [
    'undo redo | blocks | fontfamily fontsize | bold italic underline strikethrough | forecolor backcolor',
    'alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image table | removeformat code preview'
  ],
  toolbar_mode: 'sliding',
  font_family_formats: 'Arial=arial,helvetica,sans-serif;Georgia=georgia,palatino,serif;Tahoma=tahoma,arial,sans-serif;Times New Roman=times new roman,times,serif;Verdana=verdana,geneva,sans-serif;Courier New=courier new,courier,monospace',
  font_size_formats: '8pt 10pt 12pt 14pt 16pt 18pt 24pt 36pt 48pt',
  block_formats: 'Paragraph=p; Heading 1=h1; Heading 2=h2; Heading 3=h3; Blockquote=blockquote',
  branding: false,
  statusbar: true,
  resize: false,
  skin: false,
  content_css: false,
  convert_urls: false,
  relative_urls: false,
  image_title: true,
  table_default_styles: { width: '100%' },
  content_style: 'body { font-family: Arial, Helvetica, sans-serif; font-size: 15px; margin: 20px; } img { max-width: 100%; height: auto; }'
}
</script>

<style scoped>
.campaign-html-editor {
  min-height: 520px;
}

.campaign-html-editor :deep(.tox-tinymce) {
  border: 1px solid #dfe3e8;
  border-radius: 8px;
}

.campaign-html-editor :deep(.tox .tox-toolbar-overlord),
.campaign-html-editor :deep(.tox .tox-toolbar__primary) {
  background: #f7f8fa;
}
</style>