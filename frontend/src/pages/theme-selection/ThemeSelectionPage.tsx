// pages/ThemeSelectionPage.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// 실제 프로젝트 경로에 맞춰 import 경로를 확인해주세요.
import { MOCK_THEMES, type Theme } from '../../mocks/mockData';
import { useRoomStore } from '../../stores/useRoomStore';

const ThemeSelectionPage = () => {
  const navigate = useNavigate();

  // 1. Store에서 모드 상태와 세터 가져오기
  const { selectedMode, setThemeId } = useRoomStore();

  // 2. 테마 데이터는 import한 MOCK_THEMES 사용
  // 현재 활성화된(확대된) 카드 ID 관리 (초기값: 첫 번째 테마)
  const [activeId, setActiveId] = useState<number>(
    MOCK_THEMES[0]?.themeId || 1,
  );

  // 3. 페이지 진입 시 예외 처리 (모드 미선택 시 되돌리기)
  useEffect(() => {
    if (!selectedMode) {
      alert('모드 선택이 필요합니다.');
      navigate('/mode-select');
    }
  }, [selectedMode, navigate]);

  // 4. 테마 선택(START 버튼 클릭) 핸들러
  const handleThemeSelect = (e: React.MouseEvent, themeId: number) => {
    e.stopPropagation(); // 부모 div의 onClick(카드 확대) 이벤트 전파 방지

    // 스토어에 테마 ID 저장
    setThemeId(themeId);

    // 모드에 따라 다음 경로 분기
    if (selectedMode === 'SINGLE') {
      navigate('/single-room-settings'); // 싱글: 방 설정 페이지
    } else {
      navigate('/multi-room-settings'); // 멀티: 방 설정 페이지
    }
  };

  // 모서리 픽셀 스타일 (UI 요소)
  const pixelClipPath =
    'polygon(0 4px, 4px 4px, 4px 0, calc(100% - 4px) 0, calc(100% - 4px) 4px, 100% 4px, 100% calc(100% - 4px), calc(100% - 4px) calc(100% - 4px), calc(100% - 4px) 100%, 4px 100%, 4px calc(100% - 4px), 0 calc(100% - 4px))';

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-[900px] gap-6 p-4 mx-auto">
      <div className="blinking-text text-2xl font-normal leading-relaxed tracking-tight text-white mb-2">
        플레이할 테마를 선택해주세요.
      </div>

      {/* 카드 컨테이너 */}
      <div className="flex flex-row items-stretch justify-center w-full h-[400px] gap-2">
        {MOCK_THEMES.map((theme: Theme) => {
          // 데이터의 themeId와 현재 activeId 비교
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
                {/* 내부 콘텐츠 배경 (투명도 유지) */}
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

              {/* 하단 정보 영역 (Level, Name, Genre, Button) */}
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
                  {/* 왼쪽 레벨 표시 (원형) */}
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

                  {/* START 버튼 (로직 연결됨) */}
                  <button
                    onClick={(e) => handleThemeSelect(e, theme.themeId)}
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
