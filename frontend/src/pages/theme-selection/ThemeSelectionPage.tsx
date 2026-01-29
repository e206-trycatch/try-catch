import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { ThemeCardList } from '../../components/theme-selection/ThemeCardList';
import { MOCK_THEMES, type Theme } from '../../mocks/mockData';
import { useRoomStore } from '../../stores/useRoomStore';

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '';

const ThemeSelectionPage = () => {
  const navigate = useNavigate();

  // 모드 상태 및 테마 설정
  const { draft, setThemeId } = useRoomStore();
  const { mode } = draft;

  // 데이터 및 로딩 상태
  const [enabledThemeIds, setEnabledThemeIds] = useState<ReadonlySet<number>>(
    new Set(),
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // 초기 진입 시 모드 선택 여부 확인
  useEffect(() => {
    if (!mode) {
      alert('모드 선택이 필요합니다.');
      navigate('/selection/mode');
    }
  }, [mode, navigate]);

  // 테마 활성화 정보 Fetching (AbortController 적용)
  useEffect(() => {
    const controller = new AbortController();

    const fetchThemes = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`${API_BASE}/themes`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          signal: controller.signal,
        });

        if (!res.ok)
          throw new Error(
            `테마 정보를 불러오는 데 실패하였습니다. ${res.status}`,
          );

        const data: Array<{ themeId: number }> = await res.json();
        setEnabledThemeIds(new Set(data.map((t) => t.themeId)));
      } catch (e) {
        if (e instanceof DOMException && e.name === 'AbortError') return;

        console.error(e);
        setError('테마 정보를 불러오지 못했습니다.');
        // 에러 시 빈 Set으로 초기화 (모두 준비중 처리)
        setEnabledThemeIds(new Set());
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchThemes();

    return () => {
      controller.abort();
    };
  }, []);

  // MOCK 데이터와 활성화 정보 병합
  const viewThemes = useMemo(
    () =>
      MOCK_THEMES.map((theme) => ({
        ...theme,
        isAvailable: enabledThemeIds.has(theme.themeId),
      })),
    [enabledThemeIds],
  );

  // 테마 선택 핸들러
  const handleThemeSelect = (themeId: number) => {
    setThemeId(themeId);
  };

  // 게임 시작 핸들러
  const handleStartGame = (theme: Theme) => {
    setThemeId(theme.themeId);
    navigate(
      mode === 'SINGLE' ? '/single-room-settings' : '/multi-room-settings',
    );
  };

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-[900px] gap-6 p-4 mx-auto">
      {/* 상단 안내 텍스트 (상태에 따라 변경) */}
      <div className="blinking-text text-2xl font-normal leading-relaxed tracking-tight text-white mb-2 h-8">
        {loading
          ? '테마 정보를 불러오는 중...'
          : error
            ? '테마 정보를 불러오지 못했습니다.'
            : '플레이할 테마를 선택해주세요.'}
      </div>

      {/* 카드 리스트 컴포넌트 */}
      <ThemeCardList
        themes={viewThemes}
        onThemeSelect={handleThemeSelect}
        onStartGame={handleStartGame}
      />
    </div>
  );
};

export default ThemeSelectionPage;
