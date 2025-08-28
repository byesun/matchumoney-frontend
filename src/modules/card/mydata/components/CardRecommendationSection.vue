<template>
  <div class="card-recommendation-section">
    <div class="section-header">
      <h3>
        <i class="bi bi-stars"></i>
        {{ selectedCard?.cardName || '카드' }} 맞춤 추천
      </h3>
      <p class="section-subtitle">
        소비 패턴을 분석하여 더 나은 카드를 추천해드립니다
      </p>
    </div>

    <!-- 로딩 상태 -->
    <div v-if="loading" class="loading-state">
      <BaseSpinner size="md" />
      <p>추천 카드를 분석하고 있습니다...</p>
    </div>

    <!-- 오류 상태 -->
    <div v-else-if="error" class="error-state">
      <div class="error-icon">⚠️</div>
      <p class="error-message">{{ error }}</p>
      <BaseButton @click="loadRecommendations" variant="outline" size="sm">
        다시 시도
      </BaseButton>
    </div>

    <!-- 추천 결과 없음 -->
    <div
      v-else-if="
        recommendationData && recommendationData.recommendedCards.length === 0
      "
      class="no-recommendations"
    >
      <div class="empty-icon">✅</div>
      <h4>현재 카드가 최적입니다</h4>
      <p>
        {{
          recommendationData.message ||
          '현재 사용 중인 카드가 소비 패턴에 가장 적합합니다.'
        }}
      </p>
    </div>

    <!-- 추천 카드 목록 -->
    <div
      v-else-if="
        recommendationData && recommendationData.recommendedCards.length > 0
      "
      class="recommendations-content"
    >
      <!-- 혜택 비교 요약 -->
      <div class="benefit-summary">
        <div class="current-benefit">
          <span class="label">현재 예상 혜택</span>
          <span class="amount"
            >{{ formatCurrency(getCurrentBenefit()) }}원</span
          >
        </div>
        <div class="arrow">→</div>
        <div class="recommended-benefit">
          <span class="label">최대 예상 혜택</span>
          <span class="amount highlight"
            >{{
              formatCurrency(
                recommendationData.recommendedCards[0]?.estimatedBenefit
              )
            }}원</span
          >
        </div>
        <div class="improvement">
          <span class="improvement-label">개선 효과</span>
          <span class="improvement-amount"
            >+{{ formatCurrency(getBenefitImprovement()) }}원</span
          >
        </div>
      </div>

      <!-- 추천 카드 리스트 (TOP 5) -->
      <div class="recommendations-list">
        <div
          v-for="(card, index) in recommendationData.recommendedCards.slice(
            0,
            5
          )"
          :key="card.cardId"
          class="recommendation-item"
          :class="{ 'top-recommendation': index === 0 }"
          @click="navigateToCardDetail(card.cardId)"
        >
          <div class="rank-badge">{{ index + 1 }}</div>

          <!-- 즐겨찾기 버튼 -->
          <div
            class="favorite-toggle"
            @click.stop="handleDirectFavoriteToggle(card)"
          >
            <i
              :class="[
                card.is_starred ? 'fas fa-star' : 'far fa-star',
                'favorite-icon',
              ]"
              title="즐겨찾기"
            ></i>
          </div>

          <div class="card-info">
            <div class="card-image-section">
              <div class="card-image-container">
                <img
                  :src="card.cardImageUrl"
                  :alt="card.cardName"
                  class="card-image"
                  @error="handleImageError"
                  @load="handleImageLoad"
                  loading="lazy"
                />
                <div class="image-loading" v-if="!imageLoaded">
                  <div class="loading-spinner"></div>
                </div>
              </div>

              <div class="like-compare-row">
                <LikeToggle
                  :productId="card.cardId"
                  productType="card-products"
                  :initialLiked="card.is_liked"
                  :initialCount="card.like_count"
                  @update="(payload) => handleLikeUpdate(card, payload)"
                  @click.stop
                />

                <!-- 비교함 버튼 - 이미지 바로 아래 -->
                <div class="compare-container">
                  <CompareButton
                    :productId="Number(card.cardId)"
                    :productType="productType"
                  />
                </div>
              </div>
            </div>

            <div class="card-details">
              <h4 class="card-name">{{ card.cardName }}</h4>
              <p class="card-issuer">{{ card.issuer }}</p>

              <div class="card-specs">
                <span
                  class="card-type"
                  :class="getCardTypeClass(card.cardType)"
                >
                  {{ card.cardType }}
                </span>
                <span
                  class="annual-fee"
                  v-html="formatAnnualFeeWithLineBreak(card.annualFee)"
                ></span>
              </div>

              <!-- 예상 혜택 정보 - 연회비 아래로 이동 -->
              <div class="benefit-amount">
                <span class="label">예상 혜택 </span>
                <span class="amount">
                  {{ formatCurrency(card.estimatedBenefit) }}원</span
                >
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 추천 카드 총 개수 표시 -->
      <div class="recommendation-summary">
        <p class="summary-text">
          총 {{ recommendationData.recommendedCards.length }}개의 추천 카드 중
          상위 {{ Math.min(5, recommendationData.recommendedCards.length) }}개를
          표시하고 있습니다.
        </p>
      </div>
    </div>

    <!-- 추천 안내 (거래내역 없을 때) -->
    <div v-else class="recommendation-guide">
      <div class="guide-icon">🎯</div>
      <h4>카드 추천을 받으려면</h4>
      <p>거래내역을 먼저 동기화해주세요</p>
      <BaseButton @click="$emit('requestTransactionSync')" variant="outline">
        거래내역 연동하기
      </BaseButton>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import { useRouter } from 'vue-router';
