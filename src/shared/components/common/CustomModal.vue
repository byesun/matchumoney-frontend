<template>
  <div v-if="isVisible" class="custom-modal-overlay" @click="handleOverlayClick">
    <div class="custom-modal" @click.stop>
      <div class="custom-modal__head">
        <h3 class="custom-modal-title">{{ title }}</h3>
        <button 
          v-if="!isConfirm" 
          class="custom-modal-close" 
          @click="handleClose" 
          aria-label="닫기"
        >
          ✕
        </button>
      </div>
      
      <div class="custom-modal-message" v-html="message"></div>
      
      <div class="custom-modal-actions">
        <button 
          v-if="isConfirm" 
          class="btn ghost" 
          type="button" 
          @click="handleClose"
        >
          취소
        </button>
        <button 
          class="btn primary" 
          type="button" 
          @click="handleConfirm"
          :class="{ 'btn-danger': isConfirm && isDanger }"
        >
          {{ confirmText }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  isVisible: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: '알림'
  },
  message: {
    type: String,
    default: ''
  },
  isConfirm: {
    type: Boolean,
    default: false
  },
  isDanger: {
    type: Boolean,
    default: false
  },
  confirmText: {
    type: String,
    default: '확인'
  },
  allowOverlayClose: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['close', 'confirm'])

const handleClose = () => {
  emit('close')
}

const handleConfirm = () => {
  emit('confirm')
}

const handleOverlayClick = () => {
  if (props.allowOverlayClose && !props.isConfirm) {
    handleClose()
  }
}

// ESC 키로 모달 닫기
watch(() => props.isVisible, (newValue) => {
  if (newValue) {
    document.addEventListener('keydown', handleEscKey)
    document.body.style.overflow = 'hidden'
  } else {
    document.removeEventListener('keydown', handleEscKey)
    document.body.style.overflow = ''
  }
})

const handleEscKey = (event) => {
  if (event.key === 'Escape' && props.allowOverlayClose && !props.isConfirm) {
    handleClose()
  }
}
</script>

<style scoped>
/* ===== 커스텀 모달 ===== */
.custom-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
  backdrop-filter: blur(8px);
  animation: overlayFadeIn 0.3s ease-out;
}

