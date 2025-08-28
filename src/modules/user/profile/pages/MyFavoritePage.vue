<template>
  <div class="my-favorite-page">
    <main class="main-content">
      <h1 class="page-title">즐겨찾기한 상품</h1>

      <hr />
      <div class="tab-selector">
        <BaseButton
          :class="['tab-btn', { 'tab-btn--active': selectedTab === 'deposit' }]"
          @click="selectedTab = 'deposit'"
        >
          예금
        </BaseButton>
        <BaseButton
          :class="['tab-btn', { 'tab-btn--active': selectedTab === 'saving' }]"
          @click="selectedTab = 'saving'"
        >
          적금
        </BaseButton>
        <BaseButton
          :class="['tab-btn', { 'tab-btn--active': selectedTab === 'card' }]"
          @click="selectedTab = 'card'"
        >
          카드
        </BaseButton>
      </div>

      <section class="search-results" :key="selectedTab">
        <div v-if="loading" class="loading-state">
          <div class="spinner"></div>
          <div>상품을 불러오는 중입니다...</div>
        </div>
        <div
          v-else-if="!allFavorites?.length || !filteredFavorites?.length"
          class="empty-state"
        >
          <div class="empty-icon">📭</div>
          <div>즐겨찾기한 상품이 없습니다.</div>
        </div>
        <div v-else>
          <div v-if="currentTab === 'deposit'" class="search-results-grid">
            <div
              v-for="deposit in filteredFavorites"
              :key="deposit.depositId"
              class="product-card"
            >
              <div class="favorite-button" @click.stop>
                <FavoriteToggle
                  v-model="deposit.isStarred"
                  :productId="deposit.depositId"
                  :productType="'DEPOSIT'"
                />
              </div>
              <div class="product-card-row" @click="selectProduct(deposit)">
                <div class="bank-logo-container">
                  <img
                    :src="getBankLogo(deposit.bankName)"
                    alt="은행 로고"
                    class="bank-logo-round"
                  />
                  <div class="compare-button" @click.stop>
                    <LikeToggle
                      :productId="deposit.depositId"
                      productType="deposit-products"
                      :initialLiked="deposit.isLiked"
                      :initialCount="deposit.likeCount"
                      @update="
                        ({ liked, count }) => {
                          deposit.isLiked = liked;
                          deposit.likeCount = count;
                        }
                      "
                    />
                    <CompareButton
                      :productId="deposit.depositId"
                      productType="DEPOSIT"
                    />
                  </div>
                </div>
                <div class="product-info-column">
                  <div class="product-name-bold">{{ deposit.productName }}</div>
                  <div class="bank-name-bold">{{ deposit.bankName }}</div>
                  <div class="rate-line">
                    <span class="label-bold">최고 금리 :&nbsp;</span>
                    <span class="highlight-rate">{{ deposit.maxRate }}%</span>
                  </div>
                  <div class="rate-line">
                    <span class="label-bold">최저 금리 :&nbsp;</span>
                    <span>{{ deposit.basicRate }}%</span>
                  </div>
                  <div class="rate-line">
                    기준 기간 :
                    {{
                      filters.term !== '전체'
                        ? filters.term + '개월'
                        : (() => {
                            const best = product.depositOptions?.reduce(
                              (prev, curr) => {
                                const prevRate = prev?.intrRate2 ?? 0;
                                const currRate = curr?.intrRate2 ?? 0;
                                return currRate > prevRate ? curr : prev;
                              },
                              null
                            );
                            return best?.saveTrm
                              ? best.saveTrm + '개월'
                              : '정보 없음';
                          })()
                    }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-else-if="currentTab === 'saving'" class="search-results-grid">
            <div
              v-for="saving in filteredFavorites"
              :key="saving.savingId"
              class="product-card"
            >
              <div class="favorite-button" @click.stop>
                <FavoriteToggle
                  v-model="saving.isStarred"
                  :productId="saving.savingId"
                  productType="SAVING"
                />
              </div>
              <div class="product-card-row" @click="selectProduct(saving)">
                <div class="bank-logo-container">
                  <img
                    :src="getBankLogo(saving.bankName)"
                    alt="은행 로고"
                    class="bank-logo-round"
                  />
                  <div class="compare-button" @click.stop>
                    <LikeToggle
                      :productId="saving.savingId"
                      productType="saving-products"
                      :initialLiked="saving.isLiked"
                      :initialCount="saving.likeCount"
                      @update="
                        ({ liked, count }) => {
                          saving.isLiked = liked;
                          saving.likeCount = count;
                        }
                      "
                    />
                    <CompareButton
                      :productId="saving.savingId"
                      productType="SAVING"
                    />
                  </div>
                </div>
                <div class="product-info-column">
                  <div class="product-name-bold">{{ saving.savingName }}</div>
                  <div class="bank-name-bold">{{ saving.bankName }}</div>
                  <div class="rate-line">
                    <span class="label-bold">최고 금리 :&nbsp;</span>
                    <span class="highlight-rate">{{ saving.maxRate }}%</span>
                  </div>
                  <div class="rate-line">
                    <span class="label-bold">최저 금리 :&nbsp;</span>
                    <span>{{ saving.basicRate }}%</span>
                  </div>
                  <div class="rate-line no-wrap">
                    매월 최대 금액 :
                    {{
                      saving.maxLimit === '999999999'
                        ? '한도 없음'
                        : formatCurrency(saving.maxLimit)
                    }}
                  </div>
                  <div class="rate-line">
                    기준 기간 :
                    {{
                      filters.term !== '전체'
                        ? filters.term + '개월'
                        : (() => {
                            const best = saving.savingOptions?.reduce(
                              (prev, curr) => {
                                const prevRate = prev?.intrRate2 ?? 0;
                                const currRate = curr?.intrRate2 ?? 0;
                                return currRate > prevRate ? curr : prev;
                              },
                              null
                            );
                            return best?.saveTrm
                              ? best.saveTrm + '개월'
                              : '정보 없음';
                          })()
                    }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div
            v-else-if="currentTab === 'card'"
            class="card-search-results-grid"
          >
            <div
              v-for="card in filteredFavorites"
              :key="card.cardId"
              class="card-product-card"
              @click="selectProduct(card)"
            >
              <div class="card-favorite-button" @click.stop>
                <FavoriteToggle
                  v-model="card.isStarred"
                  :productId="card.cardId"
                  :productType="'CARD'"
                />
              </div>
              <div class="product-content">
                <div class="card-left-section">
                  <img
                    :src="
                      card.cardImageUrl ||
                      card.cardImageUrl ||
                      getBankLogo('default')
                    "
                    :alt="card.name || card.cardName"
                    class="product-image"
                  />
                  <div class="card-compare-button" @click.stop>
                    <div class="like-fix">
                      <LikeToggle
                        :productId="card.id"
                        productType="card-products"
                        :initialLiked="card.isLiked"
                        :initialCount="card.likeCount"
                        @update="
                          ({ liked, count }) => {
                            card.isLiked = liked;
                            card.likeCount = count;
                          }
                        "
                      />
                    </div>
                    <CompareButton
                      :card="card.id || card.cardId"
                      productType="CARD"
                    />
                  </div>
                </div>
                <div class="product-info">
                  <h4>{{ card.name || card.cardName }}</h4>
                  <div>
                    <span class="label">카드사:</span>
                    {{ card.issuer || '카드사 미정' }}
                  </div>
                  <div>
                    <span class="label">전월실적금액:</span>
                    {{
                      card.preMonthMoney
                        ? card.preMonthMoney.toLocaleString() + '원'
                        : '정보 없음'
                    }}
                  </div>
                  <div>
                    <span class="label">연회비 정보:</span>
                    {{
                      card.annualFee
                        ? card.annualFee.replace(/\[([^\]]+)\]/g, '$1')
                        : '정보 없음'
                    }}
                  </div>
                  <!-- 혜택 태그 -->
                  <div
                    v-if="card.options && card.options.length > 0"
                    class="benefit-hashtags"
                  >
                    <span
                      v-for="(option, index) in card.options.slice(0, 3)"
                      :key="index"
                      class="hashtag"
                    >
                      #{{ option.title }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';

import BaseButton from '@/components/base/BaseButton.vue';
import CompareButton from '@/components/common/CompareButton.vue';
import FavoriteToggle from '@/components/common/FavoriteToggle.vue';
import LikeToggle from '@/components/common/LikeToggle.vue';
import favoriteAPI from '@/api/favorite';

/* ───────────────── Router & Route ───────────────── */
const route = useRoute();
const router = useRouter();

/* ───────────────── State ───────────────── */
const selectedTab = ref('deposit');
const currentTab = selectedTab;

const loading = ref(false);
const allFavorites = ref([]);

/* ───────────────── Derived ───────────────── */
const filteredFavorites = computed(() => {
  return allFavorites.value.filter((p) => p.type === currentTab.value);
});

/* ───────────────── Initialize tab from URL ───────────────── */
const tabFromQuery = route.query.tab;
if (
  tabFromQuery === 'deposit' ||
  tabFromQuery === 'saving' ||
  tabFromQuery === 'card'
) {
  selectedTab.value = tabFromQuery;
}

/* ───────────────── Navigation ───────────────── */
const goToDepositDetail = (id) => {
  router.push(`/detail/deposit/${id}`);
};

const goToSavingDetail = (id) => {
  router.push(`/detail/saving/${id}`);
};

const goToCardDetail = (id) => {
  router.push(`/detail/card/${id}`);
};

/* ───────────────── Watchers ───────────────── */
watch(selectedTab, (v) => {
  router.replace({ query: { ...route.query, tab: v } });
});

/* ───────────────── Utils ───────────────── */
const getBankLogo = (bankName) => {
  const busanLogo = new URL(
    '@/assets/bank-Logos/BK_BUSAN_Profile.png',
    import.meta.url
  ).href;
  const hanaLogo = new URL(
    '@/assets/bank-Logos/BK_HANA_Profile.png',
    import.meta.url
  ).href;
  const defaultLogo = new URL('@/assets/logo_dis.png', import.meta.url).href;

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

  return logoMap[bankName] || defaultLogo;
};

/* ───────────────── Lifecycle ───────────────── */
onMounted(async () => {
  const qTab = route.query.tab;
  if (qTab === 'deposit' || qTab === 'saving' || qTab === 'card') {
    selectedTab.value = qTab;
  }

  console.log('[MyFavoritePage] onMounted triggered');
  loading.value = true;

  try {
    const res = await favoriteAPI.getFavoriteProducts();
    console.log('[MyFavoritePage] API response:', res);

    allFavorites.value = [
      ...(res.depositList ?? []).map((d) => ({
        ...d,
        type: 'deposit',
        name: d.productName || d.finPrdtNm,
        bank: d.bankName || d.korCoNm,
        bankInitial: d.bankInitial || '',
        productName: d.productName || d.finPrdtNm,
        bankName: d.bankName || d.korCoNm,
        depositId: d.depositId,
        basicRate: d.basicRate,
        maxRate: d.maxRate,
        term: d.term || null,
        isStarred: d.isStarred ?? false,
        isLiked: d.isLiked ?? false,
        likeCount: d.likeCount ?? 0,
      })),
      ...(res.savingList ?? []).map((s) => ({
        ...s,
        type: 'saving',
        name: s.savingName || s.finPrdtNm,
        bank: s.bankName || s.korCoNm,
        bankInitial: s.bankInitial || '',
        savingId: s.savingId || s.savingProductId || s.id,
        basicRate: s.basicRate,
        maxRate: s.maxRate,
        maxLimit: s.maxLimit,
        term: s.term || null,
        isStarred: s.isStarred ?? false,
        isLiked: s.isLiked ?? false,
        likeCount: s.likeCount ?? 0,
      })),
      ...(res.cardList ?? []).map((c) => ({
        ...c,
        type: 'card',
        name: c.cardName,
        bank: c.issuer,
        imageUrl: c.cardImageUrl,
        cardId: c.cardId || c.id,
        annualFee: c.annualFee,
        preMonthMoney: c.preMonthMoney,
        isStarred: c.isStarred ?? false,
        isLiked: c.isLiked ?? false,
        likeCount: c.likeCount ?? 0,
      })),
    ];
  } catch (e) {
    console.error('[MyFavoritePage] 즐겨찾기 불러오기 실패:', e);
  } finally {
    loading.value = false;
  }
});
const formatCurrency = (val) => {
  return (
    new Intl.NumberFormat('ko-KR', {
      maximumFractionDigits: 0,
    }).format(val) + '원'
  );
};

const getRateWithTerm = (saving, type) => {
  if (!saving.savingOptions || saving.savingOptions.length === 0) return '-%';

  const selectedTerm = filters.value?.term;

  if (selectedTerm === '전체') {
    const sorted = [...saving.savingOptions].sort((a, b) => {
      const valA = type === 'base' ? a.intrRate : a.intrRate2;
      const valB = type === 'base' ? b.intrRate : b.intrRate2;
      return valB - valA;
    });
    const best = sorted[0];
    if (!best) return '-%';
    const val = type === 'base' ? best.intrRate : best.intrRate2;
    return typeof val === 'number' ? `${val.toFixed(2)}%` : '-%';
  }

  const match = saving.savingOptions.find(
    (opt) => opt.saveTrm === selectedTerm
  );
  if (!match) return '-%';
  const value = type === 'base' ? match.intrRate : match.intrRate2;
  return typeof value === 'number' ? `${value.toFixed(2)}%` : '-%';
};

const filters = ref({
  term: '12',
  amount: null,
});
filters.value.bank = null;

const selectProduct = (product) => {
  if (product?.isFallback) return;
  if (product?.savingId) {
    router.push(`/detail/saving/${product.savingId}`);
    return;
  }
  if (product?.depositId) {
    router.push(`/detail/deposit/${product.depositId}`);
    return;
  }
  if (product?.cardId) {
    router.push(`/detail/card/${product.cardId}`);
    return;
  }
  console.log('product', product);
  console.warn(
    '선택한 상품에 유효한 ID가 없어 상세 페이지로 이동할 수 없습니다:',
    product
  );
};
</script>

<style scoped>
.main-content {
  max-width: 75rem;
  margin: 0 auto;
  padding: var(--spacing-2xl);
}

.page-title {
  font-size: var(--font-size-2xl);
  font-weight: 700;
  margin-bottom: var(--spacing-xl);
  text-align: center;
}

.tab-selector {
  display: flex;
  justify-content: center;
  margin-bottom: 2.5rem;
}

:deep(.base-button) {
  border: 2px solid transparent;
  border-radius: var(--spacing-xl);
  transition: all 0.3s ease;
  box-shadow: var(--shadow-card);
  background-color: var(--bg-content);
  color: var(--text-primary);
}

:deep(.base-button:hover) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  border-color: var(--color-accent);
  background-color: var(--color-gray-200);
}

