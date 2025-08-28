<template>
  <button
    @click="handleBack"
    class="back-button"
    :class="{ 'mobile-only': mobileOnly, hidden: isMobileMenuOpen }"
    aria-label="뒤로가기"
  >
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M15 18L9 12L15 6"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
    <span v-if="showText">뒤로가기</span>
  </button>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';

const props = defineProps({
  showText: {
    type: Boolean,
    default: false,
  },
  mobileOnly: {
    type: Boolean,
    default: true,
  },
  customAction: {
    type: Function,
    default: null,
  },
});

const router = useRouter();
const isMobileMenuOpen = ref(false);

const handleBack = () => {
  if (props.customAction) {
    props.customAction();
  } else {
    router.back();
  }
};

const handleMobileMenuToggle = (event) => {
  isMobileMenuOpen.value = event.detail.isOpen;
};

onMounted(() => {
  window.addEventListener('mobile-menu-toggle', handleMobileMenuToggle);
});

onUnmounted(() => {
  window.removeEventListener('mobile-menu-toggle', handleMobileMenuToggle);
});
</script>

<style scoped>
.back-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.5rem;
  background: transparent;
  border: none;
  color: var(--color-dark);
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.2s ease;
  font-size: 0.9rem;
  font-weight: 500;
  position: fixed;
  top: 1.5rem;
  left: 1.5rem;
  z-index: 1000;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border: 1px solid var(--border-light);
}

.back-button:hover {
  background: var(--color-primary);
  color: var(--color-dark);
  transform: translateX(-2px);
}

.back-button:active {
  transform: translateX(-1px) scale(0.98);
}

.back-button svg {
  flex-shrink: 0;
  transition: transform 0.2s ease;
}

.back-button:hover svg {
  transform: translateX(-2px);
}

/* 기본적으로 모바일에서만 표시 */
.mobile-only {
  display: none;
}

/* 숨김 상태 */
.hidden {
  display: none !important;
}

@media (max-width: 768px) {
  .mobile-only {
    display: flex;
  }

  .back-button {
    top: 6rem;
    left: 1rem;
    padding: 0.75rem;
    background: rgba(255, 255, 255, 0.98);
  }
}

/* 데스크톱에서도 표시하고 싶을 때 */
.back-button:not(.mobile-only) {
  display: flex;
}
</style>
