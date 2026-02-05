import { useRoomStore } from '@/stores/useRoomStore';

import AiHintIcon from '../../../assets/images/icons/ai_hint_icon.svg';
import alarmIcon from '../../../assets/images/icons/alarm_icon.svg';
import FileIcon from '../../../assets/images/icons/file_icon.svg';
import SaveIcon from '../../../assets/images/icons/save_icon.svg';

type Props = {
  fileMenu: boolean;
  onToggleFileMenu: () => void;
  onSave: () => void;
};

const mode = useRoomStore.getState().draft.mode;

console.log(mode);

export default function Menubar({ fileMenu, onToggleFileMenu, onSave }: Props) {
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
        <img src={AiHintIcon} alt="힌트" className="w-[30px]" />
        <img src={alarmIcon} alt="알림" className="w-[30px]" />
      </div>
    </div>
  );
}
