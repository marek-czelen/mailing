<template>
  <!-- 
    GŁÓWNY KOMPONENT EDYTORA E-MAILI
    
    Ten komponent implementuje edytor e-maili z interfejsem drag-and-drop opartym na blokach.
    
    STRUKTURA:
    - Panel bloków (lewy) - lista dostępnych typów bloków do dodania
    - Canvas (środkowy) - obszar konstrukcji e-maila z podglądem Desktop/Mobile
    - Panel właściwości (prawy) - edycja wybranego bloku
    
    FUNKCJONALNOŚCI:
    - Dodawanie bloków przez przeciągnięcie lub kliknięcie ikon plus
    - Edycja właściwości bloków (tekst, style, marginesy itp.)
    - Podgląd responsive (Desktop/Mobile)
    - Zapisywanie i ładowanie szablonów
    - Generowanie HTML do eksportu
    - Drag & drop do zmiany kolejności bloków
  -->
  <div class="block-email-editor">
    <v-container fluid class="pa-0 ma-0" style="max-width: none; width: 100vw;">
      <v-row no-gutters class="ma-0">
        <!-- PANEL BLOKÓW - Lewy panel z dostępnymi typami bloków -->
        <v-col cols="2" class="blocks-panel">
          <v-card class="pa-3 h-100">
            <!-- Sekcja szablonów - przyciski do ładowania gotowych szablonów -->
            <h4 class="mb-3">Szablony</h4>
            <v-btn 
              color="primary" 
              variant="outlined" 
              size="small" 
              block 
              class="mb-3"
              @click="showTemplateDialog = true"
            >
              <v-icon class="mr-2">mdi-file-document-multiple</v-icon>
              Wybierz szablon
            </v-btn>
            <v-divider class="mb-3"></v-divider>
            
            <!-- Sekcja bloków - lista dostępnych typów bloków do dodania -->
            <h4 class="mb-3">Bloki</h4>
            <v-divider class="mb-3"></v-divider>
            
            <!-- Każdy blok można dodać przez kliknięcie lub przeciągnięcie -->
            <div class="block-item" 
                 v-for="blockType in availableBlocks" 
                 :key="blockType.type"
                 @click="addBlock(blockType.type)"
                 draggable="true"
                 @dragstart="onDragStart($event, blockType.type)"
            >
              <v-icon class="mr-2" size="small">{{ blockType.icon }}</v-icon>
              {{ blockType.name }}
            </div>
          </v-card>
        </v-col>

        <!-- CANVAS - Środkowy panel z obszarem konstrukcji e-maila -->
        <v-col cols="6" class="canvas-panel">
          <v-card class="pa-4 h-100">
            <!-- Nagłówek z przełącznikami i akcjami -->
            <div class="d-flex justify-space-between align-center mb-4">  
              <div class="d-flex align-center gap-2">
                <!-- Przełącznik Desktop/Mobile - zmienia szerokość podglądu (600px vs 375px) -->
                <v-btn-toggle 
                  v-model="canvasMode" 
                  mandatory 
                  density="compact"
                  class="mr-3"
                >
                  <v-btn value="desktop" size="small">
                    <v-icon>mdi-monitor</v-icon>
                    Desktop
                  </v-btn>
                  <v-btn value="mobile" size="small">
                    <v-icon>mdi-cellphone</v-icon>
                    Mobile
                  </v-btn>
                </v-btn-toggle>

                <v-btn 
                  @click="showSaveTemplateDialog = true" 
                  color="success" 
                  size="small"
                  variant="outlined"
                  :disabled="emailBlocks.length === 0"
                  class="mr-2"
                >
                  <v-icon left>mdi-content-save</v-icon>
                  Zapisz jako szablon
                </v-btn>
                
                <v-btn @click="generatePreview" color="primary" size="small" class="mr-2">
                  <v-icon left>mdi-eye</v-icon>
                  Podgląd HTML
                </v-btn>
                <v-btn @click="clearAll" color="error" size="small" variant="outlined">
                  <v-icon left>mdi-delete</v-icon>
                  Wyczyść
                </v-btn>
              </div>
            </div>

            <!-- Wrapper z przewijaniem dla długich szablonów -->
            <div class="canvas-wrapper">
              <!-- 
                GŁÓWNY CANVAS E-MAILA
                - Responsywny (desktop: 600px, mobile: 375px)
                - Obsługuje drag & drop bloków
                - Automatyczne rozszerzanie wysokości
              -->
              <div 
                :class="[
                  'email-canvas',
                  canvasMode === 'mobile' ? 'mobile-canvas' : 'desktop-canvas'
                ]" 
                @drop="onCanvasDrop" 
                @dragover.prevent 
                @dragenter.prevent
              >
                
                <!-- Widok pustego canvas - zachęta do dodania pierwszego bloku -->
                <div v-if="emailBlocks.length === 0" class="empty-canvas">
                  <v-icon size="64" color="grey-lighten-1">mdi-email-plus-outline</v-icon>
                  <p class="text-grey mt-2">Przeciągnij bloki tutaj lub kliknij aby dodać</p>
                  <p class="text-caption text-grey">
                    Tryb: {{ canvasMode === 'mobile' ? 'Mobile (375px)' : 'Desktop (600px)' }}
                  </p>
                  <!-- Przycisk do dodania pierwszego bloku -->
                  <v-btn 
                    color="primary"
                    size="large"
                    class="mt-4"
                    @click="showAddBlockMenu($event, 0)"
                  >
                    <v-icon left>mdi-plus</v-icon>
                    Dodaj pierwszy blok
                  </v-btn>
                </div>

                <!-- KONTENER BLOKÓW - Lista wszystkich dodanych bloków -->
                <div class="blocks-container">
                <!-- 
                  WRAPPER BLOKU - Każdy blok zawiera:
                  1. Strefa upuszczania na górze (wizualizacja podczas drag & drop)
                  2. Przycisk plus na górze (dodanie bloku powyżej)
                  3. Główny blok z zawartością
                  4. Przycisk plus na dole (dodanie bloku poniżej)
                -->
                <div 
                  v-for="(block, index) in emailBlocks" 
                  :key="block.id"
                  class="block-wrapper"
                >
                  <!-- STREFA UPUSZCZANIA GÓRNA - Wizualizacja gdzie blok zostanie upuszczony -->
                  <div 
                    v-if="isDragging && dropZoneIndex === index"
                    class="drop-zone drop-zone-active"
                    @dragover.prevent="handleDragOver(index)"
                    @drop="onBlockDrop($event, index)"
                  >
                    <div class="drop-zone-indicator">
                      <v-icon color="primary">mdi-arrow-down</v-icon>
                      <span>Upuść tutaj</span>
                    </div>
                  </div>
                  <!-- PRZYCISK PLUS GÓRA - Dodaje nowy blok powyżej aktualnego -->
                  <div 
                    class="add-block-button add-block-top"
                    @click="showAddBlockMenu($event, index)"
                  >
                    <v-btn 
                      icon 
                      size="small" 
                      color="primary"
                      variant="outlined"
                    >
                      <v-icon>mdi-plus</v-icon>
                    </v-btn>
                  </div>

                  <!-- 
                    GŁÓWNY BLOK - Zawiera:
                    - Ramkę z hover/select stanami
                    - Kontrolki akcji (usuń, duplikuj, przeciągnij)
                    - Właściwą zawartość bloku (TextBlock, ButtonBlock itp.)
                    - Marginesy zastosowane jako padding (ramka obejmuje marginesy)
                  -->
                  <div 
                    :class="['email-block', { 
                      'selected': selectedBlockId === block.id,
                      'drag-over': isDragging && dropZoneIndex === index,
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
                    <div class="block-controls">
                      <v-btn 
                        icon 
                        size="x-small" 
                        color="error" 
                        @click.stop="removeBlock(index)"
                      >
                        <v-icon>mdi-close</v-icon>
                      </v-btn>
                      <v-btn 
                        icon 
                        size="x-small" 
                        color="primary" 
                        @click.stop="duplicateBlock(index)"
                      >
                        <v-icon>mdi-content-copy</v-icon>
                      </v-btn>
                      <v-btn 
                        icon 
                        size="x-small" 
                        color="grey" 
                        style="cursor: grab;"
                        @mousedown.stop
                      >
                        <v-icon>mdi-drag-vertical</v-icon>
                      </v-btn>
                    </div>

                    <!-- Kontener z marginesami wewnątrz ramki -->
                    <div 
                      class="block-content-wrapper"
                      :style="{
                        paddingTop: block.style.marginTop + 'px',
                        paddingBottom: block.style.marginBottom + 'px'
                      }"
                    >
                      <!-- Renderowanie bloku w zależności od typu -->
                      <component 
                        :is="getBlockComponent(block.type)" 
                        :block="block"
                        @update="updateBlock"
                      />
                    </div>
                  </div>

                  <!-- Przycisk dodania bloku poniżej -->
                  <div 
                    class="add-block-button add-block-bottom"
                    @click="showAddBlockMenu($event, index + 1)"
                  >
                    <v-btn 
                      icon 
                      size="small" 
                      color="primary"
                      variant="outlined"
                    >
                      <v-icon>mdi-plus</v-icon>
                    </v-btn>
                  </div>
                </div>
                
                <!-- STREFA UPUSZCZANIA NA KOŃCU - Po ostatnim bloku -->
                <div 
                  v-if="isDragging && dropZoneIndex === emailBlocks.length"
                  class="drop-zone drop-zone-active drop-zone-end"
                  @dragover.prevent="handleDragOver(emailBlocks.length)"
                  @drop="onBlockDrop($event, emailBlocks.length)"
                >
                  <div class="drop-zone-indicator">
                    <v-icon color="primary">mdi-arrow-down</v-icon>
                    <span>Upuść na końcu</span>
                  </div>
                </div>
              </div>
            </div>
            </div>
          </v-card>
        </v-col>

        <!-- PANEL WŁAŚCIWOŚCI - Prawy panel do edycji wybranego bloku -->
        <v-col cols="4" class="properties-panel">
          <v-card class="h-100 d-flex flex-column">
            <!-- Stały nagłówek sekcji - nie przewija się -->
            <div class="properties-header pa-4 pb-2">
              <h4 class="mb-3">Właściwości</h4>
              <v-divider></v-divider>
            </div>

            <!-- 
              PRZEWIJALNA ZAWARTOŚĆ WŁAŚCIWOŚCI
              - Automatyczne przewijanie gdy właściwości się nie mieszczą
              - Dzieli się na sekcję ogólną i specyficzną dla typu bloku
            -->
            <div class="properties-content flex-1-1 overflow-y-auto pa-4 pt-2">
              <!-- Gdy blok jest wybrany - pokazujemy jego właściwości -->
              <div v-if="selectedBlock">
                <h5 class="mb-3">{{ getBlockTypeName(selectedBlock.type) }}</h5>
                
                <!-- WŁAŚCIWOŚCI OGÓLNE - wspólne dla wszystkich bloków (marginesy, wyrównanie) -->
                <div class="mb-4">
                  <h6 class="text-caption mb-2">OGÓLNE</h6>
                  
                  <v-text-field
                    v-model="selectedBlock.style.marginTop"
                    label="Margines góra (px)"
                    type="number"
                    variant="outlined"
                    density="compact"
                    class="mb-2"
                    @update:model-value="updateSelectedBlock"
                  ></v-text-field>

                  <v-text-field
                    v-model="selectedBlock.style.marginBottom"
                    label="Margines dół (px)"
                    type="number"
                    variant="outlined"
                    density="compact"
                    class="mb-2"
                    @update:model-value="updateSelectedBlock"
                  ></v-text-field>

                  <v-select
                    v-model="selectedBlock.style.textAlign"
                    :items="alignOptions"
                    label="Wyrównanie"
                    variant="outlined"
                    density="compact"
                    class="mb-2"
                    @update:model-value="updateSelectedBlock"
                  ></v-select>
                </div>

                <!-- Właściwości specyficzne dla typu bloku -->
                <component 
                  :is="getPropertiesComponent(selectedBlock.type)" 
                  :block="selectedBlock"
                  @update="updateSelectedBlock"
                />

              </div>

              <div v-else class="text-center text-grey">
                <v-icon size="48" class="mb-2">mdi-cursor-default-click</v-icon>
                <p>Kliknij na blok aby edytować jego właściwości</p>
              </div>
            </div>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <!-- Dialog podglądu -->
    <v-dialog v-model="previewDialog" :max-width="previewMode === 'mobile' ? '450px' : '800px'">
      <v-card>
        <v-card-title class="d-flex justify-space-between align-center">
          <span>Podgląd e-maila</span>
          <v-btn-toggle v-model="previewMode" mandatory density="compact">
            <v-btn value="desktop" size="small">
              <v-icon>mdi-monitor</v-icon>
              Desktop
            </v-btn>
            <v-btn value="mobile" size="small">
              <v-icon>mdi-cellphone</v-icon>
              Mobile
            </v-btn>
          </v-btn-toggle>
        </v-card-title>
        <v-card-text>
          <div 
            :class="[
              'email-preview',
              previewMode === 'mobile' ? 'mobile-preview' : 'desktop-preview'
            ]"
          >
            <div class="html-content-preview" v-html="generatedHtml"></div>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-btn @click="copyHtml" color="primary">
            <v-icon left>mdi-content-copy</v-icon>
            Skopiuj HTML
          </v-btn>
          <v-btn @click="exportAsImage" color="secondary" class="ml-2">
            <v-icon left>mdi-camera</v-icon>
            Eksportuj jako obraz
          </v-btn>
          <v-spacer></v-spacer>
          <v-btn @click="previewDialog = false">Zamknij</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog wyboru szablonów -->
    <v-dialog v-model="showTemplateDialog" max-width="900px" scrollable>
      <v-card>
        <v-card-title class="d-flex align-center">
          <v-icon class="mr-2">mdi-file-document-multiple</v-icon>
          Wybierz szablon e-maila
        </v-card-title>
        <v-divider></v-divider>
        
        <v-card-text class="pa-4">
          <!-- Loading state -->
          <div v-if="templatesLoading" class="text-center py-8">
            <v-progress-circular indeterminate color="primary" size="48"></v-progress-circular>
            <p class="mt-4 text-body-2">Ładowanie szablonów z bazy danych...</p>
          </div>
          
          <!-- Error state -->
          <div v-else-if="templatesError" class="text-center py-8">
            <v-icon size="64" color="error">mdi-alert-circle-outline</v-icon>
            <p class="mt-4 text-body-1">{{ templatesError }}</p>
            <v-btn @click="loadTemplates" color="primary" class="mt-2">
              <v-icon left>mdi-refresh</v-icon>
              Spróbuj ponownie
            </v-btn>
          </div>
          
          <!-- Templates grid -->
          <div v-else-if="availableTemplates.length > 0">
            <v-row>
              <v-col 
                v-for="template in availableTemplates" 
                :key="template.id"
                cols="12" 
                md="6" 
                lg="4"
              >
              <v-card 
                class="template-card" 
                :class="{ 'template-selected': selectedTemplate === template.id }"
                @click="selectTemplate(template)"
                elevation="2"
                hover
              >
                <v-img 
                  :src="template.thumbnail" 
                  height="200" 
                  cover
                  class="template-thumbnail"
                >
                  <div class="template-overlay">
                    <v-icon 
                      v-if="selectedTemplate === template.id"
                      color="primary" 
                      size="large"
                    >
                      mdi-check-circle
                    </v-icon>
                  </div>
                </v-img>
                
                <v-card-title class="text-subtitle-1 pa-3">
                  {{ template.name }}
                </v-card-title>
                
                <v-card-subtitle class="px-3 pb-2">
                  {{ template.description }}
                </v-card-subtitle>
                
                <v-card-text class="px-3 pt-0">
                  <v-chip 
                    v-for="tag in template.tags" 
                    :key="tag"
                    size="small" 
                    class="mr-1 mb-1"
                    variant="outlined"
                  >
                    {{ tag }}
                  </v-chip>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
          </div>
          
          <!-- Empty state -->
          <div v-else class="text-center py-8">
            <v-icon size="64" color="grey-lighten-2">mdi-file-document-multiple-outline</v-icon>
            <p class="mt-4 text-body-1">Brak dostępnych szablonów</p>
            <p class="text-body-2 text-medium-emphasis">Utwórz swój pierwszy szablon zapisując aktualną treść</p>
          </div>
        </v-card-text>
        
        <v-divider></v-divider>
        <v-card-actions class="pa-4">
          <v-btn 
            color="primary" 
            :disabled="!selectedTemplate"
            @click="loadSelectedTemplate"
          >
            Użyj szablonu
          </v-btn>
          <v-spacer></v-spacer>
          <v-btn @click="showTemplateDialog = false">Anuluj</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog zapisywania szablonu -->
    <v-dialog v-model="showSaveTemplateDialog" max-width="500px">
      <v-card>
        <v-card-title class="d-flex align-center">
          <v-icon class="mr-2">mdi-content-save</v-icon>
          Zapisz jako szablon
        </v-card-title>
        <v-divider></v-divider>
        
        <v-form ref="saveTemplateForm" v-model="saveTemplateValid">
          <v-card-text class="pa-4">
            <v-text-field
              v-model="newTemplate.name"
              label="Nazwa szablonu"
              :rules="[v => !!v || 'Nazwa jest wymagana']"
              required
              variant="outlined"
              class="mb-3"
            ></v-text-field>
            
            <v-textarea
              v-model="newTemplate.description"
              label="Opis szablonu"
              :rules="[v => !!v || 'Opis jest wymagany']"
              required
              variant="outlined"
              rows="3"
              class="mb-3"
            ></v-textarea>
            
            <v-combobox
              v-model="newTemplate.tags"
              label="Tagi (naciśnij Enter, aby dodać)"
              multiple
              chips
              variant="outlined"
              class="mb-3"
            ></v-combobox>
            
            <v-select
              v-model="newTemplate.category"
              label="Kategoria"
              :items="templateCategories"
              :rules="[v => !!v || 'Kategoria jest wymagana']"
              required
              variant="outlined"
            ></v-select>
          </v-card-text>
        </v-form>
        
        <v-divider></v-divider>
        <v-card-actions class="pa-4">
          <v-btn 
            color="primary" 
            :disabled="!saveTemplateValid"
            @click="saveAsTemplate"
          >
            Zapisz szablon
          </v-btn>
          <v-spacer></v-spacer>
          <v-btn @click="closeSaveTemplateDialog">Anuluj</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Menu wyboru typu bloku -->
    <v-menu
      v-model="addBlockMenuVisible"
      :activator="addBlockMenuActivator"
      offset-y
      close-on-content-click
    >
      <v-list>
        <v-list-item
          v-for="blockType in availableBlocks"
          :key="blockType.type"
          @click="addBlockAtPosition(blockType.type, addBlockPosition)"
        >
          <template v-slot:prepend>
            <v-icon class="mr-3">{{ blockType.icon }}</v-icon>
          </template>
          <v-list-item-title>{{ blockType.name }}</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
  </div>
