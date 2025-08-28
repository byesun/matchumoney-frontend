<template>
  <!-- 웹툰 Section -->
  <section class="webtoon-section">
    <BackButton />
    <div class="page-description">
      <h1 class="page-title">웹툰으로 배우는 금융 교육</h1>
      <p class="page-subtitle">
        다양하고 재미있는 웹툰으로
        <br />
        어려운 금융 지식을 쉽게 배워보세요
      </p>
    </div>
    <!-- 로딩 상태 -->
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>웹툰을 불러오는 중...</p>
    </div>

    <!-- 에러 상태 -->
    <div v-else-if="error" class="error">
      <p>❌ 웹툰을 불러오는데 실패했습니다.</p>
      <button @click="fetchWebtoons" class="retry-btn">다시 시도</button>
    </div>

    <!-- 웹툰 목록 (시리즈별 그룹화) -->
    <div v-else>
      <div
        v-for="(episodes, series) in groupedWebtoons"
        :key="series"
        class="series-block"
      >
        <br />
        <div
          class="series-header"
          :aria-expanded="!isMobile || !!expanded[series]"
          :aria-controls="`panel-${series}`"
          role="button"
          @click="isMobile && toggleSeries(series)"
        >
          <span class="series-title">{{ series }}</span>
          <span class="series-count">{{ episodes.length }}개</span>
          <span class="toggle-indicator">▼</span>
        </div>
        <hr />
        <transition name="accordion">
          <div
            class="webtoon-grid accordion-panel"
            :id="`panel-${series}`"
            v-show="!isMobile || !!expanded[series]"
          >
            <div
              v-for="webtoon in episodes"
              :key="webtoon.id"
              class="webtoon-card"
              @click="openModal(webtoon)"
            >
              <div class="webtoon-image-container">
                <img
                  :src="webtoon.fileDownUrl"
                  :alt="webtoon.title"
                  class="webtoon-image"
                  @error="handleImageError"
                />
                <div class="webtoon-overlay">
                  <span class="play-icon">📖</span>
                  <span class="overlay-text">웹툰 읽기</span>
                </div>
              </div>
              <div class="webtoon-info">
                <h3 class="webtoon-card-title">{{ webtoon.title }}</h3>
              </div>
            </div>
          </div>
        </transition>
      </div>
    </div>

    <!-- 웹툰 모달 -->
    <div v-if="selectedWebtoon" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <!-- 모달 헤더 -->
        <div class="modal-header">
          <h3 class="modal-title">{{ selectedWebtoon.title }}</h3>
          <button @click="closeModal" class="close-btn">✕</button>
        </div>

        <!-- 웹툰 이미지 -->
        <div class="modal-body">
          <img
            :src="selectedWebtoon.secondImageUrl"
            :alt="selectedWebtoon.title"
            class="webtoon-full-image"
            @error="handleModalImageError"
          />
        </div>

        <!-- 모달 푸터 -->
        <div class="modal-footer">
          <button @click="closeModal" class="modal-close-btn">닫기</button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue';
import webtoonApi from '@/modules/education/api/webtoon';
import { RouterLink } from 'vue-router';
import BackButton from '@/shared/components/common/BackButton.vue';

// 웹툰 관련 데이터
const webtoons = ref([]);
const selectedWebtoon = ref(null);
const loading = ref(false);
const error = ref(false);

// 반응형: 모바일일 때만 아코디언(토글)
const isMobile = ref(false);
const expanded = ref({}); // { [series: string]: boolean }

function toggleSeries(series) {
  expanded.value[series] = !expanded.value[series];
}

function setIsMobile() {
  isMobile.value = window.matchMedia('(max-width: 768px)').matches;
}

function resetExpandState() {
  // 모바일: 기본 접기, 데스크톱: 기본 모두 펼치기
  const all = {};
  const keys = Object.keys(groupedWebtoons.value || {});
  for (const k of keys) {
    all[k] = !isMobile.value; // desktop => true, mobile => false
  }
  expanded.value = all;
}

