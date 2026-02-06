// 싱글모드 실패 결과 컴포넌트
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { disconnectStomp } from '../../../sockets/stomp';
import { useGameStore } from '../../../stores/useGameStore';
import { useResultStore } from '../../../stores/useResultStore';
import { formatTime } from '../../../utils/utils';
import type { FailSubmissionResult } from '../types/resultTypes';

interface Props {
  result: FailSubmissionResult;
}

const SingleFailResult = ({ result }: Props) => {
  const navigate = useNavigate();
  const clearStore = useResultStore((state) => state.clear);
  const [showError, setShowError] = useState(false);

  const { roomId, questId, questOrder, executionTimeMs, roomState, errorLog } =
    result;
  const { remainingLife } = roomState;
  const isGameOver = remainingLife === 0;

  const handleRetry = () => {
    clearStore();
    navigate(`/game/${roomId}/${questId}`);
  };

  const handleGoToMain = () => {
    clearStore();
    useGameStore.getState().setMode(null);
    disconnectStomp();
    navigate('/');
  };

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

      {/* 버튼 */}
      <div className="flex gap-4">
        {!isGameOver && (
          <button
            onClick={handleRetry}
            className="border border-white px-6 py-3 text-white hover:bg-white hover:text-black"
          >
            재도전 &gt;
          </button>
        )}
        <button
          onClick={handleGoToMain}
          className="border border-white px-6 py-3 text-white hover:bg-white hover:text-black"
        >
          메인 페이지로 &gt;
        </button>
      </div>
    </div>
  );
};

export default SingleFailResult;
