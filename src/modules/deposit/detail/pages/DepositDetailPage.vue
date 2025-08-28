<template>
  <div class="container" v-if="depositData">
    <BackButton />
    <div class="deposit-detail-page">
      <section class="persona-banner-section">
        <div class="info-banner">
          <p class="badge">
            <span class="highlight">{{ personaName }}</span> 유형이 많이 찾는
            상품
          </p>
        </div>
      </section>
      <br />
      <section class="card-header">
        <div class="card-image-wrapper">
          <img :src="bankLogoUrl" alt="은행 로고" class="card-image" />
          <div class="reaction-group">
            <LikeToggle
              :productId="depositData.depositProductId"
              productType="deposit-products"
              :initialLiked="isLiked"
              :initialCount="likeCount"
              @update="
                ({ liked, count }) => {
                  isLiked = liked;
                  likeCount = count;
                }
              "
            />
            <CompareButton
              :productId="depositData.depositProductId"
              :productType="productType"
            />
            <FavoriteToggle
              v-model="isFavorite"
              :productId="depositData.depositProductId"
              :productType="productType"
            />
          </div>
        </div>
        <div class="card-info">
          <h2 class="card-title">{{ depositData.finPrdtNm }}</h2>
          <p class="subtitle">{{ depositData.korCoNm }}</p>

          <ul class="card-benefits">
            <li>
              {{ topRateTerm }}개월 기준 최대 금리
              <strong>{{ (topRate * 100).toFixed(2) }}%</strong>
            </li>
            <li>
              {{ baseRateTerm }}개월 기준 기본 금리
              <strong>{{ (baseRate * 100).toFixed(2) }}%</strong>
            </li>
          </ul>

          <div class="button-group">
            <button class="go-to-card" @click="goToCardSite">
              신청하러 바로가기
            </button>
            <button
              class="compare-link full-width"
              @click="
                router.push({ path: '/compare', query: { type: 'DEPOSIT' } })
              "
            >
              비교함 바로가기
            </button>
          </div>

          <div class="card-meta">
            <span
              >가입 방법 : <strong>{{ depositData.joinWay }}</strong></span
            >
          </div>
        </div>
      </section>

      <section class="interest-section">
        <h2 class="section-title">금리 안내</h2>
        <div class="interest-summary">
          <div class="deposit-amount">
            <div class="label">예치금액</div>
            <div class="formatted-input-wrapper">
              <input
                v-model.number="depositAmount"
                class="amount-input"
                type="number"
                min="0"
                step="10000"
              />
              <span class="won-label">원</span>
            </div>
            <div class="input-guide">
              {{ formattedAmount }}원 ({{ formattedAmountMan }}만원)
            </div>
          </div>
          <div class="rate-tab">
            <div
              class="tab"
              :class="{ active: selectedRateType === 'top' }"
              @click="selectedRateType = 'top'"
            >
              최고금리 <strong>{{ (topRate * 100).toFixed(2) }}%</strong>
            </div>
            <div
              class="tab"
              :class="{ active: selectedRateType === 'base' }"
              @click="selectedRateType = 'base'"
            >
              기본금리 <strong>{{ (baseRate * 100).toFixed(2) }}%</strong>
            </div>
          </div>
          <div class="payout-summary">
            <div>
              원금합계 <strong>{{ formattedAmount }}원</strong>
            </div>
            <div>
              세전이자 <strong>+{{ formattedPreTaxInterest }}원</strong>
            </div>
            <div>
              이자과세(15.4%) <strong>-{{ formattedTax }}원</strong>
            </div>
            <div class="total">
              세후수령액 <strong>{{ formattedAfterTax }}원</strong>
            </div>
          </div>
        </div>

        <div class="subsection">
          <div class="term-rates">
            <h4>기간별 금리</h4>
            <table>
              <thead>
                <tr>
                  <th>기간</th>
                  <th>금리</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="option in depositData.options"
                  :key="option.depositOptionId"
                >
                  <td>{{ option.saveTrm }}개월</td>
                  <td>{{ option.intrRate }}%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="subsection">
          <div class="rate-conditions">
            <h4>우대 조건</h4>
            <p>{{ depositData.spclCnd }}</p>
          </div>
        </div>
        <div class="subsection">
          <div class="rate-conditions">
            <h4>만기 후 이자율</h4>
            <p v-html="depositData.mtrtInt?.replaceAll('\n', '<br>')"></p>
          </div>
        </div>
        <div class="subsection">
          <div class="rate-conditions">
            <h4>가입 대상</h4>
            <p>{{ depositData.joinMember }}</p>
          </div>
        </div>
        <div class="subsection">
          <div class="rate-conditions">
            <h4>기타 유의 사항</h4>
            <p>{{ depositData.etcNote }}</p>
          </div>
        </div>
      </section>
      <section class="recommend-buttons">
        <router-link to="/persona/deposits" class="recommend-button green"
          >나의 페르소나로 예금 추천 받기</router-link
        >
        <router-link to="/mydata/deposits" class="recommend-button"
          >마이데이터 기반 예금 추천 받기</router-link
        >
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import BackButton from '@/components/common/BackButton.vue';
import { useRoute, useRouter } from 'vue-router';
import api from '@/api';
import CompareButton from '@/components/common/CompareButton.vue';
import FavoriteToggle from '@/components/common/FavoriteToggle.vue';
import { ProductType } from '@/constants/productTypes';
import LikeToggle from '@/components/common/LikeToggle.vue'; // 이름 변경 후

