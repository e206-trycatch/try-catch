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
    'polygon(0 8px, 8px 8px, 8px 0, calc(100% - 8px) 0, calc(100% - 8px) 8px, 100% 8px, 100% calc(100% - 8px), calc(100% - 8px) calc(100% - 8px), calc(100% - 8px) 100%, 8px 100%, 8px calc(100% - 8px), 0 calc(100% - 8px))';

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
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '24px',
        padding: '24px',
      }}
    >
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
