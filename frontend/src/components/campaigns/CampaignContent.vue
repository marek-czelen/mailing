<template>
  <div class="campaign-content">
    <div class="content-header">
      <div class="header-info">
        <h3>Treść kampanii</h3>
        <p>Podgląd i edycja zawartości email</p>
      </div>
      <v-btn 
        color="primary" 
        variant="outlined"
        @click="$emit('edit-template')"
      >
        <v-icon left>mdi-pencil</v-icon>
        Edytuj treść
      </v-btn>
    </div>

    <div class="content-grid">
      <!-- Email Preview Card -->
      <v-card class="preview-card">
        <v-card-title class="card-title">
          <v-icon color="primary">mdi-email-variant</v-icon>
          Podgląd email
        </v-card-title>
        <v-card-text>
          <!-- Email Header -->
          <div class="email-header">
            <div class="email-from">
              <strong>Od:</strong> {{ campaign.senderName || 'Nazwa nadawcy' }} 
              &lt;{{ campaign.senderEmail || 'email@example.com' }}&gt;
            </div>
            <div class="email-subject">
              <strong>Temat:</strong> {{ campaign.subject || 'Brak tematu' }}
            </div>
            <div class="email-date">
              <strong>Data:</strong> {{ formatDate(new Date()) }}
            </div>
          </div>

          <!-- Email Content Preview -->
          <div class="email-preview">
            <div class="preview-frame">
              <div v-if="campaign.template" class="template-preview">
                <!-- Template Preview -->
                <div class="template-header">
                  <h2>{{ campaign.subject }}</h2>
                </div>
                <div class="template-content">
                  <p>To jest podgląd treści kampanii bazującej na szablonie: <strong>{{ campaign.template }}</strong></p>
                  
                  <!-- Sample content based on template -->
                  <div v-if="campaign.template === 'promo1'" class="promo-content">
                    <div class="hero-section">
                      <h3>🎉 Specjalna promocja tylko dla Ciebie!</h3>
                      <p>Skorzystaj z naszej limitowanej oferty i zaoszczędź nawet do 50%</p>
                      <div class="cta-button">Sprawdź ofertę</div>
                    </div>
                    <div class="products-section">
                      <h4>Wybrane produkty</h4>
                      <div class="product-grid">
                        <div class="product-item">Produkt 1</div>
                        <div class="product-item">Produkt 2</div>
                        <div class="product-item">Produkt 3</div>
                      </div>
                    </div>
                  </div>

                  <div v-else-if="campaign.template === 'newsletter1'" class="newsletter-content">
                    <div class="newsletter-header">
                      <h3>📰 Najnowsze aktualności</h3>
                    </div>
                    <div class="news-items">
                      <div class="news-item">
                        <h4>Artykuł 1</h4>
                        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit...</p>
                      </div>
                      <div class="news-item">
                        <h4>Artykuł 2</h4>
                        <p>Sed do eiusmod tempor incididunt ut labore et dolore...</p>
                      </div>
                    </div>
                  </div>

                  <div v-else-if="campaign.template === 'welcome1'" class="welcome-content">
                    <div class="welcome-header">
                      <h3>👋 Witaj w naszej społeczności!</h3>
                      <p>Dziękujemy za dołączenie do nas. Oto co możesz zrobić jako następne:</p>
                    </div>
                    <div class="welcome-steps">
                      <div class="step">1. Uzupełnij swój profil</div>
                      <div class="step">2. Przeglądaj nasze produkty</div>
                      <div class="step">3. Skontaktuj się z nami</div>
                    </div>
                  </div>

                  <div v-else class="generic-content">
                    <p>Treść kampanii zostanie wygenerowana na podstawie wybranego szablonu.</p>
                  </div>
                </div>

                <div class="template-footer">
                  <p>© 2025 Twoja Firma. Wszystkie prawa zastrzeżone.</p>
                  <div class="unsubscribe-link">
                    <a href="#" @click.prevent>Wypisz się z newslettera</a>
                  </div>
                </div>
              </div>

              <div v-else class="no-template">
                <v-icon size="64" color="grey-lighten-2">mdi-email-outline</v-icon>
                <h3>Brak treści</h3>
                <p>Wybierz szablon lub utwórz niestandardową treść</p>
                <v-btn color="primary" @click="$emit('edit-template')">
                  <v-icon left>mdi-plus</v-icon>
                  Dodaj treść
                </v-btn>
              </div>
            </div>
          </div>

          <!-- Device Preview Toggle -->
          <div class="device-toggle">
            <v-btn-toggle v-model="previewDevice" mandatory>
              <v-btn value="desktop" size="small">
                <v-icon>mdi-monitor</v-icon>
                Desktop
              </v-btn>
              <v-btn value="tablet" size="small">
                <v-icon>mdi-tablet</v-icon>
                Tablet
              </v-btn>
              <v-btn value="mobile" size="small">
                <v-icon>mdi-cellphone</v-icon>
                Mobile
              </v-btn>
            </v-btn-toggle>
          </div>
        </v-card-text>
      </v-card>

      <!-- Content Details Card -->
      <v-card class="details-card">
        <v-card-title class="card-title">
          <v-icon color="info">mdi-information</v-icon>
          Szczegóły treści
        </v-card-title>
        <v-card-text>
          <div class="detail-section">
            <h4>Szablon</h4>
            <div v-if="campaign.template" class="template-info">
              <div class="template-name">
                <v-icon color="primary">mdi-email-variant</v-icon>
                <span>{{ getTemplateName(campaign.template) }}</span>
              </div>
              <div class="template-description">
                {{ getTemplateDescription(campaign.template) }}
              </div>
            </div>
            <div v-else class="no-template-info">
              <v-icon color="grey">mdi-email-off-outline</v-icon>
              <span>Brak wybranego szablonu</span>
            </div>
          </div>

          <div class="detail-section">
            <h4>Śledzenie</h4>
            <div class="tracking-options">
              <div class="tracking-item">
                <v-icon 
                  :color="campaign.trackOpens ? 'success' : 'grey'" 
                  size="20"
                >
                  {{ campaign.trackOpens ? 'mdi-check-circle' : 'mdi-close-circle' }}
                </v-icon>
                <span>Śledzenie otwarć</span>
              </div>
              <div class="tracking-item">
                <v-icon 
                  :color="campaign.trackClicks ? 'success' : 'grey'" 
                  size="20"
                >
                  {{ campaign.trackClicks ? 'mdi-check-circle' : 'mdi-close-circle' }}
                </v-icon>
                <span>Śledzenie kliknięć</span>
              </div>
              <div class="tracking-item">
                <v-icon 
                  :color="campaign.trackUnsubscribes ? 'success' : 'grey'" 
                  size="20"
                >
                  {{ campaign.trackUnsubscribes ? 'mdi-check-circle' : 'mdi-close-circle' }}
                </v-icon>
                <span>Śledzenie wypisań</span>
              </div>
            </div>
          </div>

          <div class="detail-section">
            <h4>Ustawienia wysyłki</h4>
            <div class="sending-info">
              <div class="info-row">
                <span class="info-label">Tryb wysyłki:</span>
                <v-chip size="small" :color="getSendModeColor(campaign.sendMode)" variant="elevated">
                  {{ getSendModeLabel(campaign.sendMode) }}
                </v-chip>
              </div>
              <div class="info-row">
                <span class="info-label">Szybkość:</span>
                <span>{{ campaign.sendRate || 100 }} emaili/min</span>
              </div>
              <div v-if="campaign.scheduledAt && campaign.sendMode === 'scheduled'" class="info-row">
                <span class="info-label">Zaplanowane na:</span>
                <span>{{ formatDateTime(campaign.scheduledAt) }}</span>
              </div>
            </div>
          </div>

          <!-- Content Actions -->
          <div class="content-actions">
            <v-btn 
              variant="outlined" 
              size="small"
              @click="testSend"
              :disabled="!campaign.template && !campaign.content"
            >
              <v-icon left>mdi-email-send-outline</v-icon>
              Test email
            </v-btn>
            <v-btn 
              variant="outlined" 
              size="small"
              @click="previewInBrowser"
              :disabled="!campaign.template && !campaign.content"
            >
              <v-icon left>mdi-web</v-icon>
              Podgląd w przeglądarce
            </v-btn>
          </div>
        </v-card-text>
      </v-card>
    </div>
  </div>
