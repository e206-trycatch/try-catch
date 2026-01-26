import { useState } from 'react';

import TerminalLogView from './TerminalLogView';
import TerminalTabs from './TerminalTabs';

type TerminalTabs = 'Frontend' | 'Backend';

type Props = {
  frontendErrorLog: string | null;
  backendErrorLog: string | null;
};

export default function Terminal({ frontendErrorLog, backendErrorLog }: Props) {
  const [activeTab, setActiveTab] = useState<TerminalTabs>('Frontend');
  const currentLog =
    activeTab === 'Frontend' ? frontendErrorLog : backendErrorLog;

  return (
    <div className="w-full h-64 relative bg-stone-900">
      <TerminalTabs activeTab={activeTab} onChangeTab={setActiveTab} />
      <TerminalLogView log={currentLog} />
    </div>
  );
}
