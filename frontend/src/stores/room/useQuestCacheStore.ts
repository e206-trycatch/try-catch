// src/stores/room/useQuestCacheStore.ts
import { create } from 'zustand';

import type { QuestDetail } from '../../api/roomApi';

interface QuestCacheState {
  questList: QuestDetail[] | null;
  questListThemeId: number | null;

  setQuestList: (themeId: number, list: QuestDetail[]) => void;
  clearQuestList: () => void;
}

export const useQuestCacheStore = create<QuestCacheState>()((set) => ({
  questList: null,
  questListThemeId: null,

  setQuestList: (themeId, list) =>
    set({ questList: list, questListThemeId: themeId }),

  clearQuestList: () => set({ questList: null, questListThemeId: null }),
}));
