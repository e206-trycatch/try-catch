import { useEffect, useState } from 'react';

import { getQuest } from '../../../api/questFile';
import type { QuestInfo } from '../types/ideTypes';

export default function useTerminal() {
  const [frontendErrorLog, setFrontendErrorLog] = useState<string>('');
  const [backendErrorLog, setBackendErrorLog] = useState<string>('');
  const [logLoading, setLogLoading] = useState(false);
  const [logError, setLogError] = useState<string | null>(null);

  useEffect(() => {
    const loadQuestInfo = async () => {
      try {
        setLogLoading(true);
        setLogError(null);

        // TODO: 나중에 선택한 문제의 questId를 store에서 가져오도록 수정 필요
        const data = (await getQuest(1)) as QuestInfo;
        setFrontendErrorLog(data.frontendErrorLog);
        setBackendErrorLog(data.backendErrorLog);
      } catch {
        setLogError('로그를 불러오지 못했습니다.');
      } finally {
        setLogLoading(false);
      }
    };

    loadQuestInfo();
  }, []);

  return {
    frontendErrorLog,
    backendErrorLog,
    logLoading,
    logError,
  };
}
