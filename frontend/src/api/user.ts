// user.ts
// 사용자 관련 API 함수

import type {
  ProfileResponse,
  SubmissionsResponse,
} from '../pages/mypage/types/user';
import api from './api';

// ===== 프로필 조회 =====

export const getProfile = async (): Promise<ProfileResponse> => {
  const response = await api.get<ProfileResponse>('/users/me');
  return response.data;
};

// ===== 제출 기록 조회 =====

export const getSubmissions = async (params: {
  page: number;
  size: number;
}): Promise<SubmissionsResponse> => {
  const { page, size } = params;
  const response = await api.get<SubmissionsResponse>(
    `/users/me/submissions?page=${page}&size=${size}`,
  );
  return response.data;
};
