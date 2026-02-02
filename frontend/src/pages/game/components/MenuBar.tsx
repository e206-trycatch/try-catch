import AiHintIcon from '../../../assets/images/icons/ai_hint_icon.svg';
import alarmIcon from '../../../assets/images/icons/alarm_icon.svg';
import ChatIcon from '../../../assets/images/icons/chat_icon.svg';
import FileIcon from '../../../assets/images/icons/file_icon.svg';
import SaveIcon from '../../../assets/images/icons/save_icon.svg';

type Props = {
  fileMenu: boolean;
  onOpenCloseFileMenu: (fileMenu: boolean) => void;
};

export default function Menubar({ fileMenu, onOpenCloseFileMenu }: Props) {
  return (
    <div className="flex flex-col gap-[20px] justify-center items-center">
      <button
        type="button"
        className={`cursor-pointer p-2 rounded-lg ${fileMenu ? 'bg-white/20 opacity-100' : 'opacity-50 hover:opacity-75'}`}
        onClick={() => onOpenCloseFileMenu(!fileMenu)}
      >
        <img src={FileIcon} alt="파일 목록" />
      </button>

      <div className="border-t-1 border-gray-600 pt-[25px] flex flex-col gap-[40px] justify-center items-center">
        <img src={SaveIcon} alt="저장" />
        <img src={ChatIcon} alt="채팅" />
        <img src={AiHintIcon} alt="힌트" />
        <img src={alarmIcon} alt="알림" />
      </div>
    </div>
  );
}
