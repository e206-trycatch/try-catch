// api.ts
// Axios 공통 설정

import axios from 'axios';

import { useStore } from '../stores/useStore';

const api = axios.create({
  baseURL: '/api/v1',
  timeout: 5000,
  withCredentials: true, // 쿠키 자동 전송 (refreshToken용)
});

// 요청 인터셉터: 모든 요청에 accessToken 헤더 추가
api.interceptors.request.use((config) => {
  const token = useStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;