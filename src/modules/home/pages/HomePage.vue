<template>
  <div class="main-page">
    <div class="slider-container">
      <!-- 슬라이드 버튼 -->
      <div class="slide-indicators">
        <button
          v-for="(slide, index) in slides"
          :key="index"
          :class="['indicator', { active: currentSlide === index }]"
          @click="goToSlide(index)"
        >
          <span class="indicator-text">{{ slide.name }}</span>
        </button>
      </div>

      <!-- 슬라이드 래퍼 -->
      <div
        class="slider-wrapper"
        :style="{ transform: `translateX(-${currentSlide * 100}vw)` }"
        @touchstart="handleTouchStart"
        @touchmove="handleTouchMove"
        @touchend="handleTouchEnd"
      >
        <section class="slide hero-section">
          <div class="container">
            <div class="hero-content-wrapper">
              <div class="hero-left">
                <div class="hero-content">
                  <h1 class="hero-title">
                    나만의
                    <span class="text-accent">금융 라이프스타일을</span><br />
                    찾아보세요
                  </h1>
                  <p class="section-subtitle">
                    8가지 동물 페르소나 분석을 통해 당신에게 딱 맞는 카드, 예금,
                    적금 상품을 추천해드립니다.
                  </p>
                  <div class="hero-buttons">
                    <RouterLink
                      :to="
                        authStore.isLoggedIn
                          ? `/persona/result/${personaSlug || 'turtle'}`
                          : '/login'
                      "
                    >
                      <button
                        class="btn persona-start-btn"
                        @click="startPersonaTest"
                      >
                        <i class="icon-play"></i>
                        <span>{{ buttonText }}</span>
                      </button>
                    </RouterLink>
                  </div>
                </div>
              </div>
              <div class="hero-right">
                <div class="hero-image">
                  <div class="hero-main-icon">
                    <div class="icon-bg">
                      <img
                        src="@/assets/character_images/together-animals-unscreen.gif"
                        class="hero-video"
                        autoplay
                        muted
                        loop
                        playsinline
                      ></img>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section class="slide persona-section">
          <div class="container">
            <div class="section-header text-center">
              <h2 class="section-title">8가지 동물 페르소나</h2>
              <p class="section-subtitle">
                당신은 어떤 금융 성향을 가지고 있나요?
              </p>
            </div>
            <div class="persona-grid grid" :class="getGridClass('personas')">
              <div
                v-for="persona in personas"
                :key="persona.id"
                class="persona-item"
              >
                <div class="card persona-card" @click="selectPersona(persona)">
                  <div class="persona-image">
                    <img
                      :src="getImageUrl(persona.image)"
                      :alt="persona.name"
                      class="persona-img"
                      loading="lazy"
                    />
                  </div>
                  <div class="persona-info">
                    <h6 class="persona-name">{{ persona.name }}</h6>
                    <p class="persona-trait">{{ persona.trait }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section class="slide products-section">
          <div class="container">
            <div class="section-header text-center">
              <h2 class="section-title">맞춤형 금융상품 추천</h2>
              <p class="section-subtitle">
                페르소나 분석과 마이데이터를 통한 개인화된 추천
              </p>
            </div>
            <div class="products-grid grid" :class="getGridClass('products')">
              <div
                v-for="product in products"
                :key="product.id"
                class="product-item"
              >
                <div class="card product-card">
                  <div class="product-header">
                    <div class="product-icon-container">
                      <i :class="product.icon"></i>
                    </div>
                    <div class="product-info">
                      <h5 class="product-title">{{ product.title }}</h5>
                      <small class="product-subtitle">{{
                        product.subtitle
                      }}</small>
                    </div>
                  </div>
                  <p class="product-description">{{ product.description }}</p>
                  <ul class="product-benefits">
                    <li
                      v-for="(benefit, idx) in product.benefits"
                      :key="idx"
                      class="benefit-item"
                    >
                      <i class="icon-check"></i>
                      <small>{{ benefit }}</small>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section class="slide mydata-section">
          <div class="container">
            <div class="mydata-content-wrapper">
              <div class="mydata-left">
                <h2 class="mydata-title">마이데이터 연동</h2>
                <p class="section-subtitle">
                  실제 거래내역을 분석하여 더욱 정확한 맞춤형 카드를
                  추천받으세요.
                </p>
                <div class="mydata-features">
                  <div
                    v-for="(feature, idx) in mydataFeatures"
                    :key="idx"
                    class="mydata-feature"
                  >
                    <i :class="`${feature.icon} mydata-icon`"></i>
                    <div class="mydata-feature-content">
                      <h6 class="mydata-feature-title">{{ feature.title }}</h6>
                      <small class="mydata-feature-desc">{{
                        feature.desc
                      }}</small>
                    </div>
                  </div>
                </div>
              </div>
              <div class="mydata-right">
                <div class="mydata-visual">
                  <div class="mydata-demo-card">
                    <div class="demo-grid">
                      <div class="demo-item">
                        <i class="icon-credit-card demo-icon"></i>
                        <div class="demo-text">KB카드</div>
                      </div>
                      <div class="demo-item">
                        <i class="icon-chart demo-icon"></i>
                        <div class="demo-text">분석</div>
                      </div>
                      <div class="demo-item demo-highlight">
                        <i class="icon-star demo-icon"></i>
                        <div class="demo-text">맞춤 추천</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <!-- 좌우 네비게이션 -->
      <div class="slide-navigation" v-if="!isMobile">
        <button class="nav-btn prev-btn" @click="prevSlide">
          <i class="icon-arrow-left"></i>
        </button>
        <button class="nav-btn next-btn" @click="nextSlide">
          <i class="icon-arrow-right"></i>
        </button>
      </div>
    </div>

    <!-- 자동 재생 컨트롤 -->
    <div class="auto-play-control">
      <button class="play-pause-btn" @click="toggleAutoPlay">
        <i :class="isAutoPlaying ? 'icon-pause' : 'icon-play'"></i>
      </button>
    </div>

    <!-- 슬라이드 아래 설명 -->
    <section class="features-section alt-layout">
      <div class="container">
        <div class="section-header text-center">
          <h2 class="section-title">왜 맞추머니인가요?</h2>
          <p class="section-subtitle">누구에게나 딱 맞는 금융의 기준</p>
        </div>

        <div
          class="feature-block"
          v-for="feature in features"
          :key="feature.id"
        >
          <div class="feature-icon">
            <i :class="feature.icon"></i>
          </div>
          <div class="feature-text">
            <h4 class="feature-title">{{ feature.title }}</h4>
            <p class="feature-description">{{ feature.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="cta-section">
      <div class="container text-center">
        <h2 class="cta-title">지금 시작해보세요!</h2>
        <p class="cta-description">
          맞추머니로 나만의 금융 페르소나를 찾아보세요!
        </p>
        <div class="cta-buttons">
          <RouterLink to="/signup">
            <button class="btn btn-outline-light btn-large">
              <span>무료 회원가입</span>
            </button>
          </RouterLink>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import userApi from '@/api/user';

const router = useRouter();
const authStore = useAuthStore();
const myPageInfo = ref({ persona: {} });

// 반응형 상태
const windowWidth = ref(window.innerWidth);
const isMobile = computed(() => windowWidth.value < 768);
const isTablet = computed(
  () => windowWidth.value >= 768 && windowWidth.value < 1024
);

// 슬라이드 관련 상태
const currentSlide = ref(0);
const isAutoPlaying = ref(true);
let autoPlayInterval = null;

// 터치 이벤트 관련
const touchStartX = ref(0);
const touchEndX = ref(0);

const slides = ref([
  { name: '홈', icon: '🏠' },
  // { name: '특징', icon: '⭐' },
  { name: '페르소나', icon: '🐾' },
  { name: '상품', icon: '💳' },
  { name: '마이데이터', icon: '📊' },
]);

const PERSONA_SLUG_MAP = {
  고양이: 'cat',
  개미: 'ant',
  토끼: 'rabbit',
  거북이: 'turtle',
  펭귄: 'penguin',
  부엉이: 'owl',
  호랑이: 'tiger',
  다람쥐: 'squirrel',
};

function mapPersonaSlugFromName(nameKo) {
  if (!nameKo) return '';
  return PERSONA_SLUG_MAP[nameKo.trim()] || '';
}

function extractSlugFromImage(url) {
  if (!url) return '';
  const file = (url.split('/').pop() || '').toLowerCase();
  return file.replace(/\.[^.]+$/, ''); // "cat.png" → "cat"
}

const personaSlug = computed(() => {
  const nameKo = myPageInfo.value?.persona?.nameKo || '';
  let slug = mapPersonaSlugFromName(nameKo);
  if (!slug) {
    slug = extractSlugFromImage(myPageInfo.value?.persona?.imageUrl || '');
  }
  return slug || '';
});

const features = ref([
  {
    id: 1,
    icon: 'icon-user-heart text-accent',
    title: '페르소나 기반 추천',
    description:
      '8가지 동물 페르소나를 통한 맞춤형 금융상품 추천으로 당신에게 딱 맞는 상품을 찾아드립니다.',
  },
  {
    id: 2,
    icon: 'icon-chart text-accent',
    title: '마이데이터 연동',
    description:
      '실제 거래내역 분석을 통한 개인화된 카드 추천으로 더욱 정확한 맞춤 서비스를 제공합니다.',
  },
  {
    id: 3,
    icon: 'icon-collection text-accent',
    title: '원스톱 플랫폼',
    description:
      '카드, 예금, 적금 상품을 한 곳에서 비교하고 추천받을 수 있는 통합 금융 플랫폼입니다.',
  },
]);

const personas = ref([
  { id: 1, image: 'turtle.png', name: '거북이', trait: '안정적인 투자성향' },
  { id: 2, image: 'squirrel.png', name: '다람쥐', trait: '꼼꼼한 저축형' },
  { id: 3, image: 'ant.png', name: '개미', trait: '성실한 적금형' },
  { id: 4, image: 'owl.png', name: '부엉이', trait: '신중한 분석형' },
  { id: 5, image: 'rabbit.png', name: '토끼', trait: '활발한 소비형' },
  { id: 6, image: 'cat.png', name: '고양이', trait: '자유로운 라이프스타일' },
  { id: 7, image: 'tiger.png', name: '호랑이', trait: '적극적인 투자형' },
  { id: 8, image: 'penguin.png', name: '펭귄', trait: '균형잡힌 관리형' },
]);

const products = ref([
  {
    id: 1,
    icon: 'icon-credit-card text-accent',
    title: '카드 추천',
    subtitle: '맞춤형 신용카드',
    description: '페르소나와 소비패턴을 분석하여 최적의 카드를 추천합니다.',
    benefits: ['연회비 최적화', '혜택 맞춤 분석', '실시간 비교'],
  },
  {
    id: 2,
    icon: 'icon-bank text-accent',
    title: '예금 추천',
    subtitle: '안전한 예금상품',
    description: '안정적인 수익을 원하는 분들을 위한 예금상품을 추천합니다.',
    benefits: ['높은 금리', '예치 기간 선택', '원금 보장'],
  },
  {
    id: 3,
    icon: 'icon-piggy-bank text-accent',
    title: '적금 추천',
    subtitle: '목돈 마련 적금',
    description: '목표 달성을 위한 체계적인 적금상품을 추천합니다.',
    benefits: ['목표 설정', '자동 이체', '우대 금리'],
  },
]);

const mydataFeatures = ref([
  {
    icon: 'icon-shield',
    title: '안전한 데이터 연동',
    desc: 'CODEF를 통한 보안 연동',
  },
  {
    icon: 'icon-chart',
    title: '소비 패턴 분석',
    desc: 'Chart.js 기반 시각화',
  },
  {
    icon: 'icon-lightbulb',
    title: '개인화된 추천',
    desc: '실사용 패턴 기반 맞춤 추천',
  },
]);

// 메서드
const getImageUrl = (imageName) => {
  return new URL(`../assets/character_images/${imageName}`, import.meta.url)
    .href;
};

const getGridClass = (type) => {
  if (type === 'features') {
    return isMobile.value ? 'grid-cols-1' : 'grid-cols-3';
  } else if (type === 'personas') {
    if (windowWidth.value < 480) return 'grid-cols-1';
    if (isMobile.value) return 'grid-cols-2';
    if (isTablet.value) return 'grid-cols-3';
    return 'grid-cols-4';
  } else if (type === 'products') {
    return isMobile.value ? 'grid-cols-1' : 'grid-cols-3';
  }
  return '';
};

// 터치 이벤트 핸들러
const handleTouchStart = (e) => {
  touchStartX.value = e.touches[0].clientX;
};

const handleTouchMove = (e) => {
  touchEndX.value = e.touches[0].clientX;
};

const handleTouchEnd = () => {
  if (!touchStartX.value || !touchEndX.value) return;

  const diff = touchStartX.value - touchEndX.value;
  const threshold = 50;

  if (Math.abs(diff) > threshold) {
    if (diff > 0) {
      nextSlide();
    } else {
      prevSlide();
    }
  }

  touchStartX.value = 0;
  touchEndX.value = 0;
};

// 슬라이드 메서드
const nextSlide = () => {
  currentSlide.value = (currentSlide.value + 1) % slides.value.length;
  if (isAutoPlaying.value) {
    stopAutoPlay();
    startAutoPlay();
  }
};

const prevSlide = () => {
  currentSlide.value =
    currentSlide.value === 0 ? slides.value.length - 1 : currentSlide.value - 1;
  if (isAutoPlaying.value) {
    stopAutoPlay();
    startAutoPlay();
  }
};

const goToSlide = (index) => {
  currentSlide.value = index;
  if (isAutoPlaying.value) {
    stopAutoPlay();
    startAutoPlay();
  }
};

const toggleAutoPlay = () => {
  isAutoPlaying.value = !isAutoPlaying.value;
  if (isAutoPlaying.value) {
    startAutoPlay();
  } else {
    stopAutoPlay();
  }
};

const startAutoPlay = () => {
  if (autoPlayInterval) clearInterval(autoPlayInterval);
  autoPlayInterval = setInterval(() => {
    nextSlide();
  }, 5000);
};

const stopAutoPlay = () => {
  if (autoPlayInterval) {
    clearInterval(autoPlayInterval);
    autoPlayInterval = null;
  }
};

// 페르소나 선택
const selectPersona = (persona) => {
  console.log('선택된 페르소나:', persona);
  // 페르소나 상세 페이지로 이동하거나 모달 표시
};

// 버튼 텍스트를 로그인 상태에 따라 결정
const buttonText = computed(() => {
  return authStore.isLoggedIn ? '나의 페르소나 보기' : '금융 상품 추천 시작';
});

const startPersonaTest = () => {
  if (authStore.isLoggedIn) {
    const slug = personaSlug.value;
    if (slug) {
      router.push(`/persona/result/${slug}`);
    } else {
      router.push('/persona/result');
    }
  } else {
    router.push('/login');
  }
};

// 윈도우 리사이즈 핸들러
const handleResize = () => {
  windowWidth.value = window.innerWidth;
};

// 라이프사이클
onMounted(() => {
  startAutoPlay();
  window.addEventListener('resize', handleResize);

  // 로그인된 사용자의 페르소나 정보 조회
  if (authStore.isLoggedIn) {
    fetchMyPageInfo();
  }
});

const fetchMyPageInfo = async () => {
  try {
    const response = await userApi.getMyPage();
    const data = response.result;

    if (data?.persona) {
      myPageInfo.value.persona = {
        nameKo: data.persona.nameKo || '',
        imageUrl: data.persona.imageUrl || '',
      };
    }
  } catch (error) {
    console.error('페르소나 정보 조회 실패:', error);
  }
};

onUnmounted(() => {
  stopAutoPlay();
  window.removeEventListener('resize', handleResize);
});
</script>

<style>
.default-layout {
  padding: 0 !important;
  margin: 0 !important;
}
.content {
  margin: 0 !important;
}
</style>
<style scoped>
/* Enlarged Hero Video */
.hero-video {
  width: 100%;
  max-width: 480px;
  height: auto;
  object-fit: contain;
  border-radius: 20px;
  display: block;
  margin: 0 auto;
  animation: float 3s ease-in-out infinite;
}
</style>
<style scoped>
/* 슬라이더 스타일 */
.slider-container {
  position: relative;
  overflow: hidden;
  height: 70vh;
  min-height: 500px;
}

.slider-wrapper {
  display: flex;
  width: 500vw;
  height: 100%;
  transition: transform 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide {
  width: 20%;
  height: 70vh;
  min-height: 500px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 슬라이드 인디케이터 */
.slide-indicators {
  position: absolute;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 1rem;
  z-index: 10;
  flex-wrap: wrap;
  justify-content: center;
  max-width: 90%;
}

.indicator {
  padding: 0.5rem 1.25rem;
  background: rgba(255, 255, 255, 0.8);
  border: 2px solid rgba(255, 255, 255, 0.5);
  border-radius: 25px;
  color: var(--color-title);
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  white-space: nowrap;
}

.indicator:hover {
  background: rgba(255, 255, 255, 0.4);
  border-color: rgba(255, 255, 255, 0.7);
  transform: translateY(-2px);
}

.indicator.active {
  background: var(--color-accent);

  font-weight: bold;
  color: white;
  transform: translateY(-2px);
}

/* 슬라이드 네비게이션 */
.slide-navigation {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 100%;
  display: flex;
  justify-content: space-between;
  padding: 0 2rem;
  z-index: 10;
  pointer-events: none;
}

.nav-btn {
  width: 50px;
  height: 50px;
  background: rgba(255, 255, 255, 0.2);
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  color: black;
  font-size: 1.25rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
  pointer-events: auto;
}

.nav-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.5);
  transform: scale(1.1);
}

/* 자동 재생 컨트롤 */
.auto-play-control {
  position: absolute;
  top: 30px;
  right: 30px;
  z-index: 10;
}

.play-pause-btn {
  width: 45px;
  height: 45px;
  background: rgba(255, 255, 255, 0.2);
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  color: white;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
  margin-top: 50px;
}

.play-pause-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.5);
  transform: scale(1.1);
}

/* 슬라이드 배경색 */
.hero-section {
  background-color: #e5fbf6;
}

.features-section {
  background: linear-gradient(135deg, #faf5e8 0%, #f1e8d7 100%);
}

.persona-section {
  background: linear-gradient(135deg, #f2f6f3 0%, #e1ece7 100%);
}

.products-section {
  background: linear-gradient(135deg, #f7f4ef 0%, #e7ddd1 100%);
}

.mydata-section {
  background: linear-gradient(135deg, #e2f0ed 0%, #c9e3db 100%);
}

/* 컨테이너 및 그리드 스타일 */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
  width: 100%;
}

.grid {
  display: grid;
  gap: 1rem;
}

.grid-cols-3 {
  grid-template-columns: repeat(3, 1fr);
}

.grid-cols-4 {
  grid-template-columns: repeat(4, 1fr);
}

.text-center {
  text-align: center;
}

.text-accent {
  color: var(--color-accent);
}

.mt-5 {
  margin-top: 3rem;
}

/* 카드 스타일 */
.card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  border: 1px solid #f1f5f9;
  transition: all 0.3s ease;
}

.card:hover {
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1),
    0 4px 6px -2px rgba(0, 0, 0, 0.05);
  transform: translateY(-2px);
}

/* 버튼 스타일 */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 2rem;
  border-radius: 0.75rem;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  font-size: 1rem;
}

.btn-primary {
  background: var(--color-accent);
  color: white;
}

.btn-primary:hover {
  background: var(--color-accent);
  transform: translateY(-2px);
}

.persona-start-btn {
  background: var(--color-accent);
  color: white;
  border: none;
  border-radius: 0.75rem;
  padding: 1rem 2rem;
  font-size: 1.125rem;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
}

.persona-start-btn:hover {
  background: var(--color-accent);
  transform: translateY(-2px);
}

.btn-large {
  padding: 1rem 2rem;
  font-size: 1.125rem;
  font-weight: 600;
}

.btn-outline-light {
  background-color: var(--color-accent);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  border-radius: 8px;
  transition: background-color 0.3s ease;
}

.btn-outline-light:hover {
  background-color: #2da77a;
}

/* Hero Section */
.hero-content-wrapper {
  display: grid;
  grid-template-columns: 3fr 2fr;
  gap: 3rem;
  align-items: center;
}

.hero-title {
  font-size: clamp(2rem, 5vw, 3rem);
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 1.5rem;
  line-height: 1.2;
}

.persona-together-image {
  width: 100%;
  max-width: 300px;
  height: auto;
  object-fit: contain;
  display: block;
  margin: 0 auto;
  animation: float 3s ease-in-out infinite;
}

.hero-description {
  font-size: var(--font-size-lg);
  color: #6b7280;
  margin-bottom: 2rem;
  line-height: 1.6;
}

.hero-buttons {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

/* Hero Image */
.hero-image {
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
}

.hero-main-icon {
  position: relative;
  width: 100%;
  justify-items: center;
}

.icon-bg {
  width: 100%;
  max-width: 400px;
  height: auto;
  display: flex;
  align-items: center;
  justify-content: center;
}

.floating-cards {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.floating-card {
  position: absolute;
  width: 60px;
  height: 60px;
  background: white;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-card);
  animation: float 3s ease-in-out infinite;
}

.floating-card i {
  font-size: 1.5rem;
}

.card-1 {
  top: 20%;
  right: 10%;
  animation-delay: 0s;
}

.card-2 {
  top: 60%;
  right: 20%;
  animation-delay: 1s;
}

.card-3 {
  top: 40%;
  left: 10%;
  animation-delay: 2s;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-20px);
  }
}

