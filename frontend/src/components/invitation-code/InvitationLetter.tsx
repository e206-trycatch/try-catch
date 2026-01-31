import { forwardRef } from 'react';

import CursorIcon from '../../assets/images/icons/cursor-icon.png';
import EnvelopeIcon from '../../assets/images/icons/envelope-icon.png';

const Letter = forwardRef<HTMLDivElement>((_, ref) => {
  return (
    <div
      ref={ref}
      className="absolute top-[19px] left-[19px] w-[523px] h-[299px] flex items-center justify-center z-[15] bg-[#CCCBD5] shadow-[0px_2px_13px_-3px_#030030]"
    >
      <div className="relative w-[448px] h-[224px] flex items-center justify-center text-[#353359]">
        <div className="flex w-[664.229px] flex-col items-center gap-10">
          <div className="flex w-[513px] justify-center items-center gap-3.5">
            <img
              src={EnvelopeIcon}
              alt="Envelope Icon"
              style={{ width: '23px' }}
            />
            <div className="text-[#030030] text-[17px] font-normal leading-[21px] tracking-[-0.7px]">
              친구로부터 받은 초대 코드를 입력해주세요.
            </div>
          </div>
          <div className="flex w-[548px] items-center gap-1.5 justify-center">
            <input
              type="text"
              className="flex w-[350px] h-[30px] items-center gap-2.5 shrink-0 px-[27px] py-[19px] rounded-[10px] bg-[#FEFEFE] relative z-10"
            />
            <button
              type="submit"
              className="flex w-10 h-10 justify-center items-center gap-2.5 shrink-0 [background:#FEFEFE] p-2.5 rounded-[10px] relative z-10 cursor-pointer"
            >
              <img src={CursorIcon} alt="Cursor Icon" className="w-[23px]" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

export default Letter;
