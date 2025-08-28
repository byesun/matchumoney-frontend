<template>
  <div class="education-video-page">
    <BackButton />
    <div class="page-description">
      <h1 class="page-title">쉽고 재미있는 금융 교육 영상</h1>
      <p class="page-subtitle">
        핵심만 빠르게 이해하고 <br />지금 당장 써먹는 금융 지식을 배우세요.
      </p>
    </div>
    <div ref="scrollRoot" :class="{ 'no-scroll': isOverlayOpen }">
      <section class="video-section">
        <div
          v-for="([category, items], gi) in categoryEntries"
          :key="category + '_' + gi"
          class="series-section"
        >
          <br />
          <div
            class="series-header"
            :aria-expanded="!isMobile || !!expanded[category]"
            :aria-controls="`panel-${gi}`"
            role="button"
            @click="isMobile && toggleSeries(category)"
          >
            <h3 class="series-title">{{ category }}</h3>
            <span class="series-count">{{ items.length }}개</span>
            <span class="toggle-indicator">▼</span>
          </div>
          <hr />
          <transition name="accordion">
            <div
              class="card-grid accordion-panel"
              :id="`panel-${gi}`"
              v-show="!isMobile || !!expanded[category]"
            >
              <div
                v-for="(m, i) in items"
                :key="m.id ?? category + '_' + i"
                class="card"
                @click="openOverlay(m)"
              >
                <img
                  v-if="m.type === 'youtube'"
                  :src="`https://img.youtube.com/vi/${extractYoutubeId(
                    m.link
                  )}/hqdefault.jpg`"
                  :alt="m.title || '영상 썸네일'"
                  class="thumb thumb-16x9"
                  loading="lazy"
                />
                <div
                  v-else-if="m.type === 'video'"
                  class="thumb thumb-16x9 video-fallback"
                >
                  <span class="play-badge">▶</span>
                </div>
                <img
                  v-else-if="m.type === 'image'"
                  :src="m.url"
                  :alt="m.title || '이미지'"
                  class="thumb thumb-16x9"
                  loading="lazy"
                />
                <div v-else class="thumb thumb-16x9 blank">파일 열기</div>
                <div class="card-title" :title="m.title">{{ m.title }}</div>
              </div>
            </div>
          </transition>
        </div>
      </section>

      <div
        v-if="isOverlayOpen"
        class="video-overlay"
        @click.self="closeOverlay"
        role="dialog"
        aria-modal="true"
      >
        <div class="player-wrap">
          <iframe
            v-if="current?.type === 'youtube'"
            class="player-iframe"
            :src="getEmbedUrl(extractYoutubeId(current.link))"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowfullscreen
            frameborder="0"
            referrerpolicy="strict-origin-when-cross-origin"
            :title="current.title || '교육 영상 플레이어'"
          />
          <video
            v-else-if="current?.type === 'video'"
            class="player-iframe"
            :src="current.url"
            controls
            autoplay
            playsinline
            :title="current.title || '교육 영상 플레이어'"
          ></video>
          <img
            v-else-if="current?.type === 'image'"
            :src="current.url"
            :alt="current.title || '이미지'"
            class="player-image"
          />
          <a
            v-else
            :href="current?.url"
            target="_blank"
            rel="noopener"
            class="player-link"
            >파일 열기</a
          >
        </div>
        <button class="close-button" @click="closeOverlay" aria-label="닫기">
          ✕
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import {
  ref,
  onMounted,
  onBeforeUnmount,
  nextTick,
  computed,
  watch,
} from 'vue';
import eduAPI from '@/api/edu';
import BackButton from '@/components/common/BackButton.vue';

const videos = ref([]);
const loading = ref(false);
const done = ref(false);
// ── Loading throttle ──
// ── Responsive infinite loading utilities ──
function getPerRow() {
  // Match CSS breakpoints: >=1024px => 4 per row, >=640px => 2 per row, else 1
  const w = window.innerWidth || 0;
  if (w >= 1024) return 4;
  if (w >= 640) return 2;
  return 1;
}

const pageSize = 12;
const offset = ref(0);
const seenIds = new Set();

const isOverlayOpen = ref(false);
const current = ref(null);

// ── 반응형 토글(모바일에서만 아코디언) ──
const isMobile = ref(false);
const expanded = ref({});

function toggleSeries(key) {
  expanded.value[key] = !expanded.value[key];
}
function setIsMobile() {
  isMobile.value = window.matchMedia('(max-width: 768px)').matches;
}
function resetExpandState() {
  const map = {};
  for (const [cat] of categoryEntries.value) {
    map[cat] = !isMobile.value; // 데스크톱: 펼침, 모바일: 접힘
  }
  expanded.value = map;
}
/* ── 고정 카테고리 분류 ─────────────────────────────────── */
const CATEGORY_ORDER = [
  '여이주TV',
  '가상자산 투자사기',
  '금융위원회',
  '모여라~ 주린이',
  '청년 주택 임대차 교육',
];

// '기타'를 세분화할 추가 카테고리 (표시 순서 그대로)
const EXTRA_CATEGORIES = [
  {
    name: '청년 주택임대차 교육',
    patterns: ['청년 주택 임대차 교육', '청년 주택임대차 교육'],
  },
  { name: 'KBS KLAB', patterns: ['KBS KLAB'] },
  { name: '유용한 금융정보 따라하기', patterns: ['유용한 금융정보 따라하기'] },
  { name: '저축의 모든 것', patterns: ['저축의 모든 것'] },
  { name: '보험사기 피해예방 드라마', patterns: ['보험사기 피해예방 드라마'] },
];

function getCategoryFromTitle(title) {
  const t = String(title || '');
  for (const cat of CATEGORY_ORDER) {
    if (t.includes(cat)) return cat;
  }
  return null; // 매칭되지 않으면 기타 처리
}

function extractEpisodeNumber(title) {
  if (!title) return Infinity;
  const s = String(title);
  const m1 = s.match(/#\s*(\d{1,3})/); // #01
  if (m1) return parseInt(m1[1], 10);
  const m2 = s.match(/(\d{1,3})\s*화/); // 1화
  if (m2) return parseInt(m2[1], 10);
  const m3 = s.match(/\b[Ee][Pp]\.??\s*(\d{1,3})/); // EP2, Ep.02
  if (m3) return parseInt(m3[1], 10);
  const m4 = s.match(/\((\d{1,3})\)\s*$/); // (3)
  if (m4) return parseInt(m4[1], 10);
  return Infinity; // 번호 없으면 뒤로
}

const categoryEntries = computed(() => {
  // 1) 기본 카테고리 맵 구성
  const baseMap = new Map(CATEGORY_ORDER.map((c) => [c, []]));
  baseMap.set('기타', []);

  for (const it of videos.value) {
    const cat = getCategoryFromTitle(it.title) || '기타';
    baseMap.get(cat).push(it);
  }

  // 2) '기타' 세분화: EXTRA_CATEGORIES → '숏츠'
  const extraBuckets = new Map(EXTRA_CATEGORIES.map((e) => [e.name, []]));
  const shorts = [];

  const etc = baseMap.get('기타') ?? [];
  for (const it of etc) {
    const t = String(it.title || '');
    let assigned = false;
    for (const rule of EXTRA_CATEGORIES) {
      if (rule.patterns.some((p) => t.includes(p))) {
        extraBuckets.get(rule.name).push(it);
        assigned = true;
        break;
      }
    }
    if (!assigned) {
      // 유튜브 Shorts 판별 또는 남은 기타 전부 → '숏츠'
      const isShort = (() => {
        const link = it.link || '';
        try {
          const u = new URL(link, window.location.origin);
          return /\/shorts\//.test(u.pathname);
        } catch {
          return /(?:shorts\/|\/shorts\/)/i.test(String(link));
        }
      })();
      shorts.push(it);
    }
  }

  // 3) 각 그룹 내부 정렬: 에피소드 번호 오름차순 → 동일/없음은 제목순
  const sortByEpisode = (arr) =>
    arr.sort((a, b) => {
      const ea = extractEpisodeNumber(a.title);
      const eb = extractEpisodeNumber(b.title);
      if (ea === eb) return (a.title || '').localeCompare(b.title || '');
      return ea - eb;
    });

  for (const [k, arr] of baseMap) sortByEpisode(arr);
  for (const [k, arr] of extraBuckets) sortByEpisode(arr);
  sortByEpisode(shorts);

  // 4) 출력 순서: 기본 CATEGORY_ORDER → EXTRA_CATEGORIES → 숏츠 (비어있는 카테고리는 생략)
  const ordered = [];
  for (const cat of CATEGORY_ORDER) {
    const arr = baseMap.get(cat);
    if (arr && arr.length) ordered.push([cat, arr]);
  }
  for (const rule of EXTRA_CATEGORIES) {
    const arr = extraBuckets.get(rule.name);
    if (arr && arr.length) ordered.push([rule.name, arr]);
  }
  if (shorts.length) ordered.push(['숏츠', shorts]);

  return ordered;
});
async function loadAll() {
  // 페이지가 떨어질 때까지 반복해서 모두 적재
  while (!done.value) {
    await loadMore();
  }
}
onMounted(async () => {
  await loadAll();
});

onBeforeUnmount(() => {});

async function loadMore() {
  if (loading.value || done.value) return;
  loading.value = true;
  try {
    const raw = await eduAPI.getMovieList({ offset: offset.value, pageSize });
    const rows = Array.isArray(raw)
      ? raw
      : raw?.content ?? raw?.list ?? raw?.items ?? [];
    if (!rows || rows.length === 0) {
      done.value = true;
      return;
    }
    const normalized = await normalizeVideos(rows);
    const append = normalized.filter((it) => {
      const key = it.id ?? `${it.link}|${it.url}`;
      if (seenIds.has(key)) return false;
      seenIds.add(key);
      return true;
    });
    videos.value.push(...append);
    offset.value += rows.length;
  } catch (e) {
    console.error('전체 로드 실패:', e);
  } finally {
    loading.value = false;
  }
}

/* ── 타입 판별/정규화 ─────────────────────────────────── */
const headCache = new Map();

async function normalizeVideos(raw) {
  const arr = raw.map((r) => {
    const link = r.link || r.xtrnlContentsUrl || '';
    const url = r.url || r.fileDownUrl || '';
    const type = link ? 'youtube' : guessByExt(url);
    return { id: r.id, title: r.title, url, link, type };
  });
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
        /* ignore */
      }
    }
  };
  await Promise.allSettled(Array.from({ length: concurrency }, worker));
}

/* ── 오버레이 ────────────────────────────────────────── */
function openOverlay(item) {
  if (!['youtube', 'video', 'image'].includes(item.type)) {
    window.open(item.url, '_blank', 'noopener');
    return;
  }
  current.value = item;
  isOverlayOpen.value = true;
  document.documentElement.style.overflow = 'hidden';
}
function closeOverlay() {
  isOverlayOpen.value = false;
  setTimeout(() => {
    current.value = null;
    document.documentElement.style.overflow = '';
  }, 150);
}
function onKeyDown(e) {
  if (e.key === 'Escape' && isOverlayOpen.value) closeOverlay();
}

/* ── 유튜브 헬퍼 ─────────────────────────────────────── */
function getEmbedUrl(id) {
  const p = new URLSearchParams({
    autoplay: '1',
    rel: '0',
    modestbranding: '1',
    playsinline: '1',
  });
  return `https://www.youtube.com/embed/${id}?${p.toString()}`;
}
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
    const m = String(url).match(
      /(?:v=|be\/|shorts\/|embed\/)([a-zA-Z0-9_-]{6,})/
    );
    return m ? m[1] : '';
  }
}
</script>

