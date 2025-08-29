import { createRouter, createWebHistory } from 'vue-router'

// 모듈별 라우트 import
import { homeRoutes } from '@/modules/home/routes.js'
import { userRoutes } from '@/modules/user/routes.js'
import { cardRoutes } from '@/modules/card/routes.js'
import { depositRoutes } from '@/modules/deposit/routes.js'
import { savingRoutes } from '@/modules/saving/routes.js'
import { educationRoutes } from '@/modules/education/routes.js'
import { quizRoutes } from '@/modules/quiz/routes.js'
import { personaRoutes } from '@/modules/persona/routes.js'
import { compareRoutes } from '@/modules/compare/routes.js'

// 공통 설정 import
import { authGuard, notFoundRoute } from '@/router/guards.js'

// 모든 라우트 병합
const routes = [
  ...homeRoutes,
  ...userRoutes,
  ...cardRoutes,
  ...depositRoutes,
  ...savingRoutes,
  ...educationRoutes,
  ...quizRoutes,
  ...personaRoutes,
  ...compareRoutes,
  notFoundRoute
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior: () => ({ top: 0 }),
});

// 라우터 가드 설정
router.beforeEach(authGuard)

export default router;
