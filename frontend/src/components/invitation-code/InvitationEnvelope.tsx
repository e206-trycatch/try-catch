import React, { forwardRef } from 'react';

const Envelope = forwardRef<HTMLDivElement, { children: React.ReactNode }>(
  ({ children }) => {
    return (
      <div
        className="relative w-[560px] h-[336px] bg-[#555184] rounded-sm"
        style={{ background: 'linear-gradient(#2b2949 0.5px, #2b2949 0.5px)' }}
      >
        {children}
        {/* 봉투 앞면 (삼각형 레이어) */}
        <div
          className="absolute top-0 w-full h-full z-[25] pointer-events-none rounded-sm overflow-hidden"
          style={{
            background: `
               linear-gradient(30deg, #353359 47%, #2b2949 50%, #353359 50%) 280px 168px/ 280px 168px no-repeat,
               linear-gradient(31deg, #353359 49%, #353359 50%, transparent 50%) 0px 0px/ 284px 168px no-repeat,
               linear-gradient(150deg, #353359 50%, #2b2949 50%, #353359 53%) 0px 168px/ 282px 168px no-repeat,
               linear-gradient(148.7deg, transparent 50%, #353359 50%, #353359 51%) 280px 0px/ 280px 168px no-repeat
             `,
          }}
        />
      </div>
    );
  },
);

export default Envelope;
