<template>
  <div class="email-editor">
    <v-container fluid>
      <v-row>
        <!-- Panel edycji -->
        <v-col cols="4" class="editor-panel">
          <v-card class="pa-4">
            <h3>Edytor szablonu e-mail</h3>
            
            <!-- Wybór szablonu -->
            <v-divider class="my-4"></v-divider>
            <h4>Wybór szablonu</h4>
            <v-select
              v-model="selectedTemplate"
              :items="templates"
              label="Szablon e-maila"
              variant="outlined"
              density="compact"
              class="mb-3"
            ></v-select>

            <!-- Podstawowe ustawienia -->
            <v-divider class="my-4"></v-divider>
            <h4>Podstawowe informacje</h4>
            <v-text-field
              v-model="emailData.subject"
              label="Temat e-maila"
              variant="outlined"
              density="compact"
              class="mb-3"
            ></v-text-field>
            
            <v-text-field
              v-model="emailData.previewText"
              label="Tekst podglądu"
              variant="outlined"
              density="compact"
              class="mb-3"
            ></v-text-field>

            <!-- Nagłówek -->
            <v-divider class="my-4"></v-divider>
            <h4>Nagłówek</h4>
            <v-text-field
              v-model="emailData.header.title"
              label="Tytuł nagłówka"
              variant="outlined"
              density="compact"
              class="mb-3"
            ></v-text-field>
            
            <v-text-field
              v-model="emailData.header.logoUrl"
              label="URL logo"
              variant="outlined"
              density="compact"
              class="mb-3"
            ></v-text-field>

            <!-- Treść główna -->
            <v-divider class="my-4"></v-divider>
            <h4>Treść główna</h4>
            <v-text-field
              v-model="emailData.content.title"
              label="Tytuł główny"
              variant="outlined"
              density="compact"
              class="mb-3"
            ></v-text-field>
            
            <v-textarea
              v-model="emailData.content.text"
              label="Tekst główny"
              variant="outlined"
              density="compact"
              rows="4"
              class="mb-3"
            ></v-textarea>

            <!-- Przycisk CTA -->
            <v-divider class="my-4"></v-divider>
            <h4>Przycisk akcji</h4>
            <v-text-field
              v-model="emailData.button.text"
              label="Tekst przycisku"
              variant="outlined"
              density="compact"
              class="mb-3"
            ></v-text-field>
            
            <v-text-field
              v-model="emailData.button.url"
              label="Link przycisku"
              variant="outlined"
              density="compact"
              class="mb-3"
            ></v-text-field>

            <v-text-field
              v-model="emailData.button.color"
              label="Kolor przycisku"
              variant="outlined"
              density="compact"
              type="color"
              class="mb-3"
            ></v-text-field>

            <!-- Stopka -->
            <v-divider class="my-4"></v-divider>
            <h4>Stopka</h4>
            <v-textarea
              v-model="emailData.footer.text"
              label="Tekst stopki"
              variant="outlined"
              density="compact"
              rows="3"
              class="mb-3"
            ></v-textarea>

            <!-- Akcje -->
            <v-divider class="my-4"></v-divider>
            <v-btn 
              @click="generateHtml" 
              color="primary" 
              class="mb-2 mr-2"
              :loading="isGenerating"
            >
              Generuj HTML
            </v-btn>
            <v-btn 
              @click="sendTestEmail" 
              color="success" 
              class="mb-2"
              :disabled="!generatedHtml"
            >
              Wyślij test
            </v-btn>
          </v-card>
        </v-col>

        <!-- Podgląd -->
        <v-col cols="8" class="preview-panel">
          <v-card class="pa-4">
            <div class="d-flex justify-space-between align-center mb-4">
              <h3>Podgląd e-maila</h3>
              <v-btn-toggle v-model="previewMode" mandatory>
                <v-btn value="desktop" size="small">
                  <v-icon>mdi-monitor</v-icon>
                  Desktop
                </v-btn>
                <v-btn value="mobile" size="small">
                  <v-icon>mdi-cellphone</v-icon>
                  Mobile
                </v-btn>
              </v-btn-toggle>
            </div>

            <div 
              :class="[
                'preview-container',
                previewMode === 'mobile' ? 'mobile-preview' : 'desktop-preview'
              ]"
            >
              <div v-if="generatedHtml" v-html="generatedHtml" class="email-preview"></div>
              <div v-else class="text-center pa-8 text-grey">
                Kliknij "Generuj HTML" aby zobaczyć podgląd
              </div>
            </div>

            <!-- Kod HTML do skopiowania -->
            <v-divider class="my-4"></v-divider>
            <div v-if="generatedHtml">
              <h4>Kod HTML:</h4>
              <v-textarea
                :value="generatedHtml"
                readonly
                variant="outlined"
                rows="6"
                class="mt-2"
              ></v-textarea>
              <v-btn @click="copyToClipboard" color="primary" size="small">
                <v-icon left>mdi-content-copy</v-icon>
                Skopiuj HTML
              </v-btn>
            </div>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
