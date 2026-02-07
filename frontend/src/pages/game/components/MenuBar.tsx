import FileIcon from '../../../assets/images/icons/file_icon.png';
import SaveIcon from '../../../assets/images/icons/save_icon.png';
import HintButton from './hint/HintButton';

type Props = {
  fileMenu: boolean;
  mode: 'SINGLE' | 'MULTI' | null;
  isSplit: boolean;
  onToggleFileMenu: () => void;
  onSave: () => void;
  onToggleSplit: () => void;
  onOpenHintModal: () => void;
};

export default function Menubar({
  fileMenu,
  mode,
  isSplit,
  onToggleFileMenu,
  onSave,
  onToggleSplit,
  onOpenHintModal,
}: Props) {
  return (
    <div className="flex flex-col gap-[18px] justify-center items-center">
      <button
        type="button"
        className={`cursor-pointer p-2 rounded-lg ${fileMenu ? 'bg-white/20 opacity-100' : 'opacity-50 hover:opacity-75'}`}
        onClick={onToggleFileMenu}
      >
        <img src={FileIcon} alt="파일 목록" className="w-[24px]" />
      </button>

      <div className="border-t-1 border-gray-600 pt-[25px] flex flex-col gap-[30px] justify-center items-center">
        {mode === 'MULTI' && (
          <button
            type="button"
            className={`cursor-pointer hover:opacity-75`}
            onClick={onSave}
          >
            <img src={SaveIcon} alt="저장" className="w-[30px]" />
          </button>
        )}

        {/* 스플릿 토글 버튼 */}
        <button
          type="button"
          className={`cursor-pointer p-2 rounded-lg ${isSplit ? 'bg-white/20 opacity-100' : 'opacity-50 hover:opacity-75'}`}
          onClick={onToggleSplit}
          title={isSplit ? '스플릿 해제' : '화면 분할'}
        >
          <svg
            width="27"
            height="27"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-white"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <line x1="12" y1="3" x2="12" y2="21" />
          </svg>
        </button>

        <HintButton onClick={onOpenHintModal} />
      </div>
    </div>
  );
}
