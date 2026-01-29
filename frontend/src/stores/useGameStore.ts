import { create } from 'zustand';

interface GameState {
  currentLife: number;
  currentHints: number;
  currentRoomId: number | null;
  problemFrameworkId: number | null;
  submissionId: string | null;

  setGameState: (life: number, hints: number) => void;
  initializeForRoom: (roomId: number, life: number, hints: number) => void;
  setProblemFrameworkId: (id: number | null) => void;
  setSubmissionId: (id: number | null) => void;
}

export const useGameStore = create<GameState>((set) => ({
  currentLife: 3,
  currentHints: 3,
  currentRoomId: null,
  problemFrameworkId: null,
  submissionId: null,

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

  setProblemFrameworkId: (id) =>
    set({
      problemFrameworkId: id,
    }),

  setSubmissionId: (id) =>
    set({
      submissionId: String(id),
    }),
}));
