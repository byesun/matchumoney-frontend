<template>
  <div
    class="chatbot-container"
    ref="containerRef"
    :style="containerStyle"
    :class="{ dragging: isDragging }"
  >
    <button
      class="chat-toggle"
      @click="onToggleClick"
      @touchstart="onTouchStart"
      @touchmove.prevent="onTouchMove"
      @touchend="onTouchEnd"
      :class="{ blurred: isOpen }"
    >
      <img src="@/assets/chatbot_images/chatbot_cat.png" alt="챗봇 버튼" />
    </button>
    <transition name="chat-fade">
      <div class="chat-window" v-if="isOpen">
        <div class="chat-header">
          <span class="chat-title" @click="toggleChat">맞추머니 챗봇</span>
          <div class="chat-actions">
            <button class="chat-btn" @click="clearMessages" title="대화 초기화">
              대화 지우기
            </button>
            <button class="chat-btn" @click="toggleChat" title="닫기">✖</button>
          </div>
        </div>

        <div class="chat-body" ref="chatBody">
          <div
            v-for="(msg, index) in messages"
            :key="index"
            :class="['message-wrapper', msg.role]"
          >
            <img
              v-if="msg.role === 'bot'"
              class="avatar"
              src="@/assets/chatbot_images/chatbot_cat.png"
              alt="챗봇 프로필"
            />
            <div v-if="msg.role === 'loading'" class="spinner"></div>
            <div
              v-else
              v-html="formattedContent(msg.content)"
              class="message"
              :class="msg.role"
            ></div>
          </div>

          <!-- 빠른 버튼 -->
          <div class="quick-buttons">
            <transition-group name="fade-up" tag="div">
              <button
                v-for="(btn, i) in visibleButtons"
                :key="btn"
                class="quick-btn"
                :class="submenuMap[btn] ? 'main-menu' : 'sub-menu'"
                @click="handleQuickButtonClick(i)"
              >
                {{ btn }}
              </button>
            </transition-group>
          </div>
          <!-- quick-buttons 바로 아래 쪽에 추가 -->
          <div class="cta-buttons" v-if="ctas.length">
            <button
              v-for="(c, i) in ctas"
              :key="i"
              class="cta-button"
              @click="goRoute(c.route)"
            >
              {{ c.label }}
            </button>
          </div>
        </div>

        <div class="chat-input">
          <input
            v-model="input"
            @keyup.enter="sendMessage"
            placeholder="궁금한 내용을 입력해주세요."
          />
          <button @click="sendMessage">
            <img src="@/assets/chatbot_images/send-button.png" alt="전송" />
          </button>
        </div>
      </div>
    </transition>
  </div>
</template>
<script setup>
import { ref, nextTick, onMounted, onBeforeUnmount, computed } from 'vue';
import { useRouter } from 'vue-router';

import chatbotApi from '@/modules/chatbot/api/chatbot';

const router = useRouter();
// 상태 섹션
const selectedCardType = ref(null); // '신용카드' | '체크카드' | null
// 카드 타입 선택 옵션
const CARD_TYPE_OPTIONS = ['신용카드', '체크카드'];
/* ========== 상태 ========== */
const chatBody = ref(null);
const isOpen = ref(false);
const input = ref('');
const showGreeting = ref(false);
const submenuIntro = ref('');
const visibleButtons = ref([]);
const messages = ref([]);
const isLoading = ref(false);
const currentParentMenu = ref(null);
// 상태 섹션에 추가
const isMenuTransitioning = ref(false); // 중복 클릭 방지
const lastExplainedTerm = ref(null); // 최근 설명한 용어 저장

/* ========== 모바일 드래그 위치 설정 (≤480px에서만) ========== */
const containerRef = ref(null);
const isDragging = ref(false);
const isLongPress = ref(false);
const suppressNextToggle = ref(false);
const longPressTimer = ref(null);
const startTouch = ref({ x: 0, y: 0 });
const startRect = ref({ left: 0, top: 0 });
const customPos = ref({ left: null, top: null }); // px 단위
const hasCustomPos = ref(false);
const isMobile = ref(false);

const containerStyle = computed(() => {
  // 데스크톱/태블릿 또는 커스텀 위치가 없으면 기존 스타일 유지 (빈 객체 반환)
  if (!isMobile.value || !hasCustomPos.value || customPos.value.left === null)
    return {};
  // 모바일에서만 left/top 지정하여 고정
  return {
    position: 'fixed',
    left: customPos.value.left + 'px',
    top: customPos.value.top + 'px',
    right: 'auto',
    bottom: 'auto',
  };
});

const getBtnSize = () => {
  // 모바일 사이즈에서의 토글 크기와 여백을 감안해 실제 버튼 크기 산정
  const btnEl = containerRef.value?.querySelector('.chat-toggle');
  const rect = btnEl?.getBoundingClientRect?.();
  return rect ? { w: rect.width, h: rect.height } : { w: 56, h: 56 };
};

const clamp = (val, min, max) => Math.min(Math.max(val, min), max);

const onTouchStart = (e) => {
  if (!isMobile.value) return;
  const t = e.touches[0];
  startTouch.value = { x: t.clientX, y: t.clientY };
  const rect = containerRef.value?.getBoundingClientRect?.();
  if (rect) startRect.value = { left: rect.left, top: rect.top };
  isLongPress.value = false;
  isDragging.value = false;
  if (longPressTimer.value) clearTimeout(longPressTimer.value);
  // 250ms 길게 누르면 드래그 시작
  longPressTimer.value = setTimeout(() => {
    isLongPress.value = true;
    isDragging.value = true;
    suppressNextToggle.value = true; // 드래그 뒤 클릭 토글 방지
  }, 250);
};

const onTouchMove = (e) => {
  if (!isMobile.value) return;
  if (!isLongPress.value || !isDragging.value) return;
  const t = e.touches[0];
  const dx = t.clientX - startTouch.value.x;
  const dy = t.clientY - startTouch.value.y;
  const btn = getBtnSize();
  const maxLeft = window.innerWidth - btn.w - 8; // 가장자리 8px 여백
  const maxTop = window.innerHeight - btn.h - 8;
  const newLeft = clamp(startRect.value.left + dx, 8, maxLeft);
  const newTop = clamp(startRect.value.top + dy, 8, maxTop);
  customPos.value = { left: newLeft, top: newTop };
  hasCustomPos.value = true;
};

const onTouchEnd = () => {
  if (!isMobile.value) return;
  if (longPressTimer.value) {
    clearTimeout(longPressTimer.value);
    longPressTimer.value = null;
  }
  if (isDragging.value) {
    // 저장 (세션 유지)
    try {
      localStorage.setItem('chatbot_pos_v1', JSON.stringify(customPos.value));
    } catch (_) {}
  }
  // 드래그 종료 후 살짝 딜레이 뒤 클릭 허용
  setTimeout(() => {
    suppressNextToggle.value = false;
  }, 150);
  isDragging.value = false;
  isLongPress.value = false;
};

const onToggleClick = (e) => {
  if (suppressNextToggle.value) return; // 드래그 직후 클릭 차단
  toggleChat();
};

onMounted(() => {
  const updateMobile = () => (isMobile.value = window.innerWidth <= 480);
  updateMobile();
  window.addEventListener('resize', updateMobile);
  try {
    const saved = localStorage.getItem('chatbot_pos_v1');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (typeof parsed?.left === 'number' && typeof parsed?.top === 'number') {
        customPos.value = parsed;
        hasCustomPos.value = true;
      }
    }
  } catch (_) {}
});

onBeforeUnmount(() => {
  if (longPressTimer.value) clearTimeout(longPressTimer.value);
});

/* CTA 버튼 (말풍선 밖) */
const ctas = ref([]); // [{ label, route }]
const goRoute = async (route) => {
  // 챗봇 닫으면서 완전 초기화
  isOpen.value = false;
  clearButtonTimers();
  ctas.value = [];
  messages.value = [];
  visibleButtons.value = [];
  currentParentMenu.value = null;
  await router.push(route);
};

