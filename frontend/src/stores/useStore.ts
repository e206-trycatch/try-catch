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
}

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
  },
}));
