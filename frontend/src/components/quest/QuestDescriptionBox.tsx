import React from 'react';

import type { MultiQuestParticipant } from '../../api/roomApi';

interface QuestDescriptionBoxProps {
  questId: number;
  themeName: string;
  questDescription: string;
  onStart: () => void;
  // Multi-player optional props
  isMulti?: boolean;
  participants?: MultiQuestParticipant[];
  myReady?: boolean;
  onReady?: () => void;
}

const QuestDescriptionBox: React.FC<QuestDescriptionBoxProps> = ({
  questId,
  questDescription,
  onStart,
  isMulti = false,
  participants,
  myReady = false,
  onReady,
}) => {
  return (
    <div className="w-[599px] [filter:drop-shadow(0_0_10px_rgba(254,254,254,0.25))]">
      <div className="flex w-[599px] flex-col justify-center items-center gap-2.5 [background:rgba(0,0,0,0.75)] py-4">
        <div className="shrink-0 text-[#FEFEFE] [-webkit-text-stroke-width:0.2px] [-webkit-text-stroke-color:#000] text-lg font-normal leading-4 tracking-[-0.7px]">
          Quest {questId}
        </div>
        <div className="flex w-[545px] justify-center items-center gap-2.5 [background:#FEFEFE] px-2.5 py-[5px]">
          <div className="text-black [-webkit-text-stroke-width:0.1px] [-webkit-text-stroke-color:#000] text-[15px] font-medium leading-normal tracking-[-0.7px] break-keep text-center">
            {questDescription.split(/(?<=[.!?])\s+/).map((sentence, i) => (
              <React.Fragment key={i}>
                {i > 0 && <br />}
                {sentence}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Multi-player participants section */}
        {isMulti && participants && participants.length > 0 && (
          <div className="flex w-[545px] justify-center items-center gap-6 mt-2">
            {participants.map((p) => (
              <div key={p.userId} className="flex flex-col items-center gap-1">
                <span className="text-[#FEFEFE] text-[14px] font-medium tracking-[-0.5px]">
                  {p.role === 'HOST' ? '>> ' : ''}
                  {p.nickname}
                </span>
                <span className="text-[#FEFEFE]/70 text-[12px] tracking-[-0.5px]">
                  {p.frameworkName}
                </span>
                <span
                  className={`text-[12px] font-bold px-3 py-0.5 ${
                    p.isReady
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-500 text-gray-300'
                  }`}
                >
                  {p.isReady ? 'READY' : 'NOT READY'}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Action button: SINGLE = START!, MULTI = READY */}
        {isMulti && onReady ? (
          <button
            onClick={onReady}
            className={`w-[91px] h-[22px] shrink-0 [-webkit-text-stroke-width:0.2px] [-webkit-text-stroke-color:#000] text-lg font-normal leading-4 tracking-[-0.7px] cursor-pointer transition-colors bg-transparent border-none ${
              myReady
                ? 'text-green-400 hover:text-green-300'
                : 'text-[#FEFEFE] hover:text-white/80'
            }`}
          >
            {myReady ? 'READY!' : 'READY'}
          </button>
        ) : (
          <button
            onClick={onStart}
            className="w-[91px] h-[22px] shrink-0 text-[#FEFEFE] [-webkit-text-stroke-width:0.2px] [-webkit-text-stroke-color:#000] text-lg font-normal leading-4 tracking-[-0.7px] cursor-pointer hover:text-white/80 transition-colors bg-transparent border-none"
          >
            START!
          </button>
        )}
      </div>
    </div>
  );
};

export default QuestDescriptionBox;
