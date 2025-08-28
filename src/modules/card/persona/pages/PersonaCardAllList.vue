<template>
  <div class="card-product-search">
    <BackButton />
    <main class="main-content">
      <!-- 페르소나 추천 캐러셀 -->
      <h1 class="page-title">페르소나 추천</h1>
      <section class="persona-carousel-section">
        <h2 class="persona-carousel-title">
          <span class="highlight">{{ userPersonaType }}</span>
          유형에게 추천하는 카드
        </h2>
        <Swiper
          v-if="isMobile"
          :slides-per-view="1"
          :space-between="16"
          :pagination="{
            clickable: true,
          }"
          :modules="modules"
          class="carousel-swiper">
          <SwiperSlide v-for="card in carouselCards" :key="card.id" class="carousel-card" @click="selectProduct(card)">
            <div style="width: 14rem; height: 14rem">
              <img :src="card.image" :alt="card.name" class="carousel-card-image" />
            </div>
            <div class="carousel-card-name">{{ card.name }}</div>
            <div>{{ card.issuer || '카드사 미정' }}</div>
            <div class="carousel-card-benefit">
              <div>
                <span class="label">전월실적금액:</span>
                {{ card.preMonthMoney ? card.preMonthMoney.toLocaleString() + '원' : '정보 없음' }}
              </div>
              <div>
                <span class="label">연회비:</span>
                {{ card.annualFee ? card.annualFee.replace(/\[|\]/g, '') : '정보 없음' }}
              </div>
              <div v-if="card.options && card.options.length > 0" class="benefit-hashtags">
                <span v-for="(option, index) in card.options.slice(0, 3)" :key="index" class="hashtag">
                  #{{ option.title }}
                </span>
              </div>
            </div>
          </SwiperSlide>
        </Swiper>

        <Swiper
          v-else
          class="carousel-card-list"
          :slides-per-view="3"
          :space-between="16"
          :pagination="{
            clickable: true,
          }"
          :modules="modules">
          <SwiperSlide v-for="card in carouselCards" :key="card.id" class="carousel-card" @click="selectProduct(card)">
            <div style="width: 14rem; height: 14rem">
              <img :src="card.image" :alt="card.name" class="carousel-card-image" />
            </div>
            <div class="carousel-card-name">{{ card.name }}</div>
            <div>{{ card.issuer || '카드사 미정' }}</div>
            <div class="carousel-card-benefit">
              <div>
                <span class="label">전월실적금액:</span>
                {{ card.preMonthMoney ? card.preMonthMoney.toLocaleString() + '원' : '정보 없음' }}
              </div>
              <div>
                <span class="label">연회비:</span>
                {{ card.annualFee.replace(/\[|\]/g, '') || '정보 없음' }}
              </div>
              <div v-if="card.options && card.options.length > 0" class="benefit-hashtags">
                <span v-for="(option, index) in card.options.slice(0, 3)" :key="index" class="hashtag">
                  #{{ option.title }}
                </span>
              </div>
            </div>
          </SwiperSlide>
        </Swiper>
      </section>
      <br />
      <hr />
      <br />

      <!-- 직접 검색 필터 영역 -->
      <h1 class="page-title">직접 찾아보는 카드</h1>
      <section class="filter-selection-section">
        <h3 class="filter-label">카드 종류 선택</h3>
        <div class="card-type-toggle">
          <button
            :class="['type-btn', filters.creditCard ? 'active' : '']"
            @click="
              () => {
                filters.creditCard = !filters.creditCard;
                searchProducts();
              }
            ">
            신용카드
          </button>
          <button
            :class="['type-btn', filters.debitCard ? 'active' : '']"
            @click="
              () => {
                filters.debitCard = !filters.debitCard;
                searchProducts();
              }
            ">
            체크카드
          </button>
        </div>

        <h3 class="filter-label">카드 혜택 선택</h3>
        <div class="benefit-grid">
          <div
            v-for="benefit in benefitCategories"
            :key="benefit.id"
            class="benefit-button"
            :class="{
              selected: filters.selectedBenefits.includes(benefit.id),
            }"
            @click="toggleBenefit(benefit.id)">
            <span class="emoji">{{ benefit.emoji }}</span>
            <span>{{ benefit.name }}</span>
          </div>
        </div>
      </section>

      <!-- 직접 검색 결과 리스트 -->
      <section class="search-results">
        <h2 class="results-title">검색한 카드 상품</h2>

        <div v-if="loading" class="loading-state">
          <div class="spinner"></div>
          <div>상품을 검색하고 있습니다...</div>
        </div>

        <div v-else-if="searchResults.length === 0" class="empty-state">
          <div class="empty-icon">🔍</div>
          <div>검색 조건에 맞는 상품이 없습니다.</div>
          <div>다른 조건으로 검색해보세요.</div>
        </div>

        <div v-else class="search-results-grid">
          <div v-for="product in searchResults" :key="product.id" class="product-card" @click="selectProduct(product)">
            <div class="card-favorite-button" @click.stop>
              <FavoriteToggle v-model="product.isStarred" :productId="product.id" productType="CARD" />
            </div>
            <div class="product-content">
              <div class="card-left-section">
                <img
                  :src="product.imageUrl || product.cardImageUrl || getBankLogo('default')"
                  :alt="product.name || product.cardName"
                  class="product-image" />
                <div class="card-compare-button" @click.stop>
                  <div class="like-fix">
                    <LikeToggle
                      :productId="product.id"
                      productType="card-products"
                      :initialLiked="product.isLiked"
                      :initialCount="product.likeCount"
                      @update="
                        ({ liked, count }) => {
                          product.isLiked = liked;
                          product.likeCount = count;
                        }
                      " />
                  </div>
                  <CompareButton :productId="product.id || product.cardId" productType="CARD" />
                </div>
              </div>
              <div class="product-info">
                <h4>{{ product.name || product.cardName }}</h4>
                <div class="issuer">
                  {{ product.issuer || '카드사 미정' }}
                </div>
                <div>
                  <span class="label">전월실적금액:</span>
                  {{ product.preMonthMoney ? product.preMonthMoney.toLocaleString() + '원' : '정보 없음' }}
                </div>
                <div>
                  <span class="label">연회비:</span>
                  {{ product.annualFee ? product.annualFee.replace(/\[|\]/g, '') : '정보 없음' }}
                </div>
                <!-- 혜택 태그 -->
                <div v-if="product.options && product.options.length > 0" class="benefit-hashtags">
                  <span v-for="(option, index) in product.options.slice(0, 3)" :key="index" class="hashtag">
                    #{{ option.title }}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div v-if="isLoadingMore" class="loading-state infinite-spinner-wrapper">
            <BaseSpinner size="md" />
            <p>카드 상품을 불러오고 있습니다...</p>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<!-- name: 'CardSearchPage' -->
