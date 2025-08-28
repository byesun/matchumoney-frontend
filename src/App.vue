<!-- App.vue -->
<script setup>
import { useRoute } from 'vue-router';
import DefaultLayout from '@/shared/components/layouts/DefaultLayout.vue';
import ChatBot from './modules/chatbot/ChatBot.vue';

// 현재 라우트를 가져오기
const route = useRoute();
</script>

<template>
  <!-- 로그인 페이지가 아닐 때만 기본 레이아웃 적용 -->
  <DefaultLayout
    v-if="
      route.path !== '/login' &&
      route.path !== '/signup' &&
      route.path !== '/reset-password'
    "
  >
    <ChatBot />
    <!--
      라우터 뷰 컴포넌트
      - 라우팅 테이블에 정의된 경로에 따라 표시되는 컴포넌트를 나타냄
    -->
    <RouterView />
  </DefaultLayout>

  <!-- 로그인 페이지일 때는 레이아웃 없이 바로 렌더 -->
  <RouterView v-else />
</template>

<style scoped></style>
