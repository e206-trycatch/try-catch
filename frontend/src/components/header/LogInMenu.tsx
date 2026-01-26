import { Link } from 'react-router-dom';
import userIcon from '../../assets/images/icons/user_icon.png';

interface LoggedInMenuProps {
  userName?: string;
  onLogout: () => void;
}

const LoggedInMenu = ({ userName, onLogout }: LoggedInMenuProps) => (
  <>
    <Link
      to="/mypage"
      className="flex items-center gap-2 hover:opacity-80 transition-opacity"
    >
      <img src={userIcon} alt="User" className="w-6 h-6" />
      <span className="font-medium">{userName} 님</span>
    </Link>
    <button
      onClick={onLogout}
      className="hover:text-gray-300 font-medium transition-colors"
    >
      로그아웃
    </button>
  </>
);

export default LoggedInMenu;
