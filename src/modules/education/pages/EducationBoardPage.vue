<template>
  <div class="education-video-page" :class="{ 'no-scroll': isOverlayOpen }">
    <div class="page-description">
      <div class="hero-content">
        <div class="title-wrapper">
          <h1 class="page-title">
            <i class="fa-solid fa-graduation-cap title-icon" aria-hidden="true"></i>
            쉽고 재미있는 금융 교육 콘텐츠
          </h1>
        </div>
        <p class="page-subtitle">
          <span class="subtitle-highlight">금융 교육 영상</span>
          부터
          <span class="subtitle-highlight">웹툰으로 배우는 금융</span>
          까지!
          <br />
          <span class="subtitle-accent">
            <i class="fa-solid fa-lightbulb"></i>
            누구나 이해할 수 있는
          </span>
          금융 콘텐츠를 만나보세요.
        </p>
        <div class="feature-badges">
          <span class="badge">
            <i class="fa-solid fa-video"></i>
            쉬운 영상
          </span>
          <span class="badge">
            <i class="fa-solid fa-book-open"></i>
            웹툰
          </span>
          <span class="badge">
            <i class="fa-solid fa-piggy-bank"></i>
            실용적
          </span>
          <span class="badge">
            <i class="fa-solid fa-circle-check"></i>
            무료
          </span>
        </div>
      </div>
    </div>

    <!-- 섹션: 교육 영상 (프리뷰 + 더보기 라우팅) -->
    <section class="video-section">
      <div class="section-header">
        <h3>
          <i class="fa-solid fa-clapperboard"></i>
          교육 영상
        </h3>
        <p class="webtoon-subtitle">썸네일을 클릭하면 영상을 시청할 수 있어요!</p>
        <RouterLink to="/education/video">
          <button class="more-btn">
            <i class="fa-solid fa-arrow-right"></i>
            더보기
          </button>
        </RouterLink>
      </div>

      <div class="card-grid">
        <div v-for="(m, i) in visibleVideos" :key="m.id ?? i" class="card" @click="openOverlay(m)">
          <!-- 유튜브 썸네일 / 비디오 플레이 아이콘 / 이미지 프리뷰 -->
          <img
            v-if="m.type === 'youtube'"
            :src="`https://img.youtube.com/vi/${extractYoutubeId(m.link)}/hqdefault.jpg`"
            :alt="m.title || '영상 썸네일'"
            class="thumb thumb-16x9"
            loading="lazy" />
          <div v-else-if="m.type === 'video'" class="thumb thumb-16x9 video-fallback">
            <span class="play-badge" aria-hidden><i class="fa-solid fa-play"></i></span>
          </div>
          <img
            v-else-if="m.type === 'image'"
            :src="m.url"
            :alt="m.title || '이미지'"
            class="thumb thumb-16x9"
            loading="lazy" />
          <div v-else class="thumb thumb-16x9 blank">파일 열기</div>
          <div class="card-meta">
            <span class="chip" :class="m.type">
              <i v-if="m.type === 'youtube'" class="fa-brands fa-youtube"></i>
              <i v-else-if="m.type === 'video'" class="fa-solid fa-film"></i>
              <i v-else-if="m.type === 'image'" class="fa-regular fa-image"></i>
              <i v-else class="fa-regular fa-file"></i>
            </span>
          </div>
          <div class="card-title" :title="m.title">{{ m.title }}</div>
        </div>
      </div>
    </section>

    <!-- 웹툰 Section 추가 -->
    <section class="webtoon-section">
      <div class="section-header">
        <h3>
          <i class="fa-solid fa-book-open"></i>
          금융교육 웹툰
        </h3>
        <p class="webtoon-subtitle">썸네일을 클릭하면 웹툰을 읽을 수 있어요!</p>
        <button @click="goToWebtoonPage" class="more-btn">
          <i class="fa-solid fa-arrow-right"></i>
          더보기
        </button>
      </div>

      <!-- 로딩 상태 -->
      <div v-if="loading" class="loading">
        <div class="spinner"></div>
        <p>웹툰을 불러오는 중...</p>
      </div>

      <!-- 에러 상태 -->
      <div v-else-if="error" class="error">
        <p>
          <i class="fa-solid fa-circle-exclamation"></i>
          웹툰을 불러오는데 실패했습니다.
        </p>
        <button @click="fetchWebtoons" class="retry-btn">다시 시도</button>
      </div>

      <!-- 웹툰 목록 -->
      <div v-else class="webtoon-grid">
        <div v-for="webtoon in webtoons" :key="webtoon.id" class="webtoon-card" @click="openModal(webtoon)">
          <div class="webtoon-image-container">
            <img :src="webtoon.fileDownUrl" :alt="webtoon.title" class="webtoon-image" @error="handleImageError" />
            <div class="webtoon-overlay">
              <span class="play-icon"><i class="fa-solid fa-book-open-reader"></i></span>
              <span class="overlay-text">웹툰 읽기</span>
            </div>
          </div>
          <div class="webtoon-info">
            <h3 class="webtoon-card-title">{{ webtoon.title }}</h3>
          </div>
        </div>
      </div>
    </section>

    <!-- Video Overlay (Full screen) -->
    <div v-if="isOverlayOpen" class="video-overlay" @click.self="closeOverlay" role="dialog" aria-modal="true">
      <div class="player-wrap">
        <iframe
          v-if="current?.type === 'youtube'"
          class="player-iframe"
          :src="getEmbedUrl(extractYoutubeId(current.link))"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowfullscreen
          frameborder="0"
          referrerpolicy="strict-origin-when-cross-origin"
          :title="current.title || '교육 영상 플레이어'" />
        <video
          v-else-if="current?.type === 'video'"
          class="player-iframe"
          :src="current.url"
          controls
          autoplay
          playsinline
          :title="current.title || '교육 영상 플레이어'"></video>
        <img
          v-else-if="current?.type === 'image'"
          :src="current.url"
          :alt="current.title || '이미지'"
          class="player-image" />
        <a v-else :href="current?.url" target="_blank" rel="noopener" class="player-link">파일 열기</a>
      </div>
      <button class="close-button" @click="closeOverlay" aria-label="닫기">✕</button>
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
            @error="handleModalImageError" />
        </div>

        <!-- 모달 푸터 -->
        <div class="modal-footer">
          <button @click="closeModal" class="modal-close-btn">닫기</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onBeforeUnmount } from 'vue';
