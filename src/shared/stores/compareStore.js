// src/stores/compareStore.js
import { defineStore } from 'pinia';

export const useCompareStore = defineStore('compare', {
  state: () => {
    // 로컬 스토리지에서 기존 데이터 가져오기
    const stored = JSON.parse(localStorage.getItem('compareList') || '{}');

    // 데이터가 배열로 저장돼 있다면 강제로 객체로 변환
    const initData =
      typeof stored === 'object' && !Array.isArray(stored) ? stored : {};

    return {
      compareList: initData,
    };
  },

  getters: {
    // 특정 타입의 비교함에 있는 상품 개수
    getCompareCount: (state) => (productType) => {
      return Array.isArray(state.compareList[productType]) 
        ? state.compareList[productType].length 
        : 0;
    },

    // 특정 타입의 비교함에 있는 상품 ID 목록
    getCompareProducts: (state) => (productType) => {
      return Array.isArray(state.compareList[productType]) 
        ? [...state.compareList[productType]] 
        : [];
    },
  },

  actions: {
    // 제품 추가
    addProduct(product) {
      // 해당 type의 배열이 없으면 초기화
      if (!Array.isArray(this.compareList[product.type])) {
        this.compareList[product.type] = [];
      }

      // id가 문자열이면 숫자로 변환, 숫자면 그대로 사용
      const productId =
        typeof product.id === 'string' ? Number(product.id) : product.id;

      // 숫자 변환이 실패한 경우 (예: 'abc') 예외 처리
      if (isNaN(productId)) {
        alert('유효하지 않은 상품 ID입니다.');
        return;
      }

      // 이미 같은 id가 존재하면 추가하지 않음
      if (this.compareList[product.type].includes(productId)) {
        return { success: false, error: 'ALREADY_EXISTS' };
      }

      // 같은 type 상품은 최대 2개까지만 추가
      if (this.compareList[product.type].length >= 2) {
        // alert 대신 에러 상태를 반환해서 컴포넌트에서 처리하도록 함
        return { success: false, error: 'COMPARE_FULL', currentProducts: [...this.compareList[product.type]] };
      }

      // 추가
      this.compareList[product.type].push(productId);
      this.saveToLocalStorage();
      return { success: true };
    },
    // 제품 제거
    removeProduct(product) {
      if (Array.isArray(this.compareList[product.type])) {
        const productId =
          typeof product.id === 'string' ? Number(product.id) : product.id;

        if (isNaN(productId)) {
          alert('유효하지 않은 상품 ID입니다.');
          return;
        }

        this.compareList[product.type] = this.compareList[product.type].filter(
          (id) => id !== productId
        );

        this.saveToLocalStorage();
      }
    },

    // 제품 비교 여부 확인
    isCompared(productId, productType) {
      const numericId =
        typeof productId === 'string' ? Number(productId) : productId;

      if (isNaN(numericId)) return false;

      return (
        Array.isArray(this.compareList[productType]) &&
        this.compareList[productType].includes(numericId)
      );
    },

    // 로컬스토리지 저장
    saveToLocalStorage() {
      localStorage.setItem('compareList', JSON.stringify(this.compareList));
    },
  },
});
