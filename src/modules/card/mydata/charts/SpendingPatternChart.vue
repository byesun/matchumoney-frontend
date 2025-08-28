<template>
  <div class="spending-pattern-chart">
    <!-- 차트 타입 선택 버튼 (오른쪽 위) -->
    <div class="chart-controls">
      <button
        @click="changeChartType('bar')"
        :class="['chart-type-btn', { active: chartType === 'bar' }]"
        title="막대 차트"
      >
        <i class="bi bi-bar-chart-fill"></i>
      </button>
      <button
        @click="changeChartType('doughnut')"
        :class="['chart-type-btn', { active: chartType === 'doughnut' }]"
        title="도넛 차트"
      >
        <i class="bi bi-pie-chart-fill"></i>
      </button>
    </div>

    <canvas ref="chartRef"></canvas>

    <!-- 도넛 차트용 색상별 범례 (차트 아래) -->
    <div
      v-if="chartType === 'doughnut' && topCategories.length > 0"
      class="doughnut-legend"
    >
      <div
        v-for="(category, index) in topCategories.slice(0, 5)"
        :key="category.category"
        class="legend-item"
      >
        <div
          class="legend-color"
          :style="{ backgroundColor: getColorByIndex(index) }"
        ></div>
        <span class="legend-category">{{ category.category }}</span>
        <span class="legend-percentage"
          >{{ calculatePercentage(category.amount) }}%</span
        >
      </div>
    </div>
    <div v-if="!topCategories.length" class="no-data">
      소비 내역 데이터가 없습니다.
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue';
import {
  Chart,
  BarController,
  BarElement,
  DoughnutController,
  ArcElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from 'chart.js';

// Props: 거래내역 배열
const props = defineProps({
  transactions: {
    type: Array,
    default: () => [],
  },
});

// Chart.js 참조용
const chartRef = ref(null);
let chartInstance = null;

// 차트 타입 상태 (기본값: 막대형)
const chartType = ref('bar');

// 카테고리별 합계 집계
const categorySums = computed(() => {
  const sums = {};
  for (const tx of props.transactions) {
    // 거래내역 필드명 매핑
    let category =
      tx.resMemberStoreType ||
      tx.merchantCategory ||
      tx.res_member_store_type ||
      tx.category;
    let amount = Math.abs(
      Number(tx.resUsedAmount || tx.amount || tx.res_used_amount || 0)
    );

    // 카테고리가 없거나 빈 값인 경우 가맹점명으로 분류
    if (!category || category.trim() === '') {
      const merchantName =
        tx.resMemberStoreName ||
        tx.merchantName ||
        tx.res_member_store_name ||
        '';
      if (merchantName) {
        // 간단한 카테고리 분류 로직
        category = getCategoryFromMerchant(merchantName);
      } else {
        category = '기타';
      }
    }

    if (!sums[category]) sums[category] = 0;
    sums[category] += amount;
  }
  return sums;
});

// 가맹점명으로부터 카테고리 추론
const getCategoryFromMerchant = (merchantName) => {
  const name = merchantName.toLowerCase();
  if (name.includes('마트') || name.includes('마켓') || name.includes('편의점'))
    return '생활/마트';
  if (
    name.includes('주유소') ||
    name.includes('gs칼텍스') ||
    name.includes('sk에너지')
  )
    return '주유/교통';
  if (
    name.includes('카페') ||
    name.includes('스타벅스') ||
    name.includes('맥도날드') ||
    name.includes('음식')
  )
    return '음식/카페';
  if (name.includes('병원') || name.includes('약국') || name.includes('의료'))
    return '의료/건강';
  if (
    name.includes('온라인') ||
    name.includes('쇼핑') ||
    name.includes('아마존') ||
    name.includes('쿠팡')
  )
    return '온라인쇼핑';
  return '기타';
};

// 상위 5개 카테고리 추출
const topCategories = computed(() => {
  const entries = Object.entries(categorySums.value)
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);

  // 데이터가 없는 경우 빈 배열 반환
  return entries.filter((item) => item.amount > 0);
});

// 차트 타입 변경 함수
const changeChartType = (type) => {
  chartType.value = type;
  renderChart();
};

// 색상 배열
const colors = [
  '#609966', // color-accent
  '#9dc08b', // color-secondary
  '#edf1d6', // color-primary
  '#f5f7f9', // color-info
  '#636363', // color-success
];

// 인덱스별 색상 가져오기
const getColorByIndex = (index) => {
  return colors[index % colors.length];
};

// 퍼센티지 계산
const calculatePercentage = (amount) => {
  const total = topCategories.value.reduce((sum, item) => sum + item.amount, 0);
  return total > 0 ? ((amount / total) * 100).toFixed(1) : 0;
};

