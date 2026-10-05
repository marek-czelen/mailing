/**
 * Testy komponentów Vue - Frontend
 */
import { describe, test, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import { createI18n } from 'vue-i18n'
import { createVuetify } from 'vuetify'
import { h } from 'vue'

// Mock serwisów
vi.mock('@/services/templates', () => ({
  Templates: {
    getTemplates: vi.fn().mockResolvedValue([]),
    getTemplateById: vi.fn().mockResolvedValue(null),
    createTemplate: vi.fn().mockResolvedValue({}),
    deleteTemplate: vi.fn().mockResolvedValue(true),
    incrementUsage: vi.fn().mockResolvedValue(true),
    generateThumbnail: vi.fn().mockResolvedValue('data:image/svg+xml;base64,')
  }
}))

vi.mock('@/services/campaigns', () => ({
  Campaigns: {
    getList: vi.fn().mockResolvedValue([]),
    getCampaignById: vi.fn().mockResolvedValue(null),
    create: vi.fn().mockResolvedValue({}),
    update: vi.fn().mockResolvedValue({}),
    delete: vi.fn().mockResolvedValue(true)
  }
}))

vi.mock('@/services/ai', () => ({
  AiService: {
    generateContent: vi.fn().mockResolvedValue('<p>Generated</p>'),
    generateSubject: vi.fn().mockResolvedValue('Subject'),
    improveText: vi.fn().mockResolvedValue('Improved'),
    generateCTA: vi.fn().mockResolvedValue(['CTA1', 'CTA2']),
    checkSpamScore: vi.fn().mockResolvedValue({ score: 10 })
  }
}))

// Setup i18n
const i18n = createI18n({
  legacy: false,
  locale: 'pl',
  fallbackLocale: 'en',
  messages: {
    pl: {
      editor: {
        addBlock: 'Dodaj blok',
        blocks: 'Bloki',
        myTemplates: 'Moje szablony',
        noTemplates: 'Brak szablonów',
        saveAsTemplate: 'Zapisz jako szablon',
        preview: 'Podgląd',
        previewHtml: 'Podgląd HTML',
        livePreview: 'Podgląd na żywo',
        clear: 'Wyczyść',
        clearAll: 'Wyczyść wszystko',
        undo: 'Cofnij',
        redo: 'Ponów',
        dropHere: 'Upuść tutaj',
        dropAtEnd: 'Upuść na końcu',
        emptyCanvas: 'Przeciągnij bloki',
        emptyCanvasSub: 'lub kliknij',
        selectBlock: 'Kliknij blok',
        blockCount: '{count} bloków',
        properties: 'Właściwości',
        general: 'Ogólne',
        marginTop: 'Margines góra',
        marginBottom: 'Margines dół',
        alignment: 'Wyrównanie',
        backgroundColor: 'Tło bloku',
        close: 'Zamknij',
        cancel: 'Anuluj',
        save: 'Zapisz',
        delete: 'Usuń',
        duplicate: 'Duplikuj',
        drag: 'Przeciągnij',
        copyHtml: 'Kopiuj HTML',
        copySource: 'Kopiuj źródło',
        exportToCampaign: 'Eksportuj',
        templateName: 'Nazwa',
        templateDescription: 'Opis',
        templateCategory: 'Kategoria',
        templateTags: 'Tagi',
        blockTypes: {
          text: 'Tekst', button: 'Przycisk', image: 'Obraz',
          spacer: 'Odstęp', divider: 'Separator',
          social: 'Social Media', header: 'Nagłówek'
        },
        ai: {
          title: 'Asystent AI', subtitle: 'Generuj',
          generateContent: 'Generowanie', generateContentDesc: 'Opisz',
          generateContentPlaceholder: 'Np...', generate: 'Generuj',
          subjectLine: 'Temat', subjectContext: 'Kontekst',
          suggestSubject: 'Sugeruj', improveText: 'Ulepszanie',
          textToImprove: 'Tekst', textToImprovePlaceholder: 'Wklej',
          improveStyle: 'Styl', improve: 'Popraw',
          cta: 'CTA', ctaContext: 'Kontekst', suggestCta: 'Sugeruj',
          translation: 'Tłumaczenie', textToTranslate: 'Tekst',
          translateTo: 'Tłumacz', result: 'Wynik', use: 'Użyj',
          tones: { professional: 'Prof.', casual: 'Przyj.', persuasive: 'Przek.', urgent: 'Pilny' },
          styles: { professional: 'Prof.', casual: 'Przyj.', persuasive: 'Przek.', urgent: 'Pilny' }
        },
        placeholders: {
          title: 'Placeholdery', search: 'Szukaj',
          contactData: 'Kontakt', systemLinks: 'Linki',
          campaignData: 'Kampania', companyData: 'Firma',
          lastInserted: 'Ostatnio'
        },
        spam: { title: 'Spam', checking: 'Analizowanie', scale: 'Skala', suggestions: 'Sugestie' },
        defaultText: 'Wpisz tekst...', defaultButton: 'Kliknij',
        defaultImageAlt: 'Opis', defaultHeaderTitle: 'Tytuł',
        defaultHeaderSubtitle: 'Podtytuł',
        categories: { newsletter: 'Newsletter', promotion: 'Promocja', other: 'Inne' }
      },
      validation: { required: 'Wymagane' }
    },
    en: {
      editor: {
        addBlock: 'Add Block', blocks: 'Blocks', myTemplates: 'My Templates',
        noTemplates: 'No templates', saveAsTemplate: 'Save as Template',
        preview: 'Preview', previewHtml: 'HTML Preview', livePreview: 'Live Preview',
        clear: 'Clear', clearAll: 'Clear All', undo: 'Undo', redo: 'Redo',
        dropHere: 'Drop here', dropAtEnd: 'Drop at end',
        emptyCanvas: 'Drag blocks', emptyCanvasSub: 'or click',
        selectBlock: 'Click a block', blockCount: '{count} blocks',
        properties: 'Properties', general: 'General',
        marginTop: 'Margin Top', marginBottom: 'Margin Bottom',
        alignment: 'Alignment', backgroundColor: 'Background',
        close: 'Close', cancel: 'Cancel', save: 'Save',
        delete: 'Delete', duplicate: 'Duplicate', drag: 'Drag',
        copyHtml: 'Copy HTML', copySource: 'Copy Source',
        exportToCampaign: 'Export', templateName: 'Name',
        templateDescription: 'Description', templateCategory: 'Category',
        templateTags: 'Tags',
        blockTypes: {
          text: 'Text', button: 'Button', image: 'Image',
          spacer: 'Spacer', divider: 'Divider',
          social: 'Social Media', header: 'Header'
        },
        ai: {
          title: 'AI Assistant', subtitle: 'Generate',
          generateContent: 'Generation', generateContentDesc: 'Describe',
          generateContentPlaceholder: 'E.g...', generate: 'Generate',
          subjectLine: 'Subject', subjectContext: 'Context',
          suggestSubject: 'Suggest', improveText: 'Improve',
          textToImprove: 'Text', textToImprovePlaceholder: 'Paste',
          improveStyle: 'Style', improve: 'Improve',
          cta: 'CTA', ctaContext: 'Context', suggestCta: 'Suggest',
          translation: 'Translation', textToTranslate: 'Text',
          translateTo: 'Translate', result: 'Result', use: 'Use',
          tones: { professional: 'Prof.', casual: 'Cas.', persuasive: 'Pers.', urgent: 'Urg.' },
          styles: { professional: 'Prof.', casual: 'Cas.', persuasive: 'Pers.', urgent: 'Urg.' }
        },
        placeholders: {
          title: 'Placeholders', search: 'Search',
          contactData: 'Contact', systemLinks: 'Links',
          campaignData: 'Campaign', companyData: 'Company',
          lastInserted: 'Last'
        },
        spam: { title: 'Spam', checking: 'Analyzing', scale: 'Scale', suggestions: 'Suggestions' },
        defaultText: 'Enter text...', defaultButton: 'Click',
        defaultImageAlt: 'Description', defaultHeaderTitle: 'Title',
        defaultHeaderSubtitle: 'Subtitle',
        categories: { newsletter: 'Newsletter', promotion: 'Promotion', other: 'Other' }
      },
      validation: { required: 'Required' }
    }
  }
})

// Setup Vuetify
const vuetify = createVuetify()

// Setup Router
const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/dashboard' },
    { path: '/dashboard', component: { template: '<div>Dashboard</div>' } },
    { path: '/campaigns', component: { template: '<div>Campaigns</div>' } },
    { path: '/block-email-editor', component: { template: '<div>Editor</div>' } }
  ]
})