<style scoped>
.education-video-page {
  padding: 2rem 1.5rem;
  max-width: 100%;
  margin: 0 auto;
}
.education-video-page.no-scroll {
  overflow: hidden;
}

.video-section {
  margin-bottom: 3rem;
}
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.2rem;
}

.card-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem 1.2rem;
}
.card {
  padding: 0;
  background: #fff;
  border-radius: 0.4rem;
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
    width: calc(50% - 0.6rem);
  }
}
@media (min-width: 1024px) {
  .card {
    width: calc(25% - 0.9rem);
  }
}

.thumb {
  width: 100%;
  display: block;
  background: #000;
}
.thumb-16x9 {
  aspect-ratio: 16 / 9;
  object-fit: cover;
}
.video-fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}
.play-badge {
  font-size: 2rem;
}

.card-title {
  padding: 0.6rem 0.4rem;
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
  background: rgba(0, 0, 0, 0.82);
  backdrop-filter: blur(2px);
  padding: 2rem;
}
.player-wrap {
  width: min(1200px, 92vw);
  aspect-ratio: 16/9;
  background: #000;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
}
.player-iframe,
.player-image {
  width: 100%;
  height: 100%;
  border: 0;
  border-radius: 12px;
  object-fit: contain;
  background: #000;
}
.close-button {
  position: fixed;
  top: 1.5rem;
  right: 1.5rem;
  font-size: 2rem;
  background: none;
  color: #fff;
  border: none;
  cursor: pointer;
}
.page-description {
  text-align: center;
  margin-bottom: 1.5rem;
  background: #f3f6f9;
  padding: 1rem;
  border-radius: 16px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
}
.page-title {
  font-size: var(--font-size-3xl);
  font-weight: bold;
  color: var(--text-primary);
}
.page-subtitle {
  font-size: var(--font-size-base);
  color: var(--text-secondary);
  line-height: 1.8;
}
.education-video-page {
  padding: 2rem 1.5rem;
  max-width: 90%;
  margin: 0 auto;
}
.education-video-page.no-scroll {
  overflow: hidden;
}

