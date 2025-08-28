<template>
  <div class="card recommended-card-item">
    <div class="card-header">
      <div class="card-image">
        <img :src="card.cardImageUrl" :alt="card.cardName" @error="handleImageError" />
      </div>
      <div class="card-info">
        <h3 class="card-name">{{ card.cardName }}</h3>
        <p class="card-issuer">{{ card.issuer }}</p>
        <span class="card-type" :class="cardTypeClass">{{ card.cardType }}</span>
      </div>
      <div class="benefit-amount">
        <span class="benefit-label">예상 혜택</span>
        <span class="benefit-value">{{ formatCurrency(card.estimatedBenefit) }}원</span>
      </div>
    </div>
    
    <div class="card-details">
      <div class="detail-row">
        <span class="detail-label">연회비</span>
        <span class="detail-value">{{ (card.annualFee ? card.annualFee.replace(/\[([^\]]+)\]/g, '$1') : '정보 없음') }}</span>
      </div>
      <div class="detail-row" v-if="card.preMonthMoney">
        <span class="detail-label">전월 실적</span>
        <span class="detail-value">{{ formatCurrency(card.preMonthMoney) }}원</span>
      </div>
    </div>

    <div class="card-actions">
      <BaseButton
        variant="primary"
        class="btn-apply"
        @click="openApplicationLink('pc')"
        v-if="card.requestPcUrl"
      >
        PC에서 신청
      </BaseButton>
      <BaseButton
        variant="secondary"
        class="btn-apply mobile"
        @click="openApplicationLink('mobile')"
        v-if="card.requestMobileUrl"
      >
        모바일에서 신청
      </BaseButton>
    </div>
  </div>
</template>

<script>
import BaseButton from '@/components/base/BaseButton.vue'

export default {
  name: 'RecommendedCardItem',
  components: {
    BaseButton
  },
  props: {
    card: {
      type: Object,
      required: true
    }
  },
  computed: {
    cardTypeClass() {
      return {
        'type-credit': this.card.cardType === '신용',
        'type-debit': this.card.cardType === '체크'
      };
    }
  },
  methods: {
    formatCurrency(amount) {
      if (!amount) return '0';
      return Number(amount).toLocaleString();
    },
    
    handleImageError(event) {
      // 이미지 로드 실패 시 기본 이미지로 대체
      event.target.src = '/logo.png';
    },
    
    openApplicationLink(type) {
      const url = type === 'pc' ? this.card.requestPcUrl : this.card.requestMobileUrl;
      if (url) {
        window.open(url, '_blank');
      }
    }
  }
};
</script>

<style scoped>
.recommended-card-item {
  background: var(--bg-card);
  border-radius: 12px;
  box-shadow: var(--shadow-md);
  margin-bottom: var(--spacing-lg);
  padding: var(--spacing-xl);
  transition: all 0.3s ease;
  border: 1px solid var(--border-light);
}

.recommended-card-item:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
  border-color: var(--color-accent);
}

.card-header {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-lg);
}

.card-image {
  flex-shrink: 0;
  width: 80px;
  height: 50px;
  border-radius: 8px;
  overflow: hidden;
  background: var(--color-light);
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.card-info {
  flex: 1;
  min-width: 0;
}

.card-name {
  font-size: var(--font-size-xl);
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 var(--spacing-xs) 0;
  line-height: 1.3;
}

.card-issuer {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin: 0 0 var(--spacing-sm) 0;
}

.card-type {
  display: inline-block;
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: 6px;
  font-size: var(--font-size-xs);
  font-weight: 500;
}

.type-credit {
  background: var(--color-info-light);
  color: var(--color-info-dark);
}

.type-debit {
  background: var(--color-secondary-20);
  color: var(--color-dark);
}

.benefit-amount {
  text-align: right;
  flex-shrink: 0;
}

.benefit-label {
  display: block;
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
  margin-bottom: var(--spacing-xs);
}

.benefit-value {
  display: block;
  font-size: var(--font-size-xl);
  font-weight: 700;
  color: var(--color-success);
}

.card-details {
  border-top: 1px solid var(--border-light);
  padding-top: var(--spacing-lg);
  margin-bottom: var(--spacing-lg);
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-sm);
}

.detail-row:last-child {
  margin-bottom: 0;
}

.detail-label {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.detail-value {
  font-size: var(--font-size-sm);
  font-weight: 500;
  color: var(--text-primary);
}

.card-actions {
  display: flex;
  gap: var(--spacing-sm);
}

.btn-apply {
  flex: 1;
  padding: var(--spacing-md) var(--spacing-lg);
  background: var(--color-accent);
  color: var(--color-white);
  border: none;
  border-radius: 8px;
  font-size: var(--font-size-sm);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: var(--shadow-sm);
}

.btn-apply:hover {
  background: var(--color-dark);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.btn-apply.mobile {
  background: var(--color-success);
}

.btn-apply.mobile:hover {
  background: var(--color-success-dark);
}

/* 태블릿 */
@media (max-width: 1024px) and (min-width: 769px) {
  .recommended-card-item {
    padding: var(--spacing-lg);
  }
  
  .card-header {
    gap: var(--spacing-md);
  }
  
  .card-image {
    width: 70px;
    height: 44px;
  }
  
  .card-name {
    font-size: var(--font-size-lg);
  }
  
  .benefit-value {
    font-size: var(--font-size-lg);
  }
}

/* 모바일 */
@media (max-width: 768px) {
  .recommended-card-item {
    padding: var(--spacing-lg);
    margin-bottom: var(--spacing-md);
  }
  
  .card-header {
    flex-direction: column;
    gap: var(--spacing-lg);
    align-items: stretch;
  }
  
  .card-image {
    width: 100%;
    max-width: 200px;
    height: 80px;
    align-self: center;
  }
  
  .card-info {
    text-align: center;
  }
  
  .benefit-amount {
    text-align: center;
    margin-top: var(--spacing-md);
  }
  
  .benefit-value {
    font-size: var(--font-size-2xl);
  }
  
  .card-actions {
    flex-direction: column;
    gap: var(--spacing-md);
    margin-top: var(--spacing-lg);
  }
  
  .btn-apply {
    padding: var(--spacing-md) var(--spacing-xl);
  }
}

/* 작은 모바일 */
@media (max-width: 480px) {
  .recommended-card-item {
    padding: var(--spacing-md);
  }
  
  .card-image {
    max-width: 180px;
    height: 70px;
  }
  
  .card-name {
    font-size: var(--font-size-base);
  }
  
  .benefit-value {
    font-size: var(--font-size-xl);
  }
  
  .btn-apply {
    font-size: var(--font-size-sm);
    padding: var(--spacing-sm) var(--spacing-lg);
  }
}
</style>