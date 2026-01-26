import { useState } from 'react';

import TerminalLogView from './TerminalLogView';
import TerminalTabs from './TerminalTabs';

type TerminalTabs = 'Frontend' | 'Backend';

type Props = {
  frontendErrorLog: string;
  backendErrorLog: string;
  logLoading: boolean;
  logError: string | null;
};

export default function Terminal({
  frontendErrorLog,
  backendErrorLog,
  logLoading,
  logError,
}: Props) {
  const [activeTab, setActiveTab] = useState<TerminalTabs>('Frontend');
  const currentLog =
    activeTab === 'Frontend' ? frontendErrorLog : backendErrorLog;

  return (
    <div className="w-full h-64 relative bg-stone-900">
      <TerminalTabs activeTab={activeTab} onChangeTab={setActiveTab} />
      <TerminalLogView log={currentLog} loading={logLoading} error={logError} />
    </div>
  );
}
