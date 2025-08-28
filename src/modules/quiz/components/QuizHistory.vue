<template>
  <div class="quiz-history-container">
    <div class="quiz-history-header" @click="toggleHistory">
      <div class="history-title-row">
        <h3 class="history-title">
          <i class="bi bi-clock-history"></i>
          퀴즈 이력
        </h3>
        <button class="toggle-button" :class="{ expanded: isExpanded }">
          <i class="bi bi-chevron-down"></i>
        </button>
      </div>

      <!-- 토글 펼치기 전 간단한 O/X 표시 -->
      <div v-if="!isExpanded && quizHistory.length > 0" class="quiz-summary">
        <span class="summary-label">최근 5개:</span>
        <div class="summary-results">
          <span
            v-for="(history, index) in quizHistory.slice(0, 5)"
            :key="history.logId"
            class="result-icon"
            :class="{
              correct: history.isCorrect,
              incorrect: !history.isCorrect,
            }"
          >
            {{ history.isCorrect ? 'O' : 'X' }}
          </span>
        </div>
      </div>

      <span class="history-subtitle">{{
        isExpanded ? '클릭하여 접기' : '클릭하여 자세히 보기'
      }}</span>
    </div>

    <!-- 토글 가능한 콘텐츠 영역 -->
    <transition name="slide">
      <div v-show="isExpanded" class="quiz-history-content">
        <!-- 로딩 상태 -->
        <div v-if="isLoading" class="loading-section">
          <div class="loading-spinner">
            <i class="bi bi-arrow-clockwise spin"></i>
          </div>
          <p class="loading-text">퀴즈 이력을 불러오는 중...</p>
        </div>

        <!-- 이력이 없는 경우 -->
        <div
          v-else-if="!isLoading && (!quizHistory || quizHistory.length === 0)"
          class="no-history-section"
        >
          <div class="no-history-content">
            <div class="no-history-emoji">📚</div>
            <h4 class="no-history-title">퀴즈 이력이 없습니다</h4>
            <p class="no-history-description">
              아직 풀어본 퀴즈가 없어요.<br />
              첫 번째 퀴즈에 도전해보세요!
            </p>
          </div>
        </div>

        <!-- 퀴즈 이력 슬라이드 -->
        <div v-else class="quiz-history-slider">
          <!-- 슬라이드 컨테이너 -->
          <div
            class="slider-container"
            ref="sliderContainer"
            @touchstart="handleTouchStart"
            @touchmove="handleTouchMove"
            @touchend="handleTouchEnd"
            @mousedown="handleMouseDown"
            @mousemove="handleMouseMove"
            @mouseup="handleMouseUp"
            @mouseleave="handleMouseUp"
          >
            <div
              class="slider-track"
              :style="{
                transform: `translateX(-${currentSlide * slideWidth}%)`,
              }"
            >
              <div
                v-for="(history, index) in quizHistory"
                :key="history.logId"
                class="history-slide"
                :class="{
                  correct: history.isCorrect,
                  incorrect: !history.isCorrect,
                }"
              >
                <div class="slide-card">
                  <div class="slide-header">
                    <div class="slide-badge">
                      <span class="badge-icon">
                        {{ history.isCorrect ? '✅' : '❌' }}
                      </span>
                      <span class="badge-text">
                        {{ history.isCorrect ? '정답' : '오답' }}
                      </span>
                    </div>
                    <div class="slide-date">
                      {{ formatDate(history.solvedTime) }}
                    </div>
                  </div>

                  <div class="slide-content">
                    <div class="quiz-question">
                      <p class="question-text">{{ history.quizText }}</p>
                    </div>

                    <div class="quiz-answer">
                      <span class="answer-label">정답:</span>
                      <span class="answer-value correct-answer">
                        {{ history.correctAnswer ? 'O' : 'X' }}
                      </span>
                    </div>

                    <!-- 해설 -->
                    <div v-if="history.explanation" class="quiz-explanation">
                      <p class="explanation-text">{{ history.explanation }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 페이지 인디케이터 (모바일용) -->
          <div v-if="quizHistory.length > 1" class="mobile-pagination">
            <div class="pagination-dots">
              <span
                v-for="(dot, index) in quizHistory.length"
                :key="index"
                @click="goToSlide(index)"
                class="pagination-dot"
                :class="{ active: index === currentSlide }"
              ></span>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import quizAPI from '@/modules/quiz/api/quiz';

const isLoading = ref(true);
const isRefreshing = ref(false);
const quizHistory = ref([]);
const isExpanded = ref(false);

// 슬라이드 관련 상태
const currentSlide = ref(0);
const slidesPerView = ref(1); // 모바일 기준 1개씩만
const sliderContainer = ref(null);

// 터치/마우스 이벤트 관련 상태
const isDragging = ref(false);
const startX = ref(0);
const currentX = ref(0);
const startTranslate = ref(0);
const currentTranslate = ref(0);

// 계산된 속성
const slideWidth = computed(() => {
  return 100; // 모바일 기준 100%
});

const loadQuizHistory = async () => {
  try {
    const history = await quizAPI.getQuizHistory();
    quizHistory.value = Array.isArray(history) ? history : [];
  } catch (error) {
    console.error('퀴즈 이력 로드 실패:', error);
    quizHistory.value = [];

    if (error.response?.status === 404) {
      console.warn('퀴즈 이력 API 엔드포인트를 찾을 수 없습니다.');
    } else if (error.response?.status === 500) {
      console.warn('서버 오류로 퀴즈 이력을 로드할 수 없습니다.');
    }
  }
};

const refreshHistory = async () => {
  isRefreshing.value = true;
  try {
    await loadQuizHistory();
  } finally {
    isRefreshing.value = false;
  }
};

// 터치/마우스 이벤트 핸들러
const getPositionX = (event) => {
  return event.type.includes('mouse')
    ? event.clientX
    : event.touches[0].clientX;
};

const handleTouchStart = (event) => {
  startX.value = getPositionX(event);
  isDragging.value = true;
  startTranslate.value = -currentSlide.value * slideWidth.value;
};

const handleMouseDown = (event) => {
  event.preventDefault();
  handleTouchStart(event);
};

const handleTouchMove = (event) => {
  if (!isDragging.value) return;

  currentX.value = getPositionX(event);
  const diffX = currentX.value - startX.value;
  const movePercentage = (diffX / sliderContainer.value.offsetWidth) * 100;
  currentTranslate.value = startTranslate.value + movePercentage;
};

const handleMouseMove = (event) => {
  handleTouchMove(event);
};

const handleTouchEnd = () => {
  if (!isDragging.value) return;

  isDragging.value = false;
  const diffX = currentX.value - startX.value;
  const threshold = sliderContainer.value.offsetWidth * 0.2; // 20% 임계값

  if (diffX > threshold && currentSlide.value > 0) {
    // 오른쪽으로 스와이프 (이전 슬라이드)
    currentSlide.value--;
  } else if (
    diffX < -threshold &&
    currentSlide.value < quizHistory.value.length - 1
  ) {
    // 왼쪽으로 스와이프 (다음 슬라이드)
    currentSlide.value++;
  }

  // 원래 위치로 스냅
  currentTranslate.value = -currentSlide.value * slideWidth.value;
};

const handleMouseUp = () => {
  handleTouchEnd();
};

const goToSlide = (index) => {
  currentSlide.value = index;
  currentTranslate.value = -index * slideWidth.value;
};

const toggleHistory = () => {
  isExpanded.value = !isExpanded.value;
};

const formatDate = (dateString) => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    });
  } catch (error) {
    console.error('날짜 포맷 오류:', error);
    return '날짜 오류';
  }
};

