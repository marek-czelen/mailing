<template>
  <!-- 
    KOMPONENT BLOKU TEKSTOWEGO
    
    Renderuje blok tekstowy z dynamicznymi stylami CSS.
    Wszystkie style są aplikowane jako inline styles aby:
    1. Nadpisać style Vuetify (!important)
    2. Zachować style w eksportowanym HTML
    3. Zapewnić WYSIWYG (What You See Is What You Get)
    
    WŁAŚCIWOŚCI BLOKU:
    - block.content.text - treść tekstu
    - block.content.fontSize - rozmiar w pikselach
    - block.content.color - kolor tekstu (hex)
    - block.content.fontWeight - grubość (normal, bold, 300-900)
    - block.content.fontStyle - styl (normal, italic)
    - block.content.fontFamily - rodzina czcionki z fallback
    - block.style.textAlign - wyrównanie (left, center, right)
  -->
  <div class="text-block">
    <!-- 
      PARAGRAF Z DYNAMICZNYMI STYLAMI
      Każdy styl ma !important aby nadpisać globalne style Vuetify
    -->
    <p 
      :style="{
        fontSize: block.content.fontSize + 'px',
        color: block.content.color,
        fontWeight: block.content.fontWeight + ' !important',
        fontStyle: block.content.fontStyle + ' !important',
        fontFamily: (block.content.fontFamily || 'Arial, sans-serif') + ' !important',
        textAlign: block.style.textAlign,
        margin: 0,
        lineHeight: '1.5'
      }"
    >
      {{ block.content.text }}
    </p>
  </div>
</template>

<script>
export default {
  name: 'TextBlock',
  props: {
    // Obiekt bloku z całą konfiguracją i zawartością
    block: {
      type: Object,
      required: true
    }
  }
};
</script>

<style scoped>
.text-block {
  width: 100%;
}

.text-block p {
  font-family: Arial, sans-serif !important;
}
</style>