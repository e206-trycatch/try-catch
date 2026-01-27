import { Route, Routes } from 'react-router-dom';

import MainLayout from './layouts/AppLayout';
import GamePage from './pages/game/GamePage';
import HomePage from './pages/home/HomePage';
import LoginPage from './pages/login/LoginPage';
import ModeSelectionPage from './pages/mode-selection/ModeSelectionPage';
import QuestDescriptionPage from './pages/quest-description/QuestDescriptionPage';
import ResultLoadingPage from './pages/result/ResultLoadingPage';
import ResultPage from './pages/result/ResultPage';
import SignupPage from './pages/signup/SignupPage';
import ThemeSelectionPage from './pages/theme-selection/ThemeSelectionPage';
import MyPage from './pages/mypage/MyPage';

function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        {/* 메인(대문) */}
        <Route path="/" element={<HomePage />} />
        {/* 로그인/회원가입 */}
        <Route path="/login" element={<LoginPage />} />

        {/* 모드 */}
        <Route path="/mode" element={<ModeSelectionPage />} />
        {/* 테마 */}
        <Route path="/theme" element={<ThemeSelectionPage />} />
        {/* 퀘스트 */}
        <Route path="/quest" element={<QuestDescriptionPage />} />

        {/* 게임 */}
        <Route path="/game" element={<GamePage />} />
        <Route path="/signup" element={<SignupPage />} />
        {/* 결과 */}
        <Route path="/result/loading" element={<ResultLoadingPage />} />
        <Route path="/result" element={<ResultPage />} />
        {/* 마이페이지 */}
        <Route path="/mypage" element={<MyPage />} />
      </Route>
    </Routes>
  );
}

export default App;