// 용어 기본 설명 + 후속 버튼 노출
const explainTerm = async (term) => {
  lastExplainedTerm.value = term;
  await sendBotMessage(`<strong>${term}</strong>에 대해 쉽게 설명해드릴게요!`);
  const answer = await fetchDefinitionFromGPT(term);
  await sendBotMessage(answer);

  // 후속 질문 + 버튼(계속 반복 가능)
  await sendBotMessage(
    '혹시 이해가 덜 되셨나요? 원하시면 더 쉽게 다시 설명해드릴게요.'
  );
  scheduleButtons(['더 쉽게 설명해줘', '괜찮아요'], {
    clear: true,
    base: 600,
    step: 160,
  });
};

// 더 쉬운 설명 + 후속 버튼 재노출(무한 루프)
const explainTermSimpler = async () => {
  const term = lastExplainedTerm.value;
  if (!term) return;

  await sendBotMessage('좋아요. 더 쉬운 비유로 다시 설명할게요.');
  const simpler = await fetchSimplerDefinitionFromGPT(term);
  await sendBotMessage(simpler);

  await sendBotMessage('조금 더 낫나요? 필요하면 한 번 더 쉽게 풀어드릴게요.');
  scheduleButtons(['더 쉽게 설명해줘', '괜찮아요'], {
    clear: true,
    base: 600,
    step: 160,
  });
};

// 1) 즉시 출력용 헬퍼
const showBotMessageImmediate = (content) => {
  messages.value.push({ role: 'bot', content });
  scrollToBottom();
};

/* 속도/타이머 */
const TYPING_DELAY_MS = 35; // 빠르게
const buttonTimers = ref([]);
const clearButtonTimers = () => {
  buttonTimers.value.forEach((id) => clearTimeout(id));
  buttonTimers.value = [];
};
// ⬇️ 버튼들을 순차(스태거)로 보여주는 공통 함수
const scheduleButtons = (
  items,
  { clear = true, base = 800, step = 220 } = {}
) => {
  if (clear) visibleButtons.value = [];
  items.forEach((item, i) => {
    const id = setTimeout(() => {
      visibleButtons.value.push(item);
    }, base + i * step);
    buttonTimers.value.push(id);
  });
};

// <script setup> 상단 함수들 있는 곳에 추가
const clearMessages = async () => {
  // 필요하면 confirm 추가
  // if (!confirm('대화를 모두 지울까요?')) return;

  clearButtonTimers();
  ctas.value = [];
  visibleButtons.value = [];
  currentParentMenu.value = null;
  messages.value = [];

  // 처음 상태로 인사 + 상위 버튼 노출
  showBotMessageImmediate(
    `안녕하세요. <strong>맞추머니 챗봇</strong>입니다! 무엇을 도와드릴까요?`
  );
  scheduleButtons(allButtons, { clear: true, base: 800, step: 220 });
  scrollToBottom();
};

/* ========== 데이터 ========== */
const systemPrompt =
  'chatgpt.chatbot-prompt=너는 금융 전문가야. 사용자가 금융 관련 질문(예: 금융 용어, 예·적금, 대출, 신용, 재테크, 금융 정책, 금리 등)을 하면 초보자도 이해할 수 있도록 친절하고 정확하게, 간결하고 짧게 설명해. 금융과 무관한 질문(예: 연예, 게임, 연애, 역사, 날씨, 잡담, 기술, 철학 등)이 들어오면 "죄송합니다. 이 챗봇은 금융 관련 질문에만 답변할 수 있습니다."라고만 응답해. 절대로 다른 주제에 대해 추측하거나 답하지 마. 답변은 반드시 다음 형식을 따라야 해: 1. 번호나 글머리(-) 기호로 구조화 2. 중요한 키워드는 **굵게** 3. 금융 용어는 처음 등장 시 괄호로 설명 4. 복잡한 개념은 쉬운 예시나 비유로 5. 어려운 전문 용어는 피하거나 쉽게 풀어 쓸 것 6. 금융 외 질문은 위 문장으로만 응답할 것.';

const allButtons = [
  '서비스 이용방법',
  '금융 용어 물어보기',
  '페르소나 유형 설명',
  '카드 추천받기',
  '예금 추천받기',
  '적금 추천받기',
];

const submenuMap = {
  '서비스 이용방법': [
    '페르소나 기반 추천',
    '마이데이터 기반 추천',
    '상품 비교 기능',
    '금융 퀴즈',
    '금융 교육 게시판',
  ],
  '금융 용어 물어보기': [
    '금리',
    '원리금',
    '만기',
    '적립식',
    '거치식',
    '복리',
    '단리',
    '신용등급',
    '상환',
    '연체',
    '수수료',
    '중도상환',
    '예금자보호',
  ],
  '페르소나 유형 설명': [
    '🐢 거북이 유형',
    '🐿️ 다람쥐 유형',
    '🐜 개미 유형',
    '🦉 부엉이 유형',
    '🐰 토끼 유형',
    '🐱 고양이 유형',
    '🐯 호랑이 유형',
    '🐧 펭귄 유형',
  ],
  '카드 추천받기': [
    '카페',
    '음식점',
    '교통',
    '쇼핑',
    '온라인구매',
    '편의점',
    '영화',
    '주유',
    '해외결제',
    '통신비',
    '공과금',
  ],
  '예금 추천받기': [
    '단기 여유자금',
    '결혼자금(예금)',
    '노후자금',
    '상여금 굴리기',
    '안전한 목돈관리',
  ],
  '적금 추천받기': [
    '여행자금',
    '자취비용',
    '비상금',
    '결혼자금(적금)',
    '신혼집 자금',
  ],
};

const serviceLinks = {
  '페르소나 기반 추천': '/persona/start',
  '마이데이터 기반 추천': '/mydata/cards',
  '상품 비교 기능': '/compare',
  '금융 퀴즈': '/quiz',
  '금융 교육 게시판': '/education/video',
};

