<template>
  <!-- 🟢 상단 헤더 -->
  <header class="header">
    <div class="header-content">
      <!-- 🏠 로고 -->
      <RouterLink to="/" class="logo-section text-decoration-none text-white">
        <img :src="myLogo" alt="맞추머니 로고" class="logo-img" />
        <span class="app-name text-black">맞추머니</span>
      </RouterLink>

      <!-- 메뉴 + 알림 + 프로필 -->
      <nav class="header-nav">
        <!-- ① 데스크탑 메뉴 (로그인 시에만 표시) -->
        <ul v-if="isLoggedIn" class="nav-menu d-none d-lg-flex">
          <!-- 페르소나 드롭다운 -->
          <li
            class="nav-item"
            @mouseenter="showDropdown = 'persona'"
            @mouseleave="showDropdown = null"
          >
            <RouterLink to="/persona/start" active-class="active"
              >페르소나</RouterLink
            >
            <div v-if="showDropdown === 'persona'" class="dropdown-submenu">
              <RouterLink to="/persona/deposits" class="dropdown-item"
                >예금</RouterLink
              >
              <RouterLink to="/persona/savings" class="dropdown-item"
                >적금</RouterLink
              >
              <RouterLink to="/persona/cards" class="dropdown-item"
                >카드</RouterLink
              >
            </div>
          </li>

          <!-- 마이데이터 드롭다운 -->
          <li
            class="nav-item"
            @mouseenter="showDropdown = 'mydata'"
            @mouseleave="showDropdown = null"
          >
            <RouterLink
              to="/deposits/recommendations/history"
              active-class="active"
              >마이데이터</RouterLink
            >
            <div v-if="showDropdown === 'mydata'" class="dropdown-submenu">
              <RouterLink
                to="/deposits/recommendations/history"
                class="dropdown-item"
                >예금</RouterLink
              >
              <RouterLink
                to="/savings/recommendations/history"
                class="dropdown-item"
                >적금</RouterLink
              >
              <RouterLink to="/mydata/cards" class="dropdown-item"
                >카드</RouterLink
              >
            </div>
          </li>

          <!-- 상품비교 드롭다운 -->
          <li
            class="nav-item"
            @mouseenter="showDropdown = 'compare'"
            @mouseleave="showDropdown = null"
          >
            <RouterLink to="/compare" active-class="active"
              >상품비교</RouterLink
            >
            <div v-if="showDropdown === 'compare'" class="dropdown-submenu">
              <RouterLink to="/compare?type=DEPOSIT" class="dropdown-item"
                >예금</RouterLink
              >
              <RouterLink to="/compare?type=SAVING" class="dropdown-item"
                >적금</RouterLink
              >
              <RouterLink to="/compare?type=CARD" class="dropdown-item"
                >카드</RouterLink
              >
            </div>
          </li>

          <!-- 금융 컨텐츠 드롭다운 -->
          <li
            class="nav-item"
            @mouseenter="showDropdown = 'education'"
            @mouseleave="showDropdown = null"
          >
            <RouterLink to="/education/quiz">컨텐츠</RouterLink>
            <div v-if="showDropdown === 'education'" class="dropdown-submenu">
              <RouterLink to="/education/quiz" class="dropdown-item"
                >금융 컨텐츠</RouterLink
              >
              <RouterLink to="/education/contents" class="dropdown-item"
                >교육 컨텐츠</RouterLink
              >
            </div>
          </li>
        </ul>

        <!-- 로그인하지 않은 사용자용 간단한 메뉴 -->
        <div v-else class="auth-links d-none d-lg-flex">
          <RouterLink to="/login" class="auth-link-btn login-link-btn"
            >로그인</RouterLink
          >
          <RouterLink to="/signup" class="auth-link-btn signup-link-btn"
            >회원가입</RouterLink
          >
        </div>

        <!-- ② 알림 + 프로필 / 햄버거 -->
        <div class="header-actions">
          <!-- 🔔 웹 푸시 토글 (헤더) -->
          <div
            v-if="isLoggedIn"
            class="push-toggle-mini d-flex"
            title="웹 푸시"
          >
            <span class="push-label"></span>
            <label class="switch">
              <input
                type="checkbox"
                v-model="headerPushOn"
                @change="handlePushToggle"
                :disabled="!envReady || loading"
              />
              <span class="slider"></span>
            </label>
          </div>
          <!-- 🙍‍♂️ 프로필 + 로그아웃(데스크탑) - 로그인 시에만 표시 -->
          <div v-if="isLoggedIn" class="profile-section d-none d-md-flex">
            <RouterLink to="/mypage" class="profile-link">
              <img
                :src="profileImageSrc"
                alt="프로필"
                class="header-profile"
                style="width: 2.25rem; height: 2.25rem; object-fit: cover"
                @error="onImgError"
              />
            </RouterLink>

            <!-- 로그아웃 버튼 -->
            <button class="logout-btn" @click="handleLogout" title="로그아웃">
              <i class="bi bi-box-arrow-right"></i>
            </button>
          </div>

          <!-- 모바일: 로그인 상태에 따라 버튼/프로필 전환 -->
          <RouterLink
            v-if="isLoggedIn"
            to="/mypage"
            class="profile-link d-block d-md-none"
            aria-label="마이페이지로 이동"
          >
            <img
              :src="profileImageSrc"
              alt="내 프로필"
              class="header-profile header-profile--mobile"
              @error="onImgError"
            />
          </RouterLink>
          <RouterLink
            v-else
            to="/login"
            class="auth-link-btn-mobile login-link-btn-mobile d-block d-md-none"
          >
            로그인
          </RouterLink>

          <!-- ☰ 햄버거(모바일) -->
          <button
            class="btn text-black fs-4 ms-3 d-lg-none"
            @click="showMenu = true"
          >
            ☰
          </button>
        </div>
      </nav>
    </div>

    <!-- 📱 모바일 풀스크린 메뉴 (아코디언) -->
    <transition name="mobile-menu">
      <div
        v-if="showMenu"
        class="mobile-menu-overlay d-lg-none"
        role="dialog"
        aria-modal="true"
      >
        <div class="mobile-menu-header">
          <span class="mobile-menu-title">전체 메뉴</span>
          <button
            class="mobile-menu-close"
            @click="showMenu = false"
            aria-label="메뉴 닫기"
          >
            ✕
          </button>
        </div>

        <ul class="mobile-menu-list">
          <!-- 로그인한 사용자용 메뉴 -->
          <template v-if="isLoggedIn">
            <li class="menu-group menu-single">
              <RouterLink
                to="/mypage"
                class="single-link"
                @click.native="showMenu = false"
              >
                <span class="single-left">
                  <span class="single-icon" aria-hidden="true"
                    ><i class="bi bi-person-circle"></i
                  ></span>
                  <span class="single-label">마이페이지</span>
                </span>
                <span class="chevron">›</span>
              </RouterLink>
            </li>
            <li
              v-for="(group, idx) in mobileMenuGroups"
              :key="group.title"
              class="menu-group"
            >
              <button
                class="group-toggle"
                @click="toggleGroup(idx)"
                :aria-expanded="group.expanded.toString()"
              >
                <span class="group-left">
                  <span
                    v-if="group.iconClass"
                    class="group-icon"
                    aria-hidden="true"
                  >
                    <i :class="group.iconClass"></i>
                  </span>
                  <span class="group-title">{{ group.title }}</span>
                  <span v-if="group.desc" class="group-desc">{{
                    group.desc
                  }}</span>
                </span>
                <span class="chevron" :class="{ open: group.expanded }">▾</span>
              </button>

              <transition name="accordion">
                <ul v-show="group.expanded" class="submenu">
                  <li v-for="item in group.items" :key="item.to">
                    <RouterLink
                      :to="item.to"
                      class="submenu-link"
                      @click.native="showMenu = false"
                    >
                      <span
                        v-if="item.iconClass"
                        class="submenu-icon"
                        aria-hidden="true"
                      >
                        <i :class="item.iconClass"></i>
                      </span>
                      <span class="submenu-label">{{ item.label }}</span>
                    </RouterLink>
                  </li>
                </ul>
              </transition>
            </li>

            <!-- 로그아웃 버튼 -->
            <li class="menu-group menu-single">
              <button class="single-link logout-link" @click="handleLogout">
                <span class="single-left">
                  <span class="single-icon" aria-hidden="true"
                    ><i class="bi bi-box-arrow-right"></i
                  ></span>
                  <span class="single-label">로그아웃</span>
                </span>
              </button>
            </li>
          </template>

          <!-- 로그인하지 않은 사용자용 메뉴 -->
          <template v-else>
            <li class="menu-group menu-single">
              <RouterLink
                to="/login"
                class="single-link"
                @click.native="showMenu = false"
              >
                <span class="single-left">
                  <span class="single-icon" aria-hidden="true"
                    ><i class="bi bi-box-arrow-in-right"></i
                  ></span>
                  <span class="single-label">로그인</span>
                </span>
                <span class="chevron">›</span>
              </RouterLink>
            </li>
            <li class="menu-group menu-single">
              <RouterLink
                to="/signup"
                class="single-link"
                @click.native="showMenu = false"
              >
                <span class="single-left">
                  <span class="single-icon" aria-hidden="true"
                    ><i class="bi bi-person-plus"></i
                  ></span>
                  <span class="single-label">회원가입</span>
                </span>
                <span class="chevron">›</span>
              </RouterLink>
            </li>
          </template>
        </ul>
      </div>
    </transition>
  </header>
