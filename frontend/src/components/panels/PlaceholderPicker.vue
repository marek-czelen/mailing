<template>
  <!--
    PLACEHOLDER PICKER
    Służy do wstawiania zmiennych personalizacji (merge tags) w treści emaila.
    
    Kategorie placeholderów:
    - Dane kontaktowe (imię, nazwisko, email, firma, telefon)
    - Linki systemowe (unsubscribe, web version, preferences)
    - Dane kampanii (nazwa kampanii, data)
    - Niestandardowe (custom fields)
  -->
  <div class="placeholder-picker">
    <v-card class="pa-3">
      <div class="d-flex align-center mb-3">
        <v-icon color="primary" class="mr-2">mdi-code-braces</v-icon>
        <h6 class="text-caption font-weight-bold">{{ $t('editor.placeholders.title') }}</h6>
      </div>
      
      <v-text-field
        v-model="searchQuery"
        :label="$t('editor.placeholders.search')"
        variant="outlined"
        density="compact"
        prepend-inner-icon="mdi-magnify"
        hide-details
        class="mb-3"
      ></v-text-field>

      <div class="placeholder-categories">
        <!-- Kategoria: Dane kontaktowe -->
        <v-expansion-panels v-model="expandedPanel" variant="accordion">
          <v-expansion-panel value="contact">
            <v-expansion-panel-title class="text-body-2">
              <v-icon size="small" class="mr-2">mdi-account</v-icon>
              {{ $t('editor.placeholders.contactData') }}
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              <div
                v-for="ph in filteredContactPlaceholders"
                :key="ph.tag"
                class="placeholder-item pa-2 mb-1 rounded d-flex align-center justify-space-between"
                @click="insertPlaceholder(ph.tag)"
              >
                <div>
                  <code class="text-caption">{{ ph.tag }}</code>
                  <span class="text-caption text-medium-emphasis ml-2">{{ $t(ph.label) }}</span>
                </div>
                <v-icon size="x-small" color="primary">mdi-plus</v-icon>
              </div>
            </v-expansion-panel-text>
          </v-expansion-panel>

          <!-- Kategoria: Linki systemowe -->
          <v-expansion-panel value="links">
            <v-expansion-panel-title class="text-body-2">
              <v-icon size="small" class="mr-2">mdi-link</v-icon>
              {{ $t('editor.placeholders.systemLinks') }}
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              <div
                v-for="ph in filteredLinkPlaceholders"
                :key="ph.tag"
                class="placeholder-item pa-2 mb-1 rounded d-flex align-center justify-space-between"
                @click="insertPlaceholder(ph.tag)"
              >
                <div>
                  <code class="text-caption">{{ ph.tag }}</code>
                  <span class="text-caption text-medium-emphasis ml-2">{{ $t(ph.label) }}</span>
                </div>
                <v-icon size="x-small" color="primary">mdi-plus</v-icon>
              </div>
            </v-expansion-panel-text>
          </v-expansion-panel>

          <!-- Kategoria: Dane kampanii -->
          <v-expansion-panel value="campaign">
            <v-expansion-panel-title class="text-body-2">
              <v-icon size="small" class="mr-2">mdi-email</v-icon>
              {{ $t('editor.placeholders.campaignData') }}
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              <div
                v-for="ph in filteredCampaignPlaceholders"
                :key="ph.tag"
                class="placeholder-item pa-2 mb-1 rounded d-flex align-center justify-space-between"
                @click="insertPlaceholder(ph.tag)"
              >
                <div>
                  <code class="text-caption">{{ ph.tag }}</code>
                  <span class="text-caption text-medium-emphasis ml-2">{{ $t(ph.label) }}</span>
                </div>
                <v-icon size="x-small" color="primary">mdi-plus</v-icon>
              </div>
            </v-expansion-panel-text>
          </v-expansion-panel>

          <!-- Kategoria: Dane klienta/firmy odbiorcy -->
          <v-expansion-panel value="company">
            <v-expansion-panel-title class="text-body-2">
              <v-icon size="small" class="mr-2">mdi-domain</v-icon>
              {{ $t('editor.placeholders.companyData') }}
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              <div
                v-for="ph in filteredCompanyPlaceholders"
                :key="ph.tag"
                class="placeholder-item pa-2 mb-1 rounded d-flex align-center justify-space-between"
                @click="insertPlaceholder(ph.tag)"
              >
                <div>
                  <code class="text-caption">{{ ph.tag }}</code>
                  <span class="text-caption text-medium-emphasis ml-2">{{ $t(ph.label) }}</span>
                </div>
                <v-icon size="x-small" color="primary">mdi-plus</v-icon>
              </div>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
      </div>

      <!-- Podgląd wstawionego placeholdera -->
      <div v-if="lastInserted" class="mt-3 pa-2 rounded bg-grey-lighten-3">
        <span class="text-caption">{{ $t('editor.placeholders.lastInserted') }}:</span>
        <code class="text-caption ml-2">{{ lastInserted }}</code>
      </div>
    </v-card>
  </div>
