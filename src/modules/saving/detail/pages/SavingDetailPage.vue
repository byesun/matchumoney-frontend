<template>
  <div class="container" v-if="savingData">
    <BackButton />
    <div class="saving-detail-page">
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
              :productId="savingData.savingProductId"
              productType="saving-products"
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
              :productId="savingData.savingProductId"
              :productType="productType"
            />
            <FavoriteToggle
              v-model="isFavorite"
              :productId="savingData.savingProductId"
              :productType="productType"
            />
          </div>
        </div>
        <div class="card-info">
          <h2 class="card-title">{{ savingData.finPrdtNm }}</h2>
          <p class="subtitle">{{ savingData.korCoNm }}</p>
          <p class="max-limit" v-if="savingData.maxLimit">
            월별 최대 저축 한도:
            <strong>
              {{
                parseInt(savingData.maxLimit.replace(/[^\d]/g, '')) ===
                999999999
                  ? '한도 설정 안함'
                  : Number(
                      savingData.maxLimit.replace(/[^\d]/g, '')
                    ).toLocaleString() + '원'
              }}
            </strong>
          </p>
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
            <button class="go-to-card full-width" @click="goToBank">
              신청하러 바로가기
            </button>
            <button
              class="compare-link full-width"
              @click="
                router.push({ path: '/compare', query: { type: 'SAVING' } })
              "
            >
              비교함 바로가기
            </button>
          </div>
          <div class="card-meta">
            <span
              >가입 방법 : <strong>{{ savingData.joinWay }}</strong></span
            >
          </div>
        </div>
      </section>

      <section class="interest-section">
        <h2 class="section-title">금리 안내</h2>
        <div class="interest-summary">
          <p class="interest-caption">12개월 만기시 세후수령액 (단리)</p>
          <div class="saving-amount">
            <div class="label">월 적립액</div>
            <div class="formatted-input-wrapper">
              <input
                v-model.number="savingAmount"
                class="amount-input"
                type="number"
                min="0"
                step="10000"
              />
              <span class="won-label">원</span>
            </div>
            <div class="input-guide">{{ formattedAmountMan }}만원</div>
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
              원금합계
              <strong>{{ (savingAmount * 12).toLocaleString() }}원</strong>
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
                  v-for="option in savingData.options"
                  :key="option.savingOptionId"
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
            <p>{{ savingData.spclCnd }}</p>
          </div>
        </div>
        <div class="subsection">
          <div class="rate-conditions">
            <h4>만기 후 이자율</h4>
            <p v-html="savingData.mtrtInt?.replaceAll('\n', '<br>')"></p>
          </div>
        </div>
        <div class="subsection">
          <div class="rate-conditions">
            <h4>가입 대상</h4>
            <p>{{ savingData.joinMember }}</p>
          </div>
        </div>
        <div class="subsection">
          <div class="rate-conditions">
            <h4>기타 유의 사항</h4>
            <p>{{ savingData.etcNote }}</p>
          </div>
        </div>
      </section>
      <section class="recommend-buttons">
        <router-link to="/persona/savings" class="recommend-button green"
          >나의 페르소나로 적금 추천 받기</router-link
        >
        <router-link to="/mydata/savings" class="recommend-button"
          >마이데이터 기반 적금 추천 받기</router-link
        >
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '@/api';
import favorite from '@/api/favorite';
import FavoriteToggle from '@/components/common/FavoriteToggle.vue';
import { ProductType } from '@/constants/productTypes';
import LikeToggle from '@/components/common/LikeToggle.vue';
import CompareButton from '@/components/common/CompareButton.vue';
import BackButton from '@/components/common/BackButton.vue';

const productType = ProductType.SAVING;

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

const route = useRoute();
const router = useRouter();

const savingData = ref(null);
const savingAmount = ref(10000);
const likeCount = ref(0);
const isLiked = ref(false);
const isFavorite = ref(false);
const bankLogoUrl = ref('');
const selectedRateType = ref('top');
const userId = ref(null);

