import { create } from 'zustand';

interface GameState {
  currentLife: number;
  currentHints: number;
  problemFrameworkId: number | null;

  setGameState: (life: number, hints: number) => void;
  setProblemFrameworkId: (id: number | null) => void;
}

export const useGameStore = create<GameState>((set) => ({
  currentLife: 3,
  currentHints: 3,
  problemFrameworkId: null,

  setGameState: (life, hints) =>
    set({
      currentLife: life,
      currentHints: hints,
    }),

  setProblemFrameworkId: (id) => ({
    problemFrameworkId: id,
  }),
}));