</template>

<script>
// Importy komponentów bloków
import TextBlock from './blocks/TextBlock.vue';
import ButtonBlock from './blocks/ButtonBlock.vue';
import ImageBlock from './blocks/ImageBlock.vue';
import SpacerBlock from './blocks/SpacerBlock.vue';

// Importy komponentów właściwości
import TextProperties from './properties/TextProperties.vue';
import ButtonProperties from './properties/ButtonProperties.vue';
import ImageProperties from './properties/ImageProperties.vue';
import SpacerProperties from './properties/SpacerProperties.vue';

// Import serwisu templat
import { Templates } from '@/services/templates.js';

export default {
  name: 'BlockEmailEditor',
  components: {
    TextBlock,
    ButtonBlock,
    ImageBlock,
    SpacerBlock,
    TextProperties,
    ButtonProperties,
    ImageProperties,
    SpacerProperties
  },
  data() {
    return {
      // === STAN EDYTORA ===
      selectedBlockId: null,          // ID aktualnie wybranego bloku (do edycji właściwości)
      previewDialog: false,           // Czy dialog podglądu HTML jest otwarty
      generatedHtml: '',              // Wygenerowany kod HTML e-maila
      emailBlocks: [],                // Tablica wszystkich bloków w e-mailu
      nextBlockId: 1,                 // Licznik do generowania unikalnych ID bloków
      draggedBlockIndex: null,        // Indeks przeciąganego bloku (dla drag & drop)
      isDragging: false,              // Czy aktualnie przeciągamy blok
      dropZoneIndex: null,            // Indeks strefy upuszczania (wizualizacja)
      
      // === TRYBY WYŚWIETLANIA ===
      canvasMode: 'desktop',          // Tryb canvas: 'desktop' (600px) lub 'mobile' (375px)
      previewMode: 'desktop',         // Tryb dla dialogu podglądu HTML
      
      // === DOSTĘPNE TYPY BLOKÓW ===
      // Definiuje jakie bloki można dodać do e-maila
      availableBlocks: [
        { type: 'text', name: 'Tekst', icon: 'mdi-format-text' },
        { type: 'button', name: 'Przycisk', icon: 'mdi-button-cursor' },
        { type: 'image', name: 'Obraz', icon: 'mdi-image' },
        { type: 'spacer', name: 'Odstęp', icon: 'mdi-minus' }
      ],

      alignOptions: [
        { title: 'Do lewej', value: 'left' },
        { title: 'Do środka', value: 'center' },
        { title: 'Do prawej', value: 'right' }
      ],

      // Szablony
      showTemplateDialog: false,
      selectedTemplate: null,
      availableTemplates: [],
      templatesLoading: false,
      templatesError: null,

      // Zapisywanie szablonów
      showSaveTemplateDialog: false,
      saveTemplateValid: false,
      newTemplate: {
        name: '',
        description: '',
        category: '',
        tags: []
      },
      templateCategories: [
        'Newsletter',
        'Promocja',
        'Powiadomienie',
        'Wydarzenie',
        'Transakcyjny',
        'Inne'
      ],

      // Menu dodawania bloków
      addBlockMenuVisible: false,
      addBlockMenuActivator: null,
      addBlockPosition: 0
    };
  },

  computed: {
    selectedBlock() {
      return this.emailBlocks.find(block => block.id === this.selectedBlockId);
    }
  },

  methods: {
    addBlock(type) {
      const newBlock = this.createBlock(type);
      this.emailBlocks.push(newBlock);
      this.selectBlock(newBlock.id);
    },

    showAddBlockMenu(event, position) {
      this.addBlockPosition = position;
      this.addBlockMenuActivator = event.target;
      this.addBlockMenuVisible = true;
    },

    addBlockAtPosition(type, position) {
      const newBlock = this.createBlock(type);
      this.emailBlocks.splice(position, 0, newBlock);
      this.selectBlock(newBlock.id);
      this.addBlockMenuVisible = false;
    },

    createBlock(type) {
      const baseBlock = {
        id: this.nextBlockId++,
        type,
        style: {
          marginTop: 0,
          marginBottom: 0,
          textAlign: 'left'
        }
      };

      switch (type) {
        case 'text':
          return {
            ...baseBlock,
            content: {
              text: 'Wprowadź swój tekst tutaj',
              fontSize: 16,
              color: '#333333',
              fontWeight: 'normal',
              fontStyle: 'normal',
              fontFamily: 'Arial, sans-serif'
            }
          };

        case 'button':
          return {
            ...baseBlock,
            content: {
              text: 'Kliknij tutaj',
              url: 'https://example.com',
              backgroundColor: '#007bff',
              textColor: '#ffffff',
              borderRadius: 4,
              padding: '12px 24px'
            },
            style: {
              ...baseBlock.style,
              textAlign: 'center'
            }
          };

        case 'image':
          return {
            ...baseBlock,
            content: {
              src: 'https://via.placeholder.com/400x200?text=Obraz',
              alt: 'Opis obrazu',
              width: 400,
              height: 200,
              url: ''
            },
            style: {
              ...baseBlock.style,
              textAlign: 'center'
            }
          };

        case 'spacer':
          return {
            ...baseBlock,
            content: {
              height: 40
            }
          };

        default:
          return baseBlock;
      }
    },

    selectBlock(blockId) {
      this.selectedBlockId = blockId;
    },

    updateBlock(blockId, updates) {
      const blockIndex = this.emailBlocks.findIndex(b => b.id === blockId);
      if (blockIndex !== -1) {
        this.emailBlocks[blockIndex] = { ...this.emailBlocks[blockIndex], ...updates };
      }
    },

    updateSelectedBlock() {
      if (this.selectedBlock) {
        // Znajdź indeks wybranego bloku i zastąp go nowym obiektem
        const blockIndex = this.emailBlocks.findIndex(b => b.id === this.selectedBlockId);
        if (blockIndex !== -1) {
          // Tworzymy głęboką kopię aby wywołać reaktywność Vue
          const updatedBlock = JSON.parse(JSON.stringify(this.selectedBlock));
          this.emailBlocks.splice(blockIndex, 1, updatedBlock);
        }
      }
    },

    removeBlock(index) {
      this.emailBlocks.splice(index, 1);
      if (this.emailBlocks.length === 0) {
        this.selectedBlockId = null;
      }
    },

    duplicateBlock(index) {
      const block = this.emailBlocks[index];
      const duplicated = {
        ...JSON.parse(JSON.stringify(block)),
        id: this.nextBlockId++
      };
      this.emailBlocks.splice(index + 1, 0, duplicated);
    },

    clearAll() {
      this.emailBlocks = [];
      this.selectedBlockId = null;
    },

    onDragStart(event, blockType) {
      event.dataTransfer.setData('blockType', blockType);
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
      event.dataTransfer.setData('text/plain', ''); // Dla kompatybilności
      
      // Dodaj klasę CSS do przeciąganego elementu
      event.target.classList.add('dragging');
      
      // Wyłącz hover efekty podczas przeciągania
      document.body.classList.add('is-dragging');
    },

    handleDragOver(index) {
      if (this.isDragging && this.draggedBlockIndex !== null) {
        // Pokaż drop zone w odpowiednim miejscu
        this.dropZoneIndex = index;
      }
    },

    handleDragEnter(index) {
      if (this.isDragging && this.draggedBlockIndex !== null) {
        this.dropZoneIndex = index;
      }
    },

    onDragEnd() {
      // Cleanup po zakończeniu przeciągania
      this.isDragging = false;
      this.dropZoneIndex = null;
      this.draggedBlockIndex = null;
      
      // Usuń klasy CSS
      const draggingElements = document.querySelectorAll('.dragging');
      draggingElements.forEach(el => el.classList.remove('dragging'));
      
      // Przywróć hover efekty
      document.body.classList.remove('is-dragging');
    },

    onBlockDrop(event, targetIndex) {
      event.preventDefault();
      
      // Resetuj stan przeciągania
      this.isDragging = false;
      this.dropZoneIndex = null;
      
      // Usuń klasę CSS
      const draggingElements = document.querySelectorAll('.dragging');
      draggingElements.forEach(el => el.classList.remove('dragging'));
      
      // Przywróć hover efekty
      document.body.classList.remove('is-dragging');
      
      if (this.draggedBlockIndex !== null && this.draggedBlockIndex !== targetIndex) {
        // Przenieś blok z draggedBlockIndex do targetIndex
        const draggedBlock = this.emailBlocks[this.draggedBlockIndex];
        
        // Usuń z starej pozycji
        this.emailBlocks.splice(this.draggedBlockIndex, 1);
        
        // Wstaw w nowej pozycji
        const newIndex = this.draggedBlockIndex < targetIndex ? targetIndex - 1 : targetIndex;
        this.emailBlocks.splice(newIndex, 0, draggedBlock);
      }
      
      this.draggedBlockIndex = null;
    },

    getBlockComponent(type) {
      const components = {
        'text': 'TextBlock',
        'button': 'ButtonBlock',
        'image': 'ImageBlock',
        'spacer': 'SpacerBlock'
      };
      return components[type] || 'TextBlock';
    },

    getPropertiesComponent(type) {
      const components = {
        'text': 'TextProperties',
        'button': 'ButtonProperties',
        'image': 'ImageProperties',
        'spacer': 'SpacerProperties'
      };
      return components[type] || 'TextProperties';
    },

    getBlockTypeName(type) {
      const names = {
        'text': 'Blok tekstowy',
        'button': 'Przycisk',
        'image': 'Obraz',
        'spacer': 'Odstęp'
      };
      return names[type] || 'Nieznany blok';
    },

    generatePreview() {
      // Synchronizuj tryb podglądu z trybem canvas
      this.previewMode = this.canvasMode;
      this.generatedHtml = this.generateEmailHtml();
      this.previewDialog = true;
    },

    generateEmailHtml() {
      const containerWidth = this.previewMode === 'mobile' ? '375px' : '600px';
      
      let html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>Email Template Preview</title>
          <style>
            @media only screen and (max-width: 480px) {
              .email-container {
                width: 100% !important;
                max-width: 100% !important;
              }
              .mobile-padding {
                padding-left: 10px !important;
                padding-right: 10px !important;
              }
              .mobile-text {
                font-size: 14px !important;
                line-height: 1.4 !important;
              }
            }
          </style>
        </head>
        <body style="margin: 0; padding: 20px; background-color: #f5f5f5; font-family: Arial, sans-serif;">
          <div class="email-container" style="max-width: ${containerWidth}; margin: 0 auto; background-color: white; border-radius: 8px; overflow: hidden;">
      `;

      this.emailBlocks.forEach(block => {
        html += this.renderBlockToHtml(block);
      });

      html += `
          </div>
        </body>
        </html>
      `;

      return html;
    },

    renderBlockToHtml(block) {
      const style = `margin-top: ${block.style.marginTop}px; margin-bottom: ${block.style.marginBottom}px; text-align: ${block.style.textAlign};`;
      
      switch (block.type) {
        case 'text':
          return `
            <div class="mobile-padding" style="padding: 0 20px; ${style}">
              <p class="mobile-text" style="font-size: ${block.content.fontSize}px; color: ${block.content.color}; font-weight: ${block.content.fontWeight}; font-style: ${block.content.fontStyle}; font-family: ${block.content.fontFamily || 'Arial, sans-serif'}; margin: 0; line-height: 1.5;">
                ${block.content.text}
              </p>
            </div>
          `;

        case 'button':
          const buttonLink = block.content.url ? `href="${block.content.url}"` : '';
          return `
            <div class="mobile-padding" style="padding: 0 20px; ${style}">
              <a ${buttonLink} style="display: inline-block; background-color: ${block.content.backgroundColor}; color: ${block.content.textColor}; padding: ${block.content.padding}; border-radius: ${block.content.borderRadius}px; text-decoration: none; font-weight: bold; font-size: 16px; border: none; cursor: pointer;">
                ${block.content.text}
              </a>
            </div>
          `;

        case 'image':
          const imageLink = block.content.url ? `<a href="${block.content.url}">` : '';
          const imageLinkEnd = block.content.url ? `</a>` : '';
          return `
            <div class="mobile-padding" style="padding: 0 20px; ${style}">
              ${imageLink}
              <img src="${block.content.src}" alt="${block.content.alt}" style="width: ${block.content.width}px; height: ${block.content.height}px; max-width: 100%; height: auto; border-radius: ${block.content.borderRadius || 0}px; display: block;">
              ${imageLinkEnd}
            </div>
          `;

        case 'spacer':
          const spacerBg = block.content.backgroundColor && block.content.backgroundColor !== 'transparent' 
            ? `background-color: ${block.content.backgroundColor};` 
            : '';
          return `
            <div style="height: ${block.content.height}px; ${spacerBg} border-radius: ${block.content.borderRadius || 0}px;"></div>
          `;

        default:
          return '';
      }
    },

    async copyHtml() {
      try {
        await navigator.clipboard.writeText(this.generatedHtml);
        // Można dodać toast notification
        console.log('HTML skopiowany do schowka');
      } catch (error) {
        console.error('Nie udało się skopiować HTML:', error);
      }
    },

    exportAsImage() {
      // Funkcja do eksportu jako obraz - do implementacji
      console.log('Eksport jako obraz - funkcja do dodania');
      alert('Funkcjonalność eksportu jako obraz będzie dostępna w przyszłej wersji');
    },

    // Metody obsługi szablonów
    selectTemplate(template) {
      this.selectedTemplate = template.id;
    },

    async loadTemplates() {
      this.templatesLoading = true;
      this.templatesError = null;
      
      try {
        // Pobierz templaty z API wraz z blokami
        this.availableTemplates = await Templates.getTemplates({
          includeBlocks: true
        });
        console.log('Załadowano templaty z API:', this.availableTemplates.length);
      } catch (error) {
        console.error('Błąd podczas ładowania templat:', error);
        this.templatesError = 'Nie udało się załadować szablonów';
        
        // Fallback do pustej listy
        this.availableTemplates = [];
      } finally {
        this.templatesLoading = false;
      }
    },

    async loadSelectedTemplate() {
      if (!this.selectedTemplate) return;
      
      try {
        // Pobierz pełne dane templatu z API
        const templateData = await Templates.getTemplateById(this.selectedTemplate);
        
        if (!templateData) {
          console.error('Szablon nie został znaleziony:', this.selectedTemplate);
          return;
        }

        // Zwiększ licznik użycia
        await Templates.incrementUsage(this.selectedTemplate);
        
        // Wyczyść obecne bloki
        this.emailBlocks = [];
        this.selectedBlockId = null;
        
        // Załaduj bloki z szablonu
        if (templateData.blocks && Array.isArray(templateData.blocks)) {
          templateData.blocks.forEach((blockData) => {
            const block = {
              id: this.nextBlockId++,
              type: blockData.blockType,
              content: blockData.content || {},
              style: blockData.style || {
                marginTop: 0,
                marginBottom: 0,
                textAlign: 'left'
              }
            };
            this.emailBlocks.push(block);
          });
        }
        
        // Zamknij dialog
        this.showTemplateDialog = false;
        this.selectedTemplate = null;
        
        console.log('Szablon został załadowany pomyślnie:', templateData.name);
      } catch (error) {
        console.error('Błąd podczas ładowania szablonu:', error);
        // Można dodać toast notification
        alert('Nie udało się załadować szablonu: ' + error.message);
      }
    },

    closeSaveTemplateDialog() {
      this.showSaveTemplateDialog = false;
      this.newTemplate = {
        name: '',
        description: '',
        category: '',
        tags: []
      };
    },

    async saveAsTemplate() {
      if (!this.saveTemplateValid || this.emailBlocks.length === 0) {
        return;
      }

      try {
        // Generuj thumbnail na podstawie bloków
        let thumbnailSvg;
        try {
          thumbnailSvg = await Templates.generateThumbnail(this.emailBlocks);
        } catch (error) {
          console.warn('Nie udało się wygenerować thumbnail, używam domyślny:', error);
          thumbnailSvg = `data:image/svg+xml;base64,${btoa(`
            <svg xmlns="http://www.w3.org/2000/svg" width="200" height="150" viewBox="0 0 200 150">
              <rect width="200" height="150" fill="#f5f5f5"/>
              <text x="100" y="75" text-anchor="middle" font-family="Arial" font-size="12" fill="#666">
                ${this.newTemplate.name}
              </text>
              <text x="100" y="95" text-anchor="middle" font-family="Arial" font-size="10" fill="#999">
                ${this.emailBlocks.length} blok(ów)
              </text>
            </svg>
          `)}`;
        }
        
        // Przygotuj dane szablonu
        const templateData = {
          name: this.newTemplate.name,
          description: this.newTemplate.description,
          category: this.newTemplate.category,
          tags: this.newTemplate.tags,
          thumbnail: thumbnailSvg,
          author: "Użytkownik",
          blocks: this.emailBlocks.map(block => ({
            blockType: block.type,
            content: block.content || {},
            style: block.style || {
              marginTop: 0,
              marginBottom: 0,
              textAlign: 'left'
            }
          })),
          metadata: {
            blocks: this.emailBlocks.length,
            estimatedHeight: this.emailBlocks.reduce((height, block) => {
              // Szacunkowa wysokość na podstawie typu bloku
              const blockHeights = {
                'text': 50,
                'button': 60,
                'image': 200,
                'spacer': block.content?.height || 40
              };
              return height + (blockHeights[block.type] || 50) + 
                     (block.style?.marginTop || 0) + 
                     (block.style?.marginBottom || 0);
            }, 0),
            createdWith: 'BlockEmailEditor',
            version: '2.0'
          }
        };

        // Zapisz szablon przez API
        const createdTemplate = await Templates.createTemplate(templateData);
        
        // Dodaj do listy dostępnych szablonów
        this.availableTemplates.unshift(createdTemplate);

        // Zamknij dialog i pokaż komunikat
        this.closeSaveTemplateDialog();
        
        console.log('Szablon został zapisany pomyślnie w bazie danych:', createdTemplate);
        // Można dodać toast/snackbar notification
        
      } catch (error) {
        console.error('Błąd podczas zapisywania szablonu:', error);
        alert('Nie udało się zapisać szablonu: ' + (error.response?.data?.message || error.message));
      }
    },

    // Sprawdź czy potrzebne jest przewijanie i dodaj odpowiednie klasy
    checkScrollable() {
      this.$nextTick(() => {
        const canvasWrapper = this.$el?.querySelector('.canvas-wrapper');
        if (canvasWrapper) {
          const isScrollable = canvasWrapper.scrollHeight > canvasWrapper.clientHeight;
          
          if (isScrollable) {
            canvasWrapper.classList.add('scrollable');
          } else {
            canvasWrapper.classList.remove('scrollable');
          }
        }
      });
    },

    // Dodaj nową metodę do migracji starych templat
    async migrateLegacyTemplates() {
      try {
        const customTemplates = JSON.parse(localStorage.getItem('customTemplates') || '{}');
        
        if (Object.keys(customTemplates).length > 0) {
          console.log('Znaleziono lokalne templaty do migracji:', Object.keys(customTemplates).length);
          
          for (const [templateId, templateData] of Object.entries(customTemplates)) {
            try {
              // Konwertuj stary format do nowego
              const convertedTemplate = Templates.convertLegacyTemplate(templateData);
              
              // Sprawdź czy template już nie istnieje w API (po nazwie)
              const existingTemplates = await Templates.searchTemplates(convertedTemplate.name);
              const exists = existingTemplates.find(t => t.name === convertedTemplate.name);
              
              if (!exists) {
                // Zapisz template w API
                const migratedTemplate = await Templates.createTemplate(convertedTemplate);
                console.log('Zmigrowano template:', migratedTemplate.name);
              }
            } catch (error) {
              console.error('Błąd migracji template:', templateId, error);
            }
          }
          
          // Po migracji można wyczyścić localStorage (opcjonalnie)
          // localStorage.removeItem('customTemplates');
        }
      } catch (error) {
        console.error('Błąd podczas migracji lokalnych templat:', error);
      }
    }
  },

  watch: {
    previewMode() {
      // Regeneruj HTML gdy zmieni się tryb podglądu
      if (this.previewDialog) {
        this.generatedHtml = this.generateEmailHtml();
      }
    },

    emailBlocks: {
      handler() {
        // Sprawdź przewijanie gdy zmieni się liczba bloków
        this.checkScrollable();
      },
      deep: true
    },

    canvasMode() {
      // Sprawdź przewijanie gdy zmieni się tryb canvas
      this.checkScrollable();
    }
  },

  async mounted() {
    // Załaduj templaty z API
    await this.loadTemplates();

    // Migracja: Sprawdź czy są niestandardowe szablony w localStorage i przenieś je do API
    await this.migrateLegacyTemplates();

    // Sprawdź przewijanie po załadowaniu komponentu
    this.checkScrollable();
  }
};
</script>

<style scoped>
.block-email-editor {
  width: 100vw;
  height: 100%;
  background: linear-gradient(135deg, #eadcf6 0%, #9395fa 100%);
  position: relative;
  margin: 0;
  padding: 0;
}

/* Modern Panel Styling */
.blocks-panel .v-card,
.canvas-panel .v-card,
.properties-panel .v-card {
  border-radius: 20px !important;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1) !important;
  border: 1px solid rgba(255, 255, 255, 0.2) !important;
  background: rgba(255, 255, 255, 0.95) !important;
  backdrop-filter: blur(20px) !important;
}

.blocks-panel,
.canvas-panel,
.properties-panel {
  height: 100vh;
  overflow-y: hidden;
}

.canvas-panel {
  display: flex;
  flex-direction: column;
}

.properties-header {
  flex-shrink: 0;
  border-bottom: 1px solid #e0e0e0;
}

.properties-content {
  overflow-y: auto;
  overflow-x: hidden;
  max-height: calc(100vh - 120px);
}

.properties-content::-webkit-scrollbar {
  width: 6px;
}

.properties-content::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.properties-content::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.properties-content::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

.canvas-panel .v-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: visible;
}

.block-item {
  padding: 12px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
}

.block-item:hover {
  background-color: #f5f5f5;
  border-color: #2196F3;
}

.canvas-wrapper {
  justify-content: center;
  width: 100%;
  background: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  overflow: auto;

}

.email-canvas {
  border: 2px dashed rgba(102, 126, 234, 0.3);
  border-radius: 16px;
  padding: 20px;
  position: relative;
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  transition: all 0.3s ease;
  box-shadow: inset 0 2px 10px rgba(0, 0, 0, 0.05), 0 4px 20px rgba(0, 0, 0, 0.08);
  min-height: 400px;
  height: auto;
  width: 100%;
  display: block;
  overflow: visible;
}

.desktop-canvas {
  width: 600px;
  max-width: 600px;
}

.mobile-canvas {
  width: 375px;
  max-width: 375px;
}

.mobile-canvas .email-block {
  font-size: 14px;
}

.mobile-canvas .email-block img {
  max-width: 100% !important;
  height: auto !important;
}

.empty-canvas {
  text-align: center;
  padding: 60px 20px;
  min-height: 300px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
  border-radius: 12px;
  border: 2px dashed rgba(102, 126, 234, 0.2);
  position: relative;
}

.empty-canvas::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23667eea' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E") repeat;
  border-radius: 12px;
  z-index: 0;
}

.empty-canvas > * {
  position: relative;
  z-index: 1;
}

.blocks-container {
  min-height: 400px;
  height: auto;
  width: 100%;
  position: relative;
}

.block-wrapper {
  position: relative;
  margin-bottom: 0;
}

.add-block-button {
  display: flex;
  justify-content: center;
  align-items: center;
  opacity: 0;
  transition: opacity 0.2s ease;
  height: 16px;
  position: relative;
  z-index: 5;
}

.add-block-top {
  margin-bottom: -8px;
}

.add-block-bottom {
  margin-top: -8px;
}

.block-wrapper:hover .add-block-button,
.add-block-button:hover {
  opacity: 1;
}

.add-block-button .v-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
  color: white !important;
  border: none !important;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3) !important;
}

.add-block-button .v-btn:hover {
  background: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%) !important;
  transform: translateY(-2px) scale(1.05) !important;
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4) !important;
}

.email-block {
  border: 2px solid transparent;
  border-radius: 12px;
  padding: 8px;
  position: relative;
  cursor: pointer;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
}

.block-content-wrapper {
  width: 100%;
  position: relative;
}

.email-block:hover {
  border-color: rgba(102, 126, 234, 0.6);
  background: rgba(102, 126, 234, 0.05);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.2);
}

.email-block.selected {
  border-color: #667eea;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  box-shadow: 0 4px 20px rgba(102, 126, 234, 0.25);
}

.block-controls {
  position: absolute;
  top: -8px;
  right: -8px;
  display: none;
  gap: 4px;
  z-index: 10;
}

.email-block:hover .block-controls,
.email-block.selected .block-controls {
  display: flex;
}

.email-preview {
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
  margin: 0 auto;
  transition: all 0.3s ease;
}

.email-preview.desktop-preview {
  max-width: 100%;
  width: auto;
}

.email-preview.mobile-preview {
  max-width: 375px;
  width: 375px;
}

/* Drag and drop styling */
.email-block[draggable="true"]:hover {
  cursor: grab;
}

.email-block[draggable="true"]:active {
  cursor: grabbing;
  opacity: 0.7;
}

.email-block.dragging {
  opacity: 0.5;
  transform: scale(0.95);
}

/* Wizualizacja przeciąganego bloku */
.email-block.being-dragged {
  opacity: 0.4;
  transform: scale(0.98);
  border: 2px dashed #ccc !important;
}

/* Blok nad którym się unosi przeciągany element */
.email-block.drag-over {
  border: 2px solid #2196F3 !important;
  background-color: rgba(33, 150, 243, 0.05) !important;
}

/* Strefa upuszczania */
.drop-zone {
  height: 0;
  opacity: 0;
  transition: all 0.3s ease;
  overflow: hidden;
}

.drop-zone-active {
  height: 60px;
  opacity: 1;
  margin: 8px 0;
  border: 2px dashed #2196F3;
  border-radius: 8px;
  background: linear-gradient(135deg, rgba(33, 150, 243, 0.1), rgba(33, 150, 243, 0.05));
  position: relative;
}

.drop-zone-end {
  margin-top: 16px;
}

.drop-zone-indicator {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  align-items: center;
  gap: 8px;
  color: #2196F3;
  font-weight: 500;
  font-size: 14px;
}

/* Wyłącz hover efekty podczas przeciągania */
.is-dragging .email-block:hover {
  border-color: transparent !important;
  background-color: transparent !important;
}

.is-dragging .add-block-button:hover {
  opacity: 0.7 !important;
}

/* Styles dla dialogu szablonów */
.template-card {
  cursor: pointer;
  transition: all 0.3s ease;
  height: 100%;
  position: relative;
}

.template-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.15) !important;
}

.template-card.template-selected {
  border: 2px solid rgb(var(--v-theme-primary));
  box-shadow: 0 4px 16px rgba(var(--v-theme-primary), 0.3) !important;
}

.template-thumbnail {
  position: relative;
  border-radius: 4px 4px 0 0;
}

.template-overlay {
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.template-card .v-card-title {
  font-size: 1.1rem;
  font-weight: 600;
  line-height: 1.3;
}

.template-card .v-card-subtitle {
  font-size: 0.9rem;
  line-height: 1.4;
  color: rgba(0,0,0,0.6);
}

.template-card .v-chip {
  font-size: 0.75rem;
}

/* Niestandardowe style dla suwaka */
.canvas-wrapper::-webkit-scrollbar {
  width: 8px;
}

.canvas-wrapper::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.canvas-wrapper::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
  transition: background-color 0.2s ease;
}

.canvas-wrapper::-webkit-scrollbar-thumb:hover {
  background: #a1a1a1;
}

/* Style dla Firefoksa */
.canvas-wrapper {
  scrollbar-width: thin;
  scrollbar-color: #c1c1c1 #f1f1f1;
}

/* Wskaźnik przewijania dla długich szablonów */
.canvas-wrapper::before {
  content: '';
  position: sticky;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, rgba(33, 150, 243, 0.1) 0%, rgba(33, 150, 243, 0.3) 50%, rgba(33, 150, 243, 0.1) 100%);
  z-index: 5;
  display: none;
}

.canvas-wrapper.scrollable::before {
  display: none;
}

/* Nadpisanie stylów Vuetify dla bloków e-maila */
.email-canvas .text-block p {
  font-family: Arial, sans-serif !important;
  font-weight: var(--font-weight) !important;
  font-style: var(--font-style) !important;
}

/* Resetowanie stylów Vuetify w kontekście edytora */
.block-email-editor .v-application__wrap .text-block p {
  font-family: Arial, sans-serif !important;
}

/* Style dla podglądu HTML - nadpisanie Vuetify */
.html-content-preview {
  font-family: initial !important;
}

.html-content-preview * {
  font-family: unset !important;
}

.html-content-preview p {
  font-family: unset !important;
  font-weight: unset !important;
  font-style: unset !important;
}

.html-content-preview .mobile-text {
  font-family: unset !important;
}

/* Bardzo agresywne nadpisanie Vuetify */
.v-application .v-dialog .html-content-preview p {
  font-family: unset !important;
}

.v-application .html-content-preview * {
  font-family: unset !important;
}

.v-app .html-content-preview p {
  font-family: unset !important;
}

/* Reset dla wszystkich możliwych selektorów Vuetify */
.v-application .html-content-preview p,
.v-application .html-content-preview span,
.v-application .html-content-preview div {
  font-family: unset !important;
}
</style>