import BaseSpinner from '@/shared/components/base/BaseSpinner.vue';
import BaseButton from '@/shared/components/base/BaseButton.vue';
import FavoriteToggle from '@/shared/components/common/FavoriteToggle.vue';
import CompareButton from '@/shared/components/common/CompareButton.vue';
import cardsApi from '@/modules/card/api/cards.js';
import favorite from '@/modules/user/api/favorite.js';
import { ProductType } from '@/shared/constants/productTypes';
import LikeToggle from '@/shared/components/common/LikeToggle.vue';

// Props
const props = defineProps({
  selectedCard: {
    type: Object,
    default: null,
  },
  hasTransactions: {
    type: Boolean,
    default: false,
  },
});

// Emits
const emit = defineEmits(['requestTransactionSync']);

// Router
const router = useRouter();

// Reactive data
const loading = ref(false);
const error = ref(null);
const recommendationData = ref(null);
const productType = ref(ProductType.CARD);

// 즐겨찾기 상태는 백엔드에서 이미 제공되므로 별도 초기화 불필요

// ---- 카드 추천/비교 로딩 ----
const loadRecommendations = async () => {
  if (!props.selectedCard?.cardId || !props.hasTransactions) {
    return;
  }

  try {
    loading.value = true;
    error.value = null;

    console.log('🎯 카드 추천 로딩 시작:', props.selectedCard.cardId);

    // 1단계: 현재 카드의 혜택 조회
    console.log('💰 현재 카드 혜택 조회 시작');
    const benefitsResponse = await cardsApi.getCardBenefits(
      props.selectedCard.cardId
    );
    console.log('✅ 현재 카드 혜택 조회 완료:', benefitsResponse);

    // 2단계: 추천 카드 로드
    let response = null;
    try {
      response = await cardsApi.getSavedRecommendations(
        props.selectedCard.cardId
      );
      recommendationData.value = response.data || response;
      if (recommendationData.value && benefitsResponse) {
        recommendationData.value.currentCardBenefits =
          benefitsResponse.data || benefitsResponse;
      }
      console.log('✅ 저장된 추천 데이터 로딩 완료:', recommendationData.value);
    } catch (savedError) {
      // 저장된 데이터가 없으면 실시간 추천 조회
      console.log('💾 저장된 추천 없음, 실시간 조회 시도');
      response = await cardsApi.getCardRecommendations(
        props.selectedCard.cardId
      );
      recommendationData.value = response.data || response;
      if (recommendationData.value && benefitsResponse) {
        recommendationData.value.currentCardBenefits =
          benefitsResponse.data || benefitsResponse;
      }
      console.log('✅ 실시간 추천 데이터 로딩 완료:', recommendationData.value);
    }
  } catch (err) {
    console.error('❌ 추천 데이터 로딩 실패:', err);
    error.value = err.message || '추천 데이터를 불러오는데 실패했습니다.';
    recommendationData.value = null;
  } finally {
    loading.value = false;
  }
};

// ---- 예상 혜택 계산 등 ----
const getCurrentBenefit = () => {
  if (
    recommendationData.value?.currentCardBenefits?.ownedCardBenefits?.length > 0
  ) {
    return recommendationData.value.currentCardBenefits.ownedCardBenefits[0]
      .estimatedBenefit;
  }
  return 0;
};

const getBenefitImprovement = () => {
  if (!recommendationData.value?.recommendedCards[0]?.estimatedBenefit) {
    return 0;
  }
  return (
    recommendationData.value.recommendedCards[0].estimatedBenefit -
    getCurrentBenefit()
  );
};

