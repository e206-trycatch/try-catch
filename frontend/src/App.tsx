import { Route, Routes } from 'react-router-dom';

import MainLayout from './layouts/AppLayout';
import GamePage from './pages/game/GamePage';
import HomePage from './pages/home/HomePage';
import LoginPage from './pages/login/LoginPage';
import ModeSelectionPage from './pages/mode-selection/ModeSelectionPage';
import MyPage from './pages/mypage/MyPage';
import QuestDescriptionPage from './pages/quest-description/QuestDescriptionPage';
import ResultLoadingPage from './pages/result/ResultLoadingPage';
import ResultPage from './pages/result/ResultPage';
import SingleRoomSettingPage from './pages/room-settings/SingleRoomSettingPage';
import SignupPage from './pages/signup/SignupPage';
import ThemeSelectionPage from './pages/theme-selection/ThemeSelectionPage';

function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        {/* 메인(대문) */}
        <Route path="/" element={<HomePage />} />
        {/* 로그인/회원가입 */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        {/* 모드 */}
        <Route path="/selection/mode" element={<ModeSelectionPage />} />
        {/* 테마 */}
        <Route path="/selection/theme" element={<ThemeSelectionPage />} />
        {/* 퀘스트 */}
        <Route path="/selection/quest" element={<QuestDescriptionPage />} />
        {/* 싱글모드 방 설정 */}
        <Route
          path="/single-room-settings"
          element={<SingleRoomSettingPage />}
        />
        {/* 게임 */}
        <Route path="/game" element={<GamePage />} />
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
