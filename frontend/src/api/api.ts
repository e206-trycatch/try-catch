// api.ts
// Axios 공통 설정

import type { AxiosError } from 'axios';
import axios from 'axios';

import { useStore } from '../stores/useStore';

const api = axios.create({
  baseURL: '/api/v1',
  timeout: 5000,
  withCredentials: true, // 쿠키 자동 전송 (refreshToken용)
});

// ===== 요청 인터셉터 =====
// 모든 요청에 accessToken 헤더 추가
api.interceptors.request.use((config) => {
  const token = useStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ===== 응답 인터셉터 =====
// 401 에러 시 로그아웃 처리 (토큰 갱신은 25분 주기로 자동 수행)
let isLoggingOut = false;

api.interceptors.response.use(
  (response) => response,

  async (error: AxiosError) => {
    // 취소된 요청은 무시
    if (axios.isCancel(error) || error.code === 'ERR_CANCELED') {
      return Promise.reject(error);
    }

    // 401 에러 처리: 세션 만료로 간주하고 로그아웃
    if (error.response?.status === 401) {
      const url = error.config?.url || '';

      // 로그인 요청 실패는 그대로 반환 (잘못된 비밀번호 등)
      if (url.includes('/auth/login')) {
        return Promise.reject(error);
      }

      // 이미 로그아웃 처리 중이면 중복 실행 방지
      if (isLoggingOut) {
        return Promise.reject(error);
      }

      // 세션 만료 → 알림 후 로그아웃
      isLoggingOut = true;
      alert('세션이 만료되었습니다. 다시 로그인해주세요.');
      await useStore.getState().logout();
      window.location.href = '/login';
    }

    return Promise.reject(error);
  },
);

export default api;
