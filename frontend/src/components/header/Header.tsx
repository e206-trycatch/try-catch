import { Link, useLocation } from 'react-router-dom';

import backIcon from '../../assets/images/icons/back_icon.png';
import trycatchLogo from '../../assets/images/trycatch_logo.png';
import { useStore } from '../../stores/useStore';
import SoundToggleButton from '../sound/SoundToggleButton';
import LogInMenu from './LogInMenu';
import LogOutMenu from './LogOutMenu';

const Header = () => {
  const { isLogin, user, logout } = useStore();
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  return (
    <>
      <header className="w-full flex items-center px-[80px] py-6 text-white absolute top-0 left-0 z-10">
        {/* 좌측 로고 영역 */}
        {!isHomePage && (
          <Link
            to="/"
            className="flex items-center gap-2 hover:opacity-80 active:opacity-60 transition-opacity"
          >
            <img src={backIcon} alt="Back" className="w-6 h-6" />
            <img
              src={trycatchLogo}
              alt="TryCatch Logo"
              className="w-[95px] h-[23px] justify-center aspect-[95/23] object-contain ml-2"
            />
          </Link>
        )}

        {/* 우측 메뉴 영역 (조건부 렌더링) */}
        <nav className="flex items-center gap-6 tracking-[-0.8px] text-md ml-auto">
          <SoundToggleButton />
          {isLogin ? (
            <LogInMenu userName={user?.name} onLogout={logout} />
          ) : (
            <LogOutMenu />
          )}
        </nav>
      </header>
    </>
  );
};

export default Header;
