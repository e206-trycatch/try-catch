import { create } from 'zustand';

interface AppState {
  isLogin: boolean; // 로그인 상태
  user: { name: string } | null; // 유저 정보
  login: (name: string) => void;
  logout: () => void;
}

export const useStore = create<AppState>((set) => ({
  isLogin: false, // 기본값: 로그아웃 상태
  user: null,
  login: (name) => set({ isLogin: true, user: { name } }),
  logout: () => set({ isLogin: false, user: null }),
}));
