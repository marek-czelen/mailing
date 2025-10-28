<template>
  <div class="text-block">
    <p 
      :style="{
        fontSize: block.content.fontSize + 'px',
        color: block.content.color,
        fontWeight: block.content.fontWeight,
        fontStyle: block.content.fontStyle,
        margin: 0,
        lineHeight: '1.5'
      }"
    >
      {{ block.content.text }}
    </p>
  </div>
</template>

<script>
export default {
  name: 'TextBlock',
  props: {
    block: {
      type: Object,
      required: true
    }
  }
};
</script>

<style scoped>
.text-block {
  width: 100%;
}
</style>