</template>

<script>
export default {
  name: 'PlaceholderPicker',

  emits: ['insert-placeholder'],

  data() {
    return {
      searchQuery: '',
      expandedPanel: 'contact',
      lastInserted: null,

      contactPlaceholders: [
        { tag: '{{first_name}}', label: 'editor.placeholders.firstName', category: 'contact' },
        { tag: '{{last_name}}', label: 'editor.placeholders.lastName', category: 'contact' },
        { tag: '{{full_name}}', label: 'editor.placeholders.fullName', category: 'contact' },
        { tag: '{{email}}', label: 'editor.placeholders.email', category: 'contact' },
        { tag: '{{phone}}', label: 'editor.placeholders.phone', category: 'contact' },
        { tag: '{{title}}', label: 'editor.placeholders.title', category: 'contact' },
        { tag: '{{salutation}}', label: 'editor.placeholders.salutation', category: 'contact' }
      ],

      linkPlaceholders: [
        { tag: '{{unsubscribe_link}}', label: 'editor.placeholders.unsubscribeLink', category: 'links' },
        { tag: '{{web_version_link}}', label: 'editor.placeholders.webVersionLink', category: 'links' },
        { tag: '{{preferences_link}}', label: 'editor.placeholders.preferencesLink', category: 'links' },
        { tag: '{{forward_link}}', label: 'editor.placeholders.forwardLink', category: 'links' }
      ],

      campaignPlaceholders: [
        { tag: '{{campaign_name}}', label: 'editor.placeholders.campaignName', category: 'campaign' },
        { tag: '{{campaign_date}}', label: 'editor.placeholders.campaignDate', category: 'campaign' },
        { tag: '{{sender_name}}', label: 'editor.placeholders.senderName', category: 'campaign' },
        { tag: '{{sender_email}}', label: 'editor.placeholders.senderEmail', category: 'campaign' },
        { tag: '{{current_year}}', label: 'editor.placeholders.currentYear', category: 'campaign' }
      ],

      companyPlaceholders: [
        { tag: '{{company_name}}', label: 'editor.placeholders.companyName', category: 'company' },
        { tag: '{{company_position}}', label: 'editor.placeholders.companyPosition', category: 'company' },
        { tag: '{{company_department}}', label: 'editor.placeholders.companyDepartment', category: 'company' },
        { tag: '{{company_address}}', label: 'editor.placeholders.companyAddress', category: 'company' },
        { tag: '{{company_city}}', label: 'editor.placeholders.companyCity', category: 'company' },
        { tag: '{{company_nip}}', label: 'editor.placeholders.companyNip', category: 'company' }
      ]
    };
  },

  computed: {
    allPlaceholders() {
      return [
        ...this.contactPlaceholders,
        ...this.linkPlaceholders,
        ...this.campaignPlaceholders,
        ...this.companyPlaceholders
      ];
    },

    filteredContactPlaceholders() {
      return this.filterBySearch(this.contactPlaceholders);
    },

    filteredLinkPlaceholders() {
      return this.filterBySearch(this.linkPlaceholders);
    },

    filteredCampaignPlaceholders() {
      return this.filterBySearch(this.campaignPlaceholders);
    },

    filteredCompanyPlaceholders() {
      return this.filterBySearch(this.companyPlaceholders);
    }
  },

  methods: {
    filterBySearch(placeholders) {
      if (!this.searchQuery.trim()) return placeholders;
      const query = this.searchQuery.toLowerCase();
      return placeholders.filter(
        ph => ph.tag.toLowerCase().includes(query) || 
              this.$t(ph.label).toLowerCase().includes(query)
      );
    },

    insertPlaceholder(tag) {
      this.lastInserted = tag;
      this.$emit('insert-placeholder', tag);
    }
  }
};
</script>

<style scoped>
.placeholder-picker {
  /* kontener */
}

.placeholder-item {
  cursor: pointer;
  background: #fafafa;
  transition: background 0.15s;
  border: 1px solid transparent;
}

.placeholder-item:hover {
  background: #e8eaf6;
  border-color: #c5cae9;
}

code {
  background: #e8eaf6;
  padding: 1px 6px;
  border-radius: 3px;
  font-size: 11px;
  color: #3949ab;
}

.placeholder-categories {
  max-height: 300px;
  overflow-y: auto;
}
</style>