const topRate = computed(() => {
  if (!savingData.value?.options) return 0;
  return (
    Math.max(
      ...savingData.value.options.map((o) => parseFloat(o.intrRate2 || 0))
    ) / 100
  );
});

const baseRate = computed(() => {
  if (!savingData.value?.options) return 0;
  const twelveMonth = savingData.value.options.find((o) => o.saveTrm === '12');
  return (twelveMonth ? parseFloat(twelveMonth.intrRate) : 0) / 100;
});

const topRateTerm = computed(() => {
  if (!savingData.value?.options) return '-';
  const best = savingData.value.options.reduce((prev, curr) => {
    const prevRate = parseFloat(prev?.intrRate2 || 0);
    const currRate = parseFloat(curr?.intrRate2 || 0);
    return currRate > prevRate ? curr : prev;
  }, {});
  return best?.saveTrm || '-';
});

const baseRateTerm = computed(() => {
  if (!savingData.value?.options) return '-';
  const twelveMonth = savingData.value.options.find((o) => o.saveTrm === '12');
  return twelveMonth?.saveTrm || '-';
});

const preTaxInterest = computed(() => {
  const rate =
    selectedRateType.value === 'top' ? topRate.value : baseRate.value;
  const months = 12;
  if (
    !savingData.value?.intrRateTypeNm ||
    savingData.value.intrRateTypeNm.includes('단리')
  ) {
    return (((savingAmount.value * months * (months + 1)) / 2) * rate) / 12;
  } else {
    let total = 0;
    for (let i = 0; i < months; i++) {
      total += savingAmount.value * Math.pow(1 + rate / 12, months - i);
    }
    return total - savingAmount.value * months;
  }
});

const tax = computed(() => preTaxInterest.value * 0.154);
const afterTax = computed(
  () => savingAmount.value * 12 + preTaxInterest.value - tax.value
);

const formattedPreTaxInterest = computed(() =>
  Math.round(preTaxInterest.value).toLocaleString()
);
const formattedTax = computed(() => Math.round(tax.value).toLocaleString());
const formattedAfterTax = computed(() =>
  Math.round(afterTax.value).toLocaleString()
);
const formattedAmountMan = computed(() =>
  Math.floor(savingAmount.value / 10000).toLocaleString()
);
const personaName = computed(
  () => personaNameMap[savingData.value?.personaId] || '기타'
);

const handleLikeClick = () => {
  if (!userId.value) {
    if (confirm('로그인이 필요합니다. 로그인 페이지로 이동할까요?')) {
      router.push('/login');
    }
    return;
  }
  toggleLike();
};

const goToBank = () => {
  const url = savingData.value?.requestUrl || savingData.value?.requesturl;
  if (!url) {
    alert('이 상품의 신청 페이지 URL이 없습니다.');
    return;
  }
  try {
    // 새 탭에서 열기 (보안상 noopener 사용)
    window.open(url, '_blank', 'noopener');
  } catch (e) {
    // 팝업 차단 등의 이슈가 있을 때 현재 탭으로 이동
    window.location.href = url;
  }
};

const toggleLike = () => {
  if (!savingData.value) return;
  const id =
    savingData.value.savingProductId ||
    savingData.value.savingId ||
    savingData.value.id;
  const likePromise = isLiked.value
    ? api.delete(`/saving-products/${id}/likes`)
    : api.post(`/saving-products/${id}/likes`);
  likePromise
    .then((res) => {
      isLiked.value = res.data.liked;
      likeCount.value = res.data.likeCount;
    })
    .catch((err) => console.error(err));
};

const toggleFavorite = async () => {
  if (!userId.value) {
    if (confirm('로그인이 필요합니다. 로그인 페이지로 이동할까요?')) {
      router.push('/login');
    }
    return;
  }
  const productId =
    savingData.value?.savingProductId ||
    savingData.value?.savingId ||
    savingData.value?.id;
  const productType = 'SAVING';
  try {
    if (isFavorite.value) {
      await favorite.deleteFavorite(productId, productType);
    } else {
      await favorite.addFavorite(productId, productType);
    }
    isFavorite.value = !isFavorite.value;
  } catch (error) {
    console.error('즐겨찾기 처리 중 오류 발생:', error);
  }
};