const productType = ProductType.DEPOSIT;
const personaNameMap = {
  1: '거북이',
  2: '다람쥐',
  3: '개미',
  4: '부엉이',
  5: '토끼',
  6: '고양이',
  7: '호랑이',
  8: '펭귄',
  9: '기타',
};

const getBankInitial = (name) => {
  if (name.includes('신한')) return 'shinhan';
  if (name.includes('하나')) return 'hana';
  if (name.includes('우리')) return 'woori';
  if (name.includes('국민')) return 'kb';
  if (name.includes('농협')) return 'nh';
  if (name.includes('카카오')) return 'kakao';
  if (name.includes('토스')) return 'toss';
  if (name.includes('부산')) return 'bnk';
  if (name.includes('광주')) return 'gwangju';
  if (name.includes('중소기업')) return 'ibk';
  if (name.includes('아이엠')) return 'im';
  if (name.includes('제주')) return 'jeju';
  if (name.includes('전북')) return 'jeonbook';
  if (name.includes('산업')) return 'sanup';
  if (name.includes('수협')) return 'su';
  if (name.includes('SC제일') || name.includes('스탠다드차타드')) return 'sc';
  if (name.includes('케이뱅크') || name.includes('K뱅크')) return 'k';
  return 'shinhan';
};

const getBankLogo = (initial) => {
  const logos = {
    shinhan: new URL('@/assets/bankLogo_images/shinhan.png', import.meta.url)
      .href,
    hana: new URL('@/assets/bankLogo_images/hana.png', import.meta.url).href,
    woori: new URL('@/assets/bankLogo_images/woori.png', import.meta.url).href,
    kb: new URL('@/assets/bankLogo_images/kb.png', import.meta.url).href,
    nh: new URL('@/assets/bankLogo_images/nh.png', import.meta.url).href,
    kakao: new URL('@/assets/bankLogo_images/kakao.png', import.meta.url).href,
    toss: new URL('@/assets/bankLogo_images/toss.png', import.meta.url).href,
    bnk: new URL('@/assets/bankLogo_images/bnk.png', import.meta.url).href,
    gwangju: new URL('@/assets/bankLogo_images/gwangju.png', import.meta.url)
      .href,
    ibk: new URL('@/assets/bankLogo_images/ibk.png', import.meta.url).href,
    im: new URL('@/assets/bankLogo_images/im.png', import.meta.url).href,
    jeju: new URL('@/assets/bankLogo_images/jeju.png', import.meta.url).href,
    jeonbook: new URL('@/assets/bankLogo_images/jeonbook.png', import.meta.url)
      .href,
    sanup: new URL('@/assets/bankLogo_images/sanup.png', import.meta.url).href,
    su: new URL('@/assets/bankLogo_images/su.png', import.meta.url).href,
    sc: new URL('@/assets/bankLogo_images/sc.png', import.meta.url).href,
    k: new URL('@/assets/bankLogo_images/k.png', import.meta.url).href,
  };
  return logos[initial] || logos['shinhan'];
};

