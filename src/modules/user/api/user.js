import api from "@/shared/api";

const BASE_URL = `user`;

export default {
  // 내 정보 조회
  async getMyInfo() {
    const { data } = await api.get(`${BASE_URL}/me`);
    return data;
  },
  // 마이페이지 정보 조회
  async getMyPage() {
    const { data } = await api.get(`${BASE_URL}/mypage`);
    return data;
  },
  // 상위 퍼센트 조회
  async getTopPercent() {
    const { data } = await api.get(`${BASE_URL}/mypage/top-percent`);
    return data;
  },
  // 회원 정보 수정
  async updateUserInfo(updateDto) {
    const { data } = await api.patch(`${BASE_URL}/update`, updateDto);
    return data;
  },
  // 비밀번호 수정
  async updatePassword(passwordDto) {
    const { data } = await api.patch(
      `${BASE_URL}/update/password`,
      passwordDto
    );
    return data;
  },
  async uploadProfileImage(file) {
    // 1) presigned URL 발급
    const { data } = await api.post(`files/profile/presign`, {
      filename: file.name,
      contentType: file.type,
    });
    const { uploadUrl, publicUrl } = data;

    // 2) S3에 직접 PUT 업로드 (axios 말고 fetch 사용 권장)
    const putRes = await fetch(uploadUrl, {
      method: 'PUT',
      headers: { 'Content-Type': file.type },
      body: file,
    });
    if (!putRes.ok) {
      const text = await putRes.text().catch(() => '');
      throw new Error(`S3 업로드 실패: ${putRes.status} ${text}`);
    }

    // 3) 최종 URL 반환 (DB 저장용)
    return { url: publicUrl };
  },
};
