export function validateInvitationCode(code: string): string | null {
  if (!code) return '초대 코드를 입력해주세요.';
  if (code.length !== 8) return '초대 코드는 8자리여야 합니다.';
  if (!/^[a-zA-Z0-9]+$/.test(code))
    return '초대 코드는 영문자와 숫자만 사용할 수 있습니다.';
  return null;
}
