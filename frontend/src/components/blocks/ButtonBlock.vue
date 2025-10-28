<template>
  <div class="button-block">
    <a 
      :href="block.content.url"
      :style="{
        display: 'inline-block',
        backgroundColor: block.content.backgroundColor,
        color: block.content.textColor,
        padding: block.content.padding,
        borderRadius: block.content.borderRadius + 'px',
        textDecoration: 'none',
        fontWeight: 'bold',
        cursor: 'pointer',
        border: 'none'
      }"
      @click.prevent
    >
      {{ block.content.text }}
    </a>
  </div>
</template>

<script>
export default {
  name: 'ButtonBlock',
  props: {
    block: {
      type: Object,
      required: true
    }
  }
};
</script>

<style scoped>
.button-block {
  width: 100%;
}
</style>