import { Route, Routes } from 'react-router-dom';

import MainLayout from './layouts/AppLayout';
import HomePage from './pages/home/HomePage';

function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
      </Route>
    </Routes>
  );
}

export default App;