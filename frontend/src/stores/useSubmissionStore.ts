import { create } from 'zustand';

import type {
  SubmissionResponse,
  SubmissionResult,
} from '../pages/game/types/apiTypes';

// 상태 구조
interface SubmissionState {
  result: SubmissionResult | null; // 상태 값
  setResult: (data: SubmissionResponse) => void; // 상태 변경 함수
  clearResult: () => void; // 상태 초기화 함수
}

// API 응답을 정리해서 store에 저장하는 코드
// create : zustand의 스토어 생성 함수
// 안에 우리가 관리하는 상태와 상태를 변경하는 함수를 정의
export const useSubmissionStore = create<SubmissionState>((set) => ({
  result: null,

  setResult: (res) => {
    const data = res.result;

    // set 함수 : store 안의 상태를 업데이트하는 함수
    set({
      result: {
        submissionId: data.submissionId,
        roomId: data.roomId,
        questId: data.questId,
        questOrder: data.questOrder,
        status: data.status,
        score: data.score,
        executionTimeMs: data.executionTimeMs,

        remainingLife: data.roomState.remainingLife ?? 0,
        remainingHintCount: data.roomState.remainingHintCount ?? 0,

        roles: data.roles,

        hasNextQuest: data.next.hasNextQuest ?? false,
        nextQuestId: data.next.nextQuestId ?? null,
      },
    });
  },
  // result 상태를 초기화하는 함수
  clearResult: () =>
    // result를 다시 null로 되돌림
    set({ result: null }),
}));
