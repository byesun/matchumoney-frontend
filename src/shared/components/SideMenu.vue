<template>
  <transition name="slide">
    <div v-if="visible" class="side-menu">
      <div class="menu-header">
        <h5>메뉴</h5>
        <button class="btn-close" @click="$emit('close')">✕</button>
      </div>
      <nav class="menu-links">
        <!-- 페르소나 섹션 -->
        <div class="menu-section">
          <h6 class="section-title">페르소나</h6>
          <RouterLink
            to="/persona/start"
            class="menu-item"
            @click="$emit('close')"
          >
            <span class="menu-icon">👤</span>
            <span>페르소나 시작</span>
          </RouterLink>
          <RouterLink
            to="/persona/deposits"
            class="menu-item sub-item"
            @click="$emit('close')"
          >
            <span class="menu-icon">💰</span>
            <span>예금</span>
          </RouterLink>
          <RouterLink
            to="/persona/savings"
            class="menu-item sub-item"
            @click="$emit('close')"
          >
            <span class="menu-icon">🏦</span>
            <span>적금</span>
          </RouterLink>
          <RouterLink
            to="/persona/cards"
            class="menu-item sub-item"
            @click="$emit('close')"
          >
            <span class="menu-icon">💳</span>
            <span>카드</span>
          </RouterLink>
        </div>

        <!-- 마이데이터 섹션 -->
        <div class="menu-section">
          <h6 class="section-title">마이데이터</h6>
          <RouterLink
            to="/deposits/recommendations/history"
            class="menu-item sub-item"
            @click="$emit('close')"
          >
            <span class="menu-icon">💰</span>
            <span>예금</span>
          </RouterLink>
          <RouterLink
            to="/savings/recommendations/history"
            class="menu-item sub-item"
            @click="$emit('close')"
          >
            <span class="menu-icon">🏦</span>
            <span>적금</span>
          </RouterLink>
          <RouterLink
            to="/mydata/cards"
            class="menu-item sub-item"
            @click="$emit('close')"
          >
            <span class="menu-icon">💳</span>
            <span>카드</span>
          </RouterLink>
        </div>

        <!-- 상품비교 섹션 -->
        <div class="menu-section">
          <h6 class="section-title">상품비교</h6>
          <!-- <RouterLink to="/compare" class="menu-item">
            <span class="menu-icon">⚖️</span>
            <span>상품비교</span>
          </RouterLink> -->
          <RouterLink
            to="/compare"
            class="menu-item sub-item"
            @click="$emit('close')"
          >
            <span class="menu-icon">💰</span>
            <span>상품비교</span>
          </RouterLink>

          <!-- <RouterLink
            to="/compare?type=SAVING"
            class="menu-item sub-item"
            :class="{
              'router-link-active':
                route.path === '/compare' && route.query.type === 'SAVING',
            }"
          >
            <span class="menu-icon">🏦</span>
            <span>적금</span>
          </RouterLink>

          <RouterLink
            to="/compare?type=CARD"
            class="menu-item sub-item"
            :class="{
              'router-link-active':
                route.path === '/compare' && route.query.type === 'CARD',
            }"
          >
            <span class="menu-icon">💳</span>
            <span>카드</span>
          </RouterLink> -->
        </div>

        <!-- 교육 섹션 -->
        <div class="menu-section">
          <h6 class="section-title">교육</h6>
          <!-- <RouterLink to="/loan" class="menu-item">
            <span class="menu-icon">📚</span>
            <span>교육</span>
          </RouterLink> -->
          <RouterLink
            to="/education/quiz"
            class="menu-item sub-item"
            @click="$emit('close')"
          >
            <span class="menu-icon">❓</span>
            <span>퀴즈</span>
          </RouterLink>
          <RouterLink to="/education/video" class="menu-item sub-item">
            <span class="menu-icon">🎥</span>
            <span>교육 영상</span>
          </RouterLink>
        </div>

        <!-- 기타 메뉴 -->
        <div class="menu-section">
          <RouterLink
            to="/notifications"
            class="menu-item"
            @click="$emit('close')"
          >
            <span class="menu-icon">🔔</span>
            <span>알림</span>
          </RouterLink>
          <RouterLink to="/mypage" class="menu-item" @click="$emit('close')">
            <span class="menu-icon">👤</span>
            <span>마이페이지</span>
          </RouterLink>
        </div>
      </nav>
    </div>
  </transition>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router';
