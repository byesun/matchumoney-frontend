<template>
  <div class="kakao-callback">
    <p>카카오 로그인 처리 중...</p>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import authApi from '@/api/auth';
import { useAuthStore } from '@/stores/auth';
import { useCustomModal } from '@/composables/useCustomModal';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const { showAlert, showSuccess, showError } = useCustomModal();

onMounted(async () => {
  const code = route.query.code;
  if (!code) {
    await showError('카카오 인가 코드가 없습니다.', '로그인 오류');
    router.push('/login');
    return;
  }

  try {
    const response = await authApi.kakaoLogin(code);
    console.log('✅ 로그인 응답:', response);
    const tokenDto = response.result;

    authStore.setAuth(tokenDto);

    window.dispatchEvent(new Event('app:login'));
    await showSuccess(`${tokenDto.nickname}님 환영합니다!`, '로그인 성공');
    if (tokenDto.personaId === null || tokenDto.personaId === undefined) {
      router.push('/persona/start');
    } else {
      router.push('/');
    }
  } catch (err) {
    // console.error("카카오 로그인 실패:", err);
    await showError('카카오 로그인에 실패했습니다.', '로그인 실패');
    router.push('/login');
  }
});
</script>

<style scoped>
.kakao-callback {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  color: var(--text-secondary);
  font-size: 1rem;
}
</style>