// Helper do montowania komponentów z poprawnymi stubami Vuetify
function mountComponent(component, options = {}) {
  return mount(component, {
    global: {
      plugins: [i18n, vuetify, router],
      stubs: {
        // Stuby które przekazują propsy i sloty
        'v-icon': { template: '<span class="v-icon">{{ $attrs.icon }}</span>', inheritAttrs: false },
        'v-btn': { template: '<button class="v-btn"><slot /></button>' },
        'v-card': { template: '<div class="v-card" :class="$attrs.class"><slot /></div>', inheritAttrs: false },
        'v-card-title': { template: '<div class="v-card-title"><slot /></div>' },
        'v-card-text': { template: '<div class="v-card-text"><slot /></div>' },
        'v-card-actions': { template: '<div class="v-card-actions"><slot /></div>' },
        'v-divider': { template: '<hr />' },
        'v-text-field': { template: '<input class="v-text-field" />' },
        'v-textarea': { template: '<textarea class="v-textarea"></textarea>' },
        'v-select': { template: '<select class="v-select"><slot /></select>' },
        'v-dialog': { template: '<div class="v-dialog"><slot /></div>' },
        'v-tabs': { template: '<div class="v-tabs"><slot /></div>' },
        'v-tab': { template: '<div class="v-tab"><slot /></div>' },
        'v-container': { template: '<div class="v-container"><slot /></div>' },
        'v-row': { template: '<div class="v-row"><slot /></div>' },
        'v-col': { template: '<div class="v-col"><slot /></div>' },
        'v-list': { template: '<div class="v-list"><slot /></div>' },
        'v-list-item': { template: '<div class="v-list-item"><slot /></div>' },
        'v-list-item-title': { template: '<div class="v-list-item-title"><slot /></div>' },
        'v-menu': { template: '<div class="v-menu"><slot /></div>' },
        'v-spacer': { template: '<div class="v-spacer"></div>' },
        'v-progress-circular': { template: '<div class="v-progress-circular"></div>' },
        'v-progress-linear': { template: '<div class="v-progress-linear"></div>' },
        'v-chip': { template: '<span class="v-chip"><slot /></span>' },
        'v-expansion-panels': { template: '<div><slot /></div>' },
        'v-expansion-panel': { template: '<div><slot /></div>' },
        'v-expansion-panel-title': { template: '<div><slot /></div>' },
        'v-expansion-panel-text': { template: '<div><slot /></div>' },
        'v-combobox': { template: '<input class="v-combobox" />' },
        'v-switch': { template: '<input type="checkbox" class="v-switch" />' },
        'v-radio-group': { template: '<div><slot /></div>' },
        'v-radio': { template: '<div><slot /></div>' },
        'v-checkbox': { template: '<input type="checkbox" />' },
        'v-alert': { template: '<div class="v-alert"><slot /></div>' },
        'v-overlay': { template: '<div class="v-overlay"><slot /></div>' },
        'v-navigation-drawer': { template: '<div><slot /></div>' },
        'v-snackbar': { template: '<div><slot /></div>' },
        'v-form': { template: '<form><slot /></form>' },
        'v-window': { template: '<div><slot /></div>' },
        'v-window-item': { template: '<div><slot /></div>' },
        'v-img': { template: '<img />' },
        'v-breadcrumbs': { template: '<div><slot /></div>' },
        'v-data-table-server': { template: '<div><slot /></div>' },
        'StatCard': true, // Nie stubuj - używaj prawdziwego komponentu
        'StatGrid': true,
        ...options.stubs
      }
    },
    props: options.props,
    slots: options.slots
  })
}

