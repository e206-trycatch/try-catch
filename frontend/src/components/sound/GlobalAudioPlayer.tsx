import { useEffect, useRef } from 'react';

import mainBgm from '../../assets/sounds/1199_Flyns Forest.mp3';
import { useSoundStore } from '../../stores/useSoundStore';

const GlobalAudioPlayer = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { isMuted, setAudioRef } = useSoundStore();
  const hasInteracted = useRef(false);

  useEffect(() => {
    const audio = new Audio(mainBgm);
    audio.loop = true;
    audio.volume = 0.5;
    audioRef.current = audio;
    setAudioRef(audio);

    // 즉시 재생 시도
    // - 브라우저 정책으로 인해 안될 수도 있으나, 시도
    if (!isMuted) {
      audio.play().then(() => {
        hasInteracted.current = true;
      });
    }

    // 사용자 첫 인터렉션 감지 (자동재생 실패 대비)
    const handleFirstInteraction = async () => {
      if (!hasInteracted.current && !isMuted) {
        hasInteracted.current = true;
        try {
          await audio.play();
        } catch (error) {
          console.log('자동 재생 실패: ', error);
        }
      }
    };

    const events = ['click', 'touchstart', 'keydown'];
    events.forEach((event) => {
      document.addEventListener(event, handleFirstInteraction, { once: true });
    });

    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, handleFirstInteraction);
      });
      audio.pause();
      audio.src = '';
    };
  }, [setAudioRef, isMuted]);

  useEffect(() => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.pause();
      } else if (hasInteracted.current) {
        audioRef.current.play().catch(console.log);
      }
    }
  }, [isMuted]);

  return null;
};

export default GlobalAudioPlayer;
