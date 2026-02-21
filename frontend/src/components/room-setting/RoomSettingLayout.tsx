import type { ReactNode } from 'react';

import { pixelClipPath, titleClipPath } from '../../constants/clipPaths';

interface RoomSettingLayoutProps {
  title: string;
  buttonLabel: string;
  onStart: () => void;
  children: ReactNode;
}

const RoomSettingLayout = ({
  title,
  buttonLabel,
  onStart,
  children,
}: RoomSettingLayoutProps) => {
  return (
    <div className="min-h-screen w-full flex flex-col justify-center items-center bg-[#030030]">
      <div className="relative flex flex-col items-center">
        <div
          className="w-[190px] h-[50px] bg-white flex items-center justify-center z-10 absolute -top-[25px]"
          style={{ clipPath: titleClipPath }}
        >
          <span className="text-black text-center text-[20px] font-bold tracking-tight">
            {title}
          </span>
        </div>

        <div
          className="w-[830px] h-[450px] bg-[#353359] flex items-center justify-center relative pt-10"
          style={{ clipPath: pixelClipPath }}
        >
          <div className="absolute left-[1px] top-[4px] bottom-[4px] w-[3px] bg-white opacity-90" />
          <div className="absolute right-[1px] top-[4px] bottom-[4px] w-[3px] bg-white opacity-90" />

          {children}
        </div>

        <div className="w-full flex justify-end mt-2">
          <button
            type="button"
            onClick={onStart}
            className="text-white/80 text-md font-bold cursor-pointer hover:text-white transition-colors bg-transparent border-none"
          >
            {'>>'} {buttonLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoomSettingLayout;