<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import BackButton from '@/components/common/BackButton.vue';
import api from '@/api';
import { Swiper, SwiperSlide } from 'swiper/vue';
import 'swiper/css';
import 'swiper/css/pagination';
import { Pagination } from 'swiper/modules';
import FavoriteToggle from '@/components/common/FavoriteToggle.vue';
import CompareButton from '@/components/common/CompareButton.vue';
import LikeToggle from '@/components/common/LikeToggle.vue';
import BaseSpinner from '@/components/base/BaseSpinner.vue';

const modules = [Pagination];
const pageSize = 6; // 서버 요청 크기
const isLoadingMore = ref(false); // 하단 로딩 스피너
const pageIndex = ref(0);
const hasNext = ref(true); // 다음 페이지 존재 여부

const onScroll = async () => {
  if (isLoadingMore.value || !hasNext.value) return;
  const scrollY = window.scrollY || window.pageYOffset;
  const viewport = window.innerHeight;
  const full = document.documentElement.scrollHeight;
  if (scrollY + viewport >= full - 200) {
    await loadMore();
  }
};

const isMobile = ref(window.innerWidth <= 768);
const handleResize = () => {
  isMobile.value = window.innerWidth <= 768;
};
onMounted(() => {
  window.addEventListener('resize', handleResize);
});

// 로딩 및 검색 결과 표시 상태
const loading = ref(false);
const showSearchResults = ref(true);

// 필터 상태 정의
const filters = ref({
  creditCard: true,
  debitCard: true,
  selectedBenefits: [],
});

