import axios from 'axios';

interface ApiErrorOptions {
  statusMessages?: Record<number, string>;
  defaultMessage?: string;
  networkMessage?: string;
}

export function handleApiError(
  error: unknown,
  options: ApiErrorOptions = {},
): string {
  const {
    statusMessages = {},
    defaultMessage = '오류가 발생하였습니다. 다시 시도해주세요.',
    networkMessage = '네트워크 오류가 발생하였습니다. 다시 시도해주세요.',
  } = options;

  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const serverMessage = error.response?.data?.message;

    if (status && statusMessages[status]) {
      return statusMessages[status];
    }

    return serverMessage || defaultMessage;
  }

  return networkMessage;
}
