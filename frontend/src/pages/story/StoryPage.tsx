import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  fetchMultiQuestStories,
  fetchQuestStories,
  type QuestStory,
} from '../../api/roomApi';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import PageFlipTransition from '../../components/story/PageFlipTransition';
import StorySlide from '../../components/story/StorySlide';
import { useTypingSound } from '../../hooks/useTypingSound';
import { useRoomStore } from '../../stores/useRoomStore';

const StoryPage = () => {
  const navigate = useNavigate();
  const currentQuestId = useRoomStore((s) => s.currentQuestId);
  const currentRoomId = useRoomStore((s) => s.currentRoomId);
  const gameMode = useRoomStore((s) => s.draft.mode);

  const [stories, setStories] = useState<QuestStory[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isFlipping, setIsFlipping] = useState(false);
  const [isTypingDone, setIsTypingDone] = useState(false);

  // 타이핑 스킵을 위한 ref
  const slideRef = useRef<HTMLDivElement>(null);

  // 타이핑 사운드 (단일 Audio 인스턴스로 관리)
  const { playSound, stopSound } = useTypingSound();

  // 스토리 로드
  useEffect(() => {
    if (!currentQuestId || !currentRoomId) {
      alert('잘못된 접근입니다.');
      navigate('/selection/theme');
      return;
    }

    const loadStories = async () => {
      try {
        // 게임 모드에 따라 다른 API 호출
        const response =
          gameMode === 'MULTI'
            ? await fetchMultiQuestStories(currentRoomId, currentQuestId)
            : await fetchQuestStories(currentQuestId);

        if (!response.result || response.result.length === 0) {
          // 스토리가 없으면 바로 퀘스트 설명으로
          navigate('/quest-description');
          return;
        }

        // storyOrder 기준 정렬
        const sorted = [...response.result].sort(
          (a, b) => a.storyOrder - b.storyOrder,
        );
        setStories(sorted);
      } catch (error) {
        console.error('스토리 로드 실패:', error);
        // 실패해도 퀘스트 설명으로 이동
        navigate('/quest-description');
      } finally {
        setIsLoading(false);
      }
    };

    loadStories();
  }, [currentQuestId, currentRoomId, gameMode, navigate]);

  // 슬라이드 변경 시 타이핑 상태 리셋
  useEffect(() => {
    setIsTypingDone(false);
  }, [currentIndex]);

  // 타이핑 완료 콜백
  const handleTypingComplete = useCallback(() => {
    setIsTypingDone(true);
  }, []);

  // 다음 스토리로 이동 (타이핑 완료 시에만)
  const handleNext = useCallback(() => {
    if (isFlipping) return;

    // 타이핑 중이면 무시 (StorySlide 내부에서 스킵 처리)
    if (!isTypingDone) return;

    if (currentIndex < stories.length - 1) {
      // 일반 스토리 전환
      setCurrentIndex((prev) => prev + 1);
    } else {
      // 마지막 스토리 → 페이드 아웃 → 퀘스트 설명
      setIsFlipping(true);
    }
  }, [currentIndex, stories.length, isFlipping, isTypingDone]);

  // 이전 스토리로 이동
  const handlePrev = useCallback(() => {
    if (isFlipping) return;
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  }, [currentIndex, isFlipping]);

  // 페이드 완료 후 이동
  const handleFlipComplete = useCallback(() => {
    navigate('/quest-description');
  }, [navigate]);

  // 키보드 이벤트
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter' || e.key === 'ArrowRight') {
        e.preventDefault();
        if (isTypingDone) {
          handleNext();
        }
        // 타이핑 중이면 StorySlide의 onClick이 스킵 처리
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev, isTypingDone]);

  if (isLoading) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-black">
        <LoadingSpinner />
      </div>
    );
  }

  if (stories.length === 0) {
    return null;
  }

  return (
    <PageFlipTransition
      isFlipping={isFlipping}
      onFlipComplete={handleFlipComplete}
    >
      <div
        ref={slideRef}
        className="w-screen h-screen bg-black relative cursor-pointer select-none"
        onClick={handleNext}
      >
        {/* 스토리 슬라이드들 */}
        {stories.map((story, index) => (
          <StorySlide
            key={story.storyId}
            imageUrl={story.imageUrl}
            content={story.content}
            isActive={index === currentIndex}
            onTypingComplete={handleTypingComplete}
            playSound={playSound}
            stopSound={stopSound}
          />
        ))}
      </div>
    </PageFlipTransition>
  );
};

export default StoryPage;
