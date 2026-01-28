import { create } from 'zustand';

import type {
  FailResponse,
  SuccessResponse,
} from '../pages/game/types/apiTypes';

// 상태 구조
interface SubmissionState {
  successResult: SuccessResponse | null;
  failResult: FailResponse | null;
  setSuccessResult: (res: SuccessResponse) => void;
  setFailResult: (res: FailResponse) => void;
  clearResult: () => void;
}

// API 응답을 정리해서 store에 저장하는 코드
// create : zustand의 스토어 생성 함수
// 안에 우리가 관리하는 상태와 상태를 변경하는 함수를 정의
export const useSubmissionStore = create<SubmissionState>((set) => ({
  successResult: null,
  failResult: null,

  setSuccessResult: (res) => {
    const data = res;

    set({
      successResult: {
        submissionId: data.submissionId,
        roomId: data.roomId,
        questId: data.questId,
        questOrder: data.questOrder,
        status: 'SUCCESS',
        score: data.score,
        executionTimeMs: data.executionTimeMs,
        roomState: data.roomState,
        roles: data.roles,
        next: data.next,
      },
    });
  },

  setFailResult: (res) => {
    const data = res;

    set({
      failResult: {
        submissionId: data.submissionId,
        roomId: data.roomId,
        questId: data.questId,
        questOrder: data.questOrder,
        status: 'FAIL',
        score: data.score,
        executionTimeMs: data.executionTimeMs,
        errorLog: data.errorLog,
        roomState: data.roomState,
      },
    });
  },
  // result 상태를 초기화하는 함수
  clearResult: () =>
    // result를 다시 null로 되돌림
    set({ successResult: null, failResult: null }),
}));
