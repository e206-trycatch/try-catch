import { forwardRef, useState } from 'react';

import CursorIcon from '../../assets/images/icons/cursor-icon.png';
import EnvelopeIcon from '../../assets/images/icons/envelope-icon.png';

interface LetterProps {
  onSubmit: (code: string) => void;
  isLoading: boolean;
  error: string | null;
}

const Letter = forwardRef<HTMLDivElement, LetterProps>(
  ({ onSubmit, isLoading, error }, ref) => {
    const [code, setCode] = useState('');
    const [validationError, setValidationError] = useState<string | null>(null);

    const validateCode = (trimmed: string): string | null => {
      if (!trimmed) return '초대 코드를 입력해주세요.';
      if (trimmed.length !== 8) return '초대 코드는 8자리여야 합니다.';
      if (!/^[a-zA-Z0-9]+$/.test(trimmed))
        return '초대 코드는 영문자와 숫자만 사용할 수 있습니다.';
      return null;
    };

    const handleSubmit = () => {
      const trimmed = code.trim();
      const vError = validateCode(trimmed);
      if (vError) {
        setValidationError(vError);
        return;
      }
      if (isLoading) return;
      setValidationError(null);
      onSubmit(trimmed);
    };

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
            <div className="flex w-[548px] flex-col items-center gap-2">
              <div className="flex items-center gap-1.5 justify-center">
                <input
                  type="text"
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value);
                    setValidationError(null);
                  }}
                  placeholder="초대 코드 입력"
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                  disabled={isLoading}
                  className="flex w-[350px] h-[30px] items-center gap-2.5 shrink-0 px-[27px] py-[19px] rounded-[10px] bg-[#FEFEFE] relative z-10"
                />
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isLoading || !code.trim()}
                  className="flex w-10 h-10 justify-center items-center gap-2.5 shrink-0 [background:#FEFEFE] p-2.5 rounded-[10px] relative z-10 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <img
                    src={CursorIcon}
                    alt="Cursor Icon"
                    className="w-[23px]"
                  />
                </button>
              </div>
              {(validationError || error) && (
                <span className="text-red-500 text-[13px]">
                  {validationError || error}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  },
);

export default Letter;
