import { useEffect, useState } from 'react';

interface PageFlipTransitionProps {
  isFlipping: boolean;
  onFlipComplete: () => void;
  children: React.ReactNode;
}

const FADE_DURATION = 700; // ms

const PageFlipTransition = ({
  isFlipping,
  onFlipComplete,
  children,
}: PageFlipTransitionProps) => {
  const [isMounted, setIsMounted] = useState(false);

  // 초기 페이드 인
  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 50);
    return () => clearTimeout(timer);
  }, []);

  // 페이드 아웃 후 전환
  useEffect(() => {
    if (isFlipping) {
      const timer = setTimeout(onFlipComplete, FADE_DURATION);
      return () => clearTimeout(timer);
    }
  }, [isFlipping, onFlipComplete]);

  // opacity는 상태가 아닌 계산된 값
  const opacity = isFlipping ? 0 : isMounted ? 1 : 0;

  return (
    <div className="w-full h-full overflow-hidden bg-black">
      {/* 컨텐츠 */}
      <div
        className="w-full h-full"
        style={{
          opacity,
          transition: `opacity ${FADE_DURATION}ms ease-in-out`,
        }}
      >
        {children}
      </div>

      {/* 암전 오버레이 */}
      <div
        className="fixed inset-0 bg-black pointer-events-none z-50"
        style={{
          opacity: isFlipping ? 1 : 0,
          transition: `opacity ${FADE_DURATION}ms ease-in-out`,
        }}
      />
    </div>
  );
};

export default PageFlipTransition;
