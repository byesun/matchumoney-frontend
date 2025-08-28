import api from "@/shared/api";

const BASE_URL = `/compare`;

export default {
  // 적금, 예금, 카드 리스트 조회
  async getList(productType, ids) {
    const params = new URLSearchParams();
    ids.forEach((id) => params.append('ids', id));

    const { data } = await api.get(
      `${BASE_URL}/${productType}?${params.toString()}`
    );
    return data[productType.toLowerCase() + 's'];
  },
  async getSearchList(productType) {
    const { data } = await api.get(`${BASE_URL}/${productType}/all`);
    return data; // productType이 대문자라면 소문자로 변환 필요
  },
};
