<template>
  <button
    :type="type"
    :disabled="disabled"
    :class="['base-button', `variant-${variant}`, { 'is-disabled': disabled }, { 'full-width': fullWidth }]">
    <slot />
  </button>
</template>

<script setup>
const props = defineProps({
  type: {
    type: String,
    default: "button",
  },
  variant: {
    type: String,
    default: "primary", // primary, secondary, outline 등
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  fullWidth: {
    type: Boolean,
    default: false,
  },
});
</script>

<style scoped>
.base-button {
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;
  cursor: pointer;
  font-size: 1rem;
}

/* ✅ fullWidth용 스타일 */
.full-width {
  width: 100%;
}

/* 상태별 스타일 */
.variant-primary {
  background-color: var(--color-accent);
  color: var(--color-white);
  border: none;
}

.variant-secondary {
  background-color: var(--color-light);
  border: none;
}

.variant-outline {
  background-color: transparent;
  color: var(--color-dark);
  border: 2px solid var(--color-dark);
}

.is-disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