const quickButtonPrompts = {
  '서비스 이용방법':
    '이 플랫폼은 사용자의 금융 생활을 돕기 위해 다양한 기능을 제공합니다. 아래는 주요 서비스입니다. 궁금한 항목을 선택해주세요:\n\n- 페르소나 기반 추천\n- 마이데이터 기반 추천\n- 상품 비교 기능\n- 금융 퀴즈\n- 금융 교육 게시판',
  '페르소나 기반 추천':
    '페르소나 기반 추천:\n사용자의 금융 성향을 분석하여 8가지 동물 유형 중 하나로 분류하고, 이에 맞는 예금/적금/카드 상품을 추천해드립니다. 페르소나는 소비 성향, 자산 목표 등을 기반으로 설정되며, 마이페이지에서 수정 가능합니다.',
  '마이데이터 기반 추천':
    '마이데이터 기반 추천:\n사용자의 소비 내역, 적금·예금 이력 등을 분석하여 개인화된 금융상품을 추천합니다. 연동된 내역을 기반으로 자동 분석되며, 나의 실제 소비에 맞는 추천을 받을 수 있습니다.',
  '상품 비교 기능':
    '상품 비교 기능:\n카드, 예금, 적금 등 관심 있는 상품을 최대 3개까지 선택해 주요 조건(금리, 수수료, 실적 등)을 한눈에 비교할 수 있습니다. 필터링과 정렬 기능도 함께 제공됩니다.',
  '금융 퀴즈':
    '금융 퀴즈:\nO/X 및 객관식 문제를 통해 금융 지식을 재미있게 학습할 수 있습니다. 정답 시 해설과 경험치가 주어지며, 레벨 시스템과 뱃지 보상도 제공됩니다.',
  '금융 교육 게시판':
    '금융 교육 게시판:\n금융감독원 Open API를 통해 제공되는 다양한 금융 교육 콘텐츠를 주제별로 학습할 수 있습니다. 제목 검색 및 카테고리 필터링 기능도 제공됩니다.',
  '금융 용어 물어보기':
    "복리, 단리, 연 이율, 우대금리, DSR, 신용등급 등 초보자가 어려워하는 금융 용어들을 친절하고 쉬운 예시와 함께 설명해줘. 예: '복리'는 무엇이고 어떤 상품에서 적용되며 왜 중요한가요?",
  '페르소나 유형 설명':
    '아래 중 자신의 성향에 가장 가까운 동물을 선택해주세요:\n\n- 🐢 거북이 유형\n- 🐿️ 다람쥐 유형\n- 🐜 개미 유형\n- 🦉 부엉이 유형\n- 🐰 토끼 유형\n- 🐱 고양이 유형\n- 🐯 호랑이 유형\n- 🐧 펭귄 유형',
  // (동물 설명은 아래 personaDescriptions 사용)
  '카드 추천받기':
    '주로 어떤 분야에 소비가 많은가요? 아래에서 선택하거나 직접 입력해주세요.\n\n예: 카페, 음식점, 교통, 쇼핑, 온라인구매, 편의점, 영화, 주유, 해외결제, 통신비, 공과금 등',
  카페: '☕ 카페 소비가 많으시군요! 커피 프랜차이즈 위주 할인 카드들을 추천해드릴게요.\n- 스타벅스, 이디야 등 할인\n- 월 실적 30만원 이상\n- 연회비 1만원 이하\n\n→ [추천 카드 보기]',
  음식점:
    '🍽️ 외식이 잦으시군요! 주요 음식점 브랜드에서 혜택이 있는 카드 추천드립니다.\n\n→ [추천 카드 보기]',
  교통: '🚌 교통비 중심 소비군요! 대중교통/택시 할인 카드 알려드릴게요.\n\n→ [추천 카드 보기]',
  쇼핑: '🛍️ 쇼핑 중심 소비자라면 온라인몰 또는 백화점 제휴 카드가 적합해요.\n\n→ [추천 카드 보기]',
  온라인구매:
    '💻 쿠팡, G마켓 등 온라인 결제 혜택이 많은 카드 추천드립니다.\n\n→ [추천 카드 보기]',
  편의점:
    '🏪 CU, GS25 등에서 할인 가능한 카드 추천드립니다.\n\n→ [추천 카드 보기]',
  영화: '🎬 영화관 할인 위주 카드 추천드립니다.\n\n→ [추천 카드 보기]',
  주유: '⛽ 주유소 리터당 할인 카드, GS칼텍스 제휴 등을 포함한 추천을 드릴게요.\n\n→ [추천 카드 보기]',
  해외결제:
    '🌍 해외 직구나 여행 시 환율 우대와 캐시백이 있는 카드 추천드립니다.\n\n→ [추천 카드 보기]',
  통신비:
    '📱 통신요금 자동이체 시 할인되는 카드 추천드립니다.\n\n→ [추천 카드 보기]',
  공과금:
    '💡 도시가스, 전기, 수도 요금 자동이체 할인 카드 추천드립니다.\n\n→ [추천 카드 보기]',
  '예적금 추천받기':
    '예금과 적금 중 어떤 상품을 추천받고 싶으신가요?\n\n- 예금 추천받기\n- 적금 추천받기',
  '예금 추천받기':
    '예금 상품은 일정 금액을 한 번에 예치하고 만기까지 보관하는 상품입니다. 예금 목적을 알려주세요.\n\n예: 단기 여유자금, 결혼자금, 노후자금, 상여금 굴리기, 안전한 목돈관리 등',
  '단기 여유자금':
    '💸 단기 운용 목적의 고금리 예금 상품을 추천해드립니다.\n- 3~6개월 상품\n- 중도해지 가능\n- 우대조건 간단\n\n→ [추천 상품 보기]',
  '결혼자금(예금)':
    '💍 장기 자금 마련용 예금 추천드립니다.\n- 12~24개월 고정금리\n- 급여이체 우대\n\n→ [추천 상품 보기]',
  노후자금:
    '👵 노후대비 자산관리용 예금 추천드립니다.\n- 안전성 중시\n- 고령자 전용 상품도 포함\n\n→ [추천 상품 보기]',
  '상여금 굴리기':
    '💼 상여금이나 보너스를 3~6개월 안전하게 굴릴 수 있는 상품을 추천합니다.\n\n→ [추천 상품 보기]',
  '안전한 목돈관리':
    '🔒 원금보장과 예금자 보호 대상 고금리 정기예금 위주로 추천드립니다.\n\n→ [추천 상품 보기]',
  '적금 추천받기':
    '적금은 매달 일정 금액을 적립하며 목돈을 만드는 상품입니다. 적금 목표를 알려주세요.\n\n예: 여행자금, 자취비용, 비상금, 결혼자금, 신혼집 자금 등',
  여행자금:
    '✈️ 여행 경비 마련을 위한 적금 상품 추천드립니다.\n- 6~12개월 단기 적립식\n- 우대조건: 앱 로그인, 자동이체\n\n→ [추천 상품 보기]',
  자취비용:
    '🏠 월세 및 생활비 준비용 적금 상품 추천드립니다.\n\n→ [추천 상품 보기]',
  비상금:
    '🚨 급할 때를 대비한 짧은 적금 상품 추천드립니다.\n- 자유적립식\n- 중도해지 수수료 적음\n\n→ [추천 상품 보기]',
  '결혼자금(적금)':
    '💍 장기 계획으로 결혼 자금을 모으는 적금 추천드립니다.\n- 24개월 이상 고정 금리\n\n→ [추천 상품 보기]',
  '신혼집 자금':
    '🏡 전세자금/청약과 병행 가능한 적금 상품을 안내드립니다.\n\n→ [추천 상품 보기]',
};

/* 페르소나: 라벨 → 코드/설명 */
const personaCodeMap = {
  '🐢 거북이 유형': 'turtle',
  '🐿️ 다람쥐 유형': 'squirrel',
  '🐜 개미 유형': 'ant',
  '🦉 부엉이 유형': 'owl',
  '🐰 토끼 유형': 'rabbit',
  '🐱 고양이 유형': 'cat',
  '🐯 호랑이 유형': 'tiger',
  '🐧 펭귄 유형': 'penguin',
};
const personaDescriptions = {
  '🐢 거북이 유형':
    '‘안정추구형’에 해당하는 거북이 유형은 손실 회피, 안정, 무실적, 예금 선호의 성향을 가지고 있습니다. 매우 조심스럽고 느릿하지만 꾸준한 성격으로, 원금 손실에 극도로 민감하여 리스크가 없는 안전한 금융상품을 선호합니다. 예금자 보호가 되는 상품, 고정금리 예금, 실적 조건이 없는 카드에 관심이 많으며, 손해만 보지 않으면 된다는 신념을 가지고 있습니다. 이러한 성향 때문에 장기적으로 수익률은 낮을 수 있으나, 꾸준히 자산을 쌓는 데에는 강점을 보입니다.',
  '🐿️ 다람쥐 유형':
    '‘계획형 절약가’인 다람쥐 유형은 계획적 저축, 자동이체, 목표 설정을 중요시하는 사람입니다. 다람쥐가 겨울을 대비해 먹이를 하나하나 모으듯, 이 유형은 뚜렷한 저축 목표를 가지고 있고 이를 달성하기 위한 자동이체, 장기 납입 습관 등을 잘 실천합니다. 무계획 소비는 불안하게 여기며, 소비보다는 저축 중심의 금융 행동을 보입니다. 주로 자동이체 우대금리 상품이나 목표 설정형 적금을 선호합니다.',
  '🐜 개미 유형':
    '‘재테크 실천가’인 개미 유형은 실천력, 실적 리워드, 자유 적금과 같은 키워드로 설명할 수 있으며, 단순히 정보를 수집하는 데 그치지 않고 실제로 금융 혜택을 적극적으로 챙기는 성향을 가집니다. 실적을 채워 리워드를 받는 카드, 자유롭게 입금 가능한 적금, 포인트 적립이나 투자형 상품에도 관심이 많으며, 재테크 성공기를 자주 참고하고 실천으로 옮깁니다. 금융 행동이 능동적이고 전략적인 것이 특징입니다.',
  '🦉 부엉이 유형':
    '‘정보탐색형’인 부엉이는 분석, 비교, 맞춤형 혜택을 추구하는 성향으로, 금융상품을 고를 때 수수료, 조건, 혜택 등을 꼼꼼히 비교하고 분석합니다. 카드사별 혜택 비교, 커뮤니티 후기, 상품 상세 조건 등을 철저하게 살피며, 본인에게 가장 최적인 상품을 찾아내는 데 집중합니다. DIY 카드처럼 본인이 혜택을 구성할 수 있는 유연한 상품을 선호하고, 정보 탐색과 비교 분석이 곧 소비라고 여깁니다.',
  '🐰 토끼 유형':
    '‘소비중심형’에 해당하는 토끼 유형은 할인, 이커머스, 소비 혜택을 가장 중시하는 사람으로, 쇼핑 시 할인 폭이 크고 사용이 편한 카드를 선호합니다. 쿠팡, 마켓컬리, 배달의민족 등과 연계된 할인 혜택, 캐시백, 적립형 카드에 매력을 느끼며, 소비 자체를 즐기는 편입니다. 소비에서 만족감을 얻고 다양한 플랫폼을 활용해 생활비를 절약하려는 실용적인 경향을 보입니다.',
  '🐱 고양이 유형':
    '‘자기표현형’인 고양이는 디자인, 감성소비, 팬심을 중요하게 여깁니다. 돈을 단순한 거래 수단이 아니라 자신의 취향과 감성을 표현하는 수단으로 여기며, 예쁜 카드 디자인이나 아이돌 굿즈가 연계된 팬카드, 한정판 상품 등 감성적이고 개성적인 요소에 끌립니다. 혜택보다도 내가 만족하는 것이 중요한 기준이며, 소비를 통해 자신의 정체성과 취향을 드러내는 경향이 강합니다.',
  '🐯 호랑이 유형':
    '‘성장투자형’인 호랑이 유형은 고수익 투자, 주식, ETF 등 고위험·고수익 상품을 선호하며, 돈은 굴려야 불어난다는 투자 철학을 가지고 있습니다. 위험을 감수하더라도 더 큰 수익을 위해 주식, ETF, 포인트 투자 등의 금융상품을 활발히 활용하며, 금융 뉴스와 투자 정보를 꾸준히 확인합니다. 투자 공부에도 적극적이며, 수익률 그래프나 펀드 성과를 꼼꼼히 보는 성향이 있습니다.',
  '🐧 펭귄 유형':
    '‘보수적 투자형’인 펭귄은 보험, 생활보장, 안정성 있는 투자를 중요시하며, 위험을 완전히 피하지는 않되 가능한 한 방어적인 태도를 유지합니다. 실손 보험, 생활보장형 카드, 복합 혜택이 포함된 상품을 통해 삶의 리스크를 최소화하려 하며, 투자보다는 자산 보호와 현금 흐름 관리에 초점을 맞춥니다. 감정적인 소비나 고위험 투자에는 부담을 느끼며, 건강이나 생활안정 같은 현실적인 요소를 고려한 금융상품을 선호합니다.',
};

