import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { useStore } from '../../stores/useStore';
import HomePage from './HomePage';

// 시각 효과 컴포넌트 mock -> 테스트에서는 불필요한 렌더링이므로 제거
vi.mock('../../components/effects/VHSEffect', () => ({
  default: () => null,
}));
vi.mock('../../components/effects/VHSStyles', () => ({
  default: () => null,
}));

// react-router-dom의 useNavigate만 mock 처리
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

beforeEach(() => {
  useStore.setState({ isLogin: false });
  mockNavigate.mockClear();
});

describe('HomePage', () => {
  it('비로그인 상태에서 Start 클릭 시 /login으로 이동한다', async () => {
    const user = userEvent.setup();
    render(<HomePage />);

    await user.click(screen.getByText('Start'));

    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  it('로그인 상태에서 Start 클릭 시 /selection/mode로 이동한다', async () => {
    useStore.setState({ isLogin: true });
    const user = userEvent.setup();
    render(<HomePage />);

    await user.click(screen.getByText('Start'));

    expect(mockNavigate).toHaveBeenCalledWith('/selection/mode');
  });
});
