<template>
  <teleport to="body">
    <div
      v-if="visible"
      class="modal-backdrop"
      @click.self="handleBackdropClick()"
    >
      <div class="modal-content">
        <form @submit.prevent="submit">
          <h2 class="modal-title">내 예/적금 연결하기</h2>
          <p class="modal-subtitle">은행 로그인 정보를 입력해 주세요</p>
          <div class="input-group">
            <label for="userId">은행<span class="required">*</span></label>
            <BankSelect />
          </div>
          <div class="input-group">
            <label for="userId">아이디<span class="required">*</span></label>
            <input
              id="userId"
              v-model="userId"
              type="text"
              class="modal-input"
              autocomplete="username"
              placeholder="아이디를 입력해주세요."
            />
            <p class="input-error" :class="{ hidden: !errors.userId }">
              {{ errors.userId || '아이디가 입력되었습니다.' }}
            </p>
          </div>

          <div class="input-group">
            <label for="password">
              비밀번호
              <span class="required">*</span>
            </label>
            <input
              id="password"
              v-model="password"
              type="password"
              class="modal-input"
              autocomplete="current-password"
              placeholder="비밀번호를 입력해주세요."
            />
            <p class="input-error" :class="{ hidden: !errors.password }">
              {{ errors.password || '비밀번호가 입력되었습니다.' }}
            </p>
          </div>
          <div class="input-group" v-if="requireBirthdate">
            <label for="birth">
              생년월일(YYYY-MM-DD)
              <span class="required">*</span>
            </label>
            <input
              id="birth"
              v-model="birth"
              type="date"
              class="modal-input"
              autocomplete="current-birth"
              placeholder="생년월일을 입력해주세요."
            />
            <p class="input-error" :class="{ hidden: !errors.birth }">
              {{ errors.birth || '생년월일이 입력되었습니다.' }}
            </p>
          </div>
          <div class="button-group">
            <button type="button" class="btn cancel" @click="close">
              닫기
            </button>
            <button type="submit" class="btn confirm" :disabled="!isFormValid">
              연결하기
            </button>
          </div>
        </form>
      </div>
    </div>
  </teleport>
</template>

<script setup>
import { ref, computed, watchEffect, defineProps, defineEmits } from 'vue';
import BankSelect from './BankSelect.vue';
const props = defineProps({
  visible: Boolean,
  loading: Boolean,
  requireBirthdate: Boolean,
});

const emit = defineEmits(['update:visible', 'update:loading', 'submit']);

const userId = ref('');
const password = ref('');
const birth = ref('');
const errors = ref({ userId: '', password: '', birth: '' });

const isFormValid = computed(() => {
  if (props.requireBirthdate) {
    return (
      userId.value.trim() !== '' &&
      password.value.trim() !== '' &&
      birth.value.trim() !== ''
    );
  }
  return userId.value.trim() !== '' && password.value.trim() !== '';
});

function close() {
  emit('update:visible', false);
}

function validate() {
  errors.value.userId =
    userId.value.trim() === '' ? '아이디는 필수입니다.' : '';
  errors.value.password =
    password.value.trim() === '' ? '비밀번호는 필수입니다.' : '';
  if (props.requireBirthdate) {
    errors.value.birth =
      !birth.value || formatToYyyymmdd(birth.value).trim() === ''
        ? '생년월일은 필수입니다.'
        : '';
  }
  return !errors.value.userId && !errors.value.password && !errors.value.birth;
}

const formatToYyyymmdd = (dateStr) => {
  return dateStr.replaceAll('-', '');
};

function submit() {
  if (!validate()) return;

  emit('submit', {
    birthDate: formatToYyyymmdd(birth.value),
    id: userId.value,
    password: password.value,
  });
}
watchEffect(() => {
  validate();
});
</script>

<style scoped>
.modal-backdrop {
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

.modal-content {
  background: var(--color-white);
  border-radius: var(--spacing-md);
  box-shadow: var(--shadow-modal);
  padding: var(--spacing-xl) var(--spacing-lg);
  width: 50%;
  max-width: 600px;
  text-align: center;
}

.modal-title {
  font-size: var(--font-size-2xl);
  font-weight: bold;
  color: var(--color-dark);
  margin-bottom: var(--spacing-sm);
}

.modal-subtitle {
  font-size: var(--font-size-base);
  color: var(--color-title);
  margin-bottom: var(--spacing-lg);
}

.input-group {
  text-align: left;
  margin-bottom: var(--spacing-xs);
}

.input-group label {
  font-size: var(--font-size-base);
  margin-bottom: var(--spacing-sm);
  display: block;
  color: var(--color-title);
}

.required {
  color: var(--color-error);
  margin-left: var(--spacing-sm);
}

.modal-input {
  border-radius: var(--spacing-sm) !important;
  width: 100%;
  padding: var(--spacing-sm);
  border: 1px solid var(--color-title);
  font-size: var(--font-size-base);
  box-sizing: border-box;
}

.input-error {
  color: var(--color-error);
  font-size: var(--font-size-sm);
  margin: var(--spacing-xs) 0;
}
.input-error.hidden {
  opacity: 0;
  visibility: hidden;
}
.button-group {
  display: flex;
  justify-content: space-between;
  margin-top: var(--spacing-md);
}

.btn {
  flex: 1;
  padding: var(--spacing-sm) 0;
  font-size: var(--font-size-base);
  border-radius: var(--spacing-xs);
  font-weight: bold;
  cursor: pointer;
  border: none;
  transition: background-color 0.2s ease;
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
  cursor: not-allowed;
}
@media (max-width: 640px) {
  .modal-content {
    background: var(--color-white);
    border-radius: var(--spacing-md);
    box-shadow: var(--shadow-modal);
    padding: var(--spacing-xl) var(--spacing-lg);
    width: 80%;
    max-width: 400px;
    text-align: center;
  }
}
</style>
