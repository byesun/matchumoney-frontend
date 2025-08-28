<template>
  <div class="quiz-container">
    <div class="quiz-wrapper">
      <!-- Header -->
      <div class="header">
        <h1 class="title">💰 금융 퀴즈</h1>
        <p class="subtitle">금융 지식을 늘려보세요!</p>
      </div>

      <!-- Quiz Stats -->
      <div class="stats-card" v-if="!isLoading">
        <div class="stats-grid">
          <div class="stat-item">
            <div class="stat-number correct">{{ stats.correct || 0 }}</div>
            <div class="stat-label">누적 정답</div>
          </div>
          <div class="stat-item">
            <div class="stat-number wrong">{{ stats.wrong || 0 }}</div>
            <div class="stat-label">누적 오답</div>
          </div>
          <div class="stat-item">
            <div class="stat-number streak">{{ stats.streak || 0 }}</div>
            <div class="stat-label">연속 정답</div>
          </div>
          <div class="stat-item">
            <div class="stat-number xp">{{ stats.totalXP || 0 }}</div>
            <div class="stat-label">총 XP</div>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="quiz-card">
        <div class="loading-state">
          <div class="loading-spinner">
            <i class="bi bi-arrow-clockwise spin"></i>
          </div>
          <p class="loading-text">퀴즈를 불러오는 중...</p>
        </div>
      </div>

      <!-- Quiz Card -->
      <div v-else class="quiz-card">
        <!-- No Quiz Available -->
        <div v-if="!currentQuiz && !showResult" class="no-quiz-state">
          <div class="no-quiz-icon">😊</div>
          <h2 class="no-quiz-title">모든 퀴즈 완료!</h2>
          <p class="no-quiz-text">
            축하합니다! 현재 사용 가능한 모든 퀴즈를 완료하셨습니다.
          </p>
          <button @click="refreshQuiz" class="refresh-btn">
            <i class="bi bi-arrow-clockwise"></i>
            새로고침
          </button>
        </div>

        <!-- Quiz State (퀴즈 풀이) -->
        <div v-else-if="currentQuiz && !showResult" class="quiz-state">
          <div class="question-header">
            <div class="question-badge">문제</div>
            <div class="question-info">+10 XP</div>
          </div>

          <div class="question-container">
            <h2 class="question-text">{{ currentQuiz.quizText }}</h2>
          </div>

          <div class="answers-container">
            <button
              @click="selectAnswer(true)"
              :disabled="answerSubmitted || isSubmitting"
              :class="['answer-btn', getButtonClass(true)]"
            >
              ⭕ 참 (O)
            </button>
            <button
              @click="selectAnswer(false)"
              :disabled="answerSubmitted || isSubmitting"
              :class="['answer-btn', getButtonClass(false)]"
            >
              ❌ 거짓 (X)
            </button>
          </div>

          <!-- Submit Button -->
          <div
            v-if="selectedAnswer !== null && !answerSubmitted"
            class="submit-section"
          >
            <button
              @click="submitAnswer"
              :disabled="isSubmitting"
              class="submit-btn"
            >
              <span v-if="isSubmitting">
                <i class="bi bi-arrow-clockwise spin"></i>
                제출 중...
              </span>
              <span v-else>답변 제출</span>
            </button>
          </div>

          <!-- Answer Result -->
          <div
            v-if="answerSubmitted && quizResult"
            :class="[
              'result-container',
              quizResult.isCorrect ? 'correct-result' : 'wrong-result',
            ]"
          >
            <div class="result-header">
              <span class="result-icon">{{
                quizResult.isCorrect ? '🎉' : '😅'
              }}</span>
              <span class="result-text">
                {{ quizResult.isCorrect ? '정답입니다!' : '틀렸습니다!' }}
              </span>
            </div>

            <div class="correct-answer-info">
              <strong>정답:</strong>
              {{ quizResult.correctAnswer ? 'O (참)' : 'X (거짓)' }}
            </div>

            <div v-if="quizResult.explanation" class="explanation">
              <strong>해설:</strong> {{ quizResult.explanation }}
            </div>

            <div v-if="quizResult.isCorrect" class="xp-reward">
              <span class="xp-text"
                >+{{ quizResult.earnedXP || 10 }} XP 획득! 🎉</span
              >
            </div>

            <button @click="finishQuiz" class="next-btn">퀴즈 완료</button>
          </div>
        </div>

        <!-- Result State -->
        <div v-else-if="showResult" class="result-state">
          <div class="result-icon-large">{{ isCorrect ? '🏆' : '👍' }}</div>
          <h2 class="result-title">퀴즈 완료!</h2>
          <div class="score-card">
            <div class="final-score">{{ isCorrect ? 'O' : 'X' }}</div>
            <p class="score-label">결과</p>
            <div v-if="isCorrect" class="xp-display">
              +{{ earnedXP }} XP 획득
            </div>
          </div>
          <p class="result-message">새로운 퀴즈를 풀어보세요!</p>
          <div class="result-actions">
            <button @click="loadNewQuiz" class="load-new-btn">
              <i class="bi bi-plus-circle"></i>
              새 퀴즈 풀기
            </button>
            <RouterLink to="/quiz" class="btn btn-secondary">
              <i class="bi bi-house"></i>
              퀴즈 홈
            </RouterLink>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import quizAPI from '@/api/quiz';
