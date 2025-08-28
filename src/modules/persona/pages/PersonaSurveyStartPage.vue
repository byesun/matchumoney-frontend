<template>
    <div class="card-recommendation-wrapper">
      <BackButton />
      <div class="slider-container">
          <div class="slider-track">
            <img
              v-for="(card, index) in [...cards, ...cards]"
              :key="index"
              :src="card"
              class="card-img"
            />
          </div>
        </div>
      <section class="main-section">
        <!-- 🎠 캐릭터 슬라이더 -->
      
  <br>
        <!-- 텍스트 & 버튼 -->
        <div class="text-box">
          <h2>나만의 페르소나 테스트</h2>
          <p>테스트를 통해 나에게 맞는 금융상품 추천받기</p>
          <br>
          <button class="start-button" @click="goToTest">START</button>
          <!-- 기존 START 버튼 아래에 추가하세요 -->
<p class="note">※ 총 10문항 / 소요 시간 약 2분</p>
<br>
<div class="testimonial-wrapper">
  <div class="testimonial-box">
    <transition name="fade" mode="out-in">
      <div class="testimonial-content" :key="currentIndex">
        <div
          class="single-testimonial"
          v-for="(testimonial, index) in 3"
          :key="index"
        >
          <img :src="testimonials[(currentIndex + index) % testimonials.length].img" alt="사용자 사진" class="user-img" />
          <div class="text-content">
            <div class="user-name">{{ testimonials[(currentIndex + index) % testimonials.length].name }}</div>
            <div class="user-review">{{ testimonials[(currentIndex + index) % testimonials.length].text }}</div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</div>

        </div>
      </section>
    </div>
  </template>
  
  <script setup>
  import { useRouter } from 'vue-router'
  import { ref, onMounted, onBeforeUnmount } from 'vue'
  import BackButton from '@/shared/components/common/BackButton.vue'
  const cards = [
    new URL('@/assets/character_images/ant.png', import.meta.url).href,
    new URL('@/assets/character_images/cat.png', import.meta.url).href,
    new URL('@/assets/character_images/owl.png', import.meta.url).href,
    new URL('@/assets/character_images/penguin.png', import.meta.url).href,
    new URL('@/assets/character_images/rabbit.png', import.meta.url).href,
    new URL('@/assets/character_images/squirrel.png', import.meta.url).href,
    new URL('@/assets/character_images/tiger.png', import.meta.url).href,
    new URL('@/assets/character_images/turtle.png', import.meta.url).href,
  ]
  
  const router = useRouter()
  const goToTest = () => {
    router.push('/survey')
  }

const testimonials = [
  {
    name: '김O지',
    text: '카드 혜택을 몰랐는데, 이걸로 바꿨더니 캐시백이 쏠쏠해요!',
    img: new URL('@/assets/user.png', import.meta.url).href,
  },
  {
    name: '이O현',
    text: '저축만 하던 저에게 투자형 카드를 추천해줘서 색다르고 좋아요.',
    img: new URL('@/assets/user.png', import.meta.url).href,
  },
  {
    name: '박O우',
    text: '페르소나 동물이 너무 귀엽고, 결과도 정확해서 신뢰가 갔어요!',
    img: new URL('@/assets/user.png', import.meta.url).href,
  },
  {
    name: '정O린',
    text: '카드 비교도 해주고 정리도 깔끔해서 보기 편했어요.',
    img: new URL('@/assets/user.png', import.meta.url).href,
  },
  {
    name: '최O빈',
    text: '설문이 재밌고, 결과가 생각보다 정확해서 놀랐어요.',
    img: new URL('@/assets/user.png', import.meta.url).href,
  },
  {
    name: '홍O기',
    text: '금융상품에 대한 설명이 쉬워서 이해하기 좋았어요.',
    img: new URL('@/assets/user.png', import.meta.url).href,
  },
  {
    name: '윤O정',
    text: '페르소나 유형별 추천이 구체적이어서 바로 적용해봤어요.',
    img: new URL('@/assets/user.png', import.meta.url).href,
  },
  {
    name: '서O윤',
    text: '결과가 보기 쉽게 시각화돼 있어서 좋았어요.',
    img: new URL('@/assets/user.png', import.meta.url).href,
  },
  {
    name: '장O수',
    text: '단순히 카드만 보여주는 게 아니라 설명이 잘 되어 있어서 만족!',
    img: new URL('@/assets/user.png', import.meta.url).href,
  },
  {
    name: '배O아',
    text: '예금 추천도 페르소나에 맞춰 나와서 믿고 참고했어요.',
    img: new URL('@/assets/user.png', import.meta.url).href,
  },
]