const formatCurrency = (amount) => {
  if (!amount) return '0';
  return Number(amount).toLocaleString();
};

const getCardTypeClass = (cardType) => {
  return {
    'type-credit': cardType === '신용',
    'type-debit': cardType === '체크',
  };
};

// 연회비 포맷팅 with 줄바꿈
const formatAnnualFeeWithLineBreak = (fee) => {
  if (!fee || fee === '0' || fee === '무료') {
    return '무료';
  }

  // 원본 데이터를 그대로 사용하되 특수문자 처리
  let feeStr = fee
    .toString()
    .trim()
    .replace(/\[([^\]]+)\]/g, '$1') // 대괄호 제거하되 내용은 유지
    .replace(/\{([^}]+)\}/g, '$1') // 중괄호 제거하되 내용은 유지
    .replace(/\|\s*/g, '') // 파이프 문자와 뒤따르는 공백 제거
    .replace(/\//g, '<br>'); // '/' 를 줄바꿈으로 변경

  return feeStr || '연회비 정보 없음';
};

const handleImageError = (event) => {
  event.target.src = '/logo.png';
};

const handleImageLoad = (event) => {
  const img = event.target;
  const container = img.parentElement;
  if (img.naturalHeight > img.naturalWidth) {
    container.classList.add('vertical-image');
  } else {
    container.classList.add('horizontal-image');
  }
};

const openApplicationLink = (url) => {
  if (url) {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
};

const navigateToCardDetail = (cardId) => {
  router.push(`/detail/card/${cardId}`);
};

// ---- 좋아요 업데이트 핸들러 ----
const handleLikeUpdate = (card, payload) => {
  // payload: { isLiked: boolean, likeCount: number }
  card.is_liked = payload.isLiked;
  card.like_count = payload.likeCount;
};

// ---- 즐겨찾기 토글 ----
const handleDirectFavoriteToggle = async (card) => {
  const currentState = card.is_starred;
  const newState = !currentState;

  // 낙관적 UI 업데이트
  card.is_starred = newState;

  try {
    if (newState) {
      await favorite.addFavorite(String(card.cardId), ProductType.CARD);
    } else {
      await favorite.deleteFavorite(String(card.cardId), ProductType.CARD);
    }
    console.log(
      `카드 ${card.cardName} 즐겨찾기 ${newState ? '추가' : '제거'} 완료`
    );
  } catch (error) {
    console.error('즐겨찾기 토글 실패:', error);

    // 409 에러(이미 추가/삭제됨)가 아닌 경우에만 롤백
    if (!(error.response?.status === 409)) {
      card.is_starred = currentState;
    }
  }
};

// Watchers
watch(
  () => props.selectedCard,
  (newCard) => {
    if (newCard && newCard.cardId && props.hasTransactions) {
      loadRecommendations();
    }
  },
  { immediate: true }
);

watch(
  () => props.hasTransactions,
  (hasTransactions) => {
    if (hasTransactions && props.selectedCard?.cardId) {
      loadRecommendations();
    }
  }
);
</script>

<style scoped>
/* main.css 변수 import */
@import '@/assets/main.css';

/* ===== 기본 스타일 (웹 - 1025px 이상) ===== */
.card-recommendation-section {
  background: var(--bg-card);
  border-radius: 16px;
  padding: var(--spacing-xl);
  box-shadow: var(--shadow-md);
  border: 1px solid var(--border-light);
}

.section-header {
  margin-bottom: var(--spacing-xl);
  text-align: center;
}

.section-header h3 {
  font-size: var(--font-size-xl);
  font-weight: 700;
  color: var(--color-dark);
  margin: 0 0 var(--spacing-sm) 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
}

.section-subtitle {
  font-size: var(--font-size-base);
  color: var(--text-secondary);
  margin: 0;
}

.loading-state,
.error-state,
.no-recommendations,
.recommendation-guide {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-2xl) var(--spacing-lg);
  text-align: center;
}

.error-icon,
.empty-icon,
.guide-icon {
  font-size: var(--font-size-4xl);
  margin-bottom: var(--spacing-lg);
}

.error-message {
  color: var(--text-secondary);
  margin-bottom: var(--spacing-lg);
}

.benefit-summary {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-xl);
  padding: var(--spacing-lg);
  background: linear-gradient(
    135deg,
    var(--color-light) 0%,
    var(--color-info-light) 100%
  );
  border-radius: 12px;
  flex-wrap: wrap;
  border: 1px solid var(--border-light);
}

