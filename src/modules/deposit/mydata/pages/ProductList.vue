<template>
  <div class="product-section">
    <!-- 상품 리스트 -->
    <section class="products-section" v-if="hasSearched">
      <div v-if="loading" class="loading">
        <div class="spinner"></div>
        <div v-if="isKbOnly">KB국민은행 상품을 찾고 있습니다...</div>
        <div v-else>맞춤 상품을 찾고 있습니다...</div>
      </div>
      <div
        v-for="(product, index) in topProducts"
        :key="product.depositProductId || product.productName || index"
        class="recommendation-item"
        :class="{ 'top-recommendation': index === 0 }"
        @click="navigateToDetail(product)"
        :style="{ animationDelay: `${index * 0.1}s` }"
      >
        <!-- 랭킹 배지 -->
        <div class="rank-badge">{{ index + 1 }}</div>
        <!-- 즐겨찾기 버튼을 오른쪽 상단으로 이동 -->
        <div class="favorite-button-container">
          <FavoriteToggle
            :productId="product.depositProductId"
            :productType="ProductType.DEPOSIT"
            :modelValue="Boolean(product.favorite)"
            @update:modelValue="(value) => handleFavoriteToggle(product, value)"
          />
        </div>

        <div class="product-card-horizontal">
          <!-- 왼쪽: 로고 -->
          <div class="bank-logo-container">
            <img :src="getBankLogo(product.bankName)" alt="은행 로고" />
            <!-- 수정 후 -->
            <div class="button-container">
              <LikeToggle
                :productId="product.depositProductId"
                productType="deposit-products"
                :initialLiked="product.liked"
                :initialCount="product.likeCount"
                @update="
                  ({ liked, count }) => {
                    product.liked = liked;
                    product.likeCount = count;
                  }
                "
                @click.stop
              />
              <CompareButton
                :productId="product.depositProductId"
                :productType="ProductType.DEPOSIT"
                @click.stop
              />
            </div>
          </div>

          <!-- 가운데: 은행명 + 상품명 -->
          <div class="product-name-block">
            <div class="product-name-bold">{{ product.productName }}</div>
            <div class="bank-name-bold">{{ product.bankName }}</div>

            <div class="rate-info">
              <div class="term">{{ product.maxSaveTrm }}개월</div>
              <div class="rate-values">
                <span class="label-bold">최고 금리:</span>
                <span class="highlight-rate">{{ product.maxIntrRate2 }}%</span>
                <span class="base-rate"
                  >/ 기준 금리: {{ product.maxIntrRate }}%</span
                >
              </div>
            </div>

            <div class="rate-line">
              최소 가입 금액 : {{ product.minAmount }}
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import FavoriteToggle from '@/components/common/FavoriteToggle.vue';
import { ProductType } from '@/constants/productTypes';
import CompareButton from '@/components/common/CompareButton.vue';
import LikeToggle from '@/components/common/LikeToggle.vue';
import api from '@/api';

const router = useRouter();

// Props
const props = defineProps({
  products: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
  hasSearched: {
    type: Boolean,
    default: false,
  },
  customerName: {
    type: String,
    default: '고객',
  },
  balance: {
    type: String,
    default: '',
  },
  isKbOnly: {
    type: Boolean,
    default: false,
  },
});

// Emits
const emit = defineEmits(['productSelect', 'favoriteChanged']);

// 🆕 사용자 ID 가져오기
const getUserId = () => {
  try {
    const userId = sessionStorage.getItem('userId');
    return userId ? Number(userId) : null;
  } catch (e) {
    return null;
  }
};

// 즐겨찾기 토글 처리
const handleFavoriteToggle = (product, value) => {
  // 상품 객체의 즐겨찾기 상태 업데이트
  product.favorite = !!value;

  emit('favoriteChanged', product.depositProductId, value);
};

// 즐겨찾기 변경 이벤트 처리 (하위 호환성)
const handleFavoriteChanged = (productId, isStarred) => {
  console.log('즐겨찾기 변경 감지:', { productId, isStarred });
  emit('favoriteChanged', productId, isStarred);
};

// 상세페이지 이동 함수
const navigateToDetail = (product) => {
  if (product.depositProductId) {
    router.push(`/detail/deposit/${product.depositProductId}`);
  }
};

// 상위 5개 상품만 표시하는 computed
const topProducts = computed(() => {
  return props.products.slice(0, 5);
});