const currentIndex = ref(0)
let intervalId = null

onMounted(() => {
  intervalId = setInterval(() => {
    currentIndex.value = (currentIndex.value + 1) % testimonials.length
  }, 3000)
})

onBeforeUnmount(() => {
  clearInterval(intervalId)
})

const currentTestimonial = ref(0)


onMounted(() => {
  intervalId = setInterval(() => {
    currentTestimonial.value =
      (currentTestimonial.value + 1) % testimonials.length
  }, 3000)
})

onBeforeUnmount(() => {
  clearInterval(intervalId)
})
  </script>
  
  <style scoped>
  .card-recommendation-wrapper {
    font-family: 'Noto Sans KR', sans-serif;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 2rem 1rem;
  }
  
  .main-section {
    text-align: center;
    width: 100%;
    max-width: 1200px;
  }
  
  .slider-container {
    overflow: hidden;
    width: 100%;
    margin-bottom: 2rem;
  }
  
  .slider-track {
    display: flex;
    width: calc(250px * 16);
    animation: scroll 20s linear infinite;
    gap: 2rem;
  }
  
  .card-img {
  width: 160px;
  height: auto;
  border-radius: 12px;
  margin: 0 1rem;
  flex-shrink: 0;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}
.card-img:hover {
  transform: translateY(-6px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15); /* 💡 hover 시 더 강조 */
}
  
  @keyframes scroll {
    0% {
      transform: translateX(0);
    }
    100% {
      transform: translateX(-50%);
    }
  }
  
  .text-box h2 {
    font-size: 2rem;
    font-weight: bold;
    margin-bottom: 0.5rem;
  }
  .text-box p {
    font-size: 1.1rem;
    color: #666;
    margin-bottom: 1.5rem;
  }
  
  .start-button {
    background: #9dc08b;
    color: white;
    padding: 1rem 2.8rem;
    font-size: 1.3rem;
    font-weight: bold;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    margin-right: 1rem;
  }
  
  .premium-button {
    background: linear-gradient(to right, #453222, #b27950);
    color: white;
    font-size: 0.95rem;
    padding: 0.9rem 2rem;
    border: none;
    border-radius: 6px;
    cursor: pointer;
  }
  .note {
  color: #666;
  font-size: 0.95rem;
  margin-top: 1.2rem;
}
.testimonial-wrapper {
  display: flex;
  justify-content: center;
  padding: 2rem 1rem;
  background-color: #f9fafb;
  border-top: 1px solid #e0e0e0;
  margin-top: 2rem;
}

.testimonial-box {
  background: #fff;
  padding: 1rem;
  width: 100%;
  max-width: 1080px;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.testimonial-content {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 2rem;
  transition: transform 0.5s ease;
}

.single-testimonial {
  flex: 0 0 calc(33.333% - 2rem);
  display: flex;
  align-items: center;
  gap: 1rem;
  min-width: 280px;
}

.user-img {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 50%;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}

.text-content {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.user-name {
  font-weight: bold;
  font-size: 1rem;
  margin-bottom: 0.3rem;
  color: #333;
}

.user-review {
  font-size: 0.9rem;
  color: #555;
  line-height: 1.4;
}

/* 페이드 전환 효과 */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}


  </style>