import { useCustomModal } from '@/composables/useCustomModal';

// 상태 관리
const isLoading = ref(true);
const currentQuiz = ref(null);
const selectedAnswer = ref(null);
const answerSubmitted = ref(false);
const isSubmitting = ref(false);
const quizResult = ref(null);
const showResult = ref(false);

// 통계 데이터
const stats = ref({
  correct: 0,
  wrong: 0,
  streak: 0,
  totalXP: 0,
});

const { showError } = useCustomModal();

// 퀴즈 결과 데이터
const isCorrect = ref(false);
const earnedXP = ref(0);

// Computed
const currentLevel = computed(() => Math.floor(stats.value.totalXP / 100) + 1);

// 메서드
const loadQuiz = async () => {
  try {
    isLoading.value = true;
    const quiz = await quizAPI.getTodayQuiz();

    if (quiz && quiz.problemId) {
      currentQuiz.value = {
        problemId: quiz.problemId,
        quizText: quiz.quizText,
        explanation: quiz.explanation,
      };
      resetQuizState();
    } else {
      console.warn('퀴즈 데이터가 올바르지 않습니다:', quiz);
      currentQuiz.value = null;
    }
  } catch (error) {
    console.error('퀴즈 로드 실패:', error);
    if (error.response?.status === 400) {
      // 풀 수 있는 문제가 없는 경우
      currentQuiz.value = null;
    } else if (error.response?.status === 404) {
      // 엔드포인트가 없는 경우
      console.warn(
        '퀴즈 API 엔드포인트를 찾을 수 없습니다. 백엔드 연결을 확인하세요.'
      );
      currentQuiz.value = null;
    } else {
      // 기타 오류
      console.warn('백엔드 연결 실패로 퀴즈를 로드할 수 없습니다.');
      currentQuiz.value = null;
    }
  } finally {
    isLoading.value = false;
  }
};

const loadUserStats = async () => {
  try {
    const userStats = await quizAPI.getUserQuizStats();

    if (userStats && typeof userStats === 'object') {
      stats.value = {
        correct: userStats.correct || 0,
        wrong: userStats.wrong || 0,
        streak: userStats.streak || 0,
        totalXP: userStats.totalXP || 0,
      };
    } else {
      console.warn('사용자 통계 데이터가 올바르지 않습니다:', userStats);
      // 기본값 유지
      stats.value = {
        correct: 0,
        wrong: 0,
        streak: 0,
        totalXP: 0,
      };
    }
  } catch (error) {
    console.error('사용자 통계 로드 실패:', error);
    if (error.response?.status === 404) {
      console.warn(
        '통계 API 엔드포인트를 찾을 수 없습니다. 백엔드 연결을 확인하세요.'
      );
    } else if (error.response?.status === 500) {
      console.warn('백엔드 서버 오류로 통계를 로드할 수 없습니다.');
    }
    // 오류 시 기본값 설정
    stats.value = {
      correct: 0,
      wrong: 0,
      streak: 0,
      totalXP: 0,
    };
  }
};

