import { gsap } from 'gsap';
import React, { useEffect, useRef } from 'react';

import Envelope from '../../components/invitation-code/InvitationEnvelope';
import Letter from '../../components/invitation-code/InvitationLetter';

const InvitationPage: React.FC = () => {
  const flapRef = useRef<HTMLDivElement>(null);
  const letterRef = useRef<HTMLDivElement>(null);
  const shadowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tl = gsap.timeline({ delay: 0.8 });

    tl.to(flapRef.current, {
      duration: 0.6,
      rotateX: 180,
      ease: 'power2.inOut',
    })
      .set(flapRef.current, { zIndex: 10 })
      .to(letterRef.current, {
        translateY: -370,
        duration: 0.9,
        ease: 'back.inOut(1.5)',
      })
      .set(letterRef.current, { zIndex: 40 })
      .to(letterRef.current, {
        duration: 0.8,
        ease: 'back.out(.4)',
        translateY: -10,
        translateZ: 180,
      });

    gsap.to(shadowRef.current, {
      delay: 1.6,
      width: 840,
      boxShadow: '-140px 280px 19px 9px #CCCBD5',
      ease: 'back.out(.2)',
      duration: 0.8,
    });
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center overflow-hidden">
      <div className="relative mt-32" style={{ perspective: '1500px' }}>
        {/* Shadow */}
        <div
          ref={shadowRef}
          className="absolute w-[370px] h-[1px] bg-transparent rounded-[30%] shadow-[93px 187px 19px 9px #CCCBD5]"
        />

        <Envelope>
          {/* Flap: 봉투의 덮개 부분 */}
          <div
            ref={flapRef}
            className="absolute top-0 left-0 w-full z-[30] origin-top"
            style={{
              borderTop: '215px solid #2b2949',
              borderLeft: '280px solid transparent',
              borderRight: '280px solid transparent',
            }}
          />

          {/* Letter: 내부 편지지 */}
          <Letter ref={letterRef} />
        </Envelope>
      </div>
    </div>
  );
};

export default InvitationPage;