onMounted(() => {
  const id = route.params.savingId;

  // 세션에서 userId 안전하게 읽기
  let uid = null;
  try {
    const raw = sessionStorage.getItem('userId');
    uid = raw ? Number(raw) : null;
    if (Number.isNaN(uid)) uid = null;
  } catch (e) {
    uid = null;
  }
  userId.value = uid;

  // ✅ userId 있으면 쿼리로 전달 (백엔드가 isStarred 계산 가능)
  api
    .get(`/saving-products/${id}`, {
      params: userId.value ? { userId: userId.value } : undefined,
    })
    .then((res) => {
      savingData.value = res.data;
      const initial = getBankInitial(res.data.korCoNm || '');
      bankLogoUrl.value = getBankLogo(initial);

      // ✅ 초기 상태들 세팅 (예금 페이지와 동일 패턴)
      isLiked.value = res.data.liked ?? false;
      likeCount.value = res.data.likeCount ?? 0;
      isFavorite.value = res.data.isStarred ?? false; // ← 핵심
    })
    .catch((err) => console.error(err));
});
</script>

<style scoped>
.container {
  max-width: 960px;
  margin: 0 auto;
}
.saving-detail-page {
  padding: 20px;
}

.card-header {
  display: flex;
  background: #fff;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  align-items: center;
  justify-content: space-between;
  position: relative;
}

.card-image-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-right: 40px;
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

.card-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
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
  gap: 10px;
  margin-bottom: 10px;
}

.full-width {
  width: 100%;
}

.go-to-card {
  background-color: #4caf50;
  color: white;
  border: none;
  padding: 12px 0;
  font-weight: bold;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.go-to-card:hover {
  background-color: #3e8e41;
}

.compare-link {
  background-color: #81c784;
  color: white;
  border: none;
  padding: 12px 0;
  font-weight: bold;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s ease;
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

.saving-amount .value {
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
</style>
<style scoped>
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

.won-label {
  position: absolute;
  right: 0;
  bottom: 6px;
  font-weight: bold;
  font-size: 20px;
  color: #333;
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

.max-limit {
  color: #2e7d32;
  font-weight: bold;
  margin-bottom: 10px;
  font-size: 16px;
  text-decoration: underline;
}

.saving-amount .label {
  font-weight: bold;
  font-size: 14px;
  color: #444;
  margin-bottom: 6px;
}

.amount-input {
  font-size: 28px;
  font-weight: bold;
  border: none;
  outline: none;
  width: 100%;
  padding-right: 40px;
  background: transparent;
  text-align: left;
}

.formatted-input-wrapper {
  position: relative;
  display: inline-block;
  width: 100%;
  border-bottom: 2px solid #222;
  padding-bottom: 6px;
  margin-top: 4px;
}

.input-guide {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}

.interest-caption {
  font-size: 14px;
  color: #666;
  margin-bottom: 10px;
  font-weight: 500;
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

/* --- Responsive stack for card header on small screens (Saving) --- */
@media (max-width: 768px) {
  /* Stack image and info vertically */
  .card-header {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
    padding: 20px; /* tighter on mobile */
  }

  /* Center image block; remove desktop margin */
  .card-image-wrapper {
    margin-right: 0;
    align-items: center;
  }

  .card-image {
    padding-top: 50px;
    width: 130px;
    max-width: 60vw;
  }

  /* Info takes full width */
  .card-info {
    width: 100%;
  }

  /* Center texts under the title area */
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
    width: auto; /* override .full-width */
    flex: 1 1 0; /* share space evenly */
  }
  .card-title,
  .subtitle,
  .card-benefits,
  .max-limit {
    text-align: center;
  }
}
</style>
