<template>
  <div class="spending-category-chart">
    <h3 class="chart-title">소비 패턴 분석</h3>
    <div class="total-amount">
      <span class="label">총 소비금액</span>
      <span class="amount">{{ formatCurrency(totalSpendAmount) }}원</span>
    </div>
    
    <div class="category-list">
      <div
        v-for="(category, index) in sortedCategories"
        :key="category.category"
        class="category-item"
        :class="{ 'top-category': index < 3 }"
      >
        <div class="category-header">
          <div class="category-info">
            <span class="category-name">{{ category.category }}</span>
            <span class="category-count">{{ category.transactionCount }}건</span>
          </div>
          <div class="category-amount">
            <span class="amount">{{ formatCurrency(category.totalAmount) }}원</span>
            <span class="percentage">{{ calculatePercentage(category.totalAmount) }}%</span>
          </div>
        </div>
        
        <div class="progress-bar">
          <div
            class="progress-fill"
            :style="{ width: calculatePercentage(category.totalAmount) + '%' }"
            :class="getCategoryColorClass(index)"
          ></div>
        </div>
        
        <div class="category-details">
          <span class="avg-amount">평균 {{ formatCurrency(category.averageAmount) }}원</span>
        </div>
      </div>
    </div>
    
    <div class="chart-summary" v-if="topCategories.length > 0">
      <h4>주요 소비 카테고리</h4>
      <p>
        가장 많이 소비하는 분야는 
        <strong>{{ topCategories[0].category }}</strong>이며,
        전체 소비의 <strong>{{ calculatePercentage(topCategories[0].totalAmount) }}%</strong>를 차지합니다.
      </p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SpendingCategoryChart',
  props: {
    categoryStats: {
      type: Array,
      default: () => []
    },
    totalSpendAmount: {
      type: Number,
      default: 0
    }
  },
  computed: {
    sortedCategories() {
      return [...this.categoryStats].sort((a, b) => b.totalAmount - a.totalAmount);
    },
    
    topCategories() {
      return this.sortedCategories.slice(0, 3);
    },
    
    actualTotalAmount() {
      return this.categoryStats.reduce((sum, cat) => sum + cat.totalAmount, 0);
    }
  },
  methods: {
    formatCurrency(amount) {
      if (!amount) return '0';
      return Math.round(amount).toLocaleString();
    },
    
    calculatePercentage(amount) {
      const total = this.actualTotalAmount || 1;
      return Math.round((amount / total) * 100);
    },
    
    getCategoryColorClass(index) {
      const colors = ['primary', 'secondary', 'tertiary', 'quaternary', 'quinary'];
      return `color-${colors[index % colors.length]}`;
    }
  }
};
</script>

<style scoped>
.spending-category-chart {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.chart-title {
  font-size: 20px;
  font-weight: 700;
  color: #333;
  margin: 0 0 16px 0;
}

.total-amount {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 8px;
  margin-bottom: 24px;
  color: white;
}

.total-amount .label {
  font-size: 14px;
  opacity: 0.9;
}

.total-amount .amount {
  font-size: 24px;
  font-weight: 700;
}

.category-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.category-item {
  padding: 16px;
  border-radius: 8px;
  background: #f8f9fa;
  transition: all 0.2s ease;
}

.category-item.top-category {
  background: linear-gradient(135deg, #f8f9fa 0%, #e3f2fd 100%);
  border: 1px solid #e3f2fd;
}

.category-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
}

.category-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.category-name {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.category-count {
  font-size: 12px;
  color: #666;
}

.category-amount {
  text-align: right;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.category-amount .amount {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.category-amount .percentage {
  font-size: 12px;
  color: #666;
}

.progress-bar {
  height: 6px;
  background: #e0e0e0;
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 8px;
}

.progress-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.3s ease;
}

.color-primary { background: #2196f3; }
.color-secondary { background: #4caf50; }
.color-tertiary { background: #ff9800; }
.color-quaternary { background: #9c27b0; }
.color-quinary { background: #607d8b; }

.category-details {
  display: flex;
  justify-content: flex-end;
}

.avg-amount {
  font-size: 12px;
  color: #666;
}

.chart-summary {
  margin-top: 24px;
  padding: 16px;
  background: #f0f7ff;
  border-radius: 8px;
  border-left: 4px solid #2196f3;
}

.chart-summary h4 {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0 0 8px 0;
}

.chart-summary p {
  font-size: 14px;
  color: #555;
  margin: 0;
  line-height: 1.5;
}

@media (max-width: 768px) {
  .spending-category-chart {
    padding: 16px;
  }
  
  .total-amount {
    flex-direction: column;
    gap: 8px;
    text-align: center;
  }
  
  .category-header {
    flex-direction: column;
    gap: 8px;
  }
  
  .category-amount {
    text-align: left;
  }
}
</style>