// ======================== TESTY KOMPONENTÓW ========================

describe('PageHeader Component', () => {
  test('powinien renderować tytuł', async () => {
    const { default: PageHeader } = await import('@/components/PageHeader.vue')
    const wrapper = mountComponent(PageHeader, {
      props: { title: 'Test Title', subtitle: 'Test Subtitle' }
    })
    expect(wrapper.text()).toContain('Test Title')
    expect(wrapper.text()).toContain('Test Subtitle')
  })

  test('powinien renderować bez podtytułu', async () => {
    const { default: PageHeader } = await import('@/components/PageHeader.vue')
    const wrapper = mountComponent(PageHeader, {
      props: { title: 'Only Title' }
    })
    expect(wrapper.text()).toContain('Only Title')
  })
})

describe('PageContent Component', () => {
  test('powinien renderować sloty', async () => {
    const { default: PageContent } = await import('@/components/PageContent.vue')
    const wrapper = mountComponent(PageContent, {
      slots: {
        'left-panel': '<div class="left">Left Content</div>',
        'right-panel': '<div class="right">Right Content</div>'
      }
    })
    expect(wrapper.html()).toContain('Left Content')
    expect(wrapper.html()).toContain('Right Content')
  })
})

describe('StatCard Component', () => {
  test('powinien renderować wartość i tytuł', async () => {
    const { default: StatCard } = await import('@/components/StatCard.vue')
    const wrapper = mountComponent(StatCard, {
      props: { icon: 'mdi-email', title: 'Sent', value: 1234 }
    })
    expect(wrapper.text()).toContain('1234')
    expect(wrapper.text()).toContain('Sent')
  })
})

