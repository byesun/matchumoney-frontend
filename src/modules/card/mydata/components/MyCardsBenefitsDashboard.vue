<template>
  <div class="my-cards-benefits-dashboard">
    <div class="dashboard-header">
      <h2>보유 카드 혜택 요약</h2>
      <button @click="refreshData" class="btn-refresh" :disabled="loading">
        <span v-if="loading">🔄</span>
        <span v-else>새로고침</span>
      </button>
    </div>

    <div v-if="loading" class="loading-state">
      <BaseSpinner />
      <p>카드 혜택을 분석하고 있습니다...</p>
    </div>

    <div v-else-if="error" class="error-state">
      <p>{{ error }}</p>
      <BaseButton @click="refreshData">다시 시도</BaseButton>
    </div>

    <div v-else-if="cardsBenefits.length === 0" class="empty-state">
      <h3>보유 카드가 없습니다</h3>
      <p>카드를 등록하고 거래내역을 동기화해보세요.</p>
      <RouterLink to="/mydata/cards" class="btn-link">
        카드 등록하러 가기
      </RouterLink>
    </div>

    <div v-else class="cards-grid">
      <div
        v-for="cardBenefit in cardsBenefits"
        :key="cardBenefit.ownedCardBenefits[0]?.cardId"
        class="card-benefit-item"
        @click="goToRecommendation(cardBenefit.ownedCardBenefits[0]?.cardId)"
      >
        <div class="card-header">
          <div class="card-info">
            <img
              :src="cardBenefit.ownedCardBenefits[0]?.cardImageUrl"
              :alt="cardBenefit.ownedCardBenefits[0]?.cardName"
              class="card-image"
              @error="handleImageError"
            />
            <div class="card-details">
              <h3 class="card-name">{{ cardBenefit.ownedCardBenefits[0]?.cardName }}</h3>
              <p class="card-issuer">{{ cardBenefit.ownedCardBenefits[0]?.issuer }}</p>
            </div>
          </div>
          <div class="benefit-amount">
            <span class="benefit-value">
              {{ formatCurrency(cardBenefit.ownedCardBenefits[0]?.estimatedBenefit) }}원
            </span>
            <span class="benefit-label">예상 혜택</span>
          </div>
        </div>

        <div class="spending-summary">
          <div class="summary-item">
            <span class="label">총 소비금액</span>
            <span class="value">{{ formatCurrency(cardBenefit.totalSpendAmount) }}원</span>
          </div>
          <div class="summary-item">
            <span class="label">주요 카테고리</span>
            <span class="value">{{ getTopCategory(cardBenefit.categoryStats) }}</span>
          </div>
        </div>

        <div class="action-button">
          <span class="btn-text">추천 카드 보기</span>
          <span class="arrow">→</span>
        </div>
      </div>
    </div>

    <!-- 전체 요약 -->
    <div v-if="cardsBenefits.length > 0" class="summary-section">
      <div class="summary-card">
        <h3>전체 요약</h3>
        <div class="summary-stats">
          <div class="stat">
            <span class="stat-value">{{ cardsBenefits.length }}</span>
            <span class="stat-label">보유 카드</span>
          </div>
          <div class="stat">
            <span class="stat-value">{{ formatCurrency(totalSpendAmount) }}원</span>
            <span class="stat-label">총 소비금액</span>
          </div>
          <div class="stat">
            <span class="stat-value">{{ formatCurrency(totalBenefitAmount) }}원</span>
            <span class="stat-label">총 예상혜택</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import BaseSpinner from '@/components/base/BaseSpinner.vue';
import BaseButton from '@/components/base/BaseButton.vue';
import cardsApi from '@/api/cards.js';

