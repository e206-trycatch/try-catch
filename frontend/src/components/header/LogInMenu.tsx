import { Link } from 'react-router-dom';

import defaultProfile from '../../assets/images/icons/default_profile.png';

interface LoggedInMenuProps {
  userName?: string;
  profileUrl?: string | null;
  onLogout: () => void;
}

const LoggedInMenu = ({
  userName,
  profileUrl,
  onLogout,
}: LoggedInMenuProps) => (
  <>
    <Link
      to="/mypage"
      className="flex items-center gap-2 hover:opacity-80 transition-opacity"
    >
      <img
        src={profileUrl || defaultProfile}
        alt="User"
        className="w-6 h-6 rounded-full object-cover"
        onError={(e) => {
          e.currentTarget.src = defaultProfile;
        }}
        loading="lazy"
      />
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
