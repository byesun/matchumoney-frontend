<template>
  <div class="comparison-container">
    <!-- 상단 카드 헤더 영역 -->
    <template v-if="products.length < 1">
      <div class="please">
        <div class="title">적금 선택 후 비교할 수 있어요!</div>
        <div class="content">
          아래 상자를 터치하여 비교할 적금을 선택해주세요!
        </div>
      </div>
    </template>
    <div class="card-header-row">
      <!-- 실제 상품 카드 -->
      <div v-for="(p, idx) in products" :key="idx" class="card-header">
        <div class="star">
          <FavoriteToggle
            v-model="p.isStarred"
            :productId="p.id"
            :productType="productType"
          />
        </div>
        <div class="product-box">
          <div>
            <img
              :src="p.companyImage || '/src/assets/logo_dis.png'"
              class="product-img"
            />
            <br />
            <CompareButton :productId="p.id" :productType="productType" />
          </div>
          <div>
            <div class="product-name">{{ p.finPrdtName }}</div>
            <div class="product-sub">{{ p.korCoName }}</div>
          </div>
        </div>
        <RouterLink :to="`/detail/saving/${p.id}`" class="detail-btn">
          <div>자세히 보기</div>
        </RouterLink>
      </div>

      <!-- 추가 버튼 -->
      <div
        v-if="products.length < 2"
        class="card-header add-placeholder"
        @click="$emit('addProduct')"
      >
        <PlusButton :type="productType" typeKo="적금" />
      </div>
      <div
        v-if="products.length < 1"
        class="card-header add-placeholder"
        @click="$emit('addProduct')"
      >
        <PlusButton :type="productType" typeKo="적금" />
      </div>
    </div>

    <template v-if="products.length > 0">
      <div class="comparison-section">
        <!-- 가입 방법 -->
        <div class="section-block">
          <div class="section-title">가입 방법</div>
          <div class="section-values">
            <div v-for="(p, idx) in products" :key="idx">
              {{ p.joinWay || '-' }}
            </div>
          </div>
        </div>

        <!-- 가입 대상 -->
        <div class="section-block">
          <div class="section-title">가입 대상</div>
          <div class="section-values">
            <div v-for="(p, idx) in products" :key="idx">
              {{ p.joinMember || '-' }}
            </div>
          </div>
        </div>

        <!-- 가입 한도 -->
        <div class="section-block">
          <div class="section-title">가입 한도</div>
          <div class="section-values">
            <div v-for="(p, idx) in products" :key="idx">
              {{ p.maxLimit ? p.maxLimit.toLocaleString() + '원' : '-' }}
            </div>
          </div>
        </div>

        <!-- 금리 -->
        <div class="section-block" v-for="period in allPeriods" :key="period">
          <div class="section-title">금리 ({{ period }}개월)</div>
          <div class="section-values">
            <!-- ▼ 셀 전체에 하이라이트 적용 -->
            <div
              v-for="(p, idx) in products"
              :key="idx"
              :class="{ 'rate-high-cell': isRateBest(period, idx) }"
            >
              <div>
                기본:
                {{
                  p.rates
                    ?.find((r) => r.period === period)
                    ?.baseRate.toFixed(2) ?? '-'
                }}
              </div>
              <div>
                최고:
                <span
                  :class="{
                    'rate-high': isRateBest(period, idx),
                    'rate-base': !isRateBest(period, idx),
                  }"
                >
                  {{
                    p.rates
                      ?.find((r) => r.period === period)
                      ?.maxRate.toFixed(2) ?? '-'
                  }}
                </span>
                <!-- <span v-if="isRateBest(period, idx)">👑</span> -->
              </div>
            </div>
          </div>
        </div>

        <!-- 우대 조건 -->
        <div class="section-block">
          <div class="section-title">우대 조건</div>
          <div class="section-values">
            <div
              v-for="(p, idx) in products"
              :key="idx"
              :class="[
                'pre-wrap',
                { 'text-left': (p.specialCondition || '').includes('\n') },
              ]"
              v-html="p.specialCondition"
            ></div>
          </div>
        </div>

        <!-- 만기 후 이율 -->
        <div class="section-block">
          <div class="section-title">만기 후 이율</div>
          <div class="section-values">
            <div
              v-for="(p, idx) in products"
              :key="idx"
              v-html="p.maturityInterest"
              :class="[
                'pre-wrap',
                { 'text-left': (p.maturityInterest || '').includes('\n') },
              ]"
            ></div>
          </div>
        </div>

        <!-- 기타사항 -->
        <div class="section-block">
          <div class="section-title">기타사항</div>
          <div class="section-values">
            <div
              v-for="(p, idx) in products"
              :key="idx"
              :class="[
                'pre-wrap',
                { 'text-left': (p.etcNote || '').includes('\n') },
              ]"
              v-html="p.etcNote"
            ></div>
          </div>
        </div>
      </div>
    </template>
    <template v-if="products.length < 1">
      <div class="please">
        <img class="image" src="/src/assets/character_images/turtle.png" />
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import CompareButton from '@/components/common/CompareButton.vue';
import FavoriteToggle from '@/components/common/FavoriteToggle.vue';
import { ProductType } from '@/constants/productTypes';
import PlusButton from './PlusButton.vue';
const productType = ProductType.SAVING;

const props = defineProps({
  products: { type: Array, default: () => [] },
});

const allPeriods = computed(() => {
  const periodSet = new Set();

  props.products.forEach((product) => {
    product.rates?.forEach((rateObj) => {
      if (rateObj?.period) {
        periodSet.add(rateObj.period);
      }
    });
  });

  return Array.from(periodSet).sort((a, b) => a - b);
});