/* Section Header */
.section-header {
  margin-bottom: 2rem;
  padding: 0 1rem;
}

.section-title {
  font-size: clamp(1.5rem, 4vw, 2.5rem);
  margin-bottom: 0.5rem;
  color: var(--color-dark);
  font-weight: 700; /* 또는 800 */
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1); /* 미묘한 그림자 */
  letter-spacing: -0.025em; /* 자간 살짝 줄여서 임팩트 */
}

.section-subtitle {
  font-size: var(--font-size-xl); /* 크기 증가 */
  color: #374151; /* 훨씬 더 진한 색상 */
  font-weight: 400;
  line-height: 1.6;
  letter-spacing: 0.025em;
  text-shadow: 0 1px 1px rgba(0, 0, 0, 0.05); /* 미묘한 그림자 */
}

/* Feature Cards */
.features-section.alt-layout {
  background: linear-gradient(135deg, #f5fdf9 0%, #e6f3ec 100%);
  padding: 4rem 1.5rem;
  text-align: center;
}

.feature-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 1rem;
  margin-bottom: 2.5rem;
  max-width: 700px;
  margin-left: auto;
  margin-right: auto;
}

.feature-icon {
  font-size: 2rem;
  color: #34c38f;
  background-color: #e2f4ed;
  padding: 1rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.feature-text {
  flex-grow: 1;
  max-width: 100%;
}

.feature-title {
  font-size: var(--font-size-xl);
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.feature-description {
  font-size: 1rem;
  color: #4b5563;
  line-height: 1.6;
}

/* Persona Cards */
.persona-grid {
  display: grid;
  grid-template-columns: repeat(4, 180px);
  gap: 2rem;
  justify-content: center; /* 가운데 정렬 */
}

.persona-card {
  width: 200px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 0.6rem !important;
}

.persona-card:hover {
  border-color: var(--color-accent);
  transform: translateY(-4px); /* hover 효과도 약간 줄임 */
}

.persona-img {
  width: clamp(40px, 8vw, 60px); /* 전체적으로 줄임 */
  height: clamp(40px, 8vw, 60px);
  object-fit: contain;
  transition: transform 0.3s ease;
  margin-bottom: 0.5rem;
}

.persona-card:hover .persona-img {
  transform: scale(1.15); /* 확대도 약간 줄임 */
}

.persona-name {
  font-size: var(--font-size-base);
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.2rem;
}

.persona-trait {
  font-size: var(--font-size-base);
  color: #6b7280;
  margin-bottom: 0.1rem;
}

/* Product Cards */
.products-grid {
  gap: 2rem;
}

.product-card {
  height: 100%;
  padding: 1.5rem;
}

.product-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.product-icon-container {
  width: clamp(50px, 10vw, 60px);
  height: clamp(50px, 10vw, 60px);
  background: #dcfce7;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.product-icon-container i {
  font-size: clamp(2rem, 2.5vw, 1.5rem);
  padding-bottom: 0.5rem;
  color: var(--color-accent);
}

.product-title {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.25rem;
}

.product-subtitle {
  color: #6b7280;
  font-size: var(--font-size-base);
}

.product-description {
  font-size: var(--font-size-base);
  color: #6b7280;
  margin-bottom: 1.5rem;
  line-height: 1.6;
}

.product-benefits {
  list-style: none;
  padding: 0;
}

.benefit-item {
  font-size: var(--font-size-base);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.benefit-item i {
  color: var(--color-accent);
  font-size: var(--font-size-base);
  flex-shrink: 0;
}

/* MyData Section */
.mydata-content-wrapper {
  display: grid;
  grid-template-columns: 3fr 2fr;
  gap: 3rem;
  align-items: center;
}

.mydata-title {
  font-size: clamp(1.5rem, 4vw, 2.5rem);
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 1.5rem;
}

.mydata-description {
  font-size: var(--font-size-base);
  color: #6b7280;
  margin-bottom: 2rem;
  line-height: 1.6;
}

.mydata-features {
  margin-bottom: 2rem;
}

.mydata-feature {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.mydata-icon {
  font-size: var(--font-size-3xl);
  color: var(--color-accent);
  flex-shrink: 0;
  margin: 0 0.5rem 0.5rem 1.5rem;
}

.mydata-feature-content {
  flex: 1;
}

.mydata-feature-title {
  font-size: var(--font-size-xl);
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.25rem;
}

.mydata-feature-desc {
  color: #6b7280;
  font-size: var(--font-size-lg);
}

/* MyData Visual */
.mydata-visual {
  display: flex;
  justify-content: center;
  align-items: center;
}

.mydata-demo-card {
  background: white;
  border-radius: 16px;
  padding: clamp(1.5rem, 3vw, 2rem);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1),
    0 4px 6px -2px rgba(0, 0, 0, 0.05);
  animation: pulse 2s ease-in-out infinite;
  width: 100%;
  max-width: 300px;
}

.demo-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.demo-item {
  background: #f9fafb;
  border-radius: 8px;
  padding: 1rem;
  text-align: center;
  transition: all 0.3s ease;
}

.demo-highlight {
  background: #dcfce7;
  grid-column: 1 / -1;
}

.demo-icon {
  font-size: var(--font-size-3xl);

  color: var(--color-accent);
  margin-bottom: 0.5rem;
}

.demo-text {
  font-size: var(--font-size-base);
  font-weight: 500;
  color: #1f2937;
}

@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

/* CTA Section */
.cta-section {
  background: linear-gradient(135deg, #f9f6f1 0%, #e0f4eb 100%);
  color: #1f2937; /* 짙은 그레이 */
  padding: 4rem 1rem;
}

.cta-title {
  font-size: clamp(1.5rem, 4vw, 2.5rem);
  font-weight: 700;
  color: var(--color-title);
  margin-bottom: 1.5rem;
}

.cta-description {
  font-size: clamp(1rem, 2vw, 1.125rem);
  color: var(--color-title);
  margin-bottom: 2rem;
}

.cta-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

/* Icon Classes */
.icon-play::before {
  content: '▶';
}
.icon-pause::before {
  content: '⏸';
}
.icon-arrow-left::before {
  content: '←';
}
.icon-arrow-right::before {
  content: '→';
}
.icon-search::before {
  content: '🔍';
}
.icon-piggy-bank::before {
  content: '🐷';
}
.icon-credit-card::before {
  content: '💳';
}
.icon-bank::before {
  content: '🏦';
}
.icon-chart::before {
  content: '📊';
}
.icon-user-heart::before {
  content: '👤❤';
}
.icon-collection::before {
  content: '📑';
}
.icon-check::before {
  content: '✓';
}
.icon-shield::before {
  content: '🛡';
}
.icon-lightbulb::before {
  content: '💡';
}
.icon-link::before {
  content: '🔗';
}
.icon-star::before {
  content: '⭐';
}
.icon-user-plus::before {
  content: '👤+';
}
.icon-facebook::before {
  content: 'f';
}
.icon-twitter::before {
  content: '🐦';
}
.icon-instagram::before {
  content: '📷';
}
.icon-linkedin::before {
  content: 'in';
}
[class*='icon-'],
i {
  font-style: normal !important;
}

/* Tablet Responsive (768px - 1024px) */
@media (max-width: 1024px) {
  .container {
    max-width: 95%;
  }

  .grid-cols-4 {
    grid-template-columns: repeat(3, 1fr);
  }

  .hero-content-wrapper {
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
  }

  .product-card {
    padding: 1.25rem;
  }

  .slide-indicators {
    gap: 0.75rem;
  }

  .indicator {
    padding: 0.4rem 1rem;
    font-size: 0.8rem;
  }
  .persona-grid {
    grid-template-columns: repeat(2, 160px);
  }
}

/* Mobile Responsive (480px - 768px) */
@media (max-width: 768px) {
  .slide {
    padding: 1rem 0 4rem 0;
  }

  .hero-content-wrapper,
  .mydata-content-wrapper {
    grid-template-columns: 1fr;
    gap: 1.5rem; /* gap 줄임 */
    text-align: center;
  }

  .hero-left,
  .mydata-left {
    order: 2;
  }

  .hero-right,
  .mydata-right {
    order: 1;
  }

  .hero-buttons {
    justify-content: center;
  }

  .grid-cols-3,
  .grid-cols-4 {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }

  .features-grid {
    grid-template-columns: 1fr;
  }

  .persona-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.5rem;
  }

  .products-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  /* 모바일 product-card 최적화 */
  .product-card {
    display: flex;
    align-items: center;
    width: 90%;
    align-items: center;
    margin: 0 auto;
    padding: 1rem;
  }

  .product-header {
    display: flex;
    align-items: center;
    margin-bottom: 0.5rem;
  }

  .product-icon-container {
    flex-shrink: 0;
  }

  .product-info {
    display: flex;
    flex-direction: column;
    justify-content: center; /* 텍스트 묶음 가운데 */
  }

  .product-description {
    margin-bottom: 1rem;
    font-size: 0.875rem;
    line-height: 1.4;
  }

  .product-benefits {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.75rem;
    margin: 0;
    text-align: center;
  }

  .benefit-item {
    justify-content: center;
    font-size: var(--font-size-base);
    margin-bottom: 0;
  }

  .benefit-item i {
    font-size: 1rem;
  }
  .mydata-title {
    font-size: var(--font-size-3xl);
  }
  .floating-cards {
    display: none;
  }

  .btn-large {
    width: 100%;
    max-width: 300px;
    justify-content: center;
  }

  .slide-indicators {
    flex-wrap: nowrap !important;
    overflow-x: auto;
    white-space: nowrap;
    justify-content: flex-start;
    bottom: 0.1rem; /* 하단 여백 증가 */
    padding: 0.75rem 1rem; /* 컨테이너 패딩 증가 */
    margin: 0 1rem;
  }

  .slide-indicators::-webkit-scrollbar {
    display: none; /* 모바일에서 스크롤바 숨김 */
  }

  .indicator {
    flex: 0 0 auto;
    padding: 0.75rem 1.5rem; /* 패딩 대폭 증가 */
    min-width: 4.5rem;
    font-size: 1rem !important;
    background: rgba(255, 255, 255, 0.8);
    border: 1px solid rgba(255, 255, 255, 0.9); /* 테두리 두껍게 */
    margin: 0 0.2rem; /* 버튼 간 간격 증가 */
    min-height: 30px; /* 최소 높이 설정 (터치 권장 크기) */
    border-radius: 24px; /* 더 둥글게 */
  }

  .indicator.active {
    background: var(--color-accent);
    color: white;
    border-color: var(--color-accent);
    transform: none;
    font-weight: 700; /* 활성 버튼 텍스트 더 두껍게 */
  }

  .indicator-text {
    font-weight: 600; /* 텍스트 두껍게 */
    padding: 0 0.5rem;
  }
  .slide-navigation {
    padding: 0 1rem;
  }

  .nav-btn {
    width: 40px;
    height: 40px;
    font-size: 1rem;
  }

  .auto-play-control {
    top: 20px;
    right: 20px;
  }

  .play-pause-btn {
    width: 30px;
    height: 30px;
    font-size: 1rem;
  }

  .mydata-features {
    text-align: left;
  }

  .demo-grid {
    gap: 0.75rem;
  }

  .demo-item {
    padding: 0.75rem;
  }

  .cta-buttons {
    flex-direction: column;
    align-items: center;
  }

  /* 섹션 헤더 최적화 */
  .section-header {
    margin-bottom: 1.5rem;
  }

  .section-title {
    font-size: var(--font-size-4xl);
  }

  .section-subtitle {
    font-size: var(--font-size-xl);
    margin-bottom: 2rem;
  }

  .feature-title {
    font-size: var(--font-size-2xl);
    font-weight: 600;
    margin-bottom: 0.5rem;
  }

  .feature-description {
    font-size: var(--font-size-xl);
    color: #4b5563;
    line-height: 1.6;
  }

  .cta-title {
    font-size: var(--font-size-3xl);
  }

  .cta-description {
    font-size: var(--font-size-xl);
  }

  .cta-buttons .btn {
    font-size: var(--font-size-xl);
  }
}
/* Small Mobile Responsive (< 480px) */
@media (max-width: 480px) {
  /* 🔹 공통 레이아웃 */
  .container {
    padding: 0 0.75rem;
  }

  /* 🔹 슬라이드 */
  .slider-container,
  .slide {
    min-height: auto !important;
    height: auto !important;
  }

  .slide-indicators {
    flex-wrap: wrap;
    justify-content: center;
    max-width: 100%;
    gap: 0.4rem;
  }

  .indicator {
    padding: 0.3rem 0.6rem;
    font-size: 0.7rem;
  }

  .nav-btn {
    width: 36px;
    height: 36px;
    font-size: 0.875rem;
  }

  /* 🔹 페르소나 카드 */
  .persona-grid {
    grid-template-columns: repeat(2, calc(50% - 0.75rem));
    padding: 0 1rem;
  }

  .persona-card {
    width: 100%;
    max-width: none;
  }

  .persona-img {
    width: 50px;
    height: 50px;
    margin-bottom: 0;
  }

  /* 🔹 카드 / 상품 */
  .feature-card,
  .product-card {
    padding: 1rem;
  }

  .product-header {
    /* flex-direction: column; */
    text-align: center;
  }

  /* 🔹 마이데이터 데모 카드 */
  .mydata-demo-card {
    padding: 1rem;
  }

  .demo-grid {
    gap: 0.5rem;
  }

  /* 🔹 버튼 */
  .btn {
    padding: 0.875rem 1.5rem;
    font-size: 0.9rem;
  }

  /* 🔹 섹션 헤더 */
  .section-header {
    margin-bottom: 1.5rem;
  }
}

/* Ultra Small Mobile (< 360px) */
@media (max-width: 360px) {
  .hero-title {
    font-size: 1.75rem;
  }

  .section-title {
    font-size: 1.25rem;
  }

  .indicator {
    padding: 0.25rem 0.5rem;
    font-size: 0.65rem;
  }

  .nav-btn {
    width: 32px;
    height: 32px;
  }

  .btn {
    padding: 0.75rem 1.25rem;
    font-size: 0.875rem;
  }
}

/* Height Responsive for Landscape Mode */
@media (max-height: 600px) and (orientation: landscape) {
  .slider-container {
    min-height: 100vh;
  }

  .slide {
    min-height: 100vh;
    padding: 2rem 0;
  }

  .hero-content-wrapper {
    grid-template-columns: 1fr 1fr;
  }

  .persona-together-image {
    max-width: 200px;
  }

  .section-header {
    margin-bottom: 1rem;
  }

  .slide-indicators {
    bottom: 5px;
  }
}
</style>
