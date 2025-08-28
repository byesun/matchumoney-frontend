import api from "@/shared/api";
const BASE_URL = '/webtoon';

export default {
  async getTop4() {
    const { data } = await api.get(`${BASE_URL}/top4`);
    return data;
  },
  async getAll() {
    const { data } = await api.get(BASE_URL);
    return data;
  },
};
