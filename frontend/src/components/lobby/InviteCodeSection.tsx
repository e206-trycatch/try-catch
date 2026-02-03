import { useState } from 'react';

import { titleClipPath } from '../../constants/clipPaths';

interface InviteCodeSectionProps {
  invitationCode: string;
}

const InviteCodeSection = ({ invitationCode }: InviteCodeSectionProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(invitationCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy code:', error);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Label badge */}
      <div
        className="px-5 py-2 bg-[#1a1a3e] flex items-center justify-center"
        style={{ clipPath: titleClipPath }}
      >
        <span className="text-white text-[16px] font-bold tracking-tight">
          초대 링크 복사
        </span>
      </div>

      {/* Code input + copy button */}
      <div className="flex items-center gap-3">
        <input
          type="text"
          readOnly
          value={invitationCode}
          className="w-[240px] h-[44px] px-4 bg-white text-[#030030] text-[16px] font-bold text-center rounded-[6px] border-[2px] border-[rgba(3,0,48,0.30)] outline-none"
        />
        <button
          type="button"
          onClick={handleCopy}
          className="h-[44px] px-5 bg-white text-[#030030] text-[14px] font-bold rounded-[6px] border-[2px] border-[rgba(3,0,48,0.30)] cursor-pointer hover:bg-[#E0E0E0] transition-colors"
        >
          {copied ? '복사됨!' : '복사하기'}
        </button>
      </div>
    </div>
  );
};

export default InviteCodeSection;