// 은행 로고 가져오기 함수
const getBankLogo = (bankName) => {
  const busanLogo = new URL(
    '@/assets/bank-Logos/BK_BUSAN_Profile.png',
    import.meta.url
  ).href;
  const hanaLogo = new URL(
    '@/assets/bank-Logos/BK_HANA_Profile.png',
    import.meta.url
  ).href;

  const logoMap = {
    국민은행: new URL('@/assets/bank-Logos/BK_KB_Profile.png', import.meta.url)
      .href,
    하나은행: hanaLogo,
    농협은행주식회사: new URL(
      '@/assets/bank-Logos/BK_NH_Profile.png',
      import.meta.url
    ).href,
    신한은행: new URL(
      '@/assets/bank-Logos/BK_Shinhan_Profile.png',
      import.meta.url
    ).href,
    우리은행: new URL(
      '@/assets/bank-Logos/BK_Woori_Profile.png',
      import.meta.url
    ).href,
    중소기업은행: new URL(
      '@/assets/bank-Logos/BK_IBK_Profile.png',
      import.meta.url
    ).href,
    한국산업은행: new URL(
      '@/assets/bank-Logos/BK_KDB_Profile.png',
      import.meta.url
    ).href,
    수협은행: new URL('@/assets/bank-Logos/BK_SH_Profile.png', import.meta.url)
      .href,
    경남은행: busanLogo,
    부산은행: busanLogo,
    광주은행: new URL(
      '@/assets/bank-Logos/BK_KWANGJU_Profile.png',
      import.meta.url
    ).href,
    전북은행: new URL(
      '@/assets/bank-Logos/BK_JEONBUK_Profile.png',
      import.meta.url
    ).href,
    제주은행: new URL(
      '@/assets/bank-Logos/BK_JEJU_Profile.png',
      import.meta.url
    ).href,
    아이엠뱅크: new URL(
      '@/assets/bank-Logos/BK_DAEGU_Profile.png',
      import.meta.url
    ).href,
    한국스탠다드차타드은행: new URL(
      '@/assets/bank-Logos/BK_SC_Profile.png',
      import.meta.url
    ).href,
    '주식회사 카카오뱅크': new URL(
      '@/assets/bank-Logos/BK_KAKAO_Profile.png',
      import.meta.url
    ).href,
    '주식회사 케이뱅크': new URL(
      '@/assets/bank-Logos/BK_K_Profile.png',
      import.meta.url
    ).href,
    '토스뱅크 주식회사': new URL(
      '@/assets/bank-Logos/BK_TOSS_Profile.png',
      import.meta.url
    ).href,
    '주식회사 하나은행': hanaLogo,
  };

  return logoMap[bankName] || '';
};
</script>

<style scoped>
.kb-only-message {
  color: var(--color-accent);
  font-weight: bold;
  padding: 1rem 1.4rem;
  border-radius: 1rem;
  margin-bottom: 1rem;
  background-color: rgb(255, 255, 255);
  border: 0.1rem solid var(--color-light);
  border-left: 0.4rem solid var(--color-accent);
  box-shadow: var(--shadow-card);
}

.kb-only-text {
  font-size: var(--font-size-base);
  font-weight: 700;
  color: var(--color-accent);
  display: flex;
  align-items: center;
  gap: 10px;
  text-align: center;
  justify-content: center;
}

.no-results-message {
  background: var(--color-error-light);
  padding: 16px 20px;
  border-radius: 12px;
  margin-bottom: 25px;
  border-left: 4px solid var(--color-error);
  box-shadow: 0 2px 8px var(--color-error-20);
}

.no-results-text {
  font-size: 15px;
  font-weight: 600;
  color: var(--color-error-dark);
  display: flex;
  align-items: center;
  gap: 10px;
  text-align: center;
  justify-content: center;
}

.sad-icon {
  font-size: 18px;
}

.recommendation-message {
  background: var(--color-white);
  box-shadow: var(--shadow-card);
  padding: 16px 20px;
  border-radius: 12px;
  margin-bottom: 25px;
  border: 0.1rem solid var(--color-light);
  border-left: 0.4rem solid var(--color-accent);
  box-shadow: var(--shadow-card);
}

.recommendation-text {
  font-size: var(--font-size-base);
  font-weight: 700;
  color: var(--color-accent);
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: center;
}

.products-section h3 {
  font-size: 16px;
  font-weight: 700;
  color: var(--color-title);
  margin-bottom: 20px;
}

.product-list {
  display: grid;
  grid-template-columns: 1fr;
  gap: 15px;
}

.recommendation-item {
  display: flex;
  align-items: stretch;
  gap: var(--spacing-lg);
  padding: var(--spacing-lg);
  border: 1px solid var(--border-light);
  border-radius: 12px;
  position: relative;
  transition: all 0.2s ease;
  background: var(--bg-card, var(--color-light));
  min-height: 110px;
  cursor: pointer;
  margin-bottom: 1rem;
}

