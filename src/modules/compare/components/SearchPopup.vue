<!-- components/SearchPopup.vue -->
<template>
  <Teleport to="body">
    <!-- leave 끝난 뒤에만 부모 언마운트 통지 -->
    <transition
      name="modal"
      appear
      :duration="{ enter: 220, leave: 480 }"
      @after-leave="onAfterLeave"
    >
      <div
        class="modal-overlay z-prime"
        v-show="visible"
        @click.self="startClose"
      >
        <div
          class="popup-container"
          role="dialog"
          aria-modal="true"
          aria-label="상품 검색"
          tabindex="-1"
          @keydown.esc.prevent="startClose"
          ref="popupRef"
        >
          <div class="close">
            <button class="close-button" @click="startClose" aria-label="닫기">
              <i class="fas fa-times"></i>
            </button>
          </div>

          <br />
          <input
            v-model="keyword"
            placeholder="키워드 검색"
            class="base-input"
          />
          <div class="info">
            <div>{{ props.typeKo }} 상품 리스트</div>
            <div>정렬</div>
          </div>

          <div class="popup-body">
            <template v-if="loading">
              <div class="popup-body loading"><BaseSpinner /></div>
            </template>

            <ul v-show="!loading">
              <li
                v-for="item in filteredData"
                :key="item.id"
                @click="onSelect(item.id)"
              >
                <div class="img-wrap">
                  <img
                    :src="item.image ? item.image : '/src/assets/logo_dis.png'"
                    @load="onImageLoad($event, item.id)"
                    :class="imageSizeMap[item.id]"
                    alt=""
                  />
                </div>
                <div class="content-box">
                  <div class="name">{{ item.finPrdtName }}</div>
                  <div class="company">{{ item.korCoName }}</div>
                </div>
              </li>
              <li v-if="filteredData.length === 0">검색 결과가 없습니다.</li>
            </ul>
          </div>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script setup>
import {
  ref,
  computed,
  onMounted,
  onUnmounted,
  defineProps,
  reactive,
  nextTick,
} from 'vue';
import { useCompareStore } from '@/shared/stores/compareStore';
import compareApi from '@/modules/compare/api/compare';
import BaseSpinner from '@/shared/components/base/BaseSpinner.vue';

const props = defineProps({ type: String, typeKo: String });
const emit = defineEmits(['close']);

const loading = ref(false);
const data = ref([]);
const keyword = ref('');
const compareStore = useCompareStore();

const visible = ref(false);
const popupRef = ref(null);

const imageSizeMap = reactive({});
const loadedImageCount = ref(0);
const totalImageCount = ref(0);

function onImageLoad(e, id) {
  const img = e.target;
  const isTall = img.naturalHeight > img.naturalWidth;
  imageSizeMap[id] = isTall ? 'tall' : 'wide';
  loadedImageCount.value++;
  if (loadedImageCount.value >= totalImageCount.value) loading.value = false;
}

async function fetchProducts() {
  loading.value = true;
  try {
    const result = await compareApi.getSearchList(props.type);
    data.value = result;
    totalImageCount.value = result.length;
    loadedImageCount.value = 0;
  } catch (e) {
    console.error('search List 불러오기 실패:', e);
    loading.value = false;
  }
}

const filteredData = computed(() =>
  data.value.filter((item) => item.finPrdtName?.includes(keyword.value))
);

function onSelect(id) {
  compareStore.addProduct({ id, type: props.type });
  startClose(); // 언마운트 X, 먼저 숨김 → leave 재생
}

function startClose() {
  visible.value = false; // ✅ 여기서는 emit 호출 금지!
}

function onAfterLeave() {
  emit('close'); // ✅ 애니 끝난 뒤에만 부모 언마운트
}

