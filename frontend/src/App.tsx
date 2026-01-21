import { Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/index';
import HomePage from './pages/home/index';

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