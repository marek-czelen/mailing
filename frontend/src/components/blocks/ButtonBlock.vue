<template>
  <!-- 
    KOMPONENT BLOKU PRZYCISKU
    
    Renderuje przycisk z dynamicznymi stylami jako element <a>.
    W trybie edytora klik jest blokowany przez @click.prevent.
    
    WŁAŚCIWOŚCI BLOKU:
    - block.content.text - tekst wyświetlany na przycisku  
    - block.content.url - docelowy adres URL (href)
    - block.content.backgroundColor - kolor tła przycisku
    - block.content.textColor - kolor tekstu na przycisku
    - block.content.padding - odstępy wewnętrzne (CSS padding)
    - block.content.borderRadius - zaokrąglenie rogów w pikselach
    
    UWAGI:
    - @click.prevent blokuje kliknięcia w trybie edytora
    - Wszystkie style inline dla zachowania w export HTML
    - Element <a> zapewnia poprawny HTML dla email clientów
  -->
  <div class="button-block">
    <!-- 
      PRZYCISK JAKO LINK
      inline-block umożliwia padding i wymiary
      @click.prevent zapobiega nawigacji w edytorze
    -->
    <a 
      :href="block.content.url"
      :style="{
        display: 'inline-block',
        backgroundColor: block.content.backgroundColor,
        color: block.content.textColor,
        padding: block.content.padding,
        borderRadius: block.content.borderRadius + 'px',
        textDecoration: 'none',
        fontWeight: 'bold',
        cursor: 'pointer',
        border: 'none'
      }"
      @click.prevent
    >
      {{ block.content.text }}
    </a>
  </div>
</template>

<script>
export default {
  name: 'ButtonBlock',
  props: {
    // Obiekt bloku z konfiguracją przycisku i zawartością
    block: {
      type: Object,
      required: true
    }
  }
};
</script>

<style scoped>
.button-block {
  width: 100%;
}
</style>