onMounted(async () => {
  const hasScroll =
    document.documentElement.scrollHeight >
    document.documentElement.clientHeight;
  if (hasScroll) {
    const sbw = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.paddingRight = sbw + 'px';
  }
  document.body.style.overflow = 'hidden';

  await fetchProducts();
  await nextTick();
  requestAnimationFrame(() => {
    visible.value = true; // enter 확실히 트리거
    popupRef.value?.focus?.();
  });
});

onUnmounted(() => {
  document.body.style.overflow = '';
  document.body.style.paddingRight = '';
});
</script>

<style scoped>
.z-prime {
  z-index: 10000;
}

/* Overlay */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.42);
  display: flex;
  align-items: center;
  justify-content: center;
  will-change: opacity;
}

/* 전환: overlay는 페이드, modal은 살짝 scale+페이드 */
.modal-enter-active {
  transition: opacity 220ms ease-out;
}
.modal-leave-active {
  transition: opacity 480ms ease;
  pointer-events: none;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .popup-container {
  transition: transform 220ms cubic-bezier(0.2, 0.8, 0.2, 1),
    opacity 220ms cubic-bezier(0.2, 0.8, 0.2, 1);
  transition-delay: 40ms; /* overlay보다 늦게 */
}
.modal-leave-active .popup-container {
  transition: transform 420ms cubic-bezier(0.4, 0, 0.2, 1),
    opacity 420ms cubic-bezier(0.4, 0, 0.2, 1);
}
.modal-enter-from .popup-container,
.modal-leave-to .popup-container {
  transform: scale(0.985);
  opacity: 0;
}

/* 팝업 레이아웃 */
.popup-container {
  position: relative;
  width: 90%;
  max-width: var(--breakpoint-sm);
  padding: 1.6rem 3rem 3rem 3rem;
  background-color: #fff;
  box-shadow: var(--shadow-sm);
  border-radius: var(--spacing-sm);
  outline: none;
  will-change: transform, opacity;
  transform: translateZ(0);
}

.base-input {
  padding: var(--spacing-sm) var(--spacing-md);
  width: 100%;
  border: 1px solid var(--color-accent);
  box-sizing: border-box;
  border-radius: var(--spacing-sm);
  font-size: var(--font-size-base);
  margin-bottom: var(--spacing-md);
}

.loading {
  background: #fff;
  display: flex;
  justify-content: center;
  align-items: center;
}

.popup-body {
  height: 50vh;
  overflow-y: scroll;
  scrollbar-width: none;
  -webkit-overflow-scrolling: touch;
  -ms-overflow-style: none;
}
.popup-body::-webkit-scrollbar {
  display: none;
}
.popup-body ul {
  list-style: none;
  padding: 0;
  margin: 0;
}
.popup-body li {
  display: flex;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  border-bottom: 1px solid var(--color-gray-200);
  align-items: center;
}
.popup-body li:hover {
  background-color: var(--color-gray-100);
}

.img-wrap {
  display: flex;
  justify-content: center;
  align-items: center;
  background: #eee;
  height: var(--spacing-3xl);
  width: var(--spacing-3xl);
  border-radius: 50%;
}
img.wide {
  width: var(--spacing-3xl);
}
img.tall {
  height: var(--spacing-3xl);
}

.content-box {
  text-align: start;
}
.content-box > .name {
  font-size: var(--font-size-lg);
  font-weight: bold;
}
.content-box > .company {
  font-size: var(--font-size-base);
}

.info {
  padding: var(--spacing-md) 0 var(--spacing-md);
  display: flex;
  width: 100%;
  justify-content: space-between;
}
.close {
  display: flex;
  justify-content: end;
}
.close > * {
  background: transparent;
  border: 0;
  font-size: var(--font-size-2xl);
}
.close > *:hover {
  scale: 1.1;
}

/* 모션 최소화 환경 */
@media (prefers-reduced-motion: reduce) {
  .modal-enter-active,
  .modal-leave-active,
  .modal-enter-active .popup-container,
  .modal-leave-active .popup-container {
    transition: none !important;
  }
}
</style>
