import { render, screen } from '@testing-library/react';

import ErrorMessage from './ErrorMessage';

describe('ErrorMessage', () => {
  it('에러 메시지를 렌더링함', () => {
    render(<ErrorMessage message="네트워크 오류" />);

    expect(screen.getByText('오류 발생')).toBeInTheDocument();
    expect(screen.getByText('네트워크 오류')).toBeInTheDocument();
  });
});
