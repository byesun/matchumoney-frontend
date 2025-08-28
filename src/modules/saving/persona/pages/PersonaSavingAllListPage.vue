<template>
  <div class="saving-search-page">
    <BackButton />
    <main class="main-content">
      <!-- 💡 페르소나 추천 -->
      <h1 class="page-title">페르소나 추천</h1>
      <section class="persona-carousel-section">
        <h2 class="persona-carousel-title">
          <span class="highlight">{{ userPersonaType }}</span>
          유형에게 추천하는 적금
        </h2>
        <!-- 데스크탑 화면: flex 목록 -->
        <div class="carousel-saving-list" v-if="!isMobile">
          <div
            v-for="saving in carouselSavings"
            :key="saving.id"
            class="carousel-saving"
            @click="selectProduct(saving)"
          >
            <img
              :src="saving.image"
              :alt="saving.name"
              class="carousel-saving-image"
            />
            <div class="carousel-saving-name">{{ saving.name }}</div>
            <div>{{ saving.bankName }}</div>
            <div class="carousel-saving-rates-inline">
              <span>
                <strong>최고 금리:</strong>
                {{ saving.maxRate }}
              </span>
              <span>
                <strong>최저 금리:</strong>
                {{ saving.baseRate }}
              </span>
              <span>
                <strong>매월 최대 금액:</strong>
                {{
                  saving.maxLimit === 999999999 || '999999999'
                    ? '한도 없음'
                    : formatCurrency(Number(saving.maxLimit))
                }}
              </span>
              <span>
                <strong>기준 기간:</strong>
                12개월
              </span>
            </div>
          </div>
        </div>

        <!-- 모바일 화면: swiper 캐러셀 -->
        <Swiper
          v-else
          :modules="modules"
          :slides-per-view="1"
          :space-between="16"
          :pagination="{ clickable: true }"
          class="carousel-swiper"
        >
          <SwiperSlide
            v-for="saving in carouselSavings"
            :key="saving.id"
            class="carousel-saving"
            @click="selectProduct(saving)"
          >
            <img
              :src="saving.image"
              :alt="saving.name"
              class="carousel-saving-image"
            />
            <div class="carousel-saving-name">{{ saving.name }}</div>
            <div class="bank-name-bold">{{ saving.bankName }}</div>
            <div class="carousel-saving-rates-inline">
              <span>
                <strong>최고 금리:</strong>
                {{ saving.maxRate }}
              </span>
              <span>
                <strong>최저 금리:</strong>
                {{ saving.baseRate }}
              </span>
              <span>
                <strong>매월 최대 금액:</strong>
                {{
                  saving.maxLimit === '999999999'
                    ? '한도 없음'
                    : formatCurrency(Number(saving.maxLimit))
                }}
              </span>
              <span>
                <strong>기준 기간:</strong>
                12개월
              </span>
            </div>
          </SwiperSlide>
        </Swiper>
      </section>

      <br />
      <hr />
      <br />

      <!-- 🔍 직접 찾아보기 -->
      <h1 class="page-title">직접 찾아보는 적금</h1>

      <!-- ✅ 필터 영역 -->
      <section class="filter-selection-section">
        <div class="term-selector">
          <div
            v-for="(term, idx) in terms"
            :key="term.value"
            :class="['term-button', { active: filters?.term === term.value }]"
            @click="filters.term = term.value"
          >
            {{ term.label }}
          </div>
        </div>
        <div class="term-dropdown-wrapper">
          <button
            class="term-toggle-button"
            @click="showTermDropdown = !showTermDropdown"
          >
            {{ filters.term }}개월 선택 ▼
          </button>
          <div class="term-dropdown" v-if="showTermDropdown">
            <div
              v-for="term in terms"
              :key="term.value"
              class="term-dropdown-option"
              @click="selectTerm(term.value)"
            >
              {{ term.label }}
            </div>
          </div>
        </div>
        <div class="amount-filter-container">
          <div style="display: flex; align-items: center; gap: 1rem">
            <h3 class="filter-label" style="margin: 0">매월 저축 금액 설정</h3>
            <label
              style="
                font-size: 0.9rem;
                display: flex;
                align-items: center;
                gap: 0.5rem;
              "
            >
              <input type="checkbox" v-model="useMaxLimitFilter" />
              <span>최대금액 필터 사용</span>
            </label>
          </div>
          <br />
          <transition name="slide-fade">
            <div v-if="useMaxLimitFilter" class="slider-box">
              <input
                type="range"
                v-model="selectedAmount"
                :min="10000"
                :max="maxAmount + sliderStep"
                :step="sliderStep"
                class="amount-slider"
              />
              <div class="slider-value">
                {{
                  selectedAmount > maxAmount
                    ? '한도 없음'
                    : formatCurrency(selectedAmount)
                }}
              </div>
            </div>
          </transition>
        </div>
        <br />
        <br />
        <h3 class="filter-label">은행을 선택해주세요</h3>
        <div class="bank-grid">
          <div
            v-for="bank in bankOptions"
            :key="bank.name"
            :class="[
              'bank-logo-option',
              { selected: filters?.bank === bank.name },
            ]"
            @click="
              filters.bank = filters?.bank === bank.name ? null : bank.name
            "
          >
            <img :src="bank.logo" :alt="bank.name" class="bank-logo-img" />
            <div class="bank-label">{{ bank.name }}</div>
          </div>
        </div>
        <br />
      </section>
      <!-- 🔍 검색 결과 -->
      <section class="search-results">
        <h2 class="results-title">검색한 적금 상품</h2>
        <div v-if="loading" class="loading-state">
          <div class="spinner"></div>
          <div>상품을 검색하고 있습니다...</div>
        </div>
        <div v-else-if="filteredProducts.length === 0" class="empty-state">
          <div class="empty-icon">🔍</div>
          <div>검색 조건에 맞는 상품이 없습니다.</div>
          <div>다른 조건으로 검색해보세요.</div>
        </div>
        <div v-else-if="visibleProducts.length > 0" class="search-results-grid">
          <div
            v-for="product in visibleProducts"
            :key="product.id"
            class="product-card"
          >
            <div class="saving-favorite-button" @click.stop>
              <FavoriteToggle
                v-model="product.isStarred"
                :productId="product.id"
                productType="SAVING"
              />
            </div>
            <div class="product-card-row" @click="selectProduct(product)">
              <!-- 왼쪽(로고) -->
              <div class="bank-logo-container">
                <img
                  :src="getBankLogo(product.bankInitial)"
                  alt="은행 로고"
                  class="bank-logo-round"
                />
                <div class="saving-compare-button" @click.stop>
                  <LikeToggle
                    :productId="product.id"
                    productType="saving-products"
                    :initialLiked="product.isLiked"
                    :initialCount="product.likeCount"
                    @update="
                      ({ liked, count }) => {
                        product.isLiked = liked;
                        product.likeCount = count;
                      }
                    "
                  />
                  <CompareButton :productId="product.id" productType="SAVING" />
                </div>
              </div>
              <div class="product-info-column">
                <div class="product-name-bold">{{ product.name }}</div>
                <div class="bank-name-bold">{{ product.bank }}</div>

                <div class="rate-line">
                  <span class="label-bold">최고 금리 :</span>
                  <span class="highlight-rate">{{
                    getRateWithTerm(product, 'max')
                  }}</span>
                </div>
                <div class="rate-line">
                  <span class="label-bold">최저 금리 :</span>
                  <span>{{ getRateWithTerm(product, 'base') }}</span>
                </div>
                <div class="rate-line no-wrap">
                  매월 최대 금액 :
                  {{
                    product.maxLimit === '999999999'
                      ? '한도 없음'
                      : formatCurrency(product.maxLimit)
                  }}
                </div>
                <div class="rate-line">
                  기준 기간 :
                  {{
                    filters.term !== '전체'
                      ? filters.term + '개월'
                      : (() => {
                          const best = product.savingOptions?.reduce(
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
          <div
            v-if="!allVisibleLoaded && infiniteLoading"
            class="loading-state infinite-scroll-loading"
          >
            <BaseSpinner size="md" />
            <p>적금 상품을 불러오고 있습니다...</p>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { Swiper, SwiperSlide } from 'swiper/vue';
import 'swiper/css';
import 'swiper/css/pagination';
import { Pagination } from 'swiper/modules';
const modules = [Pagination];
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import BackButton from '@/shared/components/common/BackButton.vue';
import FavoriteToggle from '@/shared/components/common/FavoriteToggle.vue';
import CompareButton from '@/shared/components/common/CompareButton.vue';
import LikeToggle from '@/shared/components/common/LikeToggle.vue';
import BaseSpinner from '@/shared/components/base/BaseSpinner.vue';
// 반응형 상태: 모바일 화면 여부
const isMobile = ref(window.innerWidth <= 768);

const handleResize = () => {
  isMobile.value = window.innerWidth <= 768;
};

onMounted(() => {
  window.addEventListener('resize', handleResize);
  handleResize();
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
});
import api from "@/shared/api";
// 매월 최대금액 필터링 사용 여부
const useMaxLimitFilter = ref(false);

const bankOptions = [
  {
    name: '국민은행',
    logo: new URL('@/assets/bankLogo_images/kb.png', import.meta.url).href,
  },
  {
    name: '신한은행',
    logo: new URL('@/assets/bankLogo_images/shinhan.png', import.meta.url).href,
  },
  {
    name: '우리은행',
    logo: new URL('@/assets/bankLogo_images/woori.png', import.meta.url).href,
  },
  {
    name: '하나은행',
    logo: new URL('@/assets/bankLogo_images/hana.png', import.meta.url).href,
  },
  {
    name: '카카오뱅크',
    logo: new URL('@/assets/bankLogo_images/kakao.png', import.meta.url).href,
  },
  {
    name: '토스뱅크',
    logo: new URL('@/assets/bankLogo_images/toss.png', import.meta.url).href,
  },
  {
    name: '농협은행',
    logo: new URL('@/assets/bankLogo_images/nh.png', import.meta.url).href,
  },
  {
    name: '기타',
    logo: new URL('@/assets/bankLogo_images/plus.png', import.meta.url).href,
  },
];

const loading = ref(false);
const showSearchResults = ref(false);
const selectedAmount = ref(10000);
const maxAmount = 3000000;
const sliderStep = 10000;

const getRate = (product, type) => {
  const selectedTerm = filters.value?.term;

  if (!product.savingOptions || product.savingOptions.length === 0) return '-%';

  if (selectedTerm === '전체') {
    const allRates = product.savingOptions.map((opt) =>
      type === 'base' ? opt.intrRate : opt.intrRate2
    );
    const max = Math.max(...allRates);
    return `${max.toFixed(2)}%`;
  }

  const match = product.savingOptions.find(
    (opt) => opt.saveTrm === selectedTerm
  );
  if (!match) return '-%';
  return `${(type === 'base' ? match.intrRate : match.intrRate2).toFixed(2)}%`;
};

const getRateWithTerm = (product, type) => {
  if (!product.savingOptions || product.savingOptions.length === 0) return '-%';

  const selectedTerm = filters.value?.term;

  if (selectedTerm === '전체') {
    const sorted = [...product.savingOptions].sort((a, b) => {
      const valA = type === 'base' ? a.intrRate : a.intrRate2;
      const valB = type === 'base' ? b.intrRate : b.intrRate2;
      return valB - valA;
    });
    const best = sorted[0];
    if (!best) return '-%';
    const val = type === 'base' ? best.intrRate : best.intrRate2;
    return typeof val === 'number' ? `${val.toFixed(2)}%` : '-%';
  }

  const match = product.savingOptions.find(
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

const showTermDropdown = ref(false);

const selectTerm = (val) => {
  filters.value.term = val;
  showTermDropdown.value = false;
};
function getAuthConfig() {
  const token = localStorage.getItem('accessToken');
  return token ? { headers: { Authorization: `Bearer ${token}` } } : undefined;
}

// selectedAmount를 filters에 동기화
watch(selectedAmount, (val) => {
  filters.value.amount = val > maxAmount ? null : val;
});

const terms = [
  { label: '전체', value: '전체' },
  { label: '1개월', value: '1' },
  { label: '3개월', value: '3' },
  { label: '6개월', value: '6' },
  { label: '12개월', value: '12' },
  { label: '24개월', value: '24' },
  { label: '36개월', value: '36' },
];

const userPersonaType = ref(''); // default 빈값

// 페르소나 추천 적금 목록
const personaRecommendedSavings = ref([]);

const get12MonthRate = (product, type) => {
  if (!product.savingOptions || product.savingOptions.length === 0) return '-%';
  const match = product.savingOptions.find((opt) => opt.saveTrm === '12');
  if (!match) return '-%';
  const val = type === 'base' ? match.intrRate : match.intrRate2;
  return typeof val === 'number' ? `${val.toFixed(2)}%` : '-%';
};

const carouselSavings = computed(() => {
  return personaRecommendedSavings.value.map((d) => ({
    id: d.savingId,
    name: d.savingName,
    bankName: d.bankName,
    image:
      getBankLogo(getBankInitial(d.bankName || '')) || d.companyImage || '',
    maxLimit: d.maxLimit,
    maxRate: `${d.maxRate.toFixed(2)}%`,
    baseRate: `${d.basicRate.toFixed(2)}%`,
  }));
});

const allProducts = ref([]);

onMounted(async () => {
  let personaCode = null;
  const token = localStorage.getItem('accessToken');
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  try {
    // 1. 사용자 personaId 가져오기
    const personaIdRes = await api.get(
      '/savings/recommendations/user/persona-id',
      config
    );
    personaCode = personaIdRes.data.personaId;

    // 2. 사용자 페르소나 적금 추천 가져오기
    const recommendationRes = await api.get(
      '/savings/recommendations/user/recommendation',
      config
    );
    const result = recommendationRes.data.result;

    userPersonaType.value = result.personaName || '토끼형';
    personaRecommendedSavings.value = (result.savings || []).map((item) => ({
      savingId: item.savingId,
      savingName: item.savingName,
      bankName: item.bankName,
      maxLimit: item.maxLimit,
      companyImage:
        item.companyImage || getBankLogo(getBankInitial(item.bankName || '')),
      maxRate: item.maxRate ?? 0,
      basicRate: item.basicRate ?? 0,
    }));
  } catch (err) {
    console.error('❌ 사용자 기반 페르소나 적금 불러오기 실패:', err);
    userPersonaType.value = '토끼형';
    personaRecommendedSavings.value = [];
  }

  try {
    // 전체 적금 리스트
    const res = await api.post(
      '/saving/search',
      { korCoNm: '', maxLimit: null },
      getAuthConfig() // ✅ 항상 3번째 인자
    );
    const fullList = res.data.map((item) => ({
      id: item.savingProductId,
      name: item.finPrdtNm,
      bank: item.korCoNm,
      maxLimit: item.maxLimit,
      bankInitial: getBankInitial(item.korCoNm),
      savingOptions: item.savingOptions,
      baseRate: item.intrRate?.toFixed(2) ?? '-',
      maxRate: item.intrRate2?.toFixed(2) ?? '-',
      image: item.image || '',
      personaType: item.personaType || '',
      isStarred: item.isStarred,
      isLiked: item.isLiked ?? false, // ✅ 오타 수정
      likeCount: item.likeCount ?? 0, // ✅ 오타 수정
    }));
    allProducts.value = fullList;
  } catch (err) {
    console.error('❌ 전체 상품 불러오기 실패:', err);
  }
});

const getBankInitial = (name) => {
  if (name.includes('신한')) return 'shinhan';
  if (name.includes('하나')) return 'hana';
  if (name.includes('우리')) return 'woori';
  if (name.includes('국민')) return 'kb';
  if (name.includes('농협')) return 'nh';
  if (name.includes('카카오')) return 'kakao';
  if (name.includes('토스')) return 'toss';
  if (name.includes('부산')) return 'bnk';
  if (name.includes('광주')) return 'gwangju';
  if (name.includes('중소기업')) return 'ibk';
  if (name.includes('아이엠')) return 'im';
  if (name.includes('제주')) return 'jeju';
  if (name.includes('전북')) return 'jeonbook';
  if (name.includes('산업')) return 'sanup';
  if (name.includes('수협')) return 'su';
  if (name.includes('SC제일') || name.includes('스탠다드차타드')) return 'sc';
  if (name.includes('케이뱅크') || name.includes('K뱅크')) return 'k';
  return 'shinhan';
};

const getBankLogo = (initial) => {
  const logos = {
    shinhan: new URL('@/assets/bankLogo_images/shinhan.png', import.meta.url)
      .href,
    hana: new URL('@/assets/bankLogo_images/hana.png', import.meta.url).href,
    woori: new URL('@/assets/bankLogo_images/woori.png', import.meta.url).href,
    kb: new URL('@/assets/bankLogo_images/kb.png', import.meta.url).href,
    nh: new URL('@/assets/bankLogo_images/nh.png', import.meta.url).href,
    kakao: new URL('@/assets/bankLogo_images/kakao.png', import.meta.url).href,
    toss: new URL('@/assets/bankLogo_images/toss.png', import.meta.url).href,
    bnk: new URL('@/assets/bankLogo_images/bnk.png', import.meta.url).href,
    gwangju: new URL('@/assets/bankLogo_images/gwangju.png', import.meta.url)
      .href,
    ibk: new URL('@/assets/bankLogo_images/ibk.png', import.meta.url).href,
    im: new URL('@/assets/bankLogo_images/im.png', import.meta.url).href,
    jeju: new URL('@/assets/bankLogo_images/jeju.png', import.meta.url).href,
    jeonbook: new URL('@/assets/bankLogo_images/jeonbook.png', import.meta.url)
      .href,
    sanup: new URL('@/assets/bankLogo_images/sanup.png', import.meta.url).href,
    su: new URL('@/assets/bankLogo_images/su.png', import.meta.url).href,
    sc: new URL('@/assets/bankLogo_images/sc.png', import.meta.url).href,
    k: new URL('@/assets/bankLogo_images/k.png', import.meta.url).href,
  };
  return logos[initial] || logos['shinhan'];
};

const selectProduct = (product) => {
  window.location.href = `/detail/saving/${product.id}`;
};

const filteredProducts = computed(() => {
  let result = [...allProducts.value];

  // 기간 필터: "전체"가 아닌 다른 값이 선택된 경우에만 필터링
  if (filters.value?.term && filters.value?.term !== '전체') {
    result = result.filter((p) =>
      p.savingOptions?.some(
        (opt) => String(opt.saveTrm) === filters.value?.term
      )
    );
  }

  // 예치금액 필터 추가
  if (selectedAmount.value <= maxAmount) {
    result = result.filter((p) =>
      p.savingOptions?.some((opt) => {
        const amountNum = parseInt(opt.minAmount?.replace(/[^\d]/g, '')) || 0;
        return selectedAmount.value >= amountNum;
      })
    );
    if (useMaxLimitFilter.value) {
      result = result.filter(
        (p) => !p.maxLimit || Number(p.maxLimit) <= selectedAmount.value
      );
    }
  }

  // 은행 필터
  if (filters.value?.bank && filters.value?.bank !== '기타') {
    result = result.filter((p) => p.bank.includes(filters.value?.bank));
  } else if (filters.value?.bank === '기타') {
    result = result.filter(
      (p) =>
        ![
          '국민은행',
          '신한은행',
          '우리은행',
          '하나은행',
          '카카오뱅크',
          '토스뱅크',
          '농협은행',
        ].some((bank) => p.bank.includes(bank))
    );
  }

  // 🔽 선택된 기간의 최대 금리 기준 내림차순 정렬
  result.sort((a, b) => {
    const aMax = Math.max(
      ...(a.savingOptions?.map((opt) => opt.intrRate2) || [0])
    );
    const bMax = Math.max(
      ...(b.savingOptions?.map((opt) => opt.intrRate2) || [0])
    );
    return bMax - aMax;
  });

  return result;
});

// 무한 스크롤 관련 로직
const VISIBLE_STEP = 6;
const visibleCount = ref(VISIBLE_STEP);
const infiniteLoading = ref(false);
const visibleProducts = ref([]);

const updateVisibleProducts = () => {
  visibleProducts.value = filteredProducts.value.slice(0, visibleCount.value);
};

// filteredProducts가 변경될 때 visibleProducts 초기화
watch(filteredProducts, () => {
  visibleCount.value = VISIBLE_STEP;
  updateVisibleProducts();
});

// visibleCount가 변경될 때 visibleProducts 업데이트
watch(visibleCount, updateVisibleProducts);

// 최초 filteredProducts 준비 시 visibleProducts 초기화
onMounted(() => {
  updateVisibleProducts();
});

const allVisibleLoaded = computed(
  () => visibleProducts.value.length >= filteredProducts.value.length
);

let scrollTimer = null;
const onScroll = () => {
  if (infiniteLoading.value || allVisibleLoaded.value || loading.value) return;
  // 스크롤이 하단에 도달했는지 체크
  const scrollContainer = document.documentElement;
  const scrollTop = scrollContainer.scrollTop;
  const clientHeight = scrollContainer.clientHeight;
  const scrollHeight = scrollContainer.scrollHeight;
  if (scrollTop + clientHeight >= scrollHeight - 10) {
    infiniteLoading.value = true;
    // 자연스러운 로딩을 위해 살짝 딜레이
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(() => {
      visibleCount.value = Math.min(
        visibleCount.value + VISIBLE_STEP,
        filteredProducts.value.length
      );
      infiniteLoading.value = false;
    }, 700);
  }
};

onMounted(() => {
  window.addEventListener('scroll', onScroll);
});

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll);
  clearTimeout(scrollTimer);
});
const formatCurrency = (val) => {
  return (
    new Intl.NumberFormat('ko-KR', {
      maximumFractionDigits: 0,
    }).format(val) + '원'
  );
};

const getMinAmountWithTerm = (product) => {
  if (!product.savingOptions || product.savingOptions.length === 0) return null;

  const selectedTerm = filters.value?.term;
  if (!selectedTerm || selectedTerm === '전체') return null;

  const matchedOption = product.savingOptions.find(
    (opt) => String(opt.saveTrm) === selectedTerm
  );
  return matchedOption?.minAmount || null;
};
</script>

<style scoped>
.saving-search-page {
  font-family: 'Noto Sans', sans-serif;
  background: var(--color-white);
  min-height: 100vh;
}

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

.persona-carousel-title {
  font-size: var(--font-size-xl);
  margin-bottom: var(--spacing-lg);
  text-align: center;
}

/* Swiper 스타일 */
.carousel-swiper {
  width: 100%;
  padding-bottom: 1rem;
}

.swiper-pagination-bullets {
  bottom: -0.5rem;
}

.carousel-saving {
  width: 320px; /* 고정 크기 */
  padding: 2rem;
  border-radius: 1.5rem;
  box-shadow: var(--shadow-md);
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: white;
}

.carousel-saving-image {
  width: 7rem;
  border-radius: var(--spacing-sm);
  padding-bottom: 2rem;
}
.persona-carousel-section {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.carousel-saving-name {
  font-size: 1.3rem;
  font-weight: 700;
  text-align: center;
}

.highlight {
  font-size: var(--font-size-2xl);
  color: #2e7d32;
  font-weight: 900;
}

.filter-selection-section {
  padding: var(--spacing-xl);
  border: 2px solid var(--border-light);
  border-radius: var(--spacing-xl);
  background: var(--bg-card);
  margin-bottom: var(--spacing-2xl);
}

.term-selector {
  display: flex;
  justify-content: space-between;
  margin-bottom: var(--spacing-lg);
}

.term-button {
  flex: 1;
  text-align: center;
  padding: var(--spacing-md);
  border-bottom: 3px solid transparent;
  cursor: pointer;
  color: var(--text-secondary);
}

.term-button.active {
  color: var(--color-success);
  border-color: var(--color-success);
  font-weight: bold;
}

.amount-filter-container {
  margin: var(--spacing-2xl) 0;
}

.slider-box {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
}

.amount-slider {
  width: 100%;
  appearance: none;
  height: 6px;
  border-radius: 3px;
  background: var(--color-gray-300);
  outline: none;
}

.amount-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  background: var(--color-success);
  height: 20px;
  width: 20px;
  border-radius: 50%;
  cursor: pointer;
  margin-top: -7px;
}

.amount-slider::-moz-range-thumb {
  background: var(--color-success);
  height: 20px;
  width: 20px;
  border-radius: 50%;
  cursor: pointer;
}

.slider-value {
  min-width: 120px;
  font-weight: bold;
  font-size: var(--font-size-lg);
  color: var(--text-primary);
}

.filter-label {
  font-size: var(--font-size-lg);
  font-weight: 700;
  color: var(--color-dark);
  margin-bottom: var(--spacing-md);
  text-align: left;
}

.bank-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--spacing-md);
  justify-content: center;
  place-items: center;
}

.bank-logo-option {
  width: 140px;
  height: 140px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 2px solid transparent;
  border-radius: var(--spacing-xl);
  padding: var(--spacing-md);
  background: var(--color-white);
  transition: all 0.3s ease;
  text-align: center;
}

.bank-logo-option:hover {
  transform: translateY(-4px);
  border-color: var(--border-medium);
}

.bank-logo-option.selected {
  border-color: var(--color-success);
  background: var(--color-success-light);
}

.bank-label {
  font-size: var(--font-size-sm);
  color: var(--text-primary);
  font-weight: 600;
}

.bank-logo-img {
  width: 110px;
  height: 110px;
  object-fit: contain;
  background-color: var(--color-white);
  border-radius: 50%;
  padding: 4px;
}

.search-results-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-xl);
}