.filter-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 12px 0 16px;
}
.series-toggle {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  user-select: none;
  font-size: 14px;
  color: #333;
}
.series-select {
  height: 36px;
  border: 1px solid var(--border-light);
  border-radius: 8px;
  padding: 0 10px;
  background: #fff;
  color: #111;
}
.series-section {
  margin-bottom: 28px;
}
.series-header {
  font-size: 1rem; /* 제목 조금 작게 */
  display: grid;
  grid-template-columns: 1fr auto auto; /* 제목 | 갯수 | 토글 */
  column-gap: var(--spacing-sm);
  align-items: center;
  margin: 6px 2px 10px;
  font-weight: bold;
  cursor: pointer;
}
.series-title {
  font-size: var(--font-size-xl);
  line-height: 1.3;
  color: var(--text-primary);
}
.series-count {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  white-space: nowrap;
  min-width: 2.5rem; /* 숫자 정렬을 위한 고정 폭 */
  text-align: right;
}
.toggle-indicator {
  font-size: 0.9rem;
  margin-left: 8px;
}
.series-header[aria-expanded='true'] .toggle-indicator {
  transform: rotate(180deg);
}

/* 아코디언 간격 + 애니메이션 */
.accordion-panel {
  margin-top: var(--spacing-sm);
  overflow: hidden;
}
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
  max-height: 1200px;
  opacity: 1;
}
</style>

<style scoped>
@media (max-width: 768px) {
  .series-title {
    font-size: 1rem;
  }
  .series-header {
    column-gap: var(--spacing-xs);
  }
  .series-count {
    min-width: 2.2rem;
  }
  .accordion-panel {
    margin-top: var(--spacing-md);
  }
}
</style>
