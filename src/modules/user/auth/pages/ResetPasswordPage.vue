<template>
  <div class="signup-container">
    <BackButton />
    <div class="login-logo">
      <img src="@/assets/Logo.png" alt="맞추머니 로고" />
    </div>

    <BaseCardGrey class="signup-card">
      <template #content>
        <h1 class="login-title">비밀번호 재설정</h1>

        <!-- 이메일 -->
        <div class="login-row">
          <div class="login-label">이메일</div>
        </div>
        <div class="login-row">
          <div class="input-action-row">
            <template v-if="!isEmailVerified">
              <BaseInput v-model="email" placeholder="이메일 입력" />
              <BaseButton class="action-btn" variant="primary" @click="handleSendCode" :disabled="!canSendCode">
                {{ isSendingCode ? '이메일 전송 중…' : '인증번호 전송' }}
              </BaseButton>
            </template>
            <template v-else>
              <div class="locked-input" aria-readonly="true">{{ email }}</div>
            </template>
          </div>
        </div>

        <!-- 인증번호 -->
        <div class="login-row">
          <div class="login-label">인증번호 입력</div>
        </div>
        <div class="login-row">
          <div class="input-action-row">
            <template v-if="!isEmailVerified">
              <BaseInput v-model="authCode" placeholder="인증번호 입력" />
              <BaseButton class="action-btn" variant="primary" @click="handleVerifyCode" :disabled="!canVerifyCode">
                {{ isVerifyingCode ? '인증 확인 중…' : '인증번호 확인' }}
              </BaseButton>
            </template>
            <template v-else>
              <div class="locked-input" aria-readonly="true">{{ authCode }}</div>
            </template>
          </div>
        </div>

        <!-- 비밀번호 -->
        <div class="login-row">
          <div class="login-label">비밀번호</div>
        </div>
        <div class="login-row">
          <div class="input-action-row">
            <BaseInput v-model="newPassword" type="password" placeholder="비밀번호 입력 (특수문자 포함 8~20자)" />
          </div>
        </div>

        <!-- 비밀번호 확인 -->
        <div class="login-block">
          <div class="login-row">
            <div class="login-label">비밀번호 확인</div>
          </div>
          <div class="login-row">
            <div class="input-action-row">
              <BaseInput v-model="confirmPassword" type="password" placeholder="비밀번호 확인" />
            </div>
          </div>
        </div>

        <!-- 에러 메시지 -->
        <div class="login-row error-row">
          <span class="error-msg" :class="{ visible: !!errorMessage }">{{ errorMessage }}</span>
        </div>

        <!-- 비밀번호 재설정 버튼 -->
        <div class="login-row">
          <div class="join-btn-area">
            <BaseButton variant="primary" @click="handleResetPassword" :disabled="!canReset">
              비밀번호 재설정
            </BaseButton>
          </div>
        </div>
      </template>
    </BaseCardGrey>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import BaseCardGrey from '@/components/base/BaseCardGrey.vue';
import BaseButton from '@/components/base/BaseButton.vue';
import BaseInput from '@/components/base/BaseInput.vue';
import BackButton from '@/components/common/BackButton.vue';
import authApi from '@/api/auth';
import { useRouter } from 'vue-router';
import { useCustomModal } from '@/composables/useCustomModal';

const email = ref('');
const authCode = ref('');
const newPassword = ref('');
const confirmPassword = ref('');
const errorMessage = ref('');
const isEmailVerified = ref(false);
const isSendingCode = ref(false);
const isVerifyingCode = ref(false);

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const isEmailValid = computed(() => emailRegex.test(String(email.value || '').trim()));
const canSendCode = computed(() => !isEmailVerified.value && !isSendingCode.value && isEmailValid.value);
const canVerifyCode = computed(() => !isEmailVerified.value && !isVerifyingCode.value && !!authCode.value?.trim());
const canReset = computed(() => {
  const np = String(newPassword.value || '').trim();
  const cp = String(confirmPassword.value || '').trim();
  return isEmailVerified.value && np.length > 0 && cp.length > 0 && np === cp;
});

const router = useRouter();
const { showAlert, showSuccess, showError } = useCustomModal();

watch([newPassword, confirmPassword], ([newVal, confirmVal]) => {
  if (newVal && confirmVal && newVal !== confirmVal) {
    errorMessage.value = '비밀번호가 일치하지 않습니다';
  } else {
    errorMessage.value = '';
  }
});

const handleSendCode = async () => {
  if (!canSendCode.value) return;
  const trimmed = String(email.value || '').trim();
  if (!emailRegex.test(trimmed)) {
    await showAlert('유효한 이메일 주소를 입력해주세요.', '입력 오류');
    return;
  }
  isSendingCode.value = true; // 버튼에 "이메일 전송 중…" 표시
  try {
    await authApi.sendResetVerificationEmail(trimmed);
    await showSuccess('인증번호가 전송되었습니다. 이메일을 확인해주세요.', '전송 완료');
  } catch (err) {
    await showError(err?.response?.data?.message || '인증번호 전송 중 오류가 발생했습니다.', '전송 실패');
  } finally {
    isSendingCode.value = false;
  }
};

