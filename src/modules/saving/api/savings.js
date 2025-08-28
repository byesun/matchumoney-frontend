import api from "@/shared/api";

const BASE_URL = `/user/me/savings`;

export default {
  // 적금 리스트 조회
  async getList() {
    const { data } = await api.get(`${BASE_URL}`);
    // console.log('💰 Saving List:', data);
    return data;
  },

  // 적금 계좌 동기화 (예: 은행 로그인 후)
  async syncAccounts(bankLoginDto) {
    const { data } = await api.post(`${BASE_URL}/sync`, bankLoginDto);
    // console.log('🔄 Synced Saving Accounts:', data);
    return data;
  },

  // 적금 계좌 동기화 (예: 은행 로그인 후)
  async syncAccountsPre() {
    const { data } = await api.post(`${BASE_URL}/sync/pre`);
    // console.log('🔄 Synced Saving Accounts:', data);
    return data;
  },

  // 내 적금 기반 추천 목록
  async getRecommendSavings(id, page, size) {
    const query = new URLSearchParams({ page, size }).toString();
    const { data } = await api.get(`${BASE_URL}/${id}/recommend?${query}`);
    // console.log('💰 Recommend Saving List:', data);
    return data;
  },
};
