<template>
  <div class="content-compare">
    <header class="compare-header">
      <div class="ch-left">
        <h1 class="ch-title">비교함</h1>
        <p class="ch-sub">
          관심 상품을 한눈에 비교해보세요. {{ '\n' }}탭을 바꿔 예금/적금/카드를
          전환할 수 있어요.
        </p>
      </div>
      <div class="ch-meta">
        <span>비교함 담긴 개수 :</span>
        <RouterLink to="/compare?type=DEPOSIT">
          <span
            class="meta-chip"
            :class="{ active: activeTab === 'DEPOSIT' }"
            :data-tip="'예금 비교함에 담긴 상품 수'"
            aria-label="예금 비교함에 담긴 상품 수"
          >
            예금 <strong>{{ counts.DEPOSIT }}</strong>
          </span></RouterLink
        >
        <RouterLink to="/compare?type=SAVING">
          <span
            class="meta-chip"
            :class="{ active: activeTab === 'SAVING' }"
            :data-tip="'적금 비교함에 담긴 상품 수'"
            aria-label="적금 비교함에 담긴 상품 수"
          >
            적금 <strong>{{ counts.SAVING }}</strong>
          </span></RouterLink
        >
        <RouterLink to="/compare?type=CARD">
          <span
            class="meta-chip"
            :class="{ active: activeTab === 'CARD' }"
            :data-tip="'카드 비교함에 담긴 상품 수'"
            aria-label="카드 비교함에 담긴 상품 수"
          >
            카드 <strong>{{ counts.CARD }}</strong>
          </span></RouterLink
        >
      </div>
    </header>

    <div class="tab-wrap">
      <TabSelector :initial-tab="activeTab" @change-tab="handleTabChange" />
    </div>

    <!-- 전환 컨테이너 (높이 스무딩) -->
    <div class="compare-body" ref="bodyRef">
      <Transition
        name="tab"
        mode="out-in"
        appear
        @before-enter="onBeforeEnter"
        @after-enter="onAfterEnter"
      >
        <KeepAlive include="DepositComparison,SavingComparison,CardComparison">
          <component
            :is="currentComponent"
            :key="activeTab"
            :products="currentProducts"
          />
        </KeepAlive>
      </Transition>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch, computed, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import TabSelector from '@/shared/components/common/TabSelector.vue';

// 자식 비교 컴포넌트들 (각 파일에 name 지정 필요: DepositComparison, SavingComparison, CardComparison)
import DepositComparison from '@/modules/compare/components/DynamicDepositComparison.vue';
import SavingComparison from '@/modules/compare/components/DynamicSavingComparison.vue';
import CardComparison from '@/modules/compare/components/DynamicCardComparison.vue';

import { useCompareStore } from '@/shared/stores/compareStore';
import compareApi from '@/modules/compare/api/compare';

const route = useRoute();
const router = useRouter();
const store = useCompareStore();

const activeTab = ref('DEPOSIT');
const products = reactive({ DEPOSIT: [], SAVING: [], CARD: [] });
const bodyRef = ref(null);

const counts = computed(() => ({
  DEPOSIT: store.compareList.DEPOSIT?.length ?? 0,
  SAVING: store.compareList.SAVING?.length ?? 0,
  CARD: store.compareList.CARD?.length ?? 0,
}));

// URL 쿼리로부터 초기 탭 설정
const compareType = computed(() => {
  const type = (route.query.type || '').toString().toUpperCase();
  return ['DEPOSIT', 'SAVING', 'CARD'].includes(type) ? type : 'DEPOSIT';
});
activeTab.value = compareType.value;

// 현재 탭에 맞는 컴포넌트/데이터
const currentComponent = computed(() => {
  switch (activeTab.value) {
    case 'SAVING':
      return SavingComparison;
    case 'CARD':
      return CardComparison;
    default:
      return DepositComparison;
  }
});
const currentProducts = computed(() => products[activeTab.value]);

// 탭 변경 핸들러 (URL 반영)
function handleTabChange(tab) {
  activeTab.value = tab;
  router.push({ query: { type: tab } });
}

// 비교 데이터 불러오기
async function fetchProducts() {
  try {
    const tab = activeTab.value;
    const compareList = store.compareList[tab];
    const result = await compareApi.getList(tab, compareList);
    products[tab] = result;
  } catch (e) {
    console.error('비교 리스트 불러오기 실패:', e);
  }
}

// route 쿼리 → activeTab 연결
watch(
  () => route.query.type,
  (newType) => {
    const upper = (newType || '').toString().toUpperCase();
    if (['DEPOSIT', 'SAVING', 'CARD'].includes(upper)) {
      activeTab.value = upper;
    }
  },
  { immediate: true }
);

