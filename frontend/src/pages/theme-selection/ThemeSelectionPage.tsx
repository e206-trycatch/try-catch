import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

import { fetchThemeList } from '../../api/themeApi';
import { ThemeCardList } from '../../components/theme-selection/ThemeCardList';
import { buttonClipPath } from '../../constants/clipPaths';
import { MOCK_THEMES, type Theme } from '../../mocks/mockData';
import { useGameStore } from '../../stores/useGameStore';
import { useRoomStore } from '../../stores/useRoomStore';

const ThemeSelectionPage = () => {
  const navigate = useNavigate();
  const { draft, setThemeId, setThemeImageUrl } = useRoomStore();
  const { mode } = draft;

  const [themes, setThemes] = useState<Theme[]>(MOCK_THEMES);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // submissionId 초기화
  const resetSubmissionId = useGameStore((state) => state.resetSubmissionId);
  useEffect(() => {
    resetSubmissionId();
  }, [resetSubmissionId]);

  useEffect(() => {
    if (!mode) {
      toast.warn('모드 선택이 필요합니다.', {
        containerId: 'global',
      });
      navigate('/selection/mode');
    }
  }, [mode, navigate]);

  useEffect(() => {
    const controller = new AbortController();

    const loadThemes = async () => {
      setLoading(true);
      setError(null);

      try {
        const apiThemes = await fetchThemeList(controller.signal);

        if (!apiThemes) {
          setError('테마 정보를 불러오지 못했습니다.');
          return; // MOCK_THEMES 유지
        }

        setThemes(
          apiThemes.map((t) => ({
            ...t,
            quests: [],
            isAvailable: true,
          })),
        );
      } catch (e) {
        if (axios.isCancel(e)) return;
        setError('테마 정보를 불러오지 못했습니다.');
        // MOCK_THEMES 유지 (fallback)
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    loadThemes();
    return () => controller.abort();
  }, []);

  const handleThemeSelect = (themeId: number) => {
    setThemeId(themeId);
  };

  const handleStartGame = (theme: Theme) => {
    setThemeId(theme.themeId);
    setThemeImageUrl(theme.themeImageUrl);
    navigate(
      mode === 'SINGLE' ? '/single-room-settings' : '/multi-room-settings',
    );
  };

  const handleInvitationCodeClick = () => {
    navigate('/invitation');
  };

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-[900px] gap-6 p-4 mx-auto">
      <div className="blinking-text text-2xl font-normal leading-relaxed tracking-tight text-white mb-2">
        {loading
          ? '테마 정보를 불러오는 중...'
          : error
            ? '테마 정보를 불러오지 못했습니다.'
            : '플레이할 테마를 선택해주세요.'}
      </div>

      {mode === 'MULTI' && (
        <button
          onClick={handleInvitationCodeClick}
          className="px-6 py-3 bg-[#2b2949] text-white hover:bg-[#353359] transition-colors duration-200 border border-[#555184]"
          style={{ clipPath: buttonClipPath }}
        >
          초대 코드로 참여하기
        </button>
      )}

      <ThemeCardList
        themes={themes}
        onThemeSelect={handleThemeSelect}
        onStartGame={handleStartGame}
      />
    </div>
  );
};

export default ThemeSelectionPage;
