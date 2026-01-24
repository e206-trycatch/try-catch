import { create } from 'zustand';

interface SoundStore {
  // 상태
  isMuted: boolean;
  audioRef: HTMLAudioElement | null;
  volume: number;
  currentTrack: string | null;
  isPlaying: boolean;

  // 액션
  toggleMute: () => void;
  setAudioRef: (audio: HTMLAudioElement) => void;
  setMuted: (muted: boolean) => void;
  setVolume: (volume: number) => void;
  setTrack: (track: string | null) => void;
  setIsPlaying: (playing: boolean) => void;
}

export const useSoundStore = create<SoundStore>((set) => ({
  isMuted: false,
  audioRef: null,
  volume: 0.5,
  currentTrack: null,
  isPlaying: false,

  toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),
  setAudioRef: (audio) => set({ audioRef: audio }),
  setMuted: (muted) => set({ isMuted: muted }),
  setVolume: (volume) => set({ volume: Math.max(0, Math.min(1, volume)) }),
  setTrack: (track) => set({ currentTrack: track }),
  setIsPlaying: (playing) => set({ isPlaying: playing }),
}));
