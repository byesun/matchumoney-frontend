<template>
  <BaseCardGrey class="kb-card-item">
    <template #content>
      <div class="card-content">
        <!-- 카드 이미지 -->
        <div class="card-image-container">
          <img
            v-if="card.cardImageUrl"
            :src="card.cardImageUrl"
            :alt="card.name"
            class="card-image"
            @error="handleImageError"
          />
          <div v-else class="card-placeholder">
            <i class="bi bi-credit-card card-icon"></i>
            <span class="card-type">{{ card.type }}</span>
          </div>
        </div>

        <!-- 카드 정보 -->
        <div class="card-info">
          <div class="card-header">
            <h4 class="card-name">{{ card.name }}</h4>
            <div class="card-badges">
              <span :class="getCardTypeBadgeClass(card.type)">{{
                formatCardType(card.type)
              }}</span>
              <span v-if="card.issuer" class="issuer-badge">{{
                card.issuer
              }}</span>
            </div>
          </div>

          <!-- 연회비 정보 -->
          <div class="fee-section">
            <div class="fee-info">
              <span class="fee-label">연회비</span>
              <div class="fee-details">
                <span
                  class="fee-amount"
                  v-html="formatAnnualFee(card.annualFee)"
                ></span>
              </div>
            </div>
            <div v-if="card.preMonthMoney > 0" class="condition-info">
              <span class="condition-label">전월실적</span>
              <span class="condition-amount">{{
                formatCurrency(card.preMonthMoney)
              }}</span>
            </div>
          </div>

          <!-- 카드 혜택/설명 -->
          <div v-if="card.corpPrContainer" class="card-description">
            <p v-html="truncateText(card.corpPrContainer, 100)"></p>
          </div>

          <!-- 팁 정보 -->
          <div v-if="card.corpTips" class="card-tips">
            <i class="bi bi-lightbulb tip-icon"></i>
            <span class="tip-text">{{ truncateText(card.corpTips, 80) }}</span>
          </div>
        </div>

        <!-- 신청 버튼 -->
        <div class="card-actions">
          <BaseButton
            variant="primary"
            size="sm"
            @click="handleApply"
            class="apply-button"
          >
            <i class="bi bi-arrow-right apply-icon"></i>
            신청하기
          </BaseButton>
        </div>
      </div>
    </template>
  </BaseCardGrey>
</template>

<script setup>
import BaseCardGrey from '@/components/base/BaseCardGrey.vue';
import BaseButton from '@/components/base/BaseButton.vue';

const props = defineProps({
  card: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(['apply']);

// 이미지 에러 핸들링
const handleImageError = (event) => {
  event.target.style.display = 'none';
  if (event.target.nextElementSibling) {
    event.target.nextElementSibling.style.display = 'flex';
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

// 카드 타입별 배지 클래스 결정
const getCardTypeBadgeClass = (type) => {
  const baseClass = 'card-type-badge';
  if (!type) return baseClass;

  switch (type.toLowerCase()) {
    case 'credit':
    case '신용':
    case '신용카드':
      return `${baseClass} card-type-credit`;
    case 'debit':
    case 'check':
    case '체크':
    case '체크카드':
      return `${baseClass} card-type-debit`;
    case 'prepaid':
    case '선불':
    case '선불카드':
      return `${baseClass} card-type-prepaid`;
    default:
      return baseClass;
  }
};

// 연회비 포맷팅 개선
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
    // 15,0 같은 형태를 15,000으로 변환
    return `${number},000원`;
  });

  // 맨 뒤에 불필요하게 남은 금액 제거 (예: "국내전용 15,000원 / 해외겸용 15,000원 20,000원" 에서 마지막 20,000원 제거)
  // 이미 두 개의 금액이 있는 경우 세 번째 금액은 제거
  const amountMatches = feeStr.match(/\d{1,3}(?:,\d{3})*원/g);
  if (amountMatches && amountMatches.length > 2) {
    // 마지막 금액을 제거
    const lastAmount = amountMatches[amountMatches.length - 1];
    const lastIndex = feeStr.lastIndexOf(lastAmount);
    feeStr = feeStr.substring(0, lastIndex).trim();
  }

  // 국내/해외 연회비가 구분되어 있는 경우
  if (feeStr.includes('국내') || feeStr.includes('해외')) {
    // 숫자 포맷팅
    feeStr = feeStr.replace(/(\d{1,3}(?:,\d{3})*),?(\d{3})?원/g, (match, main, extra) => {
      const number = parseInt(main.replace(/,/g, '') + (extra || ''));
      return `${number.toLocaleString()}원`;
    });

    return feeStr
      .replace(/국내\s*:\s*/g, '<div class="fee-domestic">국내: ')
      .replace(/해외\s*:\s*/g, '</div><div class="fee-international">해외: ')
      .replace(/^\s*/, '<div class="fee-total">')
      .replace(/\s*$/, '</div>');
  }

  // 일반적인 경우
  const numericMatch = feeStr.match(/(\d{1,3}(?:,\d{3})*),?(\d{3})?/);
  if (numericMatch) {
    const number = parseInt(numericMatch[0].replace(/,/g, ''));
    if (number > 0) {
      const formattedAmount = number.toLocaleString();
      
      // 숫자를 제외한 나머지 텍스트
      const additionalText = feeStr
        .replace(/\d{1,3}(?:,\d{3})*,?\d*원?/g, '')
        .replace(/\s+/g, ' ')
        .trim();
      
      if (additionalText) {
        return `${formattedAmount}원 ${additionalText}`;
      }
      
      return `${formattedAmount}원`;
    }
  }

  // 특수한 경우나 텍스트만 있는 경우
  return feeStr;
};

// 통화 포맷팅
const formatCurrency = (amount) => {
  if (!amount || amount === 0) return '없음';

  if (amount >= 10000) {
    const man = Math.floor(amount / 10000);
    const remainder = amount % 10000;
    if (remainder === 0) {
      return `${man}만원`;
    } else {
      return `${man}만 ${remainder.toLocaleString()}원`;
    }
  }

  return `${amount.toLocaleString()}원`;
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

// 신청 버튼 클릭 핸들러
const handleApply = () => {
  emit('apply', props.card);
};
</script>

<style scoped>
.kb-card-item {
  height: 100%;
  transition: all 0.3s ease;
}

.kb-card-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.card-content {
  padding: var(--spacing-lg);
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.card-image-container {
  width: 100%;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-background);
  border-radius: 12px;
  overflow: hidden;
  position: relative;
}

.card-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 12px;
}

.card-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--color-text-light);
  gap: var(--spacing-sm);
}

