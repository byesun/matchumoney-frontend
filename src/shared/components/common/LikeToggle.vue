<!-- src/components/common/LikeToggle.vue -->
<template>
  <span
    class="reaction-button"
    :class="{ active: internalLiked }"
    role="button"
    tabindex="0"
    @click="handleClick"
    @keydown.enter.prevent="handleClick"
    @keydown.space.prevent="handleClick"
  >
    {{ internalLiked ? '❤️' : '🤍' }} {{ likeCount }}
  </span>
</template>

<script setup>
import { ref, watch } from 'vue';
import likeAPI from '@/modules/user/api/like';
import { useRouter } from 'vue-router';
import { useCustomModal } from '@/shared/composables/useCustomModal';

const props = defineProps({
  productId: { type: [String, Number], required: true },
  productType: { type: String, required: true }, // 예: 'card-products'
  initialLiked: { type: Boolean, required: true },
  initialCount: { type: Number, default: 0 },
});

const emit = defineEmits(['update']);

const router = useRouter();
const userId = ref(sessionStorage.getItem('userId'));
const { showConfirm } = useCustomModal();

const internalLiked = ref(props.initialLiked);
const likeCount = ref(props.initialCount);

const handleClick = async () => {
  if (!userId.value) {
    const result = await showConfirm(
      '로그인이 필요합니다. 로그인 페이지로 이동할까요?',
      '로그인 필요',
      false,
      '이동'
    );
    if (result) {
      router.push('/login');
    }
    return;
  }

  try {
    const data = await likeAPI.toggleLike(
      props.productId,
      props.productType,
      internalLiked.value
    );
    internalLiked.value = data.liked;
    likeCount.value = data.likeCount;
    emit('update', { liked: data.liked, count: data.likeCount }); // 부모에게도 알림
  } catch (error) {
    console.error('좋아요 처리 중 오류:', error);
  }
};
</script>

<style scoped>
.reaction-button {
  background-color: #f1f1f1;
  border: none;
  border-radius: 20px;
  padding: 6px 12px; /* match compare button reduced size */
  font-size: 12px; /* match compare button reduced size */
  font-weight: 600;
  color: #333;
  cursor: pointer;
  transition: background-color 0.2s ease, transform 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  outline: none;
}
.reaction-button:hover {
  background-color: #e0e0e0;
  transform: translateY(-1px);
}
.reaction-button:focus-visible {
  box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.08);
}
.reaction-button.active {
  background-color: #ffe6e6;
  color: red;
}

@media (max-width: 1024px) {
  .compare-button {
    font-size: var(--font-size-sm);
    padding: 6px 10px; /* responsive padding like like button */
    margin: 0px -11px 0px 0px;
  }
}

@media (max-width: 430px) {
  .recommendation-item {
    min-height: 140px; /* 최소 높이 설정 */
    align-items: center; /* 카드 내 요소들 세로 가운데 정렬 */
  }
  .product-card-horizontal {
    gap: 8px;
    align-items: center; /* stretch를 center로 변경 */
    height: 100%;
  }

  .bank-logo-container {
    width: 8rem;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.3rem;
  }

  .bank-logo-container img {
    width: 6rem;
    height: 6rem;
  }

  .reaction-button {
    font-size: 10px;
    padding: 4px 8px;
  }

  .likes_compare {
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.2rem;
    font-size: 0.7rem;
    width: 100%;
  }
  .likes_compare :deep(.compare-button) {
    text-align: center;
    justify-content: center;
    width: auto;
    min-width: fit-content;
    display: flex;
    align-items: center;
    padding-left: 8px; /* 좌측 패딩 추가 */
    padding-right: 8px; /* 우측 패딩 추가 */
    margin: 0 auto; /* 좌우 마진 자동으로 중앙 정렬 */
  }

  .product-name-block {
    padding: 0 8px;
  }

  .kb-only-text,
  .no-results-text {
    font-size: var(--font-size-base);
  }

  .rate-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 0rem;
  }

  .rate-values {
    gap: 0.2rem;
  }
}
</style>
