// src/api/push.js
import api from "@/shared/api"; // axios 인스턴스

const BASE_URL = `push/tokens`;

export default {
  // 토큰 등록
  async registerToken(token) {
    return await api.post(`${BASE_URL}`, { token });
  },

  // 토큰 삭제
  async deleteToken(token) {
    return await api.delete(`${BASE_URL}`, { data: { token } });
  },
};
