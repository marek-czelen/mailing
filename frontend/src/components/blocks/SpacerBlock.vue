<template>
  <div class="spacer-block">
    <div 
      :style="{
        height: block.content.height + 'px',
        backgroundColor: block.content.backgroundColor || 'transparent',
        borderRadius: block.content.borderRadius ? block.content.borderRadius + 'px' : '0'
      }"
    >
      <!-- Wizualny wskaźnik wysokości dla edytora -->
      <div class="spacer-indicator">
        {{ block.content.height }}px
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SpacerBlock',
  props: {
    block: {
      type: Object,
      required: true
    }
  }
};
</script>

<style scoped>
.spacer-block {
  width: 100%;
  position: relative;
}

.spacer-indicator {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 12px;
  color: #999;
  background: rgba(255, 255, 255, 0.8);
  padding: 2px 6px;
  border-radius: 3px;
  pointer-events: none;
}
</style>