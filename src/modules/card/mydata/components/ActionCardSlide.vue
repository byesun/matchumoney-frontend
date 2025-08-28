<template>
  <div class="action-slide-container">
    <!-- 기존 액션 카드 -->
    <BaseCardGreen class="action-card-container">
      <template #content>
        <div class="action-card">
          <!-- 카드 모양 아이콘 -->
          <div class="card-icon">
            <div class="card-shape">
              <div class="card-chip"></div>
              <div class="card-lines">
                <div class="card-line"></div>
                <div class="card-line"></div>
              </div>
              <div class="card-number">**** ****</div>
            </div>
          </div>

          <div class="card-content">
            <h4 class="card-title">
              <template v-if="hasCards">카드 다시 불러오기</template>
              <template v-else>내 카드 등록하기</template>
            </h4>
            <p class="card-info">
              <template v-if="hasCards">
                카드 정보를 다시 불러와
                <br />
                최신 상태로 확인해보세요!
              </template>
              <template v-else>
                KB카드 마이데이터를 연동하여
                <br />
                카드 정보를 가져와보세요!
              </template>
            </p>
          </div>

          <!-- 액션 버튼 -->
          <BaseButton
            :variant="hasCards ? 'outline' : 'primary'"
            class="action-button"
            @click="handleAction"
          >
            <i v-if="hasCards" class="bi bi-arrow-clockwise"></i>
            <i v-else class="bi bi-plus-circle"></i>
          </BaseButton>
        </div>
      </template>
    </BaseCardGreen>

    <!-- KB카드 추천 섹션 (카드가 없을 때만 표시) -->
    <div
      v-if="!hasCards && showKbRecommendation"
      class="kb-recommendation-wrapper"
    ></div>
  </div>
</template>

<script setup>
import BaseCardGreen from '@/components/base/BaseCardGreen.vue';
import BaseButton from '@/components/base/BaseButton.vue';

const props = defineProps({
  hasCards: {
    type: Boolean,
    default: false,
  },
  showKbRecommendation: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits(['register', 'update']);

// 버튼만 클릭 시 동작
const handleAction = () => {
  if (props.hasCards) {
    emit('update');
  } else {
    emit('register');
  }
};
</script>

<style scoped>
.action-slide-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl, 24px);
}

.action-card-container {
  width: 100%;
  height: 100%;
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.kb-recommendation-wrapper {
  width: 100%;
  margin-top: var(--spacing-lg, 20px);
}

.action-card {
  width: 100%;
  height: auto;
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-lg);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  gap: var(--spacing-xl);
}

.action-card-container:hover {
  transform: translateY(-2px);
}

/* 카드 아이콘 */
.card-icon {
  flex-shrink: 0;
}

