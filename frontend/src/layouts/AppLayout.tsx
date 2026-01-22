import { Outlet } from 'react-router-dom';

import Footer from '../components/footer/Footer';
import Header from '../components/header/Header';

const AppLayout = () => {
  return (
    <div className="relative w-full min-h-screen text-white overflow-hidden flex flex-col">
      <Header />

      {/* 컨텐츠 영역 */}
      <main className="flex-1 w-full relative z-0 flex flex-col justify-center items-center">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
};

export default AppLayout;