// 혜택 카테고리 정의
const benefitCategories = ref([
  { id: '모든가맹점', name: '모든가맹점', emoji: '🏢' },
  { id: '교통', name: '교통', emoji: '🚗' },
  { id: '주유', name: '주유', emoji: '🛢️' },
  { id: '통신', name: '통신', emoji: '📱' },
  { id: '마트/편의점', name: '마트/편의점', emoji: '🛒' },
  { id: '쇼핑', name: '쇼핑', emoji: '🎁' },
  { id: '푸드', name: '푸드', emoji: '🍽️' },
  { id: '카페/디저트', name: '카페/디저트', emoji: '☕' },
  { id: '뷰티/피트니스', name: '뷰티/피트니스', emoji: '🚨' },
  { id: '무실적', name: '무실적', emoji: '💰' },
  { id: '공과금/렌탈', name: '공과금/렌탈', emoji: '🧾' },
  { id: '병원/약국', name: '병원/약국', emoji: '🏥' },
  { id: '애완동물', name: '애완동물', emoji: '🐱' },
  { id: '교육/육아', name: '교육/육아', emoji: '✏️' },
  { id: '자동차/하이패스', name: '자동차/하이패스', emoji: '🚗' },
  { id: '레저/스포츠', name: '레저/스포츠', emoji: '⚾' },
  { id: 'OTT/영화/문화', name: 'OTT/영화/문화', emoji: '🎬' },
  { id: '간편결제', name: '간편결제', emoji: '💳' },
  { id: '항공마일리지', name: '항공마일리지', emoji: '✈️' },
  { id: '공항라운지/PP', name: '공항라운지/PP', emoji: '💺' },
  { id: '프리미엄', name: '프리미엄', emoji: '💎' },
  { id: '여행/숙박', name: '여행/숙박', emoji: '🧳' },
  { id: '해외', name: '해외', emoji: '🌍' },
  { id: '비즈니스', name: '비즈니스', emoji: '💼' },
]);

// 추천 캐러셀 카드 및 페르소나명
const carouselCards = ref([]);
const userPersonaType = ref('');

// 추천 카드 불러오기
const fetchRecommendedCards = async () => {
  try {
    const token = localStorage.getItem('accessToken');
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    // 사용자 페르소나 카드 추천 가져오기
    const recommendationRes = await api.get('/cards/recommendations/user/recommendation', config);
    const result = recommendationRes.data.result;

    userPersonaType.value = result.personaName || '토끼형';
    carouselCards.value = (result.cards || []).map((item) => ({
      id: item.cardId,
      name: item.cardName,
      image: item.cardImageUrl || '',
      issuer: item.issuer || '',
      preMonthMoney: item.preMonthMoney,
      annualFee: item.annualFee,
      options: item.options,
      isLiked: item.isLiked,
      likeCount: item.likeCount,
    }));
  } catch (err) {
    console.error('❌ 사용자 기반 페르소나 카드 불러오기 실패:', err);
    userPersonaType.value = '토끼형';
    carouselCards.value = [];
  }
};

// 카드 검색 결과
const searchResults = ref([]);

// 서버에서 커서 기반 페이지 가져오는 함수
const fetchPage = async (page) => {
  const token = localStorage.getItem('accessToken');

  const body = {
    creditCard: filters.value.creditCard,
    debitCard: filters.value.debitCard,
    selectedBenefits: filters.value.selectedBenefits
      .map((id) => benefitCategories.value.find((b) => b.id === id)?.name)
      .filter(Boolean),
  };

  const qs = new URLSearchParams();

  qs.set('page', String(page));
  qs.set('size', String(pageSize));

  const res = await api.post(`/persona/cardsearch?${qs.toString()}`, body, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  const list = res.data || []; // 백엔드가 List<CardListItemDTO> 반환
  const items = list.map((item) => ({
    id: item.cardProductId ?? item.id ?? item.cardId,
    name: item.name ?? item.cardName,
    issuer: item.issuer,
    preMonthMoney: item.preMonthMoney ?? null,
    annualFee: item.annualFee ?? null,
    imageUrl: item.cardImageUrl ?? item.imageUrl ?? '',
    options: item.options ?? [],
    isStarred: item.isStarred ?? false,
    isLiked: item.isLiked ?? false,
    likeCount: item.likeCount ?? 0,
  }));

  searchResults.value.push(...items);
  hasNext.value = items.length === pageSize; // 페이지가 꽉 찼으면 다음 있음
  pageIndex.value = page + 1;
};

// 최초 검색(초기화 + 첫 페이지 로드)
const searchProducts = async () => {
  loading.value = true;
  showSearchResults.value = true;
  searchResults.value = [];
  pageIndex.value = 0;
  hasNext.value = true;
  try {
    await fetchPage(0);
  } catch (e) {
    console.error('카드 검색 오류:', e);
  } finally {
    loading.value = false;
  }
};

const MIN_SPINNER_MS = 1400;
// 더 불러오기(스크롤 트리거)
const loadMore = async () => {
  if (!hasNext.value || isLoadingMore.value) return;
  isLoadingMore.value = true;
  const started = performance.now();
  try {
    await fetchPage(pageIndex.value);
  } catch (err) {
    const status = err?.response?.status;
    if (status === 404) hasNext.value = false; // 더 이상 없음
    if (status === 401 || status === 403 || status === 500) {
      hasNext.value = false; // 반복 호출 방지
      console.error('infinite error', status, err?.response?.data);
    }
  } finally {
    const elapsed = performance.now() - started;
    const remain = Math.max(0, MIN_SPINNER_MS - elapsed);
    setTimeout(() => {
      isLoadingMore.value = false;
    }, remain);
  }
};

onMounted(() => {
  window.addEventListener('scroll', onScroll);
});

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll);
  window.removeEventListener('resize', handleResize);
});

