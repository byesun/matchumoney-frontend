// router/index.js 또는 router.js
import KakaoCallbackPage from '@/modules/user/auth/pages/KakaoCallbackPage.vue';
import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth.js';

/* ── 페이지 컴포넌트 ─────────────────────── */
import LoginPage from '@/modules/user/auth/pages/LoginPage.vue';
import ResetPasswordPage from '@/modules/user/auth/pages/ResetPasswordPage.vue';
import SignupPage from '@/modules/user/auth/pages/SignupPage.vue';
import RecommendDeposit from '@/modules/deposit/mydata/pages/RecommendDeposit.vue';
import HomePage from '@/modules/home/pages/HomePage.vue';
import MyInfoPage from '@/modules/user/profile/pages/MyInfoPage.vue';
import MyPage from '@/modules/user/profile/pages/MyPage.vue';
import UpdatePasswordPage from '@/modules/user/profile/pages/UpdatePasswordPage.vue';
import UpdateUserInfoPage from '@/modules/user/profile/pages/UpdateUserInfoPage.vue';
import FavoritePage from '@/modules/user/profile/pages/MyFavoritePage.vue';
import FortunePage from '@/modules/quiz/pages/FortunePage.vue';
import PersonaCardAllList from '@/modules/card/persona/pages/PersonaCardAllList.vue';
import PersonaDepositAllList from '@/modules/deposit/persona/pages/PersonaDepositAllListPage.vue';
import PersonaSavingAllList from '@/modules/saving/persona/pages/PersonaSavingAllListPage.vue';
import PersonaSurveyPage from '@/modules/persona/pages/PersonaSurveyPage.vue';
import PersonaSurveyStart from '@/modules/persona/pages/PersonaSurveyStartPage.vue';

import MyDataCardPage from '@/modules/card/mydata/pages/MyDataCardPage.vue';
import RecommendSavings from '@/modules/saving/mydata/pages/RecommendSavings.vue';

import CardRecommendationPage from '@/modules/card/mydata/pages/CardRecommendationPage.vue';

import CardDetailPage from '@/modules/card/detail/pages/CardDetailPage.vue';
import DepositDetailPage from '@/modules/deposit/detail/pages/DepositDetailPage.vue';
import SavingDetailPage from '@/modules/saving/detail/pages/SavingDetailPage.vue';

import EducationBoardPage from '@/modules/education/pages/EducationBoardPage.vue';
import WebtoonPage from '@/modules/education/pages/WebtoonPage.vue';
import VideoPage from '@/modules/education/pages/EducationVideoBoardPage.vue';
import QuizEntry from '@/modules/quiz/pages/QuizEntry.vue';
import ComparePage from '@/modules/compare/pages/ComparePage.vue';

import DailyQuiz from '@/modules/quiz/pages/DailyQuiz.vue';
/* 결과 페이지 (동적 import) */
const ResultPage = () =>
  import('@/modules/persona/pages/PersonaResultPage.vue');

