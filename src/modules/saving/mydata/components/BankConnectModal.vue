<template>
  <teleport to="body">
    <div
      v-if="modelValue"
      @click.self="onRequestClose"
      class="modal-backdrop"
      :class="{ visible: modelValue }"
    >
      <div class="modal-panel" :class="{ visible: modelValue }">
        <div class="modal-header">
          <h2 class="modal-title">내 예적금 연결하기</h2>
          <button @click="onRequestClose" class="close-btn">
            <svg
              class="close-icon"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              ></path>
            </svg>
          </button>
        </div>

        <div class="modal-content">
          <!-- 연결/추가 선택 단계 -->
          <div v-if="!selectedBank">
            <div v-if="!isAdding">
              <div class="content-title">
                <h4>연결된 은행</h4>
                <p>
                  로그인 정보가 변경된 경우 은행을 선택하여 수정할 수 있습니다.
                </p>
              </div>
              <div v-if="localConnected.length > 0" class="account-list">
                <div
                  v-for="code in localConnected"
                  :key="code"
                  @click="selectAccountToEdit(code)"
                  class="account-item"
                >
                  <img
                    :src="BankType[code]?.imageLink"
                    :alt="BankType[code]?.name || code"
                    class="bank-logo"
                  />
                  <div class="account-info">
                    <span class="bank-name-large">{{
                      BankType[code]?.name || code
                    }}</span>
                    <span class="account-userId">연결된 계정</span>
                  </div>
                  <svg
                    class="chevron-icon"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M9 5l7 7-7 7"
                    ></path>
                  </svg>
                </div>
              </div>

              <div v-else class="empty-state">
                <p>아직 연결된 계정이 없습니다.</p>
                <p>원하시는 은행을 연결해주세요!</p>
              </div>

              <button @click="isAdding = true" class="add-bank-btn">
                + 새로운 은행 연결하기
              </button>
            </div>

            <div v-if="isAdding">
              <div class="selection-header">
                <button
                  @click="
                    isAdding = false;
                    resetLoginForm();
                  "
                  class="back-btn"
                >
                  <svg
                    class="back-icon"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M15 19l-7-7 7-7"
                    ></path>
                  </svg>
                </button>
                <h4 class="content-title no-margin">
                  연결할 은행을 선택하세요
                </h4>
              </div>
              <p class="content-subtitle">
                CODEF 서비스와 안전하게 연결됩니다.
              </p>

              <!-- ✅ 연결된 은행(localConnected)의 코드를 제외한 목록 -->
              <div v-if="availableBanks.length > 0" class="bank-grid">
                <div
                  v-for="bank in availableBanks"
                  :key="bank.code"
                  @click="selectBank(bank)"
                  class="bank-item"
                >
                  <img :src="bank.logo" :alt="bank.name" class="bank-logo" />
                  <span class="bank-name">{{ bank.name }}</span>
                </div>
              </div>
              <div v-else class="empty-state">
                <p>모든 은행이 이미 연결되었습니다.</p>
              </div>
            </div>
          </div>

          <!-- 로그인 단계 -->
          <div v-if="selectedBank">
            <div class="login-header">
              <button
                @click="
                  goBackToList();
                  resetLoginForm();
                "
                class="back-btn"
              >
                <svg
                  class="back-icon"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15 19l-7-7 7-7"
                  ></path>
                </svg>
              </button>
              <img
                :src="selectedBank.logo"
                :alt="selectedBank.name"
                class="selected-bank-logo"
              />
              <h3 class="selected-bank-name">{{ selectedBank.name }}</h3>
            </div>

            <form @submit.prevent="handleSubmit">
              <div class="form-group">
                <label for="userId" class="form-label"
                  >아이디 <span class="required">*</span></label
                >
                <input
                  type="text"
                  id="userId"
                  v-model="userId"
                  class="form-input"
                  placeholder="아이디를 입력하세요"
                />
              </div>

              <div class="form-group">
                <label for="password" class="form-label"
                  >비밀번호 <span class="required">*</span></label
                >
                <input
                  type="password"
                  id="password"
                  v-model="password"
                  class="form-input"
                  placeholder="비밀번호를 입력하세요"
                />
              </div>

              <!-- ✅ 생년월일: requireBirthdate가 true일 때만 노출 -->
              <div class="form-group" v-if="requireBirthdate">
                <label for="birth" class="form-label">
                  생년월일(YYYY-MM-DD) <span class="required">*</span>
                </label>
                <div class="input-group">
                  <input
                    type="text"
                    id="birth"
                    v-model="birthdate"
                    class="form-input"
                    placeholder="예: 1990-01-01"
                  />
                </div>
              </div>

              <div class="terms-group">
                <label class="terms-label">
                  <input
                    type="checkbox"
                    v-model="agreedToTerms"
                    class="terms-checkbox"
                  />
                  <span class="terms-text">
                    <span class="required">(필수) </span>
                    <span @click.prevent="showTerms = true" class="terms-link"
                      >개인정보 수집 및 이용</span
                    >
                    에 동의합니다.
                  </span>
                </label>
              </div>

              <button
                type="submit"
                :disabled="!isConnectable"
                class="submit-btn"
              >
                {{
                  isLoading
                    ? '처리 중...'
                    : editingAccount
                    ? '수정하기'
                    : '연결하기'
                }}
              </button>
            </form>
          </div>
        </div>

        <div class="modal-footer">
          <button
            @click="handleLoadPrevious"
            class="footer-btn"
            :disabled="!localConnected || localConnected.length === 0"
          >
            이전 저장 정보 불러오기
          </button>
          <button
            @click="showRemoveConfirm = true"
            class="footer-btn btn-danger"
            :disabled="!localConnected || localConnected.length === 0"
          >
            모든 로그인 정보 제거
          </button>
        </div>
      </div>
    </div>

    <!-- 전체 삭제 확인 -->
    <div v-if="showRemoveConfirm" class="confirm-modal-backdrop">
      <div class="confirm-modal-panel">
        <h3 class="confirm-title">정말 삭제하시겠습니까?</h3>
        <p class="confirm-text">
          연결된 <strong class="required">모든 은행의 로그인 정보</strong>가
          영구적으로 제거됩니다. 이 작업은 되돌릴 수 없습니다.
        </p>
        <div class="confirm-actions">
          <button
            @click="showRemoveConfirm = false"
            class="confirm-btn btn-cancel"
          >
            취소
          </button>
          <button
            @click="handleRemoveAll"
            class="confirm-btn btn-confirm-danger"
          >
            삭제 확인
          </button>
        </div>
      </div>
    </div>

    <!-- 약관 -->
    <div v-if="showTerms" class="confirm-modal-backdrop">
      <div class="terms-modal-panel">
        <div class="modal-header">
          <h3 class="modal-title">개인정보 수집 및 이용 약관</h3>
          <button @click="showTerms = false" class="close-btn">
            <svg
              class="close-icon"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              ></path>
            </svg>
          </button>
        </div>
        <div class="terms-content">
          <!-- (약관 내용 그대로) -->
          <h4>제1조 (개인정보의 수집 및 이용 목적)</h4>
          <p>
            회사는 다음의 목적을 위하여 개인정보를 처리합니다. 처리하고 있는
            개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며, 이용 목적이
            변경되는 경우에는 개인정보 보호법 제18조 및 신용정보법 제15조에 따라
            별도의 동의를 받는 등 필요한 조치를 이행할 예정입니다.
          </p>
          <ul>
            <li>- 예·적금 상품 정보 조회 및 관리 서비스 제공</li>
            <li>- 맞춤형 금융상품 추천 및 비교 서비스 제공</li>
            <li>- 금융 습관 분석 및 통계 제공</li>
            <li>- 법령 및 감독규정 준수를 위한 기록·관리</li>
          </ul>

          <h4>제2조 (수집하는 개인정보의 항목)</h4>
          <p>
            회사는 계정 연결 및 서비스 제공을 위해 아래와 같은 개인정보를
            수집하고 있습니다.
          </p>
          <ul>
            <li>
              <strong>예금</strong> : 상품명, 계좌번호(마스킹 처리), 시작일,
              현재 잔액
            </li>
            <li>
              <strong>적금</strong> : 상품명, 이율(금리), 가입 기간(시작일,
              만기일), 소유주 정보(이름)
            </li>
            <li>
              <strong>공통</strong> : 은행명, connectedId(재조회용 식별자,
              비밀번호/ID 저장 안 함)
            </li>
          </ul>

          <h4>제3조 (개인정보의 처리 및 보유 기간)</h4>
          <p>
            회사는 법령에 따른 개인정보 보유·이용기간 또는 정보주체로부터
            개인정보 수집 시 동의받은 개인정보 보유·이용기간 내에서 개인정보를
            처리·보유합니다.
          </p>
          <p>
            귀하의 개인정보는 원칙적으로 개인정보의 수집 및 이용목적이 달성되면
            지체 없이 파기합니다. 다만, 관계 법령에 따라 일정 기간 보관이 필요한
            경우 해당 기간 동안 안전하게 보관하며, 보관 기간이 종료되면 즉시
            파기합니다.
          </p>
          <ul>
            <li>- 전자금융거래법: 전자금융거래기록(5년)</li>
            <li>
              - 상법: 상업장부 및 영업에 관한 중요서류(10년), 거래에 관한 장부
              및 증빙서류(5년)
            </li>
          </ul>
        </div>
        <div class="terms-footer">
          <button
            @click="showTerms = false"
            class="confirm-btn btn-confirm-primary"
          >
            확인
          </button>
        </div>
      </div>
    </div></teleport
  >
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { BankType } from '@/constants/BankList';

