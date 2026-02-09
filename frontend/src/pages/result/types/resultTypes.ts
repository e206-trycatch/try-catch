/**
 * 제출 결과 타입 정의
 *
 * 백엔드 응답 구조:
 * - PENDING: 아직 채점 중 (최소 정보만 반환)
 * - SUCCESS: 채점 성공 (전체 결과 + 다음 퀘스트 정보)
 * - FAIL: 채점 실패 (전체 결과 + 에러 로그)
 */

// ─────────────────────────────────────────────────────────────
// PENDING 상태 (채점 중)
// ─────────────────────────────────────────────────────────────
/**
 * 채점 진행 중일 때 반환되는 최소 정보
 * GET /rooms/{roomId}/submissions 에서 채점 중일 때 반환
 */
export interface PendingSubmissionResult {
  submissionId: number;
  roomId: number;
  status: 'PENDING';
}

// ─────────────────────────────────────────────────────────────
// SUCCESS/FAIL 상태 (채점 완료)
// ─────────────────────────────────────────────────────────────
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

// ─────────────────────────────────────────────────────────────
// 타입 조합
// ─────────────────────────────────────────────────────────────

/**
 * 채점 완료된 결과 (SUCCESS 또는 FAIL)
 * ResultPage에서 사용 - 채점이 완료된 상태만 표시
 */
export type SubmissionResult = SuccessSubmissionResult | FailSubmissionResult;

/**
 * API 응답 타입 (PENDING 포함)
 * 폴링 시 사용 - PENDING 상태도 처리해야 함
 */
export type SubmissionResponse =
  | PendingSubmissionResult
  | SuccessSubmissionResult
  | FailSubmissionResult;