.card-shape {
  width: 80px;
  height: 50px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 8px;
  position: relative;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.card-chip {
  width: 12px;
  height: 10px;
  background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
  border-radius: 2px;
  position: absolute;
  top: 8px;
  left: 10px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.card-lines {
  position: absolute;
  top: 22px;
  left: 10px;
  right: 10px;
}

.card-line {
  height: 1px;
  background: var(--color-black);
  margin-bottom: 2px;
}

.card-line:first-child {
  width: 70%;
}

.card-line:last-child {
  width: 50%;
}

.card-number {
  position: absolute;
  bottom: 6px;
  left: 10px;
  font-size: 8px;
  color: var(--color-black); /* 검정 계열 */
  font-weight: 600;
  letter-spacing: 1px;
}

/* 카드 내용 */
.card-content {
  flex: 1;
  text-align: left;
}

.card-title {
  font-weight: 700;
  font-size: var(--font-size-xl);
  color: #222; /* 검정 계열 */
  margin-bottom: var(--spacing-sm);
  text-shadow: none; /* 그림자 제거 */
  line-height: 1.3;
}

.card-info {
  font-size: var(--font-size-base);
  color: var(--color-black); /* 검정 계열 */
  line-height: 1.5;
  opacity: 0.97;
  text-shadow: none; /* 그림자 제거 */
}

/* 액션 버튼 */
.action-button {
  flex-shrink: 0;
  width: 50px !important;
  height: 50px !important;
  border-radius: 50% !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  transition: all 0.3s ease;
  padding: 0 !important;
}

.action-button:hover {
  transform: scale(1.05);
}

.action-button i {
  font-size: var(--font-size-xl);
}

/* 태블릿 레이아웃 */
@media (max-width: 1024px) and (min-width: 769px) {
  .action-card {
    min-height: 180px;
    padding: var(--spacing-lg);
    flex-direction: row;
    gap: var(--spacing-lg);
    text-align: left;
  }

  .card-icon {
    margin-right: 0;
    flex-shrink: 0;
  }

  .card-content {
    text-align: left;
    flex: 1;
  }

  .card-shape {
    width: 70px;
    height: 44px;
  }

  .card-title {
    font-size: var(--font-size-lg);
  }

  .action-button {
    width: 45px !important;
    height: 45px !important;
    flex-shrink: 0;
  }

  .action-button i {
    font-size: var(--font-size-lg);
  }
}

/* 모바일 */
@media (max-width: 768px) {
  .action-card {
    min-height: 160px;
    padding: var(--spacing-md);
    flex-direction: column;
    text-align: center;
    justify-content: center;
    gap: var(--spacing-md);
  }

  .card-icon {
    margin-right: 0;
    margin-bottom: 0;
    align-self: center;
  }

  .card-content {
    text-align: center;
    width: 100%;
  }

  .card-shape {
    width: 60px;
    height: 38px;
  }

  .card-chip {
    width: 10px;
    height: 8px;
    top: 6px;
    left: 8px;
  }

  .card-lines {
    top: 18px;
    left: 8px;
    right: 8px;
  }

  .card-number {
    bottom: 4px;
    left: 8px;
    font-size: 7px;
    color: #222;
  }

  .card-title {
    font-size: var(--font-size-lg);
    margin-bottom: var(--spacing-xs);
    color: #222;
  }

  .card-info {
    font-size: var(--font-size-base);
    color: #333;
    margin-bottom: var(--spacing-xs);
  }

  .action-button {
    width: 40px !important;
    height: 40px !important;
    margin-top: var(--spacing-sm);
    align-self: center;
  }

  .action-button i {
    font-size: var(--font-size-base);
    color: #222;
  }

  .recommendation-icon {
    width: 40px !important;
    height: 40px !important;
  }

  .recommendation-icon i {
    font-size: var(--font-size-base);
  }
}

/* 작은 모바일 */
@media (max-width: 480px) {
  .action-card {
    min-height: 140px;
    padding: var(--spacing-sm);
    gap: var(--spacing-sm);
    flex-direction: column;
    text-align: center;
    justify-content: center;
  }

  .card-icon {
    align-self: center;
  }

  .card-content {
    text-align: center;
    width: 100%;
  }

  .card-shape {
    width: 50px;
    height: 32px;
  }

  .card-chip {
    width: 8px;
    height: 6px;
    top: 5px;
    left: 6px;
  }

  .card-lines {
    top: 14px;
    left: 6px;
    right: 6px;
  }

  .card-number {
    bottom: 3px;
    left: 6px;
    font-size: 6px;
    color: #222;
  }

  .card-title {
    font-size: var(--font-size-lg);
    color: #222;
  }

  .card-info {
    font-size: var(--font-size-base);
    color: #333;
  }

  .action-button {
    width: 35px !important;
    height: 35px !important;
    align-self: center;
  }

  .action-button i {
    font-size: var(--font-size-sm);
    color: #222;
  }

  .recommendation-icon {
    width: 35px !important;
    height: 35px !important;
  }

  .recommendation-icon i {
    font-size: var(--font-size-sm);
  }
}
</style>
