import TriangleArrowIcon from '../../assets/images/icons/triangle-arrow-pixel.png';

const SingleRoomSettingPage = () => {
  // 10px 픽셀 모서리 클립패드 값
  const pixelClipPath =
    'polygon(0 10px, 10px 10px, 10px 0, calc(100% - 10px) 0, calc(100% - 10px) 10px, 100% 10px, 100% calc(100% - 10px), calc(100% - 10px) calc(100% - 10px), calc(100% - 10px) 100%, 10px 100%, 10px calc(100% - 10px), 0 calc(100% - 10px))';

  // 타이틀용 4px 픽셀 모서리 클립패드 값
  const titleClipPath =
    'polygon(0 4px, 4px 4px, 4px 0, calc(100% - 4px) 0, calc(100% - 4px) 4px, 100% 4px, 100% calc(100% - 4px), calc(100% - 4px) calc(100% - 4px), calc(100% - 4px) 100%, 4px 100%, 4px calc(100% - 4px), 0 calc(100% - 4px))';

  return (
    <div className="min-h-screen w-full flex flex-col justify-center items-center bg-[#030030]">
      {/* 메인 컨테이너 영역 */}
      <div className="relative flex flex-col items-center">
        {/* 싱글모드 설정 타이틀 */}
        <div
          className="w-[190px] h-[50px] bg-white flex items-center justify-center z-10 absolute -top-[25px]"
          style={{ clipPath: titleClipPath }}
        >
          <span className="text-black text-center text-[20px] font-bold tracking-tight">
            싱글모드 설정
          </span>
        </div>

        {/* 중앙 컨텐츠 박스 */}
        <div
          className="w-[830px] h-[450px] bg-[#353359] flex items-center justify-center relative pt-10"
          style={{ clipPath: pixelClipPath }}
        >
          {/* 양쪽 세로 흰색 선 (이미지의 양 끝 흰색 바) */}
          <div className="absolute left-[1px] top-[4px] bottom-[4px] w-[3px] bg-white opacity-90"></div>
          <div className="absolute right-[1px] top-[4px] bottom-[4px] w-[3px] bg-white opacity-90"></div>

          {/* 내부 설정 폼 */}
          <div className="flex w-[550px] flex-col gap-[40px]">
            {/* 테마 */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <img src={TriangleArrowIcon} alt="arrow" className="w-4 h-4" />
                <span className="text-white text-xl">테마</span>
              </div>
              <div className="flex w-[368px] h-[35px] items-center gap-2.5 [background:#FEFEFE] px-2.5 py-1 border-[2.5px] border-solid border-[rgba(3,0,48,0.50)]">
                {/* 테마명은 이전 선택값에 따라 화면에 고정값으로 보여짐 */}
                <span className="text-[#030030]/60 text-[16px]">
                  프로젝트 에이아
                </span>
              </div>
            </div>

            {/* 포지션 */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <img src={TriangleArrowIcon} alt="arrow" className="w-4 h-4" />
                <span className="text-white text-xl">포지션</span>
              </div>
              <div className="w-[368px] flex justify-start">
                <select className="text-[#030030] block h-[35px] w-[140px] bg-[#FEFEFE] border-[2.5px] border-[rgba(3,0,48,0.50)] px-2.5 py-0 leading-[35px] rounded-[5px]">
                  <option>Frontend</option>
                  <option>Backend</option>
                </select>
              </div>
            </div>

            {/* 프레임워크 */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <img src={TriangleArrowIcon} alt="arrow" className="w-4 h-4" />
                <span className="text-white text-xl">프레임워크</span>
              </div>
              <div className="w-[368px] flex justify-start">
                <select className="text-[#030030] block h-[35px] w-[140px] bg-[#FEFEFE] border-[2.5px] border-[rgba(3,0,48,0.50)] px-2.5 py-0 leading-[35px] rounded-[5px]">
                  <option>SpringBoot</option>
                  <option>Django</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full flex justify-end mt-2">
          <button
            type="button"
            className="text-white/80 text-md font-bold cursor-pointer hover:text-white transition-colors bg-transparent border-none"
          >
            {'>>'} 싱글모드로 시작하기
          </button>
        </div>
      </div>
    </div>
  );
};

export default SingleRoomSettingPage;