import { useRouter, RouterLink } from 'vue-router';
import webtoonApi from '@/api/webtoon';
import eduAPI from '@/api/edu';

// 웹툰 관련 데이터
const webtoons = ref([]);
const selectedWebtoon = ref(null);
const loading = ref(false);
const error = ref(false);

function getThumbnailUrl(id) {
  return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
}

function getEmbedUrl(id) {
  const p = new URLSearchParams({
    autoplay: '1', // 자동 재생
    rel: '0', // 관련 동영상 숨김
    modestbranding: '1', // 유튜브 로고 최소화
    playsinline: '1', // 모바일에서 인라인 재생
  });
  return `https://www.youtube.com/embed/${id}?${p.toString()}`;
}

// Overlay logic
const currentPlaying = ref(null);

function play(video) {
  // Stop previously playing video, if any
  if (currentPlaying.value) {
    currentPlaying.value.playing = false;
  }
  currentPlaying.value = video;
  video.playing = true;
}

// function closeOverlay() {
//   if (currentPlaying.value) {
//     currentPlaying.value.playing = false;
//     currentPlaying.value = null;
//   }
// }

const router = useRouter();

/* -------------------- 데이터 -------------------- */
const videos = ref([]); // { id, title, url, link, type }
const toons = ref([]); // { id, title, thumbUrl, url, link, ... }

/* -------------------- 오버레이 -------------------- */
const isOverlayOpen = ref(false);
const current = ref(null);

