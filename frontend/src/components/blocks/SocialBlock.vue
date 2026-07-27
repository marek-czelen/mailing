<template>
  <!-- Blok social media -->
  <div class="social-block">
    <div :style="{ textAlign: block.style?.textAlign || 'center' }">
      <a
        v-for="(link, i) in activeLinks"
        :key="i"
        :href="link.url || '#'"
        :title="link.platform"
        target="_blank"
        rel="noopener"
        class="social-link"
        :style="linkStyle"
      >
        <span class="social-icon" v-html="getSocialIcon(link.platform)"></span>
      </a>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SocialBlock',
  props: {
    block: {
      type: Object,
      required: true
    }
  },
  computed: {
    activeLinks() {
      const links = this.block.content?.links || [];
      return links.filter(l => l.url && l.url.trim());
    },
    linkStyle() {
      const c = this.block.content || {};
      const size = c.iconSize || 32;
      return {
        display: 'inline-block',
        width: size + 'px',
        height: size + 'px',
        margin: '0 6px',
        borderRadius: c.iconShape === 'circle' ? '50%' : `${c.borderRadius || 4}px`,
        backgroundColor: c.iconBgColor || '#3b5998',
        color: c.iconColor || '#ffffff',
        textAlign: 'center',
        lineHeight: size + 'px',
        textDecoration: 'none',
        transition: 'opacity 0.2s'
      };
    }
  },
  methods: {
    getSocialIcon(platform) {
      const icons = {
        facebook: '📘',
        twitter: '🐦',
        linkedin: '💼',
        instagram: '📷',
        youtube: '▶️',
        tiktok: '🎵',
        whatsapp: '💬',
        telegram: '✈️',
        website: '🌐',
        email: '📧'
      };
      return icons[platform?.toLowerCase()] || '🔗';
    }
  }
};
</script>

<style scoped>
.social-block {
  padding: 8px 0;
}

.social-link:hover {
  opacity: 0.8;
}

.social-icon {
  font-size: 16px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}
</style>