const resetQuizState = () => {
  selectedAnswer.value = null;
  answerSubmitted.value = false;
  isSubmitting.value = false;
  quizResult.value = null;
  showResult.value = false;
  isCorrect.value = false;
  earnedXP.value = 0;
};

const selectAnswer = (answer) => {
  if (answerSubmitted.value || isSubmitting.value) return;
  selectedAnswer.value = answer;
};

const submitAnswer = async () => {
  if (selectedAnswer.value === null || isSubmitting.value || !currentQuiz.value)
    return;

  isSubmitting.value = true;

  try {
    const result = await quizAPI.submitAnswer(
      currentQuiz.value.problemId,
      selectedAnswer.value
    );

    if (result && typeof result === 'object') {
      quizResult.value = result;
      answerSubmitted.value = true;
      isCorrect.value = result.isCorrect || false;

      if (result.isCorrect) {
        earnedXP.value = result.earnedXP || 10;
        stats.value.correct++;
        stats.value.totalXP += earnedXP.value;
        stats.value.streak++;

      } else {
        stats.value.wrong++;
        stats.value.streak = 0;
      }
    } else {
      console.warn('답변 제출 응답이 올바르지 않습니다:', result);
      await showError('서버 응답이 올바르지 않습니다.', '서버 오류');
    }
  } catch (error) {
    console.error('답변 제출 실패:', error);
    if (error.response?.status === 404) {
      await showError('퀴즈 제출 API를 찾을 수 없습니다. 백엔드 연결을 확인하세요.', 'API 오류');
    } else if (error.response?.status === 400) {
      await showError('이미 제출된 문제이거나 잘못된 요청입니다.', '요청 오류');
    } else {
      await showError('답변 제출에 실패했습니다. 네트워크 연결을 확인하세요.', '제출 실패');
    }
  } finally {
    isSubmitting.value = false;
  }
};


const finishQuiz = () => {
  showResult.value = true;
};

const loadNewQuiz = async () => {
  await loadQuiz();
};

const refreshQuiz = async () => {
  await Promise.all([loadQuiz(), loadUserStats()]);
};

// 정답버튼 UI 스타일
const getButtonClass = (answer) => {
  if (selectedAnswer.value === null) {
    return 'default';
  }
  if (selectedAnswer.value === answer) {
    return answerSubmitted.value
      ? isCorrect.value
        ? 'selected-correct'
        : 'selected-wrong'
      : 'selected';
  }
  if (answerSubmitted.value && answer === quizResult.value?.correctAnswer) {
    return 'show-correct';
  }
  return answerSubmitted.value ? 'disabled' : 'default';
};

// 라이프사이클
onMounted(async () => {
  await Promise.all([loadQuiz(), loadUserStats()]);
});
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.quiz-container {
  min-width: 80%;
  padding: var(--spacing-lg);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.quiz-wrapper {
  max-width: 48rem;
  margin: 0 auto;
}

/* Header Styles */
.header {
  text-align: center;
  margin-bottom: var(--spacing-xl);
}

.title {
  font-size: var(--font-size-3xl);
  font-weight: bold;
  color: var(--color-dark);
  margin: 0 0 var(--spacing-sm) 0;
}

.subtitle {
  color: var(--text-secondary);
  margin: 0;
}

/* Stats Card */
.stats-card {
  background: var(--bg-card);
  border-radius: 12px;
  box-shadow: var(--shadow-md);
  padding: var(--spacing-xl);
  margin-bottom: var(--spacing-xl);
  border: 1px solid var(--border-light);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--spacing-md);
  text-align: center;
}

