import { create } from 'zustand';

import type { SubmissionRequest } from '../pages/game/types/apiTypes';

// 상태 구조
interface SubmissionState {
  result: SubmissionRequest | null;
  roomId: string | null;
  setRoomId: (id: string) => void;
  setResult: (data: SubmissionRequest) => void;
  clearResult: () => void;
}

// API 응답을 정리해서 store에 저장하는 코드
// create : zustand의 스토어 생성 함수
// 안에 우리가 관리하는 상태와 상태를 변경하는 함수를 정의
export const useSubmissionStore = create<SubmissionState>((set) => ({
  result: null,
  roomId: null,
  setRoomId: (id) => set({ roomId: id }),

  setResult: (data) => set({ result: data }),

  // result 상태를 초기화하는 함수
  clearResult: () =>
    // result를 다시 null로 되돌림
    set({ result: null }),
}));
