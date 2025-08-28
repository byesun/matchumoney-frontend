<template>
  <div class="base-input">
    <label v-if="label" :for="id" class="input-label">{{ label }}</label>
    <input
      :id="id"
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :class="['input-field', { 'input-error': error }]"
      :disabled="disabled"
      @input="$emit('update:modelValue', $event.target.value)"
      @blur="$emit('blur', $event)"
      @focus="$emit('focus', $event)"
      v-bind="attrs"
    />
    <span v-if="error" class="input-error-msg">{{ error }}</span>
  </div>
</template>

<script setup>
import { useAttrs, computed } from "vue";
const props = defineProps({
  modelValue: String,
  label: String,
  type: { type: String, default: "text" },
  id: String,
  placeholder: String,
  error: String,
  disabled: Boolean,
});
const attrs = useAttrs();
</script>

<style scoped>
.base-input {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  width: 100%;
}

.input-label {
  font-size: var(--font-size-sm);
  color: var(--color-dark);
  font-weight: 500;
}

.input-field {
  padding: var(--spacing-sm) var(--spacing-md);
  border: 2px solid var(--color-secondary);
  border-radius: 8px;
  font-size: var(--font-size-base);
  transition: border-color 0.2s, box-shadow 0.2s;
  background: var(--color-white);
  color: var(--text-primary);
}

.input-field:focus {
  outline: none;
  border-color: var(--color-accent);
  box-shadow: 0 0 0 2px var(--color-accent-20);
}

.input-error {
  border-color: var(--color-error);
  background: var(--color-error-light);
}

.input-error-msg {
  font-size: var(--font-size-xs);
  color: var(--color-error-dark);
  margin-top: 0.15rem;
}
</style>