// State
const depositData = ref(null);
const depositAmount = ref(10000000);
const likeCount = ref(0);
const isLiked = ref(false);
const isFavorite = ref(false);
const bankLogoUrl = ref('');
const selectedRateType = ref('top');
const userId = ref(null);
const route = useRoute();
const router = useRouter();

// Computed properties
const topRate = computed(() => {
  if (!depositData.value || !depositData.value.options) return 0;
  return (
    Math.max(
      ...depositData.value.options.map((o) => parseFloat(o.intrRate2 || 0))
    ) / 100
  );
});

const baseRate = computed(() => {
  if (!depositData.value || !depositData.value.options) return 0;
  const twelveMonth = depositData.value.options.find((o) => o.saveTrm === '12');
  return (twelveMonth ? parseFloat(twelveMonth.intrRate) : 0) / 100;
});

const topRateTerm = computed(() => {
  if (!depositData.value || !depositData.value.options) return '-';
  const best = depositData.value.options.reduce((prev, curr) => {
    const prevRate = parseFloat(prev?.intrRate2 || 0);
    const currRate = parseFloat(curr?.intrRate2 || 0);
    return currRate > prevRate ? curr : prev;
  }, {});
  return best?.saveTrm || '-';
});

const baseRateTerm = computed(() => {
  if (!depositData.value || !depositData.value.options) return '-';
  const twelveMonth = depositData.value.options.find((o) => o.saveTrm === '12');
  return twelveMonth?.saveTrm || '-';
});

const formattedAmount = computed(() => {
  return depositAmount.value.toLocaleString();
});

const preTaxInterest = computed(() => {
  const rate =
    selectedRateType.value === 'top' ? topRate.value : baseRate.value;
  return depositAmount.value * rate;
});

const tax = computed(() => {
  return preTaxInterest.value * 0.154;
});

const afterTax = computed(() => {
  return depositAmount.value + preTaxInterest.value - tax.value;
});

const formattedPreTaxInterest = computed(() => {
  return Math.round(preTaxInterest.value).toLocaleString();
});

const formattedTax = computed(() => {
  return Math.round(tax.value).toLocaleString();
});

const formattedAfterTax = computed(() => {
  return Math.round(afterTax.value).toLocaleString();
});

const formattedAmountMan = computed(() => {
  return Math.floor(depositAmount.value / 10000).toLocaleString();
});

const personaName = computed(() => {
  return personaNameMap[depositData.value?.personaId] || '기타';
});

// Methods
const toggle = (index) => {
  // Not used in template, but included for parity
  activeIndex.value = activeIndex.value === index ? null : index;
};

// onMounted logic
onMounted(() => {
  const id = route.params.depositId;
  let uid = null;
  try {
    uid = sessionStorage.getItem('userId');
    if (uid) uid = Number(uid);
  } catch (e) {
    uid = null;
  }
  userId.value = uid;
  api
    .get(`/deposit-products/${id}`, {
      params: uid ? { userId: uid } : undefined,
    })
    .then((res) => {
      //console.log(res);
      depositData.value = res.data;
      const initial = getBankInitial(depositData.value.korCoNm || '');
      bankLogoUrl.value = getBankLogo(initial);
      isLiked.value = res.data.liked;
      likeCount.value = res.data.likeCount;
      isFavorite.value = res.data.isStarred ?? false;
    })
    .catch((err) => {
      console.error(err);
    });
});
function goToCardSite() {
  if (depositData.value?.requestUrl) {
    window.open(depositData.value.requestUrl, '_blank');
  }
}
</script>

<style scoped>
.container {
  max-width: 960px;
  margin: 0 auto;
}
.deposit-detail-page {
  padding: 20px;
}

