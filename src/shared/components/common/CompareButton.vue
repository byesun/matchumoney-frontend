<template>
  <button
    class="compare-button"
    :class="{ added: isAlreadyCompared }"
    @pointerdown.stop
    @click.stop.prevent="onCompareClick"
  >
    {{ isAlreadyCompared ? '⊖비교제거' : '⊕비교추가' }}
  </button>

  <!-- ✅ 모달은 body로 텔레포트 -->
  <teleport to="body">
    <!-- 성공 모달 -->
    <template v-if="showModal && !showFullModal" @click.stop>
      <transition name="mb-pop" appear>
        <button class="mb-modal hover-lift" @click.stop="goCompare">
          비교함으로 이동하기
        </button></transition
      >
    </template>

    <!-- 비교함 가득참 모달 -->
    <template v-if="showFullModal" @click.stop>
      <transition name="full-modal-fade" appear>
        <div class="full-modal-overlay" @click.stop="closeFullModal">
          <div class="full-modal-content" @click.stop>
            <h3>비교함이 가득 찼습니다</h3>
            <p>같은 종류의 상품은 최대 2개까지 비교할 수 있습니다.<br>기존 상품을 제거하고 새 상품을 추가해보세요.</p>
            
            <div class="current-products">
              <h4>현재 비교함에 있는 상품</h4>
              <div class="product-list">
                <div 
                  v-for="product in currentCompareProductsWithNames" 
                  :key="product.id"
                  class="product-item"
                >
                  <span>{{ product.name || `ID ${product.id}` }}</span>
                  <button 
                    class="remove-btn" 
                    @click="removeFromCompare(product.id)"
                  >
                    제거
                  </button>
                </div>
              </div>
            </div>

            <div class="modal-actions">
              <button class="btn-secondary" @click="closeFullModal">취소</button>
              <button class="btn-primary" @click="goCompare">비교함 보기</button>
            </div>
          </div>
        </div>
      </transition>
    </template>
  </teleport>
</template>

<script setup>
import { useCompareStore } from '@/shared/stores/compareStore';
import { defineProps, computed, ref, nextTick, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import api from "@/shared/api";
import { useCustomModal } from '@/shared/composables/useCustomModal';

const compareStore = useCompareStore();
const router = useRouter();
const { showAlert } = useCustomModal();

const props = defineProps({
  productId: { type: Number, required: true },
  productType: { type: String, required: true },
});

const showModal = ref(false);
const showFullModal = ref(false);
const currentCompareProducts = ref([]);
const currentCompareProductsWithNames = ref([]);
const autoHideTimer = ref(null); // ✅ 타이머

const isAlreadyCompared = computed(() =>
  compareStore.isCompared(props.productId, props.productType)
);

// 상품 타입에 따른 API 엔드포인트 매핑
const getProductApiEndpoint = (productType) => {
  const typeMap = {
    'DEPOSIT': 'deposit-products',
    'SAVING': 'saving-products', 
    'CARD': 'card-products'
  };
  return typeMap[productType] || 'deposit-products';
};

// 상품 정보 가져오기
const fetchProductInfo = async (productId, productType) => {
  try {
    const endpoint = getProductApiEndpoint(productType);
    const response = await api.get(`/${endpoint}/${productId}`);
    return {
      id: productId,
      name: response.data.finPrdtNm || response.data.name || response.data.cardName || `상품 ${productId}`,
    };
  } catch (error) {
    console.error(`상품 정보 가져오기 실패 (ID: ${productId}):`, error);
    return {
      id: productId,
      name: `상품 ${productId}`,
    };
  }
};

// 여러 상품 정보를 병렬로 가져오기
const fetchMultipleProductsInfo = async (productIds, productType) => {
  const promises = productIds.map(id => fetchProductInfo(id, productType));
  return await Promise.all(promises);
};

function clearAutoHide() {
  if (autoHideTimer.value) {
    clearTimeout(autoHideTimer.value);
    autoHideTimer.value = null;
  }
}
function scheduleAutoHide(ms = 5000) {
  clearAutoHide();
  autoHideTimer.value = setTimeout(() => {
    showModal.value = false;
    autoHideTimer.value = null;
  }, ms);
}

const onCompareClick = async (e) => {
  e?.stopPropagation?.();
  e?.preventDefault?.();

  if (isAlreadyCompared.value) {
    compareStore.removeProduct({
      id: props.productId,
      type: props.productType,
    });
    showModal.value = false;
    showFullModal.value = false;
    clearAutoHide();
    return;
  }

  const result = compareStore.addProduct({ id: props.productId, type: props.productType });
  
  if (result && !result.success) {
    if (result.error === 'COMPARE_FULL') {
      // 비교함이 가득 찬 경우
      currentCompareProducts.value = result.currentProducts;
      
      // 상품 정보를 가져와서 이름 포함해서 저장
      currentCompareProductsWithNames.value = await fetchMultipleProductsInfo(
        result.currentProducts, 
        props.productType
      );
      
      showFullModal.value = true;
      showModal.value = false;
      clearAutoHide();
    } else if (result.error === 'ALREADY_EXISTS') {
      // 이미 존재하는 상품인 경우
      await showAlert('이미 추가된 상품입니다.', '중복 상품');
    }
    return;
  }

  // 성공적으로 추가된 경우
  showModal.value = true;
  showFullModal.value = false;
  scheduleAutoHide(5000); // ✅ 5초 후 자동 닫힘
};

const goCompare = () => {
  showModal.value = false;
  showFullModal.value = false;
  clearAutoHide(); // ✅ 이동 시 타이머 정리
  router.push(`/compare?type=${props.productType}`);
};

const closeFullModal = () => {
  showFullModal.value = false;
  currentCompareProducts.value = [];
  currentCompareProductsWithNames.value = [];
};

const removeFromCompare = (productId) => {
  compareStore.removeProduct({
    id: productId,
    type: props.productType,
  });
  
  // 현재 목록에서 제거
  currentCompareProducts.value = currentCompareProducts.value.filter(id => id !== productId);
  currentCompareProductsWithNames.value = currentCompareProductsWithNames.value.filter(product => product.id !== productId);
  
  // 모든 상품이 제거되면 모달 닫기
  if (currentCompareProducts.value.length === 0) {
    closeFullModal();
  }
};

onUnmounted(clearAutoHide); // ✅ 컴포넌트 파기 시 정리
</script>

<style scoped>
.compare-button {
  background-color: #f1f1f1;
  border: none;
  border-radius: 20px;
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 600;
  color: #333;
  cursor: pointer;
  transition: background-color 0.2s ease, transform 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 6px; /* 아이콘/텍스트 간격 대비 */
  outline: none;
}
.compare-button:hover {
  background-color: #e0e0e0;
  transform: translateY(-1px);
}
.compare-button:focus-visible {
  box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.08);
}
.compare-button.added {
  background-color: #e6f0ff;
  color: #007bff;
}
.compare-button.added:hover {
  background-color: #d0e5ff;
}
@media (max-width: 1024px) {
  .compare-button {
    font-size: var(--font-size-md);
    padding: 6px 10px; /* responsive padding like like button */
    margin: 0px -11px 0px 0px;
    padding: 4px 8px;
  }
}
</style>

