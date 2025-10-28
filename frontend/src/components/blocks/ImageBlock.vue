<template>
  <div class="image-block">
    <img 
      :src="block.content.src"
      :alt="block.content.alt"
      :style="{
        width: block.content.width + 'px',
        height: block.content.height + 'px',
        maxWidth: '100%',
        borderRadius: block.content.borderRadius ? block.content.borderRadius + 'px' : '0',
        objectFit: 'cover'
      }"
    />
  </div>
</template>

<script>
export default {
  name: 'ImageBlock',
  props: {
    block: {
      type: Object,
      required: true
    }
  }
};
</script>

<style scoped>
.image-block {
  width: 100%;
}
</style>