.product-card {
  position: relative;
  background: var(--bg-content);
  border-radius: var(--spacing-xl);
  padding: var(--spacing-xl);
  height: 18rem;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
}
.product-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  border-color: var(--color-accent);
}
.product-card-horizontal {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-lg);
}

.card-product-card {
  background: var(--bg-content);
  border-radius: var(--spacing-xl);
  padding: var(--spacing-xl);
  cursor: pointer;
  height: 20rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: start;
  text-align: center;
  min-height: 24rem;
}

.card-product-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  border-color: var(--color-accent);
}

.product-content {
  display: grid;
  grid-template-columns: 120px 1fr;
  align-items: center;
  gap: 1.5rem;
  width: 100%;
  height: 100%;
  padding-bottom: 1.6rem;
}

.product-content img {
  height: 150px;
  width: 100%;
  object-fit: contain;
  border-radius: 12px;
  flex-shrink: 0;
}

.card-left-section {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.card-compare-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: nowrap;
  margin-top: 0.5rem;
}

.card-compare-button :deep(.compare-button),
.card-compare-button :deep(button) {
  white-space: nowrap;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
}

/* LikeToggle 내부(하트+숫자) 가로정렬/줄바꿈 방지 (데스크탑 포함) */
.card-compare-button :deep(.like-chip) {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 0.35rem;
  white-space: nowrap;
}
.card-compare-button :deep(.like-count) {
  display: inline-block;
  line-height: 1;
  white-space: nowrap;
}
.card-compare-button :deep(.like-icon) {
  flex: 0 0 auto;
}

