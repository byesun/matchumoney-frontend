import api from "@/shared/api";

const BASE_URL = `/deposits`;

export default {
  // 사용자 계좌 목록 조회
  async getUserAccounts(userId) {
    const { data } = await api.get(`${BASE_URL}/accounts/${userId}`);
    return data;
  },

  // 잔액 기반 상품 추천
  async getProductsByBalance(requestData) {
    const { data } = await api.post(
      `${BASE_URL}/recommendations/byBalance`,
      requestData
    );
    return data;
  },

  // 계좌 연결 (은행 로그인)
  async connectAccount(connectData) {
    const { data } = await api.post(`${BASE_URL}/connect`, connectData);
    return data;
  },

  // 모든 예금 상품 조회 (즐겨찾기 정보 포함)
  async getAllProducts() {
    const { data } = await api.get(`${BASE_URL}/deposit-products`);
    return data;
  },

  // KB국민은행 상품 조회 (즐겨찾기 정보 없음)
  async getKBProducts() {
    const { data } = await api.get(`${BASE_URL}/recommendations/kb-products`);
    return data;
  },

  // 모든 예금 상품 조회 (기본, 즐겨찾기 정보 없음)
  async getAllDepositProducts() {
    const { data } = await api.get(`${BASE_URL}/recommendations/allProducts`);
    return data;
  },

  // 로그인 사용자용 - 즐겨찾기 정보 포함된 모든 예금 상품 조회

  async getAllDepositProductsWithFavorites() {
    try {
      const response = await apiClient.get('/deposits/deposit-products');
      return response.data;
    } catch (error) {
      console.error('즐겨찾기 포함 예금 상품 조회 실패:', error);
      throw new Error('상품 목록을 불러올 수 없습니다.');
    }
  },
};
