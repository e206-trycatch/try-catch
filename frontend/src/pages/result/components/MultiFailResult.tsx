// 멀티모드 실패 결과 컴포넌트
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { getGameSession } from '../../../api/gameSession';
import { disconnectStomp } from '../../../sockets/stomp';
import { useGameStore } from '../../../stores/useGameStore';
import { useResultStore } from '../../../stores/useResultStore';
import { useStore } from '../../../stores/useStore';
import { formatTime } from '../../../utils/utils';
import useRetrySocket from '../hooks/useRetrySocket';
import type { FailSubmissionResult } from '../types/resultTypes';

interface Props {
  result: FailSubmissionResult;
}

const MultiFailResult = ({ result }: Props) => {
  const navigate = useNavigate();
  const clearStore = useResultStore((state) => state.clear);
  const currentNickname = useStore((state) => state.user?.nickname);

  const [showError, setShowError] = useState(false);
  const [isHost, setIsHost] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [retryError, setRetryError] = useState(false);

  const { roomId, questId, questOrder, executionTimeMs, roomState, errorLog } =
    result;
  const { remainingLife } = roomState;
  const isGameOver = remainingLife === 0;

  // 호스트 여부 확인
  useEffect(() => {
    const checkHost = async () => {
      try {
        const session = await getGameSession(roomId);
        const hostNickname = session.host.nickname;
        setIsHost(hostNickname === currentNickname);
      } catch (error) {
        console.error('[MultiFailResult] 호스트 확인 실패:', error);
        // 에러 시 기본값 false 유지
      } finally {
        setIsLoading(false);
      }
    };

    checkHost();
  }, [roomId, currentNickname]);

  // RETRY_STARTED 메시지 구독 (게임 오버가 아닐 때만)
  const { sendRetry, isRetrying } = useRetrySocket({
    roomId,
    questId,
    enabled: !isGameOver,
  });

  // 호스트가 재도전 버튼 클릭
  const handleRetry = async () => {
    if (!isHost || isRetrying) return;

    setRetryError(false);

    try {
      await sendRetry();
      // API가 RETRY_STARTED를 브로드캐스트하므로,
      // 호스트도 STOMP 메시지를 받아서 이동함
      // 혹시 메시지를 못 받을 경우를 대비해 타임아웃 후 직접 이동
      setTimeout(() => {
        clearStore();
        navigate(`/game/${roomId}/${questId}`);
      }, 3000);
    } catch {
      setRetryError(true);
    }
  };

  // 메인 페이지로 이동 (호스트/게스트 모두 가능)
  const handleGoToMain = () => {
    clearStore();
    useGameStore.getState().setMode(null);
    disconnectStomp();
    navigate('/');
  };

  // 로딩 중
  if (isLoading) {
    return (
      <div className="flex flex-col items-center gap-6">
        <p className="text-white">결과를 불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <p className="text-xl text-white">Quest {questOrder}</p>

      <div className="flex items-center gap-4">
        <span className="text-4xl">💀</span>
        <span className="text-4xl font-bold text-red-500">
          {isGameOver ? 'GAME OVER' : 'ERROR!'}
        </span>
      </div>

      <p className="text-white">총 소요시간 {formatTime(executionTimeMs)}</p>

      {/* 남은 목숨 */}
      <div className="flex items-center gap-2">
        <span className="text-white">남은 목숨</span>
        <div className="flex gap-1">
          {Array.from({ length: remainingLife }).map((_, i) => (
            <span key={i} className="text-red-500">
              ♥
            </span>
          ))}
        </div>
      </div>

      {/* 에러 로그 토글 */}
      <div className="w-full max-w-md">
        <button
          onClick={() => setShowError(!showError)}
          className="flex items-center gap-2 text-white"
        >
          실패 원인 에러 확인 {showError ? '∧' : '∨'}
        </button>
        {showError && (
          <div className="mt-2 overflow-x-auto whitespace-pre-wrap bg-white p-4 text-black">
            {errorLog}
          </div>
        )}
      </div>

      {/* 버튼 영역 - 호스트/게스트 분기 */}
      <div className="flex flex-col items-center gap-4">
        {!isGameOver && (
          <>
            {isHost ? (
              // 호스트: 재도전 버튼 표시
              <div className="flex flex-col items-center gap-2">
                <button
                  onClick={handleRetry}
                  disabled={isRetrying}
                  className="border border-white px-6 py-3 text-white hover:bg-white hover:text-black disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isRetrying ? '재도전 준비 중...' : '재도전 >'}
                </button>
                {retryError && (
                  <p className="text-sm text-red-400">
                    재도전 요청에 실패했습니다. 다시 시도해주세요.
                  </p>
                )}
              </div>
            ) : (
              // 게스트: 대기 메시지 표시
              <div className="flex flex-col items-center gap-2">
                <p className="text-gray-400">
                  호스트가 재도전 여부를 결정 중입니다...
                </p>
                <div className="flex gap-1">
                  <span className="animate-bounce">.</span>
                  <span className="animate-bounce delay-100">.</span>
                  <span className="animate-bounce delay-200">.</span>
                </div>
              </div>
            )}
          </>
        )}

        {/* 메인 페이지로 버튼 - 모두 표시 */}
        <button
          onClick={handleGoToMain}
          className="border border-white px-6 py-3 text-white hover:bg-white hover:text-black"
        >
          메인 페이지로 &gt;
        </button>

        {/* 게스트가 나갈 경우 안내 메시지 */}
        {!isHost && !isGameOver && (
          <p className="text-xs text-gray-500">
            * 메인으로 나가면 재도전에 참여할 수 없습니다
          </p>
        )}
      </div>
    </div>
  );
};

export default MultiFailResult;