/* LikeToggle 강제 가로 정렬 래퍼 (데스크톱) */
.like-fix {
  display: inline-flex;
  align-items: center;
}
.like-fix :deep(*) {
  white-space: nowrap;
}
.like-fix :deep(button),
.like-fix :deep(.like-chip),
.like-fix :deep(.chip) {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.product-info h4 {
  margin: 0;
  font-size: var(--font-size-lg);
  font-weight: bold;
}

.label {
  font-weight: 600;
  margin-right: 4px;
  color: #333;
}

.bank-logo-container {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 6.2rem;
  height: 6.2rem;
  flex-direction: column;
}
.bank-logo-round {
  width: 6rem;
  height: 6rem;
  border-radius: 50%;
  object-fit: contain;
  background: var(--color-white);
  box-shadow: 0 0.125rem 0.5rem rgba(0, 0, 0, 0.04);
  border: 0.1rem solid var(--color-gray-200);
}

.product-name-block {
  flex: 1;
  padding: 0 var(--spacing-md);
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.bank-name-bold {
  font-size: var(--font-size-sm);
  font-weight: 700;
  color: #1e2b4e; /* strong navy blue */
  margin-bottom: 0.5rem;
}

.product-info-column {
  display: flex;
  flex-direction: column;
  /* gap: 0.25rem; */
  align-items: flex-start;
}

.product-name-bold {
  font-size: var(--font-size-lg);
  font-weight: 800;
  color: var(--text-primary);
  /* margin-bottom: 0.2rem; */
  text-align: left;
}

.product-info-block {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.1rem;
}

.rate-line {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  /* margin-bottom: 0.1rem; */
}

.label-bold {
  font-weight: bold;
  color: var(--color-dark);
}

.highlight-rate {
  font-size: 18px;
  color: #609966;
  font-weight: bold;
  margin-right: 0.4rem;
}

.no-wrap {
  white-space: nowrap;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  border: 2px #ccc;
  border-radius: 1rem;
  color: var(--text-secondary);
  font-size: 1rem;
  text-align: center;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem 0;
}

.spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid var(--color-success);
  border-radius: 50%;
  width: 36px;
  height: 36px;
  animation: spin 1s linear infinite;
  margin-bottom: 0.5rem;
}

.search-results {
  margin-top: 1rem;
}

.benefit-hashtags .hashtag {
  display: inline-block;
  background-color: #e6f4ec;
  color: #2e7d32;
  padding: 0.3rem 0.7rem;
  border-radius: 1.2rem;
  margin-right: 0.6rem;
  margin-top: 0.3rem;
  font-size: 0.7rem;
  font-weight: 500;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.product-info {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  text-align: left;
}
.product-info > div,
.product-info > h4 {
  line-height: 1.6;
}

.search-results-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-xl);
}

