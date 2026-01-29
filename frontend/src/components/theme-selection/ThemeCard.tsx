import React from 'react';

import type { Theme } from '../../mocks/mockData';

interface ThemeCardProps {
  theme: Theme;
  isActive: boolean;
  pixelClipPath: string;
  onCardClick: (theme: Theme) => void;
  onStartClick: (e: React.MouseEvent, theme: Theme) => void;
}

export const ThemeCard = ({
  theme,
  isActive,
  pixelClipPath,
  onCardClick,
  onStartClick,
}: ThemeCardProps) => {
  return (
    <div
      onClick={() => onCardClick(theme)}
      className={`
        relative overflow-hidden cursor-pointer transition-all duration-500
        ${isActive ? 'flex-[10]' : 'flex-1'} 
      `}
      style={{
        transitionTimingFunction: 'cubic-bezier(0.05, 0.61, 0.41, 0.95)',
        backgroundImage: `url(${theme.themeImageUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        clipPath: pixelClipPath,
      }}
    >
      {/* 비활성화 카드 어둡게 처리 */}
      {!isActive && (
        <div className="absolute inset-0 z-10 bg-[#030030]/60 hover:bg-[#030030]/40 transition-colors duration-500" />
      )}

      {/* 활성화된 카드 하얀 테두리 */}
      <div
        className={`
          absolute z-20 pointer-events-none transition-all duration-500
          ${isActive ? 'opacity-100 inset-2' : 'opacity-0 inset-0'}
        `}
        style={{
          padding: '2px',
          background: 'white',
          clipPath: pixelClipPath,
        }}
      >
        {/* 내부 콘텐츠 배경 */}
        <div
          className="w-full h-full"
          style={{
            clipPath: pixelClipPath,
            background: `linear-gradient(rgba(0,0,0,0), rgba(0,0,0,0)), url(${theme.themeImageUrl}) center/cover`,
          }}
        />
      </div>

      {/* 텍스트 가독성을 위한 그라데이션 오버레이 */}
      <div
        className={`
          absolute inset-0 z-30 transition-opacity duration-500
          ${isActive ? 'opacity-100 inset-2 bg-gradient-to-t from-black/80 via-transparent' : 'opacity-0 inset-0'}
        `}
        style={{ clipPath: pixelClipPath }}
      />

      {/* 테마 설명 텍스트 (상단) */}
      <div
        className={`
          absolute top-12 left-0 right-0 px-8 text-center transition-all duration-700 delay-100 z-40
          ${isActive ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'}
        `}
      >
        <p className="text-white text-sm leading-relaxed whitespace-pre-wrap drop-shadow-md">
          {theme.description}
        </p>
      </div>

      {/* 하단 정보 영역 */}
      <div
        className={`
          absolute z-40 transition-all duration-500 w-full px-6
          ${isActive ? 'bottom-8 left-0' : 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'}
        `}
      >
        <div
          className={`
            flex items-end w-full
            ${isActive ? 'flex-row justify-between' : 'flex-col items-center'}
          `}
        >
          {/* 왼쪽 레벨 표시 */}
          <div
            className={`
              flex items-center justify-center bg-white text-black font-bold rounded-full transition-all duration-500
              ${isActive ? 'w-12 h-12 text-sm' : 'w-0 h-0 opacity-0'}
            `}
          >
            Lv.{theme.level}
          </div>

          {/* 테마 제목 & 장르 */}
          <div
            className={`
              flex flex-col text-white transition-all duration-500
              ${isActive ? 'flex-1 ml-4 items-start' : 'items-center'}
            `}
          >
            <h3
              className={`
                font-bold leading-none transition-all duration-500
                ${
                  isActive
                    ? 'text-2xl mb-2'
                    : 'text-base opacity-90 [writing-mode:vertical-rl] tracking-[0.2em]'
                }
              `}
            >
              {theme.name}
            </h3>

            <div
              className={`
                flex flex-col text-[10px] opacity-80 leading-tight transition-all
                ${isActive ? 'opacity-100' : 'h-0 opacity-0 overflow-hidden'}
              `}
            >
              <span>테마 타입 | {theme.genre}</span>
              <span>난이도 | Level {theme.level}</span>
            </div>
          </div>

          {/* START 버튼 */}
          <button
            onClick={(e) => onStartClick(e, theme)}
            className={`
              px-6 py-2 font-bold text-xs transition-all duration-500 shadow-lg
              ${
                isActive
                  ? 'opacity-100 translate-x-0'
                  : 'opacity-0 translate-x-4 pointer-events-none w-0 p-0'
              }
              ${
                theme.isAvailable
                  ? 'bg-white text-black hover:bg-yellow-400'
                  : 'bg-gray-500 text-gray-300 cursor-not-allowed'
              }
            `}
            style={{ clipPath: pixelClipPath }}
            disabled={!theme.isAvailable}
          >
            {theme.isAvailable ? 'START' : '준비중'}
          </button>
        </div>
      </div>
    </div>
  );
};
