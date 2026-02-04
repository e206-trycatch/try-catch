import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { fetchQuestList, leaveMultiRoom } from '../../api/roomApi';
import shootingStarWhite from '../../assets/images/icons/try-catch-favicon-fefefe.png';
import ErrorMessage from '../../components/common/ErrorMessage';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import InviteCodeSection from '../../components/lobby/InviteCodeSection';
import PlayerCard from '../../components/lobby/PlayerCard';
import { pixelClipPath, titleClipPath } from '../../constants/clipPaths';
import { disconnectStomp } from '../../sockets/stomp';
import { useLobbyStore } from '../../stores/useLobbyStore';
import { useRoomStore } from '../../stores/useRoomStore';
import { useSocketStore } from '../../stores/useSocketStore';
import { useStore } from '../../stores/useStore';
import { getFramework, getPosition } from '../../utils/participantUtils';
import { useLobbyData } from './hooks/useLobbyData';
import { useLobbySocket } from './hooks/useLobbySocket';

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
  const { roomInfo, status, errorMessage, resetLobby, startQuestData } =
    useLobbyStore();
  const connected = useSocketStore((s) => s.connected);

  // 데이터 fetch + polling
  useLobbyData(roomId);

  // STOMP 연결 + 구독
  const { sendJoin, sendQuestReady } = useLobbySocket(roomId);

  // 퀘스트 목록 사전 로딩
  const [firstQuestId, setFirstQuestId] = useState<number | null>(null);
  const questFetchedRef = useRef(false);

  // 네비게이션/이탈 가드 ref
  const isNavigatingToGameRef = useRef(false);
  const isLeavingRef = useRef(false);

  // roomInfo + 유저 닉네임으로 역할/ID 파생
  const nickname = user?.nickname ?? null;
  const currentUserRole =
    roomInfo && nickname
      ? roomInfo.host.nickname === nickname
        ? 'HOST'
        : roomInfo.guest?.nickname === nickname
          ? 'GUEST'
          : null
      : null;
  const currentUserId =
    roomInfo && nickname
      ? roomInfo.host.nickname === nickname
        ? roomInfo.host.userId
        : roomInfo.guest?.nickname === nickname
          ? roomInfo.guest.userId
          : null
      : null;

  // 퀘스트 목록 사전 로딩 (roomInfo 확보 시)
  useEffect(() => {
    if (!roomInfo || questFetchedRef.current) return;
    questFetchedRef.current = true;

    const loadQuests = async () => {
      try {
        const questResponse = await fetchQuestList(roomInfo.themeId);
        const quests = questResponse.result;
        if (!quests || quests.length === 0) return;
        const firstQuest = quests.find((q) => q.questOrder === 1) || quests[0];
        setFirstQuestId(firstQuest.questId);

        // useRoomStore에 캐싱
        const roomStore = useRoomStore.getState();
        roomStore.setQuestList(roomInfo.themeId, quests);
      } catch (err) {
        console.error('퀘스트 목록 로드 실패:', err);
      }
    };

    loadQuests();
  }, [roomInfo]);

  // 최초 fetch 성공 시 STOMP join 발행
  const joinSentRef = useRef(false);
  useEffect(() => {
    if (
      status !== 'success' ||
      !roomInfo ||
      !nickname ||
      !connected ||
      currentUserId == null ||
      joinSentRef.current
    )
      return;

    sendJoin(currentUserId, nickname);
    joinSentRef.current = true;
  }, [status, roomInfo, nickname, connected, currentUserId, sendJoin]);

  // START_QUEST 수신 시 네비게이션
  const navigatingRef = useRef(false);
  useEffect(() => {
    if (!startQuestData || !roomInfo || navigatingRef.current) return;

    navigatingRef.current = true;
    isNavigatingToGameRef.current = true;

    const roomStore = useRoomStore.getState();

    // 멀티모드 설정을 먼저 수행
    roomStore.setMode('MULTI');
    roomStore.setRoomId(roomInfo.roomId);
    roomStore.setCurrentQuestId(startQuestData.questId);

    // 스토리 페이지로 바로 이동
    // StoryPage에서 fetchMultiQuestStories를 호출하여 스토리 데이터를 불러옴
    navigate('/story');
  }, [startQuestData, roomInfo, navigate]);

  // 언마운트 시 store 초기화
  useEffect(() => {
    return () => {
      resetLobby();
    };
  }, [resetLobby]);

  // 호스트 시작하기
  const handleStart = () => {
    if (firstQuestId == null || !roomInfo) return;

    // STOMP 메시지 전송 (호스트와 게스트 모두 START_QUEST 메시지를 받아서 이동)
    sendQuestReady(firstQuestId);
  };

  const handleLeave = async () => {
    if (!roomId) return;

    const isHostLeaving = currentUserRole === 'HOST';
    const confirmMsg = isHostLeaving
      ? '호스트가 나가면 방이 삭제됩니다. 나가시겠습니까?'
      : '방을 나가시겠습니까?';

    if (!window.confirm(confirmMsg)) return;

    isLeavingRef.current = true;

    try {
      await leaveMultiRoom(roomId);
      disconnectStomp();
      resetLobby();
      navigate('/selection/theme');
    } catch (err) {
      console.error('방 나가기 실패:', err);
      isLeavingRef.current = false;
    }
  };

  const guestJoined = roomInfo?.guest != null;
  const invitationCode =
    roomInfo?.invitationCode ?? navState?.invitationCode ?? '';
  const isHost = currentUserRole === 'HOST';

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
          <div className="flex items-center gap-35 mt-6 mb-6">
            <div className="flex items-center gap-3">
              <div
                className="px-4 py-1 bg-[#fefefe] flex items-center justify-center"
                style={{ clipPath: titleClipPath }}
              >
                <span className="text-[#1a1a3e] text-[14px] font-bold">
                  방 제목
                </span>
              </div>
              <span className="text-white text-[18px] font-bold">
                {roomInfo?.roomName ?? 'try-catch'}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div
                className="px-4 py-1 bg-[#1a1a3e] flex items-center justify-center"
                style={{ clipPath: titleClipPath }}
              >
                <span className="text-white text-[14px] font-bold">테마명</span>
              </div>
              <span className="text-white text-[18px] font-bold">
                {roomInfo?.themeName ?? 'try-catch'}
              </span>
            </div>
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
              isReady={roomInfo?.host.isReady}
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
              isReady={guestJoined ? roomInfo!.guest!.isReady : undefined}
            />
          </div>

          {/* Invite code section */}
          <InviteCodeSection invitationCode={invitationCode} />

          {/* 시작 버튼 영역 - 호스트만 표시, 두 명 모두 있을 때만 활성화 */}
          {isHost && (
            <div className="flex flex-col items-center gap-3 mt-6">
              <button
                type="button"
                onClick={handleStart}
                disabled={!guestJoined || firstQuestId == null}
                className={`px-10 py-3 text-[18px] font-bold rounded-[8px] transition-colors cursor-pointer ${
                  guestJoined && firstQuestId != null
                    ? 'bg-[#1a1a3e] text-white hover:bg-[#2b2949] animate-lobby-blink'
                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                }`}
              >
                시작하기
              </button>
            </div>
          )}
        </div>

        {/* Go back link */}
        <div className="w-full flex justify-end mt-3">
          <button
            type="button"
            onClick={handleLeave}
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
