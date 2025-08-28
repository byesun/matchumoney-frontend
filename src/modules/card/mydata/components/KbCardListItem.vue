<template>
  <div class="kb-card-list-item" @click="handleCardClick">
    <!-- 즐겨찾기 버튼 -->
    <div class="favorite-toggle" @click.stop="handleFavoriteToggle">
      <i
        :class="[
          card.isStarred ? 'fas fa-star starred' : 'far fa-star unstarred',
          'favorite-icon',
        ]"
        title="즐겨찾기"
      ></i>
    </div>

    <div class="card-info">
      <div class="card-image-section">
        <div class="card-image-container">
          <img
            v-if="card.cardImageUrl"
            :src="card.cardImageUrl"
            :alt="card.name"
            class="card-image"
            @error="handleImageError"
            @load="handleImageLoad"
            loading="lazy"
          />
          <div v-else class="card-placeholder">
            <i class="bi bi-credit-card card-icon"></i>
          </div>
          <div class="image-loading" v-if="!imageLoaded">
            <div class="loading-spinner"></div>
          </div>
        </div>

        <div class="like-compare-row">
          <LikeToggle
            :productId="card.cardProductId || card.id"
            productType="card-products"
            :initialLiked="card.isLiked || false"
            :initialCount="card.likeCount || 0"
            @update="handleLikeUpdate"
            @click.stop
          />

          <!-- 비교함 버튼 - 이미지 바로 아래 -->
          <div class="compare-container">
            <CompareButton
              :productId="Number(card.cardProductId || card.id)"
              productType="CARD"
            />
          </div>
        </div>
      </div>

      <div class="card-details">
        <h4 class="card-name">{{ card.name }}</h4>
        <p class="card-issuer">{{ card.issuer || 'KB국민카드' }}</p>

        <div class="card-specs">
          <span
            class="card-type"
            :class="getCardTypeClass(card.type || card.cardType)"
          >
            {{ formatCardType(card.type || card.cardType) }}
          </span>
          <span
            class="annual-fee"
            v-html="formatAnnualFeeWithLineBreak(card.annualFee)"
          ></span>
        </div>

        <!-- 전월실적 정보 -->
        <div
          v-if="card.preMonthMoney && card.preMonthMoney > 0"
          class="pre-month-condition"
        >
          <span class="condition-label">전월실적:</span>
          <span class="condition-amount"
            >{{ formatCurrency(card.preMonthMoney) }}원</span
          >
        </div>
        <!-- 신청 버튼 -->
        <!-- <div class="card-action-container">
          <div class="card-action">
            <BaseButton
              variant="primary"
              size="sm"
              @click.stop="handleApply"
              class="apply-button"
            >
              <i class="bi bi-arrow-right apply-icon"></i>
              신청하기
            </BaseButton>
          </div>
        </div> -->

        <!-- 카드 설명/혜택 -->
        <div v-if="card.corpPrContainer" class="card-description">
          <p>{{ truncateText(card.corpPrContainer, 80) }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits, ref } from 'vue';
import { useRouter } from 'vue-router';
import BaseButton from '@/components/base/BaseButton.vue';
import LikeToggle from '@/components/common/LikeToggle.vue';
import CompareButton from '@/components/common/CompareButton.vue';
import favorite from '@/api/favorite.js';
import { ProductType } from '@/constants/productTypes';

const props = defineProps({
  card: {
    type: Object,
    required: true,
  },
  index: {
    type: Number,
    required: true,
  },
});

const emit = defineEmits(['apply', 'click']);

// Router
const router = useRouter();

// 반응형 데이터
const imageLoaded = ref(false);

// 이미지 에러 핸들링
const handleImageError = (event) => {
  event.target.src = '/logo.png';
};

const handleImageLoad = (event) => {
  imageLoaded.value = true;
  const img = event.target;
  const container = img.parentElement;
  if (img.naturalHeight > img.naturalWidth) {
    container.classList.add('vertical-image');
  } else {
    container.classList.add('horizontal-image');
  }
};

// 카드 타입 포맷팅
const formatCardType = (type) => {
  if (!type) return '카드';

  switch (type.toLowerCase()) {
    case 'credit':
    case '신용':
    case '신용카드':
      return '신용카드';
    case 'debit':
    case 'check':
    case '체크':
    case '체크카드':
      return '체크카드';
    case 'prepaid':
    case '선불':
    case '선불카드':
      return '선불카드';
    default:
      return type;
  }
};