.custom-modal {
  width: min(420px, 90vw);
  background: #ffffff;
  border-radius: 20px;
  box-shadow: 
    0 20px 60px rgba(0, 0, 0, 0.15),
    0 8px 32px rgba(0, 0, 0, 0.1),
    0 1px 0 rgba(255, 255, 255, 0.8) inset;
  padding: 28px;
  max-height: calc(100vh - 80px);
  overflow-y: auto;
  border: 1px solid rgba(229, 231, 235, 0.5);
  animation: modalSlideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes overlayFadeIn {
  from {
    opacity: 0;
    backdrop-filter: blur(0px);
  }
  to {
    opacity: 1;
    backdrop-filter: blur(8px);
  }
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.custom-modal__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.custom-modal-title {
  font-size: 19px;
  font-weight: 700;
  margin: 0;
  color: var(--color-dark, #40513b);
  letter-spacing: -0.02em;
}

.custom-modal-close {
  border: none;
  background: transparent;
  font-size: 20px;
  cursor: pointer;
  color: var(--text-secondary, #6b7280);
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.custom-modal-close:hover {
  background: var(--color-primary-20, rgba(237, 241, 214, 0.2));
  color: var(--color-dark, #40513b);
  transform: scale(1.05);
}

.custom-modal-message {
  font-size: 15px;
  color: var(--text-primary, #374151);
  line-height: 1.6;
  margin: 0 0 24px 0;
  word-break: keep-all;
}

.custom-modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.btn {
  height: 48px;
  padding: 0 24px;
  border-radius: 12px;
  border: 1px solid transparent;
  font-weight: 600;
  font-size: 15px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  box-sizing: border-box;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  min-width: 90px;
  letter-spacing: -0.01em;
}

.btn.primary {
  background: linear-gradient(135deg, var(--color-accent, #609966) 0%, var(--color-secondary, #9dc08b) 100%);
  color: #fff;
  border: 1px solid var(--color-accent, #609966);
  box-shadow: 
    0 4px 16px rgba(96, 153, 102, 0.3),
    0 2px 8px rgba(96, 153, 102, 0.2);
}

.btn.primary:hover {
  background: linear-gradient(135deg, var(--color-dark, #40513b) 0%, var(--color-accent, #609966) 100%);
  transform: translateY(-2px);
  box-shadow: 
    0 8px 24px rgba(96, 153, 102, 0.4),
    0 4px 12px rgba(96, 153, 102, 0.3);
}

.btn.ghost {
  background: var(--bg-card, #ffffff);
  border: 1.5px solid var(--color-primary, #edf1d6);
  color: var(--color-dark, #40513b);
}

.btn.ghost:hover {
  background: var(--color-primary-10, rgba(237, 241, 214, 0.1));
  border-color: var(--color-secondary, #9dc08b);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(157, 192, 139, 0.2);
}

.btn-danger {
  background: linear-gradient(135deg, var(--color-error, #ef4444) 0%, #f87171 100%) !important;
  border-color: var(--color-error, #ef4444) !important;
  color: #fff !important;
  box-shadow: 
    0 4px 16px rgba(239, 68, 68, 0.3) !important,
    0 2px 8px rgba(239, 68, 68, 0.2) !important;
}

.btn-danger:hover {
  background: linear-gradient(135deg, var(--color-error-dark, #dc2626) 0%, var(--color-error, #ef4444) 100%) !important;
  transform: translateY(-2px) !important;
  box-shadow: 
    0 8px 24px rgba(239, 68, 68, 0.4) !important,
    0 4px 12px rgba(239, 68, 68, 0.3) !important;
}

/* 모바일 최적화 */
@media (max-width: 480px) {
  .custom-modal-overlay {
    padding: 16px;
  }
  
  .custom-modal {
    width: calc(100vw - 32px);
    padding: 24px 20px;
    border-radius: 16px;
    max-height: calc(100vh - 32px);
    margin: 0;
  }
  
  .custom-modal-actions {
    flex-direction: column-reverse;
    gap: 12px;
    margin-top: 28px;
  }
  
  .custom-modal-actions .btn {
    width: 100%;
    min-width: unset;
    height: 52px;
    font-size: 16px;
  }
  
  .custom-modal-message {
    font-size: 16px;
    margin-bottom: 28px;
  }
  
  .custom-modal-title {
    font-size: 18px;
  }
}

/* 태블릿 최적화 */
@media (max-width: 768px) and (min-width: 481px) {
  .custom-modal {
    width: min(500px, 85vw);
  }
}

/* 접근성 개선 */
@media (prefers-reduced-motion: reduce) {
  .custom-modal-overlay {
    animation: none;
  }
  
  .custom-modal {
    animation: none;
  }
  
  .btn {
    transition: color 0.2s, background-color 0.2s;
  }
  
  .btn:hover {
    transform: none;
  }
  
  .custom-modal-close:hover {
    transform: none;
  }
}

/* 다크모드 지원 */
@media (prefers-color-scheme: dark) {
  .custom-modal-overlay {
    background: rgba(0, 0, 0, 0.7);
  }
  
  .custom-modal {
    background: #ffffff;
    border-color: rgba(229, 231, 235, 0.5);
    box-shadow: 
      0 20px 60px rgba(0, 0, 0, 0.3),
      0 8px 32px rgba(0, 0, 0, 0.2);
  }
  
  .custom-modal-title {
    color: var(--color-dark, #40513b);
  }
  
  .custom-modal-message {
    color: var(--text-primary, #374151);
  }
  
  .custom-modal-close {
    color: var(--text-secondary, #6b7280);
  }
  
  .custom-modal-close:hover {
    background: var(--color-primary-20, rgba(237, 241, 214, 0.2));
    color: var(--color-dark, #40513b);
  }
  
  .btn.ghost {
    background: #ffffff;
    border-color: var(--color-primary, #edf1d6);
    color: var(--color-dark, #40513b);
  }
  
  .btn.ghost:hover {
    background: var(--color-primary-10, rgba(237, 241, 214, 0.1));
    border-color: var(--color-secondary, #9dc08b);
  }
}
</style>