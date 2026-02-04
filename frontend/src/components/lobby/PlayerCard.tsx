import offProfileImg from '../../assets/images/icons/off_profile_pixel_user.png';
import onProfileImg from '../../assets/images/icons/on_profile_pixel_user.png';

interface PlayerCardProps {
  nickname: string;
  position: string;
  framework: string;
  isHost: boolean;
  isActive: boolean;
  isReady?: boolean;
}

const FRAMEWORK_COLORS: Record<string, string> = {
  SpringBoot: '#4CAF50',
  React: '#26C6DA',
  Vue: '#42b883',
  Django: '#2E7D32',
};

const PlayerCard = ({
  nickname,
  position,
  framework,
  isHost,
  isActive,
  isReady,
}: PlayerCardProps) => {
  const frameworkColor = isActive
    ? (FRAMEWORK_COLORS[framework] ?? '#9e9e9e')
    : '#9e9e9e';
  const positionBg = isActive ? '#1a1a3e' : '#b0b0b0';
  const textColor = isActive ? '#1a1a3e' : '#9e9e9e';

  return (
    <div
      className="flex w-[340px] h-[200px] bg-white rounded-[10px] border-[3px] overflow-hidden"
      style={{
        borderColor: isActive ? 'rgba(3,0,48,0.50)' : 'rgba(160,160,160,0.50)',
      }}
    >
      {/* 왼쪽 유저 (host) */}
      <div className="flex items-center justify-center w-[150px] shrink-0">
        <img
          src={isActive ? onProfileImg : offProfileImg}
          alt={isActive ? 'Active profile' : 'Inactive profile'}
          className="w-[110px] h-[110px] object-contain"
        />
      </div>

      {/* 세로 구분선 */}
      <div
        className="w-[2px] my-4"
        style={{
          backgroundColor: isActive
            ? 'rgba(3,0,48,0.20)'
            : 'rgba(160,160,160,0.30)',
        }}
      />

      {/* 오른쪽 정보 */}
      <div className="flex flex-col justify-center gap-3 px-5 flex-1">
        {/* 닉네임 */}
        <span className="text-[18px] font-bold" style={{ color: textColor }}>
          {isHost && <span className="mr-1">👑</span>}[ {nickname} ]
        </span>

        {/* 포지션 배지 */}
        <span
          className="inline-block w-fit px-4 py-1 rounded-[6px] text-[14px] font-bold text-white"
          style={{ backgroundColor: positionBg }}
        >
          {position}
        </span>

        {/* 프레임워크 배지 */}
        <span
          className="inline-block w-fit px-4 py-1 rounded-[20px] text-[14px] font-bold text-white"
          style={{ backgroundColor: frameworkColor }}
        >
          {framework}
        </span>

        {/* 준비(Ready) 활성화 버튼 */}
        {isActive && isReady !== undefined && (
          <span
            className={`inline-block w-fit px-3 py-1 rounded-[6px] text-[13px] font-bold text-white ${
              isReady ? 'bg-green-500' : 'bg-gray-400'
            }`}
          >
            {isReady ? 'READY' : 'NOT READY'}
          </span>
        )}
      </div>
    </div>
  );
};

export default PlayerCard;
