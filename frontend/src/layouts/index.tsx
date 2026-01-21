import { Outlet } from 'react-router-dom';

const MainLayout = () => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* 헤더 영역 */}
      <header className="bg-slate-800 text-white p-4 shadow-md">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold font-main">메인 레이아웃 예시</h1>
          <nav>
            <ul className="flex gap-4">
              <li className="hover:text-blue-300 cursor-pointer">login</li>
              <li className="hover:text-blue-300 cursor-pointer">signup</li>
            </ul>
          </nav>
        </div>
      </header>

      {/* 본문 영역 (페이지마다 바뀌는 부분) */}
      <main className="flex-1 bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <Outlet /> 
        </div>
      </main>

      {/* 푸터 영역 */}
      <footer className="bg-slate-900 text-gray-400 p-4 text-center text-sm">
        © 2026 try-catch. All rights reserved.
      </footer>
    </div>
  );
};

export default MainLayout;