import { useEffect, useRef } from 'react';

import { useSoundStore } from '../stores/useSoundStore';

/*
 * 페이지별 오디오 관리 훅
 * 각 페이지에서 이 훅을 사용하여 해당 페이지의 음악을 설정하고 제어할 수 있음.
 */

export const useAudio = (
  trackUrl: string | null,
  options?: { loop?: boolean },
) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { isMuted, volume, setTrack, setIsPlaying } = useSoundStore();

  // 오디오 요소 생성 및 트랙 설정
  useEffect(() => {
    if (!trackUrl) {
      setTrack(null);
      setIsPlaying(false);
      return;
    }

    // 새 오디오 요소 생성
    const audio = new Audio(trackUrl);
    audio.loop = options?.loop ?? true;
    audio.volume = isMuted ? 0 : volume;
    audioRef.current = audio;

    // 현재 트랙 설정
    setTrack(trackUrl);

    // 자동 재생 시도 (브라우저 정책에 따라 실패할 수 있음..)
    const playAudio = async () => {
      try {
        await audio.play();
        setIsPlaying(true);
      } catch (error) {
        // 자동 재생이 차단된 경우 사용자 인터랙션 후 재생
        console.log('자동 재생 실패. 사용자 인터렉션 필요함.', error);
        setIsPlaying(false);
      }
    };

    playAudio();

    // 페이지 이동 시 오디오 정지
    return () => {
      audio.pause();
      audio.src = '';
      audioRef.current = null;
      setIsPlaying(false);
    };
  }, [trackUrl, options?.loop, setTrack, setIsPlaying, isMuted, volume]);

  // 음소거/볼륨 변경 반영
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [isMuted, volume]);

  // 수동 제어 함수 반환
  return {
    play: () => {
      if (audioRef.current) {
        audioRef.current.play();
        setIsPlaying(true);
      }
    },
    pause: () => {
      if (audioRef.current) {
        audioRef.current.pause();
        setIsPlaying(false);
      }
    },
    audioRef,
  };
};
