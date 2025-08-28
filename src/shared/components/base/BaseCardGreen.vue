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
  border-radius: 20px;
  background-color: var(--color-primary);
  box-shadow: var(--shadow-card);
}

.title {
  color: var(--color-title);
  font-weight: bold;
}
</style>