// activeTab or 해당 compareList 변경 시 데이터 fetch
watch(
  [activeTab, () => store.compareList[activeTab.value]],
  async () => {
    await fetchProducts();
  },
  { immediate: true, deep: true }
);

// 높이 스무딩(레이아웃 튐 방지)
async function onBeforeEnter() {
  const el = bodyRef.value;
  if (!el) return;
  // 현재 높이를 ‘고정’
  const h = el.getBoundingClientRect().height;
  el.style.height = h + 'px';
  await nextTick();
}
function onAfterEnter() {
  const el = bodyRef.value;
  if (!el) return;
  // 다음 프레임에 auto로 복귀
  requestAnimationFrame(() => {
    el.style.height = 'auto';
  });
}
</script>

<style scoped>
.content-compare {
  width: 100%;
  max-width: 1120px;
  margin: 2rem auto;
  padding: 0 20px;
}

/* Hero/Header */
.compare-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 18px 20px;
  border: 1px solid #e2f0e8;
  border-radius: 14px;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.04);
}
.ch-left {
  flex: 1;
}
.ch-title {
  margin: 0;
  font-size: 24px;
  font-weight: 800;
  color: #1b5e20;
}
.ch-sub {
  margin: 6px 0 0;
  color: #517a5c;
  font-size: 1.2rem;
  white-space: pre-line;
}
.ch-meta {
  display: flex;
  gap: 8px;
  align-items: center;
}
.meta-chip {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border-radius: 999px;
  background: #f4f7f6;
  border: 1px solid #e1e7e5;
  font-weight: 700;
  font-size: 12px;
  color: #476256;
  transition: transform 0.18s ease, box-shadow 0.18s ease,
    background-color 0.18s ease, border-color 0.18s ease;
}
.meta-chip strong {
  font-weight: 800;
}
.meta-chip:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.06);
  background: #f8fbfa;
}
.meta-chip.active {
  background: #e6f4ec;
  border-color: #cfe7d8;
  color: #2e7d32;
  animation: glowPulse 900ms ease-in-out 1;
}

/* Tooltip */
.meta-chip[data-tip]:hover::after {
  content: attr(data-tip);
  position: absolute;
  left: 50%;
  top: calc(100% + 8px);
  transform: translateX(-50%);
  white-space: nowrap;
  background: #1f2937;
  color: #fff;
  padding: 6px 8px;
  font-size: 11px;
  border-radius: 6px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.18);
  pointer-events: none;
  z-index: 10;
}
.meta-chip[data-tip]:hover::before {
  content: '';
  position: absolute;
  left: 50%;
  top: 100%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-top: 6px solid #1f2937;
}

/* Sticky tab area */
.tab-wrap {
  position: sticky;
  top: 0;
  z-index: 5;
  background: #ffffff;
  padding-top: 12px;
  margin-top: 12px;
}

/* 전환 컨테이너 */
.compare-body {
  min-height: calc(
    100vh - var(--header-height)
  ); /* 대충 비교 컴포넌트의 최소 높이에 맞춰 설정 */
  transition: min-height 0.2s ease;

  margin: 2rem 0;
}

/* Entrance animations for header/body */
.compare-header {
  animation: fadeSlideIn 240ms ease both;
}
@keyframes fadeSlideIn {
  from {
    opacity: 0;
    transform: translateY(4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
@keyframes glowPulse {
  0% {
    box-shadow: 0 0 0 rgba(46, 125, 50, 0);
  }
  50% {
    box-shadow: 0 0 0 8px rgba(46, 125, 50, 0.12);
  }
  100% {
    box-shadow: 0 0 0 rgba(46, 125, 50, 0);
  }
}

/* === 탭 전환 트랜지션 === */
/* 옵션 A: 크로스 페이드 + 살짝 슬라이드 */
.tab-enter-active {
  transition: opacity 220ms ease, transform 220ms ease;
}
.tab-leave-active {
  transition: opacity 320ms ease, transform 320ms ease;
} /* 닫힐 때 살짝 더 천천히 */
.tab-enter-from,
.tab-leave-to {
  opacity: 0;
  transform: translateY(6px);
}

/* 옵션 B(얌전): opacity만
.tab-enter-active { transition: opacity 180ms ease; }
.tab-leave-active { transition: opacity 260ms ease; }
.tab-enter-from, .tab-leave-to { opacity: 0; }
*/

@media (max-width: 900px) {
  .compare-header {
    flex-direction: column;
    align-items: flex-start;
  }
  .ch-meta {
    align-self: stretch;
  }
}

@media (max-width: 640px) {
  .content-compare {
    width: 100%;
    margin: 1.25rem auto;
    padding: 0 14px;
  }
  .ch-title {
    font-size: 20px;
  }
  .meta-chip {
    padding: 6px 10px;
    font-size: 11px;
  }
}
</style>