</template>
<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import { useAuthStore } from '@/shared/stores/auth';
import SideMenu from '@/shared/components/SideMenu.vue';
import defaultUser from '@/assets/user.png';
import myLogo from '@/assets/Logo.png';
import api from "@/shared/api"; // axios instance
import { getToken, deleteToken } from 'firebase/messaging';
import { getMessagingIfSupported } from '@/shared/firebase/firebaseClient';
import pushApi from '@/modules/user/api/push';
import { showToast } from '@/shared/utils/toast';

const authStore = useAuthStore();
const router = useRouter();

const showMenu = ref(false);
const showDropdown = ref(null);

const loading = ref(false);
const headerPushOn = ref(!!localStorage.getItem('fcmToken'));
const permission = ref(
  typeof Notification !== 'undefined' ? Notification.permission : 'default'
);
const envReady = ref(false);
let messagingInstance = null;

// 햄버거 메뉴 상태 변경 시 글로벌 이벤트 발생
watch(showMenu, (newValue) => {
  window.dispatchEvent(
    new CustomEvent('mobile-menu-toggle', { detail: { isOpen: newValue } })
  );
});

// 📱 모바일 메뉴 데이터 (대제목/소제목)
const mobileMenuGroups = ref([
  {
    title: '페르소나',
    desc: '내 유형 기반 추천',
    iconClass: 'bi bi-person-bounding-box',
    expanded: false,
    items: [
      { label: '예금 추천', to: '/persona/deposits', iconClass: 'bi bi-bank' },
      {
        label: '적금 추천',
        to: '/persona/savings',
        iconClass: 'bi bi-piggy-bank',
      },
      {
        label: '카드 추천',
        to: '/persona/cards',
        iconClass: 'bi bi-credit-card',
      },
    ],
  },
  {
    title: '마이데이터',
    desc: '소비·자산 분석',
    iconClass: 'bi bi-bar-chart-line',
    expanded: false,
    items: [
      {
        label: '예금 추천 내역',
        to: '/deposits/recommendations/history',
        iconClass: 'bi bi-clipboard-data',
      },
      {
        label: '적금 추천 내역',
        to: '/savings/recommendations/history',
        iconClass: 'bi bi-clipboard-check',
      },
      {
        label: '카드 소비 · 혜택',
        to: '/mydata/cards',
        iconClass: 'bi bi-receipt',
      },
    ],
  },
  {
    title: '상품비교',
    desc: '조건 맞춤 비교',
    iconClass: 'bi bi-sliders',
    expanded: false,
    items: [
      {
        label: '예금 비교함',
        to: '/compare?type=DEPOSIT',
        iconClass: 'bi bi-bank',
      },
      {
        label: '적금 비교함',
        to: '/compare?type=SAVING',
        iconClass: 'bi bi-piggy-bank',
      },
      {
        label: '카드 비교함',
        to: '/compare?type=CARD',
        iconClass: 'bi bi-credit-card',
      },
    ],
  },
  {
    title: '금융 컨텐츠',
    desc: '퀴즈·콘텐츠 학습',
    iconClass: 'bi bi-mortarboard',
    expanded: false,
    items: [
      {
        label: '금융 퀴즈',
        to: '/quiz/daily',
        iconClass: 'bi bi-question-circle',
      },
      {
        label: '재물운 보기',
        to: '/fortune',
        iconClass: 'bi bi-collection-play',
      },
      {
        label: '금융 웹툰',
        to: '/education/webtoon',
        iconClass: 'bi bi-layout-text-window-reverse',
      },
      {
        label: '금융 영상',
        to: '/education/video',
        iconClass: 'bi bi-play-circle',
      },
    ],
  },
]);

