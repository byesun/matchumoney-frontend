<template>
  <div class="modal-overlay" v-if="isVisible" @click="closeModal">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h3>KB카드 연동</h3>
        <button class="btn-close" @click="closeModal">&times;</button>
      </div>

      <div class="modal-body">
        <p class="description">
          KB카드 마이데이터를 연동하여 카드 정보를 가져옵니다.
        </p>

        <form @submit.prevent="handleSync">
          <div class="form-group">
            <label for="cardId">KB카드 ID</label>
            <input
              type="text"
              id="cardId"
              v-model="formData.cardId"
              placeholder="카드 ID를 입력하세요"
              required
              class="form-input"
            />
          </div>

          <div class="form-group">
            <label for="cardPw">KB카드 비밀번호</label>
            <input
              type="password"
              id="cardPw"
              v-model="formData.cardPw"
              placeholder="카드 비밀번호를 입력하세요"
              required
              class="form-input"
            />
          </div>

          <!-- 개인정보 활용 동의 섹션 -->
          <div class="consent-section">
            <div class="consent-header" @click="toggleConsentDetails">
              <h4>개인정보 수집 및 이용 동의</h4>
              <button
                type="button"
                class="toggle-btn"
                :class="{ expanded: isConsentExpanded }"
              >
                <i class="bi bi-chevron-down"></i>
              </button>
            </div>

            <transition name="slide-down">
              <div class="consent-content" v-if="isConsentExpanded">
                <div class="consent-item">
                  <h5>수집하는 개인정보 항목</h5>
                  <ul>
                    <li>카드 거래내역 정보</li>
                    <li>카드 기본 정보 (카드명, 카드번호 마스킹, 발급사)</li>
                    <li>결제 및 이용 패턴 데이터</li>
                  </ul>
                </div>

                <div class="consent-item">
                  <h5>개인정보 수집 및 이용 목적</h5>
                  <ul>
                    <li>맞춤형 카드 추천 서비스 제공</li>
                    <li>소비 패턴 분석 및 통계 제공</li>
                    <li>카드 혜택 비교 및 분석</li>
                  </ul>
                </div>

                <div class="consent-item">
                  <h5>개인정보 보유 및 이용 기간</h5>
                  <p>
                    서비스 이용 기간 동안 보관하며, 회원 탈퇴 시 즉시
                    파기됩니다.
                  </p>
                </div>

                <div class="consent-item important">
                  <h5>중요 안내사항</h5>
                  <ul>
                    <li>
                      <strong>카드 ID 및 비밀번호는 저장되지 않습니다</strong>
                    </li>
                    <li>
                      일회성 인증을 통해 데이터를 가져온 후 즉시 삭제됩니다
                    </li>
                    <li>거래내역 및 카드 정보만 분석 목적으로 저장됩니다</li>
                    <li>제3자에게 개인정보를 제공하지 않습니다</li>
                  </ul>
                </div>
              </div>
            </transition>
          </div>

          <!-- 동의 체크박스 - 항상 표시 -->
          <div class="consent-checkbox">
            <label class="checkbox-label">
              <input
                type="checkbox"
                v-model="isConsentAgreed"
                class="checkbox-input"
              />
              <span class="checkbox-text">
                위 개인정보 수집 및 이용에 동의합니다. (필수)
              </span>
            </label>
          </div>

          <div class="form-actions">
            <BaseButton variant="secondary" @click="closeModal" type="button">
              취소
            </BaseButton>
            <BaseButton
              variant="primary"
              type="submit"
              :disabled="isLoading || !isConsentAgreed"
            >
              {{ isLoading ? '연결 중...' : '연결하기' }}
            </BaseButton>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import BaseButton from '@/shared/components/base/BaseButton.vue';

