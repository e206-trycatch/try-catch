import { useState } from 'react';

import { MOCK_THEMES, type Theme } from '../../mocks/mockData';

const ThemeSelectionPage = () => {
  const [activeId, setActiveId] = useState<number>(MOCK_THEMES[0].themeId);

  // 모서리 픽셀 느낌
  const pixelClipPath =
    'polygon(0 4px, 4px 4px, 4px 0, calc(100% - 4px) 0, calc(100% - 4px) 4px, 100% 4px, 100% calc(100% - 4px), calc(100% - 4px) calc(100% - 4px), calc(100% - 4px) 100%, 4px 100%, 4px calc(100% - 4px), 0 calc(100% - 4px))';

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-[900px] gap-6 p-4 mx-auto">
      <div className="blinking-text text-2xl font-normal leading-relaxed tracking-tight text-white mb-2">
        모드를 선택해주세요.
      </div>

      {/* 카드 컨테이너 */}
      <div className="flex flex-row items-stretch justify-center w-full h-[400px] gap-2">
        {MOCK_THEMES.map((theme: Theme) => {
          const isActive = activeId === theme.themeId;

          return (
            <div
              key={theme.themeId}
              onClick={() => setActiveId(theme.themeId)}
              className={`
                relative overflow-hidden cursor-pointer transition-all duration-500
                ${isActive ? 'flex-[10]' : 'flex-1'} 
              `}
              style={{
                transitionTimingFunction:
                  'cubic-bezier(0.05, 0.61, 0.41, 0.95)',
                backgroundImage: `url(${theme.themeImageUrl})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                clipPath: pixelClipPath,
              }}
            >
              {/* 비활성화 카드에 #030030 필터 적용함 */}
              {!isActive && (
                <div className="absolute inset-0 z-10 bg-[#030030]/60 hover:bg-[#030030]/40 transition-colors duration-500" />
              )}

              {/* 활성화된 카드 하얀 테두리 */}
              {/* 새 주석: inset-2를 적용하여 전체 카드 크기보다 안쪽으로 배치함 */}
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
                {/* 테마 내부 콘텐츠가 배경 이미지와 섞이지 않도록 */}
                {/* 새 주석: 테두리 안쪽 영역도 클립패스를 유지하여 배경이 비치도록 투명도 조절 */}
                <div
                  className="w-full h-full"
                  style={{
                    clipPath: pixelClipPath,
                    background: `linear-gradient(rgba(0,0,0,0), rgba(0,0,0,0)), url(${theme.themeImageUrl}) center/cover`,
                  }}
                />
              </div>

              {/* 테마 상세 내용 텍스트 잘보이게 opacity 조절 */}
              {/* 새 주석: 테두리 위치에 맞춰 inset-2를 적용하여 하단 그라데이션 범위를 제한함 */}
              <div
                className={`
                absolute inset-0 z-30 transition-opacity duration-500
                ${isActive ? 'opacity-100 inset-2 bg-gradient-to-t from-black/80 via-transparent' : 'opacity-0 inset-0'}
                `}
                style={{ clipPath: pixelClipPath }}
              />

              {/* 카드 내부 콘텐츠*/}
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

              {/* Level, Name, Genre */}
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
                  {/* 왼쪽 레벨 표시(동그라미) */}
                  <div
                    className={`
                    flex items-center justify-center bg-white text-black font-bold rounded-full transition-all duration-500
                    ${isActive ? 'w-12 h-12 text-sm' : 'w-0 h-0 opacity-0'}
                  `}
                  >
                    Lv.{theme.level}
                  </div>

                  {/* 테마제목 & 장르 */}
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
                    onClick={(e) => {
                      e.stopPropagation();
                      alert(`${theme.name} 시작!`);
                    }}
                    className={`
                      px-6 py-2 bg-white text-black font-bold text-xs
                      transition-all duration-500 shadow-lg hover:bg-yellow-400
                      ${isActive ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4 pointer-events-none w-0 p-0'}
                    `}
                    style={{ clipPath: pixelClipPath }}
                  >
                    START
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ThemeSelectionPage;
