import LoginPage from '@/modules/user/auth/pages/LoginPage.vue';
import ResetPasswordPage from '@/modules/user/auth/pages/ResetPasswordPage.vue';
import SignupPage from '@/modules/user/auth/pages/SignupPage.vue';
import KakaoCallbackPage from '@/modules/user/auth/pages/KakaoCallbackPage.vue';
import MyInfoPage from '@/modules/user/profile/pages/MyInfoPage.vue';
import MyPage from '@/modules/user/profile/pages/MyPage.vue';
import UpdatePasswordPage from '@/modules/user/profile/pages/UpdatePasswordPage.vue';
import UpdateUserInfoPage from '@/modules/user/profile/pages/UpdateUserInfoPage.vue';
import FavoritePage from '@/modules/user/profile/pages/MyFavoritePage.vue';

export const userRoutes = [
  {
    path: '/signup',
    name: 'signup',
    component: SignupPage,
    meta: { requiresAuth: false },
  },
  {
    path: '/login',
    name: 'login',
    component: LoginPage,
    meta: { requiresAuth: false },
  },
  {
    path: '/oauth/kakao/callback',
    name: 'KakaoCallback',
    component: KakaoCallbackPage,
    meta: { requiresAuth: false },
  },
  {
    path: '/reset-password',
    name: 'resetPassword',
    component: ResetPasswordPage,
    meta: { requiresAuth: false },
  },
  {
    path: '/mypage',
    name: 'mypage',
    component: MyPage,
    meta: { requiresAuth: true },
  },
  {
    path: '/myinfo',
    name: 'myinfo',
    component: MyInfoPage,
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
    path: '/favorites',
    name: 'favoritePage',
    component: FavoritePage,
  },
];