/* 8종 페르소나 코드 */
const personaCodes = [
  'turtle',
  'squirrel',
  'ant',
  'owl',
  'rabbit',
  'cat',
  'tiger',
  'penguin',
];

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomePage,
    meta: { requiresAuth: false }, // 메인 페이지는 공개
  },
  {
    path: '/signup',
    name: 'signup',
    component: SignupPage,
    meta: { requiresAuth: false }, // 회원가입은 공개
  },
  {
    path: '/login',
    name: 'login',
    component: LoginPage,
    meta: { requiresAuth: false }, // 로그인은 공개
  },
  {
    path: '/oauth/kakao/callback',
    name: 'KakaoCallback',
    component: KakaoCallbackPage,
    meta: { requiresAuth: false }, // 카카오 콜백은 공개
  },
  {
    path: '/reset-password',
    name: 'resetPassword',
    component: ResetPasswordPage,
    meta: { requiresAuth: false }, // 비밀번호 재설정은 공개
  },
  {
    path: '/mypage',
    name: 'mypage',
    component: MyPage,
    meta: { requiresAuth: true }, // 마이페이지는 인증 필요
  },
  { path: '/myinfo', name: 'myinfo', component: MyInfoPage },
  {
    path: '/myinfo/update',
    name: 'updateUserInfo',
    component: UpdateUserInfoPage,
  },
  {
    path: '/myinfo/update/password',
    name: 'updatePassword',
    component: UpdatePasswordPage,
  },

  {
    path: '/myinfo/update',
    name: 'updateUserInfo',
    component: UpdateUserInfoPage,
  },
  {
    path: '/myinfo/update/password',
    name: 'updatePassword',
    component: UpdatePasswordPage,
  },
  {
    path: '/detail/deposit/:depositId',
    name: 'DepositDetail',
    component: DepositDetailPage,
    props: true,
  },
  {
    path: '/detail/card/:cardId',
    name: 'CardDetail',
    component: CardDetailPage,
    props: true,
  },
  {
    path: '/detail/saving/:savingId',
    name: 'SavingDetail',
    component: SavingDetailPage,
    props: true,
  },
  {
    path: '/detail/deposit/:depositId',
    name: 'DepositDetail',
    component: DepositDetailPage,
    props: true,
  },
  {
    path: '/detail/card/:cardId',
    name: 'CardDetail',
    component: CardDetailPage,
    props: true,
  },
  {
    path: '/detail/saving/:savingId',
    name: 'SavingDetail',
    component: SavingDetailPage,
    props: true,
  },
  {
    path: '/deposits/recommendations/history',
    name: 'RecommendDeposit',
    component: RecommendDeposit,
  },
  {
    path: '/savings/recommendations/history',
    name: 'RecommendSavings',
    component: RecommendSavings,
  },
  {
    path: '/compare',
    name: 'ComparePage',
    component: ComparePage,
  },

  {
    path: '/mydata/cards',
    name: 'MyDataCards',
    component: MyDataCardPage,
  },
  {
    path: '/cards/recommendations',
    name: 'CardRecommendations',
    component: CardRecommendationPage,
  },
  {
    path: '/cards/recommendations/:cardId',
    name: 'CardRecommendation',
    component: CardRecommendationPage,
    props: true,
  },
  {
    path: '/fortune',
    name: 'Fortune',
    component: FortunePage,
    props: true,
  },
  {
    path: '/education',
    children: [
      { path: 'quiz', name: 'quiz', component: QuizEntry },
      { path: 'contents', name: 'contents', component: EducationBoardPage },
      { path: 'video', name: 'video', component: VideoPage },
      {
        path: 'video/full/:videoId',
        name: 'VideoDetail',
        component: () =>
          import('@/modules/education/pages/VideoDetailPage.vue'),
        props: true,
      },
      { path: 'webtoon', name: 'webtoon', component: WebtoonPage },
    ],
  },
  {
    path: '/quiz',
    children: [
      { path: '', name: 'QuizEntry', component: QuizEntry },
      { path: 'daily', name: 'DailyQuiz', component: DailyQuiz },
    ],
  },
  {
    path: '/persona',
    children: [
      { path: 'start', name: 'PersonaTest', component: PersonaSurveyStart },
      { path: 'survey', name: 'PersonaSurvey', component: PersonaSurveyPage },
      { path: 'cards', name: 'PersonaCards', component: PersonaCardAllList },
      {
        path: 'savings',
        name: 'PersonaSavings',
        component: PersonaSavingAllList,
      },
      {
        path: 'deposits',
        name: 'PersonaDeposits',
        component: PersonaDepositAllList,
      },
      {
        path: 'result/:code',
        name: 'PersonaResult',
        component: ResultPage,
        props: true,
        beforeEnter: (to, _, next) => {
          if (personaCodes.includes(to.params.code)) next();
          else next('/');
        },
      },
    ],
  },
  { path: '/survey', redirect: '/persona/survey' },
  { path: '/personatest', redirect: '/persona/test' },
  { path: '/personaCardList', redirect: '/persona/cards' },
  ...personaCodes.map((c) => ({
    path: `/${c}`,
    redirect: `/persona/result/${c}`,
  })),
  {
    path: '/favorites',
    name: 'favoritePage',
    component: FavoritePage,
  },
  // 404 처리 - 모든 경로를 catch
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    beforeEnter: (to, from, next) => {
      const authStore = useAuthStore();

      // 로그인된 상태면 메인 페이지로, 로그아웃 상태면 로그인 페이지로
      if (authStore.isLoggedIn) {
        next('/');
      } else {
        next('/login');
      }
    },
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior: () => ({ top: 0 }),
});

// 공개 페이지 (로그인 없이 접근 가능)
const publicRoutes = [
  '/', // 메인 페이지
  '/login', // 로그인
  '/signup', // 회원가입
  '/reset-password', // 비밀번호 재설정
  '/oauth/kakao/callback', // 카카오 콜백
];

// 라우터 가드 설정
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  const isPublicRoute =
    publicRoutes.includes(to.path) || to.meta?.requiresAuth === false;

  // 공개 라우트라면 통과
  if (isPublicRoute) {
    next();
    return;
  }

  // 인증이 필요한 페이지인 경우 로그인 확인
  if (!authStore.isLoggedIn) {
    // 로그인되지 않은 경우 로그인 페이지로 리다이렉트
    next({
      path: '/login',
      query: { redirect: to.fullPath }, // 로그인 후 원래 페이지로 돌아가기 위한 정보
    });
    return;
  }

  // 로그인된 경우 통과
  next();
});

export default router;
