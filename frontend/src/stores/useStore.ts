import { create } from 'zustand';

import { logout as logoutApi } from '../api/auth';

// 유저 정보 타입
interface User {
  nickname: string;
  profileUrl: string | null;
}

interface AppState {
  // 상태
  isLogin: boolean;
  accessToken: string | null;
  user: User | null;

  // 액션
  login: (accessToken: string, user: User) => void;
  logout: () => Promise<void>;
  setAccessToken: (token: string) => void;
}

// 로그아웃 중복 호출 방지 플래그
let isLoggingOut = false;

export const useStore = create<AppState>((set) => ({
  // 초기값
  isLogin: false,
  accessToken: null,
  user: null,

  // 로그인: accessToken과 user 정보 저장
  login: (accessToken, user) =>
    set({
      isLogin: true,
      accessToken,
      user,
    }),

  // 로그아웃: API 호출 후 인증 정보 초기화
  logout: async () => {
    // 이미 로그아웃 중이면 무시
    if (isLoggingOut) return;
    isLoggingOut = true;

    try {
      await logoutApi();
    } catch (error) {
      // API 실패해도 로그아웃 처리 (토큰 만료 등)
      console.error('로그아웃 API 호출 실패:', error);
    }

    set({
      isLogin: false,
      accessToken: null,
      user: null,
    });

    isLoggingOut = false;
  },

  // Access Token만 업데이트 (토큰 재발급 시 사용)
  setAccessToken: (token) => set({ accessToken: token }),
}));
