<template>
  <!-- 
    WIDOK EDYTORA BLOKOWEGO E-MAILI
    =================================
    Pełny edytor do tworzenia marketingowych szablonów email.
    Zawiera: drag & drop, AI asystent, placeholdery, podgląd na żywo, spam scoring.
  -->
  <div class="block-editor-view">
    <BlockEmailEditorEnhanced />
  </div>
</template>

<script>
import BlockEmailEditorEnhanced from '../components/BlockEmailEditorEnhanced.vue';

export default {
  name: 'BlockEditorView',
  components: {
    BlockEmailEditorEnhanced
  }
};
</script>

<style scoped>
.block-editor-view {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;
  background: #f6f7f9;
}
</style>