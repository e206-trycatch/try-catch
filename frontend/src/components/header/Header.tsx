import { Link, useLocation, useNavigate } from 'react-router-dom';

import backIcon from '../../assets/images/icons/back_icon.png';
import trycatchLogo from '../../assets/images/trycatch_logo.png';
import { useStore } from '../../stores/useStore';
import GlobalAudioPlayer from '../sound/GlobalAudioPlayer';
import SoundToggleButton from '../sound/SoundToggleButton';
import LogInMenu from './LogInMenu';
import LogOutMenu from './LogOutMenu';

const Header = () => {
  const { isLogin, user, logout } = useStore();
  const location = useLocation();
  const navigate = useNavigate();
  const isHomePage = location.pathname === '/';

  // 로그아웃 처리
  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <>
      <GlobalAudioPlayer />
      <header
        className="w-full flex items-center fixed top-0 left-0 z-10 text-white"
        style={{ padding: '24px 80px' }}
      >
        {/* 좌측 로고 영역 */}
        {!isHomePage && (
          <Link
            to="/"
            className="flex items-center hover:opacity-80 active:opacity-60 transition-opacity"
            style={{ gap: '0.5vw' }}
          >
            <img
              src={backIcon}
              alt="Back"
              style={{ width: '24px', height: '24px' }}
            />
            <img
              src={trycatchLogo}
              alt="TryCatch Logo"
              style={{ width: '95px', height: '23px', marginLeft: '0.5vw' }}
              className="object-contain"
            />
          </Link>
        )}

        {/* 우측 메뉴 영역 */}
        <nav
          className="flex items-center ml-auto"
          style={{ 
            gap: '1.5vw', 
            letterSpacing: '-0.05vw',
            fontSize: 'max(14px, 1vw)' // 확대해도 커지지 않되, 최소 크기는 보장
          }}
        >
          <SoundToggleButton />
          {isLogin ? (
            <LogInMenu userName={user?.nickname} onLogout={handleLogout} />
          ) : (
            <LogOutMenu />
          )}
        </nav>
      </header>
    </>
  );
};

export default Header;