function toggleGroup(index) {
  mobileMenuGroups.value[index].expanded =
    !mobileMenuGroups.value[index].expanded;
}

function onProfileImageUpdated(e) {
  const url = e?.detail?.url || '';
  if (url) {
    profile_image_url.value = url;
  }
}

const profile_image_url = ref('');
const profileImageSrc = computed(() => {
  const url = profile_image_url.value;
  if (!url) return defaultUser;
  // 절대경로면 그대로 사용
  if (typeof url === 'string' && /^(https?:)?\/\//.test(url)) return url;
  // 상대경로면 그대로 바인딩 (프로젝트 정적 경로나 /api/files 같은 경우)
  return url || defaultUser;
});

const isLoggedIn = computed(
  () => !!(authStore.accessToken && authStore.userId)
);

const handleAuthAction = () => {
  if (isLoggedIn.value) {
    authStore.logout();
    router.push('/');
  } else {
    router.push('/login');
  }
};

// 모바일 메뉴에서 로그아웃 처리
const handleLogout = () => {
  authStore.logout();
  // 🔕 FCM 정리 (fcmService에서 이벤트 수신)
  window.dispatchEvent(new Event('app:logout'));
  showMenu.value = false; // 메뉴 닫기
  router.push('/');
};

// 프로필 이미지 로드 실패 시 기본 이미지로 대체
const onImgError = (e) => {
  e.target.src = defaultUser;
};

// 사용자 정보 조회 및 이미지 URL 반영
const fetchMe = async () => {
  try {
    // axios 인스턴스에 baseURL("/api")가 설정되어 있다면 앞에 슬래시 없이 호출
    const { data } = await api.get('user/me');
    // 일부 백엔드는 payload를 result/data에 넣어 내려줌
    const me = data?.result || data?.data || data;
    profile_image_url.value =
      me?.profileImageUrl ||
      me?.profile_image_url ||
      me?.imageUrl ||
      me?.profileImage ||
      '';
  } catch (error) {
    console.error('사용자 정보 불러오기 실패:', error);
    profile_image_url.value = '';
  }
};

function onKey(e) {
  // Escape key handler can be used for other purposes if needed
}

onMounted(async () => {
  window.addEventListener('keydown', onKey);
  window.addEventListener('profile-image-updated', onProfileImageUpdated);
  // ─ Push toggle init (desktop header)
  try {
    const isLocalhost =
      location.hostname === 'localhost' || location.hostname === '127.0.0.1';
    const isHttps = location.protocol === 'https:';
    envReady.value = (isLocalhost || isHttps) && 'serviceWorker' in navigator;
    if (envReady.value) {
      messagingInstance = await getMessagingIfSupported();
      permission.value = Notification.permission;
      headerPushOn.value = !!localStorage.getItem('fcmToken');
    }
  } catch (e) {
    console.warn('[Header] push init failed', e);
  }
});
// ────────── 웹 푸시 토글 관련 함수 ──────────
async function ensureSW() {
  return await navigator.serviceWorker.register('/firebase-messaging-sw.js');
}

async function subscribePush() {
  loading.value = true;
  try {
    const swReg = await ensureSW();
    const perm = await Notification.requestPermission();
    permission.value = perm;
    if (perm !== 'granted') {
      showToast({
        title: '권한 필요',
        message: '알림 권한이 허용되지 않았습니다.',
        type: 'warning',
      });
      return false;
    }

    if (!messagingInstance) messagingInstance = await getMessagingIfSupported();
    const vapidKey = import.meta.env.VITE_FIREBASE_MESSAGING_VAPID_KEY;
    if (!vapidKey || !messagingInstance) {
      showToast({
        title: '설정 오류',
        message: '푸쉬 환경이 올바르지 않습니다.',
        type: 'danger',
      });
      return false;
    }

    const token = await getToken(messagingInstance, {
      vapidKey,
      serviceWorkerRegistration: swReg,
    });
    if (!token) {
      showToast({
        title: '실패',
        message: 'FCM 토큰 발급에 실패했습니다.',
        type: 'danger',
      });
      return false;
    }

    const cached = localStorage.getItem('fcmToken');
    if (cached !== token) {
      await pushApi.registerToken(token);
      localStorage.setItem('fcmToken', token);
    }
    console.log('[Header] Push subscribed, token cached');
    headerPushOn.value = true;
    showToast({
      title: '알림',
      message: '푸쉬 알림이 활성화되었습니다.',
      type: 'success',
    });
    return true;
  } catch (e) {
    console.warn('[Header] subscribePush error:', e);
    showToast({
      title: '오류',
      message: '구독 중 오류가 발생했습니다.',
      type: 'danger',
    });
    return false;
  } finally {
    loading.value = false;
  }
}

async function unsubscribePush() {
  loading.value = true;
  try {
    const token = localStorage.getItem('fcmToken');
    if (!messagingInstance) messagingInstance = await getMessagingIfSupported();

    if (messagingInstance) {
      try {
        await deleteToken(messagingInstance);
      } catch (_) {}
    }
    if (token) {
      try {
        await pushApi.deleteToken(token);
      } catch (_) {}
      localStorage.removeItem('fcmToken');
    }
    console.log('[Header] Push unsubscribed, token removed');
    headerPushOn.value = false;
    showToast({
      title: '알림',
      message: '푸쉬 알림이 비활성화되었습니다.',
      type: 'info',
    });
    return true;
  } catch (e) {
    console.warn('[Header] unsubscribePush error:', e);
    showToast({
      title: '오류',
      message: '구독 해제 중 오류가 발생했습니다.',
      type: 'danger',
    });
    return false;
  } finally {
    loading.value = false;
  }
}

async function handlePushToggle() {
  if (headerPushOn.value) {
    console.log('[Header] Toggle ON → subscribe');
    const ok = await subscribePush();
    if (!ok) headerPushOn.value = false;
  } else {
    console.log('[Header] Toggle OFF → unsubscribe');
    const ok = await unsubscribePush();
    if (!ok) headerPushOn.value = true;
  }
}

// 로그인 이벤트에서 토글 상태 동기화 (자동 구독 포함)
const onAppLogin = async () => {
  try {
    if (!envReady.value) return;
    permission.value =
      typeof Notification !== 'undefined' ? Notification.permission : 'default';
    const hasToken = !!localStorage.getItem('fcmToken');

    if (hasToken) {
      headerPushOn.value = true;
      return;
    }

    // 권한이 이미 허용되어 있으면 자동 구독 시도
    if (permission.value === 'granted') {
      const ok = await subscribePush();
      headerPushOn.value = !!ok;
    } else {
      // 권한 미허용 상태면 스위치는 off 유지
      headerPushOn.value = false;
    }
  } catch (e) {
    console.warn('[Header] onAppLogin sync failed', e);
  }
};

const onAppLogout = () => {
  // 로그아웃 시 토글 off 로 동기화
  headerPushOn.value = false;
};

// 전역 이벤트 리스너 등록
window.addEventListener('app:login', onAppLogin);
window.addEventListener('app:logout', onAppLogout);
// 로그인 상태가 바뀔 때마다 프로필 이미지 갱신
watch(
  () => isLoggedIn.value,
  async (loggedIn) => {
    if (loggedIn) {
      await fetchMe();
    } else {
      profile_image_url.value = '';
    }
  },
  { immediate: true }
);
onUnmounted(() => {
  window.removeEventListener('keydown', onKey);
  window.removeEventListener('profile-image-updated', onProfileImageUpdated);
  window.removeEventListener('app:login', onAppLogin);
  window.removeEventListener('app:logout', onAppLogout);
});
</script>

<style scoped>
/* 기존 공통 변수·리셋이 global 에 있다면 @import 로 불러옵니다 */
@import '@/assets/main.css'; /* 필요하면 경로 수정 */

/* ─────────── 헤더 레이아웃 ─────────── */

.header {
  background: #ffffff;
  color: #1e2b4e;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  height: var(--header-height);
  border-bottom: 1px solid var(--border-dark);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  height: 100%;
  padding: 0 2.5rem;
}
/* 로고 */
.logo-section {
  display: flex;
  align-items: center;
  gap: 0.9375rem;
}
.logo {
  width: 2.8125rem;
  height: 2.8125rem;
  background: var(--color-accent);
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.125rem;
}
.app-name {
  font-weight: 700;
  font-size: 1.5rem;
}

/* 메뉴 */
.header-nav {
  display: flex;
  align-items: center;
  gap: 1rem;
  justify-content: flex-end;
}
.nav-menu {
  display: flex;
  gap: 2rem;
  list-style: none;
  margin: 0;
  padding: 0;
}

/* 네비게이션 아이템 스타일 */
.nav-item {
  position: relative;
  background: var(--color-white);
  color: var(--color-dark);
}

.nav-menu a {
  color: inherit;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  transition: background 0.3s;
  text-decoration: none;
}
.nav-menu a:hover {
  background: var(--color-light);
}
.nav-menu .active {
  background: var(--color-white-20);
  font-weight: 700;
}

/* 드롭다운 서브메뉴 스타일 */
.dropdown-submenu {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  background: var(--color-white);
  border-radius: 12px;
  box-shadow: var(--shadow-xl);
  min-width: 140px;
  padding: 8px 0;
  z-index: 1000;
  animation: fadeInDown 0.3s ease-out;
  border: 1px solid var(--border-light);
  backdrop-filter: blur(10px);
  margin-top: 8px;
}

/* 드롭다운 화살표 */
.dropdown-submenu::before {
  content: '';
  position: absolute;
  top: -8px;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 8px solid transparent;
  border-right: 8px solid transparent;
  border-bottom: 8px solid var(--color-white);
  filter: drop-shadow(0 -2px 4px rgba(0, 0, 0, 0.1));
}

.dropdown-submenu .dropdown-item {
  display: flex;
  align-items: center;
  padding: 12px 20px;
  color: var(--text-primary);
  text-decoration: none;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 0;
  font-weight: 500;
  font-size: 14px;
  position: relative;
  overflow: hidden;
}

/* 각 메뉴 아이템에 아이콘 추가 */
.dropdown-submenu .dropdown-item::before {
  content: '';
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--color-accent), var(--color-dark));
  margin-right: 12px;
  transition: all 0.2s ease;
  opacity: 0.6;
}

