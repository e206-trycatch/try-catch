// 제출 결과 Store
import { create } from 'zustand';
import type { SubmissionResult } from '../pages/result/types/resultTypes';

interface ResultStore {
  submissionResult: SubmissionResult | null;
  roomId: number | null;
  setSubmissionResult: (result: SubmissionResult) => void;
  setRoomId: (id: number) => void;
  clear: () => void;
}

export const useResultStore = create<ResultStore>((set) => ({
  submissionResult: null,
  roomId: null,
  setSubmissionResult: (result) => set({ submissionResult: result }),
  setRoomId: (id) => set({ roomId: id }),
  clear: () => set({ submissionResult: null, roomId: null }),
}));
