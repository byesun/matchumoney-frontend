<template>
  <div class="daily-quiz-container">
    <BackButton />
    <div class="daily-quiz-content">
      <!-- 퀴즈 이력 섹션 (맨 위) -->
      <div class="quiz-history-section">
        <QuizHistory />
      </div>

      <!-- 헤더 - 레벨, 경험치, 스트릭 정보 -->
      <div class="daily-quiz-header">
        <div class="card user-progress-card">
          <div class="progress-info">
            <div class="level-info">
              <div class="level-badge">
                <i class="bi bi-star-fill"></i>
                <span>Level {{ currentLevel }}</span>
              </div>
              <div class="xp-info">
                <span class="current-xp">{{ totalXP }}</span>
                <span class="xp-label">XP</span>
              </div>
            </div>
          </div>
          <div class="streak-info">
            <div class="streak-badge">
              <i class="bi bi-fire"></i>
              <span>{{ streakCount }}연속 정답</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 오늘 퀴즈 완료 상태 -->
      <div v-if="todayCompleted" class="completed-state">
        <div class="card completed-card text-center">
          <div class="completed-content">
            <div class="completed-emoji">🎉</div>
            <h2 class="completed-title">오늘의 퀴즈 완료!</h2>
            <p class="completed-subtitle">
              훌륭해요! 오늘 2개 퀴즈를 모두 완료하셨습니다.
            </p>

            <div class="next-quiz-info">
              <div class="countdown-container">
                <i class="bi bi-clock"></i>
                <span>내일 새로운 퀴즈가 준비됩니다!</span>
              </div>
            </div>

            <div class="completed-actions">
              <RouterLink to="/quiz" class="btn btn-primary">
                <i class="bi bi-house"></i>
                퀴즈 홈
              </RouterLink>
            </div>
          </div>
        </div>
      </div>

      <!-- 오늘 퀴즈 시작 화면 -->
      <div
        v-else-if="!quizStarted && !showResult && todayQuiz"
        class="quiz-start-section"
      >
        <div class="card daily-quiz-start-card text-center">
          <div class="daily-header">
            <div class="daily-date">
              <i class="bi bi-calendar-day"></i>
              <span>{{ todayDateString }}</span>
            </div>
            <h1 class="daily-title">💰 오늘의 금융 퀴즈</h1>
            <p class="daily-subtitle">
              매일 새로운 금융 지식을 쌓아보세요! (하루 최대 2문제)
            </p>
          </div>

          <div class="daily-stats-grid">
            <div class="daily-stat-card primary">
              <div class="stat-number">2</div>
              <div class="stat-label">오늘의 문제</div>
            </div>
            <div class="daily-stat-card success">
              <div class="stat-number">10 XP</div>
              <div class="stat-label">정답시 경험치</div>
            </div>
            <div class="daily-stat-card accent">
              <div class="stat-number">O/X</div>
              <div class="stat-label">문제 유형</div>
            </div>
          </div>

          <button
            @click="startQuiz"
            class="btn btn-primary btn-large daily-start-btn"
          >
            <i class="bi bi-play-circle"></i>
            오늘의 퀴즈 시작
          </button>
        </div>
      </div>

      <!-- 로딩 상태 -->
      <div v-else-if="isLoading" class="loading-section">
        <div class="card text-center">
          <div class="loading-spinner">
            <i class="bi bi-arrow-clockwise spin"></i>
          </div>
          <p>퀴즈를 불러오는 중...</p>
        </div>
      </div>

      <!-- 오늘 퀴즈가 없는 경우 -->
      <div v-else-if="!todayQuiz && !isLoading" class="no-quiz-section">
        <div class="card text-center">
          <div class="no-quiz-emoji">😊</div>
          <h2>모든 퀴즈 완료!</h2>
          <p>축하합니다! 현재 사용 가능한 모든 퀴즈를 완료하셨습니다.</p>
          <RouterLink to="/quiz" class="btn btn-primary">
            퀴즈 홈으로
          </RouterLink>
        </div>
      </div>

      <!-- 퀴즈 진행 화면 -->
      <div
        v-if="quizStarted && todayQuiz && !showResult"
        class="quiz-progress-section"
      >
        <div class="card quiz-question-card">
          <div class="question-header">
            <div class="question-badges">
              <span class="badge badge-primary"
                >문제 {{ currentQuizNumber }}/{{ totalQuizCount }}</span
              >
              <span class="badge badge-secondary">O/X 문제</span>
              <span class="badge badge-accent">+10 XP</span>
            </div>
            <h3 class="question-text">{{ todayQuiz.quizText }}</h3>
          </div>

          <!-- 답변 선택 -->
          <div v-if="!answerSubmitted" class="answer-section">
            <div class="answer-buttons-grid">
              <button
                @click="selectAnswer(true)"
                :class="[
                  'answer-button answer-button-true',
                  selectedAnswer === true ? 'selected' : '',
                ]"
              >
                <div class="answer-button-content">
                  <span class="answer-emoji">⭕</span>
                  <span>맞습니다</span>
                </div>
              </button>
              <button
                @click="selectAnswer(false)"
                :class="[
                  'answer-button answer-button-false',
                  selectedAnswer === false ? 'selected' : '',
                ]"
              >
                <div class="answer-button-content">
                  <span class="answer-emoji">❌</span>
                  <span>틀렸습니다</span>
                </div>
              </button>
            </div>

            <div class="submit-section text-center">
              <button
                @click="submitAnswer"
                :disabled="selectedAnswer === null || isSubmitting"
                :class="[
                  'btn btn-primary submit-answer-btn',
                  selectedAnswer === null || isSubmitting ? 'disabled' : '',
                ]"
              >
                <span v-if="isSubmitting">
                  <i class="bi bi-arrow-clockwise spin"></i>
                  제출 중...
                </span>
                <span v-else>답변 제출</span>
              </button>
            </div>
          </div>

          <!-- 답변 결과 -->
          <div v-if="answerSubmitted && quizResult" class="result-section">
            <div
              :class="[
                'answer-result-card',
                quizResult.isCorrect ? 'correct' : 'incorrect',
              ]"
            >
              <div class="result-header">
                <span class="result-emoji">
                  {{ quizResult.isCorrect ? '🎉' : '😅' }}
                </span>
                <div>
                  <h4 class="result-title">
                    {{ quizResult.isCorrect ? '정답입니다!' : '틀렸습니다!' }}
                  </h4>
                  <p class="result-answer">
                    정답:
                    {{
                      quizResult.correctAnswer
                        ? 'O (맞습니다)'
                        : 'X (틀렸습니다)'
                    }}
                  </p>
                  <div class="xp-reward" v-if="quizResult.isCorrect">
                    <i class="bi bi-star-fill"></i>
                    <span>+{{ quizResult.earnedXP }} XP 획득!</span>
                  </div>
                </div>
              </div>

              <!-- 해설 -->
              <div v-if="quizResult.explanation" class="explanation-card">
                <h5 class="explanation-title">💡 해설</h5>
                <p class="explanation-text">{{ quizResult.explanation }}</p>
              </div>
            </div>

            <div class="text-center">
              <button
                @click="completeQuiz"
                class="btn btn-primary complete-quiz-btn"
              >
                {{
                  completedQuizCount >= totalQuizCount - 1
                    ? '완료'
                    : '다음 문제'
                }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- XP 획득 애니메이션 오버레이 -->
      <div v-if="showXPAnimation" class="xp-animation-overlay">
        <div class="xp-animation">
          <div class="xp-burst">+{{ earnedXP }} XP</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import quizAPI from '@/api/quiz';
import QuizHistory from '@/modules/quiz/components/QuizHistory.vue';
import BackButton from '@/components/common/BackButton.vue';
import { useCustomModal } from '@/composables/useCustomModal';

const router = useRouter();
const { showAlert, showError } = useCustomModal();

// 상태 관리
const isLoading = ref(true);
const todayQuiz = ref(null);
const todayCompleted = ref(false);
const quizStarted = ref(false);
const showResult = ref(false);
const selectedAnswer = ref(null);
const answerSubmitted = ref(false);
const isSubmitting = ref(false);
const quizResult = ref(null);
const showXPAnimation = ref(false);

// 퀴즈 진행 상태
const currentQuizNumber = ref(1); // 현재 풀고 있는 문제 번호 (1 또는 2)
const totalQuizCount = ref(2); // 하루 총 문제 수
const completedQuizCount = ref(0); // 완료한 문제 수

// 사용자 통계
const correctCount = ref(0);
const wrongCount = ref(0);
const streakCount = ref(0);
const totalXP = ref(0);
const earnedXP = ref(0);
const lastEarnedXP = ref(0);
const sessionTotalXP = ref(0); // 오늘 퀴즈에서 총 획득한 경험치

// Computed
const currentLevel = computed(() => Math.floor(totalXP.value / 100) + 1);

const todayDateString = computed(() => {
  return new Date().toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  });
});