onMounted(async () => {
  isLoading.value = true;
  try {
    await loadQuizHistory();
  } finally {
    isLoading.value = false;
  }
});
</script>

<style scoped>
.quiz-history-container {
  background: var(--bg-card);
  border: 1px solid var(--border-light);
  border-radius: 12px;
  padding: var(--spacing-xl);
  box-shadow: var(--shadow-sm);
}

.quiz-history-header {
  margin-bottom: var(--spacing-lg);
  cursor: pointer;
  user-select: none;
  transition: all 0.3s ease;
  padding: var(--spacing-md);
  border-radius: 8px;
}

.quiz-history-header:hover {
  background: var(--color-primary-10);
}

.history-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-sm);
}

.history-title {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-size: var(--font-size-xl);
  font-weight: 700;
  color: var(--color-dark);
  margin-bottom: 0;
}

.toggle-button {
  background: none;
  border: none;
  font-size: var(--font-size-lg);
  color: var(--color-accent);
  cursor: pointer;
  transition: transform 0.3s ease;
  padding: var(--spacing-xs);
  border-radius: 50%;
}

.toggle-button:hover {
  background: var(--color-accent-10);
}

.toggle-button.expanded {
  transform: rotate(180deg);
}

.history-subtitle {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  text-align: center;
}

.quiz-summary {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-md);
  margin: var(--spacing-md) 0;
  padding: var(--spacing-sm);
  background: var(--color-primary-10);
  border-radius: 8px;
}

.summary-label {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--color-dark);
}

.summary-results {
  display: flex;
  gap: var(--spacing-xs);
}

.result-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  font-size: var(--font-size-sm);
  font-weight: 700;
  transition: transform 0.2s ease;
}

.result-icon:hover {
  transform: scale(1.1);
}

.result-icon.correct {
  background: var(--color-accent);
  color: var(--color-white);
}

.result-icon.incorrect {
  background: var(--color-error);
  color: var(--color-white);
}

.quiz-history-content {
  animation: slideDown 0.3s ease-out;
}

.loading-section {
  text-align: center;
  padding: var(--spacing-2xl);
}

.loading-spinner {
  font-size: 2rem;
  margin-bottom: var(--spacing-md);
  color: var(--color-accent);
}

.loading-text {
  color: var(--text-secondary);
  font-size: var(--font-size-base);
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

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 슬라이드 애니메이션 */
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}

.slide-enter-from {
  max-height: 0;
  opacity: 0;
  transform: translateY(-10px);
}

.slide-enter-to {
  max-height: 1000px;
  opacity: 1;
  transform: translateY(0);
}

