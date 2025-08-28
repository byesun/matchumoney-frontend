// src/api/like.js
import api from "@/shared/api"; // 기존 axios instance

export default {
  async toggleLike(productId, productType, isLiked) {
    const url = `/${productType}/${productId}/likes`;
    const response = isLiked
      ? await api.delete(url)
      : await api.post(url);
    return response.data; // { liked: true, likeCount: number }
  }
};