.card-image {
  width: 160px;
  height: auto;
  border-radius: 12px;
  margin-bottom: 10px;
}

.compare-button {
  background: none;
  border: none;
  color: #333;
  font-weight: bold;
  cursor: pointer;
}

.badge {
  color: #4caf50;
  font-weight: bold;
  margin-bottom: 5px;
  font-size: 14px;
}

.card-title {
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 5px;
}

.subtitle {
  font-size: 14px;
  color: #888;
  margin-bottom: 15px;
}

.card-benefits {
  list-style: none;
  padding: 0;
  margin-bottom: 20px;
}

.card-benefits li {
  font-size: 16px;
  margin-bottom: 6px;
}

.button-group {
  display: flex;
  width: 100%;
  margin-top: 10px;
  gap: 12px;
}

.full-width {
  width: 100%;
}

.button-group > .go-to-card,
.button-group > .compare-link {
  flex: 1 1 0;
  width: 100%;
  text-align: center;
  padding: 14px 0;
  font-size: 16px;
  border-radius: 8px;
  font-weight: bold;
}

.go-to-card {
  background-color: #4caf50;
  color: white;
  border: none;
  transition: background-color 0.3s ease;
  cursor: pointer;
}

.go-to-card:hover {
  background-color: #3e8e41;
}

.compare-link {
  background-color: #81c784;
  color: white;
  border: none;
  transition: background-color 0.3s ease;
  cursor: pointer;
}

.compare-link:hover {
  background-color: #66bb6a;
}

.card-meta span {
  display: inline-block;
  margin-right: 16px;
  font-size: 13px;
  color: #777;
}

.benefits-section {
  margin-top: 30px;
}

.benefit-paragraph h4 {
  font-size: 16px;
  font-weight: bold;
  margin-top: 16px;
  margin-bottom: 4px;
}

.benefit-paragraph p {
  font-size: 14px;
  color: #444;
  margin-bottom: 12px;
}

.highlight {
  color: #2e7d32;
  font-weight: 900;
  font-size: 18px;
}

.reaction-group {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 12px;
}

.reaction-button,
.compare-button {
  background-color: #f1f1f1;
  border: none;
  border-radius: 20px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 600;
  color: #333;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.reaction-button:hover,
.compare-button:hover {
  background-color: #e0e0e0;
}

/* 금리 안내 스타일 */
.interest-section {
  margin-top: 40px;
  background: #f9f9f9;
  padding: 20px;
  border-radius: 12px;
}

.interest-summary {
  margin-bottom: 20px;
}

.deposit-amount .label {
  font-size: 14px;
  color: #777;
}

.deposit-amount .value {
  font-size: 24px;
  font-weight: bold;
  margin: 4px 0 12px;
}

.rate-tab {
  display: flex;
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 16px;
}

.rate-tab .tab {
  flex: 1;
  padding: 12px;
  text-align: center;
  background: #fff;
  cursor: pointer;
  font-weight: bold;
  color: #666;
  border-right: 1px solid #ddd;
}

.rate-tab .tab:last-child {
  border-right: none;
}

.rate-tab .tab.active {
  background: #e6f4ec;
  color: #2e7d32;
  border: 2px solid #2e7d32;
  border-radius: 6px;
  margin: -1px;
}

.payout-summary {
  background: #e6f4ec;
  padding: 16px;
  border-radius: 8px;
}

.payout-summary div {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  margin-bottom: 6px;
  font-weight: 500;
}

.payout-summary .total {
  font-size: 16px;
  font-weight: bold;
  color: #2e7d32;
  margin-top: 10px;
}

.term-rates table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
}

.term-rates th,
.term-rates td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: center;
}

.term-rates th {
  background: #f0f0f0;
}

.rate-conditions h4 {
  margin-top: 20px;
}

.rate-conditions ul {
  margin: 8px 0 0;
  padding-left: 18px;
}

.rate-type {
  font-weight: bold;
  margin-top: 10px;
}