// 고정 카테고리 (표시 순서 유지)
const CATEGORY_ORDER = [
  '금소법 콘텐츠 공모전 수상작',
  '금융교육 웹툰',
  '보(保)통(通)부부',
  '주식리딩방 피해예방',
  '금소법으로 강화되는 금융소비자 권리 이야기',
  '카드뉴스',
];

function getCategory(title) {
  if (!title) return null;
  // 공백 제거한 문자열도 준비 (괄호 등 포함 케이스 대비)
  const t = String(title);
  for (const cat of CATEGORY_ORDER) {
    if (t.includes(cat)) return cat;
  }
  return null; // 미매칭은 기타 처리
}

// ── 시리즈/에피소드 파서 ─────────────────────────────────────────────
function extractSeries(title) {
  if (!title) return '기타';
  // [시리즈명] 패턴 우선
  const bracket = title.match(/^\s*\[(.+?)\]/);
  if (bracket) return bracket[1].trim();
  // 구분자(-, :, |) 앞부분을 시리즈로 가정
  const sep = title.split(/\s*[-:|]\s*/)[0];
  return sep.trim() || '기타';
}

function extractEpisodeNumber(title) {
  if (!title) return Infinity;
  // #01, #1
  const hash = title.match(/#\s*(\d{1,3})/);
  if (hash) return parseInt(hash[1], 10);
  // 1화, 12 화
  const hwa = title.match(/(\d{1,3})\s*화/);
  if (hwa) return parseInt(hwa[1], 10);
  // EP1, Ep.02
  const ep = title.match(/\b[Ee][Pp]\.??\s*(\d{1,3})/);
  if (ep) return parseInt(ep[1], 10);
  // 말미 괄호 숫자 (예: (2))
  const tail = title.match(/\((\d{1,3})\)\s*$/);
  if (tail) return parseInt(tail[1], 10);
  // 없으면 맨 뒤로
  return Infinity;
}

const groupedWebtoons = computed(() => {
  // 카테고리 맵 초기화 (표시 순서 보장)
  const map = {};
  for (const cat of CATEGORY_ORDER) map[cat] = [];
  map['기타'] = [];

  // 먼저 카테고리 매칭
  for (const w of webtoons.value || []) {
    const cat = getCategory(w.title);
    if (cat) {
      map[cat].push(w);
    } else {
      // 기존 시리즈 추출 규칙 유지하되, 카테고리 외 항목은 모두 '기타'에 모음
      map['기타'].push(w);
    }
  }

  // 각 그룹 내부 정렬 (#01, 1화, EP2 등 → 오름차순 / 번호 없으면 뒤로, 동일 번호는 제목순)
  for (const key of Object.keys(map)) {
    map[key].sort((a, b) => {
      const ea = extractEpisodeNumber(a.title);
      const eb = extractEpisodeNumber(b.title);
      if (ea === eb) return (a.title || '').localeCompare(b.title || '');
      return ea - eb;
    });
  }

  // 표시 순서를 유지한 객체 반환
  const orderedEntries = [...CATEGORY_ORDER, '기타']
    .filter((k) => k in map && map[k].length > 0)
    .map((k) => [k, map[k]]);

  return Object.fromEntries(orderedEntries);
});

// 웹툰 관련 함수들
async function fetchWebtoons() {
  loading.value = true;
  error.value = false;

  try {
    const data = await webtoonApi.getAll?.();
    webtoons.value = data || [];
    console.log('웹툰 데이터:', webtoons.value);
  } catch (err) {
    console.error('웹툰 조회 실패:', err);
    error.value = true;
  } finally {
    loading.value = false;
  }
}

function openModal(webtoon) {
  selectedWebtoon.value = webtoon;
  document.body.style.overflow = 'hidden'; // 스크롤 방지
}

function closeModal() {
  selectedWebtoon.value = null;
  document.body.style.overflow = 'auto'; // 스크롤 복원
}

function handleImageError(event) {
  event.target.src =
    'https://via.placeholder.com/300x400/cccccc/666666?text=이미지+없음';
}

function handleModalImageError(event) {
  event.target.src =
    'https://via.placeholder.com/600x800/cccccc/666666?text=웹툰+이미지+없음';
}

// ESC 키로 모달 닫기
const handleEsc = (event) => {
  if (event.key === 'Escape' && selectedWebtoon.value) {
    closeModal();
  }
};

onMounted(() => {
  setIsMobile();
  window.addEventListener('resize', setIsMobile);

  fetchWebtoons();

  // 데이터 로드 후 초기 펼침 상태 동기화
  const stopWatch = watch(
    () => groupedWebtoons.value,
    () => resetExpandState(),
    { immediate: true }
  );
  // 언마운트 시 워치 해제
  onUnmounted(() => stopWatch && stopWatch());

  const stopWatchMobile = watch(isMobile, () => resetExpandState());
  onUnmounted(() => stopWatchMobile && stopWatchMobile());

  document.addEventListener('keydown', handleEsc);
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleEsc);
  window.removeEventListener('resize', setIsMobile);
  // 컴포넌트 해제시 스크롤 복원
  document.body.style.overflow = 'auto';
});
</script>