</template>

<script setup>
import { ref, defineProps, defineEmits } from 'vue'

defineProps({
  campaign: {
    type: Object,
    required: true
  }
})

defineEmits(['edit-template'])

// Reactive data
const previewDevice = ref('desktop')

// Methods
function formatDate(date) {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('pl-PL')
}

function formatDateTime(date) {
  if (!date) return '-'
  return new Date(date).toLocaleString('pl-PL')
}

function getTemplateName(template) {
  const names = {
    'promo1': 'Szablon promocyjny',
    'newsletter1': 'Newsletter standardowy',
    'welcome1': 'Szablon powitalny',
    'transactional1': 'Szablon transakcyjny'
  }
  return names[template] || template
}

function getTemplateDescription(template) {
  const descriptions = {
    'promo1': 'Nowoczesny design z wyróżnionymi CTA',
    'newsletter1': 'Klasyczny layout dla newsletterów',
    'welcome1': 'Przyjazny szablon onboardingowy',
    'transactional1': 'Minimalistyczny szablon transakcyjny'
  }
  return descriptions[template] || 'Niestandardowy szablon'
}

function getSendModeColor(sendMode) {
  const colors = {
    immediate: 'success',
    draft: 'grey',
    scheduled: 'warning'
  }
  return colors[sendMode] || 'grey'
}

