import { useNavigate } from 'react-router-dom';

import { disconnectStomp } from '../../../sockets/stomp';
import { useGameStore } from '../../../stores/useGameStore';
import { useResultStore } from '../../../stores/useResultStore';
import { useRoomStore } from '../../../stores/useRoomStore';
import { formatTime } from '../../../utils/utils';
import type { SuccessSubmissionResult } from '../types/resultTypes';

interface Props {
  result: SuccessSubmissionResult;
}

const SuccessResult = ({ result }: Props) => {
  const navigate = useNavigate();
  const clearStore = useResultStore((state) => state.clear);
  const { questOrder, executionTimeMs, next, score } = result;

  const successText = 'SUCCESS!';

  const handleNext = () => {
    clearStore();
    if (next.hasNextQuest) {
      const { draft } = useRoomStore.getState();
      if (draft) {
        useGameStore.getState().setGameState(draft.life, draft.hints);
      }
      useGameStore.getState().setSubmissionId(null);
      useRoomStore.getState().setCurrentQuestId(next.nextQuestId);
      navigate('/story');
    } else {
      useGameStore.getState().setMode(null);
      disconnectStomp();
      navigate('/');
    }
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <p className="text-white text-xl">Quest {questOrder}</p>

      <div className="flex items-center gap-4">
        <span className="text-4xl">🚀</span>
        <div className="flex">
          {successText.split('').map((letter, index) => (
            <span
              key={index}
              className="text-green-400 text-4xl font-bold animate-success-letter"
              style={{ animationDelay: `${0.5 + index * 0.1}s` }}
            >
              {letter}
            </span>
          ))}
        </div>
      </div>

      <p className="text-2xl text-white font-semibold">코드 점수: {score}점</p>

      <p className="text-white">총 소요시간 {formatTime(executionTimeMs)}</p>

      <button
        onClick={handleNext}
        className="px-6 py-3 border border-white text-white hover:bg-white hover:text-black"
      >
        {next.hasNextQuest ? '다음문제 >' : '메인 페이지로 >'}
      </button>
    </div>
  );
};

export default SuccessResult;
