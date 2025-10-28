<template>
  <!-- 
    KOMPONENT BLOKU OBRAZKA
    
    Renderuje obrazek z responsywnym zachowaniem i konfigurowalnymi wymiarami.
    Obsługuje zaokrąglone rogi i automatyczne dopasowanie rozmiaru.
    
    WŁAŚCIWOŚCI BLOKU:
    - block.content.src - URL źródła obrazka
    - block.content.alt - tekst alternatywny (dostępność)
    - block.content.width - szerokość w pikselach
    - block.content.height - wysokość w pikselach
    - block.content.borderRadius - zaokrąglenie rogów (opcjonalne)
    
    RESPONSYWNOŚĆ:
    - maxWidth: 100% zapewnia responsywność
    - objectFit: cover zachowuje proporcje przy przycinaniu
  -->
  <div class="image-block">
    <!-- 
      OBRAZEK Z DYNAMICZNYMI STYLAMI
      objectFit: cover - przycina obrazek zachowując proporcje
      maxWidth: 100% - responsywność na mniejszych ekranach
    -->
    <img 
      :src="block.content.src"
      :alt="block.content.alt"
      :style="{
        width: block.content.width + 'px',
        height: block.content.height + 'px',
        maxWidth: '100%',
        borderRadius: block.content.borderRadius ? block.content.borderRadius + 'px' : '0',
        objectFit: 'cover'
      }"
    />
  </div>
</template>

<script>
export default {
  name: 'ImageBlock',
  props: {
    // Obiekt bloku z konfiguracją obrazka i źródłem
    block: {
      type: Object,
      required: true
    }
  }
};
</script>

<style scoped>
.image-block {
  width: 100%;
}
</style>