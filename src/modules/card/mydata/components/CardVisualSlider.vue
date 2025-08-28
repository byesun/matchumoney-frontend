<template>
  <div class="card-visual-slider">
    <div class="slider-container">
      <!-- ...상단 동일 -->
      <!-- 카드가 없을 때 카드 입력 표시 -->
      <div v-if="filteredCards.length === 0" class="slide-item no-card-item">
        <div class="no-card-content">
          <div class="add-card-icon">
            <i class="bi bi-plus-circle"></i>
          </div>
          <div class="add-card-text">
            <h3>카드를 등록해주세요</h3>
            <p>보유 카드를 등록하면<br>맞춤형 혜택을 확인할 수 있어요</p>
          </div>
          <button class="add-card-button" @click="$emit('add-card')">
            <i class="bi bi-plus"></i>
            카드 등록하기
          </button>
        </div>
      </div>

      <!-- 카드가 있을 때 기존 슬라이더 -->
      <div
        v-else
        class="slider-wrapper"
        :style="{ transform: `translateX(-${currentIndex * 100}%)` }"
        @mousedown="handleMouseDown"
        @touchstart="handleTouchStart"
        @touchmove="handleTouchMove"
        @touchend="handleTouchEnd"
        @mousemove="handleMouseMove"
        @mouseup="handleMouseUp"
        @mouseleave="handleMouseUp"
      >
        <div
          v-for="(card, index) in filteredCards"
          :key="card.holdingId || index"
          class="slide-item"
        >
          <img :src="card.imageUrl" alt="카드 이미지" class="card-image" />
        </div>
      </div>

    </div>

    <!-- 슬라이더 캡션 + 컨트롤 (카드가 있을 때만 표시) -->
    <div v-if="filteredCards.length > 0" class="slider-controls">
      <div class="slider-caption" v-if="activeName">
        <span class="issuer" v-if="activeIssuer">{{ activeIssuer }}</span>
        <span class="name">{{ activeName }}</span>
      </div>
      <div class="slider-indicators">
        <span
          v-for="(_, index) in filteredCards.length"
          :key="index"
          class="indicator"
          :class="{ active: index === currentIndex }"
          @click="goToSlide(index)"
        ></span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  cards: { type: Array, default: () => [] },
});

const emit = defineEmits(['add-card']);

const filteredCards = computed(() =>
  props.cards.filter((card) => !card.isActionCard)
);

const currentIndex = ref(0);

// ▼ 추가: 현재 카드, 카드사/카드명, 좌/우 점 개수
const activeCard = computed(
  () => filteredCards.value[currentIndex.value] || {}
);
const activeIssuer = computed(() => "KB국민카드");
const activeName = computed(
  () => activeCard.value.cardName ?? activeCard.value.name ?? ''
);

const totalCount = computed(() => filteredCards.value.length);
const leftDots = computed(() =>
  Math.max(0, Math.min(currentIndex.value, totalCount.value))
);
const rightDots = computed(() =>
  Math.max(0, totalCount.value - currentIndex.value - 1)
);

const nextSlide = () => {
  if (currentIndex.value < filteredCards.value.length - 1) {
    currentIndex.value++;
  }
};

const prevSlide = () => {
  if (currentIndex.value > 0) {
    currentIndex.value--;
  }
};

const goToSlide = (index) => {
  currentIndex.value = index;
};

// 드래그/스와이프 관련 상태
const isDragging = ref(false);
const startX = ref(0);
const startY = ref(0);
const currentX = ref(0);

const handleMouseDown = (event) => {
  if (event.button !== 0) return;
  isDragging.value = true;
  startX.value = event.clientX;
  startY.value = event.clientY;
  document.addEventListener('mousemove', handleMouseMove);
  document.addEventListener('mouseup', handleMouseUp);
};

const handleMouseMove = (event) => {
  if (!isDragging.value) return;
  currentX.value = event.clientX;
};

