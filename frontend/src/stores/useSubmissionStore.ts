import { create } from 'zustand';

import type { SubmissionResponse } from '../pages/game/types/apiTypes';

type RoleInfo = {
  role: 'FRONTEND' | 'BACKEND' | 'FULLSTACK';
  frameworkId: number;
};

type SubmissionResult = {
  submissionId: number;
  roomId: number;
  questId: number;
  questOrder: number;
  status: 'SUCCESS' | 'FAIL' | null;
  score: number;
  executionTimeMs: number;
  remainingLife: number;
  remainingHintCount: number;
  roles: RoleInfo[];
  hasNextQuest: boolean;
  nextQuestId: number | null;
};

// 상태 구조
interface SubmissionState {
  result: SubmissionResult | null;
  setResult: (data: SubmissionResponse) => void;
  clearResult: () => void;
}

export const useSubmissionStore = create<SubmissionState>((set) => ({
  result: null,

  setResult: (res) =>
    set({
      result: {
        submissionId: res.data.submissionId,
        roomId: res.data.roomId,
        questId: res.data.questId,
        questOrder: res.data.questOrder,
        status: res.data.status,
        score: res.data.score,
        executionTimeMs: res.data.executionTimeMs,

        remainingLife: res.data.roomState.remainingLife,
        remainingHintCount: res.data.roomState.remainingHintCount,

        roles: res.data.roles,

        hasNextQuest: res.data.next.hasNextQuest,
        nextQuestId: res.data.next.nextQuestId ?? null,
      },
    }),

  clearResult: () => set({ result: null }),
}));