.slide-leave-from {
  max-height: 1000px;
  opacity: 1;
  transform: translateY(0);
}

.slide-leave-to {
  max-height: 0;
  opacity: 0;
  transform: translateY(-10px);
}

.no-history-section {
  text-align: center;
  padding: var(--spacing-2xl);
}

.no-history-content {
  max-width: 300px;
  margin: 0 auto;
}

.no-history-emoji {
  font-size: 3rem;
  margin-bottom: var(--spacing-lg);
}

.no-history-title {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--color-dark);
  margin-bottom: var(--spacing-sm);
}

.no-history-description {
  color: var(--text-secondary);
  line-height: 1.5;
}

/* 슬라이드 컨테이너 */
.quiz-history-slider {
  position: relative;
  width: 100%;
  overflow: hidden;
}

.slider-container {
  overflow: hidden;
  width: 100%;
  cursor: grab;
  user-select: none;
  touch-action: pan-y;
}

.slider-container:active {
  cursor: grabbing;
}

.slider-track {
  display: flex;
  transition: transform 0.3s ease;
  width: 100%;
}

.history-slide {
  flex: 0 0 100%;
  padding: 0 var(--spacing-md);
  box-sizing: border-box;
  min-height: 300px;
}

.slide-card {
  border: 1px solid var(--border-light);
  border-radius: 12px;
  background: var(--bg-card);
  transition: all 0.3s ease;
  height: 90%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.history-slide:hover .slide-card {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.history-slide.correct .slide-card {
  background: linear-gradient(
    to right,
    var(--color-success-light) 0%,
    var(--bg-card) 50%
  );
}

.history-slide.incorrect .slide-card {
  background: linear-gradient(
    to right,
    var(--color-error-light) 0%,
    var(--bg-card) 50%
  );
}

.slide-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md) var(--spacing-lg);
  border-bottom: 1px solid var(--border-light);
}

.slide-content {
  padding: var(--spacing-lg);
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.slide-badge {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: 20px;
  font-size: var(--font-size-base);
  font-weight: 600;
}

.history-slide.correct .slide-badge {
  background: var(--color-success-light);
  color: var(--color-success-dark);
}

.history-slide.incorrect .slide-badge {
  background: var(--color-error-light);
  color: var(--color-error-dark);
}

.badge-icon {
  font-size: var(--font-size-base);
}

.slide-date {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.quiz-question {
  margin-bottom: var(--spacing-md);
}

.question-text {
  font-size: var(--font-size-base);
  font-weight: 500;
  color: var(--color-dark);
  line-height: 1.5;
  margin-bottom: 0;
}

.quiz-answer {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-md);
}

.answer-label {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--text-secondary);
}

.answer-value {
  font-size: var(--font-size-lg);
  font-weight: 700;
  padding: var(--spacing-xs) var(--spacing-md);
  border-radius: 50%;
  min-width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.correct-answer {
  background: var(--color-accent);
  color: var(--color-white);
}

.quiz-explanation {
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--color-light);
  border-left: 3px solid var(--color-accent);
  border-radius: 4px;
  margin-top: auto;
}

.explanation-text {
  font-size: var(--font-size-sm);
  color: var(--color-dark);
  line-height: 1.5;
  margin-bottom: 0;
}

/* 모바일 페이지네이션 */
.mobile-pagination {
  display: flex;
  justify-content: center;
  padding: var(--spacing-md);
}

.pagination-dots {
  display: flex;
  gap: var(--spacing-sm);
}

.pagination-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--color-gray-300);
  cursor: pointer;
  transition: all 0.3s ease;
}

.pagination-dot:hover {
  background: var(--color-accent-50);
  transform: scale(1.2);
}

.pagination-dot.active {
  background: var(--color-accent);
  width: 24px;
  border-radius: 4px;
}

/* 모바일 최적화 */
@media (max-width: 768px) {
  .quiz-history-container {
    padding: var(--spacing-md);
  }

  .slide-header {
    flex-direction: column;
    gap: var(--spacing-sm);
    text-align: center;
    padding: var(--spacing-md);
  }

  .slide-content {
    padding: var(--spacing-md);
  }

  .quiz-summary {
    flex-direction: column;
    gap: var(--spacing-sm);
    margin: var(--spacing-sm) 0;
    padding: var(--spacing-sm);
  }

  .summary-results {
    justify-content: center;
  }

  .result-icon {
    width: 24px;
    height: 24px;
    font-size: var(--font-size-xs);
  }

  .quiz-answer {
    justify-content: center;
  }

  .history-slide {
    padding: 0 var(--spacing-sm);
    min-height: 280px;
  }

  .slide-card {
    border-radius: 8px;
  }

  .question-text {
    font-size: var(--font-size-sm);
    line-height: 1.4;
  }

  .answer-value {
    width: 28px;
    height: 28px;
    font-size: var(--font-size-base);
  }

  .explanation-text {
    font-size: var(--font-size-xs);
  }

  .pagination-dot {
    width: 6px;
    height: 6px;
  }

  .pagination-dot.active {
    width: 20px;
  }
}
</style>
