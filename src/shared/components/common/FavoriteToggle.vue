<template>
  <i
    :class="[isActive ? 'fas fa-star' : 'far fa-star', 'favorite-icon']"
    @click.stop="toggle"
    title="즐겨찾기"
  />
</template>

<script setup>
import { computed, ref } from 'vue';
import favorite from '@/modules/user/api/favorite';

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  productId: { type: [String, Number], required: true },
  productType: { type: String, required: true },
});

const emit = defineEmits(['update:modelValue']);

const busy = ref(false);

const isActive = computed({
  get: () => Boolean(props.modelValue),
  set: (val) => emit('update:modelValue', Boolean(val)),
});

const toggle = async () => {
  if (busy.value) return; // 클릭 중복 방지
  if (!props.productId) {
    console.error('❌ productId가 없습니다:', props.productId);
    return;
  }

  busy.value = true;

  try {
    // 현재 상태에 따라 추가 또는 삭제
    if (isActive.value) {
      // 현재 즐겨찾기 상태 → 삭제
      await favorite.deleteFavorite(props.productId, props.productType);
      console.log('✅ 즐겨찾기 제거 성공:', props.productId);
      isActive.value = false;
    } else {
      // 현재 즐겨찾기가 아닌 상태 → 추가
      await favorite.addFavorite(props.productId, props.productType);
      console.log('✅ 즐겨찾기 추가 성공:', props.productId);
      isActive.value = true;
    }
  } catch (error) {
    console.error('❌ 즐겨찾기 토글 실패:', error);
  } finally {
    busy.value = false;
  }
};
</script>

<style scoped>
.favorite-icon {
  color: #ffbb00;
  font-size: 1.875rem;
  cursor: pointer;
  transition: transform 0.25s cubic-bezier(0.33, 1, 0.68, 1);
}
.favorite-icon:hover {
  transform: scale(1.2);
}
</style>