const props = defineProps({
  isVisible: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['close', 'sync']);

const isLoading = ref(false);
const isConsentAgreed = ref(false);
const isConsentExpanded = ref(false);
const formData = reactive({
  cardId: '',
  cardPw: '',
});

const closeModal = () => {
  formData.cardId = '';
  formData.cardPw = '';
  isConsentAgreed.value = false;
  isConsentExpanded.value = false;
  emit('close');
};

const toggleConsentDetails = () => {
  isConsentExpanded.value = !isConsentExpanded.value;
};

const handleSync = async () => {
  isLoading.value = true;
  try {
    await emit('sync', { ...formData });
    closeModal();
  } catch (error) {
    console.error('카드 연동 실패:', error);
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--color-overlay-dark);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.modal-content {
  background: var(--color-white);
  border-radius: var(--spacing-md);
  box-shadow: var(--shadow-modal);
  padding: var(--spacing-xl) var(--spacing-lg);
  width: 50%;
  max-width: 600px;
  text-align: center;
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
}

.modal-header h3 {
  font-size: var(--font-size-xl);
  font-weight: bold;
  color: var(--color-dark);
  margin: 0;
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.modal-header h3::before {
  content: '💳';
  font-size: var(--font-size-lg);
  margin-right: var(--spacing-xs);
}

.btn-close {
  background: var(--color-gray-100);
  border: none;
  font-size: var(--font-size-xl);
  color: var(--color-title);
  cursor: pointer;
  padding: var(--spacing-xs);
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background 0.2s, color 0.2s, transform 0.2s;
}

.btn-close:hover {
  background: var(--color-error-light);
  color: var(--color-error);
  transform: scale(1.1);
}

.modal-body {
  padding: 0;
}

.description {
  color: var(--color-title);
  margin-bottom: var(--spacing-lg);
  line-height: 1.6;
  font-size: var(--font-size-base);
  background: var(--color-primary-30);
  padding: var(--spacing-md);
  border-radius: var(--spacing-sm);
  border-left: 4px solid var(--color-primary);
  text-align: left;
}

.form-group {
  text-align: left;
  margin-bottom: var(--spacing-xs);
}

.form-group label {
  font-size: var(--font-size-base);
  margin-bottom: var(--spacing-sm);
  display: block;
  color: var(--color-title);
  font-weight: 500;
}

.form-input {
  border-radius: var(--spacing-sm) !important;
  width: 100%;
  padding: var(--spacing-sm);
  border: 1px solid var(--color-title);
  font-size: var(--font-size-base);
  box-sizing: border-box;
  background: var(--color-white);
  font-family: inherit;
  transition: border 0.2s, box-shadow 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-10, #e3f0fc);
}

.form-input::placeholder {
  color: var(--color-gray-400);
}

.form-actions {
  display: flex;
  justify-content: space-between;
  margin-top: var(--spacing-md);
  gap: var(--spacing-sm);
}

.btn {
  flex: 1;
  padding: var(--spacing-sm) 0;
  font-size: var(--font-size-base);
  border-radius: var(--spacing-xs);
  font-weight: bold;
  cursor: pointer;
  border: none;
  transition: background-color 0.2s, color 0.2s;
  margin: 0 var(--spacing-xs, 4px);
}
.btn.cancel {
  background-color: var(--color-primary);
  color: var(--color-dark);
  margin-right: var(--spacing-sm);
}
.btn.confirm {
  background-color: var(--color-dark);
  color: var(--color-white);
}
.btn.confirm:disabled {
  background-color: var(--color-gray-400);
  color: var(--color-white);
  cursor: not-allowed;
}

/* 개인정보 동의 섹션 스타일 */
.consent-section {
  margin: var(--spacing-lg) 0;
  border: 1px solid var(--border-light);
  border-radius: var(--spacing-sm);
  background: var(--color-light);
}

.consent-header {
  background: var(--color-primary);
  padding: var(--spacing-md);
  border-radius: var(--spacing-sm);
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: background-color 0.2s ease;
}

.consent-header:hover {
  background: var(--color-primary-light, #e8f4fd);
}

.consent-header h4 {
  margin: 0;
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--color-dark);
  flex: 1;
}

.toggle-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: var(--spacing-xs);
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  color: var(--color-dark);
}

.toggle-btn:hover {
  background: rgba(0, 0, 0, 0.1);
}

.toggle-btn i {
  font-size: var(--font-size-base);
  transition: transform 0.3s ease;
}

.toggle-btn.expanded i {
  transform: rotate(180deg);
}

.consent-content {
  padding: var(--spacing-lg);
  max-height: 300px;
  overflow-y: auto;
  text-align: left;
  border-top: 1px solid var(--border-light);
  border-radius: 0 0 var(--spacing-sm) var(--spacing-sm);
  background: var(--color-white);
}

/* 슬라이드 애니메이션 */
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
  max-height: 300px;
  overflow: hidden;
}

.slide-down-enter-from,
.slide-down-leave-to {
  max-height: 0;
  opacity: 0;
  transform: translateY(-10px);
}

.slide-down-enter-to,
.slide-down-leave-from {
  max-height: 300px;
  opacity: 1;
  transform: translateY(0);
}

.consent-item {
  margin-bottom: var(--spacing-md);
}

.consent-item:last-child {
  margin-bottom: 0;
}

.consent-item h5 {
  margin: 0 0 var(--spacing-sm) 0;
  font-size: var(--font-size-base);
  font-weight: 600;
  color: var(--color-dark);
}

.consent-item ul {
  margin: 0;
  padding-left: var(--spacing-lg);
  list-style-type: disc;
}

.consent-item ul li {
  margin-bottom: var(--spacing-xs);
  line-height: 1.5;
  color: var(--text-primary);
  font-size: var(--font-size-sm);
}

.consent-item p {
  margin: 0;
  line-height: 1.5;
  color: var(--text-primary);
  font-size: var(--font-size-sm);
}

.consent-item.important {
  background: var(--color-warning-light);
  padding: var(--spacing-md);
  border-radius: var(--spacing-sm);
  border-left: 4px solid var(--color-warning);
}

.consent-item.important h5 {
  color: var(--color-warning-dark);
}

.consent-item.important ul li {
  color: var(--color-warning-dark);
}

.consent-checkbox {
  padding: var(--spacing-md);
  border: 1px solid var(--border-light);
  border-radius: var(--spacing-sm);
  background: var(--color-white);
  margin-top: var(--spacing-sm);
}

.checkbox-label {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-sm);
  cursor: pointer;
  line-height: 1.5;
}

.checkbox-input {
  width: 18px;
  height: 18px;
  cursor: pointer;
  flex-shrink: 0;
  margin-top: 2px;
}

.checkbox-text {
  font-size: var(--font-size-sm);
  font-weight: 500;
  color: var(--color-dark);
}

@media (max-width: 640px) {
  .modal-content {
    width: 90%;
    max-width: 450px;
    padding: var(--spacing-lg) var(--spacing-md);
    max-height: 90vh;
    overflow-y: auto;
  }
  .modal-header {
    margin-bottom: var(--spacing-md);
  }
  .form-actions {
    flex-direction: column;
    gap: var(--spacing-md);
  }

  .consent-content {
    max-height: 200px;
    padding: var(--spacing-md);
  }

  .consent-item h5 {
    font-size: var(--font-size-sm);
  }

  .consent-item ul li,
  .consent-item p {
    font-size: var(--font-size-xs);
  }

  .checkbox-text {
    font-size: var(--font-size-base);
  }
}
</style>
