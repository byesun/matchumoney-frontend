import { useAuthStore } from '@/shared/stores/auth.js'

// 공개 페이지 (로그인 없이 접근 가능)
export const publicRoutes = [
  '/', // 메인 페이지
  '/login', // 로그인
  '/signup', // 회원가입
  '/reset-password', // 비밀번호 재설정
  '/oauth/kakao/callback' // 카카오 콜백
]

// 라우터 가드
export const authGuard = (to, from, next) => {
  const authStore = useAuthStore()
  const isPublicRoute = publicRoutes.includes(to.path) || to.meta?.requiresAuth === false

  // 공개 라우트라면 통과
  if (isPublicRoute) {
    next()
    return
  }

  // 인증이 필요한 페이지인 경우 로그인 확인
  if (!authStore.isLoggedIn) {
    // 로그인되지 않은 경우 로그인 페이지로 리다이렉트
    next({
      path: '/login',
      query: { redirect: to.fullPath } // 로그인 후 원래 페이지로 돌아가기 위한 정보
    })
    return
  }

  // 로그인된 경우 통과
  next()
}

// 404 처리 라우트
export const notFoundRoute = {
  path: '/:pathMatch(.*)*',
  name: 'NotFound',
  beforeEnter: (to, from, next) => {
    const authStore = useAuthStore()

    // 로그인된 상태면 메인 페이지로, 로그아웃 상태면 로그인 페이지로
    if (authStore.isLoggedIn) {
      next('/')
    } else {
      next('/login')
    }
  }
}