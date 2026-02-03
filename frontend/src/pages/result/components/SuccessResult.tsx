// 성공 결과 컴포넌트
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

import { useGameStore } from '../../../stores/useGameStore';
import { useResultStore } from '../../../stores/useResultStore';
import { useRoomStore } from '../../../stores/useRoomStore';
import { formatTime } from '../../../utils/utils';
import type { SuccessSubmissionResult } from '../types/resultTypes';
// TODO: 아이콘 추가 후 import 활성화
// import rocketIcon from '../../../assets/images/icons/rocket.png';

interface Props {
  result: SuccessSubmissionResult;
}

// 글자별 애니메이션 variants (custom으로 index 받아서 delay 적용)
const INITIAL_DELAY = 0.5; // 화면 전환 후 대기 시간

const letterVariants = {
  hidden: {
    opacity: 0,
    y: 50,
    scale: 0,
  },
  visible: (index: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 500,
      damping: 15,
      delay: INITIAL_DELAY + index * 0.1,
    },
  }),
};

const SuccessResult = ({ result }: Props) => {
  const navigate = useNavigate();
  const clearStore = useResultStore((state) => state.clear);
  const { questOrder, executionTimeMs, next } = result;

  const successText = 'SUCCESS!';

  const handleNext = () => {
    clearStore();
    if (next.hasNextQuest) {
      // 다음 문제로 넘어가면 draft로 초기화 하기
      const { draft } = useRoomStore.getState();
      if (draft) {
        useGameStore.getState().setGameState(draft.life, draft.hints);
      }

      // 다음 문제로 넘어가면 submissionId null로 초기화 하기
      useGameStore.getState().setSubmissionId(null);

      // 다음 퀘스트 ID 설정 후 스토리 페이지로 이동
      useRoomStore.getState().setCurrentQuestId(next.nextQuestId);
      navigate('/story');
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
        <div className="flex">
          {successText.split('').map((letter, index) => (
            <motion.span
              key={index}
              className="text-green-400 text-4xl font-bold"
              variants={letterVariants}
              custom={index}
              initial="hidden"
              animate="visible"
            >
              {letter}
            </motion.span>
          ))}
        </div>
      </div>

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
