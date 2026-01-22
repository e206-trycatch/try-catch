import userIcon from '../../assets/images/icons/user_icon.png';

interface LoggedInMenuProps {
  userName?: string;
  onLogout: () => void;
}

const LoggedInMenu = ({ userName, onLogout }: LoggedInMenuProps) => (
  <>
    <div className="flex items-center gap-2">
      <img src={userIcon} alt="User" className="w-6 h-6" />
      <span className="font-medium">{userName} 님</span>
    </div>
    <button
      onClick={onLogout}
      className="hover:text-gray-300 font-medium transition-colors"
    >
      로그아웃
    </button>
  </>
);

export default LoggedInMenu;
