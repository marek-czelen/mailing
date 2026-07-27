<template>
  <!-- Blok separatora/linii -->
  <div class="divider-block">
    <hr 
      :style="dividerStyle"
      class="email-divider"
    />
  </div>
</template>

<script>
export default {
  name: 'DividerBlock',
  props: {
    block: {
      type: Object,
      required: true
    }
  },
  computed: {
    dividerStyle() {
      const c = this.block.content || {};
      return {
        border: 'none',
        borderTop: `${c.thickness || 1}px ${c.style || 'solid'} ${c.color || '#e0e0e0'}`,
        width: c.width || '100%',
        margin: '0 auto'
      };
    }
  }
};
</script>

<style scoped>
.divider-block {
  padding: 8px 0;
}

.email-divider {
  display: block;
}
</style>