/* ========== 유틸 ========== */
const scrollToBottom = () => {
  nextTick(() => {
    setTimeout(() => {
      if (chatBody.value)
        chatBody.value.scrollTop = chatBody.value.scrollHeight;
    }, 50);
  });
};
const fetchDefinitionFromGPT = async (term) => {
  try {
    const reply = await chatbotApi.define(term);
    return reply && reply.length ? reply : '설명을 가져올 수 없었습니다.';
  } catch (e) {
    console.error(e);
    return '설명을 가져올 수 없었습니다.';
  }
};

const fetchSimplerDefinitionFromGPT = async (term) => {
  try {
    const reply = await chatbotApi.defineSimple(term);
    return reply && reply.length
      ? reply
      : '더 쉽게 설명을 가져올 수 없었습니다.';
  } catch (e) {
    console.error(e);
    return '더 쉽게 설명을 가져올 수 없었습니다.';
  }
};

const formattedContent = (text) => {
  if (!text) return '';
  if (/<[a-z][\s\S]*>/i.test(text)) return text; // HTML 포함 시 그대로
  if (text.includes('\n')) return text.replace(/\n/g, '<br />');
  const sentences = text.split(/(?<=[.?!])\s+/);
  let result = '';
  for (let i = 0; i < sentences.length; i++) {
    result += sentences[i];
    result += (i + 1) % 2 === 0 ? '<br />' : ' ';
  }
  return result;
};
/* 신용카드 매핑 */
const cardCreditMap = {
  카페: {
    id: 14, // 신한카드 YOLO ⓘ
    name: '신한카드 YOLO ⓘ',
    summary:
      '☕ 카페·외식 등 일상 여가 소비에 초점을 맞춘 라인업입니다.\n' +
      '브랜드가 고정되지 않아 동선 따라 자유롭게 쓰기 좋고, 소액 결제도 꼼꼼히 적립/할인이 누적돼요.\n' +
      '실적 피로감이 낮아 “매일 한두 잔” 같은 루틴에서도 혜택을 체감하기 쉽습니다.\n' +
      '결론: 카페/외식 중심의 가벼운 라이프스타일에 맞춘 실속 카드.',
  },
  음식점: {
    id: 477, // 신한카드 Deep Taking
    name: '신한카드 Deep Taking',
    summary:
      '🍽️ 외식·배달 소비가 잦다면 결제할 때마다 체감 절약을 주는 구성입니다.\n' +
      '배달앱/프랜차이즈/동네 식당 등 범용성이 높아 식사 동선에 맞춰 혜택을 챙기기 쉬워요.\n' +
      '결론: “밖에서 먹고, 가끔 배달” 패턴에 딱 맞춘 식사 전용 카드.',
  },
  교통: {
    id: 2559, // K-패스 (신용)
    name: 'K-패스 (신용)',
    summary:
      '🚌 대중교통/택시 중심 이동 패턴을 겨냥한 교통 특화 카드입니다.\n' +
      '출퇴근 고정비를 안정적으로 낮춰주고, 소액 결제라도 매일 쌓이는 누적 절감이 큽니다.\n' +
      '결론: “교통비가 고정비”인 분에게 확실한 효용.',
  },
  쇼핑: {
    id: 2687, // 카드의정석 SHOPPING+
    name: '카드의정석 SHOPPING+',
    summary:
      '🛍️ 온·오프라인 쇼핑 전반을 넓게 커버하는 할인가드입니다.\n' +
      '대형마트/편의점/드럭스토어/패션몰 등 생활 쇼핑을 한 장으로 정리하기 좋아요.\n' +
      '결론: 생활형 쇼핑을 폭넓게 쓰는 이용자에게 균형 좋은 선택.',
  },
  온라인구매: {
    id: 2609, // 쿠팡 와우카드
    name: '쿠팡 와우카드',
    summary:
      '💻 쿠팡 중심의 온라인 쇼핑에 최적화된 카드입니다.\n' +
      '생필품부터 가전까지 온라인 장바구니 비중이 클수록 체감 절약이 커져요.\n' +
      '결론: “와우 회원 + 온라인 일상구매” 조합에 특히 효율적.',
  },
  편의점: {
    id: 52, // 삼성카드 taptap S
    name: '삼성카드 taptap S',
    summary:
      '🏪 편의점/생활형 소액 결제에 강한 구성입니다.\n' +
      '브랜드 고정도가 낮아 CU·GS25·세븐일레븐 등 동선대로 써도 혜택을 챙기기 쉬워요.\n' +
      '결론: “자잘하지만 자주” 결제 패턴에서 빛나는 카드.',
  },
  영화: {
    id: 2371, // 신한카드 플리
    name: '신한카드 플리',
    summary:
      '🎬 영화/OTT/엔터테인먼트 소비를 모아 혜택을 주는 구성입니다.\n' +
      '주말 관람, OTT 정기결제 등 여가 루틴과 결합하면 체감 절약이 커져요.\n' +
      '결론: 콘텐츠 소비가 일상인 분에게 적합한 엔터 특화 카드.',
  },
  주유: {
    id: 16, // 신한카드 RPM+ Platinum#
    name: '신한카드 RPM+ Platinum#',
    summary:
      '⛽ 리터당 혜택 구조로 주행거리가 길수록 효익이 커지는 주유 특화 카드입니다.\n' +
      '세차/편의시설 결제와도 자연스럽게 어우러져 “차 생활 전반” 비용을 낮출 수 있어요.\n' +
      '결론: 출퇴근/장거리 운전에 실속 있는 주유 전용 선택.',
  },
  해외결제: {
    id: 12, // 신한카드 Air Platinum#
    name: '신한카드 Air Platinum#',
    summary:
      '🌍 해외 온·오프 결제/여행 사용성까지 고려한 트래블 라인업입니다.\n' +
      '항공/여행 결제 루틴과 결합하면 총소유비용(TCO)을 눈에 띄게 낮출 수 있어요.\n' +
      '결론: 해외직구 + 여행을 함께 즐기는 사용자에게 최적.',
  },
  통신비: {
    id: 41, // 신한카드 Deep On Platinum+
    name: '신한카드 Deep On Platinum+',
    summary:
      '📱 통신요금/디지털 구독 결제 등 “고정 구독형 지출”을 겨냥한 구성입니다.\n' +
      '자동이체로 세팅해두면 손 댈 일 없이 월 고정비를 줄일 수 있어요.\n' +
      '결론: 통신·구독을 묶어 관리하는 분에게 효율적인 카드.',
  },
  공과금: {
    id: 13, // 신한카드 Mr.Life
    name: '신한카드 Mr.Life',
    summary:
      '💡 전기/가스/수도 등 공과금과 생활요금 최적화에 특화된 카드입니다.\n' +
      '월 고정비 비중이 높을수록 체감 절약이 크게 누적돼요.\n' +
      '결론: 생활비 구조가 단단한 가구의 “고정비 절감” 카드.',
  },
};

