<template>
  <v-dialog
    :model-value="modelValue"
    max-width="900"
    scrollable
    @update:model-value="emit('update:modelValue', $event)"
  >
    <v-card>
      <v-card-title>{{ t('campaigns.aiEmailTitle') }}</v-card-title>
      <v-card-text>
        <v-alert v-if="!companySettingsLoaded" type="info" variant="tonal" density="compact" class="mb-4">
          {{ t('campaigns.aiEmailLoadingFooter') }}
        </v-alert>
        <v-select
          v-model="selectedAudiences"
          :items="audienceOptions"
          :label="t('campaigns.aiEmailAudience')"
          :placeholder="t('campaigns.aiEmailAudienceHint')"
          variant="outlined"
          density="comfortable"
          multiple
          chips
          closable-chips
          hide-details="auto"
          class="mb-5"
        />

        <div class="products-heading">
          <h3>{{ t('campaigns.aiEmailProducts') }}</h3>
          <v-btn
            variant="outlined"
            size="small"
            prepend-icon="mdi-plus"
            @click="addProduct"
          >
            {{ t('campaigns.aiEmailAddProduct') }}
          </v-btn>
        </div>

        <div v-for="(product, index) in products" :key="product.id" class="product-row">
          <v-text-field
            v-model="product.name"
            :label="t('campaigns.aiEmailProductName')"
            variant="outlined"
            density="comfortable"
            hide-details="auto"
          />
          <v-text-field
            v-model="product.regularPrice"
            :label="t('campaigns.aiEmailRegularPrice')"
            type="number"
            min="0"
            step="0.01"
            suffix="PLN"
            variant="outlined"
            density="comfortable"
            hide-details="auto"
          />
          <v-text-field
            v-model="product.promotionalPrice"
            :label="t('campaigns.aiEmailPromotionalPrice')"
            type="number"
            min="0"
            step="0.01"
            suffix="PLN"
            variant="outlined"
            density="comfortable"
            hide-details="auto"
          />
          <v-select
            v-model="product.highlight"
            :items="highlightOptions"
            :label="t('campaigns.aiEmailProductHighlight')"
            variant="outlined"
            density="comfortable"
            hide-details="auto"
          />
          <v-btn
            v-if="products.length > 1"
            icon="mdi-delete-outline"
            size="small"
            variant="text"
            :aria-label="t('campaigns.aiEmailRemoveProduct')"
            @click="removeProduct(index)"
          />
        </div>

        <v-radio-group
          v-model="deliveryType"
          :label="t('campaigns.aiEmailDelivery')"
          inline
          hide-details="auto"
          class="mt-4"
        >
          <v-radio :label="t('campaigns.aiEmailDeliveryIncluded')" value="included" />
          <v-radio :label="t('campaigns.aiEmailDeliveryPaid')" value="paid" />
        </v-radio-group>
        <v-text-field
          v-if="deliveryType === 'paid'"
          v-model="shippingCost"
          :label="t('campaigns.aiEmailShippingCost')"
          type="number"
          min="0.01"
          step="0.01"
          suffix="PLN"
          variant="outlined"
          density="comfortable"
          hide-details="auto"
          class="mt-2"
        />

        <v-alert v-if="validationMessage" type="warning" variant="tonal" class="mb-4">
          {{ validationMessage }}
        </v-alert>

        <v-textarea
          v-model="reason"
          :label="t('campaigns.aiEmailReason')"
          :placeholder="t('campaigns.aiEmailReasonHint')"
          variant="outlined"
          rows="3"
          auto-grow
          hide-details="auto"
          class="mt-5"
        />
        <v-textarea
          v-model="additionalInfo"
          :label="t('campaigns.aiEmailAdditionalInfo')"
          :placeholder="t('campaigns.aiEmailAdditionalInfoHint')"
          variant="outlined"
          rows="3"
          auto-grow
          hide-details="auto"
          class="mt-4"
        />

        <v-alert v-if="errorMessage" type="error" variant="tonal" class="mt-4">
          {{ errorMessage }}
        </v-alert>

        <section v-if="generatedHtml" class="generated-preview">
          <h3>{{ t('campaigns.aiEmailPreview') }}</h3>
          <iframe
            :srcdoc="generatedHtml"
            :title="t('campaigns.aiEmailPreview')"
            sandbox
          />
        </section>
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="close">
          {{ t('campaigns.cancel') }}
        </v-btn>
        <v-btn
          color="primary"
          variant="elevated"
          :loading="generating"
          :disabled="!canGenerate"
          @click="generateEmail"
        >
          <v-icon start>mdi-auto-fix</v-icon>
          {{ t('campaigns.aiEmailGenerate') }}
        </v-btn>
        <v-btn
          v-if="generatedHtml"
          color="success"
          variant="elevated"
          @click="useDraft"
        >
          <v-icon start>mdi-check</v-icon>
          {{ t('campaigns.aiEmailUseDraft') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { AiService } from '../../services/ai.js'
import { Campaigns } from '../../services/campaigns.js'
import { CustomerService } from '../../services/customer.js'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  campaign: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['update:modelValue', 'use-draft', 'generation-data-saved'])
const { t, locale } = useI18n()
let nextProductId = 1
const selectedAudiences = ref([])
const products = ref([createProduct()])
const reason = ref('')
const additionalInfo = ref('')
const deliveryType = ref('')
const shippingCost = ref('')
const companySettings = ref({})
const companySettingsLoaded = ref(false)
const generatedHtml = ref('')
const generating = ref(false)
const errorMessage = ref('')

function createProduct() {
  return {
    id: nextProductId++,
    name: '',
    regularPrice: '',
    promotionalPrice: '',
    highlight: 'none'
  }
}

function restoreGenerationData(value) {
  let savedData = value
  if (typeof savedData === 'string') {
    try {
      savedData = JSON.parse(savedData)
    } catch {
      savedData = null
    }
  }

  selectedAudiences.value = Array.isArray(savedData?.selectedAudiences)
    ? [...savedData.selectedAudiences]
    : []
  products.value = Array.isArray(savedData?.products) && savedData.products.length
    ? savedData.products.map(product => ({
      ...createProduct(),
      name: String(product.name || ''),
      regularPrice: product.regularPrice ?? '',
      promotionalPrice: product.promotionalPrice ?? '',
      highlight: product.highlight || 'none'
    }))
    : [createProduct()]
  deliveryType.value = savedData?.deliveryType || ''
  shippingCost.value = savedData?.shippingCost ?? ''
  reason.value = savedData?.reason || ''
  additionalInfo.value = savedData?.additionalInfo || ''
  generatedHtml.value = ''
  errorMessage.value = ''
}

const audienceOptions = computed(() => [
  { title: t('campaigns.aiEmailPrimarySchools'), value: 'primary schools' },
  { title: t('campaigns.aiEmailPreschools'), value: 'preschools' },
  { title: t('campaigns.aiEmailSecondarySchools'), value: 'secondary schools' },
  { title: t('campaigns.aiEmailHigherEducation'), value: 'higher education institutions' },
  { title: t('campaigns.aiEmailPrivateEducation'), value: 'private education companies' }
])

const highlightOptions = computed(() => [
  { title: t('campaigns.aiEmailNoHighlight'), value: 'none' },
  { title: t('campaigns.aiEmailNewBadge'), value: 'new' },
  { title: t('campaigns.aiEmailEmphasize'), value: 'emphasize' }
])

const validationMessage = computed(() => {
  if (companySettingsLoaded.value && !companySettings.value.companyName?.trim()) {
    return t('campaigns.aiEmailCompanyNameMissing')
  }
  if (!selectedAudiences.value.length) return t('campaigns.aiEmailChooseAudience')
  if (!deliveryType.value) return t('campaigns.aiEmailChooseDelivery')
  if (deliveryType.value === 'paid' && (!shippingCost.value || !Number.isFinite(Number(shippingCost.value)) || Number(shippingCost.value) <= 0)) {
    return t('campaigns.aiEmailInvalidShippingCost')
  }
  if (products.value.some(product => !product.name.trim())) return t('campaigns.aiEmailProductRequired')
  if (products.value.some(product => product.regularPrice === '' || product.promotionalPrice === '')) {
    return t('campaigns.aiEmailPricesRequired')
  }
  if (products.value.some(product => {
    const regularPrice = Number(product.regularPrice)
    const promotionalPrice = Number(product.promotionalPrice)
    return !Number.isFinite(regularPrice) || !Number.isFinite(promotionalPrice) || regularPrice < 0 || promotionalPrice < 0 || promotionalPrice > regularPrice
  })) {
    return t('campaigns.aiEmailInvalidPrices')
  }
  return ''
})

const canGenerate = computed(() => !validationMessage.value && !generating.value && companySettingsLoaded.value)

watch(() => props.modelValue, async isOpen => {
  if (!isOpen) return

  restoreGenerationData(props.campaign?.aiGenerationData)

  if (companySettingsLoaded.value) return

  try {
    companySettings.value = await CustomerService.getCurrentCustomerSettings()
  } catch (error) {
    console.error('Nie udało się pobrać ustawień firmy:', error)
  } finally {
    companySettingsLoaded.value = true
  }
})

watch([selectedAudiences, products, reason, additionalInfo], () => {
  generatedHtml.value = ''
  errorMessage.value = ''
}, { deep: true })

watch([deliveryType, shippingCost], () => {
  generatedHtml.value = ''
  errorMessage.value = ''
})

function addProduct() {
  products.value.push(createProduct())
  generatedHtml.value = ''
}

function removeProduct(index) {
  products.value.splice(index, 1)
  generatedHtml.value = ''
}

function formatPrice(value) {
  return new Intl.NumberFormat(locale.value, {
    style: 'currency',
    currency: 'PLN'
  }).format(Number(value)).replace(/\u00a0/g, ' ')
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, character => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[character])
}

