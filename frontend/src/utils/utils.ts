// utils.ts
// 유틸리티 함수, 헬퍼 함수 작성

// 밀리초를 "N분 N초" 형식으로 변환
export const formatTime = (ms: number): string => {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}분 ${seconds}초`;
};
