import React from 'react';

interface QuestDescriptionBoxProps {
  questId: number;
  themeName: string;
  questDescription: string;
  onStart: () => void;
}

const QuestDescriptionBox: React.FC<QuestDescriptionBoxProps> = ({
  questId,
  questDescription,
  onStart,
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
        <button
          onClick={onStart}
          className="w-[91px] h-[22px] shrink-0 text-[#FEFEFE] [-webkit-text-stroke-width:0.2px] [-webkit-text-stroke-color:#000] text-lg font-normal leading-4 tracking-[-0.7px] cursor-pointer hover:text-white/80 transition-colors bg-transparent border-none"
        >
          START!
        </button>
      </div>
    </div>
  );
};

export default QuestDescriptionBox;