/* 체크카드 매핑 */
const cardCheckMap = {
  카페: {
    id: 646, // 신한카드 Deep Dream 체크(미니언즈)
    name: '신한카드 Deep Dream 체크(미니언즈)',
    summary:
      '☕ 소액 카페 결제를 자주 하는 사용자에게 잘 맞는 체크카드입니다.\n' +
      '프랜차이즈/개인 카페를 가리지 않고 일상 결제에서 폭넓게 쓰기 쉬워요.\n' +
      '결론: “작지만 자주” 결제 패턴에 충실한 체크 선택.',
  },
  음식점: {
    id: 351, // 스타체크카드
    name: '스타체크카드',
    summary:
      '🍽️ 외식·간식 등 식사 동선에서 가볍게 쓰기 좋은 범용형 체크카드입니다.\n' +
      '한 장으로 일상 결제를 정리하고 싶은 사용자에게 무난해요.\n' +
      '결론: 외식 비중이 높은 분의 기본기 체크.',
  },
  교통: {
    id: 2422, // 노리2 체크카드(KB Pay)
    name: '노리2 체크카드(KB Pay)',
    summary:
      '🚌 대중교통/택시 등 이동비 지출에 초점을 맞춘 생활형 체크카드입니다.\n' +
      '출퇴근 고정비에 충실해 매달 체감 절약을 주기 좋아요.\n' +
      '결론: 교통비 최적화가 필요한 통근족에게 적합.',
  },
  쇼핑: {
    id: 2810, // 더 심플 체크카드
    name: '더 심플 체크카드',
    summary:
      '🛍️ 온·오프 쇼핑을 가볍게 커버하는 기본형 체크입니다.\n' +
      '복잡한 실적 관리 없이 일상 결제에서 두루 쓰기 좋아요.\n' +
      '결론: “간단하게 한 장”을 원하는 사용자에게 추천.',
  },
  온라인구매: {
    id: 286, // 카카오페이 신한 체크카드
    name: '카카오페이 신한 체크카드',
    summary:
      '💻 카카오페이/간편결제 중심 온라인 쇼핑에 강점이 있는 체크카드입니다.\n' +
      '모바일 결제 루틴과 궁합이 좋아 스마트폰 하나로 소비를 정리할 수 있어요.\n' +
      '결론: 간편결제/온라인 중심 소비자에게 최적.',
  },
  편의점: {
    id: 2749, // ONE 체크카드
    name: 'ONE 체크카드',
    summary:
      '🏪 편의점/생활 소액 결제를 넓게 커버하는 범용형 체크카드입니다.\n' +
      '브랜드 제한이 낮아 동선 따라 쓰기 좋아요.\n' +
      '결론: 자잘한 결제가 잦은 사용자에게 실속 있는 카드.',
  },
  영화: {
    id: 2852, // KB 틴업 체크카드
    name: 'KB 틴업 체크카드',
    summary:
      '🎬 학생·청년층의 영화/문화 소비를 염두에 둔 구성입니다.\n' +
      '극장 관람/문화생활을 가볍게 즐기는 사용자에게 어울립니다.\n' +
      '결론: 영화·문화 입문자용 기본 체크.',
  },
  주유: {
    id: 2332, // KB국민 우리동네 체크카드
    name: 'KB국민 우리동네 체크카드',
    summary:
      '⛽ 동네 기반 생활 결제(주유/마트/편의점 등)를 묶어 쓰기 좋은 체크입니다.\n' +
      '주유 비중이 있는 운전자의 생활패턴과 궁합이 좋아요.\n' +
      '결론: 근거리 생활권에서 폭넓게 쓰는 체크.',
  },
  해외결제: {
    id: 2691, // 트래블러스 체크카드
    name: '트래블러스 체크카드',
    summary:
      '🌍 해외여행·해외결제에 특화된 체크카드입니다.\n' +
      '여행 경비/직구 결제까지 한 장으로 경험을 단순화할 수 있어요.\n' +
      '결론: 여행/직구를 즐기는 사용자에게 맞춤.',
  },
  통신비: {
    id: 2338, // 신한카드 Way 체크
    name: '신한카드 Way 체크',
    summary:
      '📱 통신요금/디지털 구독 같은 고정비를 체크카드로 관리하고 싶다면 적합합니다.\n' +
      '자동이체와 조합하면 “소비 전에 저축” 루틴 만들기도 쉬워요.\n' +
      '결론: 고정비를 체크로 관리하려는 사용자에게 추천.',
  },
  공과금: {
    id: 350, // 직장인보너스체크카드
    name: '직장인보너스체크카드',
    summary:
      '💡 전기/가스/수도 등 공과금 자동이체 중심 사용자에게 유용합니다.\n' +
      '고정비 지출을 체크로 통제하면서 간단히 관리할 수 있어요.\n' +
      '결론: 생활요금 최적화를 원하는 직장인에게 적합.',
  },
};

const showCardRecommendation = async (category) => {
  const map =
    selectedCardType.value === '체크카드' ? cardCheckMap : cardCreditMap;
  const rec = map[category];
  if (!rec) {
    await sendBotMessage(
      '이 카테고리에 대한 매핑 정보가 없어요. 다른 항목을 선택해 주세요!'
    );
    return;
  }
  await sendBotMessage(`${rec.summary}\n\n추천 카드: ${rec.name}`);
  // 상세 보기 CTA (router 이동)
  ctas.value = [
    { label: `${rec.name} 상세 보기`, route: `/detail/card/${rec.id}` },
  ];
};
/* =========================
 * 예금 추천 매핑 (카테고리 → 상품 1개)
 * ========================= */
const depositRecommendations = {
  '단기 여유자금': {
    id: 34, // 코드K 정기예금
    name: '코드K 정기예금',
    summary:
      '💸 단기(3~6개월)로 잠깐 굴릴 자금이라면, 금리와 유연성의 균형이 중요합니다.\n' +
      '코드K 정기예금은 비대면 가입이 간편하고, 가입/해지 절차가 단순해 “잠깐 묶어두는” 운용에 잘 맞습니다.\n' +
      '입출금 통장 대비 확실히 높은 이자를 확보하면서도 기간 부담이 적고, 중도해지 시 이율 안내가 명확해 리스크 관리가 쉬워요.\n' +
      '결론: 3~6개월 굴리기 좋은 깔끔한 단기 예금.\n' +
      '추천 상품: 코드K 정기예금',
  },
  '결혼자금(예금)': {
    id: 1, // WON플러스예금
    name: 'WON플러스예금',
    summary:
      '💍 결혼 준비처럼 “목표 시점이 확실한” 자금에는 안정적인 정기예금이 적합합니다.\n' +
      'WON플러스예금은 모바일로 가입/관리하기 쉽고, 급여이체·자동이체 등 생활 루틴과 연동한 우대 조건을 붙이면 실금리를 높이기 수월해요.\n' +
      '목돈을 안전하게 보전하면서, 예식/신혼집 계약 등 큰 지출 일정에 맞춰 만기 자금을 확보하기 좋습니다.\n' +
      '결론: 안정성 최우선의 장기 목표 예치에 적합.\n' +
      '추천 상품: WON플러스예금',
  },
  노후자금: {
    id: 23, // IBK평생한가족통장(실세금리정기예금)
    name: 'IBK평생한가족통장(실세금리정기예금)',
    summary:
      '👵 노후자금은 “안정성 + 현금흐름 관리(이자 지급 주기)”가 핵심입니다.\n' +
      'IBK평생한가족통장은 예금자 보호 범위 내에서 운용하며, 이자 수령 주기를 생활 패턴에 맞춰 선택할 수 있어\n' +
      '생활비 흐름을 계획적으로 맞추기 좋습니다. 보수적 운용을 원하는 분께 잘 맞아요.\n' +
      '결론: 장기 안정성과 현금흐름을 동시에 챙기는 노후 베이스캠프.\n' +
      '추천 상품: IBK평생한가족통장(실세금리정기예금)',
  },
  '상여금 굴리기': {
    id: 17, // JB 다이렉트예금통장(만기일시지급식)
    name: 'JB 다이렉트예금통장(만기일시지급식)',
    summary:
      '💼 상여금·보너스처럼 “일시금”은 가입 문턱 낮고 온라인으로 빠르게 가입되는 예금이 편합니다.\n' +
      'JB 다이렉트예금통장은 비대면 전용으로 금리/기간 선택이 단순해, 3~12개월 사이 “잠깐” 굴리기에 좋아요.\n' +
      '목돈을 가볍게 묶어두고 만기에 이자를 한 번에 수령하는 구조라, 사용 시점이 뚜렷할 때 유리합니다.\n' +
      '결론: 단기-중기 일시금 굴리기에 특화된 간편 예금.\n' +
      '추천 상품: JB 다이렉트예금통장(만기일시지급식)',
  },
  '안전한 목돈관리': {
    id: 27, // KB Star 정기예금
    name: 'KB Star 정기예금',
    summary:
      '🔒 원금보전과 예금자보호를 최우선으로 할 때는 표준형 정기예금이 정답입니다.\n' +
      'KB Star 정기예금은 지점/모바일 접근성이 좋아 관리가 쉽고, 금리·만기 구조가 단순해 운영 실수가 적어요.\n' +
      '장기 보관용 목돈의 “기본 그릇”으로 쓰기 좋은, 믿고 가는 베이스 상품입니다.\n' +
      '결론: 안정성 1순위의 기본기 정기예금.\n' +
      '추천 상품: KB Star 정기예금',
  },
};

