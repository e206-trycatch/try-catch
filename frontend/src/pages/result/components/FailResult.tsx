// 실패 결과 컴포넌트
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useGameStore } from '../../../stores/useGameStore';
import { useResultStore } from '../../../stores/useResultStore';
import { formatTime } from '../../../utils/utils';
import type { FailSubmissionResult } from '../types/resultTypes';
// TODO: 아이콘 추가 후 import 활성화
// import skullIcon from '../../../assets/images/icons/skull.png';

interface Props {
  result: FailSubmissionResult;
}

const FailResult = ({ result }: Props) => {
  const navigate = useNavigate();
  const clearStore = useResultStore((state) => state.clear);
  const [showError, setShowError] = useState(false);

  const { roomId, questId, questOrder, executionTimeMs, roomState, errorLog } =
    result;
  const { remainingLife } = roomState;
  console.log('result의 remaininLife:', remainingLife);
  const isGameOver = remainingLife === 0;

  const handleRetry = () => {
    clearStore();
    navigate(`/game/${roomId}/${questId}`);
  };

  const handleGoToMain = () => {
    clearStore();
    useGameStore.getState().setMode(null);
    navigate('/');
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <p className="text-white text-xl">Quest {questOrder}</p>

      <div className="flex items-center gap-4">
        {/* TODO: 아이콘 추가 후 활성화 */}
        {/* <img src={skullIcon} alt="fail" className="w-12 h-12" /> */}
        <span className="text-4xl">💀</span>
        <span className="text-red-500 text-4xl font-bold">
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
          className="text-white flex items-center gap-2"
        >
          실패 원인 에러 확인 {showError ? '∧' : '∨'}
        </button>
        {showError && (
          <div className="mt-2 p-4 bg-white text-black whitespace-pre-wrap overflow-x-auto">
            {errorLog}
          </div>
        )}
      </div>

      {/* 버튼 */}
      <div className="flex gap-4">
        {!isGameOver && (
          <button
            onClick={handleRetry}
            className="px-6 py-3 border border-white text-white"
          >
            재도전 &gt;
          </button>
        )}
        <button
          onClick={handleGoToMain}
          className="px-6 py-3 border border-white text-white"
        >
          메인 페이지로 &gt;
        </button>
      </div>
    </div>
  );
};

export default FailResult;