.recommendation-item:hover {
  border-color: var(--color-accent);
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}
.top-recommendation {
  border-color: var(--color-warning, #ffd700);
  background: linear-gradient(
    135deg,
    var(--color-warning-light, rgba(255, 215, 0, 0.15)) 0%,
    var(--bg-card, var(--color-light)) 100%
  );
}

.rank-badge {
  position: absolute;
  top: calc(-1 * var(--spacing-sm, 8px));
  left: calc(-1 * var(--spacing-sm, 8px));
  width: 32px;
  height: 32px;
  background: var(--color-accent);
  color: var(--color-white, white);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-sm);
  font-weight: 700;
  box-shadow: var(--shadow-md);
  border: 2px solid var(--bg-card, var(--color-light));
}

.top-recommendation .rank-badge {
  background: var(--color-warning, #ffd700);
  color: var(--color-white);
}

.product-card-horizontal {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.bank-logo-container {
  flex-shrink: 0;
  display: flex;
  flex-direction: column; /* 자식들을 세로 방향으로 배치 */
  align-items: center; /* 가로 가운데 정렬 */
  gap: 0.5rem; /* 로고와 버튼 그룹 간격 */
  width: 12rem;
  height: auto;
}

.bank-logo-container img {
  width: 5rem;
  height: 5rem;
  object-fit: contain;
  border-radius: 50%;
  background: var(--color-white);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-light);
}

.product-name-block {
  flex: 1;
  padding: 0 16px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.bank-name-bold {
  font-size: var(--font-size-base);
  font-weight: 500;
  color: var(--color-dark);
  margin-bottom: 2px;
}

.product-name-bold {
  font-size: var(--font-size-xl);
  font-weight: 700;
  color: var(--text-primary);
}

.rate-line {
  font-size: 12px;
  color: var(--text-secondary);
  margin-bottom: 2px;
}

.loading {
  text-align: center;
  padding: 40px;
  color: var(--color-title);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--color-gray-100);
  border-top: 3px solid var(--color-accent);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 15px;
}

.star-container {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 10px;
  flex-shrink: 0;
}

.rate-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm); /* 항목 사이 간격 */
  font-size: var(--font-size-sm);
}

.term {
  padding: 2px 6px;
  border-radius: 4px;
  font-size: var(--font-size-base);
  white-space: nowrap;
  border-radius: 0.4rem;
  font-weight: bold;
  background: var(--color-info-light);
  color: var(--color-info-dark);
}

.rate-values {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  flex-wrap: wrap; /* 필요시 줄바꿈 허용 */
}

.label-bold {
  font-weight: bold;
  font-size: var(--font-size-base);
  color: var(--text-primary);
}

.highlight-rate {
  font-weight: bold;
  color: var(--color-accent);
  font-size: var(--font-size-xl);
}

.base-rate {
  color: var(--text-secondary);
  font-size: var(--font-size-base);
}

.favorite-button-container {
  position: absolute;
  top: 20%;
  right: 3%;
  transform: translateY(-50%);
  z-index: 10;
}

.reaction-button {
  background-color: #f1f1f1;
  border: none;
  border-radius: 20px;
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 600;
  color: #333;
  cursor: pointer;
  transition: background-color 0.2s ease;
}
.reaction-button:hover {
  background-color: #e0e0e0;
}

.reaction-button.active {
  background-color: #ffe6e6;
  color: red;
}
.button-container {
  display: flex;
  gap: 0.2rem;
  margin-top: 0.2rem;
  align-items: center;
  justify-content: center;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.fade-in {
  animation: fadeIn 0.5s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.slide-up {
  animation: slideUp 0.6s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 430px) {
  .recommendation-item {
    min-height: 140px; /* 최소 높이 설정 */
    align-items: center; /* 카드 내 요소들 세로 가운데 정렬 */
  }
  .product-card-horizontal {
    gap: 8px;
    align-items: center; /* stretch를 center로 변경 */
    height: 100%;
  }

  .bank-logo-container {
    width: 8rem;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.3rem;
  }
  .button-container {
    display: flex; /* initial에서 flex로 변경 */
    flex-direction: column; /* 추가 */
    align-items: center; /* 추가 */
    justify-content: center; /* 추가 */
    gap: 0.2rem;
  }
  .bank-logo-container img {
    width: 6rem;
    height: 6rem;
  }

  .product-name-block {
    padding: 0 8px;
  }

  .kb-only-text,
  .no-results-text {
    font-size: var(--font-size-base);
  }

  .rate-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 0rem;
  }

  .rate-values {
    gap: 0.2rem;
  }
}

@media (min-width: 1200px) {
  .product-list {
    grid-template-columns: 1fr;
    gap: 20px;
  }
}
</style>
