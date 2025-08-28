<script setup>
import { ref, watch } from 'vue';
import SavingMyProductSlider from '../components/SavingMyProductSlider.vue';
import BankbookProductList from '@/modules/bankbook/components/BankbookProductList.vue';
import RecommendationLayout from '@/shared/components/layouts/RecommendationLayout.vue';
import savingApi from '@/modules/saving/api/savings';
import Loading from '@/shared/components/common/Loading.vue';
import BackButton from '@/shared/components/common/BackButton.vue';

const selectedId = ref(null);
const savings = ref([]);
const savingsCache = ref({}); // { [id]: { list: [], isEmpty: bool } }
const isEmpty = ref(false);
const loading = ref(false);
const size = 5;

// 애니메이션 트리거용 key
const animationKey = ref(0);

const fetchSavings = async () => {
  if (!selectedId.value) return;

  loading.value = true;
  try {
    const result = await savingApi.getRecommendSavings(
      selectedId.value,
      0,
      size
    );
    const isResultEmpty = selectedId.value !== -1 && result.length === 0;

    savingsCache.value[selectedId.value] = {
      list: result,
      isEmpty: isResultEmpty,
    };

    savings.value = result;
    isEmpty.value = isResultEmpty;
  } finally {
    loading.value = false;
  }
};

const fetchDefaultSavings = async () => {
  loading.value = true;
  try {
    const result = await savingApi.getRecommendSavings(-1, 0, size);

    savingsCache.value[selectedId.value] = {
      list: result,
      isEmpty: true, // 기본은 항상 empty 취급
    };

    savings.value = result;
    isEmpty.value = true;
  } finally {
    loading.value = false;
  }
};

watch(
  selectedId,
  async (newId) => {
    if (newId == null) return;

    // 캐시에 데이터 있는 경우 즉시 사용
    const cached = savingsCache.value[newId];
    if (cached) {
      savings.value = cached.list;
      isEmpty.value = cached.isEmpty;
      animationKey.value++; // 애니메이션 트리거
      return;
    }

    savings.value = [];

    await fetchSavings();

    if (savings.value.length === 0) {
      await fetchDefaultSavings();
    }

    animationKey.value++;
  },
  { immediate: true }
);
</script>

<template>
  <div class="content-my">
    <RecommendationLayout title="맞춤 적금">
      <BackButton />
      <!-- 상단 슬라이더 -->
      <template #slider>
        <SavingMyProductSlider
          @select="(id) => (selectedId = id)"
          v-model:loading="loading"
        />
      </template>

      <!-- 하이라이트 문구 -->
      <template #highlight v-if="selectedId == -1">
        <div>적금을 불러와주세요.</div>
        <div>인기 적금부터 안내드릴게요.</div>
      </template>
      <template #highlight v-else-if="isEmpty">
        <div>현재 적금보다 나은 상품은 없지만</div>
        <div>인기 적금을 함께 보여드릴게요!</div>
      </template>
      <template #highlight v-else-if="savings.length > 0">
        <div>더 나은 적금이 있어요.</div>
        <div>비교해보고 선택해보세요.</div>
      </template>

      <!-- 상품 리스트 -->
      <template #content>
        <BankbookProductList
          :selectedId="selectedId"
          :savings="savings"
          :animation-key="animationKey"
        />
      </template>
    </RecommendationLayout>

    <!-- 전체 로딩 -->
    <Loading :loading="loading" />
  </div>
</template>

<style scoped>
.content-my {
  width: 80%;
  margin: auto;
  padding: 2rem 0;
}

@media (max-width: 640px) {
  .content-my {
    width: 90%;
  }
}
</style>
