// api.ts
// Axios 공통 설정

import type { AxiosError, InternalAxiosRequestConfig } from 'axios';
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
// 401 에러 시 토큰 갱신 후 재시도, 실패 시 로그아웃

// 토큰 갱신 상태 관리
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

// refresh 완료 시 대기 중인 요청들에게 새 토큰 전달
const onRefreshed = (token: string) => {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
};

// refresh 완료 대기열에 추가
const addSubscriber = (callback: (token: string) => void) => {
  refreshSubscribers.push(callback);
};

// 재시도 플래그를 위한 타입 확장
interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

api.interceptors.response.use(
  (response) => response,

  async (error: AxiosError) => {
    const originalRequest = error.config as CustomAxiosRequestConfig;

    // 취소된 요청은 무시
    if (axios.isCancel(error) || error.code === 'ERR_CANCELED') {
      return Promise.reject(error);
    }

    // 401 에러 처리
    if (error.response?.status === 401) {
      const url = originalRequest?.url || '';

      // 로그인 요청 실패는 그대로 반환 (잘못된 비밀번호 등)
      if (url.includes('/auth/login')) {
        return Promise.reject(error);
      }

      // refresh 요청 자체가 실패하면 로그아웃
      if (url.includes('/auth/refresh')) {
        await useStore.getState().logout();
        window.location.href = '/login';
        return Promise.reject(error);
      }

      // 이미 재시도한 요청이면 로그아웃 (무한 루프 방지)
      if (originalRequest._retry) {
        await useStore.getState().logout();
        window.location.href = '/login';
        return Promise.reject(error);
      }

      // 토큰 갱신 중이면 대기열에 추가
      if (isRefreshing) {
        return new Promise((resolve) => {
          addSubscriber((token: string) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(api(originalRequest));
          });
        });
      }

      // 토큰 갱신 시작
      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await axios.post('/api/v1/auth/refresh', null, {
          withCredentials: true,
        });

        const newToken = data.result.accessToken;
        useStore.getState().setAccessToken(newToken);

        // 대기 중인 요청들에게 새 토큰 전달
        onRefreshed(newToken);

        // 원래 요청 재시도
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch {
        // refresh 실패 → 로그아웃
        await useStore.getState().logout();
        window.location.href = '/login';
        return Promise.reject(error);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default api;