/* New styles */
.section-title {
  font-size: 22px;
  font-weight: bold;
  margin-bottom: 24px;
  color: #2e7d32;
}

.subsection {
  background-color: #f5fdf7;
  padding: 12px 16px 16px 16px;
  border-radius: 10px;
  margin-top: 20px;
  border: 1px solid #d6eddc;
}

.subsection h4 {
  font-size: 18px;
  font-weight: bold;
  color: #388e3c;
  margin-bottom: 8px;
  margin-top: 0;
}

.subsection ul {
  margin: 0;
  padding-left: 20px;
}

.subsection p {
  margin: 4px 0 0;
  font-size: 14px;
  color: #444;
}
.benefit-block {
  border-top: 1px solid #e0e0e0;
  padding-top: 16px;
  margin-top: 20px;
}

.benefit-block h4 {
  font-size: 16px;
  font-weight: bold;
  color: #2e7d32;
  margin-bottom: 6px;
}

.benefit-block p {
  font-size: 14px;
  color: #444;
  margin: 0;
}

/* Modern formatted input styles for 예치금액 */
.formatted-input-wrapper {
  position: relative;
  display: inline-block;
  width: 100%;
  border-bottom: 1px solid #333;
  padding-bottom: 6px;
  margin-top: 4px;
}

.amount-input {
  font-size: 24px;
  font-weight: bold;
  border: none;
  outline: none;
  width: 100%;
  padding-right: 40px;
  background: transparent;
}

.won-label {
  position: absolute;
  right: 0;
  bottom: 6px;
  font-weight: bold;
  font-size: 20px;
  color: #333;
}

.input-guide {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}

.info-banner {
  background-color: #f0f8f5;
  border: 1px solid #d2e8dd;
  border-radius: 8px;
  padding: 12px;
  margin-top: 20px;
  text-align: center;
}

.persona-banner-section {
  margin-top: 20px;
}

.card-header {
  position: relative;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  gap: 40px;
  background: #fff;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.card-image-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.favorite-icon {
  position: absolute;
  top: 20px;
  right: 20px;
  font-size: 24px;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.favorite-icon:hover {
  transform: scale(1.2);
}

.card-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 10px;
}

.recommend-buttons {
  display: flex;
  flex-direction: row;
  justify-content: center;
  flex-wrap: wrap;
  gap: 16px;
  margin-top: 40px;
}

.recommend-button {
  display: inline-block;
  padding: 14px 20px;
  border-radius: 8px;
  font-weight: bold;
  font-size: 16px;
  background-color: #fff;
  color: #2e7d32;
  border: 2px solid #2e7d32;
  text-decoration: none;
  transition: background-color 0.3s, color 0.3s;
}

.recommend-button.green {
  background-color: #2e7d32;
  color: #fff;
  border: none;
}

.recommend-button.green:hover {
  background-color: #27682a;
}

.recommend-button:hover {
  background-color: #e0f3e7;
}
.reaction-button.active {
  background-color: #ffe6e6;
  color: red;
}
/* --- Responsive stack for card header on small screens (Deposit) --- */
@media (max-width: 768px) {
  /* Stack image and info vertically */
  .card-header {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
    padding: 20px; /* a bit tighter on mobile */
  }

  /* Image block centered; remove desktop spacing assumptions */
  .card-image-wrapper {
    margin-right: 0;
    align-items: center;
  }

  .card-image {
    padding-top: 50px;
    width: 130px;
    max-width: 60vw;
  }

  /* Info takes full width below image */
  .card-info {
    width: 100%;
  }

  /* Center key texts */
  .subtitle,
  .card-meta {
    text-align: center;
  }

  /* Keep reaction buttons centered under image */
  .reaction-group {
    justify-content: center;
  }

  /* Keep action buttons side-by-side on mobile */
  .button-group {
    flex-direction: row;
  }
  .button-group > .go-to-card,
  .button-group > .compare-link {
    width: auto; /* override desktop full-width */
    flex: 1 1 0; /* share space evenly */
  }
  .card-title{
    text-align: center;
  }
  .card-benefits{
    text-align: center;
  }
}
</style>
