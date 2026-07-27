<template>
  <!-- Panel właściwości dla bloku social media -->
  <div class="social-properties">
    <div class="mb-3">
      <h6 class="text-caption mb-2">IKONY SPOŁECZNOŚCIOWE</h6>
      
      <div
        v-for="(link, i) in block.content.links"
        :key="i"
        class="social-link-row mb-2 pa-2 rounded bg-grey-lighten-4"
      >
        <div class="d-flex align-center gap-1 mb-1">
          <v-select
            v-model="link.platform"
            :items="platforms"
            label="Platforma"
            variant="outlined"
            density="compact"
            hide-details
            class="flex-1-1"
            @update:model-value="$emit('update')"
          ></v-select>
          <v-btn
            icon
            size="x-small"
            color="error"
            variant="text"
            @click="removeLink(i)"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>
        <v-text-field
          v-model="link.url"
          label="URL"
          variant="outlined"
          density="compact"
          hide-details
          class="mb-1"
          @update:model-value="$emit('update')"
        ></v-text-field>
      </div>

      <v-btn
        size="small"
        variant="outlined"
        block
        @click="addLink"
      >
        <v-icon left>mdi-plus</v-icon>
        Dodaj platformę
      </v-btn>
    </div>

    <v-divider class="mb-3"></v-divider>

    <h6 class="text-caption mb-2">WYGLĄD</h6>

    <v-text-field
      v-model.number="block.content.iconSize"
      label="Rozmiar ikon (px)"
      type="number"
      variant="outlined"
      density="compact"
      class="mb-2"
      @update:model-value="$emit('update')"
    ></v-text-field>

    <v-select
      v-model="block.content.iconShape"
      :items="shapes"
      label="Kształt ikon"
      variant="outlined"
      density="compact"
      class="mb-2"
      @update:model-value="$emit('update')"
    ></v-select>

    <label class="text-caption d-block mb-1">Kolor tła ikon</label>
    <input
      type="color"
      v-model="block.content.iconBgColor"
      class="color-input mb-2"
      @input="$emit('update')"
    />

    <label class="text-caption d-block mb-1">Kolor ikon</label>
    <input
      type="color"
      v-model="block.content.iconColor"
      class="color-input mb-2"
      @input="$emit('update')"
    />
  </div>
</template>

<script>
export default {
  name: 'SocialProperties',
  props: {
    block: {
      type: Object,
      required: true
    }
  },
  emits: ['update'],
  data() {
    return {
      platforms: [
        'Facebook', 'Twitter', 'LinkedIn', 'Instagram', 
        'YouTube', 'TikTok', 'WhatsApp', 'Telegram',
        'Website', 'Email'
      ],
      shapes: [
        { title: 'Kwadrat', value: 'square' },
        { title: 'Koło', value: 'circle' },
        { title: 'Zaokrąglony', value: 'rounded' }
      ]
    };
  },
  methods: {
    addLink() {
      if (!this.block.content.links) {
        this.block.content.links = [];
      }
      this.block.content.links.push({
        platform: 'Facebook',
        url: ''
      });
      this.$emit('update');
    },
    removeLink(index) {
      this.block.content.links.splice(index, 1);
      this.$emit('update');
    }
  }
};
</script>

<style scoped>
.color-input {
  width: 100%;
  height: 36px;
  border: 1px solid #bdbdbd;
  border-radius: 4px;
  cursor: pointer;
  padding: 2px 4px;
}

.social-link-row {
  border: 1px solid #e0e0e0;
}

.gap-1 { gap: 4px; }
.flex-1-1 { flex: 1 1 auto; }
</style>
