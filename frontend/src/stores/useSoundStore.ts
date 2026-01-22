import { create } from 'zustand';

interface SoundState {
  isMuted: boolean; // 음소거 상태
  volume: number; // 볼륨 (0~1)
  currentTrack: string | null; // 현재 재생 중인 트랙 경로
  isPlaying: boolean; // 재생 중 여부

  // 액션
  toggleMute: () => void;
  setMuted: (muted: boolean) => void;
  setVolume: (volume: number) => void;
  setTrack: (track: string | null) => void;
  setIsPlaying: (playing: boolean) => void;
}

export const useSoundStore = create<SoundState>((set) => ({
  isMuted: false,
  volume: 0.5,
  currentTrack: null,
  isPlaying: false,

  toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),
  setMuted: (muted) => set({ isMuted: muted }),
  setVolume: (volume) => set({ volume: Math.max(0, Math.min(1, volume)) }),
  setTrack: (track) => set({ currentTrack: track }),
  setIsPlaying: (playing) => set({ isPlaying: playing }),
}));
