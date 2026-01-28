// user.ts
// 사용자 관련 API 함수

import api from './api';
import type {
  ProfileResponse,
  SubmissionsResponse,
} from '../pages/mypage/types/user';

// ===== 프로필 조회 =====

export const getProfile = async (): Promise<ProfileResponse> => {
  const response = await api.get<ProfileResponse>('/users/me');
  return response.data;
};

// ===== 제출 기록 조회 =====

export const getSubmissions = async (
  params: { page: number; size: number }
): Promise<SubmissionsResponse> => {
  // TODO: 백엔드 API 연동 후 아래 주석 해제
  // const { page, size } = params;
  // const response = await api.get<SubmissionsResponse>(
  //   `/users/me/submissions?page=${page}&size=${size}`
  // );
  // return response.data;

  // 임시 목 데이터 (제출 기록 API 연동 전)
  await new Promise((resolve) => setTimeout(resolve, 300));
  return {
    message: '정상적으로 조회하였습니다.',
    result: {
      content: [],
      totalElements: 0,
      totalPages: 0,
      currentPage: params.page,
    },
  };
};