// 차트 렌더링 함수
function renderChart() {
  if (!chartRef.value) return;
  if (chartInstance) {
    chartInstance.destroy();
    chartInstance = null;
  }

  const labels = topCategories.value.map((item) => item.category);
  const data = topCategories.value.map((item) => item.amount);

  if (!labels.length) return;

  Chart.register(
    BarController,
    BarElement,
    DoughnutController,
    ArcElement,
    CategoryScale,
    LinearScale,
    Tooltip,
    Legend
  );

  const getChartConfig = () => {
    if (chartType.value === 'doughnut') {
      return {
        type: 'doughnut',
        data: {
          labels,
          datasets: [
            {
              data,
              backgroundColor: colors,
              borderColor: '#ffffff',
              borderWidth: 2,
              hoverBorderWidth: 3,
              borderRadius: 8,
              borderJoinStyle: 'round',
              cutout: '40%', // 더 두껍게 조정
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          aspectRatio: 1,
          plugins: {
            legend: {
              display: false, // 하단 범례 숨김
            },
            tooltip: {
              backgroundColor: 'rgba(64, 81, 59, 0.95)',
              titleColor: '#ffffff',
              bodyColor: '#ffffff',
              borderColor: '#609966',
              borderWidth: 2,
              cornerRadius: 8,
              displayColors: true,
              callbacks: {
                title: (tooltipItems) => {
                  return tooltipItems[0].label;
                },
                label: (ctx) => {
                  const value = ctx.parsed.toLocaleString();
                  const total = topCategories.value.reduce(
                    (sum, item) => sum + item.amount,
                    0
                  );
                  const percentage = ((ctx.parsed / total) * 100).toFixed(1);
                  return `${value}원 (${percentage}%)`;
                },
              },
            },
          },
        },
      };
    } else {
      return {
        type: 'bar',
        data: {
          labels,
          datasets: [
            {
              label: '총 사용금액(원)',
              data,
              backgroundColor: colors,
              borderRadius: 8,
              barThickness:
                window.innerWidth <= 480
                  ? 15
                  : window.innerWidth <= 768
                  ? 20
                  : 25,
              maxBarThickness: window.innerWidth <= 480 ? 20 : 30,
            },
          ],
        },
        options: {
          indexAxis: 'y',
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: 'rgba(64, 81, 59, 0.95)',
              titleColor: '#ffffff',
              bodyColor: '#ffffff',
              borderColor: '#609966',
              borderWidth: 2,
              cornerRadius: 8,
              displayColors: true,
              callbacks: {
                title: (tooltipItems) => {
                  return tooltipItems[0].label;
                },
                label: (ctx) => {
                  const value = ctx.parsed.x.toLocaleString();
                  const total = topCategories.value.reduce(
                    (sum, item) => sum + item.amount,
                    0
                  );
                  const percentage = ((ctx.parsed.x / total) * 100).toFixed(1);
                  return `${value}원 (${percentage}%)`;
                },
              },
            },
          },
          scales: {
            x: {
              beginAtZero: true,
              grid: {
                display: true,
                color: '#e5e7eb',
                lineWidth: 0,
              },
              ticks: {
                color: '#6b7280',
                font: {
                  size:
                    window.innerWidth <= 480
                      ? 10
                      : window.innerWidth <= 768
                      ? 11
                      : 12,
                },
                callback: (value) => {
                  if (value >= 1000000) {
                    return Math.floor(value / 10000) + '만';
                  } else if (value >= 10000) {
                    return Math.floor(value / 10000) + '만';
                  }
                  return value.toLocaleString();
                },
              },
              title: { display: false },
            },
            y: {
              grid: { display: false },
              ticks: {
                color: '#1f2937',
                font: {
                  size:
                    window.innerWidth <= 480
                      ? 9
                      : window.innerWidth <= 768
                      ? 10
                      : 12,
                  weight: '600',
                },
                // maxTicksLimit 제거하여 모든 카테고리 표시
                // 텍스트가 잘리지 않도록 최대 너비 설정
                maxRotation: 0,
                minRotation: 0,
                callback: function (value, index, values) {
                  const label = this.getLabelForValue(value);
                  // 모바일에서 텍스트가 너무 길면 줄임
                  if (window.innerWidth <= 480 && label.length > 8) {
                    return label.substring(0, 6) + '...';
                  } else if (window.innerWidth <= 768 && label.length > 10) {
                    return label.substring(0, 8) + '...';
                  }
                  return label;
                },
              },
              title: { display: false },
            },
          },
        },
      };
    }
  };

  chartInstance = new Chart(chartRef.value, getChartConfig());
}

// 차트 초기화 및 리렌더
onMounted(renderChart);
watch(topCategories, renderChart);

// 컴포넌트 언마운트 시 차트 정리
onBeforeUnmount(() => {
  if (chartInstance) {
    chartInstance.destroy();
    chartInstance = null;
  }
});
</script>

