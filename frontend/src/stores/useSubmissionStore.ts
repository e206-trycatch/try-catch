import { create } from 'zustand';

import type { SubmissionRequest } from '../pages/game/types/apiTypes';

interface SubmissionState {
  result: SubmissionRequest | null;
  setResult: (data: SubmissionRequest) => void;
  clearResult: () => void;
}

export const useSubmissionStore = create<SubmissionState>((set) => ({
  result: null,

  setResult: (data) => set({ result: data }),

  clearResult: () => set({ result: null }),
}));
