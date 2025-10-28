<template>
  <!-- 
    KOMPONENT BLOKU ODSTĘPU (SPACER)
    
    Tworzy pionowy odstęp między innymi blokami. Składa się z dwóch elementów:
    1. spacer-line - rzeczywisty odstęp o zadanej wysokości
    2. spacer-indicator - wizualny wskaźnik wysokości (tylko w edytorze)
    
    WŁAŚCIWOŚCI BLOKU:
    - block.content.height - wysokość odstępu w pikselach
    - block.content.backgroundColor - kolor tła (opcjonalny, domyślnie transparent)
    - block.content.borderRadius - zaokrąglenie rogów (opcjonalne)
    
    FUNKCJONALNOŚĆ EDYTORA:
    - Minimum 30px wysokości dla łatwego klikania/edycji
    - Wizualny wskaźnik pokazuje dokładną wysokość
    - Hover efekt dla lepszej interaktywności
    - Ramka z kropkami dla wizualnego odróżnienia
  -->
  <div class="spacer-block">
    <!-- 
      RZECZYWISTA LINIA ODSTĘPU
      To jest element, który tworzy faktyczny odstęp w emailu
    -->
    <div 
      class="spacer-line"
      :style="{
        height: block.content.height + 'px',
        backgroundColor: block.content.backgroundColor || 'transparent',
        borderRadius: block.content.borderRadius ? block.content.borderRadius + 'px' : '0'
      }"
    ></div>
    
    <!-- 
      WSKAŹNIK WYSOKOŚCI
      Pokazuje dokładną wysokość w pikselach (tylko dla edytora)
      pointer-events: none - nie blokuje klików na spacer
    -->
    <div class="spacer-indicator">
      {{ block.content.height }}px
    </div>
  </div>
</template>

<script>
export default {
  name: 'SpacerBlock',
  props: {
    // Obiekt bloku z konfiguracją wysokości i stylów
    block: {
      type: Object,
      required: true
    }
  }
};
</script>

<style scoped>
.spacer-block {
  width: 100%;
  position: relative;
  min-height: 30px;
  display: flex;
  align-items: center;
  cursor: pointer;
}

.spacer-line {
  width: 100%;
  border: 1px dashed #ddd;
  transition: all 0.2s ease;
  box-sizing: border-box;
}

.spacer-block:hover .spacer-line {
  border-color: #2196F3;
  background-color: rgba(33, 150, 243, 0.05) !important;
}

.spacer-indicator {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 11px;
  color: #666;
  background: rgba(255, 255, 255, 0.9);
  padding: 2px 6px;
  border-radius: 3px;
  pointer-events: none;
  font-weight: 500;
  z-index: 1;
}
</style>