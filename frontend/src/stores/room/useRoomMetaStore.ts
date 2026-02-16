// src/stores/room/useRoomMetaStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { AvailableFrameworks } from './types';

interface RoomMetaState {
  themeName: string | null;
  themeImageUrl: string | null;
  availableFrameworks: AvailableFrameworks | null;

  setThemeName: (name: string) => void;
  setThemeImageUrl: (url: string | null) => void;
  setAvailableFrameworks: (data: AvailableFrameworks) => void;
  clearAvailableFrameworks: () => void;
  resetMeta: () => void;
}

export const useRoomMetaStore = create<RoomMetaState>()(
  persist(
    (set) => ({
      themeName: null,
      themeImageUrl: null,
      availableFrameworks: null,

      setThemeName: (name) => set({ themeName: name }),

      setThemeImageUrl: (url) => set({ themeImageUrl: url }),

      setAvailableFrameworks: (data) => set({ availableFrameworks: data }),

      clearAvailableFrameworks: () => set({ availableFrameworks: null }),

      resetMeta: () =>
        set({
          themeName: null,
          themeImageUrl: null,
          availableFrameworks: null,
        }),
    }),
    {
      name: 'room-meta',
      partialize: (s) => ({
        themeName: s.themeName,
        themeImageUrl: s.themeImageUrl,
        availableFrameworks: s.availableFrameworks,
      }),
    },
  ),
);