/* =========================
 * 적금 추천 매핑 (카테고리 → 상품 1개)
 * 주신 ID/이름 그대로 사용
 * ========================= */
const savingRecommendations = {
  여행자금: {
    id: 12, // 해피라이프_여행스케치적금V
    name: '해피라이프_여행스케치적금V',
    summary:
      '✈️ 여행 일정이 잡혀 있다면, 목표 시점에 맞춘 단·중기 적금이 가장 실용적입니다.\n' +
      '여행 경비는 항공권·숙박·액티비티처럼 지출 타이밍이 뚜렷하기 때문에, 매달 일정 금액을 차곡차곡 모으면서 필요한 순간에 맞춰 자금을 확보하는 게 좋아요.\n' +
      '간단한 우대조건(앱 로그인, 자동이체 등)을 조합하면 실금리를 끌어올리기 쉬워, “계획한 만큼” 돈이 자라나는 느낌을 받을 수 있습니다.\n' +
      '결론: 여행 데드라인에 착붙인 목적형 적금.\n' +
      '추천 상품: 해피라이프_여행스케치적금V',
  },
  자취비용: {
    id: 2, // WON적금
    name: 'WON적금',
    summary:
      '🏠 월세·관리비·생활비처럼 매달 빠져나가는 고정지출을 대비하려면 정액 적립이 가장 깔끔합니다.\n' +
      '급여일 다음 날을 납입일로 잡아 “먼저 저축, 나머지 소비” 루틴을 만들면, 생활 패턴이 흐트러져도 저축은 자동으로 굴러가요.\n' +
      '우대조건이 과하지 않아 장기 유지 피로도가 낮고, 모바일 관리가 쉬워 일상 속에서 꾸준히 이어가기 좋습니다.\n' +
      '결론: 자취 필수지출을 ‘먼저 챙기는’ 생활형 적금.\n' +
      '추천 상품: WON적금',
  },
  비상금: {
    id: 50, // 카카오뱅크 자유적금
    name: '카카오뱅크 자유적금',
    summary:
      '🚨 예상치 못한 지출에 대비하려면 유연한 “자유적립식”이 딱입니다.\n' +
      '여유 있을 때는 많이, 빠듯한 달은 적게 넣어도 계획이 유지되기 때문에, 비상금 본연의 목적(언제든 꺼내 쓸 준비)에 잘 맞아요.\n' +
      '모바일에서 납입·변경·해지까지 간단히 관리할 수 있어 접근성이 뛰어납니다.\n' +
      '결론: 탄력 있게 쌓는 안전망 적금.\n' +
      '추천 상품: 카카오뱅크 자유적금',
  },
  '결혼자금(적금)': {
    id: 32, // KB국민프리미엄적금(정액)
    name: 'KB국민프리미엄적금(정액)',
    summary:
      '💍 예식장 계약, 혼수·예물, 신혼여행 등 큰 지출이 이어지는 결혼 준비에는 “정액·장기”로 꾸준히 키우는 전략이 효율적입니다.\n' +
      '목표 기간을 24개월 이상으로 두고 월 납입액을 무리 없는 수준으로 고정하면, 목표 시점에 완성된 자금을 안정적으로 확보할 수 있어요.\n' +
      '우대조건을 결합하면 실수령 이자도 커져 체감 성취감이 좋습니다.\n' +
      '결론: 장기·목표형에 최적화된 결혼 준비 적금.\n' +
      '추천 상품: KB국민프리미엄적금(정액)',
  },
  '신혼집 자금': {
    id: 42, // 주거래하나 월복리적금
    name: '주거래하나 월복리적금',
    summary:
      '🏡 보증금·중도금 등 “덩치 큰 지출”을 앞둔 신혼집 준비에는 복리의 힘이 꾸준히 쌓이는 구성이 유리합니다.\n' +
      '월복리는 납입 원금과 이자가 함께 불어나 장기일수록 체감 효과가 커지고, 급여이체·자동이체 같은 루틴을 얹으면 실금리도 자연스레 올라갑니다.\n' +
      '전세·청약 등 주거 계획과 병행 전략을 세우기에도 좋습니다.\n' +
      '결론: 24개월+ 장기 모으기에 강한 신혼집 자금 적금.\n' +
      '추천 상품: 주거래하나 월복리적금',
  },
};

const showSavingRecommendation = async (category) => {
  const rec = savingRecommendations[category];
  if (!rec) {
    await sendBotMessage(
      '이 카테고리에 대한 추천 정보를 찾지 못했어요. 다른 항목을 골라주세요!'
    );
    return;
  }
  await sendBotMessage(rec.summary);
  // 상세 보기 CTA (router 이동)
  ctas.value = [
    { label: `${rec.name} 상세 보기`, route: `/detail/saving/${rec.id}` },
  ];
};

const showDepositRecommendation = async (category) => {
  const rec = depositRecommendations[category];
  if (!rec) {
    await sendBotMessage(
      '이 카테고리에 대한 추천 정보를 찾지 못했어요. 다른 항목을 선택해 주세요!'
    );
    return;
  }
  await sendBotMessage(rec.summary);
  // 상세 보기 CTA (router 이동)
  ctas.value = [
    { label: `${rec.name} 상세 보기`, route: `/detail/deposit/${rec.id}` },
  ];
};

/* 타자 효과 */
const typeMessage = async (text) => {
  const delay = TYPING_DELAY_MS;
  let typedText = '';
  messages.value.push({ role: 'bot', content: '' }); // 출력 슬롯 생성
  for (let i = 0; i < text.length; i++) {
    typedText += text[i];
    messages.value[messages.value.length - 1].content = typedText;
    scrollToBottom();
    await new Promise((r) => setTimeout(r, delay));
  }
};

/* (첫 인사 제외) 모든 봇 메시지 전 로딩 표시 */
const sendBotMessage = async (content, { isFirst = false } = {}) => {
  if (!isFirst) {
    messages.value.push({ role: 'loading', content: '...' });
    scrollToBottom();
    await new Promise((r) => setTimeout(r, 800)); // 로딩 0.8초
    messages.value.pop();
  }
  await typeMessage(content);
  scrollToBottom();
};