function toNumber(rate) {
  if (typeof rate === 'string') {
    return parseFloat(rate.replace('%', '')) || 0;
  }
  return typeof rate === 'number' ? rate : 0;
}

function isRateBest(period, index) {
  const maxRates = props.products.map((p) => {
    const rateObj = p.rates?.find((r) => r.period === period);
    return toNumber(rateObj?.maxRate);
  });

  const max = Math.max(...maxRates);
  const currentRateObj = props.products[index].rates?.find(
    (r) => r.period === period
  );
  return toNumber(currentRateObj?.maxRate) === max;
}
</script>

<style scoped>
.comparison-container {
  padding: var(--spacing-md);
  border-radius: var(--spacing-md);
}

.card-header-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  position: relative;
  margin-bottom: var(--spacing-sm);
  background-repeat: no-repeat;
}

.card-header-row::before,
.section-values::before {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  left: 50%;
  width: 0.09rem;
  background-color: var(--color-dark-20);
  transform: translateX(-50%);
}

.card-header {
  padding: var(--spacing-md);
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 86%;
  margin: auto;
  text-align: center;
}

.product-img {
  width: 8rem;
  height: 8rem;
  object-fit: contain;
  margin-bottom: 1rem;
}

.product-name {
  width: 30vw;
  overflow: auto;
  white-space: nowrap;
  font-weight: 600;
  scrollbar-width: none;
  -ms-overflow-style: none;
  margin-top: 0.5rem;
}
.product-name::-webkit-scrollbar {
  display: none;
}

.product-sub {
  font-size: var(--font-size-sm);
  color: var(--color-title);
}

.detail-btn {
  width: 94%;
  max-width: 400px;
  background-color: var(--color-accent);
  color: var(--color-white);
  padding: var(--spacing-sm);
  border-radius: var(--spacing-sm);
  margin-top: var(--spacing-sm);
  font-size: var(--font-size-base);
  font-weight: bold;
  border: none;
  cursor: pointer;
  text-decoration: none;
}

.section-block {
  text-align: center;
}
.section-block > div {
  align-items: center;
}
.section-title {
  text-align: center;
  font-weight: bold;
  margin-bottom: var(--spacing-sm);
  background: var(--color-dark-10);
  box-shadow: var(--shadow-sm);
  padding: var(--spacing-sm);
  border-radius: var(--spacing-xs);
}
.title {
  font-size: 1rem;
  font-weight: bold;
}
.section-values {
  display: grid;
  grid-template-columns: 1fr 1fr;
  position: relative;
  margin-bottom: var(--spacing-sm);
  font-size: var(--font-size-base);
  background-repeat: no-repeat;
}

.section-values > div {
  padding: 1rem;
  transition: background-color 0.2s ease, box-shadow 0.2s ease;
}
.section-values > .benefit {
  height: 100%;
}

.rate-base {
  color: var(--color-title);
}
/* ▼ 최고 금리 강조 텍스트 */

/* ▼ 최고 금리 보유 셀 전체 하이라이트 */
.rate-high-cell {
  position: relative;
  border-radius: var(--spacing-xs);
  overflow: hidden;
}

/* 밝고 화사한 골드 배경 */
.rate-high-cell::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    135deg,
    rgba(255, 243, 107, 0.5) 0%,
    /* 더 밝은 레몬 골드 */ rgba(255, 252, 230, 0.5) 20%,
    /* 거의 흰색에 가까운 크림 */ rgba(255, 227, 71, 0.5) 40%,
    /* 채도 높은 골드 */ rgba(255, 252, 230, 0.5) 60%,
    /* 크림 하이라이트 */ rgba(255, 243, 107, 0.5) 80% /* 더 밝은 레몬 골드 */
  );

  background-size: 200% 200%;
  animation: goldShimmer 3s linear infinite;
  z-index: 0;
}

/* 텍스트 강조도 좀 더 강하게 */
.rate-high {
  color: var(--color-accent);
  font-size: var(--font-size-lg);
  font-weight: bold;
  text-shadow: 0 2px 2px rgba(255, 255, 255, 0.85);
}

.rate-high-cell > * {
  position: relative;
  z-index: 2;
}

.product-box {
  width: 90%;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
}

.product-box > div:first-child > * {
  margin: 0 auto;
  display: block;
}

.mobile-line {
  white-space: pre-line;
}

@media (max-width: 640px) {
  .product-img {
    width: 6rem;
    height: 6rem;
    margin-bottom: var(--spacing-xs);
  }
  .product-box {
    gap: var(--spacing-sm);
    justify-content: center;
    align-items: center;
  }
  .card-header {
    padding: var(--spacing-md);
    width: 94%;
  }
}
.star {
  width: 100%;
  text-align: end;
}
.pre-wrap {
  text-align: center;
  white-space: pre-line;
  line-height: 2;
}
.text-left {
  text-align: left;
}

.please {
  text-align: center;
  margin-bottom: var(--spacing-sm);
  padding: var(--spacing-xl);
}
.please > .title {
  font-size: var(--font-size-xl);
  font-weight: bold;
}
.please > .content {
  font-size: var(--font-size-base);
}
.image {
  width: 100%;
  max-width: 240px;
}
.box {
  background-color: rgb(233, 233, 233);
  border-radius: 50%;
  aspect-ratio: 1/1;
}
.tag {
  display: inline-block;
  background-color: #e6f4ec;
  color: #2e7d32;
  align-items: center;
  padding: 0.1rem 0.4rem;
  font-size: 0.8rem;
  font-weight: 600;
  border-radius: 1rem;
}
.benefit-title {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}
</style>
