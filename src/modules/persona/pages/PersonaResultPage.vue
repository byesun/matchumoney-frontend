<template>
  <div class="result-wrapper" v-if="loaded && persona">
    <div class="result-container fade-in">
      <!-- 프로필 -->
      <div class="profile-section">
        <img
          :src="persona.imageUrl"
          :alt="persona.nameKo"
          class="persona-image"
        />
        <h3 class="type-describe">"{{ persona.quote }}"</h3>
        <div class="persona-text">
          <!-- TODO: 추후 사용자님 → 실제 로그인 유저 닉네임으로 교체 예정 -->
          <p class="label">사용자님의 페르소나 동물은</p>
          <h2 class="type-name">{{ persona.nameKo }}</h2>
          <br />
          <div class="tags">
            <span v-for="tag in persona.tags" :key="tag">#{{ tag }}</span>
          </div>
        </div>
      </div>

      <!-- 성향 설명 -->
      <section class="section-box">
        <h3>✨ 당신은 {{ persona.userType }}입니다</h3>
        <p>{{ persona.description }}</p>
      </section>

      <!-- 추천 상품 성향 -->
      <section class="section-box">
        <h3>💡 이런 성향이라면 이런 상품이 잘 맞아요</h3>
        <ul class="checklist">
          <li v-for="rec in persona.recommendations" :key="rec.title">
            <strong>{{ rec.title }}</strong
            ><br />
            {{ rec.detail }}
          </li>
        </ul>
      </section>

      <!-- 버튼 -->
      <div class="cta-group">
        <RouterLink
          class="cta-button text-decoration-none"
          :to="`/persona/cards?persona=${persona.code}`"
        >
          카드 추천 받기
        </RouterLink>
        <RouterLink
          class="cta-button text-decoration-none"
          :to="`/persona/deposits?persona=${persona.code}`"
        >
          예금 추천 받기
        </RouterLink>
        <RouterLink
          class="cta-button text-decoration-none"
          :to="`/persona/savings?persona=${persona.code}`"
        >
          적금 추천 받기
        </RouterLink>
      </div>
    </div>
  </div>

  <!-- 로딩 & 에러 -->
  <div v-else class="result-wrapper align-center justify-center">
    <p v-if="error">{{ error }}</p>
    <p v-else>로딩 중...</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, RouterLink } from 'vue-router';
import api from "@/shared/api";

const route = useRoute();
const persona = ref(null);
const loaded = ref(false);
const error = ref('');

onMounted(async () => {
  try {
    const code = route.params.code || 'ant';

    // 한 번의 API 호출로 모든 데이터 가져오기
    const { data } = await api.get(`/persona/${code}`);
    persona.value = data;

    console.log('Received data:', data); // 디버깅용
  } catch (e) {
    console.error('API Error:', e); // 디버깅용
    error.value = '데이터를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.';
  } finally {
    loaded.value = true;
  }
});
</script>

<style scoped>
/***** 기존 스타일 그대로 *****/
.result-wrapper {
  padding: 2rem;
  min-height: 100vh;
  max-width: 1080px;
  margin: 0 auto;
  display: flex;
  justify-content: center;
  align-items: center;
}

.result-container {
  max-width: 720px;
  width: 100%;
  background: white;
  border: 1px solid #4caf50;
  border-radius: 20px;
  padding: 3rem;
}

.profile-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 2rem;
}

.persona-image {
  width: 130px;
  height: 130px;
}

.persona-text {
  text-align: center;
}

.label {
  font-size: 1rem;
  color: #444;
}

.type-name {
  font-size: 1.8rem;
  font-weight: bold;
  margin: 0.3rem 0;
}

.tags span {
  display: inline-block;
  background: #d8edda;
  color: #2e7d32;
  border-radius: 15px;
  padding: 0.3rem 0.8rem;
  font-size: 0.8rem;
  margin: 0 0.2rem;
}

.section-box {
  background-color: #fafafa;
  padding: 1.5rem;
  border-radius: 12px;
  margin-bottom: 1.5rem;
}

.section-box h3 {
  font-size: 1rem;
  margin-bottom: 0.8rem;
  color: #444;
}

.section-box p {
  font-size: 0.95rem;
  color: #555;
  line-height: 1.5;
}

.checklist li {
  margin-bottom: 1rem;
  font-size: 0.95rem;
  color: #333;
}

.cta-button {
  display: block;
  width: 100%;
  background-color: transparent;
  color: #2e7d32;
  font-size: var(--font-size-base);
  padding: 0.75rem;
  border: 2px solid #4caf50;
  border-radius: 10px;
  cursor: pointer;
  transition: background-color 0.3s, color 0.3s;
  text-align: center;
}

.cta-button:hover {
  background-color: #e8f5e9;
}

.type-describe {
  font-size: 1.3rem;
  font-weight: bold;
  margin: 0.3rem 0;
}
.cta-group {
  display: flex;
  flex-direction: row;
  gap: 1rem;
  margin-top: 2rem;
}
</style>