<style>
.mb-modal {
  position: fixed;
  left: 50%;
  bottom: 1%;
  transform: translate(-50%, -50%);
  background: var(--color-accent);
  color: var(--color-white);
  padding: var(--spacing-md) var(--spacing-lg);
  border-radius: var(--spacing-3xl);
  box-shadow: var(--shadow-modal);
  z-index: 2147483647;
  text-align: center;
  font-size: var(--font-size-lg);
  font-weight: bold;
  border: 0;
} /* 공통 전환 추가 (기존 style 아래에 붙이기) */
.mb-modal {
  transition: transform 0.2s ease-out, box-shadow 0.2s ease-out,
    opacity 0.2s ease-out;
}

/* 1) Lift: 살짝 위로 떠오르고 그림자 강화 */
.mb-modal.hover-lift:hover {
  background: var(--color-dark);
  transform: translate(-50%, -50%) translateY(-4px);
}
/* 등장/퇴장 트랜지션 */
.mb-modal.mb-pop-enter-active,
.mb-modal.mb-pop-leave-active {
  transition: opacity 0.22s ease-out, transform 0.22s ease-out;
}

.mb-modal.mb-pop-enter-from,
.mb-modal.mb-pop-leave-to {
  opacity: 0;
  /* 살짝 아래/작게 시작 */
  transform: translate(-50%, -60%) scale(0.96);
}

.mb-modal.mb-pop-enter-to,
.mb-modal.mb-pop-leave-from {
  opacity: 1;
  transform: translate(-50%, -50%) scale(1);
}

.compare-button {
  text-align: center;
  justify-content: center;
  width: auto;
  min-width: fit-content;
  display: flex;
  align-items: center;
  padding-left: 8px; /* 좌측 패딩 추가 */
  padding-right: 8px; /* 우측 패딩 추가 */
  margin: 0 auto; /* 좌우 마진 자동으로 중앙 정렬 */
}

/* 비교함 가득참 모달 스타일 */
.full-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2147483647;
}

.full-modal-content {
  background: white;
  border-radius: 12px;
  padding: 24px;
  max-width: 400px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
}

.full-modal-content h3 {
  margin: 0 0 12px 0;
  color: var(--color-dark);
  font-size: 1.25rem;
  font-weight: 600;
}

.full-modal-content p {
  margin: 0 0 20px 0;
  color: var(--color-gray-600);
  line-height: 1.5;
}

.current-products {
  margin: 20px 0;
}

.current-products h4 {
  margin: 0 0 12px 0;
  color: var(--color-dark);
  font-size: 1rem;
  font-weight: 500;
}

.product-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.product-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  background: var(--color-gray-50);
  border-radius: 8px;
  border: 1px solid var(--border-light);
}

.product-item span {
  font-size: 0.9rem;
  color: var(--color-dark);
}

.remove-btn {
  background: var(--color-error);
  color: white;
  border: none;
  border-radius: 6px;
  padding: 6px 12px;
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.remove-btn:hover {
  background: var(--color-error-dark);
}

.modal-actions {
  display: flex;
  gap: 12px;
  margin-top: 24px;
}

.btn-secondary, .btn-primary {
  flex: 1;
  padding: 10px 16px;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn-secondary {
  background: var(--color-gray-100);
  color: var(--color-dark);
}

.btn-secondary:hover {
  background: var(--color-gray-200);
}

.btn-primary {
  background: var(--color-accent);
  color: white;
}

.btn-primary:hover {
  background: var(--color-dark);
}

/* 모달 애니메이션 */
.full-modal-fade-enter-active,
.full-modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.full-modal-fade-enter-active .full-modal-content,
.full-modal-fade-leave-active .full-modal-content {
  transition: transform 0.3s ease;
}

.full-modal-fade-enter-from,
.full-modal-fade-leave-to {
  opacity: 0;
}

.full-modal-fade-enter-from .full-modal-content,
.full-modal-fade-leave-to .full-modal-content {
  transform: scale(0.95) translateY(-10px);
}
</style>
