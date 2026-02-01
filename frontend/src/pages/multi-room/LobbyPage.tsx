import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { pixelClipPath, titleClipPath } from '../../constants/clipPaths';

const LobbyPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const invitationCode =
    (location.state as { invitationCode?: string })?.invitationCode || '';

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(invitationCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy code:', error);
      alert('코드 복사에 실패했습니다.');
    }
  };

  const handleGoBack = () => {
    navigate('/selection/theme');
  };

  const handleWaitForOpponent = () => {
    // TODO: 대기화면 구현하기
    alert('대기 화면은 아직 구현되지 않았습니다.');
  };

  if (!invitationCode) {
    return (
      <div className="min-h-screen w-full flex flex-col justify-center items-center bg-[#030030]">
        <div className="text-white text-xl mb-4">초대 코드가 없습니다.</div>
        <button
          onClick={handleGoBack}
          className="text-white/80 text-md font-bold cursor-pointer hover:text-white transition-colors"
        >
          돌아가기
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex flex-col justify-center items-center bg-[#030030] gap-[50px]">
      <div className="relative flex flex-col items-center gap-[30px]">
        <div
          className="w-[250px] h-[50px] bg-white flex items-center justify-center z-10"
          style={{ clipPath: titleClipPath }}
        >
          <span className="text-black text-center text-[20px] font-bold tracking-tight">
            초대 코드 생성 완료
          </span>
        </div>

        <div
          className="w-[700px] h-[350px] bg-[#353359] flex flex-col items-center justify-center relative gap-[30px] p-8"
          style={{ clipPath: pixelClipPath }}
        >
          <div className="absolute left-[1px] top-[4px] bottom-[4px] w-[3px] bg-white opacity-90" />
          <div className="absolute right-[1px] top-[4px] bottom-[4px] w-[3px] bg-white opacity-90" />

          <div className="text-white text-lg text-center">
            친구에게 이 코드를 공유하고
            <br />
            함께 게임을 시작하세요!
          </div>

          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-4 bg-[#FEFEFE] px-8 py-4 rounded-[10px] border-[3px] border-[rgba(3,0,48,0.50)]">
              <span className="text-[#030030] text-2xl font-bold tracking-wider">
                {invitationCode}
              </span>
            </div>

            <button
              onClick={handleCopyCode}
              className="px-6 py-2 bg-[#FEFEFE] text-[#030030] rounded-[5px] border-[2.5px] border-[rgba(3,0,48,0.50)] font-bold cursor-pointer hover:bg-[#E0E0E0] transition-colors"
            >
              {copied ? '✓ 복사됨!' : '복사하기'}
            </button>
          </div>

          <div className="flex gap-4 mt-4">
            <button
              onClick={handleWaitForOpponent}
              className="px-6 py-2 bg-[#FEFEFE] text-[#030030] rounded-[5px] border-[2.5px] border-[rgba(3,0,48,0.50)] font-bold cursor-pointer hover:bg-[#E0E0E0] transition-colors"
            >
              상대방 대기
            </button>
            <button
              onClick={handleGoBack}
              className="px-6 py-2 bg-transparent text-white rounded-[5px] border-[2.5px] border-white font-bold cursor-pointer hover:bg-white hover:text-[#030030] transition-colors"
            >
              돌아가기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LobbyPage;
