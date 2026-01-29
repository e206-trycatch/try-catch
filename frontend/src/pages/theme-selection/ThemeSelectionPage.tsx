import axios from 'axios';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import api from '../../api/api';
import { ThemeCardList } from '../../components/theme-selection/ThemeCardList';
import { MOCK_THEMES, type Theme } from '../../mocks/mockData';
import { useRoomStore } from '../../stores/useRoomStore';

const ThemeSelectionPage = () => {
  const navigate = useNavigate();
  const { draft, setThemeId } = useRoomStore();
  const { mode } = draft;

  const [enabledThemeIds, setEnabledThemeIds] = useState<ReadonlySet<number>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!mode) {
      alert('모드 선택이 필요합니다.');
      navigate('/selection/mode');
    }
  }, [mode, navigate]);

  useEffect(() => {
    const controller = new AbortController();

    const applyMockAvailability = () => {
      const ids = MOCK_THEMES.filter((t) => t.isAvailable).map((t) => t.themeId);
      setEnabledThemeIds(new Set(ids));
    };

    const fetchThemes = async () => {
      setLoading(true);
      setError(null);

      try {
        const { data } = await api.get('/themes', { signal: controller.signal });
        const themes: Array<{ themeId: number }> = data.result ?? data;
        setEnabledThemeIds(new Set(themes.map((t) => t.themeId)));
      } catch (e) {
        if (axios.isCancel(e)) return;

        console.error(e);
        setError('테마 정보를 불러오지 못했습니다.');
        applyMockAvailability();
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    fetchThemes();
    return () => controller.abort();
  }, []);

  const viewThemes = useMemo(
    () =>
      MOCK_THEMES.map((theme) => ({
        ...theme,
        isAvailable: enabledThemeIds.has(theme.themeId),
      })),
    [enabledThemeIds],
  );

  const handleThemeSelect = (themeId: number) => {
    setThemeId(themeId);
  };

  const handleStartGame = (theme: Theme) => {
    setThemeId(theme.themeId);
    navigate(mode === 'SINGLE' ? '/single-room-settings' : '/multi-room-settings');
  };

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-[900px] gap-6 p-4 mx-auto">
      <div className="blinking-text text-2xl font-normal leading-relaxed tracking-tight text-white mb-2 h-8">
        {loading
          ? '테마 정보를 불러오는 중...'
          : error
            ? '테마 정보를 불러오지 못했습니다.'
            : '플레이할 테마를 선택해주세요.'}
      </div>

      <ThemeCardList
        themes={viewThemes}
        onThemeSelect={handleThemeSelect}
        onStartGame={handleStartGame}
      />
    </div>
  );
};

export default ThemeSelectionPage;