/** Props & Emits */
const props = defineProps({
  /** v-model (모달 열림/닫힘) */
  modelValue: { type: Boolean, required: true },
  /** 생년월일 입력 필요 여부 */
  requireBirthdate: { type: Boolean, default: false },
  /** 부모 소유 연결 코드 배열 */
  connectedCodes: { type: Array, default: () => [] },
});
const emit = defineEmits([
  'update:modelValue',
  'update:connectedCodes',
  'connected', // (code) 신규 연결됨
  'edited', // (code) 수정됨
  'removedAll', // 모두 삭제
  'loadPrevious', // 이전 정보 불러옴
]);

/** ===== State (내부) ===== */
const isAdding = ref(false);
const selectedBank = ref(null); // { code, name, logo } | null
const userId = ref('');
const password = ref('');
const birthdate = ref('');
const agreedToTerms = ref(false);
const isLoading = ref(false);
const showRemoveConfirm = ref(false);
const showTerms = ref(false);
/** 편집 중인 은행 코드 (null이면 신규 연결 흐름) */
const editingAccount = ref(null);

/** 부모로부터 받은 연결 목록을 로컬로 복제해서 사용 */
const localConnected = ref([...props.connectedCodes]);
watch(
  () => props.connectedCodes,
  (next) => {
    localConnected.value = [...next];
  }
);

