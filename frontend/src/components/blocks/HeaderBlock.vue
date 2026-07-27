<template>
  <!-- Blok nagłówka z logo -->
  <div class="header-block">
    <div :style="{ textAlign: block.style?.textAlign || 'center' }">
      <img
        v-if="block.content?.logoSrc"
        :src="block.content.logoSrc"
        :alt="block.content?.logoAlt || 'Logo'"
        :style="logoStyle"
        class="header-logo"
      />
      <div
        v-if="block.content?.title"
        :style="titleStyle"
        class="header-title"
      >
        {{ block.content.title }}
      </div>
      <div
        v-if="block.content?.subtitle"
        :style="subtitleStyle"
        class="header-subtitle"
      >
        {{ block.content.subtitle }}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'HeaderBlock',
  props: {
    block: {
      type: Object,
      required: true
    }
  },
  computed: {
    logoStyle() {
      const c = this.block.content || {};
      return {
        maxWidth: (c.logoWidth || 200) + 'px',
        height: 'auto',
        marginBottom: c.logoMarginBottom || 16 + 'px',
        display: 'block',
        marginLeft: 'auto',
        marginRight: 'auto'
      };
    },
    titleStyle() {
      const c = this.block.content || {};
      return {
        fontSize: (c.titleSize || 24) + 'px',
        fontWeight: c.titleWeight || 'bold',
        color: c.titleColor || '#1a1a1a',
        marginBottom: '8px',
        fontFamily: c.titleFont || 'inherit'
      };
    },
    subtitleStyle() {
      const c = this.block.content || {};
      return {
        fontSize: (c.subtitleSize || 16) + 'px',
        color: c.subtitleColor || '#666666',
        fontWeight: 'normal',
        fontFamily: c.subtitleFont || 'inherit'
      };
    }
  }
};
</script>

<style scoped>
.header-block {
  padding: 16px 0;
}

.header-logo {
  display: block;
  margin: 0 auto;
}

.header-title {
  line-height: 1.3;
}

.header-subtitle {
  line-height: 1.4;
}
</style>