<style scoped>
.page-description {
  text-align: center;
  margin-bottom: var(--spacing-lg);
  background: var(--color-light);
  padding: var(--spacing-md);
  border-radius: 16px;
  box-shadow: var(--shadow-sm);
}

.page-title {
  font-size: var(--font-size-4xl);
  font-weight: bold;
  color: var(--text-primary);
}

.page-subtitle {
  font-size: var(--font-size-base);
  color: var(--text-secondary);
  line-height: 1.8;
}

.webtoon-section {
  width: 80%;
  margin: var(--spacing-lg) auto var(--spacing-2xl);
}

.loading {
  text-align: center;
  padding: var(--spacing-3xl);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid var(--color-gray-200);
  border-top: 4px solid var(--color-secondary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto var(--spacing-lg);
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.error {
  text-align: center;
  padding: var(--spacing-3xl);
  color: var(--color-error);
}

.retry-btn {
  background: var(--color-secondary);
  color: var(--color-white);
  border: none;
  padding: var(--spacing-sm) var(--spacing-lg);
  border-radius: 8px;
  cursor: pointer;
  margin-top: var(--spacing-sm);
  transition: background 0.3s ease;
}

.retry-btn:hover {
  background: var(--color-accent);
}

.webtoon-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--spacing-xl);
}

.webtoon-card {
  background: var(--bg-card);
  border-radius: 15px;
  box-shadow: var(--shadow-md);
  overflow: hidden;
  transition: all 0.3s ease;
  cursor: pointer;
}

.webtoon-card:hover {
  transform: translateY(-8px);
  box-shadow: var(--shadow-lg);
}

.webtoon-image-container {
  position: relative;
  overflow: hidden;
  height: 240px;
}

.webtoon-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.webtoon-card:hover .webtoon-image {
  transform: scale(1.05);
}

.webtoon-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--color-overlay-dark);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  color: var(--color-white);
}

.webtoon-card:hover .webtoon-overlay {
  opacity: 1;
}

.play-icon {
  font-size: var(--font-size-4xl);
  margin-bottom: var(--spacing-sm);
}

.overlay-text {
  font-size: var(--font-size-lg);
  font-weight: bold;
}

.webtoon-info {
  padding: var(--spacing-lg);
}

.webtoon-card-title {
  font-size: var(--font-size-lg);
  font-weight: bold;
  color: var(--text-primary);
  margin: 0 0 var(--spacing-sm) 0;
  line-height: 1.4;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--color-overlay-dark);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1001;
  backdrop-filter: blur(5px);
  padding: var(--spacing-lg);
}

