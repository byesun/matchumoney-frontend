// src/main.js
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { useAuthStore } from '@/shared/stores/auth';

import router from './router';
import App from './App.vue';
import { initFCM } from '@/shared/firebase/fcmService';

// 1) 글로벌 스타일
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './assets/main.css';

// 2) Bootstrap JS
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

// 3) 앱 생성
const app = createApp(App);
const pinia = createPinia();
app.use(pinia);

// 로그인 상태 복원
const token = localStorage.getItem('accessToken');
if (token) {
  const authStore = useAuthStore();
  authStore.accessToken = token;
}

// FCM 초기화: 앱 시작 시 한 번 등록 (토큰 유무와 무관)
// - onMessage(포그라운드 토스트) 핸들러를 일찍 바인딩하기 위함
initFCM();

// 로그인/구독 이벤트에도 재시도 (토큰 갱신/권한 허용 직후)
window.addEventListener('app:login', initFCM);
window.addEventListener('app:push:subscribed', initFCM);
// 필요 시 해제 이벤트도 훅만 남겨둠 (현재는 별도 동작 없음)
window.addEventListener('app:push:unsubscribed', () => {});

app.use(router);
app.mount('#app');
