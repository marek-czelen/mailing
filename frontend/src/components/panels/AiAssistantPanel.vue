<template>
  <!-- 
    PANEL ASYSTENTA AI
    Zapewnia funkcje generowania i ulepszania treści emaili za pomocą AI.
    
    Funkcje:
    - Generowanie treści emaila na podstawie opisu
    - Sugerowanie tematu wiadomości
    - Poprawianie/ulepszanie tekstu
    - Generowanie wariantów A/B
    - Sugerowanie CTA
    - Tłumaczenie treści
  -->
  <div class="ai-assistant-panel">
    <v-card class="pa-3 h-100 d-flex flex-column">
      <!-- Nagłówek -->
      <div class="ai-header mb-3">
        <div class="d-flex align-center gap-2">
          <v-icon color="purple" class="mr-2">mdi-robot</v-icon>
          <h4>{{ $t('editor.ai.title') }}</h4>
        </div>
        <p class="text-caption text-medium-emphasis mt-1">
          {{ $t('editor.ai.subtitle') }}
        </p>
      </div>
      <v-divider class="mb-3"></v-divider>

      <!-- Przewijalna zawartość -->
      <div class="ai-content flex-1-1 overflow-y-auto">
        
        <!-- SEKCJA: Generowanie treści -->
        <div class="ai-section mb-4">
          <h6 class="text-caption font-weight-bold mb-2">{{ $t('editor.ai.generateContent').toUpperCase() }}</h6>
          
          <v-textarea
            v-model="generatePrompt"
            :label="$t('editor.ai.generateContentDesc')"
            variant="outlined"
            density="compact"
            rows="2"
            class="mb-2"
            :placeholder="$t('editor.ai.generateContentPlaceholder')"
            hide-details
          ></v-textarea>

          <div class="d-flex flex-wrap gap-1 mb-2">
            <v-chip
              v-for="tone in tones"
              :key="tone.value"
              :color="selectedTone === tone.value ? 'purple' : undefined"
              :variant="selectedTone === tone.value ? 'elevated' : 'outlined'"
              size="small"
              @click="selectedTone = tone.value"
              class="cursor-pointer"
            >
              {{ $t('editor.ai.tones.' + tone.value) }}
            </v-chip>
          </div>

          <v-btn
            color="purple"
            variant="elevated"
            size="small"
            block
            :loading="isGenerating"
            @click="generateEmailContent"
            :disabled="!generatePrompt.trim()"
          >
            <v-icon left>mdi-magic</v-icon>
            {{ $t('editor.ai.generate') }}
          </v-btn>
        </div>

        <v-divider class="mb-3"></v-divider>

        <!-- SEKCJA: Generowanie tematu -->
        <div class="ai-section mb-4">
          <h6 class="text-caption font-weight-bold mb-2">{{ $t('editor.ai.subjectLine').toUpperCase() }}</h6>
          
          <v-text-field
            v-model="subjectContext"
            :label="$t('editor.ai.subjectContext')"
            variant="outlined"
            density="compact"
            class="mb-2"
            hide-details
          ></v-text-field>

          <v-btn
            color="purple"
            variant="outlined"
            size="small"
            block
            :loading="isGeneratingSubject"
            @click="generateSubjectLine"
            :disabled="!subjectContext.trim()"
          >
            <v-icon left>mdi-lightbulb</v-icon>
            {{ $t('editor.ai.suggestSubject') }}
          </v-btn>

          <!-- Wygenerowane tematy -->
          <div v-if="generatedSubjects.length > 0" class="mt-2">
            <div
              v-for="(subject, i) in generatedSubjects"
              :key="i"
              class="subject-item pa-2 mb-1 rounded"
              @click="useSubject(subject)"
            >
              <div class="d-flex align-center">
                <span class="text-body-2 flex-1-1">{{ subject }}</span>
                <v-btn icon size="x-small" variant="text" color="primary">
                  <v-icon>mdi-plus</v-icon>
                </v-btn>
              </div>
            </div>
          </div>
        </div>

        <v-divider class="mb-3"></v-divider>

        <!-- SEKCJA: Ulepszanie tekstu -->
        <div class="ai-section mb-4">
          <h6 class="text-caption font-weight-bold mb-2">{{ $t('editor.ai.improveText').toUpperCase() }}</h6>
          
          <v-textarea
            v-model="textToImprove"
            :label="$t('editor.ai.textToImprove')"
            variant="outlined"
            density="compact"
            rows="2"
            class="mb-2"
            hide-details
            :placeholder="selectedBlockText || $t('editor.ai.textToImprovePlaceholder')"
          ></v-textarea>

          <v-select
            v-model="improveStyle"
            :items="improveStyles"
            :label="$t('editor.ai.improveStyle')"
            variant="outlined"
            density="compact"
            class="mb-2"
            hide-details
          ></v-select>

          <v-btn
            color="purple"
            variant="outlined"
            size="small"
            block
            :loading="isImproving"
            @click="improveTextContent"
            :disabled="!textToImprove.trim() && !selectedBlockText"
          >
            <v-icon left>mdi-auto-fix</v-icon>
            {{ $t('editor.ai.improve') }}
          </v-btn>
        </div>

        <v-divider class="mb-3"></v-divider>

        <!-- SEKCJA: CTA -->
        <div class="ai-section mb-4">
          <h6 class="text-caption font-weight-bold mb-2">{{ $t('editor.ai.cta').toUpperCase() }}</h6>
          
          <v-text-field
            v-model="ctaContext"
            :label="$t('editor.ai.ctaContext')"
            variant="outlined"
            density="compact"
            class="mb-2"
            hide-details
          ></v-text-field>

          <v-btn
            color="purple"
            variant="outlined"
            size="small"
            block
            :loading="isGeneratingCTA"
            @click="generateCTASuggestions"
            :disabled="!ctaContext.trim()"
          >
            <v-icon left>mdi-cursor-default-click</v-icon>
            {{ $t('editor.ai.suggestCta') }}
          </v-btn>

          <div v-if="generatedCTAs.length > 0" class="mt-2">
            <div
              v-for="(cta, i) in generatedCTAs"
              :key="i"
              class="cta-item pa-2 mb-1 rounded d-flex align-center"
              @click="useCTA(cta)"
            >
              <span class="text-body-2 flex-1-1">{{ cta }}</span>
              <v-icon size="small" color="primary">mdi-plus</v-icon>
            </div>
          </div>
        </div>

        <v-divider class="mb-3"></v-divider>

        <!-- SEKCJA: Tłumaczenie -->
        <div class="ai-section mb-3">
          <h6 class="text-caption font-weight-bold mb-2">{{ $t('editor.ai.translation').toUpperCase() }}</h6>
          
          <v-textarea
            v-model="translateText"
            :label="$t('editor.ai.textToTranslate')"
            variant="outlined"
            density="compact"
            rows="2"
            class="mb-2"
            hide-details
          ></v-textarea>

          <div class="d-flex gap-2">
            <v-btn
              color="purple"
              variant="outlined"
              size="small"
              :loading="isTranslating === 'en'"
              @click="translateTo('en')"
              :disabled="!translateText.trim()"
            >
              <v-icon left>mdi-translate</v-icon>
              EN
            </v-btn>
            <v-btn
              color="purple"
              variant="outlined"
              size="small"
              :loading="isTranslating === 'pl'"
              @click="translateTo('pl')"
              :disabled="!translateText.trim()"
            >
              <v-icon left>mdi-translate</v-icon>
              PL
            </v-btn>
          </div>
        </div>
      </div>

      <!-- Wynik generowania -->
      <v-expand-transition>
        <div v-if="generatedOutput" class="generated-output mt-3">
          <v-divider class="mb-2"></v-divider>
          <div class="d-flex align-center justify-space-between mb-2">
            <span class="text-caption font-weight-bold">{{ $t('editor.ai.result') }}:</span>
            <div>
              <v-btn icon size="x-small" variant="text" @click="copyGenerated" :title="$t('editor.copyHtml')">
                <v-icon>mdi-content-copy</v-icon>
              </v-btn>
              <v-btn icon size="x-small" variant="text" @click="useGenerated" :title="$t('editor.ai.use')">
                <v-icon color="success">mdi-check</v-icon>
              </v-btn>
              <v-btn icon size="x-small" variant="text" @click="generatedOutput = ''" :title="$t('editor.clear')">
                <v-icon>mdi-close</v-icon>
              </v-btn>
            </div>
          </div>
          <div class="output-content pa-2 rounded bg-grey-lighten-4" v-html="sanitizedOutput"></div>
        </div>
      </v-expand-transition>

      <!-- Stan ładowania -->
      <div v-if="isGenerating || isImproving || isGeneratingSubject || isGeneratingCTA || isTranslating" class="d-flex align-center justify-center py-2">
        <v-progress-linear indeterminate color="purple" height="2"></v-progress-linear>
      </div>
    </v-card>
  </div>
