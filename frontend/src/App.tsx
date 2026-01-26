import { Route, Routes } from 'react-router-dom';

import MainLayout from './layouts/AppLayout';
import HomePage from './pages/home/HomePage';
import Idepage from './pages/ide/Idepage';
import LoginPage from './pages/login/LoginPage';

function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/ide" element={<Idepage />} />
      </Route>
    </Routes>
  );
}

export default App;
