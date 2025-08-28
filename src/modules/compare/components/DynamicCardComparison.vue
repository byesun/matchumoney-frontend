<template>
  <div class="comparison-container">
    <!-- 상단 카드 헤더 영역 -->
    <template v-if="products.length < 1">
      <div class="please">
        <div class="title">카드 선택 후 비교할 수 있어요!</div>
        <div class="content">
          아래 상자를 터치하여 비교할 카드을 선택해주세요!
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
            <div class="box">
              <img
                :src="p.productImage || '/src/assets/logo_dis.png'"
                class="product-img"
              />
            </div>
            <CompareButton :productId="p.id" :productType="productType" />
          </div>
          <div>
            <div class="product-name">{{ p.finPrdtName }}</div>
            <div class="product-sub">
              {{ p.korCoName }} <span class="tag">{{ p.type }}</span>
            </div>
          </div>
        </div>
        <RouterLink :to="`/detail/card/${p.id}`" class="detail-btn">
          <div>자세히 보기</div>
        </RouterLink>
      </div>

      <!-- 추가 버튼 -->
      <div
        v-if="products.length < 2"
        class="card-header add-placeholder"
        @click="$emit('addProduct')"
      >
        <PlusButton :type="productType" typeKo="카드" />
      </div>
      <div
        v-if="products.length < 1"
        class="card-header add-placeholder"
        @click="$emit('addProduct')"
      >
        <PlusButton :type="productType" typeKo="카드" />
      </div>
    </div>

    <template v-if="products.length > 0">
      <div class="comparison-section">
        <!-- 연회비 -->
        <div class="section-block">
          <div class="section-title">연회비</div>
          <div class="section-values">
            <div v-for="(p, idx) in products" :key="idx" class="mobile-line">
              {{
                p.annualFee
                  .replace(/\[([^\]]+)\]/g, '$1')
                  .replace(/\//g, '\n') || '-'
              }}
            </div>
          </div>
        </div>

        <!-- 전월 실적 -->
        <div class="section-block">
          <div class="section-title">전월 실적</div>
          <div class="section-values">
            <div v-for="(p, idx) in products" :key="idx">
              {{
                p.preMonthMoney
                  ? p.preMonthMoney.toLocaleString() + '원 이상'
                  : '-'
              }}
            </div>
          </div>
        </div>

        <!-- 혜택 -->
        <div class="section-block">
          <div class="section-title">혜택</div>
          <div class="section-values" style="text-align: left">
            <div v-for="(p, idx) in products" :key="idx" class="benefit">
              <div v-for="benefit in p.benefits">
                <div v-if="benefit.value > 0 && benefit.title != '유의사항'">
                  <div class="benefit-title">
                    <span class="title">{{ benefit.title + ' ' }}</span>
                    <span class="tag">{{ '#' + benefit.category }}</span>
                  </div>
                  {{
                    benefit.value >= 100
                      ? benefit.value.toLocaleString() + '원'
                      : benefit.value + '%'
                  }}
                  {{ benefit.benefitType }}

                  {{
                    benefit.maxBenefitMonthly > 0 || benefit.maxBenefitMonthly
                      ? '[최대 ' +
                        benefit.maxBenefitMonthly.toLocaleString() +
                        '원]'
                      : ''
                  }}
                  <br />
                  <br />
                </div>
              </div>
            </div>
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
const productType = ProductType.CARD;

const props = defineProps({
  products: { type: Array, default: () => [] },
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
}

.product-name {
  width: 30vw;
  overflow: auto;
  white-space: nowrap;
  font-weight: 600;
  margin-top: 0.5rem;
  /* 스크롤바 스타일 제거 */
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE 10+ */
}

.product-name::-webkit-scrollbar {
  display: none; /* WebKit (Chrome, Safari) */
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
}
.section-values > .benefit {
  height: 100%;
}
.rate-base {
  color: var(--color-title);
}
.rate-high {
  color: var(--color-accent);
  font-weight: bold;
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
    margin-bottom: var(--spacing-md);
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
  /* background-color: rgb(233, 233, 233);
  border-radius: 50%;
  aspect-ratio: 1/1; */
  margin-bottom: 0.1rem;
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