/** BankType(Object) → 배열 변환: [{code,name,logo}] */
const banksArray = computed(() =>
  Object.entries(BankType).map(([code, v]) => ({
    code,
    name: v.name,
    logo: v.imageLink,
  }))
);

/** 아직 연결되지 않은 은행 목록 */
const availableBanks = computed(() => {
  const set = new Set(localConnected.value);
  return banksArray.value.filter((b) => !set.has(b.code));
});

/** 버튼 활성화 조건 (생년월일이 필수일 때 포함) */
const isConnectable = computed(() => {
  const baseOk =
    userId.value.trim() !== '' &&
    password.value.trim() !== '' &&
    agreedToTerms.value;

  return props.requireBirthdate
    ? baseOk && birthdate.value.trim() !== ''
    : baseOk;
});

/** Methods */
const onRequestClose = () => {
  emit('update:modelValue', false);
  // 닫힐 때 폼 초기화(부드럽게 하고 싶으면 setTimeout으로 지연)
  setTimeout(resetForm, 300);
};

const resetLoginForm = () => {
  userId.value = '';
  password.value = '';
  birthdate.value = '';
};

const resetForm = () => {
  selectedBank.value = null;
  resetLoginForm();
  agreedToTerms.value = false;
  isLoading.value = false;
  editingAccount.value = null;
  isAdding.value = false;
};

