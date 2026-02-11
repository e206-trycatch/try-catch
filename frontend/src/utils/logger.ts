const isDev = import.meta.env.DEV;

export const logger = {
  log: (...args: unknown[]) => {
    if (isDev) console.log(...args);
  },
  warn: (...args: unknown[]) => {
    if (isDev) console.warn(...args);
  },
  error: (...args: unknown[]) => {
    console.error(...args);
  },
};

// 태그 자동으로 붙는 로거 인스턴스 생성
export const createLogger = (tag: string) => ({
  log: (...args: unknown[]) => logger.log(tag, ...args),
  warn: (...args: unknown[]) => logger.warn(tag, ...args),
  error: (...args: unknown[]) => logger.error(tag, ...args),
});