// toggleChat: 인사말 즉시 출력
const toggleChat = () => {
  isOpen.value = !isOpen.value;

  if (isOpen.value) {
    clearButtonTimers();
    // 기존 대화가 없을 때만 초기화 인사
    if (messages.value.length === 0) {
      ctas.value = [];
      visibleButtons.value = [];
      currentParentMenu.value = null;
      showBotMessageImmediate(
        `안녕하세요. <strong>맞추머니 챗봇</strong>입니다! 무엇을 도와드릴까요?`
      );
      scheduleButtons(allButtons, { clear: true, base: 800, step: 220 });
    }
  } else {
    clearButtonTimers();
    ctas.value = [];
    messages.value = [];
    visibleButtons.value = [];
    currentParentMenu.value = null;
  }
};

/* 라우팅 변경 시 세이프가드 */
router.afterEach(() => {
  clearButtonTimers();
});

/* ========== 백엔드 호출(일반 입력) ========== */
const sendToGPT = async (text) => {
  try {
    const reply = await chatbotApi.ask(text, systemPrompt);
    return reply || '⚠️ 서버 오류가 발생했습니다.';
  } catch (err) {
    console.error(err);
    return '⚠️ 서버 오류가 발생했습니다.';
  }
};

const sendMessage = async () => {
  if (!input.value.trim()) return;

  // 유저 입력
  const userText = input.value.trim();
  messages.value.push({ role: 'user', content: userText });
  input.value = '';

  // 버튼이 보이는 중이라면 클릭과 동일하게 즉시 숨김
  clearButtonTimers();
  visibleButtons.value = [];
  await nextTick();

  // ✅ 사용자가 직접 용어를 입력한 경우: '금융 용어 물어보기' 하위 목록과 매칭
  const terms = submenuMap['금융 용어 물어보기'] || [];
  if (terms.includes(userText)) {
    await explainTerm(userText); // ⬅️ 동일 플로우
    return;
  }

  // 일반 질문은 기존 GPT 흐름
  const botReply = await sendToGPT(userText);
  await sendBotMessage(botReply);
};

const handleQuickButtonClick = async (index) => {
  if (isMenuTransitioning.value) return;
  isMenuTransitioning.value = true;

  const selectedText = visibleButtons.value[index];

  // 클릭 즉시 버튼 숨김
  clearButtonTimers();
  visibleButtons.value = [];
  await nextTick();

  // 사용자 말풍선
  messages.value.push({ role: 'user', content: selectedText });
  scrollToBottom();

  // 0) 후속 버튼 먼저 처리
  if (selectedText === '괜찮아요') {
    await sendBotMessage(
      '좋아요! 다른 주제나 용어도 언제든지 물어봐 주세요 🙂'
    );
    lastExplainedTerm.value = null;
    ctas.value = [];
    isMenuTransitioning.value = false;
    return;
  }

  if (selectedText === '더 쉽게 설명해줘') {
    await explainTermSimpler(); // ⬅️ 설명 후 버튼 재노출(무한반복)
    ctas.value = [];
    isMenuTransitioning.value = false;
    return;
  }

  /* 1) 상위 메뉴: 안내 후 하위 버튼을 순차 등장 */
  if (submenuMap[selectedText]) {
    currentParentMenu.value = selectedText;
    ctas.value = [];

    let intro = '';
    if (selectedText === '카드 추천받기') {
      selectedCardType.value = null; // 초기화
      intro = '좋아요! 먼저 카드 종류를 선택해 주세요. (신용카드/체크카드)';
      await sendBotMessage(intro);
      // 카드 타입 두 개 먼저 보여주기
      scheduleButtons(CARD_TYPE_OPTIONS, { clear: true, base: 800, step: 220 });
      isMenuTransitioning.value = false;
      return;
    }
    // ✅ 상위 메뉴에 따라 문맥 맞춘 인트로 문구
    else if (selectedText === '예금 추천받기') {
      intro = '예금으로 어떤 목적을 준비 중이신가요? 목적을 선택해 주세요.';
    } else if (selectedText === '적금 추천받기') {
      intro = '적금으로 모으고 싶은 목표가 무엇인가요? 아래에서 골라주세요.';
    } else if (selectedText === '서비스 이용방법') {
      intro = '원하시는 안내를 선택해 주세요.';
    } else if (selectedText === '페르소나 유형 설명') {
      intro = '아래에서 자신의 성향과 가장 가까운 동물을 선택해 주세요.';
    } else if (selectedText === '금융 용어 물어보기') {
      intro = '어떤 용어가 어렵나요? 아래에서 선택하거나 직접 입력해 주세요.';
    } else {
      intro = `${selectedText} 항목입니다. 아래에서 선택해 주세요.`;
    }

    await sendBotMessage(intro);
    scheduleButtons(submenuMap[selectedText], {
      clear: true,
      base: 800,
      step: 220,
    });
    isMenuTransitioning.value = false;
    return;
  }

  /* 2) 금융 용어 물어보기 — 선택 텍스트가 '금융 용어' 하위 목록에 있을 때만 */
  if (submenuMap['금융 용어 물어보기']?.includes(selectedText)) {
    await explainTerm(selectedText); // ⬅️ 헬퍼 사용
    ctas.value = [];
    isMenuTransitioning.value = false;
    return;
  }

  /* 3) 페르소나 유형 설명 — 설명 + 결과 페이지 CTA */
  if (submenuMap['페르소나 유형 설명']?.includes(selectedText)) {
    const code = personaCodeMap[selectedText];
    const desc =
      personaDescriptions[selectedText] ||
      '이 유형은 재무 목표와 위험 선호에 따라 맞춤 전략이 달라집니다.';
    await sendBotMessage(desc);

    if (code) {
      ctas.value = [
        {
          label: `${selectedText} 자세히 보러가기`,
          route: `/persona/result/${code}`,
        },
      ];
    } else {
      ctas.value = [];
    }
    isMenuTransitioning.value = false;
    return;
  }

  /* 4) 서비스 이용방법 하위 */
  if (serviceLinks[selectedText]) {
    await sendBotMessage(
      `<strong>서비스 이용방법</strong> 중에서 <strong>${selectedText}</strong> 안내를 보여드릴게요!`
    );
    await sendBotMessage(quickButtonPrompts[selectedText] || selectedText);

    const route = serviceLinks[selectedText];
    const label =
      selectedText === '페르소나 기반 추천'
        ? '페르소나 기반 추천 받으러 가기'
        : `${selectedText} 바로 가기`;
    ctas.value = [{ label, route }];

    isMenuTransitioning.value = false;
    return;
  }
  // 카드 타입을 선택한 경우
  if (CARD_TYPE_OPTIONS.includes(selectedText)) {
    selectedCardType.value = selectedText; // '신용카드' or '체크카드'
    await sendBotMessage(
      `${selectedText}로 진행할게요. 평소 어떤 소비가 가장 많으세요? 아래에서 선택해 주세요.`
    );
    // 카드 카테고리 버튼 등장
    scheduleButtons(submenuMap['카드 추천받기'], {
      clear: true,
      base: 800,
      step: 220,
    });
    isMenuTransitioning.value = false;
    return;
  }
  // 카드 추천받기 하위 카테고리 클릭 처리
  if (
    currentParentMenu.value === '카드 추천받기' &&
    submenuMap['카드 추천받기']?.includes(selectedText)
  ) {
    await showCardRecommendation(selectedText);
    isMenuTransitioning.value = false;
    return;
  }
  // 예금 추천받기 하위 카테고리 클릭 처리
  if (
    currentParentMenu.value === '예금 추천받기' &&
    submenuMap['예금 추천받기']?.includes(selectedText)
  ) {
    await showDepositRecommendation(selectedText);
    isMenuTransitioning.value = false;
    return;
  }
  // 적금 추천받기 하위 카테고리 클릭 처리
  if (
    currentParentMenu.value === '적금 추천받기' &&
    submenuMap['적금 추천받기']?.includes(selectedText)
  ) {
    await showSavingRecommendation(selectedText);
    isMenuTransitioning.value = false;
    return;
  }

  /* 5) 기타 일반 하위 */
  await sendBotMessage(
    `<strong>${
      currentParentMenu.value ?? ''
    }</strong> 중에서 <strong>${selectedText}</strong>에 대해 안내드릴게요!`
  );
  await sendBotMessage(quickButtonPrompts[selectedText] || selectedText);
  ctas.value = [];
  isMenuTransitioning.value = false;
};

/* ========== 마운트/언마운트 ========== */
onMounted(() => {
  clearButtonTimers();
  ctas.value = [];
});
onBeforeUnmount(() => {
  clearButtonTimers();
  ctas.value = [];
});

