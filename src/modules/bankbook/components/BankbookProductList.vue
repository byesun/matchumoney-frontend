<template>
  <transition-group name="fade-in" tag="div" class="product-list">
    <BankbookProductCard
      v-for="(saving, index) in savings"
      :key="saving.id"
      :saving="saving"
      :index="index"
    />
  </transition-group>
</template>

<script setup>
import { defineProps } from 'vue';
import BankbookProductCard from './BankbookProductCard.vue';

const props = defineProps({
  selectedId: String,
  savings: Array,
  animationKey: Number, // 💡 외부에서 전달받음
});
</script>

<style scoped>
.product-list {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-lg);
}

/* ===== 페이드 인 애니메이션 ===== */
.fade-in-enter-active,
.fade-in-leave-active {
  transition: all 0.4s ease;
}
.fade-in-enter-from,
.fade-in-leave-to {
  opacity: 0;
  transform: translateY(+12px);
}
</style>
