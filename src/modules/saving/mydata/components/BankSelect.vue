<template>
  <div class="single-select">
    <!-- 트리거 -->
    <button
      :id="id"
      ref="triggerEl"
      class="trigger"
      type="button"
      :aria-expanded="isOpen ? 'true' : 'false'"
      aria-haspopup="listbox"
      :aria-controls="panelId"
      :aria-label="displayLabel"
      @click="toggle()"
      @keydown="onTriggerKeydown"
    >
      <span class="value" :class="{ placeholder_value: !hasSelection }">
        {{ displayLabel }}
      </span>
      <span class="chevron" aria-hidden>▾</span>
    </button>

    <!-- 드롭다운 패널 (기본 4행 높이, 슬라이드/스크롤) -->
    <Teleport to="body">
      <div
        v-if="isOpen"
        ref="panelEl"
        class="panel panel-floating"
        :style="floatingStyle"
        role="listbox"
        :id="panelId"
        :aria-activedescendant="activeId"
        tabindex="-1"
        @keydown="onListKeydown"
      >
        <div
          v-for="(opt, idx) in options"
          :key="opt.value"
          class="option"
          :id="optionId(idx)"
          role="option"
          :aria-selected="idx === selectedIndex"
          :class="{
            selected: idx === selectedIndex,
            active: idx === activeIndex,
          }"
          @click="select(idx)"
          @mousemove="setActive(idx)"
        >
          {{ opt.label }}
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue';
import { BankType } from '@/constants/BankList';

/** 구성 */
const id = 'bank-single-select';
const panelId = `${id}-panel`;
const ITEM_HEIGHT = 40; // 옵션 한 줄 높이(px)
const VISIBLE_ROWS = 4; // 기본 표시 줄 수(=4)

/** 상태 */
const isOpen = ref(false);
const triggerEl = ref(null);
const panelEl = ref(null);

const options = computed(() =>
  Object.entries(BankType).map(([code, name]) => ({ value: code, label: name }))
);

const selectedIndex = ref(-1); // 선택 인덱스
const activeIndex = ref(0); // 키보드/호버 활성 인덱스

/** 파생값 */
const selectedLabel = computed(() =>
  selectedIndex.value >= 0 ? options.value[selectedIndex.value]?.label : ''
);
const selectedValue = computed(() =>
  selectedIndex.value >= 0 ? options.value[selectedIndex.value]?.value : ''
);

// 기존 selectedIndex / options는 그대로 사용
const hasSelection = computed(() => selectedIndex.value >= 0);

const displayLabel = computed(
  () => selectedLabel.value || '은행을 선택하세요.'
);
const activeId = computed(() =>
  activeIndex.value >= 0 ? optionId(activeIndex.value) : undefined
);
function optionId(idx) {
  return `${id}-opt-${idx}`;
}

/** 동작 */
function toggle() {
  isOpen.value ? close() : open();
}
const floatingStyle = ref({});

async function open() {
  if (isOpen.value) return;
  isOpen.value = true;
  await nextTick();

  const rect = triggerEl.value.getBoundingClientRect();
  const wantH = ITEM_HEIGHT * VISIBLE_ROWS + 12;
  const spaceBelow = window.innerHeight - rect.bottom;
  const openUp = spaceBelow < wantH;

  floatingStyle.value = {
    position: 'fixed',
    top: openUp ? `${rect.top - wantH}px` : `${rect.bottom}px`,
    left: `${rect.left}px`,
    width: `${rect.width}px`,
    maxHeight: `${ITEM_HEIGHT * VISIBLE_ROWS}px`,
    zIndex: 2000,
  };

  panelEl.value?.focus();
  document.addEventListener('click', onOutside, { capture: true });
}

function close() {
  if (!isOpen.value) return;
  isOpen.value = false;
  document.removeEventListener('click', onOutside, { capture: true });
  triggerEl.value?.focus();
}
function onOutside(e) {
  const t = e.target;
  if (!triggerEl.value?.contains(t) && !panelEl.value?.contains(t)) {
    close();
  }
}
function select(idx) {
  selectedIndex.value = idx;
  close();
}
function setActive(idx) {
  activeIndex.value = idx;
}
function scrollIntoView(idx) {
  const el = panelEl.value;
  if (!el) return;
  const top = idx * ITEM_HEIGHT;
  const bottom = top + ITEM_HEIGHT;
  if (top < el.scrollTop) el.scrollTop = top;
  else if (bottom > el.scrollTop + el.clientHeight) {
    el.scrollTop = bottom - el.clientHeight;
  }
}

/** 키보드 인터랙션 */
function onTriggerKeydown(e) {
  if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    open();
  }
}
function onListKeydown(e) {
  if (e.key === 'Escape') {
    e.preventDefault();
    close();
    return;
  }
  if (e.key === 'Enter') {
    e.preventDefault();
    select(activeIndex.value);
    return;
  }
  if (e.key === 'ArrowDown') {
    e.preventDefault();
    activeIndex.value = Math.min(
      activeIndex.value + 1,
      options.value.length - 1
    );
    scrollIntoView(activeIndex.value);
  }
  if (e.key === 'ArrowUp') {
    e.preventDefault();
    activeIndex.value = Math.max(activeIndex.value - 1, 0);
    scrollIntoView(activeIndex.value);
  }
  if (e.key === 'Home') {
    e.preventDefault();
    activeIndex.value = 0;
    scrollIntoView(0);
  }
  if (e.key === 'End') {
    e.preventDefault();
    activeIndex.value = options.value.length - 1;
    scrollIntoView(activeIndex.value);
  }
}

onBeforeUnmount(() => {
  document.removeEventListener('click', onOutside, { capture: true });
});
</script>

<style scoped>
.single-select {
  width: 100%;
}

.trigger {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.6rem;
  padding: 0.6rem 0.75rem;
  border: 1px solid #d0d7de;
  border-radius: 8px;
  background: #fff;
  cursor: pointer;
}
.trigger:focus {
  outline: none;
  border-color: #6ca56a;
  box-shadow: 0 0 0 3px rgba(172, 205, 150, 0.25);
}
.value {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.chevron {
  color: #666;
}

.panel {
  margin-top: 0.4rem;
  border: 1px solid #d0d7de;
  border-radius: 8px;
  background: #fff;
  overflow-y: auto; /* ← 슬라이드(스크롤) */
  /* max-height는 스크립트에서 4행 기준으로 세팅 */
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.06);
}

.option {
  height: 40px;
  line-height: 40px; /* ITEM_HEIGHT와 일치 */
  padding: 0 0.75rem;
  cursor: pointer;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.option:hover,
.option.active {
  background: #f1f5f9;
}
.option.selected {
  font-weight: 700;
  color: #1f6feb;
}
.value.placeholder_value {
  color: #9ca3af;
} /* 연한 회색 */
</style>
