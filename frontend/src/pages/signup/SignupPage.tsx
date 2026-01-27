import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import {
  signup,
  checkLoginId,
  checkNickname,
  checkEmail,
} from '../../api/auth';

const SignupPage = () => {
  const navigate = useNavigate();

  // 폼 상태
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');

  // 중복 확인 상태
  const [isIdChecked, setIsIdChecked] = useState(false);
  const [isIdAvailable, setIsIdAvailable] = useState(false);
  const [isNicknameChecked, setIsNicknameChecked] = useState(false);
  const [isNicknameAvailable, setIsNicknameAvailable] = useState(false);
  const [isEmailChecked, setIsEmailChecked] = useState(false);
  const [isEmailAvailable, setIsEmailAvailable] = useState(false);

  // 중복 확인 메시지
  const [idMessage, setIdMessage] = useState<string | null>(null);
  const [nicknameMessage, setNicknameMessage] = useState<string | null>(null);
  const [emailMessage, setEmailMessage] = useState<string | null>(null);

  // 로딩 및 에러 상태
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 공통 clipPath 스타일
  const boxClipPath = `polygon(
    0 8px, 8px 8px, 8px 0,
    calc(100% - 8px) 0, calc(100% - 8px) 8px, 100% 8px,
    100% calc(100% - 8px), calc(100% - 8px) calc(100% - 8px),
    calc(100% - 8px) 100%, 8px 100%, 8px calc(100% - 8px),
    0 calc(100% - 8px)
  )`;

  const inputClipPath = `polygon(
    0 4px, 4px 4px, 4px 0,
    calc(100% - 4px) 0, calc(100% - 4px) 4px, 100% 4px,
    100% calc(100% - 4px), calc(100% - 4px) calc(100% - 4px),
    calc(100% - 4px) 100%, 4px 100%, 4px calc(100% - 4px),
    0 calc(100% - 4px)
  )`;

  // 아이디 중복 확인
  const handleCheckId = async () => {
    if (!id.trim()) {
      setIdMessage('아이디를 입력해주세요.');
      return;
    }

    try {
      const response = await checkLoginId(id);
      setIsIdChecked(true);
      setIsIdAvailable(response.result.available);
      setIdMessage(response.message);
    } catch {
      setIdMessage('중복 확인 중 오류가 발생했습니다.');
    }
  };

  // 닉네임 중복 확인
  const handleCheckNickname = async () => {
    if (!nickname.trim()) {
      setNicknameMessage('닉네임을 입력해주세요.');
      return;
    }

    try {
      const response = await checkNickname(nickname);
      setIsNicknameChecked(true);
      setIsNicknameAvailable(response.result.available);
      setNicknameMessage(response.message);
    } catch {
      setNicknameMessage('중복 확인 중 오류가 발생했습니다.');
    }
  };

  // 이메일 중복 확인
  const handleCheckEmail = async () => {
    if (!email.trim()) {
      setEmailMessage('이메일을 입력해주세요.');
      return;
    }

    try {
      const response = await checkEmail(email);
      setIsEmailChecked(true);
      setIsEmailAvailable(response.result.available);
      setEmailMessage(response.message);
    } catch {
      setEmailMessage('중복 확인 중 오류가 발생했습니다.');
    }
  };

  // 회원가입 처리
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // 필수 입력 검증
    if (!id.trim() || !password.trim() || !passwordConfirm.trim() || !nickname.trim() || !email.trim()) {
      setError('모든 필드를 입력해주세요.');
      return;
    }

    // 비밀번호 확인
    if (password !== passwordConfirm) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    // 중복 확인 검증
    if (!isIdChecked || !isIdAvailable) {
      setError('아이디 중복 확인을 해주세요.');
      return;
    }

    if (!isNicknameChecked || !isNicknameAvailable) {
      setError('닉네임 중복 확인을 해주세요.');
      return;
    }

    if (!isEmailChecked || !isEmailAvailable) {
      setError('이메일 중복 확인을 해주세요.');
      return;
    }

    setIsLoading(true);

    try {
      await signup({ id, password, email, nickname });
      // 회원가입 성공 시 로그인 페이지로 이동
      navigate('/login');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else {
        setError('회원가입 중 오류가 발생했습니다.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full flex justify-center items-center">
      {/* 회원가입 박스 */}
      <div
        className="w-full max-w-md p-10"
        style={{
          backgroundColor: 'rgba(30, 30, 60, 0.8)',
          clipPath: boxClipPath,
        }}
      >
        {/* 제목 */}
        <h1 className="text-2xl font-bold text-center text-white mb-8">
          SIGNUP
        </h1>

        <form onSubmit={handleSubmit}>
          {/* 아이디 입력 */}
          <div className="mb-2">
            <label className="block text-white text-sm mb-2">아이디</label>
            <input
              type="text"
              placeholder="ID"
              value={id}
              onChange={(e) => {
                setId(e.target.value);
                setIsIdChecked(false);
                setIsIdAvailable(false);
                setIdMessage(null);
              }}
              className="w-full p-3 bg-gray-600 text-white placeholder-gray-400 outline-none"
              style={{ clipPath: inputClipPath }}
            />
          </div>
          <div className="flex justify-between items-center mb-4">
            {idMessage && (
              <span className={`text-xs ${isIdAvailable ? 'text-green-400' : 'text-red-400'}`}>
                {idMessage}
              </span>
            )}
            <button
              type="button"
              onClick={handleCheckId}
              className="text-white text-xs hover:text-gray-300 ml-auto"
            >
              중복 확인
            </button>
          </div>

          {/* 비밀번호 입력 */}
          <div className="mb-4">
            <label className="block text-white text-sm mb-2">비밀번호</label>
            <input
              type="password"
              placeholder="PASSWORD"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 bg-gray-600 text-white placeholder-gray-400 outline-none"
              style={{ clipPath: inputClipPath }}
            />
          </div>

          {/* 비밀번호 확인 입력 */}
          <div className="mb-4">
            <label className="block text-white text-sm mb-2">비밀번호 확인</label>
            <input
              type="password"
              placeholder="PASSWORD"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              className="w-full p-3 bg-gray-600 text-white placeholder-gray-400 outline-none"
              style={{ clipPath: inputClipPath }}
            />
          </div>

          {/* 닉네임 입력 */}
          <div className="mb-2">
            <label className="block text-white text-sm mb-2">닉네임</label>
            <input
              type="text"
              placeholder="NICKNAME"
              value={nickname}
              onChange={(e) => {
                setNickname(e.target.value);
                setIsNicknameChecked(false);
                setIsNicknameAvailable(false);
                setNicknameMessage(null);
              }}
              className="w-full p-3 bg-gray-600 text-white placeholder-gray-400 outline-none"
              style={{ clipPath: inputClipPath }}
            />
          </div>
          <div className="flex justify-between items-center mb-4">
            {nicknameMessage && (
              <span className={`text-xs ${isNicknameAvailable ? 'text-green-400' : 'text-red-400'}`}>
                {nicknameMessage}
              </span>
            )}
            <button
              type="button"
              onClick={handleCheckNickname}
              className="text-white text-xs hover:text-gray-300 ml-auto"
            >
              중복 확인
            </button>
          </div>

          {/* 이메일 입력 */}
          <div className="mb-2">
            <label className="block text-white text-sm mb-2">이메일</label>
            <input
              type="email"
              placeholder="EMAIL"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setIsEmailChecked(false);
                setIsEmailAvailable(false);
                setEmailMessage(null);
              }}
              className="w-full p-3 bg-gray-600 text-white placeholder-gray-400 outline-none"
              style={{ clipPath: inputClipPath }}
            />
          </div>
          <div className="flex justify-between items-center mb-6">
            {emailMessage && (
              <span className={`text-xs ${isEmailAvailable ? 'text-green-400' : 'text-red-400'}`}>
                {emailMessage}
              </span>
            )}
            <button
              type="button"
              onClick={handleCheckEmail}
              className="text-white text-xs hover:text-gray-300 ml-auto"
            >
              중복 확인
            </button>
          </div>

          {/* 에러 메시지 */}
          {error && (
            <div className="text-red-400 text-sm text-center mb-4">{error}</div>
          )}

          {/* 회원가입 버튼 */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full p-3 bg-white text-black font-bold hover:bg-gray-200 transition-colors disabled:opacity-50"
            style={{ clipPath: inputClipPath }}
          >
            {isLoading ? '가입 중...' : '회원가입'}
          </button>
        </form>

        {/* 로그인 링크 */}
        <div className="text-center mt-6 text-sm">
          <span className="text-gray-400">이미 계정이 있으신가요?</span>{' '}
          <Link to="/login" className="text-white underline hover:text-gray-300">
            로그인하러 가기
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
