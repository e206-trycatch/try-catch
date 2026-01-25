import React from 'react';

interface QuestDescriptionBoxProps {
  questId: number;
  themeName: string;
  questDescription: string;
}

const QuestDescriptionBox: React.FC<QuestDescriptionBoxProps> = ({
  questId,
  questDescription,
}) => {
  return (
    <div className="w-[599px] h-[119px] [filter:drop-shadow(0_0_10px_rgba(254,254,254,0.25))]">
      <div className="flex w-[599px] h-[119px] flex-col justify-center items-center gap-2.5 [background:rgba(0,0,0,0.75)]">
        <div className="w-[81px] h-[22px] shrink-0 text-[#FEFEFE] [-webkit-text-stroke-width:0.2px] [-webkit-text-stroke-color:#000] text-lg font-normal leading-4 tracking-[-0.7px]">
          Quest {questId}
        </div>
        <div className="flex w-[545px] h-9 justify-center items-center gap-2.5 shrink-0 [background:#FEFEFE] px-2.5 py-[5px]">
          <div className="text-black [-webkit-text-stroke-width:0.1px] [-webkit-text-stroke-color:#000] text-[15px] font-medium leading-[35px] tracking-[-0.7px]">
            {questDescription}
          </div>
        </div>
        <div className="w-[91px] h-[22px] shrink-0 text-[#FEFEFE] [-webkit-text-stroke-width:0.2px] [-webkit-text-stroke-color:#000] text-lg font-normal leading-4 tracking-[-0.7px]">
          START!
          {/* Todo: 연결 후 button으로 추후 수정해야 함 */}
        </div>
      </div>
    </div>
  );
};

export default QuestDescriptionBox;