/* -------------------- 브레이크포인트별 프리뷰 개수 -------------------- */
const bp = useBreakpoint(); // 'mobile' | 'tablet' | 'desktop'
const PREVIEW_VIDEO = { mobile: 2, tablet: 4, desktop: 4 };
const PREVIEW_TOON = { mobile: 4, tablet: 6, desktop: 8 };

const visibleVideos = computed(() => videos.value.slice(0, PREVIEW_VIDEO[bp.value]));
const visibleToons = computed(() => toons.value.slice(0, PREVIEW_TOON[bp.value]));

/* -------------------- 초기 로드 -------------------- */
onMounted(async () => {
  await loadVideos();
  await loadToons();
  window.addEventListener('keydown', onKeyDown);
});
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeyDown);
});

async function loadVideos() {
  const raw = await eduAPI.getMovieList(0, 4);
  videos.value = await normalizeVideos(raw);
}
async function loadToons() {
  // API 네이밍은 환경에 맞게 교체 (예: eduAPI.getWebtoonList)
  const raw = await (eduAPI.getWebtoonList?.() ?? Promise.resolve([]));
  toons.value = raw.map((w) => ({
    id: w.id,
    title: w.title,
    thumbUrl: w.thumbUrl || w.coverUrl || w.url,
    url: w.url,
    link: w.link,
  }));
}

/* -------------------- 비디오 판별/정규화 -------------------- */
const headCache = new Map();

async function normalizeVideos(raw) {
  const arr = raw.map((r) => {
    const link = r.link || r.xtrnlContentsUrl || '';
    const url = r.url || r.fileDownUrl || '';
    const type = link ? 'youtube' : guessByExt(url);
    return { id: r.id, title: r.title, url, link, type };
  });
  // 확장자 모호하면 HEAD로 보강
  await refineUnknownByHead(arr);
  return arr;
}

function guessByExt(u) {
  const url = String(u || '')
    .split('?')[0]
    .toLowerCase();
  if (!url) return 'unknown';
  if (/\.(mp4|webm|ogg|ogv|mov|m4v|avi|mkv)$/.test(url)) return 'video';
  if (/\.(png|jpe?g|gif|webp|bmp|svg)$/.test(url)) return 'image';
  if (/\.(mp3|wav|m4a|aac|flac|oga)$/.test(url)) return 'audio';
  if (/\.(pdf)$/.test(url)) return 'pdf';
  return 'unknown';
}

async function refineUnknownByHead(list, concurrency = 6) {
  const targets = list.filter((i) => !i.link && i.type === 'unknown' && i.url);
  const queue = [...targets];
  const worker = async () => {
    while (queue.length) {
      const it = queue.shift();
      if (headCache.has(it.url)) {
        it.type = headCache.get(it.url);
        continue;
      }
      try {
        const res = await fetch(it.url, { method: 'HEAD', mode: 'cors' });
        const ct = (res.headers.get('content-type') || '').toLowerCase();
        let t = 'unknown';
        if (ct.startsWith('video/')) t = 'video';
        else if (ct.startsWith('image/')) t = 'image';
        else if (ct.startsWith('audio/')) t = 'audio';
        else if (ct === 'application/pdf') t = 'pdf';
        it.type = t;
        headCache.set(it.url, t);
      } catch {
        /* CORS/네트워크 실패 → 유지 */
      }
    }
  };
  await Promise.allSettled(Array.from({ length: concurrency }, worker));
}

/* -------------------- 오버레이 동작 -------------------- */
function openOverlay(item) {
  // 영상/이미지 외 파일은 새 탭
  if (!['youtube', 'video', 'image'].includes(item.type)) {
    window.open(item.url, '_blank', 'noopener');
    return;
  }
  current.value = item;
  isOverlayOpen.value = true;
  document.documentElement.style.overflow = 'hidden';
}
function closeOverlay() {
  // 오버레이 닫기
  isOverlayOpen.value = false;

  // 재생 중인 영상 멈추기
  if (currentPlaying.value) {
    currentPlaying.value.playing = false;
    currentPlaying.value = null;
  }

  // 딜레이 후 상태 초기화
  setTimeout(() => {
    current.value = null;
    document.documentElement.style.overflow = '';
  }, 150);
}

