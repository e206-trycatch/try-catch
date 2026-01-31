import { Outlet, useLocation } from 'react-router-dom';

import Footer from '../components/footer/Footer';
import Header from '../components/header/Header';

const AppLayout = () => {
  const { pathname } = useLocation();
  // 숨길 페이지
  const hiddenFooterPaths = ['/game', '/quest', '/story'];
  // 현재 주소가 hiddenFooterPths 중 하나로 시작하면 Footer를 숨기겠다.
  const hideFooter = hiddenFooterPaths.some((path) =>
    pathname.startsWith(path),
  );
  return (
    <div className="relative w-full min-h-screen text-white overflow-hidden flex flex-col">
      <Header />

      {/* 컨텐츠 영역 */}
      <main className="flex-1 w-full relative z-0 flex flex-col justify-center items-center">
        <Outlet />
      </main>

      {/* hideFooter가 아니면 Footer 컴포넌트 얍! */}
      {!hideFooter && <Footer />}
    </div>
  );
};

export default AppLayout;