// 메서드
const loadTodayQuiz = async () => {
  try {
    const quiz = await quizAPI.getTodayQuiz();

    if (quiz && quiz.problemId) {
      todayQuiz.value = {
        problemId: quiz.problemId,
        quizText: quiz.quizText,
        explanation: quiz.explanation,
      };
    } else {
      console.warn('퀴즈 데이터가 올바르지 않습니다:', quiz);
      todayQuiz.value = null;
    }
  } catch (error) {
    console.error('오늘의 퀴즈 로드 실패:', error);
    if (error.response?.status === 400) {
      // 풀 수 있는 문제가 없는 경우
      todayQuiz.value = null;
    } else if (error.response?.status === 404) {
      console.warn(
        '퀴즈 API 엔드포인트를 찾을 수 없습니다. 백엔드 연결을 확인하세요.'
      );
      todayQuiz.value = null;
    } else {
      console.warn('백엔드 연결 실패로 퀴즈를 로드할 수 없습니다.');
      todayQuiz.value = null;
    }
  }
};

const loadUserStats = async () => {
  try {
    const stats = await quizAPI.getUserQuizStats();

    if (stats && typeof stats === 'object') {
      correctCount.value = stats.correct || 0;
      wrongCount.value = stats.wrong || 0;
      streakCount.value = stats.streak || 0;
      totalXP.value = stats.totalXP || 0;
    } else {
      console.warn('사용자 통계 데이터가 올바르지 않습니다:', stats);
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
  }
};

const checkTodayCompleted = async () => {
  try {
    const completed = await quizAPI.getTodayQuizCompleted();
    todayCompleted.value = completed === true;
  } catch (error) {
    console.error('오늘 퀴즈 완료 상태 확인 실패:', error);
    if (error.response?.status === 404) {
      console.warn(
        '완료 상태 API 엔드포인트를 찾을 수 없습니다. 백엔드 연결을 확인하세요.'
      );
    }
    todayCompleted.value = false; // 기본값
  }
};

const startQuiz = () => {
  quizStarted.value = true;
  selectedAnswer.value = null;
  answerSubmitted.value = false;
  quizResult.value = null;
};

const selectAnswer = (answer) => {
  if (!answerSubmitted.value) {
    selectedAnswer.value = answer;
  }
};

const submitAnswer = async () => {
  if (selectedAnswer.value === null || isSubmitting.value || !todayQuiz.value)
    return;

  isSubmitting.value = true;

  try {
    const result = await quizAPI.submitAnswer(
      todayQuiz.value.problemId,
      selectedAnswer.value
    );

    if (result && typeof result === 'object') {
      quizResult.value = result;
      answerSubmitted.value = true;

      if (result.isCorrect) {
        earnedXP.value = result.earnedXP || 10;
        lastEarnedXP.value = earnedXP.value;
        totalXP.value += earnedXP.value;
        sessionTotalXP.value += earnedXP.value; // 세션 총 경험치에 누적
        correctCount.value++;

        // XP 애니메이션 표시
        await showXPEarnedAnimation();

        // 첫 번째 문제인 경우 자동으로 다음 문제로 이동
        if (completedQuizCount.value < totalQuizCount.value - 1) {
          setTimeout(async () => {
            await completeQuiz();
          }, 1000);
        }
      } else {
        wrongCount.value++;
      }
    } else {
      console.warn('답변 제출 응답이 올바르지 않습니다:', result);
      await showError('서버 응답이 올바르지 않습니다.', '서버 오류');
    }
  } catch (error) {
    console.error('답변 제출 실패:', error);
    if (error.response?.status === 404) {
      await showError(
        '퀴즈 제출 API를 찾을 수 없습니다. 백엔드 연결을 확인하세요.',
        'API 오류'
      );
    } else if (error.response?.status === 400) {
      await showError('이미 제출된 문제이거나 잘못된 요청입니다.', '요청 오류');
    } else {
      await showError(
        '답변 제출에 실패했습니다. 네트워크 연결을 확인하세요.',
        '제출 실패'
      );
    }
  } finally {
    isSubmitting.value = false;
  }
};

const showXPEarnedAnimation = () => {
  return new Promise((resolve) => {
    showXPAnimation.value = true;
    setTimeout(() => {
      showXPAnimation.value = false;
      resolve();
    }, 2000);
  });
};

const completeQuiz = async () => {
  completedQuizCount.value++;

  // 첫 번째 문제를 완료한 경우
  if (completedQuizCount.value < totalQuizCount.value) {
    currentQuizNumber.value++;

    // 상태 초기화하고 다음 문제 로드
    resetQuizState();

    try {
      isLoading.value = true;
      await loadTodayQuiz();

      if (todayQuiz.value) {
        // 자동으로 다음 퀴즈 시작
        startQuiz();
      } else {
        // 더 이상 문제가 없으면 완료 처리
        todayCompleted.value = true;
        showResult.value = true;
      }
    } catch (error) {
      console.error('다음 퀴즈 로드 실패:', error);
      // 오류 발생 시 완료 처리
      todayCompleted.value = true;
      showResult.value = true;
    } finally {
      isLoading.value = false;
    }
  } else {
    // 모든 문제를 완료한 경우
    todayCompleted.value = true;
    showResult.value = true;
  }
};

const resetQuizState = () => {
  quizStarted.value = false;
  showResult.value = false;
  selectedAnswer.value = null;
  answerSubmitted.value = false;
  quizResult.value = null;
  showXPAnimation.value = false;
};

// 초기화
onMounted(async () => {
  isLoading.value = true;

  try {
    await Promise.all([checkTodayCompleted(), loadUserStats()]);

    if (!todayCompleted.value) {
      await loadTodayQuiz();
    }
  } catch (error) {
    console.error('데이터 로드 실패:', error);
  } finally {
    isLoading.value = false;
  }
});
</script>

<style scoped>
/* 기본 스타일 */
.daily-quiz-container {
  padding: var(--spacing-lg);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.daily-quiz-content {
  max-width: 80%;
  margin: 0 auto;
}

/* 헤더 */
.daily-quiz-header {
  margin-bottom: var(--spacing-xl);
}

.user-progress-card {
  padding: var(--spacing-xl);
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--bg-card);
  border: 1px solid var(--border-light);
  box-shadow: var(--shadow-md);
}

.level-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
}