import { render } from '@vue-email/render';
import EmailTemplate from './EmailTemplate.vue';
import PromoEmailTemplate from './templates/PromoEmailTemplate.vue';
import NewsletterTemplate from './templates/NewsletterTemplate.vue';

export default {
  name: 'EmailEditor',
  components: {
    EmailTemplate,
    PromoEmailTemplate,
    NewsletterTemplate
  },
  data() {
    return {
      isGenerating: false,
      previewMode: 'desktop',
      generatedHtml: '',
      selectedTemplate: 'basic',
      templates: [
        { value: 'basic', text: 'Podstawowy' },
        { value: 'promo', text: 'Promocyjny' },
        { value: 'newsletter', text: 'Newsletter' }
      ],
      emailData: {
        subject: 'Witaj w naszym newsletterze!',
        previewText: 'Sprawdź nasze najnowsze nowości i oferty specjalne.',
        header: {
          title: 'Moja Firma',
          logoUrl: 'https://via.placeholder.com/150x50?text=LOGO'
        },
        content: {
          title: 'Witaj w naszym newsletterze!',
          text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.'
        },
        button: {
          text: 'Zobacz więcej',
          url: 'https://example.com',
          color: '#007bff'
        },
        footer: {
          text: '© 2025 Moja Firma. Wszystkie prawa zastrzeżone.\nJeśli nie chcesz otrzymywać tych e-maili, możesz się wypisać.'
        }
      }
    };
  },
  methods: {
    async generateHtml() {
      this.isGenerating = true;
      try {
        let templateComponent, templateProps;

        // Wybieramy odpowiedni szablon i przygotowujemy jego dane
        switch (this.selectedTemplate) {
          case 'promo':
            templateComponent = PromoEmailTemplate;
            templateProps = {
              previewText: this.emailData.previewText,
              heroTitle: this.emailData.content.title,
              heroSubtitle: 'Specjalna oferta tylko dla Ciebie!',
              contentText: this.emailData.content.text,
              buttonText: this.emailData.button.text,
              buttonUrl: this.emailData.button.url,
              footerText: this.emailData.footer.text
            };
            break;

          case 'newsletter':
            templateComponent = NewsletterTemplate;
            templateProps = {
              previewText: this.emailData.previewText,
              companyName: this.emailData.header.title,
              title: this.emailData.content.title,
              recipientName: 'Czytelniku',
              content: this.emailData.content.text,
              quote: 'Dziękujemy za bycie z nami!',
              ctaText: this.emailData.button.text,
              ctaUrl: this.emailData.button.url,
              senderName: 'Zespół ' + this.emailData.header.title,
              senderTitle: 'Newsletter',
              footerText: this.emailData.footer.text
            };
            break;

          default: // basic
            templateComponent = EmailTemplate;
            templateProps = {
              previewText: this.emailData.previewText,
              title: this.emailData.header.title,
              logoUrl: this.emailData.header.logoUrl,
              contentTitle: this.emailData.content.title,
              contentText: this.emailData.content.text,
              buttonText: this.emailData.button.text,
              buttonUrl: this.emailData.button.url,
              buttonColor: this.emailData.button.color,
              footerText: this.emailData.footer.text
            };
        }

        // Renderujemy wybrany szablon
        this.generatedHtml = await render(templateComponent, templateProps);
        
      } catch (error) {
        console.error('Błąd podczas generowania HTML:', error);
        this.generatedHtml = this.createFallbackHtml();
      } finally {
        this.isGenerating = false;
      }
    },

    createFallbackHtml() {
      // Fallback - prosty HTML gdy Vue Email nie działa
      return `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>${this.emailData.subject}</title>
        </head>
        <body style="background-color: #f6f9fc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif; margin: 0; padding: 40px;">
          <div style="background-color: #ffffff; border: 1px solid #f0f0f0; padding: 45px; margin: 0 auto; border-radius: 8px; max-width: 600px;">
            <!-- Header -->
            <div style="text-align: center; margin-bottom: 32px;">
              <img src="${this.emailData.header.logoUrl}" alt="${this.emailData.header.title}" style="max-width: 150px;">
            </div>
            
            <!-- Main Content -->
            <h1 style="color: #333; font-size: 24px; font-weight: bold; text-align: center; margin: 0 0 32px;">${this.emailData.content.title}</h1>
            <p style="color: #333; font-size: 16px; line-height: 26px; margin: 0 0 32px;">${this.emailData.content.text}</p>
            
            <!-- Button -->
            <div style="text-align: center; margin: 32px 0;">
              <a href="${this.emailData.button.url}" style="background-color: ${this.emailData.button.color}; border-radius: 5px; color: #fff; font-size: 16px; font-weight: bold; text-decoration: none; display: inline-block; padding: 12px 24px;">${this.emailData.button.text}</a>
            </div>
            
            <!-- Divider -->
            <hr style="border: none; border-top: 1px solid #eaeaea; margin: 32px 0;">
            
            <!-- Footer -->
            <p style="color: #666; font-size: 12px; line-height: 18px; text-align: center; margin: 0; white-space: pre-line;">${this.emailData.footer.text}</p>
          </div>
        </body>
        </html>
      `;
    },
    
    async copyToClipboard() {
      try {
        await navigator.clipboard.writeText(this.generatedHtml);
        // Można dodać toast notification
        console.log('HTML skopiowany do schowka');
      } catch (error) {
        console.error('Nie udało się skopiować:', error);
      }
    },

    sendTestEmail() {
      // Emit event z danymi e-maila do wysłania
      this.$emit('send-test-email', {
        html: this.generatedHtml,
        subject: this.emailData.subject,
        previewText: this.emailData.previewText
      });
    }
  },

  watch: {
    emailData: {
      deep: true,
      handler() {
        // Automatycznie regeneruj podgląd przy zmianie danych
        if (this.generatedHtml) {
          this.generateHtml();
        }
      }
    },
    selectedTemplate: {
      handler() {
        // Regeneruj podgląd przy zmianie szablonu
        this.generateHtml();
      }
    }
  },

  mounted() {
    // Automatycznie generuj podgląd przy załadowaniu
    this.generateHtml();
  }
};
</script>

<style scoped>
.email-editor {
  height: 100vh;
  overflow: hidden;
}

.editor-panel {
  height: 100vh;
  overflow-y: auto;
  border-right: 1px solid #e0e0e0;
}

.preview-panel {
  height: 100vh;
  overflow-y: auto;
}

.preview-container {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 20px;
  background: #f5f5f5;
  min-height: 500px;
  transition: all 0.3s ease;
}

.desktop-preview {
  max-width: 100%;
}

.mobile-preview {
  max-width: 375px;
  margin: 0 auto;
}

.email-preview {
  background: white;
  border-radius: 4px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.v-card {
  height: fit-content;
}

/* Stylowanie dla podglądu e-maila */
:deep(.email-preview table) {
  border-collapse: collapse;
  width: 100%;
}

:deep(.email-preview td) {
  padding: 0;
}

:deep(.email-preview img) {
  max-width: 100%;
  height: auto;
}
</style>