<!-- 기본 레이아웃 컴포넌트 -->
<script setup>
import Header from './Header.vue';
import Footer from './Footer.vue';
</script>

<template>
  <div class="default-layout">
    <Header />
    <div class="content">
      <slot></slot>
      <!-- 페이지 컨텐츠가 들어갈 슬롯 -->
    </div>
    <Footer />
  </div>
</template>

<style scoped>
.default-layout {
  width: 100%;
  box-sizing: border-box;
  padding: var(--spacing-xl) var(--spacing-md);
}
</style>
