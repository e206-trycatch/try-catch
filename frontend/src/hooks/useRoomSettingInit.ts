import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

import type { AvailableFrameworks } from '../stores/useRoomStore';
import { useRoomStore } from '../stores/useRoomStore';
import { useStore } from '../stores/useStore';

type SettingResponse = {
  status: number;
  message: string;
  result: {
    themeId: number;
    themeName: string;
    availableFrameworks: AvailableFrameworks;
  };
};

/**
 * Single/Multi 설정 페이지 공통 초기화 훅
 * - themeId 체크 → accessToken 체크 → API 호출 → store 반영
 */
export const useRoomSettingInit = (
  fetchFn: (themeId: number) => Promise<SettingResponse>,
  label: string, // 에러 로그용 ("싱글" | "멀티")
) => {
  const navigate = useNavigate();
  const accessToken = useStore((s) => s.accessToken);
  const { draft, setThemeName, setAvailableFrameworks } = useRoomStore();

  useEffect(() => {
    if (!draft.themeId) {
      navigate('/selection/theme');
      return;
    }

    if (!accessToken) {
      toast.warn('로그인이 필요합니다.', { containerId: 'global' });
      navigate('/login');
      return;
    }

    (async () => {
      try {
        const data = await fetchFn(draft.themeId!);

        const { availableFrameworks: frameworks, themeName } =
          data?.result ?? {};
        if (!frameworks) {
          console.error(`${label} 설정 응답 형태 확인 필요:`, data);
          toast.error(data?.message ?? '설정 데이터를 불러오지 못했습니다.', {
            containerId: 'global',
          });
          return;
        }

        if (themeName) setThemeName(themeName);
        setAvailableFrameworks(frameworks);
      } catch (e) {
        console.error(`${label} 설정 데이터 로드 실패:`, e);
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
    fetchFn,
    label,
  ]);
};
