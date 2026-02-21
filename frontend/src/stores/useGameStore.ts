import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type GameMode = 'SINGLE' | 'MULTI' | null;

interface GameState {
  mode: GameMode;
  currentLife: number;
  currentHints: number;
  currentRoomId: number | null;
  submissionId: string | null;
  deadlineAt: string | null;
  remainingSeconds: number;

  setMode: (mode: GameMode) => void;
  setGameState: (life: number, hints: number) => void;
  initializeForRoom: (roomId: number, life: number, hints: number) => void;
  setSubmissionId: (id: number | null) => void;
  resetSubmissionId: () => void;
  startTimer: (deadlineAt: string) => void;
  stopTimer: () => void;
  expireTimer: () => void;
}

let intervalId: number | null = null;

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      mode: null,
      currentLife: 3,
      currentHints: 3,
      currentRoomId: null,
      submissionId: null,
      deadlineAt: null,
      remainingSeconds: 0,

      setMode: (mode) => set({ mode }),

      setGameState: (life, hints) =>
        set({
          currentLife: life,
          currentHints: hints,
        }),

      initializeForRoom: (roomId, life, hints) =>
        set({
          currentRoomId: roomId,
          currentLife: life,
          currentHints: hints,
        }),

      setSubmissionId: (id) =>
        set({
          submissionId: id ? String(id) : null,
        }),

      resetSubmissionId: () =>
        set({
          submissionId: null,
        }),

      startTimer: (deadlineAt) => {
        if (intervalId) clearInterval(intervalId);

        const calc = () =>
          Math.max(
            0,
            Math.floor((new Date(deadlineAt).getTime() - Date.now()) / 1000),
          );

        set({ deadlineAt, remainingSeconds: calc() });

        intervalId = window.setInterval(() => {
          const sec = calc();
          set({ remainingSeconds: sec });

          if (sec <= 0 && intervalId) {
            clearInterval(intervalId);
            intervalId = null;
          }
        }, 1000);
      },

      stopTimer: () => {
        if (intervalId) {
          clearInterval(intervalId);
          intervalId = null;
        }
      },

      expireTimer: () => {
        get().stopTimer();
        set({ remainingSeconds: 0 });
      },
    }),
    {
      name: 'game-store',
      partialize: (state) => ({ mode: state.mode }),
    },
  ),
);
