<template>
  <div class="block-editor-view">
    <BlockEmailEditor />
  </div>
</template>

<script>
import BlockEmailEditor from '../components/BlockEmailEditor.vue';

export default {
  name: 'BlockEditorView',
  components: {
    BlockEmailEditor
  }
};
</script>

<style scoped>
.block-editor-view {
  width: 100vw;
  height: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;
}
</style>