<style scoped>
.spending-pattern-chart {
  width: 100%;
  height: 100%;
  margin: 0 auto;
  position: relative;
  min-height: 250px;
  background: white;
  border-radius: 12px;
  padding: 20px;
}

.chart-controls {
  position: absolute;
  top: 20px;
  right: 20px;
  display: flex;
  gap: 10px;
  z-index: 10;
}

.chart-type-btn {
  width: 36px;
  height: 36px;
  border: 1px solid #e5e7eb;
  background: white;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #6b7280;
  font-size: 16px;
}

.chart-type-btn:hover {
  border-color: #609966;
  color: #609966;
  background: #f8f9fa;
}

.chart-type-btn.active {
  border-color: #609966;
  background: #609966;
  color: rgb(255, 255, 255);
}

.no-data {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  color: #6b7280;
  font-size: 14px;
}

canvas {
  width: 100% !important;
  height: 100% !important;
  max-height: 350px;
  margin-top: 50px;
}

/* 도넛 차트 전용 스타일 */
.spending-pattern-chart:has(canvas) {
  display: flex;
  flex-direction: column;
}

.spending-pattern-chart canvas {
  flex-shrink: 0;
}

.doughnut-legend {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 16px;
  padding: 12px;
  background: var(--color-light);
  border-radius: 8px;
  border: 1px solid var(--border-light);
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: var(--font-size-base);
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex-shrink: 0;
}

.legend-category {
  flex: 1;
  font-weight: 600;
  color: #40513b;
}

.legend-percentage {
  font-weight: 600;
  color: #000000;
  min-width: 40px;
  text-align: right;
}

/* 웹 화면 (데스크톱/태블릿)에서 차트 사이즈 더 크게 조정 */
@media (min-width: 1025px) {
  .spending-pattern-chart {
    min-height: 350px;
    max-height: 650px;
    padding: 24px;
  }

  .chart-controls {
    top: 1px;
    right: 1px;
  }

  .chart-type-btn {
    width: 40px;
    height: 40px;
    font-size: 18px;
  }

  canvas {
    max-height: 350px;
    margin-top: 50px;
  }

  .doughnut-legend {
    margin-top: 20px;
    padding: 16px;
  }
}

@media (min-width: 769px) and (max-width: 1024px) {
  .spending-pattern-chart {
    min-height: 280px;
    max-height: 600px;
    padding: 20px;
  }

  .chart-controls {
    top: 1px;
    right: 1px;
  }

  .chart-type-btn {
    width: 36px;
    height: 36px;
    font-size: 16px;
  }

  canvas {
    max-height: 280px;
    margin-top: 45px;
  }

  .doughnut-legend {
    margin-top: 16px;
    padding: 14px;
  }
}

@media (max-width: 768px) {
  .spending-pattern-chart {
    min-height: 130px;
    max-height: 500px;
    padding: 16px;
  }

  .chart-controls {
    top: 1px;
    right: 1px;
  }

  .chart-type-btn {
    width: 32px;
    height: 32px;
    font-size: 14px;
  }

  canvas {
    max-height: 250px;
    margin-top: 40px;
  }

  .doughnut-legend {
    margin-top: 12px;
    padding: 12px;
    gap: 6px;
  }

  .legend-item {
    font-size: var(--font-size-base);
  }
}

/* 작은 모바일 화면 */
@media (max-width: 480px) {
  .spending-pattern-chart {
    max-height: 400px;
    min-height: 250px;
    padding: 10px;
  }

  .chart-controls {
    top: 1px;
    right: 1px;
    gap: 6px;
  }

  .chart-type-btn {
    width: 26px;
    height: 26px;
    font-size: 11px;
  }

  canvas {
    max-height: 220px;
    min-height: 180px;
    margin-top: 35px;
  }

  .doughnut-legend {
    margin-top: 8px;
    padding: 8px;
    gap: 4px;
  }

  .legend-item {
    font-size: var(--font-size-base);
    gap: 6px;
  }

  .legend-color {
    width: 8px;
    height: 8px;
  }
}

/* 매우 작은 모바일 화면 (iPhone SE 등) */
@media (max-width: 375px) {
  .spending-pattern-chart {
    max-height: 300px;
    min-height: 180px;
    padding: 8px;
  }

  .chart-controls {
    gap: 4px;
  }

  .chart-type-btn {
    width: 24px;
    height: 24px;
    font-size: 10px;
  }

  canvas {
    max-height: 160px;
    margin-top: 30px;
  }

  .doughnut-legend {
    margin-top: 6px;
    padding: 6px;
    gap: 3px;
  }

  .legend-item {
    font-size: var(--font-size-base);
    gap: 5px;
  }

  .legend-color {
    width: 7px;
    height: 7px;
  }

  .legend-percentage {
    min-width: 35px;
  }
}
</style>
