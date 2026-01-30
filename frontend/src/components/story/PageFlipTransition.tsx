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
  const [opacity, setOpacity] = useState(0);

  // 초기 페이드 인
  useEffect(() => {
    const timer = setTimeout(() => setOpacity(1), 50);
    return () => clearTimeout(timer);
  }, []);

  // 페이드 아웃 후 전환
  useEffect(() => {
    if (isFlipping) {
      setOpacity(0);
      const timer = setTimeout(onFlipComplete, FADE_DURATION);
      return () => clearTimeout(timer);
    }
  }, [isFlipping, onFlipComplete]);

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
