import type { QuestInfo } from '../types/ideTypes';

export default function useTerminal(questInfo: QuestInfo | null) {
  return {
    frontendErrorLog: questInfo?.frontendErrorLog ?? '',
    backendErrorLog: questInfo?.backendErrorLog ?? '',
  };
}