.level-badge {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-xs) var(--spacing-md);
  background: var(--color-accent);
  color: var(--color-white);
  border-radius: 20px;
  font-weight: 600;
  font-size: var(--font-size-sm);
}

.xp-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-weight: 600;
  color: var(--color-dark);
}

.current-xp {
  font-size: var(--font-size-lg);
  color: var(--color-accent);
}

.streak-badge {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  color: var(--color-accent);
  font-weight: 600;
}

/* 로딩 */
.loading-section {
  text-align: center;
  padding: var(--spacing-2xl);
}

.loading-spinner {
  font-size: 2rem;
  margin-bottom: var(--spacing-lg);
  color: var(--color-accent);
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

/* 완료 상태 */
.completed-card {
  padding: var(--spacing-2xl);
}

.completed-emoji {
  font-size: 4rem;
  margin-bottom: var(--spacing-lg);
}

.completed-title {
  font-size: var(--font-size-3xl);
  font-weight: 700;
  color: var(--color-dark);
  margin-bottom: var(--spacing-sm);
}

.completed-subtitle {
  font-size: var(--font-size-lg);
  color: var(--text-secondary);
  margin-bottom: var(--spacing-xl);
}

.xp-earned {
  color: var(--color-accent);
  font-weight: 600;
}

.next-quiz-info {
  margin: var(--spacing-xl) 0;
  padding: var(--spacing-lg);
  background: var(--color-primary-30);
  border-radius: 12px;
  border: 1px solid var(--color-accent);
}

.countdown-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  color: var(--color-dark);
  font-weight: 600;
}