.card-icon {
  font-size: 2.5rem;
  color: var(--color-text-light);
}

.card-type {
  font-size: var(--font-size-sm);
  font-weight: 500;
}

.card-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.card-header {
  margin-bottom: var(--spacing-sm);
}

.card-name {
  font-size: var(--font-size-lg);
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0 0 var(--spacing-xs) 0;
  line-height: 1.3;
}

.card-badges {
  display: flex;
  gap: var(--spacing-xs);
  flex-wrap: wrap;
}

.card-type-badge,
.issuer-badge {
  font-size: var(--font-size-xs);
  padding: 4px 8px;
  border-radius: 12px;
  font-weight: 600;
  white-space: nowrap;
}

.card-type-badge {
  background: var(--color-primary-light);
  color: var(--color-primary);
}

.card-type-credit {
  background: #e3f2fd;
  color: #1976d2;
}

.card-type-debit {
  background: #f3e5f5;
  color: #7b1fa2;
}

.card-type-prepaid {
  background: #e8f5e8;
  color: #388e3c;
}

.issuer-badge {
  background: var(--color-accent-light);
  color: var(--color-accent);
}

.fee-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm);
  background: var(--color-background);
  border-radius: 8px;
}

.fee-info,
.condition-info {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--spacing-sm);
}

.fee-label,
.condition-label {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  font-weight: 500;
  flex-shrink: 0;
}

.fee-details {
  flex: 1;
  text-align: right;
}

.fee-amount,
.condition-amount {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--color-text-primary);
}

.fee-amount .fee-domestic,
.fee-amount .fee-international {
  display: block;
  font-size: var(--font-size-xs);
  margin-bottom: 2px;
}

.fee-amount .fee-domestic {
  color: var(--color-primary);
}

.fee-amount .fee-international {
  color: var(--color-accent);
}

.fee-amount .fee-total {
  display: block;
}

.card-description {
  flex: 1;
  font-size: var(--font-size-sm);
  line-height: 1.5;
  color: var(--color-text-secondary);
}

.card-tips {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm);
  background: var(--color-info-light);
  border-radius: 8px;
  border-left: 4px solid var(--color-info);
}

.tip-icon {
  color: var(--color-info);
  font-size: var(--font-size-sm);
  margin-top: 2px;
  flex-shrink: 0;
}

.tip-text {
  font-size: var(--font-size-xs);
  line-height: 1.4;
  color: var(--color-text-secondary);
}

.card-actions {
  margin-top: auto;
  padding-top: var(--spacing-md);
}

.apply-button {
  width: 100%;
  justify-content: center;
  gap: var(--spacing-xs);
  font-weight: 600;
}

.apply-icon {
  transition: transform 0.2s ease;
}

.apply-button:hover .apply-icon {
  transform: translateX(4px);
}

/* 태블릿 */
@media (max-width: 1024px) {
  .card-content {
    padding: var(--spacing-md);
  }

  .card-image-container {
    height: 100px;
  }

  .card-name {
    font-size: var(--font-size-base);
  }
}

/* 모바일 */
@media (max-width: 768px) {
  .card-content {
    padding: var(--spacing-sm);
    gap: var(--spacing-sm);
  }

  .card-image-container {
    height: 80px;
  }

  .card-icon {
    font-size: 2rem;
  }

  .card-name {
    font-size: var(--font-size-sm);
  }

  .fee-section {
    padding: var(--spacing-xs);
  }

  .card-tips {
    padding: var(--spacing-xs);
  }
}
</style>
