<template>
  <div class="card-slider">
    <div class="slider-container">
      <div
        class="slider-wrapper"
        :style="{ transform: `translateX(-${currentIndex * 100}%)` }"
        @mousedown="handleMouseDown"
        @touchstart="handleTouchStart"
        @touchmove="handleTouchMove"
        @touchend="handleTouchEnd"
        @mousemove="handleMouseMove"
        @mouseup="handleMouseUp"
        @mouseleave="handleMouseUp">
        <!-- 등록된 카드들 -->
        <div v-for="(card, index) in cards" :key="card.holdingId" class="slide-item">
          <CardSlide
            :card="card"
            :hasTransactions="hasTransactionsForCard(card)"
            @cardClick="handleCardClick"
            @registerTransactions="handleRegisterTransactions"
            @updateTransactions="handleUpdateTransactions" />
        </div>

        <!-- 마지막 슬라이드: 카드 등록/업데이트 -->
        <div class="slide-item">
          <ActionCardSlide
            :has-cards="cards.length > 0"
            :show-kb-recommendation="true"
            @register="$emit('register')"
            @update="$emit('update')" />
        </div>
      </div>
    </div>

    <!-- 슬라이더 컨트롤 -->
    <div class="slider-controls">
      <div class="slider-indicators">
        <span
          v-for="(_, index) in totalSlides"
          :key="index"
          class="indicator"
          :class="{ active: index === currentIndex }"
          @click="goToSlide(index)"></span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import CardSlide from './CardSlide.vue';
import ActionCardSlide from './ActionCardSlide.vue';

const props = defineProps({
  cards: {
    type: Array,
    default: () => [],
  },
  cardTransactions: {
    type: Object,
    default: () => ({}),
  },
});

const emit = defineEmits([
  'register',
  'update',
  'cardChange',
  'cardClick',
  'registerTransactions',
  'updateTransactions',
]);

const currentIndex = ref(0);

// 드래그/스와이프 관련 상태
const isDragging = ref(false);
const startX = ref(0);
const startY = ref(0);
const currentX = ref(0);
const initialTransform = ref(0);

// 총 슬라이드 수 (카드 수 + 액션 카드 1개)
const totalSlides = computed(() => props.cards.length + 1);

// 현재 카드 정보
const currentCard = computed(() => {
  if (currentIndex.value < props.cards.length) {
    return props.cards[currentIndex.value];
  }
  return null;
});

const nextSlide = () => {
  if (currentIndex.value < totalSlides.value - 1) {
    currentIndex.value++;
    emitCardChange();
  }
};

const prevSlide = () => {
  if (currentIndex.value > 0) {
    currentIndex.value--;
    emitCardChange();
  }
};

const goToSlide = (index) => {
  currentIndex.value = index;
  emitCardChange();
};

// 카드 변경 이벤트 전송
const emitCardChange = () => {
  emit('cardChange', currentCard.value);
};

// 드래그/스와이프 핸들러들
const handleMouseDown = (event) => {
  if (event.button !== 0) return; // 왼쪽 마우스 버튼만
  
  // 버튼이나 상호작용 요소를 클릭한 경우 드래그 방지
  const target = event.target;
  if (target.tagName === 'BUTTON' || 
      target.closest('button') || 
      target.classList.contains('card-action') ||
      target.closest('.card-action') ||
      target.closest('.sync-button') ||
      target.closest('.transaction-button')) {
    return;
  }
  
  isDragging.value = true;
  startX.value = event.clientX;
  startY.value = event.clientY;
  initialTransform.value = currentIndex.value * 100;
  document.addEventListener('mousemove', handleMouseMove);
  document.addEventListener('mouseup', handleMouseUp);
  event.preventDefault();
};

const handleMouseMove = (event) => {
  if (!isDragging.value) return;

  currentX.value = event.clientX;
  const diffX = startX.value - currentX.value;
  const diffY = Math.abs(startY.value - event.clientY);

  // 세로 스크롤이 아닌 경우에만 처리
  if (diffY < 50) {
    event.preventDefault();
  }
};

const handleMouseUp = () => {
  if (!isDragging.value) return;

  const diffX = startX.value - currentX.value;
  const threshold = 50; // 최소 드래그 거리

  if (Math.abs(diffX) > threshold) {
    if (diffX > 0 && currentIndex.value < totalSlides.value - 1) {
      nextSlide();
    } else if (diffX < 0 && currentIndex.value > 0) {
      prevSlide();
    }
  }

  isDragging.value = false;
  document.removeEventListener('mousemove', handleMouseMove);
  document.removeEventListener('mouseup', handleMouseUp);
};

