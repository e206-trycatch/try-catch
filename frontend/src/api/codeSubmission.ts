/**
 * 코드 제출 관련 API
 *
 * 채점 흐름:
 * 1. codeSubmission: POST로 코드 제출 → 채점 완료까지 대기 → 결과 반환
 * 2. getLatestSubmission: GET으로 최신 제출 결과 조회 (새로고침 대응용)
 *
 * 새로고침 시나리오:
 * - POST 요청 중 새로고침하면 응답을 받지 못함
 * - 하지만 서버에서는 채점이 진행됨
 * - getLatestSubmission으로 결과를 조회하면 됨
 *   - status: 'PENDING' → 아직 채점 중 → 폴링 필요
 *   - status: 'SUCCESS' | 'FAIL' → 채점 완료 → 결과 표시
 */

import type { SubmissionRequest } from '../pages/game/types/apiTypes';
import api from './api';

/**
 * 코드 제출 API
 *
 * @param roomId - 현재 방 ID
 * @param body - 제출할 코드 데이터 (frontend/backend 파일들)
 * @returns 채점 결과 (score, status, roomState 등)
 *
 * @description
 * - 동기 방식: 채점 완료될 때까지 응답을 기다림 (최대 90초)
 * - 채점 완료 후 SUCCESS/FAIL 결과 반환
 */
export async function codeSubmission(
  roomId: string | null,
  body: SubmissionRequest,
) {
  const res = await api.post(`/rooms/${roomId}/submissions`, body, {
    timeout: 90000, // 90초 타임아웃 (GPT 채점 시간 고려)
  });

  return res.data;
}

/**
 * 최신 제출 결과 조회 API
 *
 * @param roomId - 현재 방 ID
 * @returns 최신 제출 결과
 *
 * @description
 * - 새로고침 대응용: POST 중 새로고침하면 이 API로 결과 확인
 * - 응답 status 값:
 *   - 'PENDING': 아직 채점 중 → 폴링 필요
 *   - 'SUCCESS': 채점 성공 → 결과 페이지로 이동
 *   - 'FAIL': 채점 실패 → 결과 페이지로 이동
 */
export async function getLatestSubmission(roomId: string) {
  const res = await api.get(`/rooms/${roomId}/submissions`);
  return res.data;
}