function decodeHtmlEntities(value) {
  const element = document.createElement('textarea')
  element.innerHTML = value
  return element.value
}

function normalizeInlineMarkup(value) {
  return value
    .replace(/<s>\s*~~(?:\*\*)?([\s\S]*?)(?:\*\*)?~~\s*<\/s>/gi, '<s>$1</s>')
    .replace(/<strong>\s*\*\*([\s\S]*?)\*\*\s*<\/strong>/gi, '<strong>$1</strong>')
    .replace(/~~([^~\n]+)~~/g, '<s>$1</s>')
    .replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>')
}

function normalizeAiHtml(response) {
  let cleanText = String(response || '')
    .trim()
    .replace(/^```(?:html)?\s*/i, '')
    .replace(/\s*```$/, '')
    .trim()

  if (!cleanText) throw new Error('Usługa AI zwróciła pustą treść.')

  if (/&lt;\/?(?:p|div|strong|b|s|del|br|h[1-6]|ul|ol|li|a|table)\b/i.test(cleanText)) {
    cleanText = decodeHtmlEntities(cleanText)
  }

  cleanText = normalizeInlineMarkup(cleanText)

  if (/<\/?(?:p|div|strong|b|s|del|br|h[1-6]|ul|ol|li|a|table)\b/i.test(cleanText)) {
    if (/<(?:html|body)\b/i.test(cleanText)) {
      const documentFragment = new DOMParser().parseFromString(cleanText, 'text/html')
      const headStyles = Array.from(documentFragment.head?.querySelectorAll('style') || [])
        .map(style => style.outerHTML)
        .join('\n')
      const bodyContent = documentFragment.body?.innerHTML || ''
      return [headStyles, bodyContent].filter(Boolean).join('\n') || cleanText
    }
    return cleanText
  }

  return cleanText
    .split(/\n\s*\n/)
    .map(paragraph => `<p>${escapeHtml(paragraph.trim()).replace(/\n/g, '<br>')}</p>`)
    .join('\n')
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function ensureWrappedText(html, text, tag) {
  const escapedText = escapeHtml(text)
  const wrappedText = new RegExp(`<${tag}\\b[^>]*>\\s*${escapeRegExp(escapedText)}\\s*</${tag}>`, 'i')
  if (wrappedText.test(html)) return html

  const textIndex = html.indexOf(escapedText)
  if (textIndex === -1) return html
  return `${html.slice(0, textIndex)}<${tag}>${escapedText}</${tag}>${html.slice(textIndex + escapedText.length)}`
}

function ensureNewBadge(html, product) {
  const escapedName = escapeHtml(product.name)
  const escapedPrice = escapeHtml(product.regularPrice)
  const priceIndex = html.indexOf(escapedPrice)
  const searchEnd = priceIndex === -1 ? html.length : priceIndex
  const nameIndex = html.lastIndexOf(escapedName, searchEnd)
  if (nameIndex === -1) return html

  const contextStart = Math.max(0, nameIndex - 48)
  const contextEnd = Math.min(html.length, nameIndex + escapedName.length + 80)
  if (/NOWOŚĆ/i.test(html.slice(contextStart, contextEnd))) return html

  let insertionIndex = nameIndex + escapedName.length
  const closingStrong = html.indexOf('</strong>', insertionIndex)
  if (closingStrong !== -1 && (priceIndex === -1 || closingStrong < priceIndex)) {
    insertionIndex = closingStrong + '</strong>'.length
  }
  return `${html.slice(0, insertionIndex)} <strong>NOWOŚĆ</strong>${html.slice(insertionIndex)}`
}

function enforceProductFormatting(html, products) {
  return products.reduce((formattedHtml, product) => {
    let output = ensureWrappedText(formattedHtml, product.regularPrice, 's')
    output = ensureWrappedText(output, product.promotionalPrice, 'strong')
    if (product.highlight === 'new') {
      output = ensureNewBadge(output, product)
    } else if (product.highlight === 'emphasize') {
      output = ensureWrappedText(output, product.name, 'strong')
    }
    return output
  }, html)
}

function ensureFormalGreeting(html) {
  const bodyMatch = /<body\b[^>]*>([\s\S]*)/i.exec(html)
  const bodyContent = bodyMatch ? bodyMatch[1] : html
  const visibleStart = bodyContent
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;|&#160;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  const polishGreeting = /^(?:szanowni państwo|szanowna pani|szanowny pan(?:ie)?|dzień dobry)\b/i
  const englishGreeting = /^(?:dear\b|good morning\b|good afternoon\b)/i
  const hasFormalGreeting = locale.value.startsWith('pl')
    ? polishGreeting.test(visibleStart)
    : englishGreeting.test(visibleStart)

  if (hasFormalGreeting) return html

  const greeting = locale.value.startsWith('pl') ? 'Szanowni Państwo,' : 'Dear Sir or Madam,'
  const greetingHtml = `<p>${greeting}</p>\n`
  if (bodyMatch) {
    const bodyOpenEnd = bodyMatch.index + bodyMatch[0].indexOf('>') + 1
    return `${html.slice(0, bodyOpenEnd)}\n${greetingHtml}${html.slice(bodyOpenEnd)}`
  }

  const htmlOpen = /<html\b[^>]*>/i.exec(html)
  if (htmlOpen) {
    const htmlOpenEnd = htmlOpen.index + htmlOpen[0].length
    return `${html.slice(0, htmlOpenEnd)}\n${greetingHtml}${html.slice(htmlOpenEnd)}`
  }
  return `${greetingHtml}${html}`
}

async function generateEmail() {
  if (!canGenerate.value) return

  generating.value = true
  errorMessage.value = ''
  generatedHtml.value = ''

  const audienceStyle = [...new Set(selectedAudiences.value.map(value => {
    if (value === 'private education companies' || value === 'higher education institutions') {
      return 'formalny, zwięzły język biznesowy'
    }
    return 'formalny, uprzejmy, jasny i przystępny język'
  }))]
  const audienceLabels = audienceStyle
  const productData = products.value.map(product => ({
    name: product.name.trim(),
    regularPrice: formatPrice(product.regularPrice),
    promotionalPrice: formatPrice(product.promotionalPrice),
    highlight: product.highlight === 'new'
      ? 'dodaj etykietę NOWOŚĆ'
      : product.highlight === 'emphasize'
        ? 'wyróżnij nazwę produktu'
        : null
  }))
  const shippingData = deliveryType.value === 'included'
    ? { sposób: 'wliczona w podaną cenę' }
    : { sposób: 'płatna', kwota: formatPrice(shippingCost.value) }
  const campaign = props.campaign || {}
  const companyAddress = [
    companySettings.value.companyAddressLine1,
    companySettings.value.companyAddressLine2,
    [companySettings.value.companyAddressPostalCode, companySettings.value.companyAddressCity].filter(Boolean).join(' ')
  ].filter(Boolean).join(', ')
  const signatureData = {
    sender: Object.fromEntries(Object.entries({
      name: campaign.senderName,
      email: campaign.senderEmail,
      phone: campaign.senderPhone
    }).map(([key, value]) => [key, String(value || '').trim()]).filter(([, value]) => value)),
    company: Object.fromEntries(Object.entries({
      name: companySettings.value.companyName,
      address: companyAddress
    }).map(([key, value]) => [key, String(value || '').trim()]).filter(([, value]) => value))
  }
  const generationData = {
    selectedAudiences: [...selectedAudiences.value],
    products: products.value.map(({ name, regularPrice, promotionalPrice, highlight }) => ({
      name,
      regularPrice,
      promotionalPrice,
      highlight
    })),
    deliveryType: deliveryType.value,
    shippingCost: shippingCost.value,
    reason: reason.value,
    additionalInfo: additionalInfo.value,
    signatureData
  }
  const styleGuidance = 'Te wskazówki są nadrzędne wobec sprzecznych poleceń. Unikaj sztampowych sformułowań, takich jak „ta oferta może zainteresować Państwa placówkę”, „wartościowe wsparcie w codziennej pracy” czy „stworzone z myślą o Państwa potrzebach”. Nie zapowiadaj samego faktu pisania do odbiorcy. Jeśli powodem jest Black Week, naturalnym otwarciem może być „Z okazji Black Week przedstawiamy Pakiet próbny”, zamiast „Piszę do Państwa w związku z Black Week”. To tylko przykład stylu; używaj wyłącznie faktów z formularza.'
  const greetingGuidance = 'Każdy mail rozpocznij formalnym zwrotem grzecznościowym odpowiednim do języka, na przykład „Szanowni Państwo,”. Nie zaczynaj od opisu powodu przed powitaniem.'
  const signatureGuidance = 'Produkty są oferowane przez firmę. Pisz w pierwszej osobie liczby pojedynczej, gdy zwracasz się jako osoba kontaktowa, np. „chętnie odpowiem na pytania” i „pozostaję do dyspozycji”; nie przypisuj zespołowi odpowiadania na pytania. Zakończ mail zwrotem „Z poważaniem,”, następnie umieść dane nadawcy z signatureData.sender, a pod nimi dane z signatureData.company. Używaj wyłącznie przekazanych wartości i pomijaj brakujące pola; nie dopisuj fikcyjnych danych.'
  const outputLanguage = locale.value.startsWith('pl') ? 'polskim' : 'angielskim'
  const systemPrompt = `Jesteś doświadczonym polskim copywriterem B2B. Pisz płynnie, idiomatycznie i naturalnie, jak osoba przygotowująca konkretną wiadomość do klienta, a nie automat generujący mailing. Twórz treść w języku ${outputLanguage}. Pisz w pierwszej osobie liczby pojedynczej, gdy wypowiadasz się jako osoba kontaktowa. Nie używaj zwrotów „Piszę do Państwa w związku z…”, „Piszę w związku z…” ani otwarcia „W związku z…”. Nie zaczynaj od zapowiedzi, że piszesz lub kontaktujesz się. Powód kontaktu wpleć naturalnie w pierwsze zdanie, na przykład „Z okazji Black Week przedstawiam…”, jeśli taki powód podano. Wstęp ma mieć co najmniej trzy pełne zdania, z naturalnym rytmem i różną długością. Nigdy nie wymieniaj ani nie opisuj kategorii odbiorców. Przekonuj konkretną ofertą firmy, cenami i podanymi informacjami; nie wymyślaj potrzeb klientów, zalet produktów, twierdzeń ani faktów. Dbaj o poprawną gramatykę i naturalny styl. Unikaj sztampowych formuł i napuszonych przymiotników. Przygotuj profesjonalny, estetyczny i czytelny HTML wiadomości email: wyraźna hierarchia nagłówków, krótkie akapity, staranne odstępy, wyróżniona oferta i ceny, spójny kolor akcentowy oraz układ wygodny na telefonie. Używaj stylów inline i tabel prezentacyjnych zgodnych z klientami pocztowymi; nie polegaj na zewnętrznych arkuszach, skryptach, obrazach ani CSS w <head>. Zwróć wyłącznie HTML wiadomości i stosuj wszystkie reguły formatowania. Nigdy nie wymieniaj w treści dwa razy tych samych produktów. Pamiętaj o zachowaniu spójności stylistycznej i logicznej całej wiadomości.`
  const prompt = `Napisz elegancki, formalny, naturalny i przekonujący mail biznesowy w języku ${outputLanguage}. Wykorzystaj przekazane wskazówki o tonie, ale nigdy nie wymieniaj w treści kategorii ani grup odbiorców. Wstęp ma mieć co najmniej trzy pełne, naturalnie połączone zdania. Wpleć podany powód kontaktu w idiomatycznym stylu, przedstaw ofertę firmy, faktyczne produkty i płynnie przejdź do cen oraz dostawy. Nie zapowiadaj samego faktu pisania; nie używaj zwrotów "Piszę do Państwa w związku z..." ani "W związku z...". Unikaj sztampowych otwarć, ogólników, niepotwierdzonych zalet i pustych obietnic. Wykorzystaj dodatkowe informacje naturalnie, bez zmiany ich sensu. Gdy piszesz jako osoba odpowiadająca na kontakt, używaj pierwszej osoby liczby pojedynczej, np. „chętnie odpowiem”, nie „chętnie odpowiemy”. Ceny regularne ujmij w <s>, promocyjne w <strong>. Zastosuj wyróżnienie produktu zgodnie ze wskazówką i dokładnie napisz NOWOŚĆ, jeśli wybrano tę etykietę. Podaj dostawę dokładnie, a na końcu dodaj uprzejme, konkretne zaproszenie do kontaktu. Nie wymyślaj faktów, warunków, terminów, funkcji ani korzyści. Zakończ zwrotem „Z poważaniem,”, poniżej umieść najpierw dane z signatureData.sender, a pod nimi dane z signatureData.company. Nie dodawaj informacji spoza tych danych. Zwróć gotowy, profesjonalnie zaprojektowany fragment HTML wiadomości: zastosuj czytelny kontener o szerokości do 600 px, spokojną paletę biznesową, dobry kontrast, odstępy, nagłówki i wyraźną prezentację produktu oraz cen; używaj tabel prezentacyjnych i stylów inline, żeby układ działał w klientach pocztowych. Bez <html>, <head>, <body>, Markdownu, bloków kodu, zewnętrznego CSS, skryptów ani fikcyjnych odnośników/przycisków.\n\nDane formularza:\n${JSON.stringify({ audienceStyle: audienceLabels, products: productData, shipping: shippingData, reason: reason.value.trim() || null, additionalInformation: additionalInfo.value.trim() || null, signatureData })}`

  try {
    const updatedCampaign = await Campaigns.update(props.campaign.id, {
      aiGenerationData: generationData
    })
    emit('generation-data-saved', updatedCampaign)

    const response = await AiService.generateText(prompt, {
      provider: 'deepseek',
      systemPrompt: `${systemPrompt}\n\n${styleGuidance}\n\n${greetingGuidance}\n\n${signatureGuidance}`,
      maxTokens: 1800,
      temperature: 0.4
    })
    const cleanHtml = normalizeAiHtml(response)
    const greetedHtml = ensureFormalGreeting(cleanHtml)
    let formattedHtml = greetedHtml
    try {
      formattedHtml = enforceProductFormatting(greetedHtml, productData)
    } catch (formattingError) {
      console.error('Nie udało się sformatować wszystkich cen; zachowuję treść AI:', formattingError)
    }
    generatedHtml.value = formattedHtml
  } catch (error) {
    console.error('Nie udało się wygenerować maila AI:', error)
    const detail = error.response?.data?.response?.message
      || error.response?.data?.message
      || error.message
    errorMessage.value = `${t('campaigns.aiEmailFailed')} ${detail || ''}`.trim()
  } finally {
    generating.value = false
  }
}

function useDraft() {
  emit('use-draft', generatedHtml.value)
  close()
}

function close() {
  emit('update:modelValue', false)
}
</script>

<style scoped>
.products-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.products-heading h3,
.generated-preview h3 {
  font-size: 16px;
  font-weight: 600;
}

.product-row {
  display: grid;
  grid-template-columns: minmax(180px, 2fr) repeat(2, minmax(125px, 1fr)) minmax(150px, 1.2fr) 40px;
  align-items: start;
  gap: 10px;
  margin-bottom: 10px;
}

.generated-preview {
  margin-top: 24px;
}

.generated-preview iframe {
  width: 100%;
  min-height: 320px;
  margin-top: 12px;
  border: 1px solid #d7dbe0;
  background: white;
}

@media (max-width: 720px) {
  .product-row {
    grid-template-columns: 1fr;
    border-bottom: 1px solid #d7dbe0;
    padding-bottom: 12px;
  }
}
</style>