function onKeyDown(e) {
  if (e.key === 'Escape' && isOverlayOpen.value) closeOverlay();
}

/* -------------------- 라우팅 -------------------- */
function goToVideoMore() {
  router.push('/education/videos');
}

// 웹툰 관련 함수들
async function fetchWebtoons() {
  loading.value = true;
  error.value = false;

  try {
    const data = await webtoonApi.getTop4();
    webtoons.value = data;
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
  event.target.src = 'https://via.placeholder.com/300x400/cccccc/666666?text=이미지+없음';
}

function handleModalImageError(event) {
  event.target.src = 'https://via.placeholder.com/600x800/cccccc/666666?text=웹툰+이미지+없음';
}

// ESC 키로 모달 닫기
onMounted(() => {
  fetchWebtoons();

  const handleEsc = (event) => {
    if (event.key === 'Escape' && selectedWebtoon.value) {
      closeModal();
    }
  };

  document.addEventListener('keydown', handleEsc);

  // 컴포넌트 해제시 이벤트 리스너 제거
  return () => {
    document.removeEventListener('keydown', handleEsc);
  };
});
function goToWebtoonPage() {
  router.push('/education/webtoon');
}

onMounted(() => {
  // ESC 키로 오버레이 닫기
  const handleEsc = (event) => {
    if (event.key === 'Escape' && currentPlaying.value) {
      closeOverlay();
    }
  };

  document.addEventListener('keydown', handleEsc);

  // 컴포넌트 해제시 이벤트 리스너 제거
  return () => {
    document.removeEventListener('keydown', handleEsc);
  };
});

function goToWebtoonMore() {
  router.push('/education/webtoons');
}
function goToWebtoonDetail(w) {
  // 상세 페이지가 있다면 id 기반 라우팅
  router.push({ path: '/education/webtoons/detail', query: { id: w.id } });
}

/* -------------------- 유튜브 헬퍼 -------------------- */
// function getEmbedUrl(id) {
//   const p = new URLSearchParams({
//     autoplay: '1',
//     rel: '0',
//     modestbranding: '1',
//     playsinline: '1',
//   });
//   return `https://www.youtube.com/embed/${id}?${p.toString()}`;
// }
function extractYoutubeId(url) {
  if (!url) return '';
  try {
    const u = new URL(url, window.location.origin);
    const v = u.searchParams.get('v');
    if (v) return v;
    const m1 = u.pathname.match(/^\/(?:shorts\/)?([a-zA-Z0-9_-]{6,})/);
    if (m1) return m1[1];
    const m2 = u.pathname.match(/embed\/([a-zA-Z0-9_-]{6,})/);
    if (m2) return m2[1];
    return '';
  } catch {
    const m = String(url).match(/(?:v=|be\/|shorts\/|embed\/)([a-zA-Z0-9_-]{6,})/);
    return m ? m[1] : '';
  }
}

/* -------------------- Breakpoint -------------------- */
function useBreakpoint() {
  const cur = ref('desktop');
  const handler = () => {
    const w = window.innerWidth;
    cur.value = w < 640 ? 'mobile' : w < 1024 ? 'tablet' : 'desktop';
  };
  onMounted(() => {
    handler();
    window.addEventListener('resize', handler, { passive: true });
  });
  onBeforeUnmount(() => window.removeEventListener('resize', handler));
  return cur;
}
</script>

<style scoped>
.education-video-page {
  padding: var(--spacing-xl) var(--spacing-lg);
  max-width: 80%;
  margin: 0 auto;
}

.education-video-page.no-scroll {
  overflow: hidden;
}

.page-description {
  position: relative;
  text-align: center;
  margin-bottom: var(--spacing-3xl);
  background: var(--bg-content);
  padding: var(--spacing-2xl) var(--spacing-lg);
  border-radius: 20px;
  border: 1px solid var(--border-light);
  box-shadow: var(--shadow-md);
}

.hero-content {
  position: relative;
  z-index: 2;
}

.title-wrapper {
  margin-bottom: var(--spacing-sm);
}

.page-title {
  font-size: var(--font-size-3xl);
  font-weight: 800;
  margin-bottom: var(--spacing-md);
  color: var(--text-primary);
  letter-spacing: -0.02em;
  line-height: 1.2;
}

.title-icon {
  margin-right: var(--spacing-sm);
  vertical-align: -2px;
  filter: drop-shadow(0 1px 0 rgba(0, 0, 0, 0.04));
}

.page-subtitle {
  color: var(--text-secondary);
  font-size: var(--font-size-lg);
  line-height: 1.8;
  margin-bottom: var(--spacing-sm);
}

.subtitle-highlight {
  background: var(--bg-elevated);
  padding: 2px 8px;
  border-radius: 10px;
  font-weight: 600;
  border: 1px solid var(--border-light);
}
.subtitle-accent {
  font-weight: 700;
  color: var(--color-secondary);
}

.feature-badges {
  display: flex;
  justify-content: center;
  gap: var(--spacing-md);
  flex-wrap: wrap;
}

.badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--bg-content);
  color: var(--text-primary);
  padding: 0.4rem 0.75rem;
  border-radius: 999px;
  font-size: var(--font-size-sm);
  font-weight: 700;
  border: 1px solid var(--border-light);
  box-shadow: var(--shadow-sm);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.badge:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.video-section {
  margin-bottom: var(--spacing-2xl);
}

