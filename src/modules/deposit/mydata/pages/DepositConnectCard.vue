<template>
  <div class="saving-card" @click.stop="openModal">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      class="product-logo"
      viewBox="0 0 1024 1024"
    >
      <path
        fill="#40513B"
        d="M296 256c-4.4 0-8 3.6-8 8v48c0 4.4 3.6 8 8 8h384c4.4 0 8-3.6 8-8v-48c0-4.4-3.6-8-8-8zm192 200v-48c0-4.4-3.6-8-8-8H296c-4.4 0-8 3.6-8 8v48c0 4.4 3.6 8 8 8h184c4.4 0 8-3.6 8-8m-48 396H208V148h560v344c0 4.4 3.6 8 8 8h56c4.4 0 8-3.6 8-8V108c0-17.7-14.3-32-32-32H168c-17.7 0-32 14.3-32 32v784c0 17.7 14.3 32 32 32h272c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8m104.1-115.6c1.8-34.5 16.2-66.8 40.8-91.4c26.2-26.2 62-41 99.1-41c37.4 0 72.6 14.6 99.1 41c3.2 3.2 6.3 6.6 9.2 10.1L769.2 673a8 8 0 0 0 3 14.1l93.3 22.5c5 1.2 9.8-2.6 9.9-7.7l.6-95.4a8 8 0 0 0-12.9-6.4l-20.3 15.8C805.4 569.6 748.1 540 684 540c-109.9 0-199.6 86.9-204 195.7c-.2 4.5 3.5 8.3 8 8.3h48.1c4.3 0 7.8-3.3 8-7.6M880 744h-48.1c-4.3 0-7.8 3.3-8 7.6c-1.8 34.5-16.2 66.8-40.8 91.4c-26.2 26.2-62 41-99.1 41c-37.4 0-72.6-14.6-99.1-41c-3.2-3.2-6.3-6.6-9.2-10.1l23.1-17.9a8 8 0 0 0-3-14.1l-93.3-22.5c-5-1.2-9.8 2.6-9.9-7.7l-.6 95.4a8 8 0 0 0 12.9 6.4l20.3-15.8C562.6 918.4 619.9 948 684 948c109.9 0 199.6-86.9 204-195.7c.2-4.5-3.5-8.3-8-8.3"
      />
    </svg>
    <div class="card-content">
      <div class="card-title">
        <template v-if="listLength === 0"> 내 예/적금 불러오기 </template>
        <template v-else>예/적금 다시 불러오기</template>
      </div>
      <div class="card-info label">
        <template v-if="listLength === 0">
          예/적금 정보를 불러와<br />
          지금 바로 시작해보세요!
        </template>
        <template v-else>
          예/적금 정보를 다시 불러와<br />
          최신 상태로 확인해보세요!
        </template>
      </div>
    </div>
  </div>

  <!-- 계좌 연결 모달 -->
  <SavingConnectModal
    v-model:visible="showModal"
    v-model:loading="isConnecting"
    @submit="handleConnect"
  />
</template>

<script setup>
import { ref, defineEmits, defineProps } from 'vue';
import { useAuthStore } from '@/shared/stores/auth';
import SavingConnectModal from '@/shared/components/savings/SavingConnectModal.vue';
import depositsApi from '@/modules/deposit/api/deposit.js';

const props = defineProps({
  userId: {
    type: String,
    required: false,
  },
});

const emit = defineEmits(['connect-success']);

// 기존 인증 스토어 사용
const authStore = useAuthStore();

const showModal = ref(false);
const isConnecting = ref(false);

// 실제 사용할 userId (auth store 구조에 맞게 수정)
const effectiveUserId = props.userId || authStore.userId;

const openModal = () => {
  if (!effectiveUserId) {
    alert('로그인이 필요합니다.');
    return;
  }
  showModal.value = true;
};

const handleConnect = async (loginData) => {
  if (!effectiveUserId) {
    alert('사용자 정보를 찾을 수 없습니다.');
    return;
  }

  isConnecting.value = true;

  try {
    // 🔧 개발 환경에서 특정 테스트 계정은 성공 시뮬레이션
    if (
      import.meta.env.DEV &&
      loginData.id === 'testuser' &&
      loginData.password === '1234'
    ) {
      // 성공 시뮬레이션용 딜레이
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // 연동 성공 플래그 저장 (Mock 계좌 데이터 표시용)
      localStorage.setItem(`dev_account_connected_${effectiveUserId}`, 'true');

      alert('계좌 연결 성공! (개발 테스트)');
      showModal.value = false;
      emit('connect-success');
      return;
    }

    // 🆕 실제 예금 API 호출
    const response = await depositsApi.connectAccount({
      userId: effectiveUserId,
      bankLoginId: loginData.id,
      bankPassword: loginData.password,
    });

    alert('계좌 연결 성공!');
    showModal.value = false;

    // 부모 컴포넌트에 연결 성공 알림
    emit('connect-success');
  } catch (error) {
    // 에러 타입별 메시지 처리
    let errorMessage = '계좌 연결에 실패했습니다.';

    if (error.response?.status === 401) {
      errorMessage = '은행 로그인 정보가 올바르지 않습니다.';
    } else if (error.response?.status === 404) {
      errorMessage = '해당 은행에서 계좌를 찾을 수 없습니다.';
    } else if (error.response?.status === 500) {
      errorMessage = '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
    } else if (error.code === 'NETWORK_ERROR') {
      errorMessage = '네트워크 연결을 확인해주세요.';
    } else if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    }

    alert(errorMessage);
  } finally {
    isConnecting.value = false;
  }
};
</script>

<style scoped>
.saving-card {
  background-color: var(--color-light);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: var(--spacing-lg) var(--spacing-xl);
  border-radius: var(--spacing-lg);
  gap: var(--spacing-md);
  box-shadow: var(--shadow-card);
  cursor: pointer;
  width: 100%;
}

.product-logo {
  width: 24%;
  max-width: 200px;
  max-height: 100px;
}

.card-title {
  font-weight: bold;
  font-size: var(--font-size-2xl);
  color: var(--color-dark);
  margin-bottom: var(--spacing-md);
}

.card-info {
  display: flex;
  justify-content: space-between;
  align-items: end;
  font-size: var(--font-size-base);
  color: var(--color-title);
}
.deposit-connect-card {
  background: var(--color-light);
  border: 2px dashed var(--color-accent);
  border-radius: 20px;
  padding: 40px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  min-height: 200px;
}

.deposit-connect-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  border-color: var(--color-title);
}

.connect-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon {
  width: 60px;
  height: 60px;
  opacity: 0.8;
  transition: transform 0.3s ease;
}

/* 반응형 디자인 */
@media (max-width: 393px) {
  .deposit-connect-card {
    padding: 30px 15px;
    min-height: 180px;
  }

  .icon {
    width: 50px;
    height: 50px;
  }

  .connect-title {
    font-size: 20px;
  }

  .connect-subtitle {
    font-size: 14px;
  }
}
</style>