.completed-actions {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: var(--spacing-xl);
}

/* 퀴즈 시작 */
.daily-quiz-start-card {
  padding: var(--spacing-2xl);
}

.daily-date {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  color: var(--text-secondary);
  font-size: var(--font-size-lg);
  margin-bottom: var(--spacing-lg);
}

.daily-title {
  font-size: var(--font-size-4xl);
  font-weight: 700;
  color: var(--color-dark);
  margin-bottom: var(--spacing-sm);
}

.daily-subtitle {
  font-size: var(--font-size-xl);
  color: var(--text-secondary);
  margin-bottom: var(--spacing-2xl);
}

.daily-stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: var(--spacing-xl);
  margin-bottom: var(--spacing-2xl);
}

.daily-stat-card {
  padding: var(--spacing-xl);
  border-radius: 12px;
  text-align: center;
  box-shadow: var(--shadow-sm);
  transition: transform 0.3s ease;
}

.daily-stat-card:hover {
  transform: translateY(-4px);
}

.daily-stat-card.primary {
  background-color: var(--color-primary-20);
  border: 1px solid var(--color-primary);
}

.daily-stat-card.success {
  background-color: var(--color-success-light);
  border: 1px solid var(--color-success);
}

.daily-stat-card.accent {
  background-color: var(--color-accent-20);
  border: 1px solid var(--color-accent);
}

