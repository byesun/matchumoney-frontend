<template>
  <div class="base-card p-4 rounded-xl">
    <!-- 제목 영역 -->
    <h3 v-if="$slots.title" class="title text-lg mb-2">
      <slot name="title" />
    </h3>

    <!-- 본문 내용 -->
    <div v-if="$slots.content" class="card-content">
      <slot name="content" />
    </div>
  </div>
</template>

<script setup></script>

<style scoped>
.base-card {
  border: solid 0.1px lightgray;
  border-radius: 20px;
  background-color: FFF;
  box-shadow: var(--shadow-card);
}

.title {
  font-size: var(--font-size-lg);
  color: var(--color-title);
}
</style>
