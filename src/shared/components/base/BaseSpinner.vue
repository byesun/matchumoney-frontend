<template>
  <div class="spinner-bars" :style="style" aria-label="Loading" role="status">
    <span
      v-for="i in 6"
      :key="i"
      class="bar"
      :style="{
        animationDelay: `${(i - 1) * 0.13}s`,
        background: colorMap[color] || colorMap['accent'],
        width: barWidth,
        height: barHeight,
        margin: barMargin,
      }"
    ></span>
  </div>
</template>

<script setup>
const props = defineProps({
  size: { type: String, default: "md" }, // sm, md, lg
  color: { type: String, default: "accent" },
  style: { type: Object, default: () => ({}) },
});

const colorMap = {
  accent: "var(--color-accent)",
  primary: "var(--color-primary)",
  dark: "var(--color-dark)",
  white: "var(--color-white)",
};

const barWidth =
  props.size === "sm" ? "3px" : props.size === "lg" ? "7px" : "5px";
const barHeight =
  props.size === "sm" ? "16px" : props.size === "lg" ? "32px" : "24px";
const barMargin =
  props.size === "sm" ? "0 2px" : props.size === "lg" ? "0 4px" : "0 3px";
</script>

<style scoped>
.spinner-bars {
  display: flex;
  align-items: flex-end;
  height: 2.5em;
  justify-content: center;
  min-width: 48px;
}

.bar {
  display: block;
  border-radius: 2px;
  animation: bar-bounce-fade 1.05s infinite cubic-bezier(0.2, 0.68, 0.18, 1.08);
  /* width, height, margin, background은 인라인 style로 지정 */
  opacity: 0.2; /* 초기 투명하게 */
  will-change: transform, opacity;
}

/* scaleY와 opacity를 동시에 부드럽게 변화 */
@keyframes bar-bounce-fade {
  0%,
  100% {
    transform: scaleY(0.3);
    opacity: 0.2;
  }
  20% {
    transform: scaleY(1.1);
    opacity: 1;
  }
  50% {
    transform: scaleY(0.6);
    opacity: 0.5;
  }
  80% {
    transform: scaleY(0.3);
    opacity: 0.2;
  }
}
</style>
