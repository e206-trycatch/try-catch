/**
 * 결과 로딩 페이지
 *
 * 이 페이지의 역할:
 * 1. 코드 제출 → 채점 결과 대기 → 결과 페이지로 이동
 * 2. 새로고침 시 → 폴링으로 채점 결과 확인 → 결과 페이지로 이동
 *
 * 두 가지 진입 경로:
 * - Case 1: GamePage에서 제출 버튼 클릭 → codeResult 있음 → POST 요청
 * - Case 2: 새로고침 → codeResult 없음 (메모리에서 사라짐) → GET 폴링
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { codeSubmission, getLatestSubmission } from '../../api/codeSubmission';
import { disconnectStomp, subscribeRoom } from '../../sockets/stomp';
import { useGameStore } from '../../stores/useGameStore';
import { useResultStore } from '../../stores/useResultStore';
import { useSocketStore } from '../../stores/useSocketStore';
import { useSubmissionStore } from '../../stores/useSubmissionStore';
import DinoGame from '../dino-game/components/DinoGame';
import ErrorDisplay from './components/ErrorDisplay';
import { ERROR_CONFIGS, type ResultErrorType } from './types/errorTypes';
import type { SubmissionResult } from './types/resultTypes';
import { getErrorType } from './utils/errorUtils';

// ─────────────────────────────────────────────────────────────
// 폴링 설정 상수
// ─────────────────────────────────────────────────────────────
const POLLING_INTERVAL_MS = 3000; // 폴링 간격: 3초
const POLLING_MAX_ATTEMPTS = 30; // 최대 시도 횟수: 30번 (총 90초)

const ResultLoadingPage = () => {
  const navigate = useNavigate();

  // ─────────────────────────────────────────────────────────────
  // URL 파라미터에서 roomId 가져오기
  // ─────────────────────────────────────────────────────────────
  // 새로고침해도 URL에서 roomId를 가져올 수 있음
  const { roomId } = useParams<{ roomId: string }>();

  // ─────────────────────────────────────────────────────────────
  // 상태 관리
  // ─────────────────────────────────────────────────────────────
  const [errorType, setErrorType] = useState<ResultErrorType>('none');
  const [retryCount, setRetryCount] = useState(0); // 재시도 횟수 (재시도 버튼 클릭 시 증가)
  const [isCompleted, setIsCompleted] = useState(false); // 채점 완료 상태 (모달 표시용)
  const hasSubmitted = useRef(false); // 중복 제출 방지 플래그
  const hasHandledResult = useRef(false); // 결과 처리 완료 플래그 (중복 처리 방지)
  const isPollingCancelled = useRef(false); // 폴링 취소 플래그 (언마운트 시 true)

  // codeResult: 제출할 코드 데이터
  // - 정상 흐름: GamePage에서 설정됨
  // - 새로고침 시: null (메모리에서 사라짐)
  const codeResult = useSubmissionStore((state) => state.result);
  const mode = useGameStore((state) => state.mode);
  // 이전 제출 ID (재도전 시 이전 결과 판별용)
  const previousSubmissionId = useGameStore((state) => state.submissionId);

  // 결과 저장용 함수들
  const setSubmissionResult = useResultStore(
    (state) => state.setSubmissionResult,
  );
  const setSubmissionId = useGameStore((state) => state.setSubmissionId);
  const setGameState = useGameStore((state) => state.setGameState);

  // ─────────────────────────────────────────────────────────────
  // 결과 처리 함수
  // ─────────────────────────────────────────────────────────────
  /**
   * 채점 결과를 Store에 저장하고 결과 페이지로 이동
   *
   * @param result - 채점 결과 데이터
   */
  const handleResult = useCallback(
    (result: SubmissionResult) => {
      // 이미 결과 처리가 완료되었으면 중복 실행 방지
      if (hasHandledResult.current) {
        console.log('[handleResult] 이미 처리됨, 무시');
        return;
      }
      hasHandledResult.current = true;

      console.log('[handleResult] 시작, result:', result);

      // 1. 결과 저장
      setSubmissionResult(result);
      console.log('[handleResult] setSubmissionResult 완료');

      // 2. 게임 상태 업데이트 (남은 목숨, 힌트 횟수)
      setGameState(
        result.roomState.remainingLife,
        result.roomState.remainingHintCount,
      );
      console.log('[handleResult] setGameState 완료');

      // 3. submissionId 저장 (재도전 시 필요)
      setSubmissionId(result.submissionId);
      console.log('[handleResult] setSubmissionId 완료');

      // 4. 채점 완료 모달 표시 (navigate는 확인 버튼 클릭 시)
      setIsCompleted(true);
      console.log('[handleResult] 채점 완료 모달 표시');
    },
    [setGameState, setSubmissionId, setSubmissionResult],
  );

  // ─────────────────────────────────────────────────────────────
  // 폴링 함수
  // ─────────────────────────────────────────────────────────────
  /**
   * 일정 간격으로 GET 요청하여 채점 결과 확인
   *
   * 사용 시점: 새로고침으로 codeResult가 사라졌을 때
   *
   * 동작:
   * 1. GET /rooms/{roomId}/submissions 호출
   * 2. status가 'PENDING'이면 3초 후 재시도
   * 3. status가 'SUCCESS' 또는 'FAIL'이면 결과 처리
   * 4. 최대 20번(60초) 시도 후 에러 표시
   */
  const pollResult = useCallback(async (): Promise<void> => {
    for (let attempt = 0; attempt < POLLING_MAX_ATTEMPTS; attempt++) {
      // 컴포넌트 언마운트 시 폴링 중단
      if (isPollingCancelled.current) {
        console.log('[pollResult] 폴링 취소됨 (언마운트)');
        return;
      }

      try {
        // GET 요청으로 최신 제출 결과 조회
        const res = await getLatestSubmission(roomId!);
        const result = res.result;

        // 언마운트 체크 (API 응답 후)
        if (isPollingCancelled.current) {
          console.log('[pollResult] 폴링 취소됨 (언마운트)');
          return;
        }

        // 이전 제출과 같은 ID면 아직 새 제출이 없는 것 → 계속 폴링
        const currentSubmissionId = useGameStore.getState().submissionId;
        if (
          currentSubmissionId &&
          String(result.submissionId) === currentSubmissionId
        ) {
          console.log('[pollResult] 이전 결과와 동일, 계속 폴링');
          await new Promise((resolve) =>
            setTimeout(resolve, POLLING_INTERVAL_MS),
          );
          continue;
        }

        // 채점 완료 확인 (새로운 제출)
        if (result.status !== 'PENDING') {
          // 'SUCCESS' 또는 'FAIL' → 결과 처리
          handleResult(result);
          return;
        }

        // 아직 'PENDING' → 3초 대기 후 재시도
        await new Promise((resolve) =>
          setTimeout(resolve, POLLING_INTERVAL_MS),
        );
      } catch {
        // 언마운트 체크
        if (isPollingCancelled.current) {
          console.log('[pollResult] 폴링 취소됨 (언마운트)');
          return;
        }

        // 네트워크 에러 등 → 3초 대기 후 재시도
        await new Promise((resolve) =>
          setTimeout(resolve, POLLING_INTERVAL_MS),
        );
      }
    }

    // 최대 시도 횟수 초과 → 타임아웃 에러
    if (!isPollingCancelled.current) {
      setErrorType('timeout');
    }
  }, [handleResult, roomId]);

  // ─────────────────────────────────────────────────────────────
  // 메인 로직 (useEffect)
  // ─────────────────────────────────────────────────────────────
  /**
   * 컴포넌트 마운트 시 실행되는 메인 로직
   *
   * 분기 처리:
   * - codeResult 있음 → POST로 코드 제출
   * - codeResult 없음 (새로고침) → GET으로 결과 확인 또는 폴링
   */
  useEffect(() => {
    // 폴링 취소 플래그 초기화
    isPollingCancelled.current = false;

    const init = async () => {
      console.log('[init] 시작, roomId:', roomId, 'codeResult:', codeResult);

      // roomId 없으면 진행 불가
      // (잘못된 URL로 직접 접근한 경우)
      if (!roomId) {
        console.log('[init] roomId 없음 (URL 파라미터 누락), 에러 표시');
        setErrorType('invalid_room');
        return;
      }

      // ───────────────────────────────────────────────────────
      // Case 1: codeResult가 없음 (멀티모드 Guest 또는 새로고침)
      // ───────────────────────────────────────────────────────
      if (!codeResult) {
        // 멀티모드 Guest: 먼저 현재 상태 확인 후 폴링으로 대기
        // (STOMP 메시지가 타이밍 문제로 놓쳐질 수 있으므로 폴링을 병행)
        if (mode === 'MULTI') {
          console.log('[init] 멀티모드 Guest - 현재 상태 확인');
          console.log('[init] 이전 submissionId:', previousSubmissionId);
          try {
            // 이미 채점이 완료되었는지 확인
            const res = await getLatestSubmission(roomId);
            const result = res.result;

            console.log('[init] 반환된 submissionId:', result.submissionId);

            // 이전 제출과 같은 ID면 아직 새 제출이 없는 것 → 폴링 시작
            if (
              previousSubmissionId &&
              String(result.submissionId) === previousSubmissionId
            ) {
              console.log(
                '[init] 멀티모드 Guest - 이전 결과와 동일, 새 제출 대기 (폴링)',
              );
              pollResult();
              return;
            }

            if (result.status !== 'PENDING') {
              // 새로운 채점 완료 → 바로 결과 처리
              console.log('[init] 멀티모드 Guest - 새 채점 완료됨');
              handleResult(result);
              return;
            }
            // 아직 PENDING → 폴링 시작 (STOMP도 별도 useEffect에서 구독)
            console.log('[init] 멀티모드 Guest - PENDING 상태, 폴링 시작');
            pollResult();
          } catch {
            console.log('[init] 멀티모드 Guest - 상태 확인 실패, 폴링 시작');
            // 에러 시에도 폴링 시작 (제출이 아직 안 됐을 수 있음)
            pollResult();
          }
          return;
        }

        // 싱글모드 새로고침: GET으로 현재 상태 확인
        try {
          const res = await getLatestSubmission(roomId);
          const result = res.result;

          if (result.status !== 'PENDING') {
            // 이미 채점 완료 → 바로 결과 페이지로
            handleResult(result);
          } else {
            // 아직 채점 중 → 폴링 시작
            pollResult();
          }
        } catch (err) {
          // 제출 내역이 없거나 에러 발생
          setErrorType(getErrorType(err));
        }
        return;
      }

      // ───────────────────────────────────────────────────────
      // Case 2: 정상 제출 (codeResult가 있음)
      // ───────────────────────────────────────────────────────
      // GamePage에서 제출 버튼 클릭 → 이 페이지로 이동
      // codeResult에 제출할 코드 데이터가 있음

      // 중복 제출 방지
      // React 18 StrictMode에서 useEffect가 2번 실행되는 것 방지
      if (hasSubmitted.current) return;
      hasSubmitted.current = true;

      try {
        // POST 요청으로 코드 제출
        // 채점 완료될 때까지 대기 (최대 90초)
        console.log('[init] POST 요청 시작');
        const res = await codeSubmission(roomId, codeResult);
        console.log('[init] POST 응답 받음:', res);

        // 채점 완료 → 결과 처리
        // (handleResult 내부에서 중복 처리 방지)
        console.log('[init] handleResult 호출 예정, res.result:', res.result);
        handleResult(res.result);
      } catch (err) {
        console.error('[init] POST 에러:', err);
        // 에러 타입에 따라 분류
        setErrorType(getErrorType(err));
        hasSubmitted.current = false; // 재시도 가능하도록 플래그 초기화
      }
    };

    init();

    // cleanup: 컴포넌트 언마운트 시 폴링 취소
    return () => {
      console.log('[useEffect cleanup] 폴링 취소 플래그 설정');
      isPollingCancelled.current = true;
    };
  }, [
    retryCount,
    roomId,
    codeResult,
    handleResult,
    pollResult,
    mode,
    previousSubmissionId,
  ]);

  // ─────────────────────────────────────────────────────────────
  // 멀티모드: 호스트/게스트 모두 STOMP 구독으로 SUBMISSION_COMPLETED 대기
  // ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const { client, connected } = useSocketStore.getState();
    console.log('[STOMP useEffect] 실행됨, mode:', mode, 'roomId:', roomId);
    console.log('[STOMP useEffect] 소켓 상태:', {
      hasClient: !!client,
      connected,
    });

    // 멀티모드일 때만 STOMP 구독 (호스트/게스트 모두)
    if (mode !== 'MULTI' || !roomId) {
      console.log('[STOMP useEffect] 조건 불충족으로 return');
      return;
    }

    console.log('[STOMP] 멀티모드 - SUBMISSION_COMPLETED 구독 시작');

    const unsub = subscribeRoom(Number(roomId), async (msg) => {
      console.log('[STOMP] 메시지 수신:', msg.type);
      if (msg.type === 'SUBMISSION_COMPLETED') {
        console.log('[STOMP] SUBMISSION_COMPLETED 수신');
        try {
          // 채점 완료 → 결과 조회
          const res = await getLatestSubmission(roomId);
          handleResult(res.result);
        } catch (err) {
          console.error('[STOMP] 결과 조회 실패:', err);
          setErrorType(getErrorType(err));
        }
      }

      // 호스트가 재도전 → 게스트도 게임 페이지로 이동 (납치)
      if (msg.type === 'RETRY_STARTED') {
        console.log('[STOMP] RETRY_STARTED 수신');
        const result = useResultStore.getState().submissionResult;

        if (!result) {
          // 엣지 케이스: 아직 채점 완료 전 (거의 불가능하지만 방어)
          // 결과 페이지로 가면 거기서 납치됨
          console.warn(
            '[STOMP] RETRY_STARTED 수신했으나 submissionResult 없음',
          );
          return;
        }

        // useRetrySocket과 동일하게 처리
        useResultStore.getState().clear();
        navigate(`/game/${roomId}/${result.questId}`);
      }
    });

    console.log(
      '[STOMP] 구독 결과:',
      unsub ? '성공' : '실패 (unsub가 undefined)',
    );

    return () => unsub?.();
  }, [mode, roomId, handleResult, navigate]);

  // ─────────────────────────────────────────────────────────────
  // 렌더링
  // ─────────────────────────────────────────────────────────────

  // 에러 상태: 에러 타입에 따른 UI 표시
  if (errorType !== 'none') {
    const config = ERROR_CONFIGS[errorType];
    return (
      <ErrorDisplay
        title={config.title}
        message={config.message}
        buttonText={config.buttonText}
        onClick={() => {
          if (config.action === 'home') {
            // 홈으로 이동 (invalid_room, unauthorized)
            useGameStore.getState().setMode(null);
            disconnectStomp();
            navigate('/');
          } else {
            // 재시도 (network, timeout)
            setErrorType('none');
            hasSubmitted.current = false;
            hasHandledResult.current = false;
            setRetryCount((c) => c + 1);
          }
        }}
      />
    );
  }

  // 정상 상태: 다이노 게임 표시
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-6">
      <p className="text-xl text-white">결과를 불러오는 중...</p>
      <DinoGame disabled={isCompleted} />
      <p className="text-sm text-gray-400">
        채점이 완료되면 자동으로 이동합니다
      </p>

      {/* 채점 완료 모달 */}
      {isCompleted && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="flex flex-col items-center gap-6 border border-white/20 bg-[#0a0a2e] px-12 py-10 text-center shadow-2xl">
            <span className="text-4xl">✅</span>
            <div className="flex flex-col gap-2">
              <p className="text-2xl font-bold text-green-400">채점 완료!</p>
              <p className="text-gray-400">결과 페이지로 이동합니다</p>
            </div>
            <button
              onClick={() => navigate(`/result/${roomId}`, { replace: true })}
              className="mt-2 border border-white px-8 py-3 text-white transition-colors hover:bg-white hover:text-black"
            >
              결과 확인 &gt;
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultLoadingPage;
