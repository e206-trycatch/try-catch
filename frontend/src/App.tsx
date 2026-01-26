import { Route, Routes } from 'react-router-dom';

import MainLayout from './layouts/AppLayout';
import GamePage from './pages/game/GamePage';
import HomePage from './pages/home/HomePage';
import LoginPage from './pages/login/LoginPage';

function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/game" element={<GamePage />} />
        <Route path="/login" element={<LoginPage />} />
      </Route>
    </Routes>
  );
}

export default App;
