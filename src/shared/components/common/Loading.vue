<template>
  <div v-if="shouldShow" class="loading-overlay">
    <img src="@/assets/loading/loading_character.gif" style="width: 8rem" />
  </div>
</template>

<script setup>
import { defineProps, ref, watch } from 'vue';

const props = defineProps({
  loading: Boolean,
});

const shouldShow = ref(false);
let timeoutId = null;

watch(
  () => props.loading,
  (newVal) => {
    clearTimeout(timeoutId);
    if (newVal) {
      timeoutId = setTimeout(() => {
        shouldShow.value = true;
      }, 150); // 100ms 지연
    } else {
      shouldShow.value = false;
    }
  }
);
</script>

<style scoped>
.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: var(--color-modal-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--spacing-md);
  z-index: 1000;
  opacity: 1;
  transition: opacity 0.3s ease;
}
</style>