.section-header {
  display: grid;
  grid-template-columns: 1fr auto;
  grid-template-rows: auto auto;
  column-gap: var(--spacing-md);
  row-gap: var(--spacing-xs);
  align-items: center;
  margin-bottom: var(--spacing-lg);
}

.section-header h3 {
  grid-column: 1;
  grid-row: 1;
  margin: 0;
  font-size: var(--font-size-2xl);
  color: var(--color-dark);
}

.section-header .webtoon-subtitle {
  grid-column: 1;
  grid-row: 2;
  margin: 0;
  font-size: var(--font-size-base);
  color: var(--text-secondary);
}

.webtoon-section .section-header .more-btn {
  grid-column: 2;
  grid-row: 1;
  align-self: start;
}

.more-btn {
  background: var(--color-secondary);
  color: var(--color-white);
  border: 0;
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.3s ease;
}

.more-btn:hover {
  background: var(--color-accent);
}

.card-grid {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-md) var(--spacing-sm);
  justify-content: space-between;
}

.card {
  padding: 0;
  background: var(--bg-card);
  border-radius: 8px;
  box-shadow: var(--shadow-card);
  cursor: pointer;
  overflow: hidden;
  transition: transform 0.2s ease;
}

.card:hover {
  transform: translateY(-4px);
}

@media (min-width: 640px) {
  .card {
    width: calc(50% - var(--spacing-sm));
  }
}

@media (min-width: 1024px) {
  .card {
    width: calc(25% - var(--spacing-md));
  }
}

.thumb {
  width: 100%;
  display: block;
  background: var(--color-black);
}

.thumb-16x9 {
  aspect-ratio: 16 / 9;
  object-fit: cover;
}

.video-fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-white);
}

.play-badge {
  font-size: var(--font-size-3xl);
}

.card-title {
  padding: var(--spacing-sm) var(--spacing-md);
  font-weight: 600;
  font-size: var(--font-size-sm);
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: normal;
  word-break: keep-all;
  overflow-wrap: anywhere;
  line-height: 1.4;
  max-height: calc(1.4em * 2.4);
}

.video-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-overlay-dark);
  backdrop-filter: blur(2px);
  padding: var(--spacing-xl);
}

.player-wrap {
  width: min(1200px, 92vw);
  aspect-ratio: 16/9;
  background: var(--color-black);
  border-radius: 12px;
  box-shadow: var(--shadow-modal);
}