import { onMounted } from 'vue';

const route = useRoute();
const router = useRouter();

onMounted(() => {
  // compare 페이지인데 type이 없을 경우 기본값 설정
  if (route.path === '/compare' && !route.query.type) {
    router.replace({ path: '/compare', query: { type: 'DEPOSIT' } });
  }
});

defineProps({ visible: Boolean });
</script>

<style scoped>
.side-menu {
  position: fixed;
  top: 0;
  right: 0;
  width: 320px;
  height: 100vh;
  background: var(--color-white);
  box-shadow: -4px 0 16px rgba(0, 0, 0, 0.15);
  padding: 24px;
  z-index: 1050;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  backdrop-filter: blur(10px);
  border-left: 1px solid var(--border-light);
}

/* 메뉴 상단 */
.menu-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  border-bottom: 2px solid var(--color-secondary);
  padding-bottom: 16px;
}

.menu-header h5 {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
  color: var(--color-dark);
  background: var(--gradient-accent);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* 닫기 버튼 */
.btn-close {
  background: var(--color-accent);
  border: none;
  color: var(--color-white);
  font-size: 18px;
  cursor: pointer;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  box-shadow: var(--shadow-sm);
}

.btn-close:hover {
  background: var(--color-dark);
  transform: scale(1.1);
  box-shadow: var(--shadow-md);
}

/* 메뉴 섹션 */
.menu-section {
  margin-bottom: 24px;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-accent);
  margin-bottom: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding-left: 8px;
  position: relative;
}

.section-title::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 14px;
  background: var(--gradient-accent);
  border-radius: 2px;
}

/* 링크 스타일 */
.menu-links {
  display: flex;
  flex-direction: column;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 16px;
  font-weight: 500;
  color: var(--color-dark);
  text-decoration: none;
  padding: 12px 16px;
  border-radius: 12px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  margin-bottom: 4px;
  position: relative;
  overflow: hidden;
}

.menu-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 0;
  height: 100%;
  background: var(--gradient-accent);
  transition: width 0.3s ease;
  z-index: -1;
}

.menu-item:hover {
  background: var(--color-secondary);
  color: var(--color-dark);
  transform: translateX(4px);
  box-shadow: var(--shadow-md);
}

.menu-item:hover::before {
  width: 4px;
}

.menu-item.router-link-active {
  background: var(--color-accent);
  color: var(--color-white);
  font-weight: 600;
  box-shadow: var(--shadow-lg);
}

.menu-item.router-link-active::before {
  width: 100%;
  background: rgba(255, 255, 255, 0.1);
}

/* 서브 아이템 스타일 */
.sub-item {
  margin-left: 16px;
  font-size: 14px;
  padding: 8px 12px;
  background: var(--color-primary-20);
  border-left: 2px solid var(--color-secondary);
}

.sub-item:hover {
  background: var(--color-secondary-30);
  border-left-color: var(--color-accent);
  margin-left: 20px;
}

.sub-item.router-link-active {
  background: var(--color-accent);
  border-left-color: var(--color-dark);
}

/* 메뉴 아이콘 */
.menu-icon {
  font-size: 18px;
  width: 24px;
  text-align: center;
  transition: transform 0.3s ease;
}

.menu-item:hover .menu-icon {
  transform: scale(1.2);
}

/* 슬라이드 트랜지션 개선 */
.slide-enter-active,
.slide-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

.slide-enter-to,
.slide-leave-from {
  transform: translateX(0);
  opacity: 1;
}

/* 스크롤바 스타일링 */
.side-menu::-webkit-scrollbar {
  width: 6px;
}

.side-menu::-webkit-scrollbar-track {
  background: var(--color-primary-30);
  border-radius: 3px;
}

.side-menu::-webkit-scrollbar-thumb {
  background: var(--color-accent);
  border-radius: 3px;
  transition: background 0.3s ease;
}

.side-menu::-webkit-scrollbar-thumb:hover {
  background: var(--color-dark);
}

/* 반응형 디자인 */
@media (max-width: 480px) {
  .side-menu {
    width: 280px;
    padding: 20px;
  }

  .menu-item {
    font-size: 14px;
    padding: 10px 12px;
  }

  .sub-item {
    font-size: 13px;
    padding: 6px 10px;
  }
}

.sub-item.router-link-active {
  background: var(--color-accent);
  color: white;
  border-left-color: var(--color-dark);
}
</style>