.dropdown-submenu .dropdown-item:hover {
  background: var(--color-primary);
  color: var(--text-primary);
  box-shadow: inset 0 0 20px var(--color-white-10);
}

.dropdown-submenu .dropdown-item:hover::before {
  background: var(--color-white);
  opacity: 1;
  transform: scale(1.2);
}

/* 각 아이템 사이에 미세한 구분선 */
.dropdown-submenu .dropdown-item:not(:last-child)::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 20px;
  right: 20px;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent,
    var(--border-light),
    transparent
  );
}

/* 드롭다운 애니메이션 개선 */
@keyframes fadeInDown {
  0% {
    opacity: 0;
    transform: translateX(-50%) translateY(-15px) scale(0.95);
  }
  100% {
    opacity: 1;
    transform: translateX(-50%) translateY(0) scale(1);
  }
}

/* 호버 시 메인 메뉴 아이템 스타일 개선 */
.nav-item:hover > a {
  background: var(--color-light);
  transform: translateY(-1px);
  box-shadow: var(--shadow-sm);
}

/* 액션 영역 */
.header-actions {
  display: flex;
  align-items: center;
  gap: 1.25rem;
}

/* 알림 */
.notification {
  position: relative;
  font-size: 1.25rem;
  cursor: pointer;
}
.notification-dot {
  position: absolute;
  top: -0.125rem;
  right: -0.125rem;
  width: 0.5rem;
  height: 0.5rem;
  background: var(--color-error);
  border-radius: 50%;
}
.noti-dropdown {
  min-width: 13.75rem;
  max-height: 15rem;
  overflow-y: auto;
  font-size: 0.85rem;
}

