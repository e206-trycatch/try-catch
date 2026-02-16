import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import { useStore } from '../../stores/useStore';
import PrivateRoute from './PrivateRoute';

// 각 테스트 진행 전 store를 초기 상태로 리셋하기
beforeEach(() => {
  useStore.setState({ isLogin: false });
});

describe('PrivateRoute', () => {
  it('미로그인 시 /login으로 리다이렉트한다', () => {
    render(
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route element={<PrivateRoute />} />
          <Route path="/protected" element={<div>보호된 페이지</div>} />
          <Route path="/login" element={<div>로그인 페이지</div>} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText('보호된 페이지')).toBeInTheDocument();
    expect(screen.queryByText('로그인 페이지')).not.toBeInTheDocument();
  });

  it('로그인 상태면 자식 라우트를 렌더링한다', () => {
    useStore.setState({ isLogin: true });

    render(
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route element={<PrivateRoute />}>
            <Route path="/protected" element={<div>보호된 페이지</div>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText('보호된 페이지')).toBeInTheDocument();
    expect(screen.queryByText('로그인 페이지')).not.toBeInTheDocument();
  });
});
