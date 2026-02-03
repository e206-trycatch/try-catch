import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import shootingStarWhite from '../../assets/images/icons/try-catch-favicon-fefefe.png';
import ErrorMessage from '../../components/common/ErrorMessage';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import InviteCodeSection from '../../components/lobby/InviteCodeSection';
import PlayerCard from '../../components/lobby/PlayerCard';
import { pixelClipPath, titleClipPath } from '../../constants/clipPaths';
import { useLobbyStore } from '../../stores/useLobbyStore';
import { useRoomStore } from '../../stores/useRoomStore';
import { useStore } from '../../stores/useStore';
import { getFramework, getPosition } from '../../utils/participantUtils';
import { useLobbyData } from './hooks/useLobbyData';

// * 초대코드(invitationCode) 초기화 로직
// - location.state: 이전 페이지에서 navigate로 넘어온 경우 (최초 진입)
// - useRoomStore: 페이지를 새로고침하여 location state가 초기화된 경우 (전역 상태)
// location.state가 우선순위를 가지며, 값이 없을 경우 스토어 값을 fallback으로 사용
const LobbyPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const user = useStore((s) => s.user);

  // roomId: navigation state 우선, useRoomStore fallback
  const navState = location.state as {
    roomId?: number;
    invitationCode?: string;
  } | null;
  const roomStoreRoomId = useRoomStore((s) => s.currentRoomId);
  const roomId = navState?.roomId ?? roomStoreRoomId;

  // 로비 store
  const { roomInfo, status, errorMessage, resetLobby } = useLobbyStore();

  // 데이터 fetch + polling
  useLobbyData(roomId);

  // 언마운트 시 store 초기화
  useEffect(() => {
    return () => {
      resetLobby();
    };
  }, [resetLobby]);

  const guestJoined = roomInfo?.guest != null;
  const invitationCode =
    roomInfo?.invitationCode ?? navState?.invitationCode ?? '';

  // roomId 없음
  if (!roomId) {
    return (
      <div className="min-h-screen w-full flex flex-col justify-center items-center bg-[#030030]">
        <ErrorMessage message="방 정보를 찾을 수 없습니다." />
        <button
          onClick={() => navigate('/selection/theme')}
          className="mt-4 text-white/80 text-md font-bold cursor-pointer hover:text-white transition-colors"
        >
          돌아가기
        </button>
      </div>
    );
  }

  // 로딩 중
  if (status === 'loading' || status === 'idle') {
    return (
      <div className="min-h-screen w-full flex flex-col justify-center items-center bg-[#030030]">
        <LoadingSpinner />
        <span className="text-white mt-4">방 정보를 불러오는 중...</span>
      </div>
    );
  }

  // 에러
  if (status === 'error') {
    return (
      <div className="min-h-screen w-full flex flex-col justify-center items-center bg-[#030030]">
        <ErrorMessage
          message={errorMessage ?? '알 수 없는 오류가 발생했습니다.'}
        />
        <button
          onClick={() => navigate('/selection/theme')}
          className="mt-4 text-white/80 text-md font-bold cursor-pointer hover:text-white transition-colors"
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
              {roomInfo?.themeName ?? '테마'}
            </span>
          </div>

          {/* Player cards */}
          <div className="flex items-center gap-6 mb-8">
            {/* Host card */}
            <PlayerCard
              nickname={roomInfo?.host?.nickname ?? user?.nickname ?? '호스트'}
              position={roomInfo?.host ? getPosition(roomInfo.host) : 'Unknown'}
              framework={
                roomInfo?.host ? getFramework(roomInfo.host) : 'Unknown'
              }
              isHost={true}
              isActive={true}
            />

            {/* Guest card */}
            <PlayerCard
              nickname={guestJoined ? roomInfo!.guest!.nickname : '대기중...'}
              position={guestJoined ? getPosition(roomInfo!.guest!) : 'Unknown'}
              framework={
                guestJoined ? getFramework(roomInfo!.guest!) : 'Unknown'
              }
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
            onClick={() => navigate('/selection/theme')}
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
