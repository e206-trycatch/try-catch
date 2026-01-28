// 성공 결과 컴포넌트
import { useNavigate } from 'react-router-dom';
import { useResultStore } from '../../../stores/useResultStore';
import { formatTime } from '../../../utils/utils';
import type { SuccessSubmissionResult } from '../types/resultTypes';
// TODO: 아이콘 추가 후 import 활성화
// import rocketIcon from '../../../assets/images/icons/rocket.png';

interface Props {
  result: SuccessSubmissionResult;
}

const SuccessResult = ({ result }: Props) => {
  const navigate = useNavigate();
  const clearStore = useResultStore((state) => state.clear);
  const { roomId, questOrder, executionTimeMs, next } = result;

  const handleNext = () => {
    clearStore();
    if (next.hasNextQuest) {
      navigate(`/game/${roomId}/${next.nextQuestId}`);
    } else {
      navigate('/');
    }
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <p className="text-white text-xl">Quest {questOrder}</p>

      <div className="flex items-center gap-4">
        {/* TODO: 아이콘 추가 후 활성화 */}
        {/* <img src={rocketIcon} alt="success" className="w-12 h-12" /> */}
        <span className="text-4xl">🚀</span>
        <span className="text-green-400 text-4xl font-bold">SUCCESS!</span>
      </div>

      <p className="text-white">
        총 소요시간 {formatTime(executionTimeMs)}
      </p>

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