</template>

<script>
import { AiService } from '@/services/ai.js';

export default {
  name: 'AiAssistantPanel',
  
  props: {
    /** Tekst aktualnie zaznaczonego bloku (do ulepszania) */
    selectedBlockText: {
      type: String,
      default: ''
    },
    /** Callback gdy użytkownik chce użyć wygenerowanej treści */
    onUseContent: {
      type: Function,
      default: null
    }
  },

  emits: ['use-content', 'use-subject', 'use-cta', 'improve-text'],

  data() {
    return {
      // Generowanie treści
      generatePrompt: '',
      selectedTone: 'professional',
      isGenerating: false,

      // Temat
      subjectContext: '',
      isGeneratingSubject: false,
      generatedSubjects: [],

      // Ulepszanie
      textToImprove: '',
      improveStyle: 'professional',
      isImproving: false,

      // CTA
      ctaContext: '',
      isGeneratingCTA: false,
      generatedCTAs: [],

      // Tłumaczenie
      translateText: '',
      isTranslating: null,

      // Wynik
      generatedOutput: '',

      // Opcje
      tones: [
        { label: '', value: 'professional' },
        { label: '', value: 'casual' },
        { label: '', value: 'persuasive' },
        { label: '', value: 'urgent' }
      ],

      improveStyles: [
        { title: '', value: 'professional' },
        { title: '', value: 'casual' },
        { title: '', value: 'persuasive' },
        { title: '', value: 'urgent' }
      ]
    };
  },

  mounted() {
    // Init localized labels
    const toneKeys = ['professional', 'casual', 'persuasive', 'urgent'];
    this.tones = toneKeys.map(k => ({ label: this.$t('editor.ai.tones.' + k), value: k }));
    this.improveStyles = toneKeys.map(k => ({ title: this.$t('editor.ai.styles.' + k), value: k }));
  },

  computed: {
    sanitizedOutput() {
      if (!this.generatedOutput) return '';
      // Ensure the output is safe HTML
      return this.generatedOutput
        .replace(/<script[\s\S]*?<\/script>/gi, '')
        .replace(/on\w+="[^"]*"/gi, '');
    }
  },

  methods: {
    async generateEmailContent() {
      if (!this.generatePrompt.trim()) return;
      
      this.isGenerating = true;
      this.generatedOutput = '';
      
      try {
        const content = await AiService.generateContent(this.generatePrompt, {
          tone: this.selectedTone
        });
        this.generatedOutput = content;
        this.$emit('use-content', content);
      } catch (error) {
        console.error('AI generation error:', error);
        this.generatedOutput = '<p class="text-error">Błąd generowania. Spróbuj ponownie.</p>';
      } finally {
        this.isGenerating = false;
      }
    },

    async generateSubjectLine() {
      if (!this.subjectContext.trim()) return;
      
      this.isGeneratingSubject = true;
      try {
        const subject = await AiService.generateSubject(this.subjectContext);
        // Parse multiple subjects
        const subjects = subject.split('\n').filter(s => s.trim());
        this.generatedSubjects = subjects.length > 0 ? subjects : [subject];
      } catch (error) {
        console.error('Subject generation error:', error);
      } finally {
        this.isGeneratingSubject = false;
      }
    },

    async improveTextContent() {
      const text = this.textToImprove.trim() || this.selectedBlockText;
      if (!text) return;
      
      this.isImproving = true;
      this.generatedOutput = '';
      
      try {
        const improved = await AiService.improveText(text, this.improveStyle);
        this.generatedOutput = improved;
        this.$emit('improve-text', improved);
      } catch (error) {
        console.error('Text improvement error:', error);
        this.generatedOutput = '<p class="text-error">Błąd poprawiania tekstu.</p>';
      } finally {
        this.isImproving = false;
      }
    },

    async generateCTASuggestions() {
      if (!this.ctaContext.trim()) return;
      
      this.isGeneratingCTA = true;
      try {
        const ctas = await AiService.generateCTA(this.ctaContext);
        this.generatedCTAs = ctas.filter(c => c.trim());
      } catch (error) {
        console.error('CTA generation error:', error);
      } finally {
        this.isGeneratingCTA = false;
      }
    },

    async translateTo(lang) {
      if (!this.translateText.trim()) return;
      
      this.isTranslating = lang;
      this.generatedOutput = '';
      
      try {
        const translated = await AiService.translate(this.translateText, lang);
        this.generatedOutput = translated;
      } catch (error) {
        console.error('Translation error:', error);
        this.generatedOutput = '<p class="text-error">Błąd tłumaczenia.</p>';
      } finally {
        this.isTranslating = null;
      }
    },

    useSubject(subject) {
      this.$emit('use-subject', subject);
      this.generatedSubjects = [];
    },

    useCTA(cta) {
      this.$emit('use-cta', cta);
      this.generatedCTAs = [];
    },

    copyGenerated() {
      if (this.generatedOutput) {
        navigator.clipboard.writeText(this.generatedOutput).catch(() => {});
      }
    },

    useGenerated() {
      if (this.generatedOutput && this.onUseContent) {
        this.onUseContent(this.generatedOutput);
      }
      this.$emit('use-content', this.generatedOutput);
    }
  }
};
</script>

<style scoped>
.ai-assistant-panel {
  height: 100%;
}

.ai-section {
  /* sekcja */
}

.subject-item,
.cta-item {
  background: #f5f3ff;
  cursor: pointer;
  transition: background 0.2s;
}

.subject-item:hover,
.cta-item:hover {
  background: #ede9fe;
}

.output-content {
  max-height: 200px;
  overflow-y: auto;
  font-size: 13px;
  line-height: 1.5;
}

.cursor-pointer {
  cursor: pointer;
}

.gap-1 {
  gap: 4px;
}

.gap-2 {
  gap: 8px;
}
</style>