const selectBank = (bank) => {
  selectedBank.value = bank; // {code, name, logo}
  editingAccount.value = null;
};

const selectAccountToEdit = (code) => {
  editingAccount.value = code;
  const meta = BankType[code] || {};
  selectedBank.value = {
    code,
    name: meta.name || code,
    logo: meta.imageLink || '',
  };
};

const goBackToList = () => {
  selectedBank.value = null;
  editingAccount.value = null;
  isAdding.value = false;
};

const handleSubmit = () => {
  const bankCode = selectedBank.value.code;
  console.log('전송중');
  if (editingAccount.value) {
    // 수정 흐름
    emit('edited', {
      bankCode: bankCode,
      birthDate: formatToYyyymmdd(birthdate.value),
      id: userId.value,
      password: password.value,
    });
  } else {
    emit('connected', {
      bankCode: bankCode,
      birthDate: formatToYyyymmdd(birthdate.value),
      id: userId.value,
      password: password.value,
    });
  }
  onRequestClose();
};

const handleLoadPrevious = () => {
  emit('loadPrevious');
  onRequestClose();
};

const handleRemoveAll = () => {
  showRemoveConfirm.value = false;
  emit('removedAll');
  onRequestClose();
};

const formatToYyyymmdd = (dateStr) => dateStr.replaceAll('-', '');
</script>

<style scoped>
/* 기존 스타일 그대로 유지 (트리거 버튼 관련 스타일 제거됨) */

.modal-backdrop {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  z-index: 40;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}
.modal-backdrop.visible {
  opacity: 1;
}

.modal-panel {
  background-color: var(--color-white);
  border-radius: 1.5rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
  width: 100%;
  max-width: 34rem;
  margin: 1rem;
  transform: scale(0.95) translateY(20px);
  opacity: 0;
  transition: transform 0.3s ease, opacity 0.3s ease;
  display: flex;
  flex-direction: column;
  max-height: 90vh;
}
.modal-panel.visible {
  transform: scale(1) translateY(0);
  opacity: 1;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #e5e5ea;
  flex-shrink: 0;
  margin: 0;
}
.modal-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1d1d1f;
}

.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #aeaeb2;
  padding: 0.5rem;
  border-radius: 50%;
  transition: background-color 0.2s, color 0.2s;
}
.close-btn:hover {
  background-color: #f2f2f7;
  color: #1d1d1f;
}
.close-icon {
  width: 1.5rem;
  height: 1.5rem;
}

.modal-content {
  padding: 2rem;
  min-height: 350px;
  overflow-y: auto;
  flex-grow: 1;
}

.content-title {
  margin-bottom: 2rem;
}
.content-title.no-margin {
  margin-bottom: 0;
}
.content-subtitle {
  font-size: 1rem;
  color: #6e6e73;
  margin: 0.5rem 0 2rem;
}

.selection-header {
  display: flex;
  align-items: center;
}

.bank-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(85px, 1fr));
  gap: 1.25rem;
  max-height: 20.8rem;
  overflow-y: auto;
  padding: 0.25rem 1rem 0.25rem 0.25rem;
}
.bank-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0.75rem;
  border: 1px solid #e5e5ea;
  background-color: var(--color-white);
  border-radius: 1rem;
  cursor: pointer;
  transition: all 0.25s ease;
  aspect-ratio: 1/1;
}
.bank-item:hover {
  transform: translateY(-4px);
  border-color: var(--color-accent);
  background-color: var(--color-white);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1),
    0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

.bank-logo {
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  object-fit: cover;
  background-color: #f2f2f7;
}
.bank-name {
  font-size: 0.8rem;
  text-align: center;
  color: #6e6e73;
  font-weight: 500;
  margin-top: 0.75rem;
}

