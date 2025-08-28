import api from "@/shared/api";
const BASE_URL = '/chatbot';

export default {
  /**
   * 일반 질의
   * @param {string} message
   * @param {string} systemPrompt
   * @returns {Promise<string>}
   */
  async ask(message, systemPrompt) {
    const { data } = await api.post(BASE_URL, { message, systemPrompt });
    return data?.reply;
  },

  /**
   * 용어 정의 (기본 설명)
   * @param {string} term
   * @returns {Promise<string>}
   */
  async define(term) {
    const payload = {
      message: `${term}를(을) 금융 초보자가 이해하게, 정의→왜 중요한지→간단 예시 순서로 5줄 내 설명해줘.`,
      systemPrompt: '당신은 금융 전문가입니다. 쉬운 한국어로, 군더더기 없이 친절하게 설명하세요.',
    };
    const { data } = await api.post(BASE_URL, payload);
    return data?.reply?.trim();
  },

  /**
   * 용어 정의 (더 쉬운 설명)
   * @param {string} term
   * @returns {Promise<string>}
   */
  async defineSimple(term) {
    const payload = {
      message: `초등학생에게 ${term}를(을) 설명하듯 아주 쉽게, 비유 1개 포함해서 3문장으로 설명해줘.`,
      systemPrompt: '당신은 친절한 선생님입니다. 어려운 용어 금지, 짧고 쉬운 문장.',
    };
    const { data } = await api.post(BASE_URL, payload);
    return data?.reply?.trim();
  },
};
