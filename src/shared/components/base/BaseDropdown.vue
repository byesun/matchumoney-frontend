<template>
  <div class="base-dropdown">
    <label v-if="label" class="dropdown-label">{{ label }}</label>
    <div class="dropdown-flex">
      <!-- 직접입력 선택시 드롭다운 앞에 인풋 표시 -->
      <BaseInput
        v-if="showCustomInput"
        v-model="customDomainValue"
        :placeholder="customPlaceholder"
        class="dropdown-custom-input"
        :id="`${id}-custom`"
      />
      <div class="dropdown-wrapper" :class="{ 'dropdown-open': isOpen }">
        <select
          class="dropdown-select"
          :class="{ 'dropdown-error': error }"
          :disabled="disabled"
          :value="modelValue"
          @change="onChange"
          @focus="isOpen = true"
          @blur="isOpen = false"
          :id="id"
          v-bind="attrs"
        >
          <option v-if="placeholder" disabled value="">
            {{ placeholder }}
          </option>
          <option
            v-for="(option, idx) in options"
            :key="optionKey(option, idx)"
            :value="optionValue(option)"
          >
            <slot name="option" :option="option">
              {{ optionLabel(option) }}
            </slot>
          </option>
        </select>
        <span class="dropdown-arrow" :class="{ open: isOpen }">
          <svg
            v-if="!isOpen"
            width="18"
            height="18"
            viewBox="0 0 20 20"
            fill="none"
          >
            <path
              d="M6 8l4 4 4-4"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            />
          </svg>
          <svg v-else width="18" height="18" viewBox="0 0 20 20" fill="none">
            <path
              d="M6 12l4-4 4 4"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            />
          </svg>
        </span>
      </div>
    </div>
    <span v-if="error" class="dropdown-error-msg">{{ error }}</span>
  </div>
</template>

<script setup>
import { ref, watch, computed } from "vue";
import { useAttrs } from "vue";
import BaseInput from "./BaseInput.vue";

const props = defineProps({
  modelValue: [String, Number],
  options: { type: Array, required: true }, // [{label, value}] or string[]
  label: String,
  placeholder: String,
  error: String,
  disabled: Boolean,
  id: String,
  customInputValue: String, // (선택) 직접입력 값 상위컴포넌트에서 관리하려면
  customPlaceholder: { type: String, default: "도메인 입력" },
  customOptionValue: { type: String, default: "직접입력" }, // 직접입력 옵션 value
  optionLabelKey: { type: String, default: "label" },
  optionValueKey: { type: String, default: "value" },
});

const emit = defineEmits([
  "update:modelValue",
  "update:customInputValue",
  "change",
]);

const attrs = useAttrs();
const isOpen = ref(false);

// 직접입력인지 감지
const showCustomInput = computed(
  () => props.modelValue === props.customOptionValue
);

// customInputValue를 내부에서도 관리(상위에서 prop 주면 sync)
const customDomainValue = ref(props.customInputValue || "");

watch(
  () => props.customInputValue,
  (v) => {
    if (v !== undefined) customDomainValue.value = v;
  }
);

// select 변경시
function onChange(e) {
  emit("update:modelValue", e.target.value);
  emit("change", e.target.value);
}

// option label/value 추출 (객체/문자열 지원)
const optionLabel = (option) =>
  typeof option === "object" ? option[props.optionLabelKey] : option;
const optionValue = (option) =>
  typeof option === "object" ? option[props.optionValueKey] : option;
const optionKey = (option, idx) =>
  typeof option === "object" ? option[props.optionValueKey] : idx;

// customInput 변경시 상위 반영(양방향 sync)
watch(customDomainValue, (v) => {
  emit("update:customInputValue", v);
});
</script>

<style scoped>
.base-dropdown {
  display: flex;
  flex-direction: column;
  gap: 0.28rem;
  width: 100%;
}
.dropdown-label {
  font-size: var(--font-size-sm);
  color: var(--color-dark);
  font-weight: 500;
}
.dropdown-flex {
  display: flex;
  align-items: center;
  gap: 6px;
}
.dropdown-custom-input {
  flex: 1.3;
  min-width: 0;
}
.dropdown-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  flex: 1.3;
  min-width: 0;
}
.dropdown-select {
  width: 100%;
  padding: var(--spacing-sm) var(--spacing-xl) var(--spacing-sm)
    var(--spacing-md);
  border: 2px solid var(--color-secondary);
  border-radius: 8px;
  font-size: var(--font-size-base);
  background: var(--color-white);
  color: var(--text-primary);
  transition: border-color 0.2s, box-shadow 0.2s;
  appearance: none;
}
.dropdown-select:focus {
  border-color: var(--color-accent);
  box-shadow: 0 0 0 2px var(--color-accent-20);
  outline: none;
}
.dropdown-error {
  border-color: var(--color-error);
  background: var(--color-error-light);
}
.dropdown-arrow {
  position: absolute;
  right: var(--spacing-md);
  pointer-events: none;
  color: var(--color-accent);
  display: flex;
  align-items: center;
  height: 100%;
  transition: color 0.18s;
}
.dropdown-arrow.open {
  color: var(--color-dark);
}
.dropdown-error-msg {
  font-size: var(--font-size-xs);
  color: var(--color-error-dark);
  margin-top: 0.16rem;
}
</style>
