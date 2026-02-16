// SettingRow.tsx
// - 아이콘, 라벨, 오른쪽 컨트롤 공통 행 컴포넌트
import TriangleArrowIcon from '../../assets/images/icons/triangle-arrow-pixel.png';

type SettingRowProps = {
  label: string;
  children: React.ReactNode;
};

const SettingRow = ({ label, children }: SettingRowProps) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-6">
        <img
          src={TriangleArrowIcon}
          alt="arrow"
          className="w-4 h-4"
          loading="lazy"
        />
        <span className="text-white text-xl">{label}</span>
      </div>
      {children}
    </div>
  );
};

export default SettingRow;
