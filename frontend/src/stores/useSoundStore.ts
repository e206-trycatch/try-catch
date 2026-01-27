import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SoundStore {
  // 상태
  isMuted: boolean;
  audioRef: HTMLAudioElement | null;
  hasUserInteracted?: boolean; // 사용자가 한번이라도 인터렉션 했는지
  userWantsSound: boolean; // 사용자가 소리켜기 원하는지
  setAudioRef: (audio: HTMLAudioElement) => void;

  // 액션
  toggleMute: () => void;
  setHasUserInteracted: () => void;
}

export const useSoundStore = create<SoundStore>()(
  persist(
    (set, get) => ({
      isMuted: true, // 초기엔 음소거 상태
      audioRef: null,
      hasUserInteracted: false,
      userWantsSound: true, // 사용자가 기본적으로 소리를 원한다고 가정

      setAudioRef: (audio) => set({ audioRef: audio }),

      toggleMute: () => {
        const currentMuted = get().isMuted;
        set({
          isMuted: !currentMuted,
          userWantsSound: currentMuted, // off+on => true, on+off => false
          hasUserInteracted: true,
        });
      },

      setHasUserInteracted: () => {
        const { hasUserInteracted, userWantsSound, isMuted } = get();
        if (!hasUserInteracted && userWantsSound) {
          // 첫 인터렉션이고 사용자가 소리 원하는 경우에만 자동 on
          set({
            hasUserInteracted: true,
            isMuted: false,
          });
        } else {
          set({ hasUserInteracted: true });
        }
      },
    }),
    {
      name: 'sound-storage', // 로컬스토리지 키
      partialize: (state) => ({
        userWantsSound: state.userWantsSound,
        hasUserInteracted: state.hasUserInteracted,
      }),
    },
  ),
);
