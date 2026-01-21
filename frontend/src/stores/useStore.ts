import { create } from 'zustand';

interface AppState {
    count: number;  // 예시 상태
    userName: string;  // 예시 상태
    increase: () => void;  // 예시 액션
    setUserName: (name: string) => void;
}

export const useStore = create<AppState>((set) => ({
    count: 0,
    userName: 'user01',
    increase: () => set((state) => ({ count: state.count + 1 })),
    setUserName: (name: string) => set({ userName: name }),
}));