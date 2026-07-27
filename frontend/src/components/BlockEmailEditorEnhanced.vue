<template>
  <!--
    ROZBUDOWANY EDYTOR E-MAILI Z AI
    ================================
    
    Pełny edytor blokowy (drag & drop) do tworzenia marketingowych kampanii email.
    
    FUNKCJE:
    - 7 typów bloków: text, button, image, spacer, divider, social, header
    - Asystent AI: generowanie treści, poprawa tekstu, CTA, tematy, tłumaczenia
    - Placeholdery / merge tag'i do personalizacji
    - Podgląd na żywo (Live Preview)
    - Sprawdzanie spamu (Spam Score)
    - Szablony: zapis, odczyt, duplikacja
    - Undo/Redo (Ctrl+Z / Ctrl+Y)
    - Skróty klawiaturowe
    - Eksport HTML / eksport do kampanii
    - Tryb Desktop / Mobile
    - Responsywny podgląd
  -->
  <div class="block-email-editor-enhanced" @keydown="handleKeyboardShortcut" tabindex="0" ref="editorContainer">
    <v-container fluid class="pa-0 ma-0 fill-height" style="max-width: none;">
      <v-row no-gutters class="ma-0 fill-height">
        
        <!-- ============ PANEL LEWY: BLOKI + SZABLONY + PLACEHOLDERY ============ -->
        <v-col cols="auto" class="left-panel">
          <v-card class="pa-2 h-100 d-flex flex-column" style="border-radius: 0;">
            
            <!-- Zakładki panelu lewego -->
            <v-tabs v-model="leftPanelTab" density="compact" class="mb-2">
              <v-tab value="blocks">
                <v-icon size="small">mdi-view-grid</v-icon>
              </v-tab>
              <v-tab value="placeholders">
                <v-icon size="small">mdi-code-braces</v-icon>
              </v-tab>
              <v-tab value="templates">
                <v-icon size="small">mdi-file-document-multiple</v-icon>
              </v-tab>
            </v-tabs>

            <div class="left-panel-content flex-1-1 overflow-y-auto">
              
              <!-- Panel Bloków -->
              <div v-if="leftPanelTab === 'blocks'">
                <h6 class="text-caption font-weight-bold mb-2 px-1">{{ $t('editor.addBlock').toUpperCase() }}</h6>
                <div
                  v-for="blockType in availableBlocks"
                  :key="blockType.type"
                  class="block-item"
                  @click="addBlock(blockType.type)"
                  draggable="true"
                  @dragstart="onDragStart($event, blockType.type)"
                >
                  <v-icon size="small" class="mr-2">{{ blockType.icon }}</v-icon>
                  <span class="text-body-2">{{ $t('editor.blockTypes.' + blockType.type) }}</span>
                </div>
              </div>

              <!-- Panel Placeholderów -->
              <div v-if="leftPanelTab === 'placeholders'">
                <PlaceholderPicker @insert-placeholder="insertPlaceholderIntoSelection" />
              </div>

              <!-- Panel Szablonów -->
              <div v-if="leftPanelTab === 'templates'">
                <h6 class="text-caption font-weight-bold mb-2 px-1">{{ $t('editor.myTemplates').toUpperCase() }}</h6>
                
                <!-- Loading -->
                <div v-if="templatesLoading" class="text-center py-4">
                  <v-progress-circular indeterminate size="24" color="primary"></v-progress-circular>
                </div>

                <!-- Error -->
                <div v-else-if="templatesError" class="text-center py-2">
                  <p class="text-caption text-error mb-1">{{ templatesError }}</p>
                  <v-btn size="x-small" @click="loadTemplates" variant="outlined">{{ $t('editor.redo') }}</v-btn>
                </div>

                <!-- Lista szablonów -->
                <div v-else-if="availableTemplates.length > 0">
                  <div
                    v-for="template in availableTemplates"
                    :key="template.id"
                    class="template-mini-item pa-2 mb-1 rounded"
                    @click="loadTemplateById(template.id)"
                  >
                    <div class="d-flex align-center">
                      <v-icon size="small" class="mr-2">mdi-file-document</v-icon>
                      <div class="flex-1-1" style="min-width: 0;">
                        <div class="text-body-2 text-truncate">{{ template.name }}</div>
                        <div class="text-caption text-medium-emphasis text-truncate">
                          {{ template.category || $t('editor.categories.other') }}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Pusty stan -->
                <div v-else class="text-center py-4">
                  <v-icon size="32" color="grey-lighten-1">mdi-file-document-outline</v-icon>
                  <p class="text-caption mt-1">{{ $t('editor.noTemplates') }}</p>
                </div>

                <!-- Akcje szablonów -->
                <v-divider class="my-2"></v-divider>
                <v-btn
                  color="success"
                  variant="outlined"
                  size="small"
                  block
                  :disabled="emailBlocks.length === 0"
                  @click="showSaveTemplateDialog = true"
                >
                  <v-icon left size="small">mdi-content-save</v-icon>
                  {{ $t('editor.saveAsTemplate') }}
                </v-btn>
              </div>
            </div>
          </v-card>
        </v-col>

        <!-- ============ PANEL ŚRODKOWY: CANVAS + PODGLĄD ============ -->
        <v-col class="center-panel pa-0">
          <v-card class="h-100 d-flex flex-column" style="border-radius: 0;">
            
            <!-- Górny pasek narzędzi -->
            <div class="editor-toolbar px-3 py-1 d-flex align-center flex-wrap gap-2">
              <!-- Undo/Redo -->
              <v-btn icon size="x-small" variant="text" @click="undo" :disabled="!canUndo" :title="$t('editor.undo') + ' (Ctrl+Z)'">
                <v-icon>mdi-undo</v-icon>
              </v-btn>
              <v-btn icon size="x-small" variant="text" @click="redo" :disabled="!canRedo" :title="$t('editor.redo') + ' (Ctrl+Y)'">
                <v-icon>mdi-redo</v-icon>
              </v-btn>
              
              <v-divider vertical class="mx-1"></v-divider>

              <!-- Tryb canvas -->
              <v-btn-toggle v-model="canvasMode" mandatory density="compact">
                <v-btn value="desktop" size="x-small" title="Desktop (600px)">
                  <v-icon size="small">mdi-monitor</v-icon>
                </v-btn>
                <v-btn value="mobile" size="x-small" title="Mobile (375px)">
                  <v-icon size="small">mdi-cellphone</v-icon>
                </v-btn>
              </v-btn-toggle>

              <v-divider vertical class="mx-1"></v-divider>

              <!-- Akcje -->
              <v-btn size="x-small" variant="text" @click="openPreview" :title="$t('editor.previewHtml')">
                <v-icon left size="small">mdi-eye</v-icon>
                {{ $t('editor.preview') }}
              </v-btn>
              <v-btn size="x-small" variant="text" color="error" @click="clearAll" :title="$t('editor.clearAll')">
                <v-icon left size="small">mdi-delete</v-icon>
                {{ $t('editor.clear') }}
              </v-btn>

              <v-spacer></v-spacer>

              <!-- Licznik bloków -->
              <span class="text-caption text-medium-emphasis">{{ $t('editor.blockCount', { count: emailBlocks.length }) }}</span>

              <!-- Eksport do kampanii -->
              <v-btn
                v-if="isCampaignEditMode"
                size="x-small"
                color="success"
                variant="elevated"
                @click="exportContentToCampaign"
                :disabled="emailBlocks.length === 0"
              >
                <v-icon left size="small">mdi-export</v-icon>
                {{ $t('editor.exportToCampaign') }}
              </v-btn>
            </div>

            <v-divider></v-divider>

            <!-- Obszar canvas + podgląd na żywo -->
            <div class="canvas-area flex-1-1 d-flex" style="min-height: 0;">
              
              <!-- CANVAS -->
              <div class="canvas-wrapper flex-1-1 overflow-y-auto pa-3" style="background: #e8eaed;">
                <div
                  :class="['email-canvas', canvasMode === 'mobile' ? 'mobile-canvas' : 'desktop-canvas']"
                  @drop="onCanvasDrop"
                  @dragover.prevent
                  @dragenter.prevent
                >
                  <!-- Pusty canvas -->
                  <div v-if="emailBlocks.length === 0" class="empty-canvas">
                    <v-icon size="56" color="grey-lighten-1">mdi-email-plus-outline</v-icon>
                    <p class="text-grey mt-2 mb-1">{{ $t('editor.emptyCanvas') }}</p>
                    <p class="text-caption text-grey mb-3">
                      {{ $t('editor.emptyCanvasSub') }}
                    </p>
                    <div class="d-flex gap-2 flex-wrap justify-center">
                      <v-btn
                        v-for="bt in availableBlocks.slice(0, 4)"
                        :key="bt.type"
                        size="small"
                        variant="outlined"
                        @click="addBlock(bt.type)"
                      >
                        <v-icon left size="small">{{ bt.icon }}</v-icon>
                        {{ $t('editor.blockTypes.' + bt.type) }}
                      </v-btn>
                    </div>
                  </div>

                  <!-- Lista bloków -->
                  <div class="blocks-container" v-else>
                    <div
                      v-for="(block, index) in emailBlocks"
                      :key="block.id"
                      class="block-wrapper"
                    >
                      <!-- Drop zone górna -->
                      <div
                        v-if="isDragging && dropZoneIndex === index"
                        class="drop-zone drop-zone-active"
                        @dragover.prevent="handleDragOver(index)"
                        @drop="onBlockDrop($event, index)"
                      >
                        <div class="drop-zone-indicator">
                          <v-icon color="primary" size="small">mdi-arrow-down</v-icon>
                          <span class="text-caption">{{ $t('editor.dropHere') }}</span>
                        </div>
                      </div>

                      <!-- Przycisk + góra -->
                      <div class="add-block-button add-block-top" @click="showAddBlockMenu($event, index)">
                        <v-btn icon size="x-small" color="primary" variant="outlined">
                          <v-icon size="small">mdi-plus</v-icon>
                        </v-btn>
                      </div>

                      <!-- Blok -->
                      <div
                        :class="['email-block', {
                          'selected': selectedBlockId === block.id,
                          'being-dragged': isDragging && draggedBlockIndex === index
                        }]"
                        @click="selectBlock(block.id)"
                        draggable="true"
                        @dragstart="onBlockDragStart($event, index)"
                        @dragover.prevent="handleDragOver(index)"
                        @dragenter.prevent="handleDragEnter(index)"
                        @dragend="onDragEnd"
                        @drop="onBlockDrop($event, index)"
                      >
                        <!-- Kontrolki bloku -->
                        <div class="block-controls">
                          <span class="text-caption text-medium-emphasis mr-auto">{{ $t('editor.blockTypes.' + block.type) }}</span>
                          <v-btn icon size="x-small" color="primary" @click.stop="duplicateBlock(index)" :title="$t('editor.duplicate')">
                            <v-icon size="small">mdi-content-copy</v-icon>
                          </v-btn>
                          <v-btn icon size="x-small" color="grey" style="cursor: grab;" @mousedown.stop :title="$t('editor.drag')">
                            <v-icon size="small">mdi-drag-vertical</v-icon>
                          </v-btn>
                          <v-btn icon size="x-small" color="error" @click.stop="removeBlock(index)" :title="$t('editor.delete')">
                            <v-icon size="small">mdi-close</v-icon>
                          </v-btn>
                        </div>

                        <!-- Zawartość bloku z marginesami -->
                        <div
                          class="block-content-wrapper"
                          :style="{
                            paddingTop: (block.style?.marginTop || 0) + 'px',
                            paddingBottom: (block.style?.marginBottom || 0) + 'px'
                          }"
                        >
                          <component
                            :is="getBlockComponent(block.type)"
                            :block="block"
                            @update="updateBlock"
                          />
                        </div>
                      </div>

                      <!-- Przycisk + dół -->
                      <div class="add-block-button add-block-bottom" @click="showAddBlockMenu($event, index + 1)">
                        <v-btn icon size="x-small" color="primary" variant="outlined">
                          <v-icon size="small">mdi-plus</v-icon>
                        </v-btn>
                      </div>
                    </div>

                    <!-- Drop zone na końcu -->
                    <div
                      v-if="isDragging && dropZoneIndex === emailBlocks.length"
                      class="drop-zone drop-zone-active drop-zone-end"
                      @dragover.prevent="handleDragOver(emailBlocks.length)"
                      @drop="onBlockDrop($event, emailBlocks.length)"
                    >
                      <div class="drop-zone-indicator">
                        <v-icon color="primary" size="small">mdi-arrow-down</v-icon>
                        <span class="text-caption">{{ $t('editor.dropAtEnd') }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- LIVE PREVIEW (prawa strona canvasu) -->
              <div v-if="showLivePreview" class="live-preview-panel overflow-y-auto pa-3" style="background: #f0f0f0; max-width: 350px; min-width: 280px;">
                <div class="d-flex align-center mb-2">
                  <h6 class="text-caption font-weight-bold">{{ $t('editor.livePreview') }}</h6>
                  <v-spacer></v-spacer>
                  <v-btn icon size="x-small" variant="text" @click="showLivePreview = false">
                    <v-icon size="small">mdi-close</v-icon>
                  </v-btn>
                </div>
                <div
                  :class="['live-preview-iframe', canvasMode === 'mobile' ? 'preview-mobile' : 'preview-desktop']"
                  v-html="livePreviewHtml"
                ></div>
              </div>
            </div>

          </v-card>
        </v-col>

        <!-- ============ PANEL PRAWY: WŁAŚCIWOŚCI + AI ASYSTENT ============ -->
        <v-col cols="auto" class="right-panel">
          <v-card class="pa-2 h-100 d-flex flex-column" style="border-radius: 0;">
            
            <!-- Zakładki panelu prawego -->
            <v-tabs v-model="rightPanelTab" density="compact" class="mb-2">
              <v-tab value="properties">
                <v-icon size="small">mdi-cog</v-icon>
              </v-tab>
              <v-tab value="ai">
                <v-icon size="small" color="purple">mdi-robot</v-icon>
              </v-tab>
            </v-tabs>

            <div class="right-panel-content flex-1-1 overflow-y-auto">
              
              <!-- Panel właściwości bloku -->
              <div v-if="rightPanelTab === 'properties'">
                <div v-if="selectedBlock">
                  <h6 class="text-caption font-weight-bold mb-2">{{ $t('editor.blockTypes.' + selectedBlock.type) }}</h6>
                  
                  <!-- Właściwości ogólne -->
                  <div class="mb-3">
                    <p class="text-caption text-medium-emphasis mb-1">{{ $t('editor.general').toUpperCase() }}</p>
                    <v-text-field
                      v-model="selectedBlock.style.marginTop"
                      :label="$t('editor.marginTop')"
                      type="number"
                      variant="outlined"
                      density="compact"
                      class="mb-1"
                      hide-details
                      @update:model-value="commitChange"
                    ></v-text-field>
                    <v-text-field
                      v-model="selectedBlock.style.marginBottom"
                      :label="$t('editor.marginBottom')"
                      type="number"
                      variant="outlined"
                      density="compact"
                      class="mb-1"
                      hide-details
                      @update:model-value="commitChange"
                    ></v-text-field>
                    <v-select
                      v-model="selectedBlock.style.textAlign"
                      :items="alignOptions"
                      :label="$t('editor.alignment')"
                      variant="outlined"
                      density="compact"
                      class="mb-1"
                      hide-details
                      @update:model-value="commitChange"
                    ></v-select>
                    
                    <!-- Opcjonalnie kolor tła bloku -->
                    <label class="text-caption d-block mb-1">{{ $t('editor.backgroundColor') }}</label>
                    <input
                      type="color"
                      v-model="selectedBlock.style.backgroundColor"
                      class="color-input-small mb-1"
                      @input="commitChange"
                    />
                  </div>

                  <v-divider class="mb-2"></v-divider>

                  <!-- Właściwości specyficzne dla typu -->
                  <component
                    :is="getPropertiesComponent(selectedBlock.type)"
                    :block="selectedBlock"
                    @update="commitChange"
                  />
                </div>

                <div v-else class="text-center text-grey py-4">
                  <v-icon size="40" class="mb-2">mdi-cursor-default-click</v-icon>
                  <p class="text-body-2">{{ $t('editor.selectBlock') }}</p>
                </div>
              </div>

              <!-- Panel AI Asystenta -->
              <div v-if="rightPanelTab === 'ai'">
                <AiAssistantPanel
                  :selected-block-text="selectedBlockText"
                  @use-content="onUseGeneratedContent"
                  @use-subject="onUseSubject"
                  @use-cta="onUseCTA"
                  @improve-text="onImproveText"
                />
              </div>
            </div>
          </v-card>
        </v-col>

      </v-row>
    </v-container>

    <!-- ============ DIALOGI ============ -->

    <!-- Dialog podglądu HTML -->
    <v-dialog v-model="previewDialog" :max-width="previewMode === 'mobile' ? '450px' : '850px'" scrollable>
      <v-card>
        <v-card-title class="d-flex justify-space-between align-center py-2 px-4">
          <span class="text-body-1">{{ $t('editor.previewHtml') }}</span>
          <div class="d-flex align-center gap-2">
            <v-btn-toggle v-model="previewMode" mandatory density="compact">
              <v-btn value="desktop" size="x-small">Desktop</v-btn>
              <v-btn value="mobile" size="x-small">Mobile</v-btn>
            </v-btn-toggle>
            <v-btn size="x-small" @click="copyHtml" color="primary" variant="outlined">
              <v-icon left size="small">mdi-content-copy</v-icon>
              {{ $t('editor.copyHtml') }}
            </v-btn>
          </div>
        </v-card-title>
        <v-divider></v-divider>
        <v-card-text class="pa-2">
          <div
            :class="['email-preview', previewMode === 'mobile' ? 'mobile-preview' : 'desktop-preview']"
            v-html="generatedHtml"
          ></div>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions class="pa-2">
          <v-btn size="small" @click="copySourceCode" variant="text">
            <v-icon left size="small">mdi-code-tags</v-icon>
            {{ $t('editor.copySource') }}
          </v-btn>
          <v-spacer></v-spacer>
          <v-btn size="small" @click="previewDialog = false">{{ $t('editor.close') }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog zapisu szablonu -->
    <v-dialog v-model="showSaveTemplateDialog" max-width="500px">
      <v-card>
        <v-card-title class="py-2 px-4">{{ $t('editor.saveAsTemplate') }}</v-card-title>
        <v-divider></v-divider>
        <v-form ref="saveForm" v-model="saveFormValid">
          <v-card-text class="pa-3">
            <v-text-field
              v-model="newTemplate.name"
              :label="$t('editor.templateName')"
              :rules="[v => !!v || $t('validation.required')]"
              required
              variant="outlined"
              density="compact"
              class="mb-2"
            ></v-text-field>
            <v-textarea
              v-model="newTemplate.description"
              :label="$t('editor.templateDescription')"
              :rules="[v => !!v || $t('validation.required')]"
              required
              variant="outlined"
              density="compact"
              rows="2"
              class="mb-2"
            ></v-textarea>
            <v-combobox
              v-model="newTemplate.tags"
              :label="$t('editor.templateTags')"
              multiple
              chips
              variant="outlined"
              density="compact"
              class="mb-2"
            ></v-combobox>
            <v-select
              v-model="newTemplate.category"
              :label="$t('editor.templateCategory')"
              :items="templateCategories"
              :rules="[v => !!v || $t('validation.required')]"
              required
              variant="outlined"
              density="compact"
            ></v-select>
          </v-card-text>
        </v-form>
        <v-divider></v-divider>
        <v-card-actions class="pa-2">
          <v-btn size="small" color="primary" :disabled="!saveFormValid" @click="saveAsTemplate">{{ $t('editor.save') }}</v-btn>
          <v-spacer></v-spacer>
          <v-btn size="small" @click="showSaveTemplateDialog = false">{{ $t('editor.cancel') }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog scoringu spamu -->
    <v-dialog v-model="showSpamDialog" max-width="600px">
      <v-card>
        <v-card-title class="py-2 px-4">
          <v-icon color="warning" class="mr-2">mdi-shield-alert</v-icon>
          {{ $t('editor.spam.title') }}
        </v-card-title>
        <v-divider></v-divider>
        <v-card-text class="pa-3" v-if="spamResult">
          <div class="d-flex align-center mb-3">
            <v-progress-circular
              :model-value="spamResult.score"
              :color="spamScoreColor"
              size="80"
              width="8"
            >
              {{ spamResult.score }}
            </v-progress-circular>
            <div class="ml-4">
              <h6>{{ spamResult.rating || 'Brak oceny' }}</h6>
              <p class="text-caption text-medium-emphasis">
                {{ $t('editor.spam.scale') }}
              </p>
            </div>
          </div>
          <div v-if="spamResult.suggestions && spamResult.suggestions.length > 0">
            <h6 class="text-caption font-weight-bold mb-1">{{ $t('editor.spam.suggestions') }}:</h6>
            <ul class="text-caption">
              <li v-for="(s, i) in spamResult.suggestions" :key="i">{{ s }}</li>
            </ul>
          </div>
        </v-card-text>
        <v-card-text class="pa-3" v-else>
          <div class="text-center py-4">
            <v-progress-circular indeterminate color="warning"></v-progress-circular>
            <p class="text-caption mt-2">{{ $t('editor.spam.checking') }}</p>
          </div>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions class="pa-2">
          <v-spacer></v-spacer>
          <v-btn size="small" @click="showSpamDialog = false">{{ $t('editor.close') }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Menu dodawania bloku -->
    <v-menu v-model="addBlockMenuVisible" :activator="addBlockMenuActivator" offset-y>
      <v-list density="compact">
        <v-list-item
          v-for="bt in availableBlocks"
          :key="bt.type"
          @click="addBlockAtPosition(bt.type, addBlockPosition)"
        >
          <template v-slot:prepend>
            <v-icon size="small" class="mr-2">{{ bt.icon }}</v-icon>
          </template>
          <v-list-item-title class="text-body-2">{{ $t('editor.blockTypes.' + bt.type) }}</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
  </div>
</template>

<script>
import { Templates } from '@/services/templates.js';
import { Campaigns } from '@/services/campaigns.js';
import { AiService } from '@/services/ai.js';

// Bloki
import TextBlock from './blocks/TextBlock.vue';
import ButtonBlock from './blocks/ButtonBlock.vue';
import ImageBlock from './blocks/ImageBlock.vue';
import SpacerBlock from './blocks/SpacerBlock.vue';
import DividerBlock from './blocks/DividerBlock.vue';
import SocialBlock from './blocks/SocialBlock.vue';
import HeaderBlock from './blocks/HeaderBlock.vue';

// Panele właściwości
import TextProperties from './properties/TextProperties.vue';
import ButtonProperties from './properties/ButtonProperties.vue';
import ImageProperties from './properties/ImageProperties.vue';
import SpacerProperties from './properties/SpacerProperties.vue';
import DividerProperties from './properties/DividerProperties.vue';
import SocialProperties from './properties/SocialProperties.vue';
import HeaderProperties from './properties/HeaderProperties.vue';

// Panele pomocnicze
import AiAssistantPanel from './panels/AiAssistantPanel.vue';
import PlaceholderPicker from './panels/PlaceholderPicker.vue';

const HISTORY_MAX = 50;

export default {
  name: 'BlockEmailEditorEnhanced',

  components: {
    TextBlock, ButtonBlock, ImageBlock, SpacerBlock,
    DividerBlock, SocialBlock, HeaderBlock,
    TextProperties, ButtonProperties, ImageProperties, SpacerProperties,
    DividerProperties, SocialProperties, HeaderProperties,
    AiAssistantPanel, PlaceholderPicker
  },

  data() {
    return {
      // === STAN EDYTORA ===
      emailBlocks: [],
      selectedBlockId: null,
      nextBlockId: 1,
      
      // === DRAG & DROP ===
      isDragging: false,
      draggedBlockIndex: null,
      dropZoneIndex: null,

      // === UNDO / REDO ===
      history: [],
      historyIndex: -1,
      maxHistory: HISTORY_MAX,

      // === TRYBY ===
      canvasMode: 'desktop',
      previewMode: 'desktop',
      showLivePreview: true,

      // === PANELE (zakładki) ===
      leftPanelTab: 'blocks',
      rightPanelTab: 'properties',

      // === DIALOGI ===
      previewDialog: false,
      generatedHtml: '',
      showSaveTemplateDialog: false,
      saveFormValid: false,
      showSpamDialog: false,
      spamResult: null,

      // === SZABLONY ===
      availableTemplates: [],
      templatesLoading: false,
      templatesError: null,
      newTemplate: {
        name: '',
        description: '',
        category: '',
        tags: []
      },
      templateCategories: [
        'Newsletter', 'Promocja', 'Powiadomienie',
        'Wydarzenie', 'Transakcyjny', 'Powitalny', 'Inne'
      ],

      // === MENU DODAWANIA BLOKU ===
      addBlockMenuVisible: false,
      addBlockMenuActivator: null,
      addBlockPosition: 0,

      // === TRYB KAMPANII ===
      isEditingCampaign: false,
      campaignId: null,

      // === DOSTĘPNE BLOKI ===
      availableBlocks: [
        { type: 'header', icon: 'mdi-page-layout-header' },
        { type: 'text', icon: 'mdi-format-text' },
        { type: 'button', icon: 'mdi-button-cursor' },
        { type: 'image', icon: 'mdi-image' },
        { type: 'divider', icon: 'mdi-minus' },
        { type: 'spacer', icon: 'mdi-arrow-expand-vertical' },
        { type: 'social', icon: 'mdi-share-variant' }
      ],

      alignOptions: []  // filled in mounted via i18n
    };
  },

  computed: {
    selectedBlock() {
      return this.emailBlocks.find(b => b.id === this.selectedBlockId) || null;
    },

    selectedBlockText() {
      if (!this.selectedBlock || this.selectedBlock.type !== 'text') return '';
      return this.selectedBlock.content?.text || '';
    },

    isCampaignEditMode() {
      return this.isEditingCampaign && !!this.campaignId;
    },

    canUndo() {
      return this.historyIndex > 0;
    },

    canRedo() {
      return this.historyIndex < this.history.length - 1;
    },

    livePreviewHtml() {
      return this.generateEmailHtml();
    },

    spamScoreColor() {
      if (!this.spamResult) return 'grey';
      const s = this.spamResult.score || 0;
      if (s <= 20) return 'success';
      if (s <= 50) return 'warning';
      return 'error';
    }
  },

  watch: {
    emailBlocks: {
      handler() {
        this.pushHistory();
      },
      deep: true
    }
  },

  async mounted() {
    // Init align options from i18n
    this.alignOptions = [
      { title: this.$t('editor.alignment') + ' — ' + 'left', value: 'left' },
      { title: this.$t('editor.alignment') + ' — ' + 'center', value: 'center' },
      { title: this.$t('editor.alignment') + ' — ' + 'right', value: 'right' }
    ];
    await this.loadTemplates();
    this.checkCampaignEditMode();
    this.pushHistory(); // initial state
  },

  methods: {
    // ======================== HISTORIA (UNDO/REDO) ========================

    pushHistory() {
      // Usuń przyszłe stany jeśli robimy nową zmianę
      if (this.historyIndex < this.history.length - 1) {
        this.history = this.history.slice(0, this.historyIndex + 1);
      }
      
      const snapshot = JSON.parse(JSON.stringify(this.emailBlocks));
      
      // Nie dodawaj jeśli stan jest taki sam jak ostatni
      const lastSnapshot = this.history[this.historyIndex];
      if (lastSnapshot && JSON.stringify(lastSnapshot) === JSON.stringify(snapshot)) {
        return;
      }

      this.history.push(snapshot);
      
      if (this.history.length > this.maxHistory) {
        this.history.shift();
      }
      
      this.historyIndex = this.history.length - 1;
    },

    undo() {
      if (!this.canUndo) return;
      this.historyIndex--;
      this.emailBlocks = JSON.parse(JSON.stringify(this.history[this.historyIndex]));
      this.selectedBlockId = null;
    },

    redo() {
      if (!this.canRedo) return;
      this.historyIndex++;
      this.emailBlocks = JSON.parse(JSON.stringify(this.history[this.historyIndex]));
      this.selectedBlockId = null;
    },

    // ======================== ZARZĄDZANIE BLOKAMI ========================

    createBlock(type) {
      const id = this.nextBlockId++;
      const base = {
        id,
        type,
        style: {
          marginTop: 0,
          marginBottom: 8,
          textAlign: 'left',
          backgroundColor: 'transparent'
        }
      };

      switch (type) {
        case 'text':
          return {
            ...base,
            content: {
              text: this.$t('editor.defaultText'),
              fontSize: 16,
              color: '#333333',
              fontWeight: 'normal',
              fontStyle: 'normal',
              fontFamily: 'Arial, Helvetica, sans-serif'
            }
          };

        case 'button':
          return {
            ...base,
            content: {
              text: this.$t('editor.defaultButton'),
              url: 'https://',
              backgroundColor: '#6366f1',
              textColor: '#ffffff',
              borderRadius: 8,
              padding: '14px 32px'
            },
            style: { ...base.style, textAlign: 'center' }
          };

        case 'image':
          return {
            ...base,
            content: {
              src: 'https://placehold.co/560x280/e2e8f0/64748b?text=' + encodeURIComponent(this.$t('editor.blockTypes.image')),
              alt: this.$t('editor.defaultImageAlt'),
              width: 560,
              height: 280,
              url: '',
              borderRadius: 0
            },
            style: { ...base.style, textAlign: 'center' }
          };

        case 'spacer':
          return {
            ...base,
            content: { height: 32, backgroundColor: 'transparent', borderRadius: 0 }
          };

        case 'divider':
          return {
            ...base,
            content: {
              thickness: 1,
              style: 'solid',
              color: '#e0e0e0',
              width: '100%'
            }
          };

        case 'social':
          return {
            ...base,
            content: {
              links: [
                { platform: 'Facebook', url: '' },
                { platform: 'LinkedIn', url: '' }
              ],
              iconSize: 36,
              iconShape: 'circle',
              iconBgColor: '#6366f1',
              iconColor: '#ffffff',
              borderRadius: 4
            },
            style: { ...base.style, textAlign: 'center' }
          };

        case 'header':
          return {
            ...base,
            content: {
              logoSrc: '',
              logoAlt: 'Logo',
              logoWidth: 180,
              logoMarginBottom: 16,
              title: this.$t('editor.defaultHeaderTitle'),
              titleSize: 24,
              titleWeight: 'bold',
              titleColor: '#1a1a1a',
              titleFont: 'inherit',
              subtitle: this.$t('editor.defaultHeaderSubtitle'),
              subtitleSize: 16,
              subtitleColor: '#666666',
              subtitleFont: 'inherit'
            },
            style: { ...base.style, textAlign: 'center' }
          };

        default:
          return base;
      }
    },

    addBlock(type) {
      const block = this.createBlock(type);
      this.emailBlocks.push(block);
      this.selectBlock(block.id);
    },

    addBlockAtPosition(type, position) {
      const block = this.createBlock(type);
      this.emailBlocks.splice(position, 0, block);
      this.selectBlock(block.id);
      this.addBlockMenuVisible = false;
    },

    selectBlock(blockId) {
      this.selectedBlockId = blockId;
    },

    removeBlock(index) {
      const removedBlock = this.emailBlocks[index];
      this.emailBlocks.splice(index, 1);
      if (this.selectedBlockId === removedBlock.id) {
        this.selectedBlockId = null;
      }
    },

    duplicateBlock(index) {
      const original = this.emailBlocks[index];
      const copy = JSON.parse(JSON.stringify(original));
      copy.id = this.nextBlockId++;
      this.emailBlocks.splice(index + 1, 0, copy);
    },

    clearAll() {
      this.emailBlocks = [];
      this.selectedBlockId = null;
    },

    commitChange() {
      // Wymusza aktualizację — Vue reaktywność
      const idx = this.emailBlocks.findIndex(b => b.id === this.selectedBlockId);
      if (idx !== -1) {
        this.emailBlocks.splice(idx, 1, { ...this.emailBlocks[idx] });
      }
    },

    updateBlock(blockId, updates) {
      const idx = this.emailBlocks.findIndex(b => b.id === blockId);
      if (idx !== -1) {
        this.emailBlocks[idx] = { ...this.emailBlocks[idx], ...updates };
      }
    },

    // ======================== DRAG & DROP ========================

    onDragStart(event, blockType) {
      event.dataTransfer.setData('blockType', blockType);
      event.dataTransfer.effectAllowed = 'copy';
    },

    onCanvasDrop(event) {
      event.preventDefault();
      const blockType = event.dataTransfer.getData('blockType');
      if (blockType) {
        this.addBlock(blockType);
      }
    },

    onBlockDragStart(event, index) {
      this.draggedBlockIndex = index;
      this.isDragging = true;
      this.dropZoneIndex = null;
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', '');
      document.body.classList.add('is-dragging');
    },

    handleDragOver(index) {
      if (this.isDragging && this.draggedBlockIndex !== null) {
        this.dropZoneIndex = index;
      }
    },

    handleDragEnter(index) {
      if (this.isDragging && this.draggedBlockIndex !== null) {
        this.dropZoneIndex = index;
      }
    },

    onDragEnd() {
      this.isDragging = false;
      this.dropZoneIndex = null;
      this.draggedBlockIndex = null;
      document.body.classList.remove('is-dragging');
    },

    onBlockDrop(event, targetIndex) {
      event.preventDefault();
      this.isDragging = false;
      this.dropZoneIndex = null;
      document.body.classList.remove('is-dragging');

      if (this.draggedBlockIndex !== null && this.draggedBlockIndex !== targetIndex) {
        const block = this.emailBlocks[this.draggedBlockIndex];
        this.emailBlocks.splice(this.draggedBlockIndex, 1);
        const newIndex = this.draggedBlockIndex < targetIndex ? targetIndex - 1 : targetIndex;
        this.emailBlocks.splice(newIndex, 0, block);
      }
      this.draggedBlockIndex = null;
    },

    showAddBlockMenu(event, position) {
      this.addBlockPosition = position;
      this.addBlockMenuActivator = event.target;
      this.addBlockMenuVisible = true;
    },

    // ======================== RENDEROWANIE ========================

    getBlockComponent(type) {
      const map = {
        text: 'TextBlock', button: 'ButtonBlock', image: 'ImageBlock',
        spacer: 'SpacerBlock', divider: 'DividerBlock',
        social: 'SocialBlock', header: 'HeaderBlock'
      };
      return map[type] || 'TextBlock';
    },

    getPropertiesComponent(type) {
      const map = {
        text: 'TextProperties', button: 'ButtonProperties', image: 'ImageProperties',
        spacer: 'SpacerProperties', divider: 'DividerProperties',
        social: 'SocialProperties', header: 'HeaderProperties'
      };
      return map[type] || 'TextProperties';
    },

    getBlockTypeName(type) {
      return this.$t('editor.blockTypes.' + type);
    },

    // ======================== GENEROWANIE HTML ========================

    generateEmailHtml() {
      const containerWidth = this.canvasMode === 'mobile' ? '375px' : '600px';
      
      let html = `<!DOCTYPE html>
<html lang="pl">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Email</title>
  <style>
    @media only screen and (max-width: 480px) {
      .email-container { width: 100% !important; max-width: 100% !important; }
      .mobile-padding { padding-left: 12px !important; padding-right: 12px !important; }
      .mobile-text { font-size: 14px !important; line-height: 1.5 !important; }
    }
    body { margin: 0; padding: 0; background-color: #f5f5f5; }
  </style>
</head>
<body style="margin:0;padding:20px;background-color:#f5f5f5;font-family:Arial,Helvetica,sans-serif;">
  <div class="email-container" style="max-width:${containerWidth};margin:0 auto;background-color:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);">`;

      for (const block of this.emailBlocks) {
        html += this.renderBlockToHtml(block);
      }

      html += `
  </div>
</body>
</html>`;

      return html;
    },

    renderBlockToHtml(block) {
      const st = block.style || {};
      const bgStyle = st.backgroundColor && st.backgroundColor !== 'transparent'
        ? `background-color:${st.backgroundColor};` : '';
      const divStyle = `margin-top:${st.marginTop || 0}px;margin-bottom:${st.marginBottom || 0}px;text-align:${st.textAlign || 'left'};${bgStyle}`;
      const c = block.content || {};

      switch (block.type) {
        case 'text':
          return `
            <div class="mobile-padding" style="padding:0 20px;${divStyle}">
              <p class="mobile-text" style="font-size:${c.fontSize || 16}px;color:${c.color || '#333'};font-weight:${c.fontWeight || 'normal'};font-style:${c.fontStyle || 'normal'};font-family:${c.fontFamily || 'Arial,sans-serif'};margin:0;line-height:1.6;">
                ${c.text || ''}
              </p>
            </div>`;

        case 'button':
          const btnHref = c.url ? `href="${c.url}"` : '';
          return `
            <div class="mobile-padding" style="padding:0 20px;${divStyle}">
              <a ${btnHref} target="_blank" style="display:inline-block;background-color:${c.backgroundColor || '#6366f1'};color:${c.textColor || '#fff'};padding:${c.padding || '14px 32px'};border-radius:${c.borderRadius || 8}px;text-decoration:none;font-weight:bold;font-size:16px;font-family:Arial,sans-serif;">
                ${c.text || 'Kliknij'}
              </a>
            </div>`;

        case 'image':
          const imgTag = `<img src="${c.src}" alt="${c.alt || ''}" style="width:${c.width || 560}px;height:auto;max-width:100%;border-radius:${c.borderRadius || 0}px;display:block;margin:0 auto;">`;
          const imgLinked = c.url ? `<a href="${c.url}" target="_blank">${imgTag}</a>` : imgTag;
          return `
            <div class="mobile-padding" style="padding:0 20px;${divStyle}">
              ${imgLinked}
            </div>`;

        case 'spacer':
          const spBg = c.backgroundColor && c.backgroundColor !== 'transparent'
            ? `background-color:${c.backgroundColor};` : '';
          return `
            <div style="height:${c.height || 32}px;${spBg}border-radius:${c.borderRadius || 0}px;${divStyle}"></div>`;

        case 'divider':
          return `
            <div style="${divStyle}padding:0 20px;">
              <hr style="border:none;border-top:${c.thickness || 1}px ${c.style || 'solid'} ${c.color || '#e0e0e0'};width:${c.width || '100%'};margin:8px auto;">
            </div>`;

        case 'social':
          let socialLinks = '';
          const links = c.links || [];
          for (const link of links) {
            if (!link.url) continue;
            socialLinks += `
              <a href="${link.url}" target="_blank" rel="noopener" style="display:inline-block;width:${c.iconSize || 36}px;height:${c.iconSize || 36}px;margin:0 6px;border-radius:${c.iconShape === 'circle' ? '50%' : (c.borderRadius || 4) + 'px'};background-color:${c.iconBgColor || '#6366f1'};color:${c.iconColor || '#fff'};text-align:center;line-height:${c.iconSize || 36}px;text-decoration:none;font-size:14px;">
                ${this.getSocialEmoji(link.platform)}
              </a>`;
          }
          return `<div style="${divStyle}">${socialLinks}</div>`;

        case 'header':
          let hHtml = '';
          if (c.logoSrc) {
            hHtml += `<img src="${c.logoSrc}" alt="${c.logoAlt || 'Logo'}" style="max-width:${c.logoWidth || 180}px;height:auto;display:block;margin:0 auto ${c.logoMarginBottom || 16}px;">`;
          }
          if (c.title) {
            hHtml += `<h1 style="font-size:${c.titleSize || 24}px;font-weight:${c.titleWeight || 'bold'};color:${c.titleColor || '#1a1a1a'};margin:0 0 8px 0;line-height:1.3;font-family:${c.titleFont || 'inherit'};">${c.title}</h1>`;
          }
          if (c.subtitle) {
            hHtml += `<p style="font-size:${c.subtitleSize || 16}px;color:${c.subtitleColor || '#666'};margin:0;line-height:1.5;font-family:${c.subtitleFont || 'inherit'};">${c.subtitle}</p>`;
          }
          return `<div style="${divStyle}padding:16px 20px;">${hHtml}</div>`;

        default:
          return '';
      }
    },

    getSocialEmoji(platform) {
      const emojis = {
        facebook: 'f', twitter: '𝕏', linkedin: 'in', instagram: '📷',
        youtube: '▶', tiktok: '🎵', whatsapp: '⬡', telegram: '✈', website: '🌐', email: '✉'
      };
      return emojis[platform?.toLowerCase()] || '🔗';
    },

    openPreview() {
      this.previewMode = this.canvasMode;
      this.generatedHtml = this.generateEmailHtml();
      this.previewDialog = true;
    },

    async copyHtml() {
      try {
        await navigator.clipboard.writeText(this.generatedHtml);
      } catch (e) {
        console.error('Copy failed:', e);
      }
    },

    async copySourceCode() {
      try {
        await navigator.clipboard.writeText(this.generatedHtml);
      } catch (e) {
        console.error('Copy failed:', e);
      }
    },

    // ======================== SZABLONY ========================

    async loadTemplates() {
      this.templatesLoading = true;
      this.templatesError = null;
      try {
        this.availableTemplates = await Templates.getTemplates({ includeBlocks: true });
      } catch (error) {
        console.error('Template load error:', error);
        this.templatesError = 'Nie udało się załadować szablonów';
        this.availableTemplates = [];
      } finally {
        this.templatesLoading = false;
      }
    },

    async loadTemplateById(id) {
      try {
        const data = await Templates.getTemplateById(id);
        if (!data) return;
        await Templates.incrementUsage(id);

        this.emailBlocks = [];
        this.selectedBlockId = null;

        if (data.blocks && Array.isArray(data.blocks)) {
          for (const bd of data.blocks) {
            this.emailBlocks.push({
              id: this.nextBlockId++,
              type: bd.blockType,
              content: bd.content || {},
              style: bd.style || { marginTop: 0, marginBottom: 8, textAlign: 'left', backgroundColor: 'transparent' }
            });
          }
        }
      } catch (error) {
        console.error('Template load error:', error);
      }
    },

    async saveAsTemplate() {
      if (!this.saveFormValid || this.emailBlocks.length === 0) return;

      try {
        const thumbnailSvg = `data:image/svg+xml;base64,${btoa(`
          <svg xmlns="http://www.w3.org/2000/svg" width="200" height="150" viewBox="0 0 200 150">
            <rect width="200" height="150" fill="#f5f5f5"/>
            <text x="100" y="75" text-anchor="middle" font-family="Arial" font-size="12" fill="#666">
              ${this.newTemplate.name}
            </text>
            <text x="100" y="95" text-anchor="middle" font-family="Arial" font-size="10" fill="#999">
              ${this.emailBlocks.length} blok(ów)
            </text>
          </svg>`)}`;

        const templateData = {
          name: this.newTemplate.name,
          description: this.newTemplate.description,
          category: this.newTemplate.category,
          tags: this.newTemplate.tags,
          thumbnail: thumbnailSvg,
          blocks: this.emailBlocks.map(b => ({
            blockType: b.type,
            content: b.content || {},
            style: b.style || {}
          })),
          metadata: {
            blocks: this.emailBlocks.length,
            createdWith: 'BlockEmailEditorEnhanced',
            version: '3.0'
          }
        };

        const created = await Templates.createTemplate(templateData);
        this.availableTemplates.unshift(created);
        this.showSaveTemplateDialog = false;
        this.newTemplate = { name: '', description: '', category: '', tags: [] };
      } catch (error) {
        console.error('Save template error:', error);
        alert('Nie udało się zapisać szablonu: ' + (error.response?.data?.message || error.message));
      }
    },

    // ======================== AI ========================

    onUseGeneratedContent(content) {
      if (!content) return;
      // Spróbuj dodać jako nowy blok tekstowy lub zastąpić zaznaczony
      if (this.selectedBlock && this.selectedBlock.type === 'text') {
        this.selectedBlock.content.text = content;
        this.commitChange();
      } else {
        const block = this.createBlock('text');
        block.content.text = content;
        this.emailBlocks.push(block);
        this.selectBlock(block.id);
      }
    },

    onUseSubject(subject) {
      // Emitujemy event dla rodzica (może ustawić temat w kampanii)
      console.log('Suggested subject:', subject);
      this.$emit('subject-suggested', subject);
    },

    onUseCTA(cta) {
      if (!cta) return;
      // Znajdź lub utwórz blok przycisku
      const existingBtn = this.emailBlocks.find(b => b.type === 'button');
      if (existingBtn) {
        existingBtn.content.text = cta;
        this.commitChange();
      } else {
        const block = this.createBlock('button');
        block.content.text = cta;
        this.emailBlocks.push(block);
        this.selectBlock(block.id);
      }
    },

    onImproveText(improved) {
      if (!improved || !this.selectedBlock || this.selectedBlock.type !== 'text') return;
      this.selectedBlock.content.text = improved;
      this.commitChange();
    },

    // ======================== PLACEHOLDERY ========================

    insertPlaceholderIntoSelection(tag) {
      if (this.selectedBlock && this.selectedBlock.type === 'text') {
        this.selectedBlock.content.text = (this.selectedBlock.content.text || '') + ' ' + tag;
        this.commitChange();
      } else {
        // Utwórz nowy blok tekstowy z placeholderem
        const block = this.createBlock('text');
        block.content.text = tag;
        this.emailBlocks.push(block);
        this.selectBlock(block.id);
      }
    },

    // ======================== SPAM SCORING ========================

    async checkSpamScore(campaignId) {
      this.showSpamDialog = true;
      this.spamResult = null;
      try {
        const result = await AiService.checkSpamScore(campaignId);
        this.spamResult = result;
      } catch (error) {
        console.error('Spam check error:', error);
        this.spamResult = { score: 0, rating: 'Błąd sprawdzania', suggestions: [] };
      }
    },

    // ======================== KAMPANIA ========================

    checkCampaignEditMode() {
      const cid = this.$route?.query?.campaignId;
      if (cid) {
        this.isEditingCampaign = true;
        this.campaignId = cid;
      }
    },

    async exportContentToCampaign() {
      if (!this.campaignId || this.emailBlocks.length === 0) return;

      try {
        const htmlContent = this.generateEmailHtml();
        const campaign = await Campaigns.getCampaignById(this.campaignId);
        await Campaigns.update(this.campaignId, { ...campaign, htmlContent });

        this.$router?.push({
          name: 'Campaigns',
          query: { selectedCampaign: this.campaignId, contentUpdated: true }
        });
      } catch (error) {
        console.error('Export error:', error);
        alert('Nie udało się wyeksportować treści: ' + error.message);
      }
    },

    // ======================== KLAWIATURA ========================

    handleKeyboardShortcut(event) {
      const ctrl = event.ctrlKey || event.metaKey;

      if (ctrl && event.key === 'z') {
        event.preventDefault();
        this.undo();
      } else if (ctrl && (event.key === 'y' || (event.shiftKey && event.key === 'z'))) {
        event.preventDefault();
        this.redo();
      } else if (event.key === 'Delete' || event.key === 'Backspace') {
        // Usuń zaznaczony blok (jeśli nie jesteśmy w inpucie)
        if (this.selectedBlockId && document.activeElement === this.$refs.editorContainer) {
          event.preventDefault();
          const idx = this.emailBlocks.findIndex(b => b.id === this.selectedBlockId);
          if (idx !== -1) this.removeBlock(idx);
        }
      } else if (ctrl && event.key === 's') {
        event.preventDefault();
        // Zapisz jako szablon
        if (this.emailBlocks.length > 0) {
          this.showSaveTemplateDialog = true;
        }
      } else if (ctrl && event.key === 'p') {
        event.preventDefault();
        this.toggleLivePreview();
      }
    },

    toggleLivePreview() {
      this.showLivePreview = !this.showLivePreview;
    }
  }
};
</script>

<style scoped>
.block-email-editor-enhanced {
  width: 100%;
  height: 100%;
  background: #f6f7f9;
  outline: none;
}

/* === PANELE === */
.left-panel {
  width: 220px;
  min-width: 200px;
  border-right: 1px solid #e0e0e0;
  background: #fafafa;
}

.right-panel {
  width: 280px;
  min-width: 260px;
  border-left: 1px solid #e0e0e0;
  background: #fafafa;
}

.center-panel {
  min-width: 0;
}

/* === TOOLBAR === */
.editor-toolbar {
  background: #fff;
  border-bottom: 1px solid #e0e0e0;
  min-height: 36px;
}

/* === BLOKI W PANELU === */
.block-item {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  margin: 2px 0;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.15s, transform 0.1s;
  user-select: none;
  border: 1px solid transparent;
}

.block-item:hover {
  background: #e8eaf6;
  border-color: #c5cae9;
  transform: translateX(2px);
}

/* === TEMPLATE MINI ITEM === */
.template-mini-item {
  cursor: pointer;
  transition: background 0.15s;
  border: 1px solid #e0e0e0;
}

.template-mini-item:hover {
  background: #e8eaf6;
  border-color: #c5cae9;
}

/* === CANVAS === */
.canvas-wrapper {
  display: flex;
  justify-content: center;
  background: #e8eaed;
}

.email-canvas {
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  min-height: 400px;
  transition: width 0.2s;
}

.desktop-canvas {
  width: 600px;
  max-width: 100%;
}

.mobile-canvas {
  width: 375px;
  max-width: 100%;
}

/* === PUSTY CANVAS === */
.empty-canvas {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 350px;
  padding: 40px;
  text-align: center;
}

/* === BLOKI NA CANVASIE === */
.block-wrapper {
  position: relative;
}

.email-block {
  position: relative;
  border: 2px solid transparent;
  border-radius: 4px;
  transition: border-color 0.15s, box-shadow 0.15s;
  cursor: pointer;
}

.email-block:hover {
  border-color: #c5cae9;
}

.email-block.selected {
  border-color: #6366f1;
  box-shadow: 0 0 0 1px #6366f1;
}

.email-block.being-dragged {
  opacity: 0.4;
}

/* === KONTROLKI BLOKU === */
.block-controls {
  display: none;
  position: absolute;
  top: -28px;
  right: 0;
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  padding: 2px 4px;
  z-index: 10;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  align-items: center;
  gap: 2px;
}

.email-block.selected .block-controls,
.email-block:hover .block-controls {
  display: flex;
}

.block-content-wrapper {
  /* marginesy są stosowane jako padding */
}

/* === DROP ZONE === */
.drop-zone {
  height: 4px;
  transition: height 0.15s;
}

.drop-zone-active {
  height: 32px;
  background: rgba(99, 102, 241, 0.1);
  border: 2px dashed #6366f1;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 2px 0;
}

.drop-zone-indicator {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #6366f1;
}

.drop-zone-end {
  min-height: 48px;
}

/* === DODAJ BLOK PRZYCISKI === */
.add-block-button {
  display: flex;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.15s;
  height: 20px;
}

.block-wrapper:hover .add-block-button,
.email-block.selected ~ .add-block-bottom {
  opacity: 1;
}

.add-block-top {
  margin-bottom: -8px;
}

.add-block-bottom {
  margin-top: -8px;
}

/* === PODGLĄD HTML === */
.email-preview {
  margin: 0 auto;
  background: #fff;
}

.desktop-preview {
  width: 600px;
  max-width: 100%;
  min-height: 300px;
}

.mobile-preview {
  width: 375px;
  max-width: 100%;
  min-height: 300px;
}

/* === LIVE PREVIEW === */
.live-preview-panel {
  border-left: 1px solid #e0e0e0;
  background: #f0f0f0;
}

.live-preview-iframe {
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.1);
  padding: 10px;
}

.preview-desktop {
  width: 100%;
  transform-origin: top left;
}

.preview-mobile {
  max-width: 375px;
  margin: 0 auto;
}

/* === RESPONSYWNOŚĆ === */
@media (max-width: 1200px) {
  .left-panel {
    width: 170px;
    min-width: 160px;
  }
  .right-panel {
    width: 240px;
    min-width: 220px;
  }
}

@media (max-width: 900px) {
  .left-panel {
    width: 140px;
    min-width: 130px;
  }
  .right-panel {
    display: none;
  }
  .live-preview-panel {
    display: none;
  }
}

/* === UTILITY === */
.gap-1 { gap: 4px; }
.gap-2 { gap: 8px; }
.flex-1-1 { flex: 1 1 auto; }
.cursor-pointer { cursor: pointer; }

/* === COLOR INPUT === */
.color-input-small {
  width: 100%;
  height: 32px;
  border: 1px solid #bdbdbd;
  border-radius: 4px;
  cursor: pointer;
  padding: 2px 4px;
}
</style>

<style>
/* Globalne style dla trybu drag */
body.is-dragging .email-block:not(.being-dragged) {
  cursor: grabbing;
}

body.is-dragging * {
  cursor: grabbing !important;
}
</style>