// 혜택 토글 함수
const toggleBenefit = (id) => {
  const index = filters.value.selectedBenefits.indexOf(id);
  if (index === -1) filters.value.selectedBenefits.push(id);
  else filters.value.selectedBenefits.splice(index, 1);
  searchProducts();
};

// 카드 선택 동작
const selectProduct = (product) => {
  window.location.href = `/detail/card/${product.id}`;
};

// 은행 로고 가져오기
const getBankLogo = (initial) => {
  const logos = {
    shinhan: 'https://d1c5n4ri2guedi.cloudfront.net/card/2835/card_img/41600/2835card.png',
    hana: 'https://d1c5n4ri2guedi.cloudfront.net/card/718/card_img/28063/718card.png',
  };
  return logos[initial] || 'https://d1c5n4ri2guedi.cloudfront.net/card/2835/card_img/41600/2835card.png';
};

onMounted(() => {
  fetchRecommendedCards();
  searchProducts(); // 페이지 로드시 자동 실행
});
</script>

<style scoped>
/* Layout 및 전체 구조 */
.card-product-search {
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

/* 페르소나 추천 캐러셀 스타일 */
.persona-carousel-title {
  font-size: var(--font-size-xl);
  margin-bottom: var(--spacing-lg);
  text-align: center;
}
.carousel-card-list {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 2rem;
  margin: 0 auto var(--spacing-2xl);
  max-width: 75rem;
  padding: 0 1rem;
}
.carousel-card {
  width: 400px;
  height: 28rem;
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: transform 0.3s ease;
}
.carousel-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
}
.carousel-card-image {
  width: 14rem;
  height: 14rem;
  object-fit: contain;
  border-radius: 12px;
}
.carousel-card-name {
  margin-top: 1rem;
  font-size: 1.1rem;
  font-weight: 600;
  text-align: center;
}
.carousel-card-benefit {
  font-size: 0.9rem;
  color: #333;
  line-height: 1.5;
  text-align: left;
  margin-top: 0.5rem;
  text-align: center;
}

.carousel-card-content {
  width: 100%;
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.label {
  font-weight: 600;
  margin-right: 4px;
  color: #333;
}

/* 필터 영역 스타일 */
.filter-selection-section {
  background: #f9fafc;
  border: 1px solid #e0e0e0;
  border-radius: 20px;
  padding: 2rem;
  margin: 0 auto var(--spacing-2xl);
  max-width: 75rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
}
.card-type-toggle {
  margin-bottom: var(--spacing-lg);
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-md);
  padding: 0 var(--spacing-md);
}
.type-btn {
  width: 100%;
  padding: var(--spacing-md);
  border: 2px solid var(--border-light);
  background: var(--color-white);
  cursor: pointer;
  border-radius: var(--spacing-md);
  font-size: var(--font-size-base);
}
.type-btn.active {
  background: var(--color-accent);
  color: var(--color-white);
  border-color: var(--color-accent);
}
.benefit-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(6.5rem, 1fr));
  gap: 1rem;
  margin: var(--spacing-lg) 0;
  padding: 0 var(--spacing-md);
}
.benefit-button {
  width: 6.5rem;
  height: 6.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-md);
  border: 1.5px solid #dcdcdc;
  border-radius: 16px;
  background: #ffffff;
  cursor: pointer;
  font-weight: 500;
  text-align: center;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03);
  transition: all 0.2s ease-in-out;
}
.benefit-button:hover {
  background-color: #f1fdf6;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}
.benefit-button.selected {
  background: #4caf50;
  color: #fff;
  border-color: #4caf50;
}
.benefit-button .emoji {
  font-size: 1.7rem;
  margin-bottom: 0.4rem;
}

/* 검색 결과 카드 스타일 */
.search-results-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-md);
}
.product-info h4 {
  margin: 0;
  font-size: var(--font-size-lg);
  font-weight: bold;
}
.product-details {
  margin-top: var(--spacing-xs);
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}
.highlight {
  font-size: var(--font-size-2xl);
  color: #2e7d32;
  font-weight: 900;
}

