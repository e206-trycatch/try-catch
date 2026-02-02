import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import ModeSelectionButton from '../../assets/images/buttons/mode_selection_button.png';
import { useRoomStore } from '../../stores/useRoomStore';

const ModeSelectionPage = () => {
  const navigate = useNavigate();

  const { setMode, resetRoomCreation } = useRoomStore();

  useEffect(() => {
    resetRoomCreation();
  }, [resetRoomCreation]);

  const handleModeSelect = (mode: 'SINGLE' | 'MULTI') => {
    setMode(mode);
    navigate('/selection/theme');
  };

  return (
    <div className="flex w-[608px] flex-col items-center gap-16">
      <div className="blinking-text text-2xl font-normal leading-[48px] tracking-[-0.7px]">
        모드를 선택해주세요.
      </div>

      {/* 모드 컨테이너 박스 */}
      <div className="flex justify-center items-start gap-[55px] self-stretch pb-2">
        <ModeCard title="싱글모드" onClick={() => handleModeSelect('SINGLE')} />
        <ModeCard title="멀티모드" onClick={() => handleModeSelect('MULTI')} />
      </div>
    </div>
  );
};

interface ModeCardProps {
  title: string;
  onClick?: () => void;
}

const ModeCard = ({ title, onClick }: ModeCardProps) => {
  return (
    <button
      onClick={onClick}
      // 1. 버튼 자체에 transition과 hover 시 scale/shadow 효과 추가
      className="group relative w-full md:w-64 h-80 focus:outline-none flex items-center justify-center
                 transition-all duration-300 hover:scale-105 hover:shadow-2xl"
    >
      {/* 배경 이미지 */}
      <img
        src={ModeSelectionButton}
        alt="mode card"
        className="absolute inset-0 w-full h-full object-cover group-hover:brightness-110 transition-all duration-300"
      />

      {/* 텍스트 내용 */}
      <div className="relative z-10 flex flex-col items-center justify-center">
        {/* 2. 텍스트에 group-hover:font-bold 추가 및 부드러운 전환을 위한 transition 추가 */}
        <h2
          className="text-[#FEFEFE] text-center text-[23px] font-normal leading-10 tracking-[-1px]
                       transition-all duration-300 group-hover:font-bold"
        >
          {title}
        </h2>
      </div>
    </button>
  );
};
export default ModeSelectionPage;