// 카드 타입별 클래스 결정
const getCardTypeClass = (type) => {
  if (!type) return 'type-default';

  switch (type.toLowerCase()) {
    case 'credit':
    case '신용':
    case '신용카드':
      return 'type-credit';
    case 'debit':
    case 'check':
    case '체크':
    case '체크카드':
      return 'type-debit';
    case 'prepaid':
    case '선불':
    case '선불카드':
      return 'type-prepaid';
    default:
      return 'type-default';
  }
};

// 연회비 포맷팅
const formatAnnualFee = (fee) => {
  if (!fee || fee === '0' || fee === '무료') {
    return '무료';
  }

  // 불필요한 문자들 제거 (대괄호, 중괄호, 특수문자 등)
  let feeStr = fee
    .toString()
    .trim()
    .replace(/[\[\]{}|ㅇ]/g, '') // 대괄호, 중괄호, |, ㅇ 제거
    .replace(/\s+/g, ' ') // 중복 공백 제거
    .trim();

  // 숫자 뒤에 0이 빠진 경우 수정 (예: 15,0원 → 15,000원)
  feeStr = feeStr.replace(/(\d+),0원/g, (match, number) => {
    return `${number},000원`;
  });

  // 일반적인 경우
  const numericMatch = feeStr.match(/(\d{1,3}(?:,\d{3})*),?(\d{3})?/);
  if (numericMatch) {
    const number = parseInt(numericMatch[0].replace(/,/g, ''));
    if (number > 0) {
      return `${number.toLocaleString()}원`;
    }
  }

  return feeStr || '정보 없음';
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

  return feeStr || '정보 없음';
};

// 통화 포맷팅
const formatCurrency = (amount) => {
  if (!amount || amount === 0) return '없음';

  if (amount >= 10000) {
    const man = Math.floor(amount / 10000);
    const remainder = amount % 10000;
    if (remainder === 0) {
      return `${man}만`;
    } else {
      return `${man}만 ${remainder.toLocaleString()}`;
    }
  }

  return amount.toLocaleString();
};

// 텍스트 자르기
const truncateText = (text, maxLength) => {
  if (!text) return '';

  // HTML 태그 제거
  const plainText = text.replace(/<[^>]*>/g, '');

  if (plainText.length <= maxLength) {
    return plainText;
  }

  return plainText.substring(0, maxLength) + '...';
};

// 즐겨찾기 토글
const handleFavoriteToggle = async () => {
  const currentState = props.card.isStarred;
  const newState = !currentState;

  // 낙관적 UI 업데이트
  props.card.isStarred = newState;

  try {
    const cardId = props.card.cardProductId || props.card.id;
    if (newState) {
      await favorite.addFavorite(String(cardId), ProductType.CARD);
    } else {
      await favorite.deleteFavorite(String(cardId), ProductType.CARD);
    }
    console.log(
      `카드 ${props.card.name} 즐겨찾기 ${newState ? '추가' : '제거'} 완료`
    );
  } catch (error) {
    console.error('즐겨찾기 토글 실패:', error);

    // 409 에러(이미 추가/삭제됨)가 아닌 경우에만 롤백
    if (!(error.response?.status === 409)) {
      props.card.isStarred = currentState;
    }
  }
};

// 좋아요 업데이트
const handleLikeUpdate = (payload) => {
  // payload: { isLiked: boolean, likeCount: number }
  props.card.isLiked = payload.isLiked;
  props.card.likeCount = payload.likeCount;
  console.log('좋아요 업데이트:', payload);
};

// 카드 클릭 처리
const handleCardClick = () => {
  // 카드 상세 페이지로 이동
  const cardId = props.card.cardProductId || props.card.id;
  if (cardId) {
    router.push(`/detail/card/${cardId}`);
  } else {
    emit('click', props.card);
  }
};

// 신청 버튼 클릭 처리
const handleApply = () => {
  emit('apply', props.card);
};
</script>

<style scoped>
.kb-card-list-item {
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
  cursor: pointer;
  margin-bottom: var(--spacing-md);
  border-color: var(--color-primary);
}