/* 프로필 섹션 */
.profile-section {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.profile-link {
  display: flex;
  align-items: center;
  border-radius: 50%;
  border: 1px solid var(--color-secondary-50);
}

/* 로그아웃 버튼 */
.logout-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.25rem;
  height: 2.25rem;
  border: none;
  border-radius: 50%;
  background: var(--color-accent);
  color: var(--color-white);
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1rem;
}

.logout-btn:hover {
  background: var(--color-error-dark);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.logout-btn:active {
  transform: translateY(0);
  box-shadow: var(--shadow-sm);
}

.header-profile {
  border-radius: 50%; /* 원형 */
}

/* 로그인/로그아웃 버튼(데스크탑) */
.auth-btn {
  background: var(--color-dark);
  border: 0.125rem solid var(--color-white);
  color: var(--color-white);
  padding: 0.5rem 1rem;
  border-radius: 50px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  align-items: center;
}

.auth-btn:hover {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: var(--color-dark);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

/* 로그인/회원가입 링크 버튼 스타일 */
.auth-links {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.auth-link-btn {
  padding: 0.5rem 1rem;
  border-radius: 50px;
  font-size: 0.875rem;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  border: 0.125rem solid;
}

.login-link-btn {
  background: transparent;
  border-color: var(--color-dark);
  color: var(--color-dark);
}

.login-link-btn:hover {
  background: var(--color-dark);
  color: var(--color-white);
  box-shadow: var(--shadow-md);
}

.signup-link-btn {
  background: var(--color-dark);
  border-color: var(--color-dark);
  color: var(--color-white);
}

.signup-link-btn:hover {
  background: var(--color-accent);
  border-color: var(--color-accent);
  color: var(--color-white);
  box-shadow: var(--shadow-md);
}

/* 모바일 로그인 버튼 스타일 */
.auth-link-btn-mobile {
  padding: 0.4rem 0.8rem;
  border-radius: 50px;
  font-size: 0.75rem;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  border: 0.125rem solid;
}

.login-link-btn-mobile {
  background: transparent;
  border-color: var(--color-dark);
  color: var(--color-dark);
}

.login-link-btn-mobile:hover {
  background: var(--color-dark);
  color: var(--color-white);
  box-shadow: var(--shadow-sm);
}

/* 기존 로그인 버튼(모바일) - 사용하지 않음 */
.login-btn {
  background: var(--color-white);
  border: 0.125rem solid var(--color-white);
  color: var(--color-dark);
  padding: 0.5rem 1rem;
  border-radius: 50px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.login-btn:hover {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: var(--color-dark);
  box-shadow: var(--shadow-md);
}

/* 햄버거 버튼(모바일) */
.btn.fs-4 {
  line-height: 1;
}

/* 반응형 조정(선택) */
@media (max-width: 992px) {
  /* lg 미만 */
  .nav-menu {
    display: none;
  }

  .header-profile {
    width: 40px; /* 원하는 크기 */
    height: 40px;
    border-radius: 50%; /* 원형 */
    border: 1px solid var(--color-secondary-50);
    object-fit: cover; /* 이미지 비율 유지 */
  }
  /* 모바일 크기 보정 */
  .header-profile--mobile {
    width: 30px;
    height: 30px;
  }

  /* ─────────── 모바일 풀스크린 메뉴 ─────────── */
  .mobile-menu-overlay {
    position: fixed;
    inset: 0;
    background: #fff;
    z-index: 1000;
    display: flex;
    flex-direction: column;
  }

  /* 모바일 메뉴 애니메이션 */
  .mobile-menu-enter-active {
    transition: transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  }
  .mobile-menu-leave-active {
    transition: transform 0.25s cubic-bezier(0.55, 0.06, 0.68, 0.19);
  }
  .mobile-menu-enter-from {
    transform: translateX(100%);
  }
  .mobile-menu-leave-to {
    transform: translateX(100%);
  }
  .mobile-menu-enter-to {
    transform: translateX(0);
  }
  .mobile-menu-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 1.25rem;
    border-bottom: 1px solid var(--border-light);
  }
  .mobile-menu-title {
    font-weight: 800;
    font-size: 1.3rem;
  }
  .mobile-menu-close {
    border: none;
    background: transparent;
    font-size: 1.5rem;
    cursor: pointer;
  }
  .mobile-menu-list {
    list-style: none;
    margin: 0;
    padding: 0.5rem 0;
    overflow-y: auto;
    flex: 1 1 auto;
  }
  .menu-group {
    border-bottom: 1px solid var(--border-light);
  }
  .group-toggle {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1.1rem 1.25rem;
    background: transparent;
    border: none;
    cursor: pointer;
  }
  .group-left {
    display: inline-flex;
    align-items: center;
    gap: 0.75rem;
  }
  .group-icon {
    font-size: 1.25rem;
    line-height: 1;
    display: inline-flex;
    align-items: center;
  }
  .group-title {
    font-size: 1.28rem;
    font-weight: 700;
    color: var(--color-dark);
  }
  .group-desc {
    margin-left: 0.5rem;
    font-size: 0.9rem;
    color: var(--color-secondary-80);
    font-weight: 500;
  }
  .menu-single {
    border-top: 1px solid var(--border-light);
  }
  .single-link {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 1.25rem;
    text-decoration: none;
    color: var(--color-dark);
  }
  .single-left {
    display: inline-flex;
    align-items: center;
    gap: 0.75rem;
  }
  .single-icon {
    width: 1.25rem;
    text-align: center;
    font-size: 1.25rem;
  }
  .single-label {
    font-size: 1.1rem;
    font-weight: 700;
  }
  .single-link:hover {
    background: var(--color-light);
  }

  /* 로그아웃 버튼 스타일 */
  .logout-link {
    width: 100%;
    text-align: left;
    border: none;
    background: transparent;
    color: var(--color-dark);
    cursor: pointer;
  }

  .logout-link:hover {
    background: var(--color-error-light);
    color: var(--color-error-dark);
  }
  .chevron {
    transition: transform 0.2s ease;
  }
  .chevron.open {
    transform: rotate(180deg);
  }

  .submenu {
    list-style: none;
    padding: 0.25rem 0 0.75rem 3.25rem;
    margin: 0;
    display: grid;
    gap: 0.35rem;
  }
  .submenu-link {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.6rem 1rem;
    text-decoration: none;
    color: var(--color-dark);
    border-radius: 8px;
    font-size: 1.05rem;
  }
  .submenu-link:hover {
    background: var(--color-light);
  }
  .submenu-icon {
    width: 1.25rem;
    text-align: center;
  }

  /* accordion transition */
  .accordion-enter-active,
  .accordion-leave-active {
    transition: max-height 260ms cubic-bezier(0.22, 1, 0.36, 1),
      opacity 220ms ease, transform 260ms cubic-bezier(0.22, 1, 0.36, 1);
    will-change: max-height, opacity, transform;
  }
  .accordion-enter-from,
  .accordion-leave-to {
    max-height: 0;
    opacity: 0;
    transform: translateY(-4px);
  }
  .accordion-enter-to,
  .accordion-leave-from {
    max-height: 520px;
    opacity: 1;
    transform: translateY(0);
  }
}

/* 알림 드롭다운 스타일 개선 */
.notification .noti-dropdown {
  background-color: var(--color-white);
  box-shadow: var(--shadow-lg);
  backdrop-filter: none;
  right: 0;
  left: auto;
}

.logo-img {
  width: 2.8125rem;
  height: 2.8125rem;
  object-fit: contain;
  border-radius: 0.75rem;
}

/* CSS 변수로 추가된 투명도 색상들 */
:root {
  --color-white-10: rgba(255, 255, 255, 0.1);
  --color-white-15: rgba(255, 255, 255, 0.15);
  --color-white-20: rgba(255, 255, 255, 0.2);
  --color-white-30: rgba(255, 255, 255, 0.3);
  --color-white-50: rgba(255, 255, 255, 0.5);
}
/* ─ Push toggle (header) ─ */
.push-toggle-mini {
  --switch-w: 52px; /* desktop width */
  --switch-h: 28px; /* desktop height */
  --knob: 24px; /* circle diameter */
  --gap: 3px; /* inner padding */
  --icon-offset-x: 1px;
  --icon-offset-y: -1px;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}
.push-toggle-mini .push-label {
  font-size: 0.85rem;
  color: var(--color-dark);
}
.switch {
  position: relative;
  display: inline-block;
  width: var(--switch-w);
  height: var(--switch-h);
}
.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}
.slider {
  position: absolute;
  inset: 0;
  cursor: pointer;
  background: var(--color-gray-300);
  transition: 0.2s ease;
  border-radius: 24px;
}
.slider:before {
  content: '';
  position: absolute;
  width: var(--knob);
  height: var(--knob);
  left: var(--gap);
  top: calc((var(--switch-h) - var(--knob)) / 2);
  background: var(--color-white);
  border-radius: 50%;
  transition: 0.2s ease;
  box-shadow: var(--shadow-sm);
  z-index: 2;
}

/* icon inside toggle */
.slider::after {
  content: '🔕';
  position: absolute;
  top: calc(50% + var(--icon-offset-y));
  right: calc(var(--gap) + 4px + var(--icon-offset-x));
  left: auto;
  transform: translateY(-50%);
  font-size: 11px;
  line-height: 1;
  z-index: 1;
  pointer-events: none;
  transition: all 0.2s ease;
}
.switch input:checked + .slider::after {
  content: '🔔';
  left: calc(var(--gap) + 4px + var(--icon-offset-x));
  right: auto;
}
.switch input:checked + .slider {
  background: var(--color-accent);
}
.switch input:checked + .slider:before {
  transform: translateX(calc(var(--switch-w) - var(--knob) - (var(--gap) * 2)));
}
.switch input:disabled + .slider {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 992px) {
  .push-toggle-mini {
    --switch-w: 52px; /* mobile width */
    --switch-h: 28px; /* mobile height */
    --knob: 24px; /* knob size */
    --gap: 3px; /* inner padding */
    --icon-offset-x: 0px;
    --icon-offset-y: -0.5px;
    display: inline-flex; /* ensure visible on mobile */
    gap: 0.5rem;
  }
  .push-toggle-mini .push-label {
    font-size: 1.1rem;
  }
  .push-toggle-mini .slider::after {
    font-size: 12px;
  }
}
</style>
