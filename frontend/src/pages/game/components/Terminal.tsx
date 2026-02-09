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
    <div className="flex flex-col w-full h-full bg-stone-900/90">
      <div className="shrink-0 border-b border-gray-700">
        <TerminalTabs activeTab={activeTab} onChangeTab={setActiveTab} />
      </div>

      <div className="flex-1 overflow-auto">
        <TerminalLogView log={currentLog} />
      </div>
    </div>
  );
}