/* 템플릿에서 사용할 것 노출 (CTA 버튼 클릭 시 사용) */
defineExpose({ goRoute, ctas });
</script>

<style scoped>
.chatbot-container {
  position: fixed;
  bottom: 35px;
  right: 35px;
  z-index: 10000;
}
.chatbot-container.dragging {
  transition: none;
}

.chat-toggle {
  background: transparent;
  border: 2px solid #cfe5a2;
  border-radius: 50%;
  width: 80px;
  height: 80px;
  cursor: pointer;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.3s ease;
  padding: 0;
}
.chat-toggle:hover {
  transform: scale(1.1);
}
.chat-toggle img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 50%;
}
@media (max-width: 768px) {
  .chat-toggle {
    width: 64px;
    height: 64px;
  }
}
@media (max-width: 480px) {
  .chat-toggle {
    width: 56px;
    height: 56px;
  }
}

.chat-window {
  width: 360px;
  height: 550px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.25);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  position: absolute;
  bottom: calc(
    80px + 40px
  ); /* 토글(80px) + 여백 40px → 버튼 안가리게 더 위로 */
  right: 20px;
  font-family: 'Pretendard', sans-serif;
  animation: slideUp 0.4s ease;
}

/* 반응형: 태블릿 사이즈에서 대화창 축소 */
@media (max-width: 768px) {
  .chat-window {
    width: 320px;
    height: 72vh;
    right: 12px;
    bottom: calc(64px + 28px); /* 토글(64px) + 여백 28px */
  }
  .chatbot-container {
    right: 12px;
    bottom: 16px;
  }
}

/* 반응형: 모바일 사이즈에서 더 작게 */
@media (max-width: 480px) {
  .chat-window {
    position: fixed; /* 뷰포트 기준 고정 */
    left: 3vw; /* 좌우 여백 조금 줄여 더 넓게 */
    right: 3vw;
    bottom: calc(56px + 16px); /* 토글(56px) + 여백 16px */
    width: auto; /* 고정폭 제거 */
    max-width: 94vw; /* 안전 폭 */
    height: auto; /* 고정높이 제거 */
    min-height: 60dvh; /* 최소 높이 확보 */
    max-height: 82dvh; /* 화면 대비 크게 (상단 노치/브라우저 UI 고려) */
  }
  .chat-body {
    overflow-y: auto;
  }
}
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fade-up-enter-active,
.fade-up-leave-active {
  transition: all 0.4s ease;
}
.fade-up-enter-from {
  opacity: 0;
  transform: translateY(20px);
}
.fade-up-enter-to {
  opacity: 1;
  transform: translateY(0);
}

.chat-header {
  background: #fff;
  padding: 12px;
  font-weight: bold;
  border-bottom: 1px solid #ddd;
  text-align: center;
  position: relative;
}
.chat-title {
  font-size: 18px;
}
.chat-title .icon {
  width: 18px;
  height: 18px;
  vertical-align: middle;
  margin-right: 4px;
}
.chat-actions {
  position: absolute;
  top: 50%;
  right: 12px;
  transform: translateY(-50%);
  display: flex;
  gap: 8px;
  align-items: center;
}
.chat-btn {
  background: none;
  border: none;
  font-size: 13px;
  cursor: pointer;
  color: #666;
  padding: 0;
  transition: transform 0.2s ease;
}

.chat-body {
  padding: 12px;
  flex: 1;
  overflow-y: auto;
}

.message-wrapper {
  display: flex;
  align-items: flex-start;
  margin-bottom: 12px;
}
.message-wrapper.user {
  justify-content: flex-end;
}
.message-wrapper.bot {
  justify-content: flex-start;
}

.avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  margin-right: 8px;
  flex-shrink: 0;
}

.message.bot {
  position: relative;
  background: #e0f2c2;
  padding: 8px 12px;
  border-radius: 16px;
  border-bottom-left-radius: 4px;
  margin-bottom: 0;
  width: fit-content;
  max-width: 80%;
  font-size: 14px;
  color: #000;
  text-align: left;
}
.message.user {
  margin-left: auto;
  background: #e3e8eb;
  padding: 8px 12px;
  border-radius: 16px;
  border-bottom-right-radius: 4px;
  margin-bottom: 0;
  width: fit-content;
  max-width: 80%;
  font-size: 14px;
  color: #000;
  text-align: left;
}
.message.loading {
  background: #e0f2c2;
  padding: 8px 12px;
  border-radius: 16px;
  border-bottom-left-radius: 4px;
  margin-bottom: 12px;
  width: fit-content;
  max-width: 80%;
  font-size: 14px;
  color: #000;
  text-align: left;
}

.spinner {
  width: 24px;
  height: 24px;
  border: 3px solid #cfe5a2;
  border-top: 3px solid #a0c28d;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 12px;
  margin-left: 6px;
}
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.quick-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}

.quick-btn {
  padding: 5px 12px;
  border: 1px solid #a0c28d;
  border-radius: 16px;
  background: white;
  font-size: 13px;
  cursor: pointer;
  white-space: nowrap;
}
.quick-btn:active {
  background: #a0c28d;
  color: #fff;
  border-color: #a0c28d;
}
.quick-btn.selected {
  background: #a0c28d;
  color: #fff;
  border-color: #a0c28d;
}

/* 상위 버튼: 2줄 허용 */
.quick-btn.main-menu {
  padding: 5px 10px;
  border: 1px solid #a0c28d;
  border-radius: 16px;
  background: white;
  font-size: 12px;
  white-space: normal; /* 줄바꿈 허용 */
  word-break: keep-all; /* 단어 단위 줄바꿈 */
  text-align: center;
  max-width: 120px;
}

/* 하위 버튼: 한 줄 고정 */
.quick-btn.sub-menu {
  padding: 4px 10px;
  border: 1px solid #d0e6b5;
  border-radius: 12px;
  background: #f6fbf1;
  font-size: 12px;
  color: #4b6b3d;
  white-space: nowrap; /* 줄바꿈 금지 */
  overflow: hidden;
  text-overflow: ellipsis; /* 길면 ... 처리 */
  max-width: 140px;
}

.chat-input {
  display: flex;
  align-items: center;
  border-top: 1px solid #eee;
  padding: 12px;
  background: #fff;
}
.chat-input input {
  flex: 1;
  padding: 12px 16px;
  border: 1px solid #ccc;
  border-radius: 25px;
  font-size: 14px;
  outline: none;
  margin-right: 8px;
  margin-left: 4px;
}
.chat-input input::placeholder {
  color: #888;
}
.chat-input input:focus {
  border-color: #a0c28d;
}
.chat-input button {
  background: none;
  border: none;
  margin-left: 0;
  cursor: pointer;
  padding: 0;
}
.chat-input button img {
  width: 20px;
  height: 20px;
}

.blurred {
  opacity: 0.5;
}
.message span,
.message div {
  white-space: pre-line;
}

.cta-wrap {
  margin-top: 10px;
}
.cta-btn {
  appearance: none;
  -webkit-appearance: none;
  border: none;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border-radius: 999px;
  background: #a0c28d; /* 말풍선과 어울리는 그린 */
  color: #fff;
  font-size: 13px;
  font-weight: 700;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.12);
  cursor: pointer;
  transition: transform 0.08s ease, box-shadow 0.12s ease, opacity 0.12s ease;
}
.cta-btn:hover {
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.16);
  opacity: 0.95;
}
.cta-btn:active {
  transform: translateY(1px);
}
.cta-btn:focus {
  outline: 2px solid #88b47b;
  outline-offset: 2px;
}
.cta-text {
  line-height: 1;
}
.cta-arrow {
  line-height: 1;
  font-size: 14px;
}
.cta-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 8px 0 4px;
}
.cta-button {
  appearance: none;
  -webkit-appearance: none;
  border: none;
  padding: 10px 14px;
  border-radius: 999px;
  background: #a0c28d; /* 톤 맞춘 그린 */
  color: #fff;
  font-size: 13px;
  font-weight: 700;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.12);
  cursor: pointer;
  transition: transform 0.08s ease, box-shadow 0.12s ease, opacity 0.12s ease;
}
.cta-button:hover {
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.16);
  opacity: 0.95;
}
.cta-button:active {
  transform: translateY(1px);
}
.cta-button:focus {
  outline: 2px solid #88b47b;
  outline-offset: 2px;
}
</style>
