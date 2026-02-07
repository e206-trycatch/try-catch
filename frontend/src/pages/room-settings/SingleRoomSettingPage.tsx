import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

import { fetchSingleSetting } from '../../api/roomApi';
import SingleRoomSettingForm from '../../components/room-setting/SingleRoomSettingForm';
import { pixelClipPath, titleClipPath } from '../../constants/clipPaths';
import { createRoomAndStartQuest } from '../../services/roomService';
import { useRoomStore } from '../../stores/useRoomStore';
import { useStore } from '../../stores/useStore'; // 토큰 확인용

const SingleRoomSettingPage = () => {
  const navigate = useNavigate();

  const accessToken = useStore((s) => s.accessToken);
  const {
    draft,
    validateDraft,
    buildCreatePayload,
    setThemeName,
    setAvailableFrameworks,
    setRoomId,
    setCurrentQuestId,
  } = useRoomStore();

  useEffect(() => {
    // themeId 없으면 흐름이 꼬인 거라 테마선택으로
    if (!draft.themeId) {
      navigate('/selection/theme');
      return;
    }

    // 토큰 없으면 401 날 가능성이 높으니 로그인
    if (!accessToken) {
      toast.warn('로그인이 필요합니다.', { containerId: 'global' });
      navigate('/login');
      return;
    }

    // 항상 실제 API 호출
    (async () => {
      try {
        const data = await fetchSingleSetting(draft.themeId!);

        // result/availableFrameworks가 없으면 크래시 방지
        const { availableFrameworks: frameworks, themeName } =
          data?.result ?? {};
        if (!frameworks) {
          console.error('싱글 설정 응답 형태 확인 필요:', data);
          toast.error(
            data?.message ?? '설정 데이터를 불러오지 못했습니다.',
            { containerId: 'global' },
          );
          return;
        }

        if (themeName) setThemeName(themeName);
        setAvailableFrameworks(frameworks);
      } catch (e) {
        console.error('싱글 설정 데이터 로드 실패:', e);
        toast.error('설정 데이터를 불러오지 못했습니다.', {
          containerId: 'global',
        });
      }
    })();
  }, [
    draft.themeId,
    accessToken,
    navigate,
    setThemeName,
    setAvailableFrameworks,
  ]);

  const handleStartGame = async () => {
    const validation = validateDraft();
    if (!validation.ok) {
      toast.warn(validation.errors.join('\n'), {
        containerId: 'global',
      });
      return;
    }

    const payload = buildCreatePayload();
    if (!payload) {
      toast.error('방 생성 정보가 올바르지 않습니다.', {
        containerId: 'global',
      });
      return;
    }

    const result = await createRoomAndStartQuest(payload, draft.themeId!);

    if (result.success) {
      setRoomId(result.roomId);
      setCurrentQuestId(result.questId);
      navigate('/story');
    } else {
      toast.error(result.error, { containerId: 'global' });
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
            싱글모드 설정
          </span>
        </div>

        <div
          className="w-[830px] h-[450px] bg-[#353359] flex items-center justify-center relative pt-10"
          style={{ clipPath: pixelClipPath }}
        >
          <div className="absolute left-[1px] top-[4px] bottom-[4px] w-[3px] bg-white opacity-90" />
          <div className="absolute right-[1px] top-[4px] bottom-[4px] w-[3px] bg-white opacity-90" />

          <SingleRoomSettingForm />
        </div>

        <div className="w-full flex justify-end mt-2">
          <button
            type="button"
            onClick={handleStartGame}
            className="text-white/80 text-md font-bold cursor-pointer hover:text-white transition-colors bg-transparent border-none"
          >
            {'>>'} 싱글모드로 시작하기
          </button>
        </div>
      </div>
    </div>
  );
};

export default SingleRoomSettingPage;
