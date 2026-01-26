// 방 정보 저장
import { create } from 'zustand';

type GameMode = 'SINGLE' | 'MULTI';

interface RoomCreationState {
  // 방 생성을 위해 저장할 데이터
  selectedMode: GameMode | null;
  selectedThemeId: number | null;

  // action (데이터 들어갈 함수들)
  setMode: (mode: GameMode) => void;
  setThemeId: (themeId: number) => void;

  // 초기화 (방 생성 후 비워주기)
  resetRoomCreation: () => void;
}

export const useRoomStore = create<RoomCreationState>((set) => ({
  selectedMode: null,
  selectedThemeId: null,

  setMode: (mode) => set({ selectedMode: mode }),
  setThemeId: (themeId) => set({ selectedThemeId: themeId }),

  resetRoomCreation: () => set({ selectedMode: null, selectedThemeId: null }),
}));
