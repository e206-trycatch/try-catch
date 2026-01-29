// ThemeCardList.tsx
// activeId 상태, 카드 확장 레이아웃
import { useState } from 'react';

import { type Theme } from '../../mocks/mockData';
import { ThemeCard } from './ThemeCard';

interface ThemeCardListProps {
  themes: Theme[];
  onThemeSelect: (themeId: number) => void;
  onStartGame: (theme: Theme) => void;
}

export const ThemeCardList = ({
  themes,
  onThemeSelect,
  onStartGame,
}: ThemeCardListProps) => {
  const [activeId, setActiveId] = useState<number | null>(null);

  const pixelClipPath =
    'polygon(0 4px, 4px 4px, 4px 0, calc(100% - 4px) 0, calc(100% - 4px) 4px, 100% 4px, 100% calc(100% - 4px), calc(100% - 4px) calc(100% - 4px), calc(100% - 4px) 100%, 4px 100%, 4px calc(100% - 4px), 0 calc(100% - 4px))';

  const handleCardClick = (theme: Theme) => {
    if (!theme.isAvailable) {
      alert('준비중인 테마입니다. 곧 만나요! 🚀');
      return;
    }

    setActiveId(theme.themeId);
    onThemeSelect(theme.themeId);
  };

  const handleStartClick = (e: React.MouseEvent, theme: Theme) => {
    e.stopPropagation();
    if (!theme.isAvailable) {
      alert('준비중인 테마입니다. 곧 만나요! 🚀');
      return;
    }
    onStartGame(theme);
  };

  return (
    <div className="flex flex-row items-stretch justify-center w-full h-[400px] gap-2">
      {themes.map((theme) => (
        <ThemeCard
          key={theme.themeId}
          theme={theme}
          isActive={activeId === theme.themeId}
          pixelClipPath={pixelClipPath}
          onCardClick={handleCardClick}
          onStartClick={handleStartClick}
        />
      ))}
    </div>
  );
};
