// user.ts
// 사용자 관련 API 함수

import type {
  ProfileResponse,
  SubmissionsResponse,
} from '../pages/mypage/types/user';
import { useStore } from '../stores/useStore';

// 토큰 조회 헬퍼
const getAccessToken = (): string | null => {
  return useStore.getState().accessToken;
};

// ===== 프로필 조회 =====

export const getProfile = async (): Promise<ProfileResponse> => {
  // ===== 목 데이터 (백엔드 완료 전) =====
  await new Promise((resolve) => setTimeout(resolve, 500));

  const token = getAccessToken();

  // 토큰 없음
  if (!token) {
    return {
      status: 401,
      message: '인증이 필요합니다.',
      result: null,
    };
  }

  // 성공 응답
  return {
    status: 200,
    message: '정상적으로 조회하였습니다.',
    result: {
      loginId: 'test123',
      nickname: '테스트',
      email: 'test123@example.com',
      profileUrl: 'https://example.com/profiles/user123.png',
      createdAt: '2026-01-15',
    },
  };

  // ===== 실제 API (백엔드 완료 후 주석 해제) =====
  // const response = await fetch('/api/v1/users/me', {
  //   headers: {
  //     'Authorization': `Bearer ${getAccessToken()}`,
  //   },
  // });
  // return response.json();
};

// ===== 제출 기록 조회 =====

export const getSubmissions = async (
  params: { page: number; size: number }
): Promise<SubmissionsResponse> => {
  // ===== 목 데이터 (백엔드 완료 전) =====
  await new Promise((resolve) => setTimeout(resolve, 500));

  const token = getAccessToken();

  // 토큰 없음
  if (!token) {
    return {
      status: 401,
      message: '인증이 필요합니다.',
      result: null,
    };
  }

  // 성공 응답
  return {
    status: 200,
    message: '정상적으로 조회하였습니다.',
    result: {
      content: [
        {
          submissionId: 152,
          mode: 'SINGLE',
          themeName: '프로젝트 에이아',
          framework: 'Vue.js',
          executionTime: 2340,
          submittedAt: '2025-01-20 14:32:15',
        },
        {
          submissionId: 151,
          mode: 'SINGLE',
          themeName: '디버깅 챌린지',
          framework: 'Spring Boot',
          executionTime: 1800,
          submittedAt: '2025-01-19 10:15:30',
        },
        {
          submissionId: 38,
          mode: 'MULTI',
          themeName: '프로젝트 에이아',
          framework: 'Spring Boot',
          executionTime: 1320,
          submittedAt: '2025-01-23 16:04:11',
        },
        {
          submissionId: 37,
          mode: 'MULTI',
          themeName: '협동 미션',
          framework: 'Django',
          executionTime: 2100,
          submittedAt: '2025-01-18 09:22:45',
        },
      ],
      totalElements: 4,
      totalPages: 1,
      currentPage: params.page,
    },
  };

  // ===== 실제 API (백엔드 완료 후 주석 해제) =====
  // const { page, size } = params;
  // const response = await fetch(
  //   `/api/v1/users/me/submission?page=${page}&size=${size}`,
  //   {
  //     headers: {
  //       'Authorization': `Bearer ${getAccessToken()}`,
  //     },
  //   }
  // );
  // return response.json();
};
