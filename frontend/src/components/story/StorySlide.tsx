import { useEffect, useState, useCallback, useRef } from 'react';

interface StorySlideProps {
  imageUrl: string;
  content: string;
  isActive: boolean;
  onTypingComplete?: () => void;
}

const TYPING_SPEED = 60; // ms per character
const TYPING_DELAY = 200; // ms before typing starts

const StorySlide = ({
  imageUrl,
  content,
  isActive,
  onTypingComplete,
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
      typingTimerRef.current = setInterval(() => {
        if (index < content.length) {
          setDisplayedText(content.slice(0, index + 1));
          index++;
        } else {
          clearTimers();
          setIsTypingDone(true);
          onTypingComplete?.();
        }
      }, TYPING_SPEED);
    }, TYPING_DELAY);

    return () => {
      clearTimers();
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
        setDisplayedText(content);
        setIsTypingDone(true);
        onTypingComplete?.();
      }
      // 타이핑 완료 상태면 이벤트가 상위로 전파되어 handleNext 실행
    },
    [content, isTypingDone, onTypingComplete, clearTimers]
  );

  return (
    <div
      className={`absolute inset-0 flex flex-col transition-all duration-500 ease-out ${
        isActive
          ? 'opacity-100 translate-x-0'
          : 'opacity-0 translate-x-5 pointer-events-none'
      }`}
      onClick={skipTyping}
    >
      {/* 이미지 영역 (65%) */}
      <div className="flex-[65] relative overflow-hidden bg-black">
        <img
          src={imageUrl}
          alt="Story scene"
          className="w-full h-full object-cover"
        />
      </div>

      {/* 텍스트 영역 (35%) */}
      <div className="flex-[35] bg-black/90 flex items-center justify-center px-8 py-6">
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
