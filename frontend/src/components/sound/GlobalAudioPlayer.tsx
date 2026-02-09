import { useEffect, useRef } from 'react';

import mainBgm from '../../assets/sounds/1199_Flyns Forest.mp3';
import { useSoundStore } from '../../stores/useSoundStore';

const GlobalAudioPlayer = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { isMuted, setAudioRef, hasUserInteracted, setHasUserInteracted } =
    useSoundStore();

  useEffect(() => {
    const audio = new Audio(mainBgm);
    audio.loop = true;
    audio.volume = 0.5;
    audioRef.current = audio;
    setAudioRef(audio);

    // 사용자 첫 인터렉션 감지
    const handleFirstInteraction = async () => {
      if (!hasUserInteracted) {
        setHasUserInteracted(); // store에서 자동 on 처리
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
  }, [setAudioRef, hasUserInteracted, setHasUserInteracted]);

  // isMuted 상태에 따른 오디오 재생/일시정지 처리
  useEffect(() => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch((error) => {
          console.log('재생 실패: ', error);
        });
      }
    }
  }, [isMuted]);

  return null;
};

export default GlobalAudioPlayer;
