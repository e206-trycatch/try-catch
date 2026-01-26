import AiHintIcon from '../../../assets/images/icons/ai_hint_icon.svg';
import alarmIcon from '../../../assets/images/icons/alarm_icon.svg';
import ChatIcon from '../../../assets/images/icons/chat_icon.svg';
import FileIcon from '../../../assets/images/icons/file_icon.svg';
import SaveIcon from '../../../assets/images/icons/save_icon.svg';

type SideMenu = 'explorer' | 'chat' | 'hint' | 'alarm';

type Props = {
  activeMenu: SideMenu;
  onChangeMenu: (menu: SideMenu) => void;
};

export default function Menubar({ activeMenu, onChangeMenu }: Props) {
  const iconClass = (menu: SideMenu) => {
    return `cursor-pointer p-2 rounded-lg ${
      activeMenu === menu ? 'bg-stone-700' : 'opacity-60 hover:opacity-100'
    }`;
  };
  return (
    <div className="flex flex-col gap-[30px] justify-center items-center">
      <img
        src={FileIcon}
        alt="파일 목록"
        className={iconClass('explorer')}
        onClick={() => onChangeMenu('explorer')}
      />
      <img src={SaveIcon} alt="저장" />
      <img
        src={ChatIcon}
        alt="채팅"
        className={iconClass('chat')}
        onClick={() => onChangeMenu('chat')}
      />
      <img
        src={AiHintIcon}
        alt="힌트"
        className={iconClass('hint')}
        onClick={() => onChangeMenu('hint')}
      />
      <img
        src={alarmIcon}
        alt="알림"
        className={iconClass('alarm')}
        onClick={() => onChangeMenu('alarm')}
      />
    </div>
  );
}
