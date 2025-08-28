<template>
  <div class="card card-item">
    <div class="card-row-layout">
      <!-- 카드 실물+상태 (좌측) -->
      <div class="card-visual-box">
        <div class="visual-card">
          <div class="visual-chip"></div>
          <div class="visual-number">
            **** **** **** {{ getLastFourDigits(card.cardNo) }}
          </div>
          <div class="visual-validity" v-if="card.validTerm">
            {{ formatValidityDate(card.validTerm) }}
          </div>
        </div>
        <div class="visual-bottom">
          <span class="card-name">{{ card.cardName || "카드명 없음" }}</span>
          <span class="card-status" :class="getStatusClass(card.cardStatus)">
            {{ getStatusText(card.cardStatus) }}
          </span>
        </div>
      </div>

      <!-- 카드 상세정보/액션 (우측) -->
      <div class="card-info-box">
        <div class="card-info-group">
          <span class="info-label">카드번호</span>
          <span class="info-value"
            >**** **** **** {{ getLastFourDigits(card.cardNo) }}</span
          >
        </div>
        <div class="card-info-group" v-if="card.validTerm">
          <span class="info-label">유효기간</span>
          <span class="info-value">{{
            formatValidityDate(card.validTerm)
          }}</span>
        </div>
        <div class="card-actions">
          <BaseButton
            variant="outline"
            class="btn-transactions"
            @click="$emit('viewTransactions', card.holdingId)"
            :disabled="card.cardStatus !== '1'"
          >
            거래내역 보기
          </BaseButton>
          <BaseButton
            variant="secondary"
            class="btn-sync"
            @click="$emit('syncTransactions', card.holdingId)"
            :disabled="card.cardStatus !== '1'"
          >
            거래내역 동기화
          </BaseButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import BaseButton from '@/components/base/BaseButton.vue'

defineProps({
  card: {
    type: Object,
    required: true,
  },
});

defineEmits(["viewTransactions", "syncTransactions"]);

const getLastFourDigits = (cardNo) => {
  if (!cardNo) return "****";
  return cardNo.slice(-4);
};

const formatValidityDate = (validTerm) => {
  if (!validTerm || validTerm.length !== 4) return validTerm;
  return `${validTerm.slice(0, 2)}/${validTerm.slice(2, 4)}`;
};

const getStatusClass = (status) => {
  switch (status) {
    case "1":
      return "status-active";
    case "2":
      return "status-suspended";
    case "3":
      return "status-cancelled";
    default:
      return "status-unknown";
  }
};

const getStatusText = (status) => {
  switch (status) {
    case "1":
      return "정상";
    case "2":
      return "정지";
    case "3":
      return "해지";
    default:
      return "알 수 없음";
  }
};
</script>

<style scoped>
.card-item {
  width: 100%;
  max-width: 580px;
  margin-bottom: var(--spacing-lg);
}

.card-row-layout {
  display: flex;
  flex-direction: row;
  gap: var(--spacing-2xl);
  align-items: stretch;
}

.card-visual-box {
  flex: 0 0 245px;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 170px;
  justify-content: flex-start;
}
.visual-card {
  width: 210px;
  height: 135px;
  background: var(--gradient-accent);
  border-radius: 12px;
  box-shadow: var(--shadow-sm);
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  padding: var(--spacing-lg) var(--spacing-md) var(--spacing-lg) var(--spacing-xl);
  margin-bottom: var(--spacing-sm);
  position: relative;
}
.visual-chip {
  width: 32px;
  height: 22px;
  border-radius: 4px;
  background: var(--gradient-primary);
  margin-bottom: var(--spacing-lg);
}
.visual-number {
  font-family: "Roboto Mono", monospace;
  font-size: var(--font-size-lg);
  color: var(--color-white);
  font-weight: 500;
  letter-spacing: 2.5px;
  margin-top: var(--spacing-sm);
  align-self: flex-end;
  text-shadow: var(--shadow-sm);
}
.visual-validity {
  font-size: var(--font-size-sm);
  color: var(--color-white);
  font-weight: 500;
  opacity: 0.9;
  text-shadow: var(--shadow-sm);
}
.visual-bottom {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-xs);
}
.card-name {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--text-primary);
  letter-spacing: 0.3px;
}
.card-status {
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: 8px;
  font-size: var(--font-size-sm);
  font-weight: 500;
  margin-left: var(--spacing-xs);
}
.status-active {
  background: var(--color-success-light);
  color: var(--color-success-dark);
}
.status-suspended {
  background: var(--color-warning-light);
  color: var(--color-warning-dark);
}
.status-cancelled {
  background: var(--color-error-light);
  color: var(--color-error-dark);
}
.status-unknown {
  background: var(--color-gray-200);
  color: var(--text-muted);
}

