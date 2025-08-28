<template>
  <div class="saving-swiper-container">
    <Swiper
      :modules="[Pagination]"
      :slides-per-view="1"
      :space-between="16"
      :loop="false"
      class="saving-swiper"
      :pagination="{ clickable: true, el: '.custom-pagination' }"
      @slideChange="onSlideChange"
      ref="swiperRef"
    >
      <SwiperSlide v-for="(item, index) in savingList" :key="index">
        <SavingMyProductCard :saving="item" />
      </SwiperSlide>
      <SwiperSlide>
        <SavingReloadCard
          :listLength="savingList.length"
          v-model:loading="isLoading"
        />
      </SwiperSlide>
    </Swiper>

    <!-- ✅ Swiper 바깥쪽에 고정된 pagination DOM -->
    <div class="custom-pagination"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, defineEmits, defineProps, computed } from 'vue';
import { Swiper, SwiperSlide } from 'swiper/vue';
import { Pagination } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/pagination';

import SavingMyProductCard from './SavingMyProductCard.vue';
import savingApi from '@/api/savings';
import SavingReloadCard from './SavingReloadCard.vue';

const emit = defineEmits(['update:loading', 'select']);

const props = defineProps({
  loading: {
    type: Boolean,
    default: false,
  },
});

const isLoading = computed({
  get: () => props.loading,
  set: (value) => emit('update:loading', value),
});

const savingList = ref([]);

const onSlideChange = (swiper) => {
  const currentIndex = swiper.activeIndex;
  if (currentIndex === savingList.value.length) {
    emit('select', '-1');
    return;
  }
  const selected = savingList.value[currentIndex];
  if (selected) {
    emit('select', selected.id);
  }
};

onMounted(async () => {
  isLoading.value = true;
  try {
    const data = await savingApi.getList();
    savingList.value = data;
    if (data.length > 0) {
      emit('select', data[0].id);
    } else {
      emit('select', '-1');
    }
  } catch (e) {
    console.log(e);
  } finally {
    isLoading.value = false;
  }
});
</script>

<style scoped>
.saving-swiper-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

.custom-pagination {
  margin-top: 1.2rem;
  display: flex;
  justify-content: center;
}

.custom-pagination .swiper-pagination-bullet {
  background: #a12c2c;
  opacity: 0.5;
  width: 8px;
  height: 8px;
  margin: 0 3px;
  border-radius: 50%;
  transition: background 0.3s;
}

.saving-swiper-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 100%; /* 카드 최대 너비 */
  overflow: hidden;
}

.saving-swiper {
  width: 100%;
  overflow: hidden;
}

::v-deep(.swiper-slide) {
  display: flex;
  justify-content: center;
}

::v-deep(.swiper-slide > *) {
  width: 100%;
  max-width: 100%;
}
::v-deep(.custom-pagination .swiper-pagination-bullet) {
  background: #d5d5d5;
  opacity: 1;
}
::v-deep(.swiper-pagination-bullet-active) {
  background: var(--color-accent) !important;
}
</style>