.stat-number {
  font-size: var(--font-size-3xl);
  font-weight: bold;
  margin-bottom: var(--spacing-xs);
}

.stat-number.correct {
  color: var(--color-success);
}
.stat-number.wrong {
  color: var(--color-error);
}
.stat-number.streak {
  color: var(--color-accent);
}
.stat-number.xp {
  color: var(--color-accent);
}

.stat-label {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

/* Quiz Card */
.quiz-card {
  background: var(--bg-card);
  border-radius: 12px;
  box-shadow: var(--shadow-lg);
  padding: var(--spacing-xl);
  border: 1px solid var(--border-light);
}

/* Loading State */
.loading-state {
  text-align: center;
  padding: var(--spacing-3xl) 0;
}

.loading-spinner {
  font-size: var(--font-size-4xl);
  margin-bottom: var(--spacing-lg);
  color: var(--color-accent);
}

.loading-text {
  color: var(--text-secondary);
  margin: 0;
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* No Quiz State */
.no-quiz-state {
  text-align: center;
  padding: 3rem 0;
}

.no-quiz-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.no-quiz-title {
  font-size: 1.5rem;
  font-weight: bold;
  color: #374151;
  margin: 0 0 1rem 0;
}

.no-quiz-text {
  color: #6b7280;
  margin: 0 0 1.5rem 0;
}

.refresh-btn {
  background: var(--color-accent);
  color: var(--color-white);
  padding: var(--spacing-sm) var(--spacing-xl);
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-sm);
  transition: all 0.3s ease;
}

.refresh-btn:hover {
  background: var(--color-dark);
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

/* Quiz State */
.quiz-state {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.question-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.question-badge {
  background: var(--color-primary-20);
  color: var(--color-dark);
  padding: var(--spacing-sm) var(--spacing-lg);
  border-radius: 9999px;
  font-size: var(--font-size-sm);
  font-weight: 500;
}

.question-info {
  background: var(--color-success-light);
  color: var(--color-success-dark);
  padding: var(--spacing-sm) var(--spacing-lg);
  border-radius: 9999px;
  font-size: var(--font-size-sm);
  font-weight: 500;
}

.question-container {
  text-align: center;
}

.question-text {
  font-size: var(--font-size-xl);
  font-weight: bold;
  color: var(--color-dark);
  line-height: 1.6;
  margin: 0;
}

.answers-container {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.answer-btn {
  width: 100%;
  padding: var(--spacing-lg);
  border-radius: 8px;
  font-weight: 500;
  font-size: var(--font-size-base);
  border: 2px solid;
  cursor: pointer;
  transition: all 0.3s ease;
  transform: scale(1);
}

.answer-btn:hover:not(:disabled) {
  transform: scale(1.02);
}

.answer-btn.default {
  background: var(--bg-card);
  color: var(--text-primary);
  border-color: var(--border-light);
}

.answer-btn.default:hover {
  background: var(--bg-hover);
  border-color: var(--border-medium);
}

.answer-btn.selected {
  background: var(--color-primary-20);
  color: var(--color-dark);
  border-color: var(--color-accent);
}

.answer-btn.selected-correct {
  background: var(--color-success);
  color: var(--color-white);
  border-color: var(--color-success);
}

.answer-btn.selected-wrong {
  background: var(--color-error);
  color: var(--color-white);
  border-color: var(--color-error);
}

.answer-btn.show-correct {
  background: var(--color-success-light);
  color: var(--color-success-dark);
  border-color: var(--color-success);
}

.answer-btn.disabled {
  background: var(--bg-card);
  color: var(--text-disabled);
  border-color: var(--border-light);
  cursor: not-allowed;
}

/* Submit Section */
.submit-section {
  text-align: center;
}

.submit-btn {
  background: var(--color-accent);
  color: var(--color-white);
  padding: var(--spacing-md) var(--spacing-2xl);
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-weight: 500;
  font-size: var(--font-size-base);
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.submit-btn:hover:not(:disabled) {
  background: var(--color-dark);
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.submit-btn:disabled {
  background: var(--text-disabled);
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* Result Container */
.result-container {
  margin-top: 1.5rem;
  padding: 1rem;
  border-radius: 0.5rem;
  border: 1px solid;
}

.correct-result {
  background: #f0fdf4;
  border-color: #bbf7d0;
}

.wrong-result {
  background: #fef2f2;
  border-color: #fecaca;
}

.result-header {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
}

.result-icon {
  font-size: 1.5rem;
  margin-right: 0.5rem;
}

.result-text {
  font-weight: bold;
}

.correct-result .result-text {
  color: #166534;
}

.wrong-result .result-text {
  color: #991b1b;
}

.correct-answer-info {
  color: #374151;
  margin-bottom: 1rem;
  font-size: 0.875rem;
}

.explanation {
  color: #374151;
  font-size: 0.875rem;
  margin: 0 0 1rem 0;
  line-height: 1.5;
}

.next-btn {
  width: 100%;
  background: var(--color-accent);
  color: var(--color-white);
  padding: var(--spacing-md) var(--spacing-lg);
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
}

.next-btn:hover {
  background: var(--color-dark);
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

/* XP 보상 애니메이션 */
.xp-reward {
  text-align: center;
  margin: 1rem 0;
}

.xp-text {
  display: inline-block;
  background: var(--gradient-accent);
  color: var(--color-white);
  padding: var(--spacing-md) var(--spacing-xl);
  border-radius: 9999px;
  font-weight: bold;
  font-size: var(--font-size-base);
  box-shadow: var(--shadow-lg);
  animation: xpBounce 0.6s ease-out;
}

@keyframes xpBounce {
  0% {
    opacity: 0;
    transform: scale(0.3) translateY(20px);
  }
  50% {
    transform: scale(1.05) translateY(-5px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

/* Result State */
.result-state {
  text-align: center;
  padding: 2rem 0;
}

.result-icon-large {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.result-title {
  font-size: 1.5rem;
  font-weight: bold;
  color: #1f2937;
  margin: 0 0 1rem 0;
}

.score-card {
  background: #f9fafb;
  border-radius: 0.5rem;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.final-score {
  font-size: 2rem;
  font-weight: bold;
  color: #2563eb;
  margin-bottom: 0.5rem;
}

.score-label {
  color: #6b7280;
  margin: 0 0 0.5rem 0;
}

.xp-display {
  color: #7c3aed;
  font-weight: 600;
  font-size: 1.1rem;
}

.result-message {
  color: #6b7280;
  margin: 0 0 1.5rem 0;
}

.result-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.load-new-btn {
  background: var(--color-success);
  color: var(--color-white);
  padding: var(--spacing-sm) var(--spacing-xl);
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-sm);
  transition: all 0.3s ease;
  text-decoration: none;
}

.load-new-btn:hover {
  background: var(--color-success-dark);
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.btn-secondary {
  background: var(--color-secondary);
  color: var(--color-dark);
  padding: var(--spacing-sm) var(--spacing-xl);
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-sm);
  transition: all 0.3s ease;
  text-decoration: none;
}

.btn-secondary:hover {
  background: var(--color-accent);
  color: var(--color-white);
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}


/* Responsive Design */
@media (max-width: 768px) {
  .quiz-container {
    padding: var(--spacing-sm);
  }

  .title {
    font-size: var(--font-size-2xl);
  }

  .question-text {
    font-size: var(--font-size-lg);
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--spacing-sm);
  }

  .stat-number {
    font-size: var(--font-size-2xl);
  }

  .result-actions {
    flex-direction: column;
    align-items: center;
    gap: var(--spacing-md);
  }

  .question-header {
    flex-direction: column;
    gap: var(--spacing-sm);
  }
}
</style>
