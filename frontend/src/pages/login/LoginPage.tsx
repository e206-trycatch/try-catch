import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { login } from '../../api/auth';
import { useStore } from '../../stores/useStore';

const LoginPage = () => {
  const navigate = useNavigate();
  const storeLogin = useStore((state) => state.login);

  // 폼 상태
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // 로그인 처리
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 입력값 검증
    if (!loginId.trim() || !password.trim()) {
      setError('아이디와 비밀번호를 모두 입력해주세요.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await login({ loginId, password });

      // 로그인 성공
      if (response.result) {
        storeLogin(response.result.accessToken, {
          nickname: response.result.nickname,
          profileUrl: response.result.profileUrl,
        });
        navigate('/');
      }
    } catch (err: unknown) {
      // 에러 처리
      const error = err as { response?: { data?: { message?: string } } };
      if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else {
        setError('서버와 연결할 수 없습니다.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full flex justify-center items-center">
      {/* 로그인 박스 */}
      <div
        className="w-full max-w-md p-10"
        style={{
          backgroundColor: 'rgba(30, 30, 60, 0.8)',
          clipPath: `polygon(
            0 8px, 8px 8px, 8px 0,
            calc(100% - 8px) 0, calc(100% - 8px) 8px, 100% 8px,
            100% calc(100% - 8px), calc(100% - 8px) calc(100% - 8px),
            calc(100% - 8px) 100%, 8px 100%, 8px calc(100% - 8px),
            0 calc(100% - 8px)
          )`,
        }}
      >
        {/* 제목 */}
        <h1 className="text-2xl font-bold text-center text-white mb-8">
          LOGIN
        </h1>

        <form onSubmit={handleSubmit}>
          {/* 아이디 입력 */}
          <div className="mb-2">
            <label className="block text-white text-sm mb-2">아이디</label>
            <input
              type="text"
              placeholder="ID"
              value={loginId}
              onChange={(e) => setLoginId(e.target.value)}
              className="w-full p-3 bg-gray-600 text-white placeholder-gray-400 outline-none"
              style={{
                clipPath: `polygon(
                  0 4px, 4px 4px, 4px 0,
                  calc(100% - 4px) 0, calc(100% - 4px) 4px, 100% 4px,
                  100% calc(100% - 4px), calc(100% - 4px) calc(100% - 4px),
                  calc(100% - 4px) 100%, 4px 100%, 4px calc(100% - 4px),
                  0 calc(100% - 4px)
                )`,
              }}
            />
          </div>
          <div className="text-right mb-4">
            <Link
              to="/find-id"
              className="text-white text-xs hover:text-gray-300"
            >
              아이디 찾기
            </Link>
          </div>

          {/* 비밀번호 입력 */}
          <div className="mb-2">
            <label className="block text-white text-sm mb-2">비밀번호</label>
            <input
              type="password"
              placeholder="PASSWORD"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 bg-gray-600 text-white placeholder-gray-400 outline-none"
              style={{
                clipPath: `polygon(
                  0 4px, 4px 4px, 4px 0,
                  calc(100% - 4px) 0, calc(100% - 4px) 4px, 100% 4px,
                  100% calc(100% - 4px), calc(100% - 4px) calc(100% - 4px),
                  calc(100% - 4px) 100%, 4px 100%, 4px calc(100% - 4px),
                  0 calc(100% - 4px)
                )`,
              }}
            />
          </div>
          <div className="text-right mb-6">
            <Link
              to="/find-password"
              className="text-white text-xs hover:text-gray-300"
            >
              비밀번호 찾기
            </Link>
          </div>

          {/* 에러 메시지 */}
          {error && (
            <div className="text-red-400 text-sm text-center mb-4">{error}</div>
          )}

          {/* 로그인 버튼 */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full p-3 bg-white text-black font-bold hover:bg-gray-200 transition-colors disabled:opacity-50"
            style={{
              clipPath: `polygon(
                0 4px, 4px 4px, 4px 0,
                calc(100% - 4px) 0, calc(100% - 4px) 4px, 100% 4px,
                100% calc(100% - 4px), calc(100% - 4px) calc(100% - 4px),
                calc(100% - 4px) 100%, 4px 100%, 4px calc(100% - 4px),
                0 calc(100% - 4px)
              )`,
            }}
          >
            {isLoading ? '로그인 중...' : '로그인'}
          </button>
        </form>

        {/* 회원가입 링크 */}
        <div className="text-center mt-6 text-sm">
          <span className="text-gray-400">아직 회원이 아니신가요?</span>{' '}
          <Link
            to="/signup"
            className="text-white underline hover:text-gray-300"
          >
            회원가입하러 가기
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
