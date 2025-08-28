import api from "@/shared/api";
const BASE_URL = '/education';

export default {
  async getMovieList({ offset = 0, pageSize = 4 } = {}) {
    const { data } = await api.get(`${BASE_URL}/movie`, {
      params: { offset, pageSize },
    });
    return data;
  },
};