const handleTouchStart = (event) => {
  if (event.touches.length === 1) {
    // 버튼이나 상호작용 요소를 터치한 경우 드래그 방지
    const target = event.target;
    if (target.tagName === 'BUTTON' || 
        target.closest('button') || 
        target.classList.contains('card-action') ||
        target.closest('.card-action') ||
        target.closest('.sync-button') ||
        target.closest('.transaction-button')) {
      return;
    }
    
    isDragging.value = true;
    startX.value = event.touches[0].clientX;
    startY.value = event.touches[0].clientY;
    initialTransform.value = currentIndex.value * 100;
  }
};

const handleTouchMove = (event) => {
  if (!isDragging.value || event.touches.length !== 1) return;

  currentX.value = event.touches[0].clientX;
  const diffY = Math.abs(startY.value - event.touches[0].clientY);

  // 세로 스크롤이 아닌 경우에만 처리
  if (diffY < 50) {
    event.preventDefault();
  }
};

const handleTouchEnd = () => {
  if (!isDragging.value) return;

  const diffX = startX.value - currentX.value;
  const threshold = 50; // 최소 스와이프 거리

  if (Math.abs(diffX) > threshold) {
    if (diffX > 0 && currentIndex.value < totalSlides.value - 1) {
      nextSlide();
    } else if (diffX < 0 && currentIndex.value > 0) {
      prevSlide();
    }
  }

  isDragging.value = false;
};

// 카드별 거래내역 존재 여부 확인
const hasTransactionsForCard = (card) => {
  const cardKey = card.holdingId || card.cardId;
  return props.cardTransactions[cardKey] && props.cardTransactions[cardKey].length > 0;
};

// 카드 클릭 핸들러 (제거 - 이제 버튼으로만 처리)
const handleCardClick = (card) => {
  // 드래그 중이 아닐 때만 클릭 이벤트 처리
  if (!isDragging.value) {
    emit('cardClick', card);
  }
};

// 거래내역 등록 핸들러
const handleRegisterTransactions = (card) => {
  emit('registerTransactions', card);
};

// 거래내역 업데이트 핸들러
const handleUpdateTransactions = (card) => {
  emit('updateTransactions', card);
};

// 컴포넌트 마운트 시 첫 번째 카드 자동 선택
onMounted(() => {
  if (props.cards.length > 0) {
    emit('cardChange', props.cards[0]);
  }
});

// 카드 목록이 변경되면 첫 번째 카드 자동 선택
watch(
  () => props.cards,
  (newCards) => {
    if (newCards.length > 0 && currentIndex.value === 0) {
      emit('cardChange', newCards[0]);
    }
  },
  { immediate: true }
);
</script>

<style scoped>
.card-slider {
  width: 100%;
  margin: 0 auto;
}

.slider-container {
  position: relative;
  width: 100%;
  height: 17rem;
  overflow: hidden;
  border-radius: 20px;
  box-shadow: var(--shadow-md);
}

.slider-wrapper {
  display: flex;
  width: 100%;
  height: 100%;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: grab;
}

.slider-wrapper:active {
  cursor: grabbing;
}

.slide-item {
  flex: 0 0 100%;
}

.slider-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: var(--spacing-lg);
  padding: 0 var(--spacing-sm);
}

.slider-indicators {
  display: flex;
  gap: var(--spacing-sm);
}

.indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--border-light);
  cursor: pointer;
  transition: background-color 0.2s;
}

.indicator.active {
  background: var(--color-accent);
}

.indicator:hover {
  background: var(--text-secondary);
}

.indicator.active:hover {
  background: var(--color-dark);
}

/* 태블릿 */
@media (max-width: 1024px) and (min-width: 769px) {
  .card-slider {
    max-width: 100%;
    padding: 0 var(--spacing-md);
  }

  .slider-container {
    height: 16rem;
    border-radius: 16px;
  }

  .slider-indicators {
    gap: var(--spacing-sm);
  }

  .indicator {
    width: 10px;
    height: 10px;
  }
}

/* 모바일 */
@media (max-width: 768px) {
  .card-slider {
    max-width: 100%;
    padding: 0 var(--spacing-sm);
  }

  .slider-container {
    height: auto;
    min-height: 20rem;
    border-radius: 20px;
  }

  .slider-controls {
    margin-top: var(--spacing-xl);
    padding: 0;
  }

  .slider-indicators {
    gap: var(--spacing-md);
  }

  .indicator {
    width: 12px;
    height: 12px;
  }
}

/* 작은 모바일 */
@media (max-width: 480px) {
  .card-slider {
    padding: 0;
  }

  .slider-container {
    min-height: 18rem;
    border-radius: 16px;
  }

  .slider-controls {
    margin-top: var(--spacing-lg);
  }

  .indicator {
    width: 10px;
    height: 10px;
  }
}
</style>