function getSendModeLabel(sendMode) {
  const labels = {
    immediate: 'Natychmiast',
    draft: 'Szkic',
    scheduled: 'Zaplanowane'
  }
  return labels[sendMode] || sendMode
}

function testSend() {
  console.log('Wysyłanie test email dla kampanii:', campaign.name)
  // Implement test email functionality
}

function previewInBrowser() {
  console.log('Otwieranie podglądu w przeglądarce')
  // Implement browser preview functionality
}
</script>

<style scoped>
.campaign-content {
  width: 100%;
}

.content-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
}

.header-info h3 {
  margin: 0 0 8px 0;
  font-size: 1.3rem;
  font-weight: 600;
}

.header-info p {
  margin: 0;
  color: #666;
}

.content-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 24px;
}

.preview-card,
.details-card {
  border-radius: 12px !important;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08) !important;
  border: 1px solid rgba(255, 255, 255, 0.2) !important;
  background: rgba(255, 255, 255, 0.9) !important;
  backdrop-filter: blur(10px) !important;
}

.card-title {
  background: linear-gradient(135deg, rgba(32, 41, 80, 0.05) 0%, rgba(81, 91, 173, 0.05) 100%);
  font-weight: 600 !important;
  font-size: 1rem !important;
  padding: 16px 20px !important;
  display: flex !important;
  align-items: center !important;
  gap: 8px !important;
}

/* Email Preview */
.email-header {
  background: #f8f9fa;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 16px;
  font-size: 0.9rem;
}

.email-header > div {
  margin-bottom: 4px;
}

.email-header > div:last-child {
  margin-bottom: 0;
}

.email-preview {
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 16px;
}

.preview-frame {
  background: white;
  min-height: 400px;
  display: flex;
  flex-direction: column;
}

.template-preview {
  padding: 24px;
  flex: 1;
}

.template-header h2 {
  margin: 0 0 16px 0;
  color: #333;
  text-align: center;
}

.template-content {
  margin-bottom: 24px;
}

/* Template-specific styles */
.promo-content .hero-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 32px;
  text-align: center;
  border-radius: 8px;
  margin-bottom: 24px;
}

.promo-content .cta-button {
  background: #ff6b6b;
  color: white;
  padding: 12px 24px;
  border-radius: 6px;
  display: inline-block;
  margin-top: 16px;
  font-weight: 600;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-top: 12px;
}

.product-item {
  background: #f8f9fa;
  padding: 16px;
  text-align: center;
  border-radius: 6px;
}

.newsletter-content .news-item {
  padding: 16px 0;
  border-bottom: 1px solid #eee;
}

.newsletter-content .news-item:last-child {
  border-bottom: none;
}

.newsletter-content .news-item h4 {
  margin: 0 0 8px 0;
  color: #333;
}

.welcome-content .welcome-steps {
  margin-top: 16px;
}

.welcome-content .step {
  background: #e8f5e8;
  padding: 12px 16px;
  margin-bottom: 8px;
  border-radius: 6px;
  border-left: 4px solid #4caf50;
}

.template-footer {
  border-top: 1px solid #eee;
  padding-top: 16px;
  text-align: center;
  font-size: 0.8rem;
  color: #666;
}

.unsubscribe-link {
  margin-top: 8px;
}

.unsubscribe-link a {
  color: #666;
  text-decoration: none;
}

.no-template {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
  color: #666;
}

.no-template h3 {
  margin: 16px 0 8px 0;
}

.no-template p {
  margin-bottom: 24px;
}

.device-toggle {
  display: flex;
  justify-content: center;
}

/* Details Card */
.detail-section {
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.detail-section:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.detail-section h4 {
  margin: 0 0 12px 0;
  font-weight: 600;
  color: #333;
}

.template-info,
.no-template-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.template-name,
.no-template-info {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
}

.template-description {
  color: #666;
  font-size: 0.9rem;
}

.tracking-options {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.tracking-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.sending-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.info-label {
  font-weight: 500;
  color: #666;
}

.content-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 16px;
}

@media (max-width: 1200px) {
  .content-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .content-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  
  .product-grid {
    grid-template-columns: 1fr;
  }
  
  .content-actions {
    justify-content: center;
  }
}
</style>