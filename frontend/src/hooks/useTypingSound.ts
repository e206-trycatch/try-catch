import { useCallback, useRef } from 'react';

import typingSound from '../assets/sounds/typing_sound.mp3';
import { useSoundStore } from '../stores/useSoundStore';

/**
 * 타이핑 효과음 제어 훅
 * - 타이핑 시작 시 루프 재생
 * - 타이핑 완료/스킵 시 정지
 * - 전역 음소거/볼륨 설정 존중
 */
export const useTypingSound = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { isMuted, volume } = useSoundStore();

  // 사운드 재생 (루프)
  const playSound = useCallback(() => {
    if (isMuted) return;

    if (!audioRef.current) {
      audioRef.current = new Audio(typingSound);
      audioRef.current.loop = true;
    }

    audioRef.current.volume = volume;
    audioRef.current.currentTime = 0;
    audioRef.current.play().catch(() => {
      // 자동재생 정책으로 실패할 수 있음 (무시)
    });
  }, [isMuted, volume]);

  // 사운드 정지
  const stopSound = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, []);

  return { playSound, stopSound };
};