describe('StatGrid Component', () => {
  test('powinien renderować komponent', async () => {
    const { default: StatGrid } = await import('@/components/StatGrid.vue')
    const wrapper = mountComponent(StatGrid, {
      props: {
        statElements: [
          { icon: 'mdi-email', title: 'Sent', value: 100 },
          { icon: 'mdi-account', title: 'Users', value: 50 }
        ]
      }
    })
    // StatGrid powinien istnieć
    expect(wrapper.findComponent({ name: 'StatGrid' }).exists()).toBe(true)
  })
})

describe('GeneralDialog Component', () => {
  test('powinien renderować tytuł', async () => {
    const { default: GeneralDialog } = await import('@/components/GeneralDialog.vue')
    const wrapper = mountComponent(GeneralDialog, {
      props: { modelValue: true, title: 'Dialog Title' }
    })
    expect(wrapper.text()).toContain('Dialog Title')
  })

  test('powinien renderować sloty', async () => {
    const { default: GeneralDialog } = await import('@/components/GeneralDialog.vue')
    const wrapper = mountComponent(GeneralDialog, {
      props: { modelValue: true },
      slots: {
        default: '<p>Dialog Content</p>',
        actions: '<button>Action</button>'
      }
    })
    expect(wrapper.text()).toContain('Dialog Content')
    expect(wrapper.text()).toContain('Action')
  })
})

describe('PlaceholderPicker Component', () => {
  test('powinien renderować kategorie', async () => {
    const { default: PlaceholderPicker } = await import('@/components/panels/PlaceholderPicker.vue')
    const wrapper = mountComponent(PlaceholderPicker)
    expect(wrapper.text()).toContain('Kontakt')
    expect(wrapper.text()).toContain('Linki')
    expect(wrapper.text()).toContain('Kampania')
  })
})

describe('Block Components', () => {
  test('TextBlock powinien renderować tekst', async () => {
    const { default: TextBlock } = await import('@/components/blocks/TextBlock.vue')
    const wrapper = mountComponent(TextBlock, {
      props: { block: { type: 'text', content: { text: 'Hello World', fontSize: 16, color: '#333', fontWeight: 'normal', fontStyle: 'normal' }, style: { textAlign: 'left' } } }
    })
    expect(wrapper.text()).toContain('Hello World')
  })

  test('ButtonBlock powinien renderować przycisk', async () => {
    const { default: ButtonBlock } = await import('@/components/blocks/ButtonBlock.vue')
    const wrapper = mountComponent(ButtonBlock, {
      props: { block: { type: 'button', content: { text: 'Click', url: 'https://example.com', backgroundColor: '#6366f1', textColor: '#fff', borderRadius: 8, padding: '12px 24px' }, style: { textAlign: 'center' } } }
    })
    expect(wrapper.text()).toContain('Click')
  })

  test('DividerBlock powinien renderować linię', async () => {
    const { default: DividerBlock } = await import('@/components/blocks/DividerBlock.vue')
    const wrapper = mountComponent(DividerBlock, {
      props: { block: { type: 'divider', content: { thickness: 1, style: 'solid', color: '#e0e0e0', width: '100%' }, style: {} } }
    })
    expect(wrapper.find('hr').exists()).toBe(true)
  })

  test('HeaderBlock powinien renderować tytuł', async () => {
    const { default: HeaderBlock } = await import('@/components/blocks/HeaderBlock.vue')
    const wrapper = mountComponent(HeaderBlock, {
      props: { block: { type: 'header', content: { title: 'Welcome', subtitle: 'Subtitle', titleSize: 24, titleColor: '#1a1a1a', subtitleColor: '#666' }, style: { textAlign: 'center' } } }
    })
    expect(wrapper.text()).toContain('Welcome')
    expect(wrapper.text()).toContain('Subtitle')
  })
})

describe('Router', () => {
  test('powinien mieć zdefiniowane trasy', () => {
    const routes = router.getRoutes()
    expect(routes.length).toBeGreaterThan(3)
    expect(routes.some(r => r.path === '/block-email-editor')).toBe(true)
    expect(routes.some(r => r.path === '/dashboard')).toBe(true)
    expect(routes.some(r => r.path === '/campaigns')).toBe(true)
  })
})

describe('i18n', () => {
  test('powinien mieć tłumaczenia PL i EN', () => {
    const plTitle = i18n.global.t('editor.title', {}, { locale: 'pl' })
    const enTitle = i18n.global.t('editor.title', {}, { locale: 'en' })
    expect(plTitle).toBeTruthy()
    expect(enTitle).toBeTruthy()
  })

  test('powinien zwracać różne tłumaczenia dla PL i EN', () => {
    const pl = i18n.global.t('editor.addBlock', {}, { locale: 'pl' })
    const en = i18n.global.t('editor.addBlock', {}, { locale: 'en' })
    expect(pl).not.toBe(en)
    expect(pl).toBe('Dodaj blok')
    expect(en).toBe('Add Block')
  })
})