.current-benefit,
.recommended-benefit {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.benefit-summary .label {
  font-size: var(--font-size-base);
  color: var(--text-secondary);
}

.benefit-summary .amount {
  font-size: var(--font-size-lg);
  font-weight: 700;
  color: var(--text-primary);
}

.benefit-summary .amount.highlight {
  color: var(--color-success);
}

.arrow {
  font-size: var(--font-size-xl);
  color: var(--color-accent);
  font-weight: bold;
}

.improvement {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--color-success);
  border-radius: 8px;
  color: var(--color-white);
  box-shadow: var(--shadow-sm);
}

.improvement-label {
  font-size: var(--font-size-base);
}

.improvement-amount {
  font-size: var(--font-size-sm);
  font-weight: 700;
}

.recommendations-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-xl);
}

.recommendation-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
  padding: var(--spacing-lg);
  border: 1px solid var(--border-light);
  border-radius: 12px;
  position: relative;
  transition: all 0.2s ease;
  background: var(--bg-card);
  min-height: 110px;
}

.recommendation-item:hover {
  border-color: var(--color-accent);
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.top-recommendation {
  border-color: var(--color-warning);
  background: linear-gradient(
    135deg,
    var(--color-warning-light) 0%,
    var(--bg-card) 100%
  );
}

.rank-badge {
  position: absolute;
  top: calc(-1 * var(--spacing-sm));
  left: calc(-1 * var(--spacing-sm));
  width: 32px;
  height: 32px;
  background: var(--color-accent);
  color: var(--color-white);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-sm);
  font-weight: 700;
  box-shadow: var(--shadow-md);
  border: 2px solid var(--bg-card);
}

.top-recommendation .rank-badge {
  background: var(--color-warning);
  color: var(--color-white);
}

.favorite-toggle {
  position: absolute;
  top: var(--spacing-lg);
  right: var(--spacing-lg);
  z-index: 10;
  cursor: pointer;
}

.favorite-toggle .favorite-icon {
  color: #ffbb00;
  font-size: var(--font-size-2xl);
  transition: transform 0.2s ease;
}

.favorite-toggle:hover .favorite-icon {
  transform: scale(1.1);
}

.card-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
  flex: 1;
  min-width: 0;
  padding-top: var(--spacing-xs);
}

.card-image-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-xs);
}

.card-image-container {
  flex-shrink: 0;
  width: 140px;
  height: 90px;
  border-radius: 12px;
  overflow: hidden;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.compare-container {
  display: flex;
  justify-content: center;
}

.card-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  object-position: center;
}

.card-image-container.vertical-image .card-image {
  height: 85px;
  width: auto;
}

.card-image-container.horizontal-image .card-image {
  width: 110px;
  height: auto;
}

.card-details {
  flex: 1;
  min-width: 0;
}

.card-name {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 var(--spacing-xs) 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-issuer {
  font-size: var(--font-size-base);
  color: var(--text-secondary);
  margin: 0 0 var(--spacing-sm) 0;
}

.card-specs {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-sm);
}

.card-type {
  display: inline-block;
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: 6px;
  font-size: var(--font-size-base);
  font-weight: 500;
  flex-shrink: 0;
}

.type-credit {
  background: var(--color-info-light);
  color: var(--color-info-dark);
}

.type-debit {
  background: var(--color-secondary-20);
  color: var(--color-dark);
}

.annual-fee {
  font-size: var(--font-size-base);
  color: var(--text-muted);
  line-height: 1.4;
  flex: 1;
}

/* 예상 혜택 정보 - card-details 안으로 이동 */
.card-details .benefit-amount {
  display: inline-block;
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: 12px;
  margin-top: var(--spacing-xs);
  background: var(--color-success-light);
  transition: all 0.2s ease;
  box-shadow: var(--shadow-sm);
  border: 1.5px solid var(--color-white);
  box-shadow: var(--shadow-md);
}

.recommendation-item:hover .card-details .benefit-amount {
  transform: translateY(-1px);
}

.card-details .benefit-amount .label {
  font-size: var(--font-size-base);
  color: var(--color-success-dark);
  margin-right: var(--spacing-xs);
}

.card-details .benefit-amount .amount {
  font-size: var(--font-size-sm);
  font-weight: 700;
  color: var(--color-success-dark);
}

.benefit-info {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: center;
  gap: var(--spacing-sm);
  min-width: 120px;
  height: 100%;
  padding-top: var(--spacing-xs);
  padding-right: 40px;
}

.btn-apply {
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--color-success);
  color: var(--color-white);
  border: none;
  border-radius: 8px;
  font-size: var(--font-size-sm);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: var(--shadow-sm);
}

