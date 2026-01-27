// 제출 결과 타입 정의

export interface BaseSubmissionResult {
  submissionId: number;
  roomId: number;
  questId: number;
  questOrder: number;
  status: 'SUCCESS' | 'FAIL';
  score: number;
  executionTimeMs: number;
}

export interface SuccessSubmissionResult extends BaseSubmissionResult {
  status: 'SUCCESS';
  roomState: {
    remainingLife: number;
    remainingHintCount: number;
  };
  roles: Array<{
    role: 'FRONTEND' | 'BACKEND';
    frameworkId: number;
  }>;
  next: {
    hasNextQuest: boolean;
    nextQuestId: number | null;
  };
}

export interface FailSubmissionResult extends BaseSubmissionResult {
  status: 'FAIL';
  roomState: {
    remainingLife: number;
    remainingHintCount: number;
  };
  errorLog: string;
}

export type SubmissionResult = SuccessSubmissionResult | FailSubmissionResult;