const handleVerifyCode = async () => {
  if (!canVerifyCode.value) return;
  isVerifyingCode.value = true; // 버튼에 "인증 확인 중…" 표시
  try {
    const trimmedEmail = String(email.value || '').trim();
    const trimmedCode = String(authCode.value || '').trim();
    const result = await authApi.verifyEmailCode(trimmedEmail, trimmedCode);
    if (result.result) {
      isEmailVerified.value = true; // 이후 이메일/코드 입력 & 전송/확인 버튼 비활성화
      await showSuccess('인증번호가 확인되었습니다.', '인증 성공');
    } else {
      await showError('인증번호가 일치하지 않습니다.', '인증 실패');
    }
  } catch (err) {
    await showError(err?.response?.data?.message || '인증번호 확인 중 오류가 발생했습니다.', '확인 실패');
  } finally {
    isVerifyingCode.value = false;
  }
};

const handleResetPassword = async () => {
  if (!isEmailVerified.value) {
    await showAlert('이메일 인증을 완료해주세요.', '안내');
    return;
  }

  if (newPassword.value !== confirmPassword.value) {
    await showAlert('비밀번호가 일치하지 않습니다.', '입력 오류');
    return;
  }

  try {
    await authApi.resetPassword({
      email: email.value,
      newPassword: newPassword.value,
      confirmPassword: confirmPassword.value,
    });

    await showSuccess('비밀번호가 성공적으로 재설정되었습니다.', '재설정 완료');
    router.push('/login');
  } catch (err) {
    await showError(err?.response?.data?.message || '비밀번호 재설정 중 오류가 발생했습니다.', '재설정 실패');
  }
};
</script>

<style scoped>
.signup-container {
  min-height: 100vh;
  background: var(--bg-body);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
}

.signup-card {
  width: 435px;
  height: 630px;
  padding: 1rem;
}

.login-logo {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 2rem;
}

.login-logo img {
  height: 150px;
}

.login-title {
  text-align: center;
  font-size: 1.6rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: var(--color-dark);
}

/* Form Rows and Inputs */
.login-row {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  width: 100%;
  gap: var(--spacing-sm);
}

.login-label {
  font-size: 0.9rem;
  color: var(--color-dark);
  margin-bottom: 0.3rem;
}

.input-action-row {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-bottom: 2.5rem;
  width: 100%;
}

.login-block .login-row .input-action-row {
  margin-bottom: 0;
}

/* Locked input style */
.locked-input {
  width: 100%;
  height: 40px;
  display: flex;
  align-items: center;
  padding: 0 0.75rem;
  border: 2px solid var(--border-medium);
  border-radius: 8px;
  background: var(--color-gray-100);
  color: var(--text-secondary);
  cursor: not-allowed;
  user-select: none;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Error Message */
.error-row {
  height: 1.2rem;
}

.error-msg {
  font-size: 0.9rem;
  color: var(--color-error-dark);
  visibility: hidden;
  display: block;
}

.error-msg.visible {
  visibility: visible;
}

/* Action Buttons */
.action-btn {
  height: 40px;
  white-space: nowrap;
  flex-shrink: 0;
  width: 120px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.action-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.join-btn-area {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  margin-top: var(--spacing-xl);
}

@media (max-width: 768px) {
  .signup-card {
    width: 90%;
    height: auto;
    padding: 2rem;
  }
  .login-logo img {
    height: 100px;
  }
  .login-title {
    font-size: 2rem;
  }
  .login-label {
    font-size: 1.2rem;
  }
  .input-action-row {
    flex-direction: column;
    width: 100%;
    margin-bottom: 1.5rem;
  }
  .action-btn {
    width: 50%;
    margin-top: 0.2rem;
    height: 30px;
    font-size: 1.2rem;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    white-space: nowrap;
  }
  .join-btn-area .base-button {
    width: 50%;
    height: 30px;
    margin-top: -2rem;
    font-size: 1.2rem;
  }
  .signup-container {
    justify-content: center;
    padding-bottom: 100px;
  }
  .error-row {
    margin-top: 1rem;
    margin-bottom: 1rem;
  }
  .error-msg {
    font-size: 1.2rem;
  }

  /* Scoped deep styles for BaseInput on mobile */
  ::v-deep(.input-field) {
    font-size: 1.2rem;
    height: 48px;
    padding: 0.75rem;
  }

  .locked-input {
    height: 48px;
    font-size: 1.2rem;
    padding: 0.75rem;
  }
}
</style>