.btn-apply:hover {
  background: var(--color-success-dark);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.recommendation-item {
  cursor: pointer;
}

.recommendation-summary {
  border-top: 1px solid var(--border-light);
  padding-top: var(--spacing-lg);
  text-align: center;
}

.summary-text {
  font-size: var(--font-size-base);
  color: var(--text-muted);
  margin: 0;
  font-style: italic;
}

.like-compare-row {
  display: flex;
  gap: var(--spacing-xs);
  justify-content: center;
  align-items: center;
}

@media (max-width: 1024px) {
  .card-name {
    font-size: var(--font-size-2xl);
  }
  .card-issuer {
    font-size: var(--font-size-base);
  }
  .card-info {
    font-size: var(--font-size-base);
  }
  .card-details .benefit-amount {
    padding: var(--spacing-xs) var(--spacing-sm);
  }
  .card-details .benefit-amount .label {
    font-size: var(--font-size-base);
  }
  .card-details .benefit-amount .amount {
    font-size: var(--font-size-sm);
  }
}

@media (max-width: 640px) {
  .like-compare-row {
    display: flex;
    gap: var(--spacing-xs);
    justify-content: center;
  }

  .card-name {
    font-size: var(--font-size-xl);
  }

  .card-issuer {
    font-size: var(--font-size-lg);
  }

  .annual-fee {
    font-size: var(--font-size-lg);
  }

  .recommendation-item {
    gap: var(--spacing-sm);
  }

  .card-info {
    font-size: var(--font-size-lg);
  }

  .card-image-section {
    justify-content: center;
  }

  .favorite-toggle {
    top: var(--spacing-lg);
    right: var(--spacing-lg);
  }

  .favorite-toggle:hover .favorite-icon {
    transform: scale(1.1);
  }

  .benefit-info {
    padding-right: 35px;
  }

  .card-recommendation-section {
    padding: var(--spacing-lg);
    border-radius: 12px;
  }

  .section-header {
    margin-bottom: var(--spacing-md);
  }

  .section-header h3 {
    font-size: var(--font-size-2xl);
  }

  .benefit-summary {
    gap: var(--spacing-md);
    padding: var(--spacing-lg);
    border-radius: 12px;
  }

  .current-benefit,
  .recommended-benefit {
    text-align: center;
  }

  .arrow {
    align-self: center;
  }

  .improvement {
    align-self: center;
    padding: var(--spacing-md) var(--spacing-lg);
  }

  .recommendation-item {
    flex-direction: column;
    align-items: stretch;
    gap: var(--spacing-sm);
    padding: var(--spacing-lg);
    min-height: auto;
    border-radius: 16px;
  }

  .card-info {
    flex-direction: row;
    align-items: center;
    justify-content: flex-start;
    padding-top: 0;
    gap: var(--spacing-md);
    font-size: var(--font-size-sm);
  }

  .card-image-container {
    width: 100px;
    height: 64px;
  }

  .card-image-container.vertical-image .card-image {
    height: 58px;
    width: auto;
  }

  .card-image-container.horizontal-image .card-image {
    width: 85px;
    height: auto;
  }

  .card-details {
    flex: 1;
    min-width: 0;
  }

  .benefit-info {
    align-items: center;
    flex-direction: column;
    justify-content: center;
    height: auto;
    padding-top: 0;
    padding-right: 35px;
    min-width: auto;
    width: 100%;
    margin-top: var(--spacing-xs);
    gap: var(--spacing-md);
  }

  .apply-actions {
    order: 2;
    width: 100%;
    display: flex;
    justify-content: center;
  }

  .rank-badge {
    width: 32px;
    height: 32px;
    font-size: var(--font-size-sm);
  }

  .card-name {
    font-size: var(--font-size-lg);
    margin-bottom: var(--spacing-sm);
  }

  .card-issuer {
    margin-bottom: var(--spacing-sm);
  }

  .card-specs {
    margin-bottom: var(--spacing-sm);
  }

  .card-details .benefit-amount {
    padding: calc(var(--spacing-xs) * 0.8) var(--spacing-sm);
    margin-top: calc(var(--spacing-xs) * 0.8);
  }
  .card-details .benefit-amount .label {
    font-size: var(--font-size-lg);
  }
  .card-details .benefit-amount .amount {
    font-size: var(--font-size-xl);
  }

  .btn-apply {
    padding: var(--spacing-md) var(--spacing-lg);
    font-size: var(--font-size-base);
    border-radius: 12px;
    width: 100%;
    max-width: 200px;
  }
}
</style>
