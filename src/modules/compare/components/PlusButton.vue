<template>
  <div class="add-box">
    <div class="add-symbol" @click="showPopup = true">
      <i class="fas fa-plus"></i>
    </div>
    <div class="add-text">{{ props.typeKo }}을 선택해주세요.</div>
  </div>

  <!-- 부모는 mount/unmount만 담당 -->
  <SearchPopup
    v-if="showPopup"
    @close="showPopup = false"
    :type="props.type"
    :typeKo="props.typeKo"
  />
</template>

<script setup>
import { defineProps, ref } from 'vue';
import SearchPopup from './SearchPopup.vue';

const props = defineProps({ type: String, typeKo: String });
const showPopup = ref(false);
</script>

<style scoped>
.add-box {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 12.4rem;
  font-size: var(--spacing-md);
  cursor: pointer;
}
.add-symbol {
  display: flex;
  justify-content: center;
  align-items: center;
  background: var(--color-white);
  margin: var(--spacing-lg);
  width: 8rem;
  height: 8rem;
  font-size: var(--spacing-2xl);
  border-radius: 50%;
  color: var(--color-accent);
  transition: 0.2s ease-in-out;
}
.add-symbol:hover {
  background: var(--color-accent);
  color: var(--color-white);
}
</style>
