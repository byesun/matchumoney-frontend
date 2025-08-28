import apiClient from '@/shared/api/index';
const BASE_URL = `/favorite`;

const favorite = {
  async addFavorite(productId, productType) {
    console.log('즐겨찾기 추가 요청:', { productId, productType });

    const numericProductId = Number(productId);

    try {
      const res = await apiClient.post(
        `/favorite/${numericProductId}?productType=${productType}`
      );
      console.log('즐겨찾기 추가 성공:', res.data);
      return { active: true };
    } catch (error) {
      console.error(
        '즐겨찾기 추가 실패:',
        error.response?.status,
        error.message
      );
      throw new Error('즐겨찾기 추가에 실패했습니다.');
    }
  },

  /**
   * 즐겨찾기 삭제 요청
   * @param {number|string} productId - 상품 ID (depositProductId를 사용)
   * @param {string} productType - 상품 유형
   */
  async deleteFavorite(productId, productType) {
    console.log('즐겨찾기 제거 요청:', { productId, productType });

    const numericProductId = Number(productId);
    if (Number.isNaN(numericProductId)) {
      throw new Error('유효하지 않은 상품 ID입니다.');
    }

    try {
      const res = await apiClient.delete(
        `/favorite/${numericProductId}?productType=${productType}`
      );
      console.log('즐겨찾기 제거 성공:', res.data);
      return { active: false };
    } catch (error) {
      console.error(
        '즐겨찾기 제거 실패:',
        error.response?.status,
        error.message
      );
      throw new Error('즐겨찾기 제거에 실패했습니다.');
    }
  },

  /**
   * 즐겨찾기 목록
   */
  async getFavorites() {
    console.log('즐겨찾기 목록 조회 시도');
    try {
      const response = await apiClient.get('/favorite');
      console.log('즐겨찾기 목록 조회 성공:', response.data);
      return response.data;
    } catch (error) {
      console.error(
        '즐겨찾기 목록 조회 실패:',
        error.response?.status,
        error.message
      );
      throw new Error('즐겨찾기 목록 조회에 실패했습니다.');
    }
  },
  async getFavoriteProducts() {
    const { data } = await apiClient.get(`${BASE_URL}`);
    return data;
  },
};

export default favorite;
