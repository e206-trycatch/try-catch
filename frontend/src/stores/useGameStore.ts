import { create } from 'zustand';

interface GameState {
  currentLife: number;
  currentHints: number;

  setGameState: (life: number, hints: number) => void;
}

export const useGameStore = create<GameState>((set) => ({
  currentLife: 3,
  currentHints: 3,

  setGameState: (life, hints) =>
    set({
      currentLife: life,
      currentHints: hints,
    }),
}));