const handleMouseUp = () => {
  if (!isDragging.value) return;
  const diffX = startX.value - currentX.value;
  const threshold = 50;
  if (Math.abs(diffX) > threshold) {
    if (diffX > 0) {
      nextSlide();
    } else {
      prevSlide();
    }
  }
  isDragging.value = false;
  document.removeEventListener('mousemove', handleMouseMove);
  document.removeEventListener('mouseup', handleMouseUp);
};

const handleTouchStart = (event) => {
  if (event.touches.length === 1) {
    isDragging.value = true;
    startX.value = event.touches[0].clientX;
    startY.value = event.touches[0].clientY;
  }
};

const handleTouchMove = (event) => {
  if (!isDragging.value || event.touches.length !== 1) return;
  currentX.value = event.touches[0].clientX;
  const diffY = Math.abs(startY.value - event.touches[0].clientY);
  if (diffY < 50) {
    event.preventDefault();
  }
};

const handleTouchEnd = () => {
  if (!isDragging.value) return;
  const diffX = startX.value - currentX.value;
  const threshold = 50;
  if (Math.abs(diffX) > threshold) {
    if (diffX > 0) {
      nextSlide();
    } else {
      prevSlide();
    }
  }
  isDragging.value = false;
};
</script>

<style scoped>
.card-visual-slider {
  width: 100%;
  margin: 0 auto;
}
.slider-container {
  position: relative;
  width: 100%;
  height: 15rem;
  overflow: hidden;
  border-radius: 20px;
}
.slider-wrapper {
  display: flex;
  width: 100%;
  height: 100%;
  transition: transform 0.3s ease;
  cursor: grab;
}
.slider-wrapper:active {
  cursor: grabbing;
}
.slide-item {
  flex: 0 0 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  border: 1px solid var(--color-secondary-30);
  border-radius: 1rem;
  padding: var(--spacing-sm);
  box-shadow: var(--shadow-md);
  background-color: var(--color-primary);
  transition: transform 0.2s ease;
  transform: scale(0.95);
  cursor: pointer;

  overflow: hidden; /* 추가 */
}

.slide-item:hover {
  transform: scale(1);
}
.card-image {
  max-width: 45%;
  height: auto;
}
.card-name {
  margin-top: 0.5rem;
  font-size: 1.1rem;
  text-align: center;
}

.slider-controls {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 0.3rem;                 /* 캡션과 점 간격 */
  margin-top: var(--spacing-sm);/* 상단 여백 축소 */
  padding: 0 var(--spacing-sm);
}

.slider-caption {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1.2;
  text-align: center;
}
.slider-caption .issuer {
  color: var(--color-secondary-90);
  font-weight: 400;
}
.slider-caption .name {
  color: var(--text-primary);
  font-weight: 700;
  font-size: 1.2rem;
}
.slider-indicators {
  display: flex;
  gap: var(--spacing-sm);
  margin-top: 1rem;
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

/* 카드 없을 때 스타일 */
.no-card-item {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: var(--color-primary-10);
  border: 2px dashed var(--border-medium);
  border-radius: 1rem;
  cursor: default;
  transform: none;
}

.no-card-item:hover {
  transform: none;
}

.no-card-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-lg);
  text-align: center;
  padding: var(--spacing-xl);
}

.add-card-icon {
  font-size: 3rem;
  color: var(--color-accent);
  margin-bottom: var(--spacing-sm);
}

.add-card-text h3 {
  font-size: var(--font-size-xl);
  font-weight: 700;
  color: var(--color-dark);
  margin-bottom: var(--spacing-sm);
}

.add-card-text p {
  font-size: var(--font-size-base);
  color: var(--text-secondary);
  line-height: 1.5;
  margin-bottom: 0;
}

.add-card-button {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md) var(--spacing-lg);
  background: var(--color-accent);
  color: var(--color-white);
  border: none;
  border-radius: 8px;
  font-size: var(--font-size-base);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.add-card-button:hover {
  background: var(--color-dark);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

</style>