.account-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-height: 18rem;
  overflow-y: auto;
  padding-right: 0.5rem;
  margin-bottom: 1.5rem;
}
.account-item {
  display: flex;
  align-items: center;
  padding: 1rem 1.25rem;
  border-radius: 1rem;
  background-color: #f2f2f7;
  border: 1px solid transparent;
  cursor: pointer;
  transition: all 0.2s ease;
}
.account-item:hover {
  border-color: var(--color-accent);
  background-color: var(--color-white);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
}
.account-info {
  margin-left: 1rem;
  flex-grow: 1;
}
.bank-name-large {
  font-weight: 600;
  color: #1d1d1f;
  display: block;
}
.account-userId {
  font-size: 0.9rem;
  color: #6e6e73;
}

.chevron-icon {
  width: 1.25rem;
  height: 1.25rem;
  color: #6e6e73;
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: #6e6e73;
  background-color: #f2f2f7;
  border-radius: 1rem;
}

.add-bank-btn {
  width: 100%;
  padding: 12px;
  font-size: 1rem;
  font-weight: 500;
  background-color: var(--color-accent);
  color: var(--color-white);
  border: 0;
  border-radius: 0.75rem;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 1.5rem;
}
.add-bank-btn:hover {
  transform: translateY(-2px);
  background-color: var(--color-dark);
  border-style: solid;
}

.login-header {
  display: flex;
  align-items: center;
  margin-bottom: 2rem;
}
.back-btn {
  margin-right: 1rem;
  color: #6e6e73;
  background-color: #f2f2f7;
  border: none;
  cursor: pointer;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  flex-shrink: 0;
}
.back-btn:hover {
  background-color: #e5e5ea;
  color: #1d1d1f;
}
.back-icon {
  width: 1.25rem;
  height: 1.25rem;
}
.selected-bank-logo {
  width: 2.75rem;
  height: 2.75rem;
  margin-right: 1rem;
  border-radius: 50%;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}
.selected-bank-name {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1d1d1f;
}

.form-group {
  margin-bottom: 1.25rem;
}
.form-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #6e6e73;
  margin-bottom: 0.5rem;
}
.form-input {
  box-sizing: border-box;
  display: block;
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #e5e5ea;
  border-radius: 0.75rem;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  transition: border-color 0.2s, box-shadow 0.2s;
  font-size: 1rem;
  background-color: #ffffff;
}
.form-input::placeholder {
  color: #aeaeb2;
}
.form-input:focus {
  outline: none;
  box-shadow: 0 0 0 3px var(--color-primary);
}

.terms-group {
  margin-top: 1.5rem;
}
.terms-label {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.terms-checkbox {
  appearance: none;
  width: 1.25rem;
  height: 1.25rem;
  border: 2px solid #e5e5ea;
  border-radius: 0.375rem;
  transition: all 0.2s;
  margin-right: 0.75rem;
  cursor: pointer;
}
.terms-checkbox:checked {
  background-color: var(--color-info);
  border-color: var(--color-info);
  background-image: url("data:image/svg+xml,%3csvg viewBox='0 0 16 16' fill='white' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z'/%3e%3c/svg%3e");
  animation: checkScale 0.2s ease-in-out;
}
@keyframes checkScale {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
}

.terms-text {
  font-size: 0.9rem;
  color: var(--color-title);
}
.required {
  font-weight: bold;
  color: var(--color-error);
}
.terms-link {
  text-decoration: underline;
  cursor: pointer;
  color: var(--color-info);
  font-weight: 500;
}
.terms-link:hover {
  color: var(--color-info-dark);
}

.submit-btn {
  width: 100%;
  margin-top: 1.5rem;
  padding: 14px 20px;
  border: none;
  border-radius: 0.75rem;
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-white);
  background-color: var(--color-accent);
  cursor: pointer;
  transition: background-color 0.2s, transform 0.2s;
}
.submit-btn:hover:not(:disabled) {
  background-color: var(--color-dark);
  transform: translateY(-2px);
}
.submit-btn:disabled {
  background-color: #c7c7cc;
  cursor: not-allowed;
}

