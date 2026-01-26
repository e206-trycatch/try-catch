import { Editor } from '@monaco-editor/react';

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
      <div style={{ color: '#888', padding: '20px' }}>파일을 선택해주세요</div>
    );
  }
  return (
    <Editor
      key={activeFile.id}
      width="100%"
      height="calc(100vh - 36px)"
      language={activeFile.language ?? 'javascript'} // 활성화 된 파일이 있고, 언어가 있다면 그 값 쓰기
      value={code} // 에디터에 표시되는 텍스트
      theme="vs-dark"
      options={{ minimap: { enabled: false } }}
      onChange={(f) => onChange(f ?? '')}
    />
  );
}