.card-info-box {
  flex: 1 1 0;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  gap: var(--spacing-md);
  align-items: flex-start;
}
.card-info-group {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-size: var(--font-size-base);
}
.info-label {
  color: var(--text-secondary);
  font-weight: 500;
  min-width: 65px;
}
.info-value {
  color: var(--text-primary);
  font-weight: 600;
  font-family: "Roboto Mono", monospace;
}

.card-actions {
  display: flex;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-sm);
}

.btn-transactions,
.btn-sync {
  font-size: var(--font-size-sm);
  min-width: 100px;
}

/* 태블릿 대응 */
@media (max-width: 1024px) and (min-width: 769px) {
  .card-item {
    padding: var(--spacing-lg);
  }
  
  .card-row-layout {
    gap: var(--spacing-lg);
  }
  
  .card-visual-box {
    flex-basis: 180px;
    min-width: 140px;
  }
  
  .visual-card {
    width: 170px;
    height: 110px;
    padding: var(--spacing-md) var(--spacing-sm) var(--spacing-md) var(--spacing-lg);
  }
  
  .visual-chip {
    width: 26px;
    height: 18px;
    margin-bottom: var(--spacing-sm);
  }
  
  .visual-number {
    font-size: var(--font-size-base);
    margin-top: var(--spacing-xs);
  }
  
  .visual-validity {
    font-size: var(--font-size-xs);
  }
  
  .visual-bottom {
    gap: var(--spacing-sm);
    margin-top: var(--spacing-sm);
  }
  
  .card-name {
    font-size: var(--font-size-base);
  }
  
  .card-status {
    font-size: var(--font-size-sm);
  }
  
  .info-label,
  .info-value {
    font-size: var(--font-size-sm);
  }
  
  .btn-transactions,
  .btn-sync {
    font-size: var(--font-size-sm);
    min-width: 100px;
  }
}

/* 모바일 대응 */
@media (max-width: 768px) {
  .card-item {
    padding: var(--spacing-md);
    margin-bottom: var(--spacing-md);
  }
  
  .card-row-layout {
    flex-direction: column;
    gap: var(--spacing-md);
    align-items: stretch;
  }
  
  .card-visual-box {
    align-items: center;
    flex: none;
  }
  
  .visual-card {
    width: 100%;
    max-width: 240px;
    height: 140px;
    min-height: 100px;
    padding: var(--spacing-sm);
  }
  
  .visual-chip {
    width: 18px;
    height: 11px;
    margin-bottom: var(--spacing-sm);
  }
  
  .visual-number {
    font-size: var(--font-size-base);
    margin-top: var(--spacing-xs);
  }
  
  .visual-validity {
    font-size: var(--font-size-xs);
  }
  
  .visual-bottom {
    gap: var(--spacing-xs);
    margin-top: var(--spacing-sm);
    justify-content: center;
  }
  
  .card-name {
    font-size: var(--font-size-base);
    text-align: center;
  }
  
  .card-status {
    font-size: var(--font-size-xs);
  }
  
  .card-info-box {
    gap: var(--spacing-sm);
  }
  
  .card-info-group {
    justify-content: space-between;
    background: var(--color-light);
    padding: var(--spacing-sm);
    border-radius: 8px;
  }
  
  .info-label {
    font-size: var(--font-size-xs);
    min-width: auto;
  }
  
  .info-value {
    font-size: var(--font-size-sm);
  }
  
  .card-actions {
    gap: var(--spacing-sm);
    margin-top: var(--spacing-md);
    justify-content: center;
  }
  
  .btn-transactions,
  .btn-sync {
    font-size: var(--font-size-sm);
    min-width: 100px;
    flex: 1;
  }
}

/* 작은 모바일 */
@media (max-width: 480px) {
  .card-item {
    padding: var(--spacing-sm);
  }
  
  .visual-card {
    max-width: 200px;
    height: 120px;
  }
  
  .visual-chip {
    width: 16px;
    height: 9px;
  }
  
  .visual-number {
    font-size: var(--font-size-sm);
  }
  
  .card-name {
    font-size: var(--font-size-sm);
  }
  
  .card-status {
    font-size: var(--font-size-xs);
  }
  
  .info-label,
  .info-value {
    font-size: var(--font-size-xs);
  }
  
  .btn-transactions,
  .btn-sync {
    font-size: var(--font-size-xs);
    min-width: 80px;
  }
}
</style>
