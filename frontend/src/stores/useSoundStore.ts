import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SoundState {
  isMuted: boolean;
  audioRef: HTMLAudioElement | null;
  hasUserInteracted: boolean;
  userWantsSound: boolean;
  volume: number;
  currentTrack: string | null;
  isPlaying: boolean;
  setAudioRef: (audio: HTMLAudioElement) => void;
  toggleMute: () => void;
  setHasUserInteracted: () => void;
  setVolume: (volume: number) => void;
  setTrack: (track: string | null) => void;
  setIsPlaying: (isPlaying: boolean) => void;
}

export const useSoundStore = create<SoundState>()(
  persist(
    (set, get) => ({
      isMuted: true,
      audioRef: null,
      hasUserInteracted: false,
      userWantsSound: true,
      volume: 0.5,
      currentTrack: null,
      isPlaying: false,

      setAudioRef: (audio) => set({ audioRef: audio }),

      toggleMute: () => {
        const currentMuted = get().isMuted;
        set({
          isMuted: !currentMuted,
          userWantsSound: currentMuted,
          hasUserInteracted: true,
        });
      },

      setHasUserInteracted: () => {
        const { hasUserInteracted, userWantsSound } = get();
        if (!hasUserInteracted && userWantsSound) {
          set({
            hasUserInteracted: true,
            isMuted: false,
          });
        } else {
          set({ hasUserInteracted: true });
        }
      },

      setVolume: (volume) => set({ volume: Math.max(0, Math.min(1, volume)) }),

      setTrack: (track) => set({ currentTrack: track }),

      setIsPlaying: (isPlaying) => set({ isPlaying }),
    }),
    {
      name: 'sound-storage',
      partialize: (state) => ({
        userWantsSound: state.userWantsSound,
        hasUserInteracted: state.hasUserInteracted,
        volume: state.volume,
      }),
    },
  ),
);
