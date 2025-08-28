<template>
  <div class="survey-wrapper" @click="clearSelection" :key="componentKey">
    <!-- 진행도 ------------------------------------------------------- -->
    <div class="progress-container">
      <div class="progress-text">{{ animatedIndex }}/{{ totalQuestions }}</div>
      <div class="progress-bar">
        <div
          class="progress-bar-fill"
          :style="{
            width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%`,
          }"
        />
      </div>
    </div>

    <!-- 질문 --------------------------------------------------------- -->
    <div class="question">
      <h2>
        Q{{ currentQuestionIndex + 1 }}.
        {{ questions[currentQuestionIndex].question }}
      </h2>
    </div>

    <!-- 선택지 ------------------------------------------------------- -->
    <div class="choice-list">
      <button
        v-for="(choice, idx) in questions[currentQuestionIndex].choices"
        :key="`${currentQuestionIndex}-${idx}`"
        class="choice-btn"
        :class="{ selected: selectedChoice === choice }"
        @click.stop="selectChoice(choice)"
      >
        {{ choice.label }}
      </button>
    </div>
    <!-- ── 이전 버튼 (맨아래) ─────────────────────────────────── -->
    <div class="nav-buttons">
      <button
        class="back-btn"
        @click.stop="backQuestion"
        :disabled="currentQuestionIndex === 0"
      >
        ← 이전 질문
      </button>
    </div>
  </div>
</template>

<script setup>
import api from "@/shared/api";
/* ------------------------------------------------------------------ */
/* ① 상태 & 상수                                                       */
/* ------------------------------------------------------------------ */
import { ref, onMounted, onActivated, watch, nextTick } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

// 8 가지 페르소나
const PERSONAS = [
  'turtle', // 🐢  안정추구형
  'squirrel', // 🐿️ 계획형 절약가
  'ant', // 🐜  재테크 실천가
  'owl', // 🦉  정보탐색형
  'rabbit', // 🐰  소비중심형
  'cat', // 🐱  자기표현형
  'tiger', // 🐯  성장투자형
  'penguin', // 🐧  보수적 투자형
];
// 점수판 초기화 → { turtle:0, … }
const scores = ref(Object.fromEntries(PERSONAS.map((p) => [p, 0])));
const answers = ref([]); // ⭐ 선택 기록 (되돌릴 때 사용)
const selectedChoice = ref(null); // 현재 선택된 답변
const componentKey = ref(0); // 강제 재렌더링용 키

/* ------------------------------------------------------------------ */
/* ② 질문·선택지 (10 문항 × 4 보기)                                     */
/* ------------------------------------------------------------------ */
const questions = [
  /* Q1 */
  {
    question: '친구가 추천한 카드 2개! 당신의 선택은?',
    choices: [
      { label: '디자인이 귀엽고 굿즈도 받을 수 있는 팬카드', persona: 'cat' },
      { label: '쿠팡/컬리 할인 혜택 가득한 카드', persona: 'rabbit' },
      { label: '무실적이어도 혜택은 꽤 주는 기본형 카드', persona: 'turtle' },
      { label: '직접 혜택을 구성할 수 있는 DIY 카드', persona: 'owl' },
    ],
  },
  /* Q2 */
  {
    question: '갑자기 생긴 10만 원! 당신의 선택은?',
    choices: [
      { label: '다 쓰긴 아깝다… 자유적금에 넣자', persona: 'squirrel' },
      { label: '반은 소비, 반은 펀드에 자동이체 설정', persona: 'ant' },
      { label: '이건 타이거 ETF 살 찬스지!', persona: 'tiger' },
      { label: '좋아하는 브랜드의 한정판 상품 구입', persona: 'cat' },
    ],
  },
  /* Q3 */
  {
    question: '카드 디자인이 너무 예쁜데 혜택은 별로야. 당신은?',
    choices: [
      { label: '그래도 예쁘니까 쓰고 싶다', persona: 'cat' },
      { label: '혜택이 없으면 안 사요', persona: 'rabbit' },
      { label: '혜택 분석부터 다시 해보자', persona: 'owl' },
      { label: '이런 건 고민할 필요가 없지, 패스', persona: 'turtle' },
    ],
  },
  /* Q4 */
  {
    question: '적금 고를 때 당신의 기준은?',
    choices: [
      { label: '목표 설정형, 자동이체 가능!', persona: 'squirrel' },
      { label: '우대 조건 많지만 그만큼 금리도 높음', persona: 'ant' },
      { label: 'ESG 기부 연계형 적금! 가치 있다', persona: 'cat' },
      { label: '원금 보장 + 예금자 보호는 필수', persona: 'penguin' },
    ],
  },
  /* Q5 */
  {
    question: '나는 평소 돈에 대해…',
    choices: [
      { label: '무조건 안전! 잃지 않는 게 중요', persona: 'turtle' },
      { label: '좀 불안하지만 투자 공부는 하고 있어요', persona: 'penguin' },
      { label: '돈은 굴려야 느는 것!', persona: 'tiger' },
      { label: '돈도 나를 표현하는 수단이에요', persona: 'cat' },
    ],
  },
  /* Q6 */
  {
    question: '나에게 ‘좋은 카드’란?',
    choices: [
      { label: '내가 원하는 혜택을 고를 수 있는 카드', persona: 'owl' },
      { label: '조건 없어도 기본 혜택이 탄탄한 카드', persona: 'turtle' },
      { label: '실적을 맞추면 혜택이 엄청 커지는 카드', persona: 'ant' },
      { label: '교통/통신비 할인되는 실속 카드', persona: 'rabbit' },
    ],
  },
  /* Q7 */
  {
    question: '금융 앱을 설치하면 가장 먼저 보는 건?',
    choices: [
      { label: '카드 혜택 비교 탭', persona: 'rabbit' },
      { label: '추천 예/적금 리스트', persona: 'squirrel' },
      { label: '투자 뉴스나 수익률 그래프', persona: 'tiger' },
      { label: '테마 있는 기획 카드 (굿즈, ESG 등)', persona: 'cat' },
    ],
  },
  /* Q8 */
  {
    question: '주말에 금융 관련 콘텐츠를 본다면?',
    choices: [
      { label: '카드사별 혜택 비교 영상', persona: 'owl' },
      { label: '“MZ 재테크 성공기” 인터뷰', persona: 'ant' },
      { label: '“감성 소비 브이로그”', persona: 'cat' },
      { label: '잘 안 봄... 스트레스야', persona: 'turtle' },
    ],
  },
  /* Q9 */
  {
    question: '당신의 평소 소비 습관은?',
    choices: [
      { label: '똑같은 거라도 할인받을 수 있으면 좋다', persona: 'rabbit' },
      { label: '무계획 소비는 불안하다', persona: 'squirrel' },
      { label: '비싸도 가치가 있다고 느끼면 산다', persona: 'cat' },
      { label: '지출보다는 저축이 우선이다', persona: 'turtle' },
    ],
  },
  /* Q10 */
  {
    question: '신용카드 신규 발급하려고 할 때 나는?',
    choices: [
      { label: '블로그/커뮤니티 후기까지 꼼꼼히 분석', persona: 'owl' },
      { label: '실적 조건 계산해서 얼마나 이득인지 따짐', persona: 'ant' },
      { label: '예쁜 디자인 + 팬카드 혜택이면 끝', persona: 'cat' },
      { label: '실적 복잡한 건 싫다, 깔끔한 게 좋아', persona: 'turtle' },
    ],
  },
];

/* ------------------------------------------------------------------ */
/* ③ 진척도 & 애니메이션                                               */
/* ------------------------------------------------------------------ */
const totalQuestions = questions.length;
const currentQuestionIndex = ref(0);
const animatedIndex = ref(1);

/* ------------------------------------------------------------------ */
/* ④ 로직                                                              */
/* ------------------------------------------------------------------ */

// 설문 상태 초기화 함수
function resetSurveyState() {
  scores.value = Object.fromEntries(PERSONAS.map((p) => [p, 0]));
  answers.value = [];
  currentQuestionIndex.value = 0;
  selectedChoice.value = null;
  animatedIndex.value = 1;
  componentKey.value++; // 컴포넌트 강제 재렌더링

  // DOM 요소도 강제로 초기화
  nextTick(() => {
    setTimeout(() => {
      const buttons = document.querySelectorAll('.choice-btn');
      buttons.forEach((btn) => {
        btn.blur();
        btn.classList.remove('selected');
        btn.style.backgroundColor = '';
        btn.style.color = '';
        btn.style.borderColor = '';
        btn.style.transform = '';
        btn.style.boxShadow = '';
      });
    }, 100);
  });
}
function selectChoice(choice) {
  selectedChoice.value = choice;
  setTimeout(() => {
    selectedChoice.value = null; // 선택 효과 먼저 제거
    setTimeout(() => {
      nextQuestion(choice);
    }, 50);
  }, 150); // 선택 효과 시간 단축
}

async function nextQuestion(choice) {
  // 1) 점수 누적
  scores.value[choice.persona]++;
  answers.value.push(choice); // ⭐ push

  // 2) 다음 문제 or 결과
  if (currentQuestionIndex.value < totalQuestions - 1) {
    // 선택 상태와 focus 완전 초기화
    selectedChoice.value = null;

    // DOM 업데이트 후 버튼 상태 초기화
    setTimeout(() => {
      const buttons = document.querySelectorAll('.choice-btn');
      buttons.forEach((btn) => {
        btn.blur();
        btn.classList.remove('selected');
      });
    }, 10);

    currentQuestionIndex.value++;
  } else {
    const winner = pickWinner(scores.value);
    const personaIdMap = {
      turtle: '1',
      squirrel: '2',
      ant: '3',
      owl: '4',
      rabbit: '5',
      cat: '6',
      tiger: '7',
      penguin: '8',
    };
    const winnerId = personaIdMap[winner];
    await api.patch('/user/update/persona', null, {
      params: { persona_id: winnerId },
    });
    router.push(`/${winner}`);
  }
}

function backQuestion() {
  if (currentQuestionIndex.value === 0) return;

  // 1) 마지막으로 선택한 보기 꺼내기
  const prevChoice = answers.value.pop(); // ⭐ pop
  if (prevChoice) scores.value[prevChoice.persona]--;

  // 2) 이전 문항으로 이동
  currentQuestionIndex.value--;
  selectedChoice.value = null; // 이전 질문으로 이동시 선택 초기화

  // 모든 버튼의 focus 상태 해제
  setTimeout(() => {
    const buttons = document.querySelectorAll('.choice-btn');
    buttons.forEach((btn) => btn.blur());
  }, 50);
}

function clearSelection() {
  if (selectedChoice.value) {
    selectedChoice.value = null;
    // 모든 버튼의 focus/active 상태도 제거
    setTimeout(() => {
      const buttons = document.querySelectorAll('.choice-btn');
      buttons.forEach((btn) => {
        btn.blur();
        btn.classList.remove('selected');
      });
    }, 10);
  }
}

function pickWinner(scoreObj) {
  const max = Math.max(...Object.values(scoreObj));
  const candidates = Object.entries(scoreObj)
    .filter(([, v]) => v === max)
    .map(([k]) => k);

  if (candidates.length === 1) return candidates[0];

  /* 동점 처리: 우선순위 배열 */
  const priority = [
    'turtle',
    'squirrel',
    'ant',
    'owl',
    'rabbit',
    'cat',
    'tiger',
    'penguin',
  ];
  return priority.find((p) => candidates.includes(p));
}

/* … 진행 숫자 애니메이션 (기존 방식 그대로) … */
function animateCounter() {
  const start = animatedIndex.value;
  const target = currentQuestionIndex.value + 1;
  const step = start < target ? 1 : -1;

  const interval = setInterval(() => {
    if (animatedIndex.value !== target) {
      animatedIndex.value += step;
    } else {
      clearInterval(interval);
    }
  }, 25);
}
// 컴포넌트 마운트 시 상태 초기화 및 애니메이션 시작
onMounted(() => {
  resetSurveyState();
  animateCounter();
});

// 페이지 재활성화 시에도 강제 초기화 (뒤로가기, 새로고침 등)
onActivated(() => {
  resetSurveyState();
  animateCounter();
});
watch(currentQuestionIndex, animateCounter);

// 질문이 변경될 때마다 선택 상태 초기화
watch(currentQuestionIndex, () => {
  selectedChoice.value = null;
  // DOM 업데이트 후 모든 버튼 상태 초기화
  setTimeout(() => {
    const buttons = document.querySelectorAll('.choice-btn');
    buttons.forEach((btn) => {
      btn.blur();
      btn.classList.remove('selected');
    });
  }, 0);
});
</script>

<style scoped>
/* ------------------------------------------------------------------ */
/* 기존 디자인 그대로 ------------------------------------------------- */
/* ------------------------------------------------------------------ */
.survey-wrapper {
  max-width: 800px;
  margin: 3rem auto;
  background-color: var(--bg-content);
  padding: 3rem;
  border-radius: 16px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid var(--border-light);
  transition: all 0.3s ease-in-out;
}
.progress-container {
  text-align: center;
  margin-bottom: 2.5rem;
}
.progress-text {
  font-size: var(--font-size-sm);
  font-weight: bold;
  color: var(--text-secondary);
}
.progress-bar {
  height: 6px;
  background-color: var(--border-light);
  border-radius: 6px;
  margin-top: 6px;
  position: relative;
}
.progress-bar-fill {
  height: 6px;
  background-color: var(--color-dark);
  border-radius: 6px;
  position: absolute;
  top: 0;
  left: 0;
  transition: width 0.5s ease;
}
.question {
  text-align: center;
  margin-bottom: 2rem;
}
.question h2 {
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--color-dark);
  margin-bottom: 1.5rem;
  position: relative;
  display: inline-block;
  padding-bottom: 0.4rem;
}
.choice-list {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.2rem;
  margin-top: 1rem;
}
.choice-btn {
  width: 100%;
  max-width: 500px;
  padding: 1rem 1.5rem;
  background-color: var(--color-white);
  color: var(--text-primary);
  font-size: var(--font-size-base);
  border-radius: 12px;
  border: 1px solid var(--border-light);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s ease, background-color 0.2s ease;
  text-align: center;
  cursor: pointer;
  outline: none; /* focus outline 제거 */
}

/* 기본 상태에서만 hover 효과 적용 */
.choice-btn:not(.selected):hover {
  background-color: #f0fdf4;
  transform: scale(1.02);
  border-color: #4caf50;
  box-shadow: 0 4px 16px rgba(76, 175, 80, 0.2);
}

/* focus, active 상태 초기화 */
.choice-btn:focus,
.choice-btn:active {
  outline: none;
  background-color: var(--color-white);
  border-color: var(--border-light);
  transform: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

/* 선택된 상태가 가장 우선순위 */
.choice-btn.selected {
  background-color: #4caf50 !important;
  color: white !important;
  border-color: #4caf50 !important;
  transform: scale(1.02) !important;
  box-shadow: 0 4px 16px rgba(76, 175, 80, 0.3) !important;
}
/* ── “이전 질문” 버튼 스타일 ─────────────────────────────────────── */
.nav-buttons {
  margin-top: 2.5rem;
  display: flex;
  justify-content: center;
}
.back-btn {
  padding: 0.6rem 1.4rem;
  font-size: 0.9rem;
  font-weight: 500;
  border-radius: 8px;
  border: 1px solid var(--border-light);
  background: var(--color-white);
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}
.back-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.back-btn:not(:disabled):hover {
  background-color: #f9f9f9;
  border-color: var(--color-dark);
}
</style>