.kb-card-list-item:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--color-accent);
}

.favorite-toggle {
  position: absolute;
  top: var(--spacing-lg);
  right: var(--spacing-lg);
  z-index: 10;
  cursor: pointer;
}

.favorite-toggle .favorite-icon {
  font-size: var(--font-size-2xl);
  transition: all 0.2s ease;
}

.favorite-toggle .favorite-icon {
  color: #ffbb00;
}

.favorite-toggle:hover .favorite-icon {
  transform: scale(1.1);
}

.card-info {
  display: flex;
  align-items: flex-start;
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

.card-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--color-text-light);
  gap: var(--spacing-xs);
}

.card-icon {
  font-size: 2rem;
  color: var(--color-text-light);
}

.like-compare-row {
  display: flex;
  gap: var(--spacing-xs);
  justify-content: center;
  align-items: center;
}

.compare-container {
  display: flex;
  justify-content: center;
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
  font-size: var(--font-size-xs);
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

.type-prepaid {
  background: var(--color-success-light);
  color: var(--color-success);
}

.type-default {
  background: var(--color-light);
  color: var(--color-text-secondary);
}

.annual-fee {
  font-size: var(--font-size-base);
  color: var(--text-muted);
  line-height: 1.4;
  flex: 1;
}

.pre-month-condition {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  margin-bottom: var(--spacing-sm);
}

.condition-label {
  font-size: var(--font-size-base);
  color: var(--color-text-secondary);
  font-weight: 500;
}

.condition-amount {
  font-size: var(--font-size-base);
  font-weight: 600;
  color: var(--color-text-primary);
}

.card-description {
  font-size: var(--font-size-base);
  line-height: 1.4;
  color: var(--color-text-secondary);
}

.card-description p {
  margin: 0;
}

.card-action-container {
  display: flex;
  justify-content: start;
  margin-top: var(--spacing-xs);
}

.card-action {
  display: inline-block;
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: 12px;
  background: var(--color-success-light);
  transition: all 0.2s ease;
  box-shadow: var(--shadow-sm);
  border: 1.5px solid var(--color-white);
}

.kb-card-list-item:hover .card-action {
  transform: translateY(-1px);
}

.apply-button {
  background: none;
  border: none;
  color: var(--color-success-dark);
  font-size: var(--font-size-base);
  font-weight: 700;
  padding: 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.apply-icon {
  transition: transform 0.2s ease;
}

.apply-button:hover .apply-icon {
  transform: translateX(4px);
}

@media (max-width: 1024px) {
  .card-name {
    font-size: var(--font-size-2xl);
  }
  .card-issuer {
    font-size: var(--font-size-base);
  }
  .card-info {
    font-size: var(--font-size-lg);
  }
  .card-action {
    padding: var(--spacing-xs) var(--spacing-sm);
  }
  .apply-button {
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
    font-size: var(--font-size-lg);
  }

  .kb-card-list-item {
    gap: var(--spacing-sm);
  }

  .card-info {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-start;
    padding-top: 0;
    gap: var(--spacing-md);
    font-size: var(--font-size-sm);
  }

  .card-image-section {
    flex: 1;
    justify-content: center;
  }

  .card-details {
    flex: 4; /* 두 번째 칸(상세정보) 비율 */
    min-width: 0;
    margin-left: 1.5rem;
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

  .kb-card-list-item {
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

  .card-name {
    font-size: var(--font-size-xl);
    margin-bottom: var(--spacing-sm);
  }

  .card-issuer {
    font-size: var(--font-size-lg);
    margin-bottom: var(--spacing-sm);
  }

  .annual-fee {
    font-size: var(--font-size-lg);
  }

  .condition-label {
    font-size: var(--font-size-lg);
  }

  .condition-amount {
    font-size: var(--font-size-lg);
  }

  .card-description {
    font-size: var(--font-size-lg);
  }

  .card-specs {
    margin-bottom: var(--spacing-sm);
  }

  .card-action {
    text-align: center;
    margin-top: var(--spacing-xs);
    padding: calc(var(--spacing-xs) * 0.8) var(--spacing-sm);
  }
  .apply-button {
    font-size: var(--font-size-lg);
  }
}
</style>