.player-iframe,
.player-image {
  width: 100%;
  height: 100%;
  border: 0;
  border-radius: 12px;
  object-fit: contain;
  background: var(--color-black);
}

.close-button {
  position: fixed;
  top: var(--spacing-lg);
  right: var(--spacing-lg);
  font-size: var(--font-size-3xl);
  background: none;
  color: var(--color-white);
  border: none;
  cursor: pointer;
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
  gap: var(--spacing-lg);
  padding: var(--spacing-lg) 0;
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
  height: 300px;
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
  font-size: var(--font-size-2xl);
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

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@media (max-width: 768px) {
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

  .page-description {
    padding: var(--spacing-2xl) var(--spacing-md);
  }

  .page-title {
    font-size: var(--font-size-2xl);
  }

  .page-subtitle {
    font-size: var(--font-size-base);
    margin-bottom: var(--spacing-sm);
  }

  .feature-badges {
    gap: var(--spacing-sm);
  }

  .badge {
    font-size: var(--font-size-xs);
    padding: var(--spacing-xs) var(--spacing-sm);
  }

  /* 영상 카드: 2열, 가로 스크롤 방지 */
  .card-grid {
    justify-content: flex-start;
    gap: var(--spacing-md);
  }
  .card {
    width: calc(50% - var(--spacing-md) / 2);
  }

  /* 웹툰: 2열, 이미지 높이 축소 */
  .webtoon-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--spacing-md);
  }
  .webtoon-image-container {
    height: 220px;
  }

  /* 불필요한 플로팅 아이콘 규칙 제거 */
}

@media (max-width: 480px) {
  .webtoon-grid {
    grid-template-columns: 1fr;
    gap: var(--spacing-md);
  }

  .webtoon-image-container {
    height: 250px;
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

  .page-description {
    padding: var(--spacing-xl) var(--spacing-md);
  }

  .page-title {
    font-size: var(--font-size-xl);
    line-height: 1.3;
  }

  .page-subtitle {
    font-size: var(--font-size-base);
  }

  .feature-badges {
    flex-direction: column;
    align-items: center;
    gap: var(--spacing-sm);
  }

  /* 영상 카드: 1열로 전환 */
  .card {
    width: 100%;
  }
  .card-grid {
    gap: var(--spacing-sm);
  }

  /* 웹툰: 1열, 이미지 높이 더 축소 */
  .webtoon-grid {
    grid-template-columns: 1fr;
    gap: var(--spacing-sm);
  }
  .webtoon-image-container {
    height: 180px;
  }
}

/* ===== Font Awesome UI polish (Board preview) ===== */
.section-header h3 i {
  margin-right: 0.5rem;
  color: var(--color-accent);
  filter: drop-shadow(0 1px 0 rgba(0, 0, 0, 0.05));
}

/* card needs to position the badge */
.card {
  position: relative;
}
.card-meta {
  position: absolute;
  top: 0.5rem;
  left: 0.5rem;
  z-index: 2;
}
.chip {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.25rem 0.5rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 700;
  box-shadow: var(--shadow-sm);
  background: rgba(255, 255, 255, 0.92);
  color: var(--color-dark);
  border: 1px solid var(--border-light);
}
.chip.youtube {
  background: #fff0f0;
  color: #cc0000;
  border-color: #ffd6d6;
}
.chip.video {
  background: #eef6ff;
  color: #1d4ed8;
  border-color: #dbeafe;
}
.chip.image {
  background: #f0fff4;
  color: #166534;
  border-color: #dcfce7;
}

/* thumbnail polish */
.thumb-16x9 {
  border-bottom: 1px solid var(--border-light);
}
.play-badge {
  font-size: 1.25rem;
}

/* more button icon spacing if icons are added later */
.more-btn i {
  margin-right: 0.4rem;
}
.badge i {
  margin-right: 0.25rem;
}

@media (min-width: 1400px) {
  .education-video-page {
    max-width: 1200px;
  }
}
</style>
