import axios from 'axios';
import { useEffect, useState } from 'react';
import { Route, Routes } from 'react-router-dom';

import LoadingSpinner from './components/common/LoadingSpinner';
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
import { useStore } from './stores/useStore';

function App() {
  const [isInitialized, setIsInitialized] = useState(false);
  const login = useStore((state) => state.login);

  // 앱 초기화 시 토큰 체크 (인터셉터 우회)
  useEffect(() => {
    const initAuth = async () => {
      try {
        // 인터셉터 우회를 위해 axios 직접 사용
        const { data } = await axios.post('/api/v1/auth/refresh', null, {
          withCredentials: true,
        });

        // 재발급 성공 → 로그인 상태로 설정
        login(data.result.accessToken, {
          nickname: data.result.nickname,
          profileUrl: data.result.profileUrl,
        });
      } catch {
        // 실패 → 비로그인 상태로 진행 (리다이렉트 없음)
        console.log('자동 로그인 실패 - 비로그인 상태로 진행');
      } finally {
        setIsInitialized(true);
      }
    };

    initAuth();
  }, [login]);

  // 초기화 전 로딩 화면
  if (!isInitialized) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

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
        <Route path="/quest-description" element={<QuestDescriptionPage />} />
        {/* 싱글모드 방 설정 */}
        <Route
          path="/single-room-settings"
          element={<SingleRoomSettingPage />}
        />
        {/* 게임 */}
        <Route path="/game/:roomId/:questId" element={<GamePage />} />
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
