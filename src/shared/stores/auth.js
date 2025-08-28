// src/stores/auth.js
import { defineStore } from 'pinia';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    accessToken: sessionStorage.getItem('accessToken'),
    userId: sessionStorage.getItem('userId'),
    nickname: null, // 메모리에만 저장
  }),

  getters: {
    // 로그인 상태 확인 getter 추가
    isLoggedIn: (state) => !!(state.accessToken && state.userId),
  },

  actions: {
    setAuth(tokenDto) {
      this.accessToken = tokenDto.accessToken;
      this.userId = tokenDto.userId;
      this.nickname = tokenDto.nickname;

      // accessToken과 userId만 sessionStorage에 저장
      sessionStorage.setItem('accessToken', tokenDto.accessToken);
      sessionStorage.setItem('userId', tokenDto.userId);

      // console.log("✅ Auth 정보 저장 완료:", {
      //   userId: tokenDto.userId,
      //   nickname: tokenDto.nickname,
      //   hasAccessToken: !!tokenDto.accessToken,
      // });
    },
    logout() {
      // FCM 토큰 정리(클라이언트/서버) - 액세스 토큰 제거 전에 실행되어야 함
      window.dispatchEvent(new Event('app:logout'));

      this.accessToken = null;
      this.userId = null;
      this.nickname = null;

      // sessionStorage에서만 제거 (userId와 accessToken만)
      sessionStorage.removeItem('accessToken');
      sessionStorage.removeItem('userId');

      // console.log("✅ 로그아웃 완료");
    },
    getToken() {
      return this.accessToken || sessionStorage.getItem('accessToken');
    },
    setToken(token) {
      this.accessToken = token;
      if (token) {
        sessionStorage.setItem('accessToken', token);
      }
    },
    getUserId() {
      return this.userId || sessionStorage.getItem('userId');
    },
  },
});
