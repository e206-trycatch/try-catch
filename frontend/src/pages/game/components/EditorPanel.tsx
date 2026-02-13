import type { CodeRole, FileNode } from '../types/ideTypes';
import CodeEditor from './CodeEditor';
import FileTabs from './FileTabs';

interface EditorPanelProps {
  openTabs: FileNode[];
  activeFileId: string | null;
  activeFile: FileNode | null;
  code: string;
  isFocused: boolean;
  userRole: CodeRole;
  onSelectTab: (fileId: string) => void;
  onCloseTab: (fileId: string) => void;
  onChange: (value: string) => void;
  onFocus: () => void;
}

export default function EditorPanel({
  openTabs,
  activeFileId,
  activeFile,
  code,
  isFocused,
  userRole,
  onSelectTab,
  onCloseTab,
  onChange,
  onFocus,
}: EditorPanelProps) {
  return (
    <div
      className={`flex flex-col flex-1 min-w-0 min-h-0 ${
        isFocused ? 'border-t-2 border-amber-300' : ''
      }`}
      onMouseDown={onFocus}
    >
      <FileTabs
        openTabs={openTabs}
        activeFileId={activeFileId}
        onSelectTab={onSelectTab}
        onCloseTab={onCloseTab}
      />
      <div
        className={`flex-1 min-h-0 ${
          activeFile ? 'bg-[#1E1E1E00]' : 'bg-[#1E1E1EE6]'
        }`}
      >
        <CodeEditor
          activeFile={activeFile}
          code={code}
          onChange={onChange}
          userRole={userRole}
        />
      </div>
    </div>
  );
}