.filter-label {
  font-size: var(--font-size-lg);
  font-weight: 700;
  color: var(--color-dark);
  margin-bottom: var(--spacing-md);
  text-align: left;
}

/* 반응형 (모바일) 스타일 */
@media (max-width: 768px) {
  .search-results-grid {
    grid-template-columns: 1fr;
  }
  .benefit-grid {
    display: grid !important;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 0.75rem;
    overflow: visible; /* 기존 overflow-x 제거 효과 */
    scroll-snap-type: none; /* 스냅 제거 */
    padding: 0 var(--spacing-sm);
  }

  .benefit-button {
    width: 100%;
    min-height: 4rem;
    aspect-ratio: 1 / 1;
    padding: 0.4rem;
    border-radius: 12px;
    flex: initial;
    scroll-snap-align: unset;
  }

  .benefit-button .emoji {
    font-size: 1.6rem;
    margin-bottom: 0.2rem;
  }

  /* 라벨: 2줄까지 깔끔히 보이게 */
  .benefit-button span:last-child {
    font-size: 0.92rem;
    line-height: 1.25;
    text-align: center;
    display: -webkit-box;
    -webkit-line-clamp: 2; /* 최대 2줄 */
    -webkit-box-orient: vertical;
    overflow: hidden;
    word-break: keep-all;
  }

  .carousel-card-list {
    justify-content: center;
    overflow-x: hidden;
  }
  .carousel-card {
    width: 220px;
    height: 320px;
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
}
</style>
<style scoped>
.product-card {
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
.product-card:hover {
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
/* Empty state 스타일 */
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
</style>
<style scoped>
.carousel-swiper {
  width: 100%;
  padding-bottom: 1.5rem;
}
.swiper-pagination-bullets {
  text-align: center;
}
.swiper-pagination-bullet {
  background: #4caf50;
  opacity: 0.4;
}
.swiper-pagination-bullet-active {
  opacity: 1;
}
.card-favorite-button {
  width: 100%;
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-bottom: 0.2rem;
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

.infinite-spinner-wrapper {
  grid-column: 1 / -1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem 0 1rem 0;
}
.infinite-spinner {
  border: 6px solid #eee;
  border-top: 6px solid #609966;
  border-radius: 50%;
  width: 48px;
  height: 48px;
  animation: spin 1s linear infinite;
}
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
.infinite-spinner-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.8rem;
}
.infinite-spinner-text {
  font-size: 0.95rem;
  color: var(--text-secondary);
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-2xl) var(--spacing-lg);
  text-align: center;
}

@media (max-width: 768px) {
  .product-content {
    display: grid;
    grid-template-columns: 100px 1fr; /* 120px에서 100px로 줄임 */
    align-items: center;
    gap: 1.5rem; /* 1.5rem에서 1rem으로 줄임 */
    width: 100%;
    height: 100%;
    padding-bottom: 1.6rem;
  }

  .product-content img {
    height: 120px; /* 150px에서 120px로 줄임 */
    width: 100%;
    object-fit: contain;
    border-radius: 12px;
    flex-shrink: 0;
  }

  .product-card {
    background: var(--bg-content);
    border-radius: var(--spacing-xl);
    padding: var(--spacing-lg);
    cursor: pointer;
    height: 20rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: start;
    text-align: center;
    min-height: 20rem;
  }
}
</style>
