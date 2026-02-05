import { useNavigate } from 'react-router-dom';

import { useGameStore } from '../../../stores/useGameStore';

export default function TimeOverModal() {
  const navigate = useNavigate();

  const handleGoHome = () => {
    useGameStore.getState().stopTimer();
    useGameStore.getState().setMode(null);
    navigate('/');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="flex flex-col items-center gap-6 rounded-xl border border-red-600 bg-[#1a0a0a] px-12 py-10">
        <h2 className="text-2xl font-bold text-red-400">TIME OVER</h2>
        <p className="text-gray-300">제한 시간이 초과되었습니다.</p>
        <button
          onClick={handleGoHome}
          className="rounded-lg bg-red-600 px-6 py-2 font-semibold text-white transition-colors hover:bg-red-700"
        >
          메인화면으로 돌아가기
        </button>
      </div>
    </div>
  );
}