.stat-number {
  font-size: var(--font-size-2xl);
  font-weight: 700;
  color: var(--color-dark);
  margin-bottom: var(--spacing-sm);
}

.stat-label {
  font-size: var(--font-size-base);
  color: var(--text-secondary);
  font-weight: 500;
}

.daily-start-btn {
  padding: var(--spacing-lg) var(--spacing-2xl);
  font-size: var(--font-size-xl);
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin: 0 auto;
}

/* 퀴즈 진행 */
.quiz-question-card {
  padding: var(--spacing-2xl);
}

.question-badges {
  display: flex;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
  flex-wrap: wrap;
}

.badge {
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: 20px;
  font-size: var(--font-size-sm);
  font-weight: 600;
  text-align: center;
  border: 1px solid transparent;
  transition: all 0.3s ease;
}

.badge-primary {
  background-color: var(--color-primary);
  color: var(--color-dark);
  border-color: var(--color-primary);
}

.badge-secondary {
  background-color: var(--color-secondary);
  color: var(--color-dark);
  border-color: var(--color-secondary);
}

.badge-accent {
  background-color: var(--color-accent);
  color: var(--color-dark);
  border-color: var(--color-accent);
}

.badge:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-sm);
}

.question-text {
  font-size: var(--font-size-2xl);
  font-weight: 600;
  color: var(--color-dark);
  line-height: 1.4;
  margin-bottom: var(--spacing-2xl);
}

.answer-buttons-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-xl);
}

