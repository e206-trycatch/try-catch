import { useEffect, useState } from 'react';

import { getGameSession } from '@/api/gameSession';
import { getSingleTimer } from '@/api/getSingleTimer';
import { getMultiQuest } from '@/api/multiQuestFile';
import { getQuestFile } from '@/api/questFile';
import { getRetryQuestFile } from '@/api/retryQuestFile';
import { startSingleGameTimer } from '@/api/startSingleGameTimer';
import { useGameStore } from '@/stores/useGameStore';
import { useRoomStore } from '@/stores/useRoomStore';

import { TIMER_DELAY } from '../constants';
import type { GameSessionResponse } from '../types/apiTypes';
import type { CodeRole, QuestInfo } from '../types/ideTypes';

export function useGameInit(
  roomId: string | undefined,
  questId: string | undefined,
) {
  const [questInfo, setQuestInfo] = useState<QuestInfo | null>(null);
  const [problemFrameworkId, setProblemFrameworkId] = useState<number | null>(
    null,
  );
  const [gameSession, setGameSession] = useState<GameSessionResponse | null>(
    null,
  );
  const [userRole, setUserRole] = useState<CodeRole>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { submissionId, startTimer, stopTimer, initializeForRoom } =
    useGameStore();
  const mode = useGameStore((state) => state.mode);

  // 초기 게임 상태 설정
  useEffect(() => {
    if (!roomId || !questId) return;
    const mode = useGameStore.getState().mode;

    const initSetting = async () => {
      try {
        setLoading(true);
        setError(null);

        let data = null;

        // 첫 진입 (재도전 아님)
        if (submissionId === null) {
          data =
            mode === 'MULTI'
              ? await getMultiQuest(questId, roomId)
              : await getQuestFile(questId, roomId);
        } else if (submissionId) {
          // 재도전: 이전 제출 코드 + 에러 로그 복원
          data = await getRetryQuestFile(submissionId, roomId);
        } else {
          throw new Error('submissionId가 올바르지 않습니다.');
        }

        setUserRole(data.myPosition ?? null);
        setProblemFrameworkId(data.problemFrameworkId);
        setQuestInfo(data);
      } catch (e) {
        console.error('문제 정보 로드 실패:', e);
        setError('문제 정보를 불러오지 못했습니다.');
        return;
      } finally {
        setLoading(false);
      }

      if (mode === 'MULTI') {
        try {
          const session = await getGameSession(Number(roomId));
          setGameSession(session);
        } catch (e) {
          console.error('멀티 세션 로드 실패:', e);
        }
      }

      // 타이머 복원
      try {
        const timeData = await getSingleTimer(Number(roomId));

        if (timeData.startedAt) {
          // 기존 타이머가 있으면 복원 (새로고침 대응)
          startTimer(timeData.deadlineAt);
        } else if (mode === 'SINGLE') {
          await new Promise((r) => setTimeout(r, TIMER_DELAY));
          const newTimeData = await startSingleGameTimer(Number(roomId));
          startTimer(newTimeData.deadlineAt);
        }
      } catch (e) {
        console.error('타이머 조회 실패:', e);
      }
    };

    initSetting();
  }, [questId, roomId, submissionId, startTimer, mode]);

  // 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      stopTimer();
    };
  }, [stopTimer]);

  // 초기 게임 상태 설정 - 목숨/힌트 수
  useEffect(() => {
    const { draft } = useRoomStore.getState();
    const { currentRoomId } = useGameStore.getState();

    if (!draft) {
      setError('유효하지 않은 접근입니다. 처음부터 시작해주세요.');
      return;
    }

    if (currentRoomId !== Number(roomId)) {
      initializeForRoom(Number(roomId), draft.life, draft.hints);
    }
  }, [roomId, initializeForRoom]);

  return {
    questInfo,
    problemFrameworkId,
    gameSession,
    userRole,
    loading,
    error,
    mode,
  };
}
