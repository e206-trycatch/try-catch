import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { createMultiRoom, fetchMultiSetting } from '../../api/roomApi';
import MultiRoomSettingForm from '../../components/room-setting/MultiRoomSettingForm';
import { pixelClipPath, titleClipPath } from '../../constants/clipPaths';
import { useRoomStore } from '../../stores/useRoomStore';
import { useStore } from '../../stores/useStore';

const MultiRoomSettingPage = () => {
  const navigate = useNavigate();

  const accessToken = useStore((s) => s.accessToken);
  const {
    draft,
    validateDraft,
    buildMultiRoomPayload,
    setThemeName,
    setAvailableFrameworks,
    setRoomId,
  } = useRoomStore();

  useEffect(() => {
    // themeId 없으면 테마 선택으로
    if (!draft.themeId) {
      navigate('/selection/theme');
      return;
    }

    if (!accessToken) {
      alert('로그인이 필요합니다.');
      navigate('/login');
      return;
    }

    // 실제 API 호출
    (async () => {
      try {
        const data = await fetchMultiSetting(draft.themeId!);

        const { availableFrameworks: frameworks, themeName } =
          data?.result ?? {};
        if (!frameworks) {
          console.error('멀티 설정 응답 형태 확인 필요:', data);
          alert(data?.message ?? '설정 데이터를 불러오지 못했습니다.');
          return;
        }

        if (themeName) setThemeName(themeName);
        setAvailableFrameworks(frameworks);
      } catch (e) {
        console.error('멀티 설정 데이터 로드 실패:', e);
        alert('설정 데이터를 불러오지 못했습니다.');
      }
    })();
  }, [
    draft.themeId,
    accessToken,
    navigate,
    setThemeName,
    setAvailableFrameworks,
  ]);

  const handleStartMultiMode = async () => {
    const validation = validateDraft();
    if (!validation.ok) {
      alert(validation.errors.join('\n'));
      return;
    }

    const payload = buildMultiRoomPayload();
    if (!payload) {
      alert('방 생성 정보가 올바르지 않습니다.');
      return;
    }

    try {
      const result = await createMultiRoom(payload);
      setRoomId(result.roomId);
      navigate('/multi-room/lobby', {
        state: { roomId: result.roomId, invitationCode: result.invitationCode },
      });
    } catch (error) {
      console.error('방 생성 실패:', error);
      alert('방 생성에 실패했습니다. 다시 시도해주세요.');
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-center items-center bg-[#030030]">
      <div className="relative flex flex-col items-center">
        <div
          className="w-[190px] h-[50px] bg-white flex items-center justify-center z-10 absolute -top-[25px]"
          style={{ clipPath: titleClipPath }}
        >
          <span className="text-black text-center text-[20px] font-bold tracking-tight">
            멀티모드 설정
          </span>
        </div>

        <div
          className="w-[830px] h-[450px] bg-[#353359] flex items-center justify-center relative pt-10"
          style={{ clipPath: pixelClipPath }}
        >
          <div className="absolute left-[1px] top-[4px] bottom-[4px] w-[3px] bg-white opacity-90" />
          <div className="absolute right-[1px] top-[4px] bottom-[4px] w-[3px] bg-white opacity-90" />

          <MultiRoomSettingForm />
        </div>

        <div className="w-full flex justify-end mt-2">
          <button
            type="button"
            onClick={handleStartMultiMode}
            className="text-white/80 text-md font-bold cursor-pointer hover:text-white transition-colors bg-transparent border-none"
          >
            {'>>'} 멀티모드로 시작하기
          </button>
        </div>
      </div>
    </div>
  );
};

export default MultiRoomSettingPage;
