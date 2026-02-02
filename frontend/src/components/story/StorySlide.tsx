import { useCallback, useEffect, useRef, useState } from 'react';

interface StorySlideProps {
  imageUrl: string;
  content: string;
  isActive: boolean;
  onTypingComplete?: () => void;
  playSound: () => void;
  stopSound: () => void;
}

const TYPING_SPEED = 60; // ms per character
const TYPING_DELAY = 200; // ms before typing starts

const StorySlide = ({
  imageUrl,
  content,
  isActive,
  onTypingComplete,
  playSound,
  stopSound,
}: StorySlideProps) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isTypingDone, setIsTypingDone] = useState(false);

  // 타이머 참조를 저장 (skipTyping에서 클리어하기 위함)
  const delayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const typingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // 타이머 클리어 함수
  const clearTimers = useCallback(() => {
    if (delayTimerRef.current) {
      clearTimeout(delayTimerRef.current);
      delayTimerRef.current = null;
    }
    if (typingTimerRef.current) {
      clearInterval(typingTimerRef.current);
      typingTimerRef.current = null;
    }
  }, []);

  // 타이핑 효과
  useEffect(() => {
    if (!isActive) {
      clearTimers();
      stopSound();
      setDisplayedText('');
      setIsTypingDone(false);
      return;
    }

    // 활성화될 때 타이핑 시작
    let index = 0;
    setDisplayedText('');
    setIsTypingDone(false);

    // 딜레이 후 타이핑 시작
    delayTimerRef.current = setTimeout(() => {
      playSound(); // 타이핑 사운드 시작
      typingTimerRef.current = setInterval(() => {
        if (index < content.length) {
          setDisplayedText(content.slice(0, index + 1));
          index++;
        } else {
          clearTimers();
          stopSound(); // 타이핑 완료 시 사운드 정지
          setIsTypingDone(true);
          onTypingComplete?.();
        }
      }, TYPING_SPEED);
    }, TYPING_DELAY);

    return () => {
      clearTimers();
      stopSound(); // 클린업 시 사운드 정지
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive, content]);

  // 타이핑 스킵 (즉시 전체 텍스트 표시)
  const skipTyping = useCallback(
    (e: React.MouseEvent) => {
      // 타이핑 중일 때만 스킵 처리하고 이벤트 전파 막음
      if (!isTypingDone) {
        e.stopPropagation();
        clearTimers(); // 타이머 클리어!
        stopSound(); // 스킵 시 사운드 정지
        setDisplayedText(content);
        setIsTypingDone(true);
        onTypingComplete?.();
      }
      // 타이핑 완료 상태면 이벤트가 상위로 전파되어 handleNext 실행
    },
    [content, isTypingDone, onTypingComplete, clearTimers, stopSound],
  );

  return (
    <div
      className={`absolute inset-0 transition-all duration-500 ease-out ${
        isActive
          ? 'opacity-100 translate-x-0'
          : 'opacity-0 translate-x-5 pointer-events-none'
      }`}
      onClick={skipTyping}
    >
      {/* 이미지: absolute로 전체 화면(100%) 덮음, 세로 30% 기준 crop */}
      <img
        src={imageUrl}
        alt="Story scene"
        className="absolute inset-0 w-full h-full object-cover object-[center_30%]"
      />

      {/* 텍스트: 이미지 위에 absolute 오버레이, 하단 35%, 반투명(50%) */}
      <div className="absolute bottom-0 left-0 right-0 h-[35%] bg-black/50 flex items-center justify-center px-8 py-6">
        <p className="text-white text-lg leading-relaxed text-center max-w-4xl whitespace-pre-line break-keep">
          {displayedText}
          {!isTypingDone && (
            <span className="inline-block w-0.5 h-5 bg-white ml-1 animate-pulse" />
          )}
        </p>
      </div>
    </div>
  );
};

export default StorySlide;
