<template>
  <div class="tab-container">
    <div
      v-for="tab in tabs"
      :key="tab.value"
      :class="['tab-item', { active: selectedTab === tab.value }]"
      @click="selectTab(tab.value)"
    >
      {{ tab.label }}
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  initialTab: { type: String, default: 'DEPOSIT' },
});

const emit = defineEmits(['change-tab']);

const tabs = [
  { label: '예금', value: 'DEPOSIT' },
  { label: '적금', value: 'SAVING' },
  { label: '카드', value: 'CARD' },
];

// 부모에서 넘긴 값으로 초기화
const selectedTab = ref(props.initialTab);

// 부모 값이 바뀌면 반영
watch(
  () => props.initialTab,
  (val) => {
    selectedTab.value = val;
  }
);

function selectTab(tabValue) {
  selectedTab.value = tabValue;
  emit('change-tab', tabValue);
}
</script>

<style scoped>
.tab-container {
  display: flex;
  background-color: var(--color-accent); /* 전체 배경 */
  border-radius: 2rem;
  padding: clamp(4px, 1%, 6px);
}

.tab-item {
  transition: 0.3s ease-in-out;
  flex: 1;
  text-align: center;
  padding: clamp(4px, 2%, 12px) 0;
  border-radius: 2rem;
  color: var(--color-white);
  cursor: pointer;
  transition: 0.2s;
  font-size: 1.2rem;
  font-weight: 900;
}

.tab-item.active {
  background-color: var(--color-white);
  color: var(--color-accent);
}

.tab-item:hover {
  background-color: var(--color-dark);
}

.tab-item.active:hover {
  background-color: var(--color-white);
  color: var(--color-accent);
}
</style>
