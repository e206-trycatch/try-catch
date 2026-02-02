import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import shootingStarWhite from '../../assets/images/icons/try-catch-favicon-fefefe.png';
import InviteCodeSection from '../../components/lobby/InviteCodeSection';
import PlayerCard from '../../components/lobby/PlayerCard';
import { pixelClipPath, titleClipPath } from '../../constants/clipPaths';
import { useRoomStore } from '../../stores/useRoomStore';
import { useStore } from '../../stores/useStore';

const positionLabel = (pos: string | null): string => {
  if (pos === 'FRONTEND') return 'Frontend';
  if (pos === 'BACKEND') return 'Backend';
  return 'Unknown';
};

const getFrameworkName = (
  frameworkId: number | null,
  position: string | null,
  availableFrameworks: ReturnType<
    typeof useRoomStore.getState
  >['availableFrameworks'],
): string => {
  if (!frameworkId || !position || !availableFrameworks) return 'Unknown';
  const list =
    position === 'FRONTEND'
      ? availableFrameworks.FRONTEND
      : availableFrameworks.BACKEND;
  return list.find((fw) => fw.id === frameworkId)?.name ?? 'Unknown';
};

const LobbyPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const invitationCode =
    (location.state as { invitationCode?: string })?.invitationCode || '';

  const user = useStore((s) => s.user);
  const { draft, themeName, availableFrameworks } = useRoomStore();

  // Placeholder for future socket integration
  const [guestJoined] = useState(false);
  const [guestNickname] = useState('대기중...');

  const hostPosition = positionLabel(draft.hostPosition);
  const hostFramework = getFrameworkName(
    draft.hostFrameworkId,
    draft.hostPosition,
    availableFrameworks,
  );

  const guestPosition = positionLabel(draft.guestPosition);
  const guestFramework = getFrameworkName(
    draft.guestFrameworkId,
    draft.guestPosition,
    availableFrameworks,
  );

  const handleGoBack = () => {
    navigate('/selection/theme');
  };

  if (!invitationCode) {
    return (
      <div className="min-h-screen w-full flex flex-col justify-center items-center bg-[#030030]">
        <div className="text-white text-xl mb-4">초대 코드가 없습니다.</div>
        <button
          onClick={handleGoBack}
          className="text-white/80 text-md font-bold cursor-pointer hover:text-white transition-colors"
        >
          돌아가기
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex flex-col justify-center items-center bg-[#030030]">
      <div className="relative flex flex-col items-center">
        {/* Main container with pixel border */}
        <div
          className="w-[830px] bg-[#353359] flex flex-col items-center relative pb-10"
          style={{ clipPath: pixelClipPath }}
        >
          {/* White side accent lines */}
          <div className="absolute left-[1px] top-[4px] bottom-[4px] w-[3px] bg-white opacity-90" />
          <div className="absolute right-[1px] top-[4px] bottom-[4px] w-[3px] bg-white opacity-90" />

          {/* Header bar */}
          <div className="w-full bg-[#2b2949] px-8 py-3 flex items-center gap-3">
            <img
              src={shootingStarWhite}
              alt="Shooting Star"
              className="w-[28px]"
            />
            <span className="text-white text-[22px] font-semibold tracking-wide">
              Waiting Room · · ·
            </span>
          </div>

          {/* Theme info */}
          <div className="flex items-center gap-3 mt-6 mb-6">
            <div
              className="px-4 py-1 bg-[#1a1a3e] flex items-center justify-center"
              style={{ clipPath: titleClipPath }}
            >
              <span className="text-white text-[14px] font-bold">테마명</span>
            </div>
            <span className="text-white text-[18px] font-bold">
              {themeName ?? '테마'} (Lv.1)
            </span>
          </div>

          {/* Player cards */}
          <div className="flex items-center gap-6 mb-8">
            {/* Host card */}
            <PlayerCard
              nickname={user?.nickname ?? '호스트'}
              position={hostPosition}
              framework={hostFramework}
              isHost={true}
              isActive={true}
            />

            {/* Guest card */}
            <PlayerCard
              nickname={guestJoined ? guestNickname : '대기중...'}
              position={guestPosition}
              framework={guestFramework}
              isHost={false}
              isActive={guestJoined}
            />
          </div>

          {/* Invite code section */}
          <InviteCodeSection invitationCode={invitationCode} />
        </div>

        {/* Go back link */}
        <div className="w-full flex justify-end mt-3">
          <button
            type="button"
            onClick={handleGoBack}
            className="text-white/80 text-md font-bold cursor-pointer hover:text-white transition-colors bg-transparent border-none"
          >
            {'<<'} 돌아가기
          </button>
        </div>
      </div>
    </div>
  );
};

export default LobbyPage;