.answer-button {
  padding: var(--spacing-xl);
  border: 2px solid var(--border-medium);
  border-radius: 12px;
  background-color: var(--bg-card);
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: var(--font-size-xl);
  font-weight: 600;
}

.answer-button:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.answer-button-true:hover,
.answer-button.selected.answer-button-true {
  border-color: var(--color-success);
  background-color: var(--color-success-light);
  color: var(--color-success-dark);
}

.answer-button-false:hover,
.answer-button.selected.answer-button-false {
  border-color: var(--color-error);
  background-color: var(--color-error-light);
  color: var(--color-error-dark);
}

.answer-button-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-md);
}

.answer-emoji {
  font-size: var(--font-size-3xl);
}

.submit-answer-btn {
  padding: var(--spacing-md) var(--spacing-2xl);
  font-size: var(--font-size-lg);
  font-weight: 600;
}

.submit-answer-btn.disabled {
  background-color: var(--color-gray-300);
  color: var(--color-gray-500);
  cursor: not-allowed;
}

/* 결과 */
.answer-result-card {
  padding: var(--spacing-xl);
  border-radius: 12px;
  border: 2px solid;
  margin-bottom: var(--spacing-xl);
}

.answer-result-card.correct {
  background-color: var(--color-success-light);
  border-color: var(--color-success);
}

.answer-result-card.incorrect {
  background-color: var(--color-error-light);
  border-color: var(--color-error);
}

.result-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-lg);
}

.result-emoji {
  font-size: var(--font-size-4xl);
}

.result-title {
  font-size: var(--font-size-2xl);
  font-weight: 700;
  margin-bottom: var(--spacing-sm);
}

.answer-result-card.correct .result-title {
  color: var(--color-success-dark);
}

.answer-result-card.incorrect .result-title {
  color: var(--color-error-dark);
}

.result-answer {
  font-size: var(--font-size-lg);
  margin-bottom: var(--spacing-sm);
}

.xp-reward {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  color: var(--color-success);
  font-weight: 600;
}

.explanation-card {
  padding: var(--spacing-lg);
  background-color: var(--color-primary-50);
  border: 1px solid var(--color-accent);
  border-radius: 8px;
}

.explanation-title {
  font-weight: 600;
  color: var(--color-dark);
  margin-bottom: var(--spacing-sm);
}

.explanation-text {
  color: var(--color-dark);
  line-height: 1.5;
}

.complete-quiz-btn {
  padding: var(--spacing-md) var(--spacing-2xl);
  font-size: var(--font-size-lg);
  font-weight: 600;
}

/* 애니메이션 */
.xp-animation-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.xp-burst {
  font-size: 3rem;
  font-weight: 700;
  color: var(--color-success);
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
  animation: xpBurst 2s ease-out;
}

.btn-primary {
  background-color: var(--color-accent);
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
}

@keyframes xpBurst {
  0% {
    transform: scale(0) translateY(0);
    opacity: 0;
  }
  50% {
    transform: scale(1.2) translateY(-20px);
    opacity: 1;
  }
  100% {
    transform: scale(1) translateY(-40px);
    opacity: 0;
  }
}

/* 반응형 */
@media (max-width: 768px) {
  .daily-quiz-container {
    padding: var(--spacing-md);
  }

  .user-progress-card {
    flex-direction: column;
    gap: var(--spacing-lg);
    text-align: center;
  }

  .daily-stats-grid {
    grid-template-columns: 1fr;
  }

  .answer-buttons-grid {
    grid-template-columns: 1fr;
  }

  .daily-start-btn {
    width: 100%;
    justify-content: center;
  }
}

.no-quiz-section {
  text-align: center;
  padding: var(--spacing-2xl);
}

.no-quiz-emoji {
  font-size: 4rem;
  margin-bottom: var(--spacing-lg);
}

/* 퀴즈 이력 섹션 */
.quiz-history-section {
  margin-top: var(--spacing-2xl);
}

@media (max-width: 768px) {
  .quiz-history-section {
    margin-top: var(--spacing-xl);
  }
}
</style>