.modal-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #f2f2f7;
  padding: 1.5rem 2rem;
  border-bottom-left-radius: 1.5rem;
  border-bottom-right-radius: 1.5rem;
  border-top: 1px solid #e5e5ea;
  flex-shrink: 0;
}
.footer-btn {
  width: 48%;
  text-align: center;
  padding: 10px 16px;
  background-color: #ffffff;
  border: 1px solid #e5e5ea;
  color: #6e6e73;
  font-size: 1rem;
  font-weight: 500;
  border-radius: 0.75rem;
  cursor: pointer;
  transition: all 0.2s;
}
.footer-btn:hover {
  background-color: #e5e5ea;
  border-color: #d1d1d6;
  color: #1d1d1f;
}
.footer-btn.btn-danger {
  border-color: transparent;
  background-color: var(--color-error);
  color: var(--color-error-light);
}
.footer-btn.btn-danger:hover {
  background-color: var(--color-error-dark);
  color: #fff;
  border-color: transparent;
}
.footer-btn:disabled {
  opacity: 0.5;
  background-color: #fff;
  border: 1px solid #e5e5ea;
  color: #6e6e73;
  cursor: not-allowed;
}
.footer-btn:disabled:hover {
  background-color: #fff;
  border: 1px solid #e5e5ea;
  color: #6e6e73;
}

.confirm-modal-backdrop {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
}
.confirm-modal-panel {
  background-color: #fff;
  border-radius: 1rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1),
    0 4px 6px -2px rgba(0, 0, 0, 0.05);
  padding: 2rem;
  max-width: 26rem;
  width: 100%;
  margin: 1rem;
  text-align: center;
}
.confirm-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1d1d1f;
}
.confirm-text {
  margin-top: 0.75rem;
  font-size: 1rem;
  color: #6e6e73;
  line-height: 1.6;
}
.confirm-actions {
  margin-top: 2rem;
  display: flex;
  justify-content: space-between;
}
.confirm-btn {
  width: 48%;
  padding: 10px 20px;
  border-radius: 0.75rem;
  border: none;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}
.confirm-btn.btn-cancel {
  background-color: #f2f2f7;
  color: #6e6e73;
}
.confirm-btn.btn-cancel:hover {
  background-color: #e5e5ea;
  color: #1d1d1f;
}
.confirm-btn.btn-confirm-danger {
  background-color: var(--color-error);
  color: #fff;
}
.confirm-btn.btn-confirm-danger:hover {
  background-color: var(--color-error-dark);
  transform: translateY(-2px);
}

.terms-modal-panel {
  background-color: #ffffff;
  border-radius: 1.5rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
  width: 100%;
  max-width: 40rem;
  margin: 1rem;
  display: flex;
  flex-direction: column;
  max-height: 80vh;
}
.terms-content {
  padding: 1.5rem 2rem;
  overflow-y: auto;
  flex-grow: 1;
  color: #6e6e73;
  line-height: 1.7;
  text-align: left;
}
.terms-content h4 {
  font-size: 1.1rem;
  font-weight: 700;
  color: #1d1d1f;
  margin-top: 1.5rem;
  margin-bottom: 0.5rem;
}
.terms-content h4:first-child {
  margin-top: 0;
}
.terms-content p,
.terms-content ul {
  margin-bottom: 1rem;
}
.terms-content ul {
  padding-left: 1.5rem;
}
.terms-footer {
  padding: 1rem 2rem;
  border-top: 1px solid #e5e5ea;
  text-align: center;
  background-color: #f2f2f7;
  border-bottom-left-radius: 1.5rem;
  border-bottom-right-radius: 1.5rem;
  flex-shrink: 0;
}
.btn-confirm-primary {
  width: 100%;
  background-color: var(--color-accent);
  color: var(--color-white);
  font-size: 1rem;
  font-weight: bold;
}
.btn-confirm-primary:hover {
  background-color: var(--color-dark);
  color: var(--color-white);
}
</style>
