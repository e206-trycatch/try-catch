// api.ts
// Axios 공통 설정

import axios from 'axios';
import type { AxiosError, InternalAxiosRequestConfig } from 'axios';

import { useStore } from '../stores/useStore';

const api = axios.create({
  baseURL: '/api/v1',
  timeout: 5000,
  withCredentials: true, // 쿠키 자동 전송 (refreshToken용)
});

// ===== 재발급 상태 관리 =====
let isRefreshing = false;
let refreshSubscribers: {
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}[] = [];

// 대기 중인 요청들에게 새 토큰 전달
const onRefreshed = (newToken: string) => {
  refreshSubscribers.forEach(({ resolve }) => resolve(newToken));
  refreshSubscribers = [];
};

// 대기 중인 요청들에게 에러 전달
const onRefreshFailed = (error: unknown) => {
  refreshSubscribers.forEach(({ reject }) => reject(error));
  refreshSubscribers = [];
};

// ===== 타입 정의 =====
interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

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
// 401 에러 시 토큰 재발급 처리
api.interceptors.response.use(
  (response) => response,

  async (error: AxiosError) => {
    const originalRequest = error.config as CustomAxiosRequestConfig;

    // config가 없으면 그냥 에러 반환 (예방적 체크)
    if (!originalRequest) {
      return Promise.reject(error);
    }

    // 네트워크 에러 (서버 응답 없음)
    if (!error.response) {
      console.error('네트워크 에러:', error.message);
      return Promise.reject(error);
    }

    // 401이 아닌 에러는 그대로 반환
    if (error.response.status !== 401) {
      return Promise.reject(error);
    }

    // /refresh 요청 자체가 실패 → 로그아웃
    if (originalRequest.url?.includes('/auth/refresh')) {
      await useStore.getState().logout();
      window.location.href = '/login';
      return Promise.reject(error);
    }

    // 이미 재시도한 요청이면 실패 처리
    if (originalRequest._retry) {
      return Promise.reject(error);
    }

    // 재발급 중이면 대기열에 추가
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        refreshSubscribers.push({
          resolve: (newToken: string) => {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            resolve(api(originalRequest));
          },
          reject: (err: unknown) => {
            reject(err);
          },
        });
      });
    }

    // 재발급 시작
    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const { data } = await api.post('/auth/refresh');
      const newToken = data.result.accessToken;

      // 새 토큰 저장
      useStore.getState().setAccessToken(newToken);

      // 대기 중인 요청들 처리
      onRefreshed(newToken);

      // 원래 요청 재시도
      originalRequest.headers.Authorization = `Bearer ${newToken}`;
      return api(originalRequest);
    } catch (refreshError) {
      // 대기열 정리
      onRefreshFailed(refreshError);

      // 로그아웃
      await useStore.getState().logout();
      window.location.href = '/login';
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;