/* ---- Product Card Horizontal Layout ---- */
.product-card {
  position: relative;
  background: var(--bg-content);
  border-radius: var(--spacing-xl);
  padding: var(--spacing-xl);
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding-top: 2.4rem;
}

.product-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  border-color: var(--color-accent);
}

/* --- 3-column product card horizontal --- */
.product-card-horizontal {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-lg);
}

/* Left: logo */
.bank-logo-container {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 5rem;
  height: 5rem;
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

/* Center: name block */
.product-name-block {
  flex: 1;
  padding: 0 var(--spacing-md);
  display: flex;
  flex-direction: column;
  justify-content: center;
}

/* Right: info block */
.product-info-block {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.1rem;
}

.bank-name-bold {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: #1e2b4e; /* strong navy blue */
  margin-bottom: 0.5rem;
}

.product-name-bold {
  font-size: var(--font-size-lg);
  font-weight: 800;
  color: var(--text-primary);
  /* margin-bottom: 0.2rem; */
  text-align: left;
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

.carousel-saving-rates-inline {
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin-top: var(--spacing-sm);
}

@media (max-width: 768px) {
  .search-results-grid {
    grid-template-columns: 1fr;
  }

  .bank-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .carousel-saving-name {
    font-size: 1.3rem;
    font-weight: 700;
    text-align: center;
  }

  .carousel-saving-image {
    width: 8rem;
    border-radius: var(--spacing-sm);
    padding-bottom: 2rem;
  }

  /* --- ProductCard 모바일: 3단 가로 배치 --- */
  .product-card-horizontal {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    gap: var(--spacing-md);
  }

  .product-name-block {
    text-align: center;
    flex: 1;
    padding: 0 var(--spacing-sm);
    align-items: center;
    justify-content: center;
    display: flex;
    flex-direction: column;
  }
  .highlight-rate {
    font-size: 1rem;
  }
  .product-info-block {
    align-items: flex-end;
    text-align: right;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    gap: 0.1rem;
  }

  .bank-logo-container {
    width: 6rem;
    height: 4rem;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .bank-logo-round {
    width: 5.6rem;
    height: 5.6rem;
  }

  .bank-logo-img {
    width: 7rem;
    height: 7rem;
  }

  .bank-label {
    font-size: var(--font-size-base);
    color: var(--text-primary);
    font-weight: 600;
    padding-top: 0.25rem;
  }

  .carousel-saving-rates-inline {
    display: flex;
    flex-direction: column;
    align-items: center;
    font-size: var(--font-size-base);
    color: var(--text-secondary);
    margin-top: var(--spacing-sm);
  }

  .bank-name-bold {
    font-size: var(--font-size-base);
    font-weight: 600;
    color: #1e2b4e; /* strong navy blue */
    margin-bottom: 0.5rem;
  }

  .rate-line {
    font-size: var(--font-size-base);
    color: var(--text-secondary);
    /* margin-bottom: 0.1rem; */
  }

  .bank-logo-option {
    width: 100px;
    height: 100px;
  }
}
</style>
<style scoped>
.term-dropdown-wrapper {
  display: none;
  flex-direction: column;
  align-items: center;
  margin-bottom: var(--spacing-lg);
}

.term-toggle-button {
  background: var(--color-success-light);
  color: var(--color-dark);
  padding: 0.5rem 1rem;
  font-weight: bold;
  border: 2px solid var(--color-success);
  border-radius: 0.75rem;
  cursor: pointer;
}

.term-dropdown {
  margin-top: 0.5rem;
  background: var(--color-white);
  border: 1px solid var(--border-light);
  border-radius: 0.5rem;
  box-shadow: var(--shadow-md);
  width: 100%;
  max-width: 300px;
}

.term-dropdown-option {
  padding: 0.75rem;
  text-align: center;
  cursor: pointer;
}

.term-dropdown-option:hover {
  background: var(--color-success-light);
  font-weight: bold;
}

.saving-compare-button {
  display: flex; /* 가로 배치 */
  flex-direction: row;
  align-items: center; /* 수직 중앙 */
  justify-content: center; /* 수평 중앙 */
  margin-top: 0.5rem;
  flex-wrap: nowrap;
  gap: 0.2rem;
}

.saving-compare-button > * {
  white-space: nowrap; /* 버튼 안 텍스트 줄바꿈 방지 */
}

@media (max-width: 768px) {
  .term-selector {
    display: none;
  }

  .term-dropdown-wrapper {
    display: flex;
  }

  .saving-compare-button > *:first-child {
    transform: scale(0.7);
    transform-origin: center;
    margin-right: -1rem;
  }
  .saving-compare-button > *:last-child {
    transform: scale(0.8);
    transform-origin: center;
    margin-right: 0 !important;
  }
}

.carousel-saving-list {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 2rem;
  margin-bottom: var(--spacing-2xl);
}

.no-wrap {
  white-space: nowrap;
}

/* .carousel-saving-rates {
font-size: var(--font-size-base);
color: var(--text-secondary);
text-align: center;
} */

/* 🔷 Empty state 스타일 */
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
  margin-top: 2rem;
  text-align: center;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}
/* Slide-fade transition for slider-box */
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  max-height: 0;
  opacity: 0;
}

.slide-fade-enter-to,
.slide-fade-leave-from {
  max-height: 100px;
  opacity: 1;
}

.product-card-row {
  width: 80%;
  justify-content: flex-start;
  display: flex;
  align-items: center;
  gap: 2rem;
}
.product-info-column {
  display: flex;
  flex-direction: column;
  /* gap: 0.25rem; */
  align-items: flex-start;
}
.saving-favorite-button {
  position: absolute;
  top: 1.8rem;
  right: 1.6rem;
  margin: 0;
  z-index: 2;
}

/* 무한 스크롤 로딩 스피너 */
.infinite-scroll-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem 0;
  width: 100%;
  grid-column: 1 / -1;
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
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-2xl) var(--spacing-lg);
  text-align: center;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
