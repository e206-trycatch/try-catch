// API 에러 → ResultErrorType 변환 유틸

import axios from 'axios';

import type { ResultErrorType } from '../types/errorTypes';

export function getErrorType(error: unknown): ResultErrorType {
  if (!axios.isAxiosError(error)) {
    return 'network';
  }

  // 타임아웃
  if (error.code === 'ECONNABORTED') {
    return 'timeout';
  }

  const status = error.response?.status;

  // 권한 없음
  if (status === 401 || status === 403) {
    return 'unauthorized';
  }

  // 방/리소스 없음
  if (status === 404) {
    return 'invalid_room';
  }

  return 'network';
}