export default {
  name: 'MyCardsBenefitsDashboard',
  components: {
    BaseSpinner,
    BaseButton,
  },
  data() {
    return {
      loading: false,
      error: null,
      cardsBenefits: [],
    };
  },
  computed: {
    totalSpendAmount() {
      return this.cardsBenefits.reduce((sum, card) => sum + (card.totalSpendAmount || 0), 0);
    },
    
    totalBenefitAmount() {
      return this.cardsBenefits.reduce((sum, card) => {
        const benefit = card.ownedCardBenefits[0]?.estimatedBenefit || 0;
        return sum + benefit;
      }, 0);
    },
  },
  async mounted() {
    await this.loadData();
  },
  methods: {
    async loadData() {
      try {
        this.loading = true;
        this.error = null;
        
        const response = await cardsApi.getMyCardsBenefits();
        this.cardsBenefits = response.data || response || [];
        
      } catch (error) {
        console.error('카드 혜택 데이터 로딩 실패:', error);
        this.error = error.message || '데이터를 불러오는데 실패했습니다.';
      } finally {
        this.loading = false;
      }
    },

    async refreshData() {
      await this.loadData();
    },

    formatCurrency(amount) {
      if (!amount) return '0';
      return Number(amount).toLocaleString();
    },

    getTopCategory(categoryStats) {
      if (!categoryStats || categoryStats.length === 0) return '없음';
      const sorted = [...categoryStats].sort((a, b) => b.totalAmount - a.totalAmount);
      return sorted[0]?.category || '없음';
    },

    handleImageError(event) {
      event.target.src = '/logo.png';
    },

    goToRecommendation(cardId) {
      if (cardId) {
        this.$router.push({
          name: 'CardRecommendation',
          params: { cardId: cardId.toString() }
        });
      }
    },
  },
};
</script>

<style scoped>
.my-cards-benefits-dashboard {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.dashboard-header h2 {
  font-size: 24px;
  font-weight: 700;
  color: #333;
  margin: 0;
}

.btn-refresh {
  padding: 8px 16px;
  background: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s ease;
}

.btn-refresh:hover:not(:disabled) {
  background: #e9e9e9;
}

.btn-refresh:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.loading-state, .error-state, .empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 64px 24px;
  text-align: center;
}

.empty-state h3 {
  color: #666;
  margin-bottom: 8px;
}

.empty-state p {
  color: #999;
  margin-bottom: 24px;
}

.btn-link {
  display: inline-block;
  padding: 12px 24px;
  background: #2196f3;
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 500;
  transition: background-color 0.2s ease;
}

.btn-link:hover {
  background: #1976d2;
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
}

.card-benefit-item {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.2s ease;
}

.card-benefit-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.card-info {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
}

.card-image {
  width: 60px;
  height: 38px;
  object-fit: cover;
  border-radius: 6px;
  background: #f5f5f5;
}

.card-details {
  flex: 1;
  min-width: 0;
}

.card-name {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0 0 4px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-issuer {
  font-size: 12px;
  color: #666;
  margin: 0;
}

.benefit-amount {
  text-align: right;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.benefit-value {
  font-size: 18px;
  font-weight: 700;
  color: #4caf50;
}

.benefit-label {
  font-size: 12px;
  color: #666;
}

.spending-summary {
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  border-top: 1px solid #f0f0f0;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 16px;
}

.summary-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.summary-item .label {
  font-size: 12px;
  color: #666;
}

.summary-item .value {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.action-button {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #2196f3;
  font-weight: 500;
}

.arrow {
  font-size: 18px;
  transition: transform 0.2s ease;
}

.card-benefit-item:hover .arrow {
  transform: translateX(4px);
}

.summary-section {
  margin-top: 32px;
}

.summary-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.summary-card h3 {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin: 0 0 16px 0;
}

.summary-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 24px;
}

.stat {
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #2196f3;
}

.stat-label {
  font-size: 14px;
  color: #666;
}

@media (max-width: 768px) {
  .my-cards-benefits-dashboard {
    padding: 16px;
  }
  
  .cards-grid {
    grid-template-columns: 1fr;
  }
  
  .dashboard-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  
  .summary-stats {
    grid-template-columns: 1fr;
  }
}
</style>