.card-search-results-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-md);
}

.compare-button {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  flex-wrap: nowrap;
  gap: 0.4rem;
  padding: 0;
  margin: 0.5rem 0 0 0;
}

.compare-button > * {
  white-space: nowrap;
}

@media (max-width: 768px) {
  .search-results-grid {
    grid-template-columns: 1fr;
  }
  .bank-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .product-card-horizontal {
    flex-direction: row;
    align-items: center;
    gap: var(--spacing-lg);
  }
  .bank-logo-container {
    width: 6rem;
    height: 2rem;
  }
  .bank-logo-round {
    width: 5.6rem;
    height: 5.6rem;
  }
  .bank-logo-img {
    width: 80px;
    height: 80px;
  }
  .bank-logo-option {
    width: 100px;
    height: 100px;
  }
  .product-info-block {
    align-items: flex-end;
    width: auto;
  }
  .product-name-bold {
    font-size: var(--font-size-lg);
  }
  .bank-name-bold {
    font-size: var(--font-size-base);
    padding-bottom: 0.5rem;
  }
  .rate-line {
    font-size: var(--font-size-base);
  }

  .highlight-rate {
    font-size: 1rem;
    margin-right: 0.4rem;
  }
  .term-selector {
    display: none;
  }
  .term-dropdown-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: var(--spacing-lg);
  }

  .compare-button > *:first-child {
    transform: scale(0.7);
    transform-origin: center;
    margin-right: -1rem;
  }
  .compare-button > *:last-child {
    transform: scale(0.8);
    transform-origin: center;
    margin-right: 0 !important;
  }

  .bank-label {
    font-size: var(--font-size-base);
    color: var(--text-primary);
    font-weight: 600;
    padding-top: 0.6rem;
  }

  .bank-logo-option {
    margin-bottom: 1.2rem;
  }
  .product-card {
    height: auto;
    padding-top: calc(var(--spacing-xl) + 0.6rem);
  }
  .product-card-row {
    width: 88%;
    gap: 1.2rem;
    min-height: 6.5rem;
  }
  .bank-logo-container {
    width: 5.6rem;
    height: 5.6rem;
  }
  .bank-logo-round {
    width: 5.2rem;
    height: 5.2rem;
  }
  .compare-button {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    margin-top: 0.5rem;
    flex-wrap: nowrap;
    gap: 0.1rem;
  }

  .card-compare-button {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-top: 0.5rem;
  }

  /* LikeToggle 내부(하트+숫자) 간격/패딩 보정 */
  .card-compare-button :deep(.like-chip) {
    display: flex; /* 가로 정렬 보장 */
    flex-direction: row;
    align-items: center;
    gap: 0.35rem;
    white-space: nowrap; /* 줄바꿈 금지 */
    padding: 0.35rem 0.7rem;
    border-radius: 999px;
    line-height: 1;
    width: auto; /* 고정폭 방지 */
    min-width: unset;
  }
  .card-compare-button :deep(.like-icon) {
    margin-right: 0.3rem;
    flex: 0 0 auto;
  }
  .card-compare-button :deep(.like-count) {
    display: inline-block;
    font-size: 0.95rem;
    line-height: 1; /* 숫자 수직 가운데 보정 */
    white-space: nowrap;
  }

  /* Compare button 텍스트 줄바꿈/뭉개짐 방지 */
  .card-compare-button :deep(.compare-button),
  .card-compare-button :deep(button) {
    white-space: nowrap;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: optimizeLegibility;
  }
  /* LikeToggle 강제 가로 정렬 래퍼 */
  .like-fix {
    display: inline-flex;
    align-items: center;
  }
  .like-fix :deep(*) {
    white-space: nowrap;
  }
  .like-fix :deep(button),
  .like-fix :deep(.like-chip),
  .like-fix :deep(.chip) {
    display: flex;
    flex-direction: row;
    align-items: center;
  }
  .card-compare-button :deep(button) {
    font-size: 0.9rem;
  }
  .main-content {
    padding: 1rem;
  }
  .page-title {
    font-size: 1.25rem;
  }
  .card-search-results-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  .card-search-results-grid .product-card {
    min-height: 0;
    height: auto;
    padding: 1rem;
  }
  .card-search-results-grid .product-content img {
    height: 120px;
  }
  .product-card-horizontal {
    align-items: stretch;
    gap: 0.5rem;
    text-align: left;
  }
}

.product-action-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-top: 0.5rem;
}

.favorite-button {
  position: absolute;
  top: 1.8rem;
  right: 1.6rem;
  margin: 0;
  z-index: 2;
  width: auto;
  display: block;
}

.card-favorite-button {
  width: 100%;
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-bottom: 0.2rem;
}

.product-card-row {
  width: 80%;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 2rem;
  min-height: 8rem;
  padding: 2rem 0;
}

.tab-btn {
  padding: 0.75rem 1.25rem;
  margin: 0 1.25rem;
  background-color: var(--bg-content);
  color: var(--text-primary);
}
.tab-btn--active {
  background-color: var(--color-accent);
  color: var(--color-white);
}
</style>
