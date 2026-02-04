import { Editor } from '@monaco-editor/react';
import * as monaco from 'monaco-editor';

import type { FileNode } from '../types/ideTypes';

interface CodeEditorProps {
  activeFile: FileNode | null;
  code: string;
  onChange: (value: string) => void;
}

export default function CodeEditor({
  activeFile,
  code,
  onChange,
}: CodeEditorProps) {
  if (!activeFile) {
    return (
      <div style={{ color: '#888', padding: '20px' }}>파일을 선택해주세요.</div>
    );
  }
  return (
    <>
      <Editor
        key={activeFile.id}
        width="100%"
        height="100%"
        language={activeFile.language ?? 'javascript'}
        value={code}
        theme="vs-dark"
        options={{
          minimap: { enabled: false },
          fontSize: 16,
          contextmenu: false,
        }}
        onChange={(f) => onChange(f ?? '')}
        onMount={(editor) => {
          editor.onKeyDown((e) => {
            const isSave =
              (e.ctrlKey || e.metaKey) && e.keyCode === monaco.KeyCode.KeyS;

            if (isSave) {
              e.preventDefault();
            }
          });
        }}
      />
    </>
  );
}
