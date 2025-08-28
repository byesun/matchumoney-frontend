<template>
  <div class="quiz-entry-container">
    <div class="quiz-entry-content">
      <div class="header">
        <h1 class="title">
          <i class="fa-solid fa-sparkles title-icon" aria-hidden="true"></i>
          오늘의 지식과 흐름
        </h1>
        <p class="subtitle">
          퀴즈로 지식을 쌓고, 리포트로 금전운 흐름을 확인하세요.
        </p>
      </div>

      <div class="quiz-options">
        <!-- 일일 퀴즈: 유지 -->
        <div class="quiz-card daily-quiz" @click="goToDailyQuiz">
          <div class="quiz-icon circle">
            <i class="fa-solid fa-star" aria-hidden="true"></i>
          </div>
          <h2>일일 퀴즈</h2>
          <p>매일 하나의 금융 퀴즈를 풀고 10XP를 획득하세요</p>
          <div class="quiz-reward">+10 XP</div>
        </div>

        <!-- 운세 보기 → 금전운 보기 -->
        <div class="quiz-card fortune-quiz" @click="goToFortune">
          <div class="quiz-icon circle">
            <i class="fa-solid fa-sack-dollar" aria-hidden="true"></i>
          </div>
          <h2>금전운 보기</h2>
          <p>오늘의 금전운 리포트로 수입/지출 포인트와 기회를 확인하세요</p>
          <div class="quiz-reward">오늘의 리포트</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
const router = useRouter();
const goToDailyQuiz = () => {
  router.push('/quiz/daily');
};

const goToFortune = () => {
  router.push('/fortune');
};
// const goToGeneralQuiz = () => {
//   router.push('/quiz/financial');
// };
</script>

<style scoped>
.quiz-entry-container {
  min-height: 100%;
  padding: var(--spacing-2xl) var(--spacing-lg);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.quiz-entry-content {
  max-width: 960px;
  margin: 0 auto;
}

.header {
  text-align: center;
  padding: 2.5rem 2rem;
  background: linear-gradient(180deg, #f7f9fc 0%, #f1f4f8 100%);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.06);
  border-radius: 16px;
  margin-bottom: var(--spacing-3xl);
}

.title {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  font-size: var(--font-size-4xl);
  font-weight: 800;
  color: var(--color-dark);
  margin: 0 0 var(--spacing-md) 0;
}

.title-icon {
  font-size: 1.15em;
}

.subtitle {
  font-size: var(--font-size-lg);
  color: var(--text-secondary);
  margin: 0;
}

.quiz-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--spacing-2xl);
  margin-top: var(--spacing-2xl);
}

.quiz-card {
  background: var(--bg-card);
  border-radius: 16px;
  padding: var(--spacing-2xl);
  box-shadow: var(--shadow-lg);
  cursor: pointer;
  transition: transform 0.25s ease, box-shadow 0.25s ease,
    border-color 0.25s ease;
  text-align: center;
  position: relative;
  overflow: hidden;
  border: 1px solid var(--border-light);
}

.quiz-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-xl);
}

/* 카드별 호버 포커스 컬러 */
.daily-quiz:hover {
  border-color: var(--color-accent);
}
.fortune-quiz:hover {
  border-color: var(--color-secondary);
}

/* 아이콘 배지 */
.quiz-icon {
  font-size: 2rem; /* size for <i> inside */
  margin-bottom: var(--spacing-lg);
}
.quiz-icon.circle {
  width: 64px;
  height: 64px;
  margin: 0 auto var(--spacing-lg);
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: #f2f6ff;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.quiz-card h2 {
  font-size: var(--font-size-2xl);
  font-weight: 800;
  color: var(--color-dark);
  margin: 0 0 var(--spacing-sm) 0;
}

.quiz-card p {
  color: var(--text-secondary);
  line-height: 1.6;
  margin: 0 0 var(--spacing-xl) 0;
}

.quiz-reward {
  display: inline-block;
  background: var(--color-accent);
  color: var(--color-white);
  padding: var(--spacing-sm) var(--spacing-lg);
  border-radius: 999px;
  font-weight: 700;
  font-size: var(--font-size-sm);
}

/* 모바일 반응형 */
@media (max-width: 768px) {
  .quiz-entry-container {
    padding: var(--spacing-lg);
  }
  .title {
    font-size: var(--font-size-3xl);
  }
  .quiz-options {
    grid-template-columns: 1fr;
    gap: var(--spacing-xl);
  }
  .quiz-card {
    padding: var(--spacing-xl);
  }
}
</style>