.modal-content {
  background: var(--bg-card);
  border-radius: 20px;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: var(--shadow-modal);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-lg) var(--spacing-xl);
  border-bottom: 1px solid var(--border-light);
  background: var(--bg-content);
}

.modal-title {
  margin: 0;
  font-size: var(--font-size-xl);
  color: var(--text-primary);
  font-weight: bold;
}

.close-btn {
  background: none;
  border: none;
  font-size: var(--font-size-2xl);
  cursor: pointer;
  color: var(--text-secondary);
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: var(--color-error);
  color: var(--color-white);
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  text-align: center;
  padding: var(--spacing-lg);
  max-height: calc(90vh - 160px);
}

.webtoon-full-image {
  width: 100%;
  height: auto;
  min-height: 100%;
  border-radius: 10px;
  box-shadow: var(--shadow-md);
  display: block;
}

.modal-footer {
  padding: var(--spacing-lg) var(--spacing-xl);
  border-top: 1px solid var(--border-light);
  text-align: center;
  background: var(--bg-content);
}

.modal-close-btn {
  background: var(--color-secondary);
  color: var(--color-white);
  border: none;
  padding: var(--spacing-sm) var(--spacing-xl);
  border-radius: 25px;
  cursor: pointer;
  font-size: var(--font-size-base);
  transition: background 0.2s ease;
}

.modal-close-btn:hover {
  background: var(--color-accent);
}

/* Added styles for series grouping */
.series-block {
  margin-bottom: var(--spacing-2xl);
}

.series-header {
  font-size: 1rem; /* smaller title font size */
  display: grid;
  grid-template-columns: 1fr auto auto; /* title | count | toggle */
  column-gap: var(--spacing-sm);
  align-items: center;
  cursor: pointer;
}

.series-header .series-title {
  font-weight: bold;
}

.series-header .toggle-indicator {
  font-size: 0.9rem;
  margin-left: 8px;
}

.series-header[aria-expanded='true'] .toggle-indicator {
  transform: rotate(180deg);
}

.series-title {
  font-size: var(--font-size-xl);
  line-height: 1.3;
  font-weight: 800;
  color: var(--text-primary);
}

.series-count {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  white-space: nowrap;
  min-width: 2.5rem; /* reserve space so digits align */
  text-align: right;
}

@media (max-width: 768px) {
  .webtoon-image-container {
    height: 220px;
  }
  .page-title {
    font-size: 1.8rem;
  }
  .webtoon-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: var(--spacing-lg);
  }

  .modal-overlay {
    padding: var(--spacing-sm);
  }

  .modal-content {
    max-width: 100%;
    max-height: 95vh;
  }

  .modal-body {
    max-height: calc(95vh - 160px);
  }

  .series-title {
    font-size: 1rem;
  }
  .series-header {
    column-gap: var(--spacing-xs);
  }
  .series-count {
    min-width: 2.2rem;
  }
}

@media (max-width: 480px) {
  .webtoon-grid {
    grid-template-columns: 1fr;
    gap: var(--spacing-md);
  }

  .webtoon-image-container {
    height: 200px;
  }

  .modal-overlay {
    padding: var(--spacing-xs);
  }

  .modal-content {
    max-height: 98vh;
  }

  .modal-body {
    max-height: calc(98vh - 160px);
    padding: var(--spacing-sm);
  }
}

/* Add a small gap between header and content when visible */
.accordion-panel {
  margin-top: var(--spacing-sm);
  overflow: hidden; /* required for height animation */
}

/* Smooth accordion animation */
.accordion-enter-active,
.accordion-leave-active {
  transition: max-height 0.35s ease, opacity 0.25s ease;
}
.accordion-enter-from,
.accordion-leave-to {
  max-height: 0;
  opacity: 0;
}
.accordion-enter-to,
.accordion-leave-from {
  max-height: 1200px; /* big enough for content */
  opacity: 1;
}

@media (max-width: 768px) {
  .accordion-panel {
    margin-top: var(--spacing